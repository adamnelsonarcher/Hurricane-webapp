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
  path: HurricanePoint[]
} 