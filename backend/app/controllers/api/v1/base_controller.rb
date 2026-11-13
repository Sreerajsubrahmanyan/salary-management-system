module Api
  module V1
    class BaseController < ApplicationController
      before_action :disable_caching
      before_action :authenticate_hr_manager!

      private

      def authenticate_hr_manager!
        return if current_user&.hr_manager?

        render json: { error: "Authentication required" }, status: :unauthorized
      end

      def disable_caching
        response.headers["Cache-Control"] = "no-store"
      end
    end
  end
end
