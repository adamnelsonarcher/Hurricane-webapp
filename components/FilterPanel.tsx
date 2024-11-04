import { useState } from 'react'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

interface FilterPanelProps {
  yearRange: [number, number]
  intensityRange: [number, number]
  categoryRange: [number, number]
  onYearChange: (range: [number, number]) => void
  onIntensityChange: (range: [number, number]) => void
  onCategoryChange: (range: [number, number]) => void
  onApply: () => void
  onReset: () => void
}

export default function FilterPanel({
  yearRange,
  intensityRange,
  categoryRange,
  onYearChange,
  onIntensityChange,
  onCategoryChange,
  onApply,
  onReset
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Year Range: {yearRange[0]} - {yearRange[1]}
        </label>
        <div className="px-2">
          <Slider
            range
            min={1999}
            max={2024}
            value={yearRange}
            onChange={(value: number | number[]) => {
              if (Array.isArray(value) && value.length === 2) {
                onYearChange([value[0], value[1]])
              }
            }}
            className="mt-2"
            railStyle={{ backgroundColor: '#E5E7EB' }}
            trackStyle={[{ backgroundColor: '#3B82F6' }]}
            handleStyle={[
              { borderColor: '#3B82F6', backgroundColor: '#fff' },
              { borderColor: '#3B82F6', backgroundColor: '#fff' }
            ]}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wind Intensity (knots): {intensityRange[0]} - {intensityRange[1]}
        </label>
        <div className="px-2">
          <Slider
            range
            min={0}
            max={200}
            value={intensityRange}
            onChange={(value: number | number[]) => {
              if (Array.isArray(value) && value.length === 2) {
                onIntensityChange([value[0], value[1]])
              }
            }}
            className="mt-2"
            railStyle={{ backgroundColor: '#E5E7EB' }}
            trackStyle={[{ backgroundColor: '#3B82F6' }]}
            handleStyle={[
              { borderColor: '#3B82F6', backgroundColor: '#fff' },
              { borderColor: '#3B82F6', backgroundColor: '#fff' }
            ]}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hurricane Category: {categoryRange[0]} - {categoryRange[1]}
        </label>
        <div className="px-2">
          <Slider
            range
            min={0}
            max={5}
            step={1}
            value={categoryRange}
            onChange={(value: number | number[]) => {
              if (Array.isArray(value) && value.length === 2) {
                onCategoryChange([value[0], value[1]])
              }
            }}
            className="mt-2"
            railStyle={{ backgroundColor: '#E5E7EB' }}
            trackStyle={[{ backgroundColor: '#3B82F6' }]}
            handleStyle={[
              { borderColor: '#3B82F6', backgroundColor: '#fff' },
              { borderColor: '#3B82F6', backgroundColor: '#fff' }
            ]}
            marks={{
              0: 'TD',
              1: 'C1',
              2: 'C2',
              3: 'C3',
              4: 'C4',
              5: 'C5'
            }}
          />
        </div>
      </div>

      <div className="btn-group">
        <button
          onClick={onApply}
          className="btn btn-primary"
        >
          Apply Filters
        </button>
        <button
          onClick={onReset}
          className="btn btn-secondary"
        >
          Reset
        </button>
      </div>
    </div>
  )
} 