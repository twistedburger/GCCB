import { render, screen } from '@testing-library/react'
import AnalyticsBlock from '../AnalyticsBlock'
import ChartCard from '../ChartCard'
import KpiGrid from '../KpiGrid'

describe('AnalyticsBlock', () => {
  test('renders title', () => {
    render(
      <AnalyticsBlock title="CO₂ Savings">
        <div />
      </AnalyticsBlock>
    )
    expect(screen.getByText('CO₂ Savings')).toBeInTheDocument()
  })

  test('renders a description if given', () => {
    render(
      <AnalyticsBlock title="CO₂ Savings" description="Savings over time">
        <div />
      </AnalyticsBlock>
    )
    expect(screen.getByText('Savings over time')).toBeInTheDocument()
  })

  test('renders children properly', () => {
    render(
      <AnalyticsBlock title="Block">
        <div data-testid="child-content">Chart stuff hopefully goes here</div>
      </AnalyticsBlock>
    )
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})

describe('ChartCard', () => {
  test('renders title', () => {
    render(
      <ChartCard title="Trips by Mode">
        <div />
      </ChartCard>
    )
    expect(screen.getByText('Trips by Mode')).toBeInTheDocument()
  })

  test('renders children inside card', () => {
    render(
      <ChartCard title="Chart">
        <div data-testid="chart-child">Chart stuff</div>
      </ChartCard>
    )
    expect(screen.getByTestId('chart-child')).toBeInTheDocument()
  })

  test('renders as a section', () => {
    const { container } = render(
      <ChartCard title="Test">
        <div />
      </ChartCard>
    )
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})

describe('KpiGrid', () => {
  const items = [
    { label: 'Total Trips', value: '20' },
    { label: 'Distance', value: '120 km', subvalue: 'Last 30 days' },
    { label: 'CO₂ Saved', value: '8.5 kg' },
  ]

  test('renders all labels', () => {
    render(<KpiGrid items={items} />)
    expect(screen.getByText('Total Trips')).toBeInTheDocument()
    expect(screen.getByText('Distance')).toBeInTheDocument()
    expect(screen.getByText('CO₂ Saved')).toBeInTheDocument()
  })

  test('renders all values', () => {
    render(<KpiGrid items={items} />)
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('120 km')).toBeInTheDocument()
    expect(screen.getByText('8.5 kg')).toBeInTheDocument()
  })

  test('renders subvalues when provided', () => {
    render(<KpiGrid items={items} />)
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
  })
})
