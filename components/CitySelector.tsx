import { useState, useEffect } from 'react'
import { Hurricane } from '../types/hurricane'

interface CitySelectorProps {
  cities: Array<{
    name: string
    coordinates: [number, number]
  }>
  hurricaneData: Hurricane[]
  onCitySelect: (cityName: string, hurricanes: Hurricane[]) => void
  selectedCity?: string | null
}

export default function CitySelector({ 
  cities, 
  hurricaneData, 
  onCitySelect,
  selectedCity: externalSelectedCity = null
}: CitySelectorProps) {
  const [selectedCity, setSelectedCity] = useState('')

  useEffect(() => {
    if (externalSelectedCity === null) {
      setSelectedCity('')
    }
  }, [externalSelectedCity])

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
    
    if (!cityName) {
      onCitySelect('', hurricaneData)
      return
    }

    const cityCoords = cities.find(c => c.name === cityName)?.coordinates
    if (!cityCoords) return

    const cityHurricanes = hurricaneData.filter(hurricane => {
      return hurricane.path.some(point => {
        const distance = getDistance(
          [point.lat, point.lon],
          cityCoords
        )
        return distance <= 200
      })
    })

    onCitySelect(cityName, cityHurricanes)
  }

  return (
    <div className="filter-section">
      <select 
        value={selectedCity}
        onChange={(e) => handleCityChange(e.target.value)}
        className="select"
      >
        <option value="">All Cities</option>
        {cities.map(city => (
          <option key={city.name} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
    </div>
  )
}

// Haversine formula to calculate distance between coordinates
function getDistance(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function toRad(deg: number): number {
  return deg * Math.PI / 180
} 