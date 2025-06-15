import React from 'react';

interface TransformControlsUIProps {
  mode: 'translate' | 'rotate' | 'scale';
  space: 'world' | 'local';
  showX: boolean;
  showY: boolean;
  showZ: boolean;
  onModeChange: (mode: 'translate' | 'rotate' | 'scale') => void;
  onSpaceChange: (space: 'world' | 'local') => void;
  onAxisToggle: (axis: 'x' | 'y' | 'z') => void;
}

export const TransformControlsUI: React.FC<TransformControlsUIProps> = ({
  mode,
  space,
  showX,
  showY,
  showZ,
  onModeChange,
  onSpaceChange,
  onAxisToggle
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onModeChange('translate')}
          className={`p-2 rounded-md ${mode === 'translate' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          title="Translate (W)"
        >
          T
        </button>
        <button
          onClick={() => onModeChange('rotate')}
          className={`p-2 rounded-md ${mode === 'rotate' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          title="Rotate (E)"
        >
          R
        </button>
        <button
          onClick={() => onModeChange('scale')}
          className={`p-2 rounded-md ${mode === 'scale' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          title="Scale (R)"
        >
          S
        </button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-2" />

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onSpaceChange(space === 'world' ? 'local' : 'world')}
          className={`p-2 rounded-md ${space === 'local' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          title="Toggle World/Local Space (Q)"
        >
          {space === 'world' ? 'W' : 'L'}
        </button>
      </div>

      <div className="h-6 w-px bg-gray-300 mx-2" />

      <div className="flex items-center space-x-1">
        <button
          onClick={() => onAxisToggle('x')}
          className={`p-2 rounded-md ${showX ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          title="Toggle X Axis (X)"
        >
          X
        </button>
        <button
          onClick={() => onAxisToggle('y')}
          className={`p-2 rounded-md ${showY ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          title="Toggle Y Axis (Y)"
        >
          Y
        </button>
        <button
          onClick={() => onAxisToggle('z')}
          className={`p-2 rounded-md ${showZ ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          title="Toggle Z Axis (Z)"
        >
          Z
        </button>
      </div>
    </div>
  );
}; 