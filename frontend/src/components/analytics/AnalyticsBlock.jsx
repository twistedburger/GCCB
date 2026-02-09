import PropTypes from 'prop-types'

function AnalyticsBlock({ title, description, children }) {
  return (
    <section style={{ marginTop: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {description && (
          <p style={{ margin: '6px 0 0', fontSize: 13, opacity: 0.85 }}>
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  )
}

AnalyticsBlock.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
}

export default AnalyticsBlock
