class SalaryRecordCreator
  def initialize(employee, attributes)
    @employee = employee
    @attributes = attributes
  end

  def call
    @record = @employee.salary_records.build(@attributes)
    effective_date = @record.effective_date
    unless effective_date
      @record.valid?
      return @record
    end

    @employee.with_lock do
      current_record = @employee.salary_records.where(end_date: nil).order(effective_date: :desc).first
      if current_record && effective_date <= current_record.effective_date
        @record.errors.add(:effective_date, "must be after the current salary record")
        next
      end

      current_record&.update!(end_date: effective_date - 1.day)
      raise ActiveRecord::Rollback unless @record.save
    end

    @record
  end
end
