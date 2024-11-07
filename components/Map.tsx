import { useEffect, useRef, useState, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Hurricane } from '../types/hurricane'

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
if (!mapboxToken) {
  throw new Error('Mapbox token is required')
}
mapboxgl.accessToken = mapboxToken

interface MapProps {
  hurricaneData: Hurricane[]
  selectedCity: string | null
  cities: Array<{ name: string; coordinates: [number, number] }>
}

interface HurricaneProperties {
  id: string;
  displayName: string;
  name: string;
  year: number;
  maxWind: number;
  category: number;
}

const Legend = () => (
  <div style={{
    position: 'absolute',
    bottom: '24px',
    right: '24px',
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1
  }}>
    
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '20px', height: '3px', backgroundColor: '#7e22ce' }}></div>
        <span>Category 5</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '20px', height: '3px', backgroundColor: '#dc2626' }}></div>
        <span>Category 4</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '20px', height: '3px', backgroundColor: '#ea580c' }}></div>
        <span>Category 3</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '20px', height: '3px', backgroundColor: '#ca8a04' }}></div>
        <span>Category 2</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '20px', height: '3px', backgroundColor: '#65a30d' }}></div>
        <span>Category 1</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '20px', height: '3px', backgroundColor: '#6b7280' }}></div>
        <span>Category 0 / TD</span>
      </div>
    </div>
  </div>
)

