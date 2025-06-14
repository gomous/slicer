import React, { useEffect, useRef, useState } from 'react';
import * as GCodePreview from 'gcode-preview';
import { useGcodeStore } from '../hooks/useGcodeStore';
import { Loader2, ZoomIn, ZoomOut, RotateCcw, Maximize2, Layers } from 'lucide-react';

interface ExtrusionGeometry {
  vertices: Float32Array;
  indices: Uint32Array;
  colors: Float32Array;
  layerCount: number;
}

interface Path {
  points: Float32Array;
  colors: Float32Array;
  layerIndex: number;
  type: 'Travel' | 'Extrusion';
}

const GcodeViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gcodeFile, getCachedGcode } = useGcodeStore();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllLayers, setShowAllLayers] = useState(true);
  const [showTravelMoves, setShowTravelMoves] = useState(false);
  const [showExtrusions, setShowExtrusions] = useState(true);
  const [layerCount, setLayerCount] = useState<number>(0);
  const [verticalValue, setVerticalValue] = useState(50);
  const [horizontalValue, setHorizontalValue] = useState(50);

  const renderGcode = async (file: File) => {
    if (!canvasRef.current) return;

    setIsLoading(true);
    try {
      // Check if we have a cached version of this file
      const cachedFile = getCachedGcode(file.name);
      const fileToUse = cachedFile || file;

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result || !canvasRef.current) return;

        const gcode = e.target.result as string;
        const newPreview = GCodePreview.init({
          canvas: canvasRef.current,
          extrusionColor: '#3B82F6',
          extrusionType: 'tube',
          tubeDiameter: 1.5
        });

        try {
          await newPreview.processGCode(gcode);
          // Set a larger far plane for the camera
          (newPreview as any).camera.far = 10000;
          (newPreview as any).camera.updateProjectionMatrix();
          setPreview(newPreview);
          setLayerCount((newPreview as any).countLayers || 0);
          setError(null);
        } catch (err) {
          console.error('Error processing G-code:', err);
          setError('Error processing G-code. Please try again.');
        }
      };

      reader.onerror = () => {
        setError('Error reading G-code file');
      };

      reader.readAsText(fileToUse);
    } catch (err) {
      console.error('Error rendering G-code:', err);
      setError('Error rendering G-code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (gcodeFile) {
      renderGcode(gcodeFile);
    }
  }, [gcodeFile]);

  const handleZoomIn = () => {
    if (preview) {
      preview.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (preview) {
      preview.zoomOut();
    }
  };

  const handleReset = () => {
    if (preview) {
      preview.resetCamera();
    }
  };

  const handleFit = () => {
    if (preview) {
      preview.fitToView();
    }
  };

  const handleLayerChange = (layerIndex: number) => {
    if (preview) {
      preview.startLayer = layerIndex + 1;
      preview.endLayer = layerIndex + 1;
      preview.render();
    }
  };

  const handleToggleAllLayers = () => {
    setShowAllLayers(!showAllLayers);
    if (preview) {
      if (!showAllLayers) {
        preview.startLayer = undefined;
        preview.endLayer = undefined;
      } else {
        preview.startLayer = 1;
        preview.endLayer = 1;
      }
      preview.render();
    }
  };

  const handleToggleTravelMoves = () => {
    setShowTravelMoves(!showTravelMoves);
    if (preview) {
      preview.renderTravel = !showTravelMoves;
      preview.render();
    }
  };

  const handleToggleExtrusions = () => {
    setShowExtrusions(!showExtrusions);
    if (preview) {
      preview.renderExtrusion = !showExtrusions;
      preview.render();
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-red-500 text-center p-4">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading G-code preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-100">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
          title="Reset View"
        >
          <RotateCcw className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
          title="Fit to View"
        >
          <Maximize2 className="h-5 w-5 text-gray-600" />
        </button>
        <button
          onClick={handleToggleAllLayers}
          className={`p-2 rounded-lg shadow hover:bg-gray-50 ${showAllLayers ? 'bg-blue-100' : 'bg-white'}`}
          title={showAllLayers ? "Show Current Layer" : "Show All Layers"}
        >
          <Layers className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow p-4 space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Display Options</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showTravelMoves}
                onChange={handleToggleTravelMoves}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-600">Show Travel Moves</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showExtrusions}
                onChange={handleToggleExtrusions}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-600">Show Extrusions</span>
            </label>
          </div>
        </div>
      </div>
      <div
  className="absolute top-0 bottom-0 right-4 flex items-center justify-center"
  style={{ width: '32px' }}
>
  <input
    type="range"
    min={0}
    max={100}
    value={verticalValue}
    onChange={e => setVerticalValue(Number(e.target.value))}
    className="slider-vertical"
    style={{
      transform: 'rotate(-90deg)',
      width: '500px', // Make this larger for a longer slider
      height: '32px',
    }}
  />
</div>



      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex justify-center" style={{width: '75%', height: '32px'}}>
        <input
          type="range"
          min={0}
          max={100}
          value={horizontalValue}
          onChange={e => setHorizontalValue(Number(e.target.value))}
          className="slider-horizontal"
          style={{ width: '75%', height: '32px' }}
        />
      </div>
    </div>
  );
};

export default GcodeViewer; 