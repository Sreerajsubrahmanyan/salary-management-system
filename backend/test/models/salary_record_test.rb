require "test_helper"

class SalaryRecordTest < ActiveSupport::TestCase
  test "allows a salary period immediately after the previous period" do
    employee = employees(:one)
    employee.salary_records.create!(amount: "72000.0000", currency: "USD", effective_date: Date.new(2025, 1, 1), end_date: Date.new(2025, 12, 31))

    next_record = employee.salary_records.new(amount: "75000.0000", currency: "USD", effective_date: Date.new(2026, 1, 1))

    assert next_record.valid?, next_record.errors.full_messages.to_sentence
  end

  test "rejects overlapping salary periods" do
    employee = employees(:one)
    employee.salary_records.create!(amount: "72000.0000", currency: "USD", effective_date: Date.new(2025, 1, 1), end_date: Date.new(2025, 12, 31))
    overlapping_record = employee.salary_records.new(amount: "75000.0000", currency: "USD", effective_date: Date.new(2025, 12, 31))

    assert_not overlapping_record.valid?
    assert_includes overlapping_record.errors.attribute_names, :effective_date
  end

  test "rejects zero or negative salary amounts" do
    record = employees(:one).salary_records.new(amount: "0", currency: "USD", effective_date: Date.current)

    assert_not record.valid?
    assert_includes record.errors.attribute_names, :amount
  end
end
