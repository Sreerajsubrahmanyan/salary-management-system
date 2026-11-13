module Api
  module V1
    module Reports
      class PayController < BaseController
        rescue_from PayReportQuery::InvalidParameter, with: :render_invalid_parameter

        def index
          render json: PayReportQuery.new(params).call
        end

        private

        def render_invalid_parameter(error)
          render json: { error: error.message }, status: :bad_request
        end
      end
    end
  end
end
