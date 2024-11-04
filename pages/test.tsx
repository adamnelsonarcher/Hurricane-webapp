import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import FilterPanel from '../components/FilterPanel'
import CitySelector from '../components/CitySelector'
import { Hurricane } from '../types/hurricane'
import { getDistance } from '../utils/distance'

// Dynamic import for Map component (no SSR)
const Map = dynamic(() => import('../components/Map'), { ssr: false })

// City coordinates from your existing setup
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

function getCategoryColor(category: number): string {
  switch(category) {
    case 5: return '#7e22ce'; // Purple
    case 4: return '#dc2626'; // Red
    case 3: return '#ea580c'; // Orange
    case 2: return '#ca8a04'; // Yellow
    case 1: return '#65a30d'; // Green
    default: return '#6b7280'; // Gray
  }
}

export default function HomeTemplate() {
  // State management
  const [hurricaneData, setHurricaneData] = useState<Hurricane[]>([])
  const [selectedHurricanes, setSelectedHurricanes] = useState<Hurricane[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [yearRange, setYearRange] = useState<[number, number]>([1999, 2024])
  const [intensityRange, setIntensityRange] = useState<[number, number]>([0, 200])
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [cityHurricanes, setCityHurricanes] = useState<Hurricane[]>([])
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false)
  const [isResultsExpanded, setIsResultsExpanded] = useState(false)
  const [selectedHurricane, setSelectedHurricane] = useState<Hurricane | null>(null)

  // Fetch hurricane data and set it as the initial display
  useEffect(() => {
    fetch('/api/hurricanes')
      .then(res => res.json())
      .then(data => {
        setHurricaneData(data)
        setCityHurricanes(data) // Set all hurricanes initially
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Filter handling functions
  const handleCitySelect = (cityName: string, hurricanes: Hurricane[]) => {
    setSelectedCity(cityName)
    setCityHurricanes(hurricanes)
  }

  const applyFilters = () => {
    if (!selectedCity) return;

    const filteredHurricanes = hurricaneData.filter(hurricane => {
      // Year filter
      if (hurricane.year < yearRange[0] || hurricane.year > yearRange[1]) return false;

      // Intensity filter
      const hasValidIntensity = hurricane.path.some(point => 
        point.wind >= intensityRange[0] && point.wind <= intensityRange[1]
      );
      if (!hasValidIntensity) return false;

      // City distance filter
      const cityCoords = cities.find(c => c.name === selectedCity)?.coordinates;
      if (!cityCoords) return false;

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
    setSelectedCity(null); // Clear selected city
    setCityHurricanes(hurricaneData); // Show all hurricanes
  };

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        Error: {error}
      </div>
    )
  }

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw', 
      padding: '24px',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{ 
        height: '100%',
        width: '100%',
        display: 'flex',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        overflow: 'hidden'
      }}>
        
        {/* Left Panel */}
        <div style={{ 
          width: isResultsExpanded ? '600px' : '450px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #e5e7eb',
          transition: 'width 0.3s ease'
        }}>
          {/* Filters Section with collapse button */}
          <div style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            transition: 'height 0.3s ease'
          }}>
            <div style={{
              padding: '32px',
              paddingBottom: isFiltersCollapsed ? '16px' : '32px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: isFiltersCollapsed ? '0' : '24px'
              }}>
                <h1 style={{ 
                  fontSize: '24px',
                  fontWeight: 'bold',
                  margin: 0
                }}>Filters</h1>
                <button
                  onClick={() => setIsFiltersCollapsed(!isFiltersCollapsed)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  {isFiltersCollapsed ? '🔽' : '🔼'}
                </button>
              </div>

              {/* Collapsible content */}
              <div style={{
                display: isFiltersCollapsed ? 'none' : 'block',
                transition: 'all 0.3s ease'
              }}>
                {/* Filters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ 
                    padding: '24px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h2 style={{ marginBottom: '16px', fontWeight: '600' }}></h2>
                    <FilterPanel 
                      yearRange={yearRange}
                      intensityRange={intensityRange}
                      onYearChange={setYearRange}
                      onIntensityChange={setIntensityRange}
                      onApply={applyFilters}
                      onReset={resetFilters}
                    />
                  </div>
                  
                  <div style={{ 
                    padding: '24px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    marginBottom: '16px'
                  }}>
                    <h2 style={{ marginBottom: '16px', fontWeight: '600' }}>Select City</h2>
                    <CitySelector 
                      cities={cities}
                      hurricaneData={hurricaneData}
                      onCitySelect={handleCitySelect}
                      selectedCity={selectedCity}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section with expand button */}
          <div style={{ 
            height: isFiltersCollapsed ? 'calc(100% - 76px)' : '500px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f9fafb',
            overflow: 'hidden',
            transition: 'height 0.3s ease'
          }}>
            {/* Results Header */}
            <div style={{
              padding: '16px 32px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <h2 style={{ fontWeight: '600' }}>
                  {selectedCity ? `Hurricanes Near ${selectedCity}` : 'All Hurricanes'}
                </h2>
                <span style={{ 
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '14px'
                }}>
                  {cityHurricanes.length} results
                </span>
              </div>
              <button
                onClick={() => setIsResultsExpanded(!isResultsExpanded)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {isResultsExpanded ? '◀️' : '▶️'}
              </button>
            </div>

            {/* Scrollable Results */}
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              height: '100%'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cityHurricanes.map(hurricane => {
                  const maxWind = Math.max(...hurricane.path.map(p => p.wind));
                  const category = getHurricaneCategory(maxWind);
                  const categoryColor = getCategoryColor(category);
                  const isSelected = selectedHurricane?.id === hurricane.id;
                  
                  return (
                    <div 
                      key={hurricane.id} 
                      onClick={() => setSelectedHurricane(isSelected ? null : hurricane)}
                      style={{
                        padding: '16px',
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        border: `1px solid ${isSelected ? categoryColor : '#e5e7eb'}`,
                        display: 'flex',
                        gap: '16px',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: categoryColor,
                        color: 'white',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold'
                      }}>
                        {category}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          marginBottom: '8px'
                        }}>
                          <h3 style={{ fontWeight: '500' }}>{hurricane.name}</h3>
                          <span style={{ color: '#6b7280', fontSize: '14px' }}>{hurricane.year}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#4b5563' }}>
                          <div>Max Wind: {Math.max(...hurricane.path.map(p => p.wind))} mph</div>
                          <div>Category: {getHurricaneCategory(Math.max(...hurricane.path.map(p => p.wind)))}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {selectedCity && cityHurricanes.length === 0 && (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    No hurricanes found matching the current filters
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Map */}
        <div style={{ 
          flex: 1,
          backgroundColor: '#f9fafb',
          transition: 'flex 0.3s ease'
        }}>
          <Map 
            hurricaneData={selectedHurricane ? [selectedHurricane] : (cityHurricanes.length ? cityHurricanes : hurricaneData)}
          />
        </div>

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