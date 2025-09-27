import React from 'react'
const Rating = ({ value = 0, text = '' }) => (
  <div className="rating">
    <span>{'★'.repeat(Math.round(value))}</span>
    <span>{text && ` ${text}`}</span>
  </div>
)
export default Rating
