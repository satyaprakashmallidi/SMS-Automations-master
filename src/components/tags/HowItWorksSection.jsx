import PropTypes from 'prop-types'

function HowItWorksSection({ sectionRef = null }) {
  return (
    <div
      ref={sectionRef}
      id="how-it-works"
    />
  )
}

HowItWorksSection.propTypes = {
  sectionRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
}

export default HowItWorksSection
