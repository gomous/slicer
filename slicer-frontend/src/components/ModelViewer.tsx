import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { useSlicerStore } from '../hooks/useSlicerStore';
import { STLModel } from './STLModel';

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
  const { fileState, setFileLoading } = useSlicerStore();

  const handleLoadComplete = () => {
    setFileLoading(false);
  };

  const handleLoadError = (error: string) => {
    setFileLoading(false);
    console.error('STL Load Error:', error);
  };

  return (
    <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
      {!fileState.file ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No model loaded</p>
            <p className="text-sm text-gray-400">Upload an STL file to preview</p>
          </div>
        </div>
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