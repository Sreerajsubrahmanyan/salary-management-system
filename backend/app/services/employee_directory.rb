class EmployeeDirectory
  DEFAULT_PER_PAGE = 25
  MAX_PER_PAGE = 100
  MAX_QUERY_LENGTH = 100
  MAX_DEPARTMENT_LENGTH = 100

  class InvalidParameter < StandardError; end

  attr_reader :page, :per_page

  def initialize(params)
    @page = positive_integer(params[:page], "page", default: 1)
    @per_page = [ positive_integer(params[:per_page], "per_page", default: DEFAULT_PER_PAGE), MAX_PER_PAGE ].min
    @query = bounded_text(params[:q], "q", maximum: MAX_QUERY_LENGTH)
    @country = normalize_country(params[:country])
    @department = bounded_text(params[:department], "department", maximum: MAX_DEPARTMENT_LENGTH)
    @status = normalize_status(params[:status])
  end

  def records
    relation.includes(:salary_records)
            .order(:employee_number)
            .limit(per_page)
            .offset((page - 1) * per_page)
  end

  def metadata
    count = relation.count
    {
      page: page,
      per_page: per_page,
      total_count: count,
      total_pages: (count.to_f / per_page).ceil
    }
  end

  private

  def relation
    @relation ||= begin
      scope = Employee.all
      scope = scope.where(country_code: @country) if @country.present?
      scope = scope.where(department: @department) if @department.present?
      scope = scope.where(status: @status) if @status.present?
      scope = apply_search(scope) if @query.present?
      scope
    end
  end

  def apply_search(scope)
    pattern = "%#{Employee.sanitize_sql_like(@query)}%"
    scope.where(
      "employee_number ILIKE :query OR first_name ILIKE :query OR last_name ILIKE :query OR email ILIKE :query",
      query: pattern
    )
  end

  def positive_integer(value, name, default:)
    return default if value.blank?

    parsed_value = Integer(value.to_s, 10)
    raise InvalidParameter, "#{name} must be a positive integer" if parsed_value < 1

    parsed_value
  rescue ArgumentError
    raise InvalidParameter, "#{name} must be a positive integer"
  end

  def bounded_text(value, name, maximum:)
    text = value.to_s.strip
    raise InvalidParameter, "#{name} must be #{maximum} characters or fewer" if text.length > maximum

    text
  end

  def normalize_country(value)
    country = bounded_text(value, "country", maximum: 2).upcase
    return if country.blank?
    return country if country.match?(/\A[A-Z]{2}\z/)

    raise InvalidParameter, "country must be a two-letter country code"
  end

  def normalize_status(value)
    status = bounded_text(value, "status", maximum: 20)
    return if status.blank?
    return status if Employee::STATUSES.include?(status)

    raise InvalidParameter, "status is not supported"
  end
end
