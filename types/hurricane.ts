export interface HurricanePoint {
  lat: number
  lon: number
  time: string
  type: string
  wind: number
  pressure: number
}

export interface Hurricane {
  id: string
  name: string
  year: number
  ace: number
  max_wind: number
  min_pressure: number
  start_time: string
  end_time: string
  path: HurricanePoint[]
} 