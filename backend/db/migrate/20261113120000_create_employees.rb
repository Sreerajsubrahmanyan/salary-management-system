class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.string :employee_number, null: false, limit: 32
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email
      t.string :country_code, null: false, limit: 2
      t.string :department, null: false
      t.string :job_title, null: false
      t.string :status, null: false, default: "active"
      t.date :hire_date, null: false

      t.timestamps
    end

    add_index :employees, :employee_number, unique: true
    add_index :employees, :email, unique: true, where: "email IS NOT NULL"
    add_index :employees, :country_code
    add_index :employees, :department
    add_index :employees, :status
    add_check_constraint :employees, "country_code ~ '^[A-Z]{2}$'", name: "employees_country_code_format"
    add_check_constraint :employees, "status IN ('active', 'on_leave', 'terminated')", name: "employees_status_valid"
  end
end
