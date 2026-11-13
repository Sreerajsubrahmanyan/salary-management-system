module Api
  module V1
    class EmployeesController < BaseController
      rescue_from EmployeeDirectory::InvalidParameter, with: :render_invalid_parameter
      rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
      rescue_from ActionController::ParameterMissing, with: :render_missing_employee

      def index
        directory = EmployeeDirectory.new(params)
        render json: {
          data: directory.records.map { |employee| employee_json(employee) },
          meta: directory.metadata
        }
      end

      def show
        employee = Employee.find_by!(employee_number: params[:employee_number])
        render json: { data: employee_json(employee, include_salary_history: true) }
      end

      def create
        employee_number = params.require(:employee)[:employee_number]
        employee = Employee.new(employee_params.merge(employee_number: employee_number))
        if employee.save
          render json: { data: employee_json(employee, include_salary_history: true) }, status: :created
        else
          render json: { errors: employee.errors.to_hash }, status: :unprocessable_entity
        end
      end

      def update
        employee = Employee.find_by!(employee_number: params[:employee_number])
        if employee.update(employee_params)
          render json: { data: employee_json(employee, include_salary_history: true) }
        else
          render json: { errors: employee.errors.to_hash }, status: :unprocessable_entity
        end
      end

      private

      def employee_params
        params.require(:employee).permit(
          :first_name, :last_name, :email, :country_code,
          :department, :job_title, :status, :hire_date
        )
      end

      def employee_json(employee, include_salary_history: false)
        data = {
          employee_number: employee.employee_number,
          first_name: employee.first_name,
          last_name: employee.last_name,
          email: employee.email,
          country_code: employee.country_code,
          department: employee.department,
          job_title: employee.job_title,
          status: employee.status,
          hire_date: employee.hire_date,
          current_salary: salary_json(employee.current_salary_record)
        }
        data[:salary_records] = employee.salary_records.map { |record| salary_json(record) } if include_salary_history
        data
      end

      def salary_json(record)
        return unless record

        {
          amount: record.amount.to_s("F"),
          currency: record.currency,
          effective_date: record.effective_date,
          end_date: record.end_date
        }
      end

      def render_invalid_parameter(error)
        render json: { error: error.message }, status: :bad_request
      end

      def render_not_found(_error)
        render json: { error: "Employee not found" }, status: :not_found
      end

      def render_missing_employee(_error)
        render json: { error: "Employee parameters are required" }, status: :bad_request
      end
    end
  end
end
