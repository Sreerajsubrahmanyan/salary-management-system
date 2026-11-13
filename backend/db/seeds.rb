if ENV["DEMO_HR_EMAIL"].present? || ENV["DEMO_HR_PASSWORD"].present?
  raise "Demo HR credentials must not be seeded in production." if Rails.env.production?
  raise "Set both DEMO_HR_EMAIL and DEMO_HR_PASSWORD." if ENV["DEMO_HR_EMAIL"].blank? || ENV["DEMO_HR_PASSWORD"].blank?
end

# Deterministic synthetic dataset for local development and assessment demos.
# Re-running this script refreshes only employees with DEMO- employee numbers.
DemoEmployeeSeeder.new.call

if ENV["DEMO_HR_EMAIL"].present?
  demo_email = ENV.fetch("DEMO_HR_EMAIL").strip.downcase
  demo_user = User.find_or_initialize_by(email: demo_email)
  demo_user.assign_attributes(password: ENV.fetch("DEMO_HR_PASSWORD"), role: "hr_manager")
  demo_user.save!
  puts "Seeded the development HR manager account."
end
