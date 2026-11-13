require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "normalizes email and authenticates with the stored password digest" do
    user = create_user(email: " HR.User@EXAMPLE.TEST ")

    assert_equal "hr.user@example.test", user.email
    assert user.authenticate("assessment-password-123")
    assert_not user.authenticate("incorrect-password")
    assert_not_includes user.attributes.keys, "password"
  end

  test "rejects roles outside the HR manager role" do
    user = create_user
    user.role = "employee"

    assert_not user.valid?
    assert_includes user.errors.attribute_names, :role
  end

  test "requires a password of at least 12 characters when a password is set" do
    user = create_user
    user.password = "too-short"

    assert_not user.valid?
    assert_includes user.errors.attribute_names, :password
  end
end
