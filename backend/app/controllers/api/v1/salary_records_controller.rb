module Api
  module V1
    class SalaryRecordsController < BaseController
      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActionController::ParameterMissing, with: :render_missing_salary_record

      def index
        employee = find_employee
        render json: { data: employee.salary_records.map { |record| SalaryRecordSerializer.serialize(record) } }
      end

      def create
        employee = find_employee
        record = SalaryRecordCreator.new(employee, salary_record_params).call

        if record.persisted?
          render json: { data: SalaryRecordSerializer.serialize(record) }, status: :created
        else
          render json: { errors: record.errors.to_hash }, status: :unprocessable_entity
        end
      end

      private

      def find_employee
        Employee.find_by!(employee_number: params[:employee_employee_number])
      end

      def salary_record_params
        params.require(:salary_record).permit(:amount, :currency, :effective_date)
      end

      def render_not_found(_error)
        render json: { error: "Employee not found" }, status: :not_found
      end

      def render_missing_salary_record(_error)
        render json: { error: "Salary record parameters are required" }, status: :bad_request
      end
    end
  end
end
