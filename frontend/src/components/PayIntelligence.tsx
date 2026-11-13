import { useEffect, useState } from 'react'
import { getPayReport } from '../api/client'
import type { PayReportFilters, PayReportPayload } from '../api/types'
import './PayIntelligence.css'

const today = new Date().toISOString().slice(0, 10)

function amount(value: string, currency: string, maxFractionDigits = 4) {
  const [whole, fraction = ''] = value.split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const decimals = fraction.slice(0, maxFractionDigits).replace(/0+$/, '')
  return `${currency} ${grouped}${decimals ? `.${decimals}` : ''}`
}

export function PayIntelligence() {
  const [groupBy, setGroupBy] = useState<'country' | 'department' | 'job_title'>('department')
  const [country, setCountry] = useState('')
  const [currency, setCurrency] = useState('')
  const [status, setStatus] = useState<PayReportFilters['status'] | ''>('')
  const [asOf, setAsOf] = useState(today)
  const [result, setResult] = useState<PayReportPayload | null>(null)
  const [error, setError] = useState('')
  const [loadedKey, setLoadedKey] = useState('')
  const [retry, setRetry] = useState(0)
  const requestKey = `${groupBy}|${country}|${currency}|${status}|${asOf}|${retry}`
  const loading = loadedKey !== requestKey

  useEffect(() => {
    let active = true
    getPayReport({ group_by: groupBy, country: country || undefined, currency: currency || undefined, status: status || undefined, as_of: asOf })
      .then((payload) => { if (active) { setResult(payload); setError('') } })
      .catch((caught: unknown) => { if (active) setError(caught instanceof Error ? caught.message : 'The report could not be loaded.') })
      .finally(() => { if (active) setLoadedKey(requestKey) })
    return () => { active = false }
  }, [groupBy, country, currency, status, asOf, retry, requestKey])

  const count = result?.data.reduce((sum, row) => sum + row.employee_count, 0) ?? 0
  const currencies = Array.from(new Set(result?.data.map((row) => row.currency) ?? []))
  const totals = currencies.map((code) => ({
    currency: code,
    value: result?.data.filter((row) => row.currency === code).reduce((sum, row) => sum + Number(row.total_salary), 0) ?? 0,
  }))
  const max = Math.max(1, ...(result?.data.map((row) => Number(row.total_salary)) ?? []))

  return (
    <section className="pay-intelligence" aria-labelledby="pay-title">
      <div className="pay-hero">
        <div className="pay-hero-copy">
          <p className="pay-overline"><span>PAY INTELLIGENCE</span><span>LIVE LEDGER · 02</span></p>
          <h1 id="pay-title">See where<br /><em>pay takes shape.</em></h1>
          <p className="pay-deck">A clear view of compensation across the organization, grouped in the currency it is paid.</p>
        </div>
        <div className="pay-orbit" aria-hidden="true"><span>PEOPLE</span><strong>{count.toLocaleString()}</strong><i>in view</i><b>✳</b></div>
        <div className="pay-hero-foot"><span>AS OF {asOf}</span><span>COUNTS FOLLOW EFFECTIVE SALARY RECORDS</span></div>
      </div>

      <div className="pay-controls" aria-label="Report controls">
        <label><span>Read the ledger by</span><select value={groupBy} onChange={(event) => setGroupBy(event.target.value as typeof groupBy)}><option value="department">Department</option><option value="country">Country</option><option value="job_title">Role</option></select></label>
        <label><span>Country code</span><input aria-label="Country code" maxLength={2} value={country} onChange={(event) => setCountry(event.target.value.toUpperCase())} placeholder="All countries" /></label>
        <label><span>Currency</span><input aria-label="Currency" maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} placeholder="All currencies" /></label>
        <label><span>Employment status</span><select aria-label="Employment status" value={status} onChange={(event) => setStatus(event.target.value as PayReportFilters['status'] | '')}><option value="">All statuses</option><option value="active">Active</option><option value="on_leave">On leave</option><option value="terminated">Former</option></select></label>
        <label><span>Effective on</span><input aria-label="Effective on" type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} /></label>
      </div>

      <div className="pay-summary-row">
        <article className="pay-summary-people"><span>PEOPLE WITH ACTIVE PAY</span><strong>{loading && !result ? '—' : count.toLocaleString()}</strong><small>Filtered to the selected date</small></article>
        {totals.length ? totals.map((total) => <article className="pay-summary-total" key={total.currency}><span>TOTAL · {total.currency}</span><strong>{amount(String(total.value), total.currency)}</strong><small>Across {count.toLocaleString()} people in view</small></article>) : <article className="pay-summary-total"><span>TOTAL PAYROLL</span><strong>{loading ? 'Reading…' : '—'}</strong><small>Grouped by currency</small></article>}
      </div>

      <div className="pay-breakdown-head"><div><p className="pay-section-label">THE DISTRIBUTION / 01</p><h2>{groupBy === 'job_title' ? 'By role' : `By ${groupBy}`}</h2></div><span>{result?.meta.group_count ?? 0} groups</span></div>
      {error ? <div className="pay-state" role="alert"><strong>The ledger could not be read.</strong><span>{error}</span><button type="button" onClick={() => setRetry((value) => value + 1)}>Try again ↗</button></div> : loading && !result ? <div className="pay-state">Reading the compensation ledger…</div> : !result?.data.length ? <div className="pay-state">No salary records match these filters. Widen the view to see more.</div> : (
        <div className="pay-rows">
          {result.data.map((row, index) => <article className="pay-row" key={`${row.group_value}-${row.currency}`}>
            <span className="pay-row-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="pay-row-label">
              <div className="pay-row-title"><strong>{row.group_value}</strong><span className="pay-currency-tag">{row.currency}</span></div>
              <span>{row.employee_count.toLocaleString()} {row.employee_count === 1 ? 'person' : 'people'} · avg. ≈ {amount(row.average_salary, row.currency, 2)}</span>
              <span className="pay-row-range">Median {amount(row.median_salary, row.currency, 2)} · range {amount(row.minimum_salary, row.currency)} — {amount(row.maximum_salary, row.currency)}</span>
            </div>
            <div className="pay-row-track" aria-label={`${Math.round(Number(row.total_salary) / max * 100)} percent of largest group`}><span style={{ width: `${Math.max(3, Number(row.total_salary) / max * 100)}%` }} /></div>
            <strong className="pay-row-total">{amount(row.total_salary, row.currency)}</strong>
          </article>)}
        </div>
      )}
      <p className="pay-footnote">Totals stay separate by currency. This view does not convert exchange rates.</p>
    </section>
  )
}
