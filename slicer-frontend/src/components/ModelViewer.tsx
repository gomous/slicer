import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { useSlicerStore } from '../hooks/useSlicerStore';
import { STLModel } from './STLModel';
import { CentralFileDrop } from './CentralFileDrop';

const LoadingSpinner: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-sm text-gray-600">Loading 3D model...</p>
    </div>
  </div>
);

const ModelLoadingFallback: React.FC = () => (
  <mesh position={[0, 0, 0]}>
    <boxGeometry args={[0.1, 0.1, 0.1]} />
    <meshStandardMaterial color="#94A3B8" transparent opacity={0.5} />
  </mesh>
);

export const ModelViewer: React.FC = () => {
  const { fileState, setFile, setPreview, setFileLoading } = useSlicerStore();

  const handleLoadComplete = () => {
    setFileLoading(false);
  };

  const handleLoadError = (error: string) => {
    setFileLoading(false);
    console.error('STL Load Error:', error);
  };

  const handleStlFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.stl')) {
      return;
    }
    setFileLoading(true);
    setFile(file);
    if (fileState.preview) {
      URL.revokeObjectURL(fileState.preview);
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  return (
    <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
      {!fileState.file ? (
        <CentralFileDrop
          accept=".stl"
          onFile={handleStlFile}
          message="Upload STL file here"
        />
      ) : (
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={<ModelLoadingFallback />}>
            <Environment preset="studio" />
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
            <directionalLight position={[-10, -10, -5]} intensity={0.3} />
            
            {/* Grid */}
            <Grid
              args={[10, 10]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6B7280"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#374151"
              fadeDistance={25}
              fadeStrength={1}
              followCamera={false}
              infiniteGrid={true}
            />
            
            {/* STL Model */}
            <STLModel 
              file={fileState.file}
              onLoadComplete={handleLoadComplete}
              onLoadError={handleLoadError}
            />
            
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={20}
            />
          </Suspense>
        </Canvas>
      )}
      
      {fileState.isLoading && <LoadingSpinner />}
    </div>
  );
};