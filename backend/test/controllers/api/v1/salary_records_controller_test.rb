require "test_helper"

module Api
  module V1
    class SalaryRecordsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = create_user
        @employee = create_employee(employee_number: "SAL-0001")
      end

      test "lists salary history newest first" do
        @employee.salary_records.create!(amount: "70000", currency: "USD", effective_date: Date.new(2022, 1, 1), end_date: Date.new(2023, 12, 31))
        @employee.salary_records.create!(amount: "75000", currency: "USD", effective_date: Date.new(2024, 1, 1))
        sign_in

        get salary_records_path

        assert_response :success
        assert_equal [ Date.new(2024, 1, 1).iso8601, Date.new(2022, 1, 1).iso8601 ], response.parsed_body.dig("data").map { |record| record["effective_date"] }
      end

      test "creates a salary change and closes the previous open period atomically" do
        previous_record = @employee.salary_records.create!(amount: "72000", currency: "USD", effective_date: Date.new(2024, 1, 1))
        sign_in

        post salary_records_path,
             params: { salary_record: { amount: "80000.50", currency: "USD", effective_date: Date.current.iso8601 } },
             headers: csrf_headers,
             as: :json

        assert_response :created
        assert_equal "80000.5", response.parsed_body.dig("data", "amount")
        assert_equal Date.current, previous_record.reload.end_date + 1.day
        assert_equal Date.current, @employee.reload.current_salary_record.effective_date
      end

      test "keeps today's salary current when the new salary is future-dated" do
        previous_record = @employee.salary_records.create!(amount: "72000", currency: "USD", effective_date: Date.new(2024, 1, 1))
        future_date = Date.current + 1.month
        sign_in

        post salary_records_path,
             params: { salary_record: { amount: "80000", currency: "USD", effective_date: future_date.iso8601 } },
             headers: csrf_headers,
             as: :json

        assert_response :created
        assert_equal future_date - 1.day, previous_record.reload.end_date
        assert_equal previous_record.id, @employee.reload.current_salary_record.id
      end

      test "rolls back closing the current record when the new salary is invalid" do
        previous_record = @employee.salary_records.create!(amount: "72000", currency: "USD", effective_date: Date.new(2024, 1, 1))
        sign_in

        post salary_records_path,
             params: { salary_record: { amount: "0", currency: "USD", effective_date: Date.current.iso8601 } },
             headers: csrf_headers,
             as: :json

        assert_response :unprocessable_entity
        assert response.parsed_body.dig("errors", "amount").present?
        assert_nil previous_record.reload.end_date
      end

      test "returns an effective date validation error when it is missing" do
        sign_in

        post salary_records_path,
             params: { salary_record: { amount: "80000", currency: "USD" } },
             headers: csrf_headers,
             as: :json

        assert_response :unprocessable_entity
        assert response.parsed_body.dig("errors", "effective_date").present?
      end

      test "rejects an effective date that is not after the current record" do
        previous_record = @employee.salary_records.create!(amount: "72000", currency: "USD", effective_date: Date.current)
        sign_in

        post salary_records_path,
             params: { salary_record: { amount: "80000", currency: "USD", effective_date: Date.current.iso8601 } },
             headers: csrf_headers,
             as: :json

        assert_response :unprocessable_entity
        assert response.parsed_body.dig("errors", "effective_date").present?
        assert_nil previous_record.reload.end_date
      end

      test "returns not found for an unknown employee" do
        sign_in

        get "/api/v1/employees/MISSING-0001/salary_records"

        assert_response :not_found
        assert_equal({ "error" => "Employee not found" }, response.parsed_body)
      end

      private

      def salary_records_path
        "/api/v1/employees/#{@employee.employee_number}/salary_records"
      end

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
    end
  end
end
