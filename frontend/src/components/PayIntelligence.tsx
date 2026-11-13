import { useEffect, useState } from 'react'
import { getPayReport } from '../api/client'
import type { PayReportFilters, PayReportPayload } from '../api/types'
import { buildPayReportCsv } from './payReportCsv'
import './PayIntelligence.css'

const today = new Date().toISOString().slice(0, 10)

function amount(value: string, currency: string, maxFractionDigits = 4) {
  const [whole, fraction = ''] = value.split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const decimals = fraction.slice(0, maxFractionDigits).replace(/0+$/, '')
  return `${currency} ${grouped}${decimals ? `.${decimals}` : ''}`
}

function sumAmounts(values: string[]) {
  const scale = 4
  const scaledTotal = values.reduce((total, value) => {
    const [whole, fraction = ''] = value.split('.')
    return total + BigInt(`${whole}${fraction.padEnd(scale, '0').slice(0, scale)}`)
  }, 0n)
  const whole = (scaledTotal / 10_000n).toString()
  const fraction = (scaledTotal % 10_000n).toString().padStart(scale, '0').replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : whole
}

export function PayIntelligence() {
  const [groupBy, setGroupBy] = useState<'country' | 'department' | 'job_title'>('country')
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
    value: sumAmounts(result?.data.filter((row) => row.currency === code).map((row) => row.total_salary) ?? []),
  }))
  const maxByCurrency = new Map(currencies.map((code) => [
    code,
    Math.max(1, ...(result?.data.filter((row) => row.currency === code).map((row) => Number(row.total_salary)) ?? [])),
  ]))

  function downloadCsv() {
    if (!result) return
    const reportFilters: PayReportFilters = {
      group_by: groupBy,
      country: country || undefined,
      currency: currency || undefined,
      status: status || undefined,
      as_of: asOf,
    }
    const blob = new Blob([buildPayReportCsv(result, reportFilters)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `salary-report-${groupBy}-${asOf}.csv`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <section className="pay-intelligence" aria-labelledby="pay-title">
      <div className="pay-hero">
        <div className="pay-hero-copy">
          <p className="pay-overline"><span>SALARY ANALYTICS DASHBOARD</span><span>LIVE LEDGER · 02</span></p>
          <h1 id="pay-title">Understand the<br /><em>shape of pay.</em></h1>
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
        <article className="pay-summary-people"><span>PEOPLE WITH EFFECTIVE PAY</span><strong>{loading && !result ? '—' : count.toLocaleString()}</strong><small>Matching the selected date and filters</small></article>
        <article className="pay-summary-groups"><span>GROUPS IN VIEW</span><strong>{loading && !result ? '—' : (result?.meta.group_count ?? 0).toLocaleString()}</strong><small>Grouped by {groupBy === 'job_title' ? 'role' : groupBy}</small></article>
        <article className="pay-summary-currencies"><div className="pay-currency-summary-head"><span>PAYROLL BY CURRENCY</span><small>{currencies.length} {currencies.length === 1 ? 'currency' : 'currencies'}</small></div>
          {totals.length ? <div className="pay-currency-grid">{totals.map((total) => <div className="pay-currency-total" key={total.currency}><span>{total.currency}</span><strong>{amount(total.value, total.currency)}</strong></div>)}</div> : <small>{loading ? 'Reading payroll totals…' : 'No payroll totals match these filters.'}</small>}
        </article>
      </div>

      <div className="pay-breakdown-head"><div><p className="pay-section-label">THE DISTRIBUTION / 01</p><h2>{groupBy === 'job_title' ? 'By role' : `By ${groupBy}`}</h2></div><div className="pay-breakdown-tools"><span>{result?.meta.group_count ?? 0} groups</span><button type="button" onClick={downloadCsv} disabled={!result || loading || Boolean(error)}>Export CSV <span aria-hidden="true">↗</span></button></div></div>
      {error ? <div className="pay-state" role="alert"><strong>The ledger could not be read.</strong><span>{error}</span><button type="button" onClick={() => setRetry((value) => value + 1)}>Try again ↗</button></div> : loading && !result ? <div className="pay-state">Reading the compensation ledger…</div> : !result?.data.length ? <div className="pay-state">No salary records match these filters. Widen the view to see more.</div> : (
        <div className="pay-rows">
          {result.data.map((row, index) => <article className="pay-row" key={`${row.group_value}-${row.currency}`}>
            <span className="pay-row-index">{String(index + 1).padStart(2, '0')}</span>
            <div className="pay-row-label">
              <div className="pay-row-title"><strong>{row.group_value}</strong><span className="pay-currency-tag">{row.currency}</span></div>
              <span>{row.employee_count.toLocaleString()} {row.employee_count === 1 ? 'person' : 'people'} · avg. ≈ {amount(row.average_salary, row.currency, 2)}</span>
              <span className="pay-row-range">Median {amount(row.median_salary, row.currency, 2)} · range {amount(row.minimum_salary, row.currency)} — {amount(row.maximum_salary, row.currency)}</span>
            </div>
            <div className="pay-row-track" aria-label={`${Math.round(Number(row.total_salary) / (maxByCurrency.get(row.currency) ?? 1) * 100)} percent of largest ${row.currency} group`}><span style={{ width: `${Math.max(3, Number(row.total_salary) / (maxByCurrency.get(row.currency) ?? 1) * 100)}%` }} /></div>
            <strong className="pay-row-total">{amount(row.total_salary, row.currency)}</strong>
          </article>)}
        </div>
      )}
      <p className="pay-footnote">Totals stay separate by currency. Bar lengths compare groups within each currency; no exchange rates are applied.</p>
    </section>
  )
}
