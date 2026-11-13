require "test_helper"

class DemoEmployeeSeederTest < ActiveSupport::TestCase
  test "defines a 10000 employee synthetic dataset across countries and statuses" do
    seeder = DemoEmployeeSeeder.new
    timestamp = Time.utc(2026, 1, 1)
    first = seeder.employee_attributes(1, timestamp)
    last = seeder.employee_attributes(DemoEmployeeSeeder::EMPLOYEE_COUNT, timestamp)
    countries = (1..DemoEmployeeSeeder::EMPLOYEE_COUNT).map { |index| seeder.employee_attributes(index, timestamp)[:country_code] }.uniq
    employee_numbers = (1..DemoEmployeeSeeder::EMPLOYEE_COUNT).map { |index| seeder.employee_number(index) }

    assert_equal 10_000, DemoEmployeeSeeder::EMPLOYEE_COUNT
    assert_equal 10_000, employee_numbers.uniq.length
    assert_equal "DEMO-00001", first[:employee_number]
    assert_equal "DEMO-10000", last[:employee_number]
    assert_equal "employee.00001@example.test", first[:email]
    assert_equal 13, countries.length
    assert_equal "terminated", seeder.employee_status(20)
    assert_equal "on_leave", seeder.employee_status(17)
  end

  test "generates two non-overlapping salary periods with explicit currency" do
    records = DemoEmployeeSeeder.new.salary_attributes(42, 1, Time.utc(2026, 1, 1))
    prior_record = records.find { |record| record[:effective_date] == Date.new(2022, 1, 1) }

    assert_equal 2, records.length
    assert_equal [ "USD" ], records.map { |record| record[:currency] }.uniq
    assert_equal Date.new(2023, 12, 31), prior_record[:end_date]
    assert_equal Date.new(2024, 1, 1), records.find { |record| record[:effective_date] > prior_record[:effective_date] }[:effective_date]
  end

  test "produces the same employee attributes for a fixed input" do
    seeder = DemoEmployeeSeeder.new
    timestamp = Time.utc(2026, 1, 1)

    assert_equal seeder.employee_attributes(314, timestamp), seeder.employee_attributes(314, timestamp)
  end
end
