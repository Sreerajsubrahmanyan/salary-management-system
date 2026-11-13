require "test_helper"

module Api
  module V1
    class SessionsControllerTest < ActionDispatch::IntegrationTest
      setup do
        @user = create_user
      end

      test "returns a CSRF token before sign in" do
        get "/api/v1/session"

        assert_response :success
        assert_nil response.parsed_body.dig("user")
        assert response.parsed_body["csrf_token"].present?
        assert_equal "no-store", response.headers["Cache-Control"]
      end

      test "signs in and exposes only the authenticated user's safe fields" do
        token = fetch_csrf_token

        post "/api/v1/session",
             params: { email: @user.email, password: "assessment-password-123" },
             headers: { "X-CSRF-Token" => token },
             as: :json

        assert_response :success
        assert_equal @user.email, response.parsed_body.dig("user", "email")
        assert_equal "hr_manager", response.parsed_body.dig("user", "role")
        assert_nil response.parsed_body.dig("user", "password_digest")

        get "/api/v1/session"
        assert_equal @user.email, response.parsed_body.dig("user", "email")
      end

      test "rejects invalid credentials with a generic response" do
        post "/api/v1/session",
             params: { email: @user.email, password: "incorrect-password" },
             headers: { "X-CSRF-Token" => fetch_csrf_token },
             as: :json

        assert_response :unauthorized
        assert_equal({ "error" => "Invalid email or password" }, response.parsed_body)
      end

      test "rejects state-changing requests without a CSRF token" do
        post "/api/v1/session",
             params: { email: @user.email, password: "assessment-password-123" },
             as: :json

        assert_response :unprocessable_entity
      end

      test "signs out and clears the session" do
        post "/api/v1/session",
             params: { email: @user.email, password: "assessment-password-123" },
             headers: { "X-CSRF-Token" => fetch_csrf_token },
             as: :json
        token = response.parsed_body.fetch("csrf_token")

        delete "/api/v1/session", headers: { "X-CSRF-Token" => token }
        assert_response :no_content

        get "/api/v1/session"
        assert_nil response.parsed_body["user"]
      end

      private

      def fetch_csrf_token
        get "/api/v1/session"
        response.parsed_body.fetch("csrf_token")
      end
    end
  end
end
