import React, { useEffect, useRef, useState } from 'react';
import * as GCodePreview from 'gcode-preview';
import { useGcodeStore } from '../hooks/useGcodeStore';

const GcodeViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gcodeFile } = useGcodeStore();
  const [error, setError] = useState<string | null>(null);

  const renderGcode = async (file: File) => {
    if (!canvasRef.current) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result || !canvasRef.current) return;

        const gcode = e.target.result as string;
        const preview = GCodePreview.init({
          canvas: canvasRef.current,
          extrusionColor: '#3B82F6',
          extrusionType: 'tube',
          tubeDiameter: 1.5
        });

        try {
          await preview.processGCode(gcode);
          setError(null);
        } catch (err) {
          console.error('Error processing G-code:', err);
          setError('Error processing G-code. Please try again.');
        }
      };

      reader.onerror = () => {
        setError('Error reading G-code file');
      };

      reader.readAsText(file);
    } catch (err) {
      console.error('Error rendering G-code:', err);
      setError('Error rendering G-code. Please try again.');
    }
  };

  useEffect(() => {
    if (gcodeFile) {
      renderGcode(gcodeFile);
    }
  }, [gcodeFile]);

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

  return (
    <div className="w-full h-full bg-gray-100">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default GcodeViewer; 