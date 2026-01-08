import { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from '../ui/Modal'
import InputField from '../ui/InputField'
import Button from '../Button'

function ScheduleModal({ isOpen, onClose, onSchedule }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [error, setError] = useState('')

  const handleSchedule = () => {
    if (!date || !time) {
      setError('Please select both date and time')
      return
    }

    const scheduledDateTime = new Date(`${date}T${time}`)
    if (scheduledDateTime < new Date()) {
      setError('Please select a future date and time')
      return
    }

    onSchedule(scheduledDateTime.toISOString())
    setDate('')
    setTime('')
    setError('')
  }

  const handleClose = () => {
    setDate('')
    setTime('')
    setError('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Schedule Campaign" size="sm">
      <div className="space-y-4">
        <p className="text-gray-600">Choose when to send this campaign</p>

        <InputField
          name="scheduleDate"
          label="Date"
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value)
            setError('')
          }}
          required
        />

        <InputField
          name="scheduleTime"
          label="Time"
          type="time"
          value={time}
          onChange={(e) => {
            setTime(e.target.value)
            setError('')
          }}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSchedule}>
            Schedule Campaign
          </Button>
        </div>
      </div>
    </Modal>
  )
}

ScheduleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSchedule: PropTypes.func.isRequired,
}

export default ScheduleModal
