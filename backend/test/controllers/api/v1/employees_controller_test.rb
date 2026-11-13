require "test_helper"

module Api
  module V1
    class EmployeesControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = create_user
      end

      test "requires an HR session for employee data" do
        get "/api/v1/employees"

        assert_response :unauthorized
        assert_equal({ "error" => "Authentication required" }, response.parsed_body)
        assert_equal "no-store", response.headers["Cache-Control"]
      end

      test "lists employees with server-side filters and bounded pagination" do
        create_employee(employee_number: "API-0001", first_name: "Ada", country_code: "US", department: "Engineering")
        create_employee(employee_number: "API-0002", first_name: "Grace", country_code: "GB", department: "Engineering")
        sign_in

        get "/api/v1/employees", params: { q: "ada", country: "us", department: "Engineering", per_page: "500" }

        assert_response :success
        assert_equal 1, response.parsed_body.dig("data").length
        assert_equal "API-0001", response.parsed_body.dig("data", 0, "employee_number")
        assert_equal 100, response.parsed_body.dig("meta", "per_page")
        assert_equal 1, response.parsed_body.dig("meta", "total_count")
      end

      test "returns profile details with salary history" do
        employee = create_employee(employee_number: "API-0003")
        employee.salary_records.create!(amount: "72000.0000", currency: "USD", effective_date: Date.new(2024, 1, 1))
        sign_in

        get "/api/v1/employees/#{employee.employee_number}"

        assert_response :success
        assert_equal "72000.0", response.parsed_body.dig("data", "current_salary", "amount")
        assert_equal "USD", response.parsed_body.dig("data", "salary_records", 0, "currency")
      end

      test "creates an employee for an authenticated HR manager" do
        sign_in

        post "/api/v1/employees",
             params: { employee: employee_params(employee_number: "API-0004") },
             headers: csrf_headers,
             as: :json

        assert_response :created
        assert_equal "API-0004", response.parsed_body.dig("data", "employee_number")
      end

      test "updates employee profile fields without changing the stable employee number" do
        employee = create_employee(employee_number: "API-0005")
        sign_in

        patch "/api/v1/employees/#{employee.employee_number}",
              params: { employee: { department: "Finance", employee_number: "CHANGED" } },
              headers: csrf_headers,
              as: :json

        assert_response :success
        assert_equal "API-0005", response.parsed_body.dig("data", "employee_number")
        assert_equal "Finance", response.parsed_body.dig("data", "department")
      end

      test "returns validation details for invalid employee updates" do
        employee = create_employee(employee_number: "API-0006")
        sign_in

        patch "/api/v1/employees/#{employee.employee_number}",
              params: { employee: { status: "unknown" } },
              headers: csrf_headers,
              as: :json

        assert_response :unprocessable_entity
        assert response.parsed_body.dig("errors", "status").present?
      end

      test "returns a JSON not-found response for unknown employees" do
        sign_in

        get "/api/v1/employees/MISSING-0001"

        assert_response :not_found
        assert_equal({ "error" => "Employee not found" }, response.parsed_body)
      end

      test "rejects invalid pagination parameters" do
        sign_in

        get "/api/v1/employees", params: { page: "0" }

        assert_response :bad_request
        assert_equal({ "error" => "page must be a positive integer" }, response.parsed_body)
      end

      private

      def sign_in
        get "/api/v1/session"
        token = response.parsed_body.fetch("csrf_token")

        post "/api/v1/session",
             params: { email: @user.email, password: "assessment-password-123" },
             headers: { "X-CSRF-Token" => token },
             as: :json
        assert_response :success
        @csrf_token = response.parsed_body.fetch("csrf_token")
      end

      def csrf_headers
        { "X-CSRF-Token" => @csrf_token }
      end

      def employee_params(employee_number:)
        {
          employee_number: employee_number,
          first_name: "Taylor",
          last_name: "Example",
          email: "#{employee_number.downcase}@example.test",
          country_code: "US",
          department: "Engineering",
          job_title: "Engineer",
          status: "active",
          hire_date: "2020-01-15"
        }
      end
    end
  end
end
