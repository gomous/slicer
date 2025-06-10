import React from 'react';
import { Settings } from 'lucide-react';
import { useSlicerStore } from '../hooks/useSlicerStore';

export const ParameterForm: React.FC = () => {
  const { parameters, updateParameters } = useSlicerStore();

  const infillPatterns = [
    { value: 'grid', label: 'Grid' },
    { value: 'lines', label: 'Lines' },
    { value: 'gyroid', label: 'Gyroid' },
    { value: 'honeycomb', label: 'Honeycomb' },
    { value: 'triangles', label: 'Triangles' },
  ];

  const nozzleSizes = [0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Print Settings</h3>
      </div>

      <div className="space-y-4">
        {/* Layer Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Layer Height (mm)
          </label>
          <input
            type="number"
            min="0.1"
            max="0.5"
            step="0.05"
            value={parameters.layerHeight}
            onChange={(e) => updateParameters({ layerHeight: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lower values = higher quality, longer print time
          </p>
        </div>

        {/* Infill Pattern */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Infill Pattern
          </label>
          <select
            value={parameters.infillPattern}
            onChange={(e) => updateParameters({ infillPattern: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {infillPatterns.map((pattern) => (
              <option key={pattern.value} value={pattern.value}>
                {pattern.label}
              </option>
            ))}
          </select>
        </div>

        {/* Infill Density */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Infill Density: {parameters.infillDensity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={parameters.infillDensity}
            onChange={(e) => updateParameters({ infillDensity: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Nozzle Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nozzle Size (mm)
          </label>
          <select
            value={parameters.nozzleSize}
            onChange={(e) => updateParameters({ nozzleSize: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {nozzleSizes.map((size) => (
              <option key={size} value={size}>
                {size}mm
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};