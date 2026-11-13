namespace :render do
  desc "Bootstrap the synthetic assessment dataset and initial HR login once"
  task bootstrap: :environment do
    raise "Render bootstrap is only available in production." unless Rails.env.production?

    email = ENV.fetch("RENDER_HR_EMAIL").strip.downcase
    password = ENV.fetch("RENDER_HR_PASSWORD")

    unless Employee.exists?(employee_number: "DEMO-00001")
      DemoEmployeeSeeder.new.call
    end

    User.find_or_create_by!(email: email) do |user|
      user.password = password
      user.role = "hr_manager"
    end
  end
end
