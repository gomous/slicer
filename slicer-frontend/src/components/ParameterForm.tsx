import React from 'react';
import { Settings, Printer, Layers, SlidersHorizontal, ChevronDown, ChevronRight } from 'lucide-react';

export const ParameterForm: React.FC = () => {
  // For now, static UI only
  return (
    <div className="space-y-4 text-[15px]">
      {/* Printer Section */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center mb-2">
          <Printer className="h-5 w-5 text-gray-500 mr-2" />
          <span className="font-semibold text-gray-800">Printer</span>
          <button className="ml-auto text-gray-400 hover:text-gray-600"><Settings className="h-4 w-4" /></button>
        </div>
        <div className="space-y-2">
          <select className="w-full border rounded px-2 py-1 text-sm" defaultValue="Bambu Lab A1 0.4 nozzle">
            <option>Bambu Lab A1 0.4 nozzle</option>
          </select>
          <select className="w-full border rounded px-2 py-1 text-sm" defaultValue="Textured PEI Plate">
            <option>Textured PEI Plate</option>
          </select>
        </div>
      </div>
      {/* Filament Section */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center mb-2">
          <Layers className="h-5 w-5 text-gray-500 mr-2" />
          <span className="font-semibold text-gray-800">Filament</span>
          <button className="ml-auto text-gray-400 hover:text-gray-600"><Settings className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <span className="bg-green-500 text-white rounded px-2 py-0.5 text-xs font-semibold">1</span>
          <input className="flex-1 border rounded px-2 py-1 text-sm" defaultValue="Bambu PLA Basic" readOnly />
        </div>
      <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-gray-600"><ChevronDown className="h-4 w-4" /></button>
          <button className="text-gray-400 hover:text-gray-600"><ChevronRight className="h-4 w-4" /></button>
          <button className="text-gray-400 hover:text-gray-600"><Settings className="h-4 w-4" /></button>
        </div>
      </div>
      {/* Process Section */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center mb-2">
          <SlidersHorizontal className="h-5 w-5 text-gray-500 mr-2" />
          <span className="font-semibold text-gray-800">Process</span>
          <span className="ml-2 text-xs bg-green-100 text-green-700 rounded px-2 py-0.5 font-medium">Global</span>
          <span className="ml-2 text-xs text-gray-400">Objects</span>
          <span className="ml-auto text-xs text-gray-500">Advanced <input type="checkbox" className="ml-1" readOnly /></span>
        </div>
        <select className="w-full border rounded px-2 py-1 text-sm mb-2" defaultValue="0.20mm Standard @BBL A1">
          <option>0.20mm Standard @BBL A1</option>
          </select>
        {/* Tabs */}
        <div className="flex space-x-4 border-b mb-2">
          <button className="pb-1 border-b-2 border-green-600 text-green-700 font-semibold">Quality</button>
          <button className="pb-1 text-gray-500">Strength</button>
          <button className="pb-1 text-gray-500">Support</button>
          <button className="pb-1 text-gray-500">Others</button>
        </div>
        {/* Quality Tab Content */}
        <div className="space-y-4 mt-2">
          {/* Layer Height */}
        <div>
            <div className="font-semibold text-gray-700 flex items-center mb-1"><span className="mr-2">Layer height</span></div>
            <div className="flex space-x-2 items-center mb-1">
              <label className="text-sm text-gray-600">Layer height</label>
              <input type="number" className="w-16 border rounded px-2 py-1 text-sm ml-2" defaultValue="0.2" readOnly />
              <span className="ml-1 text-xs text-gray-500">mm</span>
            </div>
            <div className="flex space-x-2 items-center">
              <label className="text-sm text-gray-600">Initial layer height</label>
              <input type="number" className="w-16 border rounded px-2 py-1 text-sm ml-2" defaultValue="0.2" readOnly />
              <span className="ml-1 text-xs text-gray-500">mm</span>
            </div>
          </div>
          {/* Seam */}
          <div>
            <div className="font-semibold text-gray-700 flex items-center mb-1">Seam</div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Seam position</label>
              <select className="border rounded px-2 py-1 text-sm ml-2" defaultValue="Aligned">
                <option>Aligned</option>
              </select>
          </div>
        </div>
          {/* Advanced */}
        <div>
            <div className="font-semibold text-gray-700 flex items-center mb-1">Advanced</div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="text-sm text-gray-600">Only one wall on top surfaces</label>
              <select className="border rounded px-2 py-1 text-sm ml-2" defaultValue="Top surfaces">
                <option>Top surfaces</option>
          </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Only one wall on first layer</label>
              <input type="checkbox" className="ml-2" readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};