require "test_helper"

class RenderHrAccountBootstrapperTest < ActiveSupport::TestCase
  test "creates each configured HR account and can run again without resetting existing passwords" do
    accounts = [
      { email: "OWNER@example.test", password: "owner-password-123" },
      { email: "recruiter-demo@example.test", password: "recruiter-demo-123" }
    ]
    bootstrapper = RenderHrAccountBootstrapper.new(accounts)

    assert_difference("User.count", 2) { bootstrapper.call }

    owner = User.find_by!(email: "owner@example.test")
    demo = User.find_by!(email: "recruiter-demo@example.test")
    assert owner.authenticate("owner-password-123")
    assert demo.authenticate("recruiter-demo-123")
    assert_equal [ "hr_manager", "hr_manager" ], [ owner.role, demo.role ]

    accounts[1][:password] = "changed-demo-password-456"
    assert_no_difference("User.count") { bootstrapper.call }
    assert demo.reload.authenticate("recruiter-demo-123")
  end
end
