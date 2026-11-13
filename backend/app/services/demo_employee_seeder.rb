class DemoEmployeeSeeder
  EMPLOYEE_COUNT = 10_000
  BATCH_SIZE = 1_000

  FIRST_NAMES = %w[Ada Amara Arjun Asha Daniel Fatima Grace Hana Ibrahim Jorge Leila Mateo Mei Noah Priya Sofia Tariq Uma Yuki].freeze
  LAST_NAMES = %w[Ahmed Anders Chen Das Garcia Ivanov Johnson Khan Kim Martin Nair Okafor Patel Rossi Singh Tan Williams Wong Yamamoto].freeze
  DEPARTMENTS = %w[Engineering Finance Human\ Resources Legal Marketing Operations Product Sales Support].freeze
  JOB_TITLES = [ "Analyst", "Associate", "Coordinator", "Engineer", "Manager", "Specialist", "Team Lead", "Director" ].freeze
  COUNTRY_CURRENCIES = [
    [ "US", "USD", 65_000, 1_000 ], [ "GB", "GBP", 48_000, 750 ], [ "IN", "INR", 900_000, 15_000 ],
    [ "CA", "CAD", 72_000, 1_000 ], [ "DE", "EUR", 58_000, 900 ], [ "FR", "EUR", 54_000, 850 ],
    [ "JP", "JPY", 5_000_000, 80_000 ], [ "AU", "AUD", 88_000, 1_200 ], [ "BR", "BRL", 110_000, 2_000 ],
    [ "MX", "MXN", 600_000, 12_000 ], [ "SG", "SGD", 78_000, 1_200 ], [ "ZA", "ZAR", 720_000, 12_000 ],
    [ "AE", "AED", 240_000, 4_000 ]
  ].freeze

  def call
    timestamp = Time.current
    employee_numbers = (1..EMPLOYEE_COUNT).map { |number| employee_number(number) }

    Employee.transaction do
      employee_rows = (1..EMPLOYEE_COUNT).map { |number| employee_attributes(number, timestamp) }
      upsert_in_batches(Employee, employee_rows, :index_employees_on_employee_number,
                        %i[first_name last_name email country_code department job_title status hire_date])

      employee_ids = Employee.where(employee_number: employee_numbers).pluck(:employee_number, :id).to_h
      salary_rows = employee_numbers.flat_map do |number|
        index = number.delete_prefix("DEMO-").to_i
        employee_id = employee_ids.fetch(number)
        salary_attributes(employee_id, index, timestamp)
      end

      upsert_in_batches(SalaryRecord, salary_rows, :index_salary_records_on_employee_id_and_effective_date,
                        %i[amount currency end_date])
    end

    puts "Seeded #{EMPLOYEE_COUNT} synthetic employees with dated salary history."
  end

  def employee_number(index)
    format("DEMO-%05d", index)
  end

  def employee_attributes(index, timestamp = Time.current)
    country_code, = COUNTRY_CURRENCIES[(index - 1) % COUNTRY_CURRENCIES.length]

    {
      employee_number: employee_number(index),
      first_name: FIRST_NAMES[(index * 7) % FIRST_NAMES.length],
      last_name: LAST_NAMES[(index * 11) % LAST_NAMES.length],
      email: format("employee.%05d@example.test", index),
      country_code: country_code,
      department: DEPARTMENTS[(index - 1) % DEPARTMENTS.length],
      job_title: JOB_TITLES[(index - 1) % JOB_TITLES.length],
      status: employee_status(index),
      hire_date: Date.new(2014, 1, 1) + ((index * 13) % 3_000),
      created_at: timestamp,
      updated_at: timestamp
    }
  end

  def employee_status(index)
    return "terminated" if (index % 20).zero?
    return "on_leave" if (index % 17).zero?

    "active"
  end

  def salary_attributes(employee_id, index, timestamp = Time.current)
    current_salary_attributes(employee_id, index, timestamp) + prior_salary_attributes(employee_id, index, timestamp)
  end

  private

  def current_salary_attributes(employee_id, index, timestamp)
    _country, currency, base_amount, increment = COUNTRY_CURRENCIES[(index - 1) % COUNTRY_CURRENCIES.length]
    amount = base_amount + ((index % 80) * increment)
    status = employee_status(index)

    [ {
      employee_id: employee_id,
      amount: amount,
      currency: currency,
      effective_date: Date.new(2024, 1, 1),
      end_date: status == "terminated" ? Date.new(2025, 12, 31) : nil,
      created_at: timestamp,
      updated_at: timestamp
    } ]
  end

  def prior_salary_attributes(employee_id, index, timestamp)
    _country, currency, base_amount, increment = COUNTRY_CURRENCIES[(index - 1) % COUNTRY_CURRENCIES.length]
    current_amount = base_amount + ((index % 80) * increment)

    [ {
      employee_id: employee_id,
      amount: current_amount * 9 / 10,
      currency: currency,
      effective_date: Date.new(2022, 1, 1),
      end_date: Date.new(2023, 12, 31),
      created_at: timestamp,
      updated_at: timestamp
    } ]
  end

  def upsert_in_batches(model, rows, unique_by, update_only)
    rows.each_slice(BATCH_SIZE) do |batch|
      model.upsert_all(batch, unique_by: unique_by, update_only: update_only)
    end
  end
end
