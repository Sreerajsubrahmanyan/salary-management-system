require "test_helper"

module Api
  module V1
    module Reports
      class PayControllerTest < ActionDispatch::IntegrationTest
        setup do
          @user = create_user
        end

        test "requires an HR session" do
          get "/api/v1/reports/pay"

          assert_response :unauthorized
          assert_equal "Authentication required", response.parsed_body["error"]
        end

        test "groups SQL totals and averages by dimension and currency" do
          add_employee_with_salary("PAY-US-1", country_code: "US", amount: "1000", currency: "USD")
          add_employee_with_salary("PAY-US-2", country_code: "US", amount: "3000", currency: "USD")
          add_employee_with_salary("PAY-IN-1", country_code: "IN", amount: "100000", currency: "INR")
          sign_in

          get "/api/v1/reports/pay", params: { group_by: "department" }

          assert_response :success
          rows = response.parsed_body.fetch("data")
          assert_equal [ "INR", "USD" ], rows.map { |row| row["currency"] }
          assert_equal [ 1, 2 ], rows.map { |row| row["employee_count"] }
          assert_equal "100000.0", rows[0]["total_salary"]
          assert_equal "4000.0", rows[1]["total_salary"]
          assert_equal "2000.0", rows[1]["average_salary"]
          assert_equal "department", response.parsed_body.dig("meta", "group_by")
        end

        test "filters by country, status, and currency" do
          add_employee_with_salary("PAY-US-3", country_code: "US", amount: "1000", currency: "USD", status: "active")
          add_employee_with_salary("PAY-GB-1", country_code: "GB", amount: "2000", currency: "GBP", status: "active")
          add_employee_with_salary("PAY-US-4", country_code: "US", amount: "3000", currency: "USD", status: "on_leave")
          sign_in

          get "/api/v1/reports/pay", params: { country: "us", status: "active", currency: "usd" }

          assert_response :success
          assert_equal 1, response.parsed_body.dig("data").length
          assert_equal 1, response.parsed_body.dig("data", 0, "employee_count")
          assert_equal "USD", response.parsed_body.dig("data", 0, "currency")
        end

        test "reports compensation as of the requested date" do
          employee = create_employee(employee_number: "PAY-HISTORY", country_code: "US")
          employee.salary_records.create!(amount: "70000", currency: "USD", effective_date: Date.new(2022, 1, 1), end_date: Date.new(2023, 12, 31))
          employee.salary_records.create!(amount: "80000", currency: "USD", effective_date: Date.new(2024, 1, 1))
          sign_in

          get "/api/v1/reports/pay", params: { as_of: "2023-01-01" }

          assert_response :success
          assert_equal "70000.0", response.parsed_body.dig("data", 0, "total_salary")
          assert_equal "2023-01-01", response.parsed_body.dig("meta", "as_of")
        end

        test "rejects unsupported groupings and invalid dates" do
          sign_in

          get "/api/v1/reports/pay", params: { group_by: "email" }
          assert_response :bad_request

          get "/api/v1/reports/pay", params: { as_of: "yesterday" }
          assert_response :bad_request
          assert_equal "as_of must be an ISO date", response.parsed_body["error"]
        end

        private

        def add_employee_with_salary(employee_number, country_code:, amount:, currency:, status: "active")
          employee = create_employee(employee_number: employee_number, country_code: country_code, status: status, department: "Engineering")
          employee.salary_records.create!(amount: amount, currency: currency, effective_date: Date.new(2024, 1, 1))
        end

        def sign_in
          get "/api/v1/session"
          token = response.parsed_body.fetch("csrf_token")

          post "/api/v1/session",
               params: { email: @user.email, password: "assessment-password-123" },
               headers: { "X-CSRF-Token" => token },
               as: :json
          assert_response :success
        end
      end
    end
  end
end
