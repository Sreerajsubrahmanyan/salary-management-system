class User < ApplicationRecord
  ROLES = %w[hr_manager].freeze

  has_secure_password

  before_validation :normalize_email

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }, uniqueness: true
  validates :password, length: { minimum: 12 }, if: -> { password.present? }
  validates :role, inclusion: { in: ROLES }

  def hr_manager?
    role == "hr_manager"
  end

  private

  def normalize_email
    self.email = email.to_s.strip.downcase.presence
  end
end
