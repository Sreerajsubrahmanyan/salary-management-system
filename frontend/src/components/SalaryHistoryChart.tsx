import type { SalaryRecord } from '../api/types'
import './SalaryHistoryChart.css'

const WIDTH = 720
const HEIGHT = 250
const PLOT = { left: 66, right: 20, top: 24, bottom: 48 }

type SalaryHistoryChartProps = {
  records: SalaryRecord[]
  employeeName: string
}

export function SalaryHistoryChart({ records, employeeName }: SalaryHistoryChartProps) {
  if (!records.length) return null

  const history = [...records].sort((left, right) => left.effective_date.localeCompare(right.effective_date))
  const currencies = Array.from(new Set(history.map((record) => record.currency)))
  const segments = splitCurrencyRuns(history)
  const dates = history.map((record) => new Date(`${record.effective_date}T00:00:00`).getTime())
  const minDate = dates[0]
  const maxDate = dates[dates.length - 1]
  const plotWidth = WIDTH - PLOT.left - PLOT.right
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom

  return (
    <section className="employee-salary-analytics" aria-labelledby="salary-chart-heading">
      <div className="salary-chart-heading">
        <div><p>PERSONAL COMPENSATION / 01</p><h2 id="salary-chart-heading">Salary over time</h2></div>
        <span>{history.length} dated {history.length === 1 ? 'entry' : 'entries'}</span>
      </div>
      <p className="salary-chart-intro">Effective-date history for {employeeName}. Each currency has its own scale.</p>
      <div className="salary-chart-grid">
        {currencies.map((currency) => {
          const currencyRecords = history.filter((record) => record.currency === currency)
          const values = currencyRecords.map((record) => Number(record.amount))
          const minValue = Math.min(...values)
          const maxValue = Math.max(...values)
          const padding = Math.max((maxValue - minValue) * 0.12, maxValue * 0.04, 1)
          const domainMin = Math.max(0, minValue - padding)
          const domainMax = maxValue + padding
          const currencySegments = segments.get(currency) ?? []
          const xFor = (record: SalaryRecord) => minDate === maxDate
            ? PLOT.left + plotWidth / 2
            : PLOT.left + ((new Date(`${record.effective_date}T00:00:00`).getTime() - minDate) / (maxDate - minDate)) * plotWidth
          const yFor = (record: SalaryRecord) => PLOT.top + ((domainMax - Number(record.amount)) / (domainMax - domainMin)) * plotHeight
          const tickValues = [0, 1, 2, 3].map((index) => domainMax - ((domainMax - domainMin) * index / 3))
          const labelInterval = Math.ceil(currencyRecords.length / 4)

          return <article className="salary-currency-chart" key={currency}>
            <div className="salary-currency-chart-title"><strong>{currency}</strong><span>{currencyRecords.length} {currencyRecords.length === 1 ? 'salary record' : 'salary records'}</span></div>
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${employeeName} salary history in ${currency}`}>
              <title>{employeeName} salary history in {currency}</title>
              {tickValues.map((tick, index) => {
                const y = PLOT.top + (plotHeight * index / 3)
                return <g key={index}>
                  <line className="salary-chart-grid-line" x1={PLOT.left} x2={WIDTH - PLOT.right} y1={y} y2={y} />
                  <text className="salary-chart-axis-label" x={PLOT.left - 9} y={y + 3} textAnchor="end">{compactAmount(tick)}</text>
                </g>
              })}
              {currencySegments.map((segment, segmentIndex) => {
                if (segment.length < 2) return null
                const path = segment.slice(1).reduce((commands, record) => {
                  const x = xFor(record)
                  const y = yFor(record)
                  return `${commands} H ${x.toFixed(2)} V ${y.toFixed(2)}`
                }, segment.length ? `M ${xFor(segment[0]).toFixed(2)} ${yFor(segment[0]).toFixed(2)}` : '')
                return <path className="salary-chart-line" d={path} key={`${currency}-line-${segmentIndex}`} />
              })}
              {currencyRecords.map((record, recordIndex) => {
                const x = xFor(record)
                const y = yFor(record)
                const showDateLabel = recordIndex === 0 || recordIndex === currencyRecords.length - 1 || recordIndex % labelInterval === 0
                return <g key={record.id}>
                  <circle className="salary-chart-point" cx={x} cy={y} r="5" />
                  <title>{formatDate(record.effective_date)} · {currency} {record.amount}</title>
                  {showDateLabel && <text className="salary-chart-axis-label" x={x} y={HEIGHT - 18} textAnchor="middle">{formatDate(record.effective_date)}</text>}
                </g>
              })}
            </svg>
          </article>
        })}
      </div>
    </section>
  )
}

function splitCurrencyRuns(history: SalaryRecord[]) {
  const result = new Map<string, SalaryRecord[][]>()
  let currentCurrency = ''
  let currentSegment: SalaryRecord[] = []

  history.forEach((record) => {
    if (record.currency !== currentCurrency) {
      if (currentSegment.length) result.get(currentCurrency)?.push(currentSegment)
      currentCurrency = record.currency
      currentSegment = []
      if (!result.has(currentCurrency)) result.set(currentCurrency, [])
    }
    currentSegment.push(record)
  })

  if (currentSegment.length) result.get(currentCurrency)?.push(currentSegment)
  return result
}

function compactAmount(value: number) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day))
}
