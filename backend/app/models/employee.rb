class Employee < ApplicationRecord
  STATUSES = %w[active on_leave terminated].freeze

  has_many :salary_records, -> { order(effective_date: :desc) }, dependent: :restrict_with_exception

  before_validation :normalize_email

  validates :employee_number, presence: true, length: { maximum: 32 }, uniqueness: true
  validates :first_name, :last_name, :department, :job_title, :hire_date, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, uniqueness: true, allow_nil: true
  validates :country_code, format: { with: /\A[A-Z]{2}\z/ }
  validates :status, inclusion: { in: STATUSES }

  def current_salary_record
    if association(:salary_records).loaded?
      salary_records.find do |record|
        record.effective_date <= Date.current && (record.end_date.nil? || record.end_date >= Date.current)
      end
    else
      salary_records.current.first
    end
  end

  private

  def normalize_email
    self.email = email.to_s.strip.downcase.presence
  end
end
