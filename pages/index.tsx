import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import CitySelector from '../components/CitySelector'
import HurricaneDetails from '../components/HurricaneDetails'
import FilterPanel from '../components/FilterPanel'
import { Hurricane } from '../types/hurricane'
import { getDistance } from '../utils/distance'

const Map = dynamic(() => import('../components/Map'), { ssr: false })

// City coordinates from your Python script
const cities: Array<{ name: string; coordinates: [number, number] }> = [
  { name: 'New Orleans', coordinates: [29.9511, -90.0715] as [number, number] },
  { name: 'Houston', coordinates: [29.7604, -95.3698] as [number, number] },
  { name: 'Tampa', coordinates: [27.9506, -82.4572] as [number, number] },
  { name: 'Miami', coordinates: [25.7617, -80.1918] as [number, number] },
  { name: 'Corpus Christi', coordinates: [27.8006, -97.3964] as [number, number] },
  { name: 'Pensacola', coordinates: [30.4213, -87.2169] as [number, number] },
  { name: 'Mobile', coordinates: [30.6954, -88.0399] as [number, number] },
  { name: 'Galveston', coordinates: [29.3013, -94.7977] as [number, number] },
  { name: 'Biloxi', coordinates: [30.3960, -88.8853] as [number, number] },
  { name: 'Key West', coordinates: [24.5551, -81.7800] as [number, number] },
  { name: 'Veracruz', coordinates: [19.1684, -96.1332] as [number, number] },
  { name: 'Tampico', coordinates: [22.2475, -97.8572] as [number, number] },
  { name: 'Campeche', coordinates: [19.834969, -90.525902] as [number, number] },
  { name: 'Cancún', coordinates: [21.157883, -86.852288] as [number, number] },
  { name: 'Mérida', coordinates: [20.975278, -89.595223] as [number, number] },
  { name: 'Ciudad del Carmen', coordinates: [18.6583, -91.8035] as [number, number] },
  { name: 'Progreso', coordinates: [21.2839, -89.6631] as [number, number] },
  { name: 'Coatzacoalcos', coordinates: [18.1500, -94.4344] as [number, number] },
  { name: 'Tuxpan', coordinates: [20.9550, -97.3980] as [number, number] },
  { name: 'Havana', coordinates: [23.1365, -82.3707] as [number, number] },
  { name: 'Varadero', coordinates: [23.1847, -81.1864] as [number, number] },
  { name: 'Cienfuegos', coordinates: [22.1501, -80.4479] as [number, number] },
  { name: 'Belize City', coordinates: [17.5066, -88.1973] as [number, number] },
  { name: 'George Town', coordinates: [19.2951, -81.3809] as [number, number] },
  { name: 'Nassau', coordinates: [25.0548, -77.3590] as [number, number] }
]

export default function Home() {
  const [hurricaneData, setHurricaneData] = useState<Hurricane[]>([])
  const [selectedHurricanes, setSelectedHurricanes] = useState<Hurricane[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [yearRange, setYearRange] = useState<[number, number]>([1999, 2024])
  const [intensityRange, setIntensityRange] = useState<[number, number]>([0, 200])
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [cityHurricanes, setCityHurricanes] = useState<Hurricane[]>([])

  useEffect(() => {
    fetch('/api/hurricanes')
      .then(res => res.json())
      .then(data => {
        setHurricaneData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleCitySelect = (cityName: string, hurricanes: Hurricane[]) => {
    setSelectedCity(cityName)
    setCityHurricanes(hurricanes)
  }

  const applyFilters = () => {
    if (!selectedCity) return;

    const filteredHurricanes = hurricaneData.filter(hurricane => {
      // Year filter
      if (hurricane.year < yearRange[0] || hurricane.year > yearRange[1]) return false;

      // Intensity filter - check any point that exceeds the range
      const hasValidIntensity = hurricane.path.some(point => 
        point.wind >= intensityRange[0] && point.wind <= intensityRange[1]
      );
      if (!hasValidIntensity) return false;

      // City distance filter
      const cityCoords = cities.find(c => c.name === selectedCity)?.coordinates;
      if (!cityCoords) return false;

      // Check if any point is within range
      return hurricane.path.some(point => {
        const distance = getDistance(
          [point.lat, point.lon],
          cityCoords
        );
        return distance <= 100;
      });
    });

    setCityHurricanes(filteredHurricanes);
  };

  const resetFilters = () => {
    setYearRange([1999, 2024]);
    setIntensityRange([0, 200]);
    if (selectedCity) {
      handleCitySelect(selectedCity, hurricaneData);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', height: '100vh', width: '100vw' }}>
      {/* Left Column - Fixed width for controls */}
      <div className="bg-gray-50 overflow-hidden flex flex-col border-r border-gray-200">
        {/* Fixed header section with filters */}
        <div className="p-8 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Hurricane Stats</h1>
          
          <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
            {/* Filter Panel */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
              <FilterPanel 
                yearRange={yearRange}
                intensityRange={intensityRange}
                onYearChange={setYearRange}
                onIntensityChange={setIntensityRange}
                onApply={applyFilters}
                onReset={resetFilters}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <CitySelector 
                cities={cities}
                hurricaneData={hurricaneData}
                onCitySelect={handleCitySelect}
              />
            </div>
          </div>
        </div>

        {/* Scrollable hurricane cards section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedCity && (
            <>
              <div className="px-6 py-4 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Hurricanes Near {selectedCity}
                  </h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {cityHurricanes.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {cityHurricanes.map(hurricane => (
                    <HurricaneDetails 
                      key={hurricane.id}
                      hurricane={hurricane}
                    />
                  ))}
                  {cityHurricanes.length === 0 && (
                    <div className="text-gray-500 text-center py-8 bg-white rounded-lg border border-gray-200">
                      No hurricanes found matching the current filters
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right Column - Map takes remaining space */}
      <div className="h-full">
        <Map 
          hurricaneData={cityHurricanes.length ? cityHurricanes : hurricaneData} 
        />
      </div>
    </div>
  )
}

function getHurricaneCategory(windSpeed: number): number {
  if (windSpeed >= 157) return 5;
  if (windSpeed >= 130) return 4;
  if (windSpeed >= 111) return 3;
  if (windSpeed >= 96) return 2;
  if (windSpeed >= 74) return 1;
  return 0;
} 