import { useEffect, useRef } from 'react'
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
    <h4 style={{ fontWeight: '600', marginBottom: '8px' }}>Hurricane Categories</h4>
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
    </div>
  </div>
)

export default function Map({ hurricaneData, selectedCity, cities }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const popup = useRef<mapboxgl.Popup | null>(null)
  const cityMarkers = useRef<mapboxgl.Marker[]>([])

  const updateMapData = (mapInstance: mapboxgl.Map) => {
    if (!mapInstance.isStyleLoaded()) {
      setTimeout(() => updateMapData(mapInstance), 100)
      return
    }

    // Remove existing layers and sources
    ['hurricane-paths', 'hurricane-paths-hit-area', 'path-points'].forEach(layer => {
      if (mapInstance.getLayer(layer)) mapInstance.removeLayer(layer)
    });
    ['hurricane-paths', 'path-points'].forEach(source => {
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

    mapInstance.addSource('hurricane-paths', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    })

    // Add a wider invisible line for better hit detection
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

    // Original visible line on top
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

    // Add the point features if needed
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
  }

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-90, 25],
        zoom: 5
      })

      popup.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })

      map.current = newMap

      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right')

      newMap.on('style.load', () => {
        updateMapData(newMap)
        
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
    } else if (map.current) {
      updateMapData(map.current)
    }

    return () => {
      popup.current?.remove()
    }
  }, [])

  useEffect(() => {
    if (map.current) {
      updateMapData(map.current)
    }
  }, [hurricaneData])

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
          scale: 1.2
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

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
      <Legend />
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