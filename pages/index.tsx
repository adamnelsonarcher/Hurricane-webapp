import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import FilterPanel from '../components/FilterPanel'
import CitySelector from '../components/CitySelector'
import { Hurricane } from '../types/hurricane'
import hurricaneData from '../public/data/hurricanes.json'

// Dynamic import for Map component (no SSR)
const Map = dynamic(() => import('../components/Map'), { ssr: false })

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

// Add this type assertion near the top of the file
const typedHurricaneData = hurricaneData as Hurricane[]

// Instead, we'll create a type for city data from the geocoding API
interface CityData {
  name: string;
  coordinates: [number, number];
}

export default function HomeTemplate() {
  // State management
  const [selectedHurricanes, setSelectedHurricanes] = useState<Hurricane[]>([])
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
  const [cityHurricanes, setCityHurricanes] = useState<Hurricane[]>(typedHurricaneData)
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false)
  const [isResultsExpanded, setIsResultsExpanded] = useState(false)
  const [selectedHurricane, setSelectedHurricane] = useState<Hurricane | null>(null)
  const [yearRange, setYearRange] = useState<[number, number]>([1999, 2024])
  const [intensityRange, setIntensityRange] = useState<[number, number]>([0, 200])
  const [categoryRange, setCategoryRange] = useState<[number, number]>([1, 5])
  const [pressureRange, setPressureRange] = useState<[number, number]>([900, 1020])
  const [aceRange, setAceRange] = useState<[number, number]>([0, 100])

  // Add this near the top of your component, after state declarations
  const getInitialFiltered = (data: Hurricane[]) => {
    return data.filter(hurricane => {
      const maxWind = Math.max(...hurricane.path.map(p => p.wind));
      return getHurricaneCategory(maxWind) >= 1;  // Only include Cat 1 and higher
    });
  };

  // Use it when initializing the data
  const initialFiltered = getInitialFiltered(typedHurricaneData);

  // Apply initial filters on component mount
  useEffect(() => {
    const initialFiltered = typedHurricaneData.filter(hurricane => {
      const maxWind = Math.max(...hurricane.path.map(p => p.wind));
      const category = getHurricaneCategory(maxWind);
      return category >= 1 && category <= 5; 
    });
    setCityHurricanes(initialFiltered);
  }, []);

  // Filter handling functions
  const handleCitySelect = (cityName: string, coordinates: [number, number], hurricanes: Hurricane[]) => {
    if (!cityName) {
      setSelectedCity(null);
      // Apply filters to all hurricanes
      const filteredAll = typedHurricaneData.filter(hurricane => {
        const maxWind = Math.max(...hurricane.path.map(p => p.wind));
        const category = getHurricaneCategory(maxWind);
        
        return (
          hurricane.year >= yearRange[0] && 
          hurricane.year <= yearRange[1] &&
          hurricane.path.some(point => point.wind >= intensityRange[0] && point.wind <= intensityRange[1]) &&
          category >= categoryRange[0] && 
          category <= categoryRange[1]
        );
      });
      setCityHurricanes(filteredAll);
    } else {
      // Set the selected city with its coordinates
      setSelectedCity({
        name: cityName,
        coordinates: coordinates
      });

      // Apply filters to city-specific hurricanes
      const filteredCity = hurricanes.filter(hurricane => {
        const maxWind = Math.max(...hurricane.path.map(p => p.wind));
        const category = getHurricaneCategory(maxWind);
        
        return (
          hurricane.year >= yearRange[0] && 
          hurricane.year <= yearRange[1] &&
          hurricane.path.some(point => point.wind >= intensityRange[0] && point.wind <= intensityRange[1]) &&
          category >= categoryRange[0] && 
          category <= categoryRange[1]
        );
      });
      setCityHurricanes(filteredCity);
    }
  };

  const applyFilters = () => {
    // Start with either city-filtered hurricanes or all hurricanes
    const currentSet = selectedCity ? cityHurricanes : typedHurricaneData;
    
    const filteredHurricanes = currentSet.filter(hurricane => {
      // Year filter
      if (hurricane.year < yearRange[0] || hurricane.year > yearRange[1]) return false;

      // Intensity filter
      const hasValidIntensity = hurricane.path.some(point => 
        point.wind >= intensityRange[0] && point.wind <= intensityRange[1]
      );
      if (!hasValidIntensity) return false;

      // Category filter
      const maxWind = Math.max(...hurricane.path.map(p => p.wind));
      const category = getHurricaneCategory(maxWind);
      if (category < categoryRange[0] || category > categoryRange[1]) return false;

      const meetsMinPressure = hurricane.min_pressure >= pressureRange[0] && 
                              hurricane.min_pressure <= pressureRange[1]
      
      const meetsAce = hurricane.ace >= aceRange[0] && 
                       hurricane.ace <= aceRange[1]

      return meetsMinPressure && meetsAce;
    });

    setCityHurricanes(filteredHurricanes);
  };

  const resetFilters = () => {
    setYearRange([1999, 2024]);
    setIntensityRange([0, 200]);
    setCategoryRange([1, 5]);
    setPressureRange([900, 1020]);
    setAceRange([0, 100]);
    setSelectedCity(null);
    setCityHurricanes(getInitialFiltered(typedHurricaneData));
  };

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
                      categoryRange={categoryRange}
                      pressureRange={pressureRange}
                      aceRange={aceRange}
                      onYearChange={setYearRange}
                      onIntensityChange={setIntensityRange}
                      onCategoryChange={setCategoryRange}
                      onPressureChange={setPressureRange}
                      onAceChange={setAceRange}
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
                      hurricaneData={typedHurricaneData}
                      onCitySelect={handleCitySelect}
                      selectedCity={selectedCity?.name || null}
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
                  {selectedCity ? `Hurricanes Near ${selectedCity.name}` : 'All Hurricanes'}
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
                          <h3 style={{ fontWeight: '500' }}>
                            {`${hurricane.id} (${hurricane.name})`}
                          </h3>
                          <span style={{ color: '#6b7280', fontSize: '14px' }}>
                            {hurricane.year}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#4b5563' }}>
                        <div>{new Date(hurricane.start_time).toLocaleDateString()} - {new Date(hurricane.end_time).toLocaleDateString()}</div>
                          <div>Max Wind: {hurricane.max_wind} knots</div>
                          <div>Min Pressure: {hurricane.min_pressure} hPa</div>
                          <div>Category: {getHurricaneCategory(hurricane.max_wind)}</div>
                          <div>ACE: {hurricane.ace.toFixed(2)}</div>
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
            hurricaneData={selectedHurricane ? [selectedHurricane] : (cityHurricanes.length ? cityHurricanes : typedHurricaneData)}
            selectedCity={selectedCity?.name || null}
            cities={selectedCity ? [{ name: selectedCity.name, coordinates: selectedCity.coordinates }] : []}
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