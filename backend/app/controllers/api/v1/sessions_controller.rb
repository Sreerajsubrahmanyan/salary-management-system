module Api
  module V1
    class SessionsController < ApplicationController
      before_action :disable_caching

      def show
        render json: session_response
      end

      def create
        user = User.find_by(email: params[:email].to_s.strip.downcase)

        unless user&.authenticate(params[:password].to_s)
          render json: { error: "Invalid email or password" }, status: :unauthorized
          return
        end

        reset_session
        session[:user_id] = user.id
        render json: session_response
      end

      def destroy
        reset_session
        head :no_content
      end

      private

      def session_response
        {
          user: current_user&.slice(:email, :role),
          csrf_token: form_authenticity_token
        }
      end

      def disable_caching
        response.headers["Cache-Control"] = "no-store"
      end
    end
  end
end
