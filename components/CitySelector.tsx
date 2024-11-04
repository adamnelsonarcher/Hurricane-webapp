import { useState } from 'react'
import { Hurricane } from '../types/hurricane'

interface CitySelectorProps {
  cities: Array<{
    name: string
    coordinates: [number, number]
  }>
  hurricaneData: Hurricane[]
  onCitySelect: (cityName: string, hurricanes: Hurricane[]) => void
}

export default function CitySelector({ cities, hurricaneData, onCitySelect }: CitySelectorProps) {
  const [selectedCity, setSelectedCity] = useState('')

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
    
    const cityCoords = cities.find(c => c.name === cityName)?.coordinates
    if (!cityCoords) return

    const cityHurricanes = hurricaneData.filter(hurricane => {
      return hurricane.path.some(point => {
        const distance = getDistance(
          [point.lat, point.lon],
          cityCoords
        )
        return distance <= 100
      })
    })

    onCitySelect(cityName, cityHurricanes)
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select a City
      </label>
      <select 
        value={selectedCity}
        onChange={(e) => handleCityChange(e.target.value)}
        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Choose a city...</option>
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