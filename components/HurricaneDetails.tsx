import { Hurricane } from '../types/hurricane'

interface HurricaneDetailsProps {
  hurricane: Hurricane
}

export default function HurricaneDetails({ hurricane }: HurricaneDetailsProps) {
  const displayName = `${hurricane.id} (${hurricane.name})`

  return (
    <div className="hurricane-details">
      <h2>{displayName}</h2>
      <div className="details-content">
        <p>Year: {hurricane.year}</p>
        <p>Maximum Wind: {hurricane.max_wind} knots</p>
        <p>Minimum Pressure: {hurricane.min_pressure} hPa</p>
        <p>ACE: {hurricane.ace.toFixed(2)}</p>
        <p>Duration: {hurricane.start_time} to {hurricane.end_time}</p>
      </div>
    </div>
  )
} 