import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, ThreeEvent, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { useSlicerStore } from '../hooks/useSlicerStore';
import { useFileUploadStore } from '../hooks/useFileUploadStore';
import { STLModel, STLModelHandle } from './STLModel';
import { CentralFileDrop } from './CentralFileDrop';
import { PlusSquare, Grid2x2, Monitor, Layout, FileText, Move, RotateCw, SquareStack, Square, Layers, Crop, Type, Droplet, Ruler, Puzzle } from 'lucide-react';
import * as THREE from 'three';
import { Vector3, Mesh, MeshStandardMaterial } from 'three';

const LoadingSpinner: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-sm text-gray-600">Loading 3D model...</p>
    </div>
  </div>
);

const toolbarIcons = [
  <PlusSquare key="plus" />, <Grid2x2 key="grid" />, <Monitor key="monitor" />, <Layout key="layout" />, <FileText key="file" />,
  <Move key="move" className="text-blue-600" />, <RotateCw key="rotate" />, <SquareStack key="stack" />, <Square key="square" />, <Layers key="layers" />,
  <Crop key="crop" />, <Type key="type" />, <Droplet key="droplet" />, <Ruler key="ruler" />, <Puzzle key="puzzle" />
];

const InteractiveModel = ({ file, onLoadComplete, onLoadError }: { file: File; onLoadComplete?: () => void; onLoadError?: (error: string) => void }) => {
  const stlRef = useRef<STLModelHandle>(null);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    stlRef.current?.setColor('#60A5FA');
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    stlRef.current?.setColor('#3B82F6');
  };

  return (
    <STLModel
      ref={stlRef}
      file={file}
      onLoadComplete={onLoadComplete}
      onLoadError={onLoadError}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
};

export const ModelViewer: React.FC = () => {
  const { fileState, setFile, setPreview, setFileLoading } = useSlicerStore();
  const { addFile } = useFileUploadStore();
  const [moveMode, setMoveMode] = useState(false);
  const [modelPosition, setModelPosition] = useState<[number, number, number]>([0, 0, 0]);
  const dragStart = useRef<{ x: number; y: number; pos: [number, number, number] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadComplete = () => {
    setFileLoading(false);
    setIsLoading(false);
  };

  const handleLoadError = (error: string) => {
    setFileLoading(false);
    setIsLoading(false);
    setError(error);
    console.error('STL Load Error:', error);
  };

  const handleStlFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.stl')) {
      return;
    }
    setFileLoading(true);
    setFile(file);
    addFile(file);
    if (fileState.preview) {
      URL.revokeObjectURL(fileState.preview);
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  // Handle mouse events for moving the model
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!moveMode) return;
    e.stopPropagation();
    
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      pos: [...modelPosition],
    };
    
    // Use pointer events instead of mouse events
    document.addEventListener('pointermove', handlePointerMove as EventListener);
    document.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragStart.current) return;
    
    // Calculate movement based on pointer pressure and type
    const pressure = e.pressure || 0.5; // Fallback if pressure is not supported
    const dx = (e.clientX - dragStart.current.x) * 0.01 * pressure;
    const dy = (e.clientY - dragStart.current.y) * 0.01 * pressure;
    
    setModelPosition([
      dragStart.current.pos[0] + dx,
      dragStart.current.pos[1] - dy,
      dragStart.current.pos[2],
    ]);
  };

  const handlePointerUp = (e: PointerEvent) => {
    dragStart.current = null;
    document.removeEventListener('pointermove', handlePointerMove as EventListener);
    document.removeEventListener('pointerup', handlePointerUp);
  };

  return (
    <div className="relative h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
      {/* Floating Toolbar */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-white shadow-lg rounded-lg px-3 py-1 border border-gray-200" style={{ pointerEvents: 'auto' }}>
        {toolbarIcons.map((icon, i) => (
          <button
            key={i}
            className={`p-1.5 rounded hover:bg-gray-100 text-gray-500 ${i === 5 ? (moveMode ? 'bg-blue-100 text-blue-600' : 'text-blue-600') : ''}`}
            disabled={!fileState.file || (moveMode ? i !== 5 : (i > 3 && i !== toolbarIcons.length - 1))}
            onClick={() => {
              if (i === 5) setMoveMode(m => !m);
            }}
            title={i === 5 ? (moveMode ? 'Exit Move Mode' : 'Move Model') : undefined}
          >
            {icon}
          </button>
        ))}
      </div>
      {!fileState.file ? (
        <CentralFileDrop
          accept=".stl"
          onFile={handleStlFile}
          message="Upload STL file here"
        />
      ) : (
        <div style={{ cursor: moveMode ? 'grab' : 'auto', width: '100%', height: '100%' }}>
          <Canvas
            camera={{ position: [5, 5, 5], fov: 50 }}
            style={{ background: 'transparent', width: '100%', height: '100%' }}
          >
            <Suspense fallback={
              <mesh rotation={[0, 0, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#94A3B8" transparent opacity={0.5} />
              </mesh>
            }>
              <Environment preset="studio" />
              <ambientLight intensity={0.4} />
              <directionalLight position={[10, 10, 5]} intensity={0.8} />
              <directionalLight position={[-10, -10, -5]} intensity={0.3} />
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
              <group
                position={modelPosition}
                onPointerDown={handlePointerDown}
              >
                <InteractiveModel 
                  file={fileState.file}
                  onLoadComplete={handleLoadComplete}
                  onLoadError={handleLoadError}
                />
              </group>
              <OrbitControls
                enablePan={!moveMode}
                enableZoom={true}
                enableRotate={!moveMode}
                minDistance={2}
                maxDistance={20}
              />
            </Suspense>
          </Canvas>
        </div>
      )}
      
      {isLoading && <LoadingSpinner />}
    </div>
  );
};