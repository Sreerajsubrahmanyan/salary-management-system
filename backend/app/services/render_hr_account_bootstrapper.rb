class RenderHrAccountBootstrapper
  def initialize(accounts)
    @accounts = accounts
  end

  def call
    @accounts.each do |account|
      email = account.fetch(:email).strip.downcase

      User.find_or_create_by!(email: email) do |user|
        user.password = account.fetch(:password)
        user.role = "hr_manager"
      end
    end
  end
end
