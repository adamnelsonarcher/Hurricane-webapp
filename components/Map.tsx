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
}

interface HurricaneProperties {
  id: string;
  year: number;
  maxWind: number;
  minPressure: number;
}

export default function Map({ hurricaneData }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const popup = useRef<mapboxgl.Popup | null>(null)

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-90, 25],
        zoom: 5
      })

      popup.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      })

      map.current = newMap

      newMap.on('style.load', () => {
        // Add hover interactions
        newMap.on('mouseenter', 'hurricane-paths', (e) => {
          if (!e.features?.[0]) return
          newMap.getCanvas().style.cursor = 'pointer'
          
          const coordinates = e.lngLat
          const props = e.features[0].properties as HurricaneProperties

          const popupContent = `
            <div class="p-2">
              <h3 class="font-bold">Storm ${props.id}</h3>
              <div class="text-sm">
                <div>Year: ${props.year}</div>
                <div>Max Wind: ${props.maxWind} knots</div>
                <div>Min Pressure: ${props.minPressure} mb</div>
              </div>
            </div>
          `

          popup.current?.setLngLat(coordinates).setHTML(popupContent).addTo(newMap)
        })

        newMap.on('mouseleave', 'hurricane-paths', () => {
          newMap.getCanvas().style.cursor = ''
          popup.current?.remove()
        })

        // Initial data load
        updateMapData(newMap)
      })
    } else if (map.current) {
      updateMapData(map.current)
    }

    return () => {
      popup.current?.remove()
    }
  }, [hurricaneData])

  const updateMapData = (mapInstance: mapboxgl.Map) => {
    try {
      // Wait for the style to be fully loaded
      if (!mapInstance.isStyleLoaded()) {
        setTimeout(() => updateMapData(mapInstance), 100)
        return
      }

      // Clear existing layers and sources
      const existingLayers = mapInstance.getStyle()?.layers || []
      existingLayers.forEach(layer => {
        if (layer.id.startsWith('hurricane-')) {
          mapInstance.removeLayer(layer.id)
        }
      })

      const existingSources = Object.keys(mapInstance.getStyle()?.sources || {})
      existingSources.forEach(source => {
        if (source.startsWith('hurricane-')) {
          mapInstance.removeSource(source)
        }
      })

      // Add new data
      if (hurricaneData.length > 0) {
        const features = hurricaneData.map(hurricane => ({
          type: 'Feature' as const,
          properties: {
            id: hurricane.id,
            year: hurricane.year,
            maxWind: Math.max(...hurricane.path.map(p => p.wind)),
            minPressure: Math.min(...hurricane.path.map(p => p.pressure))
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: hurricane.path.map(point => [point.lon, point.lat])
          }
        }))

        if (!mapInstance.getSource('hurricane-paths')) {
          mapInstance.addSource('hurricane-paths', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features
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
              'line-color': '#FF0000',
              'line-width': 2,
              'line-opacity': 0.8
            }
          })
        } else {
          const source = mapInstance.getSource('hurricane-paths') as mapboxgl.GeoJSONSource
          source.setData({
            type: 'FeatureCollection',
            features
          })
        }
      }
    } catch (error) {
      console.error('Error updating map data:', error)
    }
  }

  return (
    <div ref={mapContainer} style={{ height: '100vh' }} />
  )
} 