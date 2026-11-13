class SalaryRecordSerializer
  def self.serialize(record)
    return unless record

    {
      id: record.id,
      amount: record.amount.to_s("F"),
      currency: record.currency,
      effective_date: record.effective_date,
      end_date: record.end_date
    }
  end
end
