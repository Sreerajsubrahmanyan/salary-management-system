require "test_helper"

class EmployeeTest < ActiveSupport::TestCase
  test "normalizes email before validating uniqueness" do
    employee = create_employee(email: "  HR.User@EXAMPLE.COM ")

    assert employee.valid?
    assert_equal "hr.user@example.com", employee.email
  end

  test "rejects duplicate employee numbers" do
    existing = create_employee
    duplicate = existing.dup
    duplicate.email = nil

    assert_not duplicate.valid?
    assert_includes duplicate.errors.attribute_names, :employee_number
  end
end
