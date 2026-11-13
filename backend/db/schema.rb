# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_11_13_120200) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "employees", force: :cascade do |t|
    t.string "employee_number", limit: 32, null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.string "email"
    t.string "country_code", limit: 2, null: false
    t.string "department", null: false
    t.string "job_title", null: false
    t.string "status", default: "active", null: false
    t.date "hire_date", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["country_code"], name: "index_employees_on_country_code"
    t.index ["department"], name: "index_employees_on_department"
    t.index ["email"], name: "index_employees_on_email", unique: true, where: "(email IS NOT NULL)"
    t.index ["employee_number"], name: "index_employees_on_employee_number", unique: true
    t.index ["status"], name: "index_employees_on_status"
    t.check_constraint "country_code::text ~ '^[A-Z]{2}$'::text", name: "employees_country_code_format"
    t.check_constraint "status::text = ANY (ARRAY['active'::character varying, 'on_leave'::character varying, 'terminated'::character varying]::text[])", name: "employees_status_valid"
  end

  create_table "salary_records", force: :cascade do |t|
    t.bigint "employee_id", null: false
    t.decimal "amount", precision: 19, scale: 4, null: false
    t.string "currency", limit: 3, null: false
    t.date "effective_date", null: false
    t.date "end_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["currency"], name: "index_salary_records_on_currency"
    t.index ["effective_date"], name: "index_salary_records_on_effective_date"
    t.index ["employee_id", "effective_date"], name: "index_salary_records_on_employee_id_and_effective_date", unique: true
    t.index ["employee_id"], name: "index_salary_records_on_employee_id"
    t.index ["employee_id"], name: "index_salary_records_one_open_record_per_employee", unique: true, where: "(end_date IS NULL)"
    t.check_constraint "amount > 0::numeric", name: "salary_records_amount_positive"
    t.check_constraint "currency::text ~ '^[A-Z]{3}$'::text", name: "salary_records_currency_format"
    t.check_constraint "end_date IS NULL OR end_date >= effective_date", name: "salary_records_date_order"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "role", default: "hr_manager", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.check_constraint "role::text = 'hr_manager'::text", name: "users_role_valid"
  end

  add_foreign_key "salary_records", "employees", on_delete: :restrict
end
