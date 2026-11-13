class PayReportQuery
  GROUP_COLUMNS = {
    "country" => "country_code",
    "department" => "department",
    "job_title" => "job_title"
  }.freeze

  class InvalidParameter < StandardError; end

  def initialize(params)
    @group_by = params[:group_by].presence || "country"
    raise InvalidParameter, "group_by is not supported" unless GROUP_COLUMNS.key?(@group_by)

    @country = country_filter(params[:country])
    @department = bounded_filter(params[:department], "department")
    @job_title = bounded_filter(params[:job_title], "job_title")
    @status = status_filter(params[:status])
    @currency = currency_filter(params[:currency])
    @as_of = date_filter(params[:as_of])
  end

  def call
    group_column = GROUP_COLUMNS.fetch(@group_by)
    group_sql = Arel.sql("employees.#{group_column}, salary_records.currency")
    aggregate_sql = Arel.sql(
      "employees.#{group_column}, salary_records.currency, " \
      "COUNT(DISTINCT employees.id), SUM(salary_records.amount), AVG(salary_records.amount)"
    )

    rows = salary_records
           .group(group_sql)
           .order(Arel.sql("employees.#{group_column} ASC, salary_records.currency ASC"))
           .pluck(aggregate_sql)

    {
      data: rows.map { |row| serialize_row(row) },
      meta: { group_by: @group_by, as_of: @as_of, group_count: rows.length }
    }
  end

  private

  def salary_records
    scope = SalaryRecord.effective_on(@as_of).joins(:employee)
    scope = scope.where(employees: { country_code: @country }) if @country.present?
    scope = scope.where(employees: { department: @department }) if @department.present?
    scope = scope.where(employees: { job_title: @job_title }) if @job_title.present?
    scope = scope.where(employees: { status: @status }) if @status.present?
    scope = scope.where(salary_records: { currency: @currency }) if @currency.present?
    scope
  end

  def serialize_row(row)
    group_value, currency, employee_count, total_salary, average_salary = row
    {
      group_value: group_value,
      currency: currency,
      employee_count: employee_count,
      total_salary: total_salary.to_s("F"),
      average_salary: average_salary.to_s("F")
    }
  end

  def country_filter(value)
    country = bounded_filter(value, "country", maximum: 2).upcase
    return if country.blank?
    return country if country.match?(/\A[A-Z]{2}\z/)

    raise InvalidParameter, "country must be a two-letter country code"
  end

  def currency_filter(value)
    currency = bounded_filter(value, "currency", maximum: 3).upcase
    return if currency.blank?
    return currency if currency.match?(/\A[A-Z]{3}\z/)

    raise InvalidParameter, "currency must be a three-letter currency code"
  end

  def status_filter(value)
    status = bounded_filter(value, "status", maximum: 20)
    return if status.blank?
    return status if Employee::STATUSES.include?(status)

    raise InvalidParameter, "status is not supported"
  end

  def bounded_filter(value, name, maximum: 100)
    text = value.to_s.strip
    raise InvalidParameter, "#{name} must be #{maximum} characters or fewer" if text.length > maximum

    text
  end

  def date_filter(value)
    return Date.current if value.blank?

    text = value.to_s
    raise InvalidParameter, "as_of must be an ISO date" unless text.match?(/\A\d{4}-\d{2}-\d{2}\z/)

    Date.iso8601(text)
  rescue Date::Error
    raise InvalidParameter, "as_of must be a valid ISO date"
  end
end
