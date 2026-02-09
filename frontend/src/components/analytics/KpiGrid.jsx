import PropTypes from 'prop-types'

function KpiCard({ label, value, subvalue }) {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 10,
        padding: 12,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.85 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{value}</div>
      {subvalue && (
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>
          {subvalue}
        </div>
      )}
    </div>
  )
}

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  subvalue: PropTypes.string,
}

function KpiGrid({ items }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
      }}
    >
      {items.map(k => (
        <KpiCard
          key={k.label}
          label={k.label}
          value={k.value}
          subvalue={k.subvalue}
        />
      ))}
    </div>
  )
}

KpiGrid.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      subvalue: PropTypes.string,
    })
  ).isRequired,
}

export default KpiGrid