const HurricaneSearch = ({ hurricanes, onSelect }: { 
  hurricanes: Hurricane[], 
  onSelect: (hurricane: Hurricane | null) => void 
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredHurricanes = useMemo(() => {
    if (!searchTerm) return []
    const lowercaseSearch = searchTerm.toLowerCase()
    return hurricanes.filter(h => 
      h.name.toLowerCase().includes(lowercaseSearch) ||
      h.id.toLowerCase().includes(lowercaseSearch)
    ).slice(0, 5)
  }, [hurricanes, searchTerm])

  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '24px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 1,
      width: '300px'
    }}>
      {filteredHurricanes.length > 0 && (
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px'
        }}>
          {filteredHurricanes.map(hurricane => (
            <div
              key={hurricane.id}
              onClick={() => {
                onSelect(hurricane)
                setSearchTerm('')
              }}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {hurricane.id} ({hurricane.name})
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
      }}>
        <span style={{ marginRight: '8px', color: '#6b7280' }}>🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search hurricanes..."
          style={{
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '14px'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('')
              onSelect(null)
            }}
            style={{
              border: 'none',
              background: 'none',
              padding: '4px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

const DirectionToggle = ({ visible, onChange }: { 
  visible: boolean, 
  onChange: (visible: boolean) => void 
}) => (
  <div style={{
    position: 'absolute',
    top: '24px',
    left: '24px',
    backgroundColor: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    userSelect: 'none'
  }}
  onClick={() => onChange(!visible)}
  >
    <input
      type="checkbox"
      checked={visible}
      onChange={() => {}}  // Handle change through parent div
      style={{ cursor: 'pointer' }}
    />
    <span style={{ color: '#4b5563' }}>Show storm directional movement</span>
  </div>
)

export default function Map({ hurricaneData, selectedCity, cities }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const popup = useRef<mapboxgl.Popup | null>(null)
  const cityMarkers = useRef<mapboxgl.Marker[]>([])
  const [showArrows, setShowArrows] = useState(true)

  const updateMapData = (mapInstance: mapboxgl.Map) => {
    if (!mapInstance.isStyleLoaded()) {
      setTimeout(() => updateMapData(mapInstance), 100)
      return
    }

    // Remove existing layers and sources
    ['hurricane-paths', 'hurricane-paths-hit-area', 'path-points', 'path-endpoints', 'path-arrows'].forEach(layer => {
      if (mapInstance.getLayer(layer)) mapInstance.removeLayer(layer)
    });
    ['hurricane-paths', 'path-points', 'path-endpoints', 'path-arrows'].forEach(source => {
      if (mapInstance.getSource(source)) mapInstance.removeSource(source)
    });

    const features = hurricaneData.map(hurricane => {
      const maxWind = Math.max(...hurricane.path.map(p => p.wind))
      const category = getHurricaneCategory(maxWind)
      
      return {
        type: 'Feature' as const,
        properties: {
          id: hurricane.id,
          displayName: `${hurricane.id} (${hurricane.name})`,
          year: hurricane.year,
          maxWind: maxWind,
          category: category
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: hurricane.path.map(point => [point.lon, point.lat])
        }
      }
    })

    const endpointFeatures = hurricaneData.flatMap(hurricane => {
      const path = hurricane.path
      const category = getHurricaneCategory(Math.max(...path.map(p => p.wind)))
      
      return [
        {
          type: 'Feature' as const,
          properties: { category },
          geometry: {
            type: 'Point' as const,
            coordinates: [path[0].lon, path[0].lat]
          }
        },
        {
          type: 'Feature' as const,
          properties: { category },
          geometry: {
            type: 'Point' as const,
            coordinates: [path[path.length - 1].lon, path[path.length - 1].lat]
          }
        }
      ]
    })

    // Create arrow features using line segments
    const arrowFeatures = hurricaneData.flatMap(hurricane => {
      const path = hurricane.path
      const category = getHurricaneCategory(Math.max(...path.map(p => p.wind)))
      
      return path.slice(0, -1).map((point, i) => {
        const nextPoint = path[i + 1]
        
        // Calculate distance between points
        const dx = nextPoint.lon - point.lon
        const dy = nextPoint.lat - point.lat
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        // Skip very short segments
        if (distance < 0.1) return null

        // Calculate midpoint
        const midX = (point.lon + nextPoint.lon) / 2
        const midY = (point.lat + nextPoint.lat) / 2

        // Calculate normalized direction vector
        const dirX = (nextPoint.lon - point.lon) / distance
        const dirY = (nextPoint.lat - point.lat) / distance

        // Create arrow head points
        const arrowLength = 0.15  // Adjust this to change arrow size
        const arrowWidth = 0.08   // Adjust this to change arrow width
        
        // Arrow head coordinates
        const tip = [midX + dirX * arrowLength/2, midY + dirY * arrowLength/2]
        const back = [midX - dirX * arrowLength/2, midY - dirY * arrowLength/2]
        const left = [
          back[0] - dirY * arrowWidth,
          back[1] + dirX * arrowWidth
        ]
        const right = [
          back[0] + dirY * arrowWidth,
          back[1] - dirX * arrowWidth
        ]

        return {
          type: 'Feature' as const,
          properties: { category },
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              left,
              tip,
              right
            ]
          }
        }
      }).filter(feature => feature !== null)
    })

    mapInstance.addSource('hurricane-paths', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features }
    })

    mapInstance.addSource('path-endpoints', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: endpointFeatures }
    })

    mapInstance.addSource('path-arrows', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: arrowFeatures }
    })

    mapInstance.addLayer({
      id: 'hurricane-paths-hit-area',
      type: 'line',
      source: 'hurricane-paths',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#000',
        'line-width': 15,
        'line-opacity': 0
      }
    })

    mapInstance.addLayer({
      id: 'hurricane-paths',
      type: 'line',
      source: 'hurricane-paths',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': [
          'match',
          ['get', 'category'],
          5, '#7e22ce',
          4, '#dc2626',
          3, '#ea580c',
          2, '#ca8a04',
          1, '#65a30d',
          '#6b7280'
        ],
        'line-width': hurricaneData.length === 1 ? 3 : 2,
        'line-opacity': 0.8
      }
    })

    mapInstance.addLayer({
      id: 'path-endpoints',
      type: 'circle',
      source: 'path-endpoints',
      paint: {
        'circle-radius': 4,
        'circle-color': [
          'match',
          ['get', 'category'],
          5, '#7e22ce',
          4, '#dc2626',
          3, '#ea580c',
          2, '#ca8a04',
          1, '#65a30d',
          '#6b7280'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    })

    // Replace the symbol layer with a line layer for arrows
    mapInstance.addLayer({
      id: 'path-arrows',
      type: 'line',
      source: 'path-arrows',
      layout: {
        'line-join': 'miter',
        'line-cap': 'butt'
      },
      paint: {
        'line-color': [
          'match',
          ['get', 'category'],
          5, '#7e22ce',
          4, '#dc2626',
          3, '#ea580c',
          2, '#ca8a04',
          1, '#65a30d',
          '#6b7280'
        ],
        'line-width': hurricaneData.length === 1 ? 3 : 2,
        'line-opacity': 0.8
      }
    })

    if (hurricaneData.length === 1) {
      const pointFeatures = hurricaneData[0].path.map((point, index) => ({
        type: 'Feature' as const,
        properties: {
          wind: point.wind,
          pressure: point.pressure,
          category: getHurricaneCategory(point.wind),
          timestamp: point.time
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [point.lon, point.lat]
        }
      }))

      mapInstance.addSource('path-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pointFeatures
        }
      })

      mapInstance.addLayer({
        id: 'path-points',
        type: 'circle',
        source: 'path-points',
        paint: {
          'circle-radius': 5,
          'circle-color': [
            'match',
            ['get', 'category'],
            5, '#7e22ce',
            4, '#dc2626',
            3, '#ea580c',
            2, '#ca8a04',
            1, '#65a30d',
            '#6b7280'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      })
    }

    // Update the path-arrows layer visibility based on state
    if (mapInstance.getLayer('path-arrows')) {
      mapInstance.setLayoutProperty(
        'path-arrows',
        'visibility',
        showArrows ? 'visible' : 'none'
      )
    }
  }

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-85, 28],
        zoom: 4
      })

      popup.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })

      map.current = newMap

      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right')

      newMap.on('style.load', () => {
        map.current = newMap
        
        if (hurricaneData.length > 0) {
          updateMapData(newMap)
        }
        
        // Add event handlers after the layers are created
        // Handler for the hit area
        newMap.on('mouseenter', 'hurricane-paths-hit-area', (e) => {
          if (!e.features?.[0]) return
          newMap.getCanvas().style.cursor = 'pointer'
          
          const coordinates = e.lngLat
          const props = e.features[0].properties as HurricaneProperties

          const popupContent = `
            <div class="p-3">
              <h3 class="font-bold">${props.displayName}</h3>
              <div class="text-sm">
                <div>Year: ${props.year}</div>
                <div>Max Wind: ${props.maxWind} knots</div>
                <div>Category: ${props.category}</div>
              </div>
            </div>
          `

          popup.current?.setLngLat(coordinates).setHTML(popupContent).addTo(newMap)
        })

        newMap.on('mouseleave', 'hurricane-paths-hit-area', () => {
          newMap.getCanvas().style.cursor = ''
          popup.current?.remove()
        })

        newMap.on('click', 'hurricane-paths-hit-area', (e) => {
          if (!e.features?.[0]) return
          e.preventDefault()
          const props = e.features[0].properties as HurricaneProperties
          const clickedHurricane = hurricaneData.find(h => h.id === props.id)
          if (clickedHurricane) {
            const event = new CustomEvent('hurricaneSelect', { 
              detail: clickedHurricane 
            })
            window.dispatchEvent(event)
          }
        })

        // Add click handler for the map to deselect
        newMap.on('click', (e) => {
          if (!e.defaultPrevented) {
            const event = new CustomEvent('hurricaneSelect', { 
              detail: null 
            })
            window.dispatchEvent(event)
          }
        })
      })
    }
  }, []) // Only run on mount

  // Separate effect for data updates
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      updateMapData(map.current)
    }
  }, [hurricaneData, showArrows])

  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    cityMarkers.current.forEach(marker => marker.remove())
    cityMarkers.current = []

    // If a city is selected, add its marker
    if (selectedCity) {
      const city = cities.find(c => c.name === selectedCity)
      if (city) {
        const marker = new mapboxgl.Marker({
          color: '#3B82F6',
          scale: 1.1
        })
          .setLngLat([city.coordinates[1], city.coordinates[0]])
          .addTo(map.current)

        cityMarkers.current.push(marker)
      }
    }
  }, [selectedCity, cities])

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    if (map.current) {
      if (map.current.getLayer('path-arrows')) {
        map.current.setLayoutProperty(
          'path-arrows',
          'visibility',
          showArrows ? 'visible' : 'none'
        )
      }
    }
  }, [showArrows])

  const handleHurricaneSelect = (hurricane: Hurricane | null) => {
    const event = new CustomEvent('hurricaneSelect', { 
      detail: hurricane 
    })
    window.dispatchEvent(event)
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
      <DirectionToggle visible={showArrows} onChange={setShowArrows} />
      <Legend />
      <HurricaneSearch 
        hurricanes={hurricaneData} 
        onSelect={handleHurricaneSelect}
      />
    </div>
  )
}

function getHurricaneCategory(windSpeed: number): number {
  if (windSpeed >= 157) return 5
  if (windSpeed >= 130) return 4
  if (windSpeed >= 111) return 3
  if (windSpeed >= 96) return 2
  if (windSpeed >= 74) return 1
  return 0
} 