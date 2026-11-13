class SalaryRecord < ApplicationRecord
  belongs_to :employee

  scope :current, -> { where(end_date: nil).where("effective_date <= ?", Date.current) }

  validates :amount, numericality: { greater_than: 0 }
  validates :currency, format: { with: /\A[A-Z]{3}\z/ }
  validates :effective_date, presence: true
  validate :end_date_is_not_before_effective_date
  validate :date_range_does_not_overlap, if: -> { employee_id.present? && effective_date.present? }

  private

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
