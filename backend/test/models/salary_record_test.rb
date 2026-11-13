require "test_helper"

class SalaryRecordTest < ActiveSupport::TestCase
  test "allows a salary period immediately after the previous period" do
    employee = create_employee
    employee.salary_records.create!(amount: "72000.0000", currency: "USD", effective_date: Date.new(2025, 1, 1), end_date: Date.new(2025, 12, 31))

    next_record = employee.salary_records.new(amount: "75000.0000", currency: "USD", effective_date: Date.new(2026, 1, 1))

    assert next_record.valid?, next_record.errors.full_messages.to_sentence
  end

  test "rejects overlapping salary periods" do
    employee = create_employee
    employee.salary_records.create!(amount: "72000.0000", currency: "USD", effective_date: Date.new(2025, 1, 1), end_date: Date.new(2025, 12, 31))
    overlapping_record = employee.salary_records.new(amount: "75000.0000", currency: "USD", effective_date: Date.new(2025, 12, 31))

    assert_not overlapping_record.valid?
    assert_includes overlapping_record.errors.attribute_names, :effective_date
  end

  test "rejects zero or negative salary amounts" do
    record = create_employee.salary_records.new(amount: "0", currency: "USD", effective_date: Date.current)

    assert_not record.valid?
    assert_includes record.errors.attribute_names, :amount
  end

  test "rejects amounts that exceed the database precision or scale" do
    employee = create_employee
    excessive_value = employee.salary_records.new(amount: "1000000000000000", currency: "USD", effective_date: Date.current)
    excessive_scale = employee.salary_records.new(amount: "1.23456", currency: "USD", effective_date: Date.current)

    assert_not excessive_value.valid?
    assert_not excessive_scale.valid?
    assert_includes excessive_value.errors.attribute_names, :amount
    assert_includes excessive_scale.errors.attribute_names, :amount
  end
end
