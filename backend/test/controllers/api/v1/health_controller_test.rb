require "test_helper"

module Api
  module V1
    class HealthControllerTest < ActionDispatch::IntegrationTest
      test "returns a JSON health response without requiring database records" do
        get "/api/v1/health"

        assert_response :success
        assert_equal "application/json", response.media_type
        assert_equal({ "status" => "ok" }, response.parsed_body)
      end
    end
  end
end
