ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    def create_employee(attributes = {})
      defaults = {
        employee_number: "TEST-#{SecureRandom.hex(6)}",
        first_name: "Test",
        last_name: "Employee",
        country_code: "US",
        department: "Engineering",
        job_title: "Tester",
        status: "active",
        hire_date: Date.new(2020, 1, 1)
      }

      Employee.create!(defaults.merge(attributes))
    end

    def create_user(attributes = {})
      defaults = {
        email: "hr-#{SecureRandom.hex(6)}@example.test",
        password: "assessment-password-123",
        role: "hr_manager"
      }

      User.create!(defaults.merge(attributes))
    end
  end
end
