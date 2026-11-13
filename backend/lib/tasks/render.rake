namespace :render do
  desc "Bootstrap the synthetic assessment dataset and configured HR logins"
  task bootstrap: :environment do
    raise "Render bootstrap is only available in production." unless Rails.env.production?

    unless Employee.exists?(employee_number: "DEMO-00001")
      DemoEmployeeSeeder.new.call
    end

    accounts = [
      { email: ENV.fetch("RENDER_HR_EMAIL"), password: ENV.fetch("RENDER_HR_PASSWORD") }
    ]
    demo_email = ENV["RENDER_DEMO_HR_EMAIL"]
    demo_password = ENV["RENDER_DEMO_HR_PASSWORD"]

    if demo_email.present? != demo_password.present?
      raise "Set both RENDER_DEMO_HR_EMAIL and RENDER_DEMO_HR_PASSWORD to create the additional demo login."
    end

    accounts << { email: demo_email, password: demo_password } if demo_email.present?
    RenderHrAccountBootstrapper.new(accounts).call
  end
end
