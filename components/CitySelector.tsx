import { useState, useEffect } from 'react'
import { Hurricane } from '../types/hurricane'

interface CitySelectorProps {
  hurricaneData: Hurricane[]
  onCitySelect: (cityName: string, coordinates: [number, number], hurricanes: Hurricane[]) => void
  selectedCity?: string | null
  commonCities: Array<{ name: string; coordinates: [number, number] }>
}

interface GeocodingResult {
  place_name: string
  center: [number, number]
}

export default function CitySelector({ 
  hurricaneData, 
  onCitySelect,
  selectedCity: externalSelectedCity = null,
  commonCities
}: CitySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (externalSelectedCity === null) {
      setSelectedCity('')
      setSearchTerm('')
    }
  }, [externalSelectedCity])

  const searchCities = async (query: string) => {
    if (!query) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` + 
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&` +
        'types=place&limit=5'
      )
      const data = await response.json()
      setSearchResults(data.features.map((f: any) => ({
        place_name: f.place_name,
        center: [f.center[1], f.center[0]] // Convert to [lat, lon]
      })))
    } catch (error) {
      console.error('Error searching cities:', error)
      setSearchResults([])
    }
    setIsLoading(false)
  }

  const handleCitySelect = (city: GeocodingResult | null) => {
    if (!city) {
      setSelectedCity('')
      setSearchTerm('')
      setSearchResults([])
      onCitySelect('', [0, 0], hurricaneData)
      return
    }

    setSelectedCity(city.place_name)
    setSearchTerm(city.place_name)
    setSearchResults([])
    
    const cityHurricanes = hurricaneData.filter(hurricane => {
      return hurricane.path.some(point => {
        const distance = getDistance(
          [point.lat, point.lon],
          city.center
        )
        return distance <= 200
      })
    })

    onCitySelect(city.place_name, city.center, cityHurricanes)
  }

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleCommonCitySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = event.target.value;
    if (!cityName) {
      handleCitySelect(null);
      return;
    }

    const selectedCity = commonCities.find(city => city.name === cityName);
    if (selectedCity) {
      const cityHurricanes = hurricaneData.filter(hurricane => {
        return hurricane.path.some(point => {
          const distance = getDistance(
            [point.lat, point.lon],
            selectedCity.coordinates
          )
          return distance <= 200
        })
      });

      onCitySelect(selectedCity.name, selectedCity.coordinates, cityHurricanes);
    }
  };

  return (
    <div className="filter-section relative">
      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a city..."
          className="search-input"
        />
        
        {isLoading && (
          <div className="search-loading">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {searchTerm && !isLoading && searchResults.length > 0 && !selectedCity && (
          <div className="search-results max-w-md">
            {searchResults.map((city) => (
              <div
                key={city.place_name}
                onClick={() => handleCitySelect(city)}
                className="search-result-item"
              >
                {city.place_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-sm text-gray-600 mb-2">
          Or select one of these 25 gulf cities:
        </div>
        <select
          value={externalSelectedCity || ''}
          onChange={handleCommonCitySelect}
          className="select w-full"
        >
          <option value="">Select a city</option>
          {commonCities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => handleCitySelect(null)}
        className="clear-selection"
      >
        Clear selection
      </button>
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