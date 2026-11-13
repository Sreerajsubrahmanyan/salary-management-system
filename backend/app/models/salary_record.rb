class SalaryRecord < ApplicationRecord
  MAX_AMOUNT = BigDecimal("999999999999999.9999")

  belongs_to :employee

  scope :current, -> { where("effective_date <= ? AND (end_date IS NULL OR end_date >= ?)", Date.current, Date.current) }

  validates :amount, numericality: { greater_than: 0, less_than_or_equal_to: MAX_AMOUNT }
  validates :currency, format: { with: /\A[A-Z]{3}\z/ }
  validates :effective_date, presence: true
  validates :effective_date, uniqueness: { scope: :employee_id }
  validate :end_date_is_not_before_effective_date
  validate :amount_fits_storage_precision
  validate :date_range_does_not_overlap, if: -> { employee_id.present? && effective_date.present? }

  private

  def amount_fits_storage_precision
    raw_amount = amount_before_type_cast
    return if raw_amount.blank?

    decimal_amount = BigDecimal(raw_amount.to_s, exception: false)
    return unless decimal_amount
    return if decimal_amount == decimal_amount.round(4)

    errors.add(:amount, "must have no more than four decimal places")
  end

  def end_date_is_not_before_effective_date
    return if end_date.blank? || effective_date.blank? || end_date >= effective_date

    errors.add(:end_date, "must be on or after the effective date")
  end

  def date_range_does_not_overlap
    last_possible_date = end_date || Date.new(9999, 12, 31)
    overlaps = SalaryRecord.where(employee_id: employee_id)
                           .where.not(id: id)
                           .where("effective_date <= ?", last_possible_date)
                           .where("end_date IS NULL OR end_date >= ?", effective_date)

    errors.add(:effective_date, "overlaps another salary record") if overlaps.exists?
  end
end
