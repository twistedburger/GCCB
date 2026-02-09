import PropTypes from 'prop-types'

function ChartCard({ title, subtitle, children }) {
  return (
    <section
      style={{
        border: '1px solid #ddd',
        borderRadius: 10,
        padding: 12,
      }}
    >
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, opacity: 0.8 }}>{subtitle}</div>
        )}
      </div>
      {children}
    </section>
  )
}

ChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
}
export default ChartCard
