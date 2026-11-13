class CreateSalaryRecords < ActiveRecord::Migration[8.1]
  def change
    create_table :salary_records do |t|
      t.references :employee, null: false, foreign_key: { on_delete: :restrict }
      t.decimal :amount, null: false, precision: 19, scale: 4
      t.string :currency, null: false, limit: 3
      t.date :effective_date, null: false
      t.date :end_date

      t.timestamps
    end

    add_index :salary_records, %i[employee_id effective_date], unique: true
    add_index :salary_records, :effective_date
    add_index :salary_records, :currency
    add_index :salary_records, :employee_id, unique: true, where: "end_date IS NULL", name: "index_salary_records_one_open_record_per_employee"
    add_check_constraint :salary_records, "amount > 0", name: "salary_records_amount_positive"
    add_check_constraint :salary_records, "currency ~ '^[A-Z]{3}$'", name: "salary_records_currency_format"
    add_check_constraint :salary_records, "end_date IS NULL OR end_date >= effective_date", name: "salary_records_date_order"
  end
end
