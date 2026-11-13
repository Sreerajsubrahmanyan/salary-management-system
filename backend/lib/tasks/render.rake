namespace :render do
  desc "Bootstrap the synthetic assessment dataset and configured HR logins"
  task bootstrap: :environment do
    raise "Render bootstrap is only available in production." unless Rails.env.production?

    unless Employee.exists?(employee_number: "DEMO-00001")
      DemoEmployeeSeeder.new.call
    end

    accounts = [
      { email: ENV.fetch("RENDER_HR_EMAIL"), password: ENV.fetch("RENDER_HR_PASSWORD") },
      # Deliberately public credentials for the synthetic-data recruiter demo.
      { email: "demo.hr@example.com", password: "demo_example@123" }
    ]
    RenderHrAccountBootstrapper.new(accounts).call
  end
end
