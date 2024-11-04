import { Hurricane } from '../types/hurricane'

interface HurricaneDetailsProps {
  hurricane: Hurricane
}

export default function HurricaneDetails({ hurricane }: HurricaneDetailsProps) {
  const maxWind = Math.max(...hurricane.path.map(p => p.wind))
  const category = getHurricaneCategory(maxWind)
  const duration = hurricane.path.length

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 bg-blue-50 p-2 rounded-lg">
          <img 
            src={`/images/${category}.png`}
            alt={`Category ${category}`}
            className="w-8 h-8"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900">
              {hurricane.name}
            </h3>
            <span className="text-sm text-gray-500">
              {hurricane.year}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Max Wind Speed:</span>
              <span className="font-medium">{maxWind} mph</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Category:</span>
              <span className="font-medium">{category}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Duration:</span>
              <span className="font-medium">{duration} days</span>
            </div>
          </div>
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