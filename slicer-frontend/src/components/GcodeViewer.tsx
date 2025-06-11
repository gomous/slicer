import React, { useRef, useState, useEffect } from 'react';
import * as GCodePreview from 'gcode-preview';
import { CentralFileDrop } from './CentralFileDrop';
import { useGcodeStore } from '../hooks/useGcodeStore';

export const GcodeViewer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gcodeFile, setGcodeFile } = useGcodeStore();
  const [error, setError] = useState<string>('');

  const renderGcode = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const gcode = event.target?.result as string;
      if (canvasRef.current && gcode) {
        canvasRef.current.width = canvasRef.current.width;
        GCodePreview.init({
          canvas: canvasRef.current,
          extrusionColor: 'hotpink',
          extrusionType: 'tube',
          tubeDiameter: 1.5,
        }).processGCode(gcode);
      }
    };
    reader.readAsText(file);
  };

  const handleGcodeFile = (file: File) => {
    setError('');
    if (!file.name.endsWith('.gcode')) {
      setError('Please upload a .gcode file.');
      return;
    }
    setGcodeFile(file);
    renderGcode(file);
  };

  useEffect(() => {
    if (gcodeFile) {
      renderGcode(gcodeFile);
    }
    // eslint-disable-next-line
  }, [gcodeFile]);

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
      {!gcodeFile ? (
        <CentralFileDrop
          accept=".gcode"
          onFile={handleGcodeFile}
          message="Upload G-code file here"
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full"
        />
      )}
      {error && <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-red-500 bg-white px-4 py-2 rounded shadow">{error}</p>}
    </div>
  );
}; 