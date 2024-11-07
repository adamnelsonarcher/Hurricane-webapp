import { useState, useEffect, useRef } from 'react'
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
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

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
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1.5">
          Select one of these 25 gulf cities:
        </div>
        <select
          value={externalSelectedCity || ''}
          onChange={handleCommonCitySelect}
          className="select w-full h-9"
        >
          <option value="">Select a city</option>
          {commonCities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray-200 my-4"> </div>

      <div className="relative mb-4">
        <div className="text-sm text-gray-600 mb-1.5">
          Or, search for any city by name:
        </div>
        <div className="search-input flex items-center border rounded-lg bg-white">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter city name..."
            className="w-full px-3 h-9 outline-none rounded-lg"
            style={{ border: 'none' }}
          />
        </div>

        {isLoading && (
          <div className="absolute right-3 top-[34px]">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}

        {searchTerm && !isLoading && searchResults.length > 0 && !selectedCity && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
            {searchResults.map((city) => (
              <div
                key={city.place_name}
                onClick={() => handleCitySelect(city)}
                className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
              >
                {city.place_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => handleCitySelect(null)}
        className="clear-selection h-8 text-sm"
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