module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_hr_manager!

      private

      def authenticate_hr_manager!
        return if current_user&.hr_manager?

        render json: { error: "Authentication required" }, status: :unauthorized
      end
    end
  end
end
