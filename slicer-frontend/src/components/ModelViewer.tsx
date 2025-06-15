import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Environment } from '@react-three/drei';
import { STLModel } from './STLModel';
import { useSlicerStore } from '../hooks/useSlicerStore';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { TransformControlsUI } from './TransformControlsUI';

interface ModelInstance {
  id: string;
  file: File;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

const InteractiveModel = ({ 
  modelInstance, 
  isSelected,
  onSelect,
  onTransformChange,
  transformMode,
  transformSpace,
  showX,
  showY,
  showZ,
  isShiftPressed
}: { 
  modelInstance: ModelInstance;
  isSelected: boolean;
  onSelect: () => void;
  onTransformChange: (position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  transformMode: 'translate' | 'rotate' | 'scale';
  transformSpace: 'world' | 'local';
  showX: boolean;
  showY: boolean;
  showZ: boolean;
  isShiftPressed: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const transformRef = useRef<any>(null);
  const { gl, camera, raycaster, mouse } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [activeAxis, setActiveAxis] = useState<'x' | 'y' | 'z' | null>(null);
  const lastMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update transform controls when mode or space changes
  useEffect(() => {
    if (transformRef.current) {
      transformRef.current.setMode(transformMode);
      transformRef.current.setSpace(transformSpace);
    }
  }, [transformMode, transformSpace]);

  // Update snap settings when shift key changes
  useEffect(() => {
    if (transformRef.current) {
      transformRef.current.setTranslationSnap(isShiftPressed ? 0.1 : null);
      transformRef.current.setRotationSnap(isShiftPressed ? Math.PI / 12 : null);
      transformRef.current.setScaleSnap(isShiftPressed ? 0.1 : null);
    }
  }, [isShiftPressed]);

  // Handle transform changes
  const handleTransformChange = () => {
    if (meshRef.current) {
      const position = meshRef.current.position.toArray() as [number, number, number];
      const rotation = meshRef.current.rotation.toArray() as [number, number, number];
      const scale = meshRef.current.scale.toArray() as [number, number, number];
      onTransformChange(position, rotation, scale);
    }
  };

  // Handle pointer events
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onSelect();
  };

  const handlePointerMissed = () => {
    if (isSelected && !isDragging) {
      onSelect();
    }
  };

  // Handle transform control events
  const handleTransformStart = (e: ThreeEvent<PointerEvent>) => {
    // Get the axis that was clicked
    const axis = e.object.name?.toLowerCase() as 'x' | 'y' | 'z';
    if (axis) {
      setActiveAxis(axis);
      setIsDragging(true);
      gl.domElement.style.cursor = 'grabbing';
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      window.addEventListener('pointerup', handleGlobalPointerUp);
      window.addEventListener('pointermove', handlePointerMove);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isDragging && activeAxis && meshRef.current) {
      const deltaX = e.clientX - lastMousePosition.current.x;
      const deltaY = e.clientY - lastMousePosition.current.y;
      lastMousePosition.current = { x: e.clientX, y: e.clientY };

      const speed = 0.01;
      if (transformMode === 'translate') {
        if (activeAxis === 'x') {
          meshRef.current.position.x += deltaX * speed;
        } else if (activeAxis === 'y') {
          meshRef.current.position.y -= deltaY * speed;
        } else if (activeAxis === 'z') {
          meshRef.current.position.z += deltaX * speed;
        }
        handleTransformChange();
      } else if (transformMode === 'rotate') {
        if (activeAxis === 'x') {
          meshRef.current.rotation.x += deltaY * speed;
        } else if (activeAxis === 'y') {
          meshRef.current.rotation.y += deltaX * speed;
        } else if (activeAxis === 'z') {
          meshRef.current.rotation.z += deltaX * speed;
        }
        handleTransformChange();
      } else if (transformMode === 'scale') {
        const scaleDelta = (deltaX + deltaY) * speed;
        if (activeAxis === 'x') {
          meshRef.current.scale.x += scaleDelta;
        } else if (activeAxis === 'y') {
          meshRef.current.scale.y += scaleDelta;
        } else if (activeAxis === 'z') {
          meshRef.current.scale.z += scaleDelta;
        }
        handleTransformChange();
      }
    }
  };

  const handleGlobalPointerUp = () => {
    setIsDragging(false);
    setActiveAxis(null);
    gl.domElement.style.cursor = 'auto';
    window.removeEventListener('pointerup', handleGlobalPointerUp);
    window.removeEventListener('pointermove', handlePointerMove);
  };

  // Cleanup global event listeners
  useEffect(() => {
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return (
    <group>
      <TransformControls
        ref={transformRef}
        mode={transformMode}
        space={transformSpace}
        showX={showX}
        showY={showY}
        showZ={showZ}
        enabled={isSelected}
        onObjectChange={handleTransformChange}
        onPointerDown={handleTransformStart}
        size={1.5}
        axis={activeAxis || undefined}
        translationSnap={isShiftPressed ? 0.1 : null}
        rotationSnap={isShiftPressed ? Math.PI / 12 : null}
        scaleSnap={isShiftPressed ? 0.1 : null}
      >
        <mesh
          ref={meshRef}
          position={modelInstance.position}
          rotation={modelInstance.rotation}
          scale={modelInstance.scale}
          onPointerDown={handlePointerDown}
          onPointerMissed={handlePointerMissed}
        >
          <STLModel file={modelInstance.file} />
        </mesh>
      </TransformControls>
    </group>
  );
};

const Scene = ({ 
  transformMode, 
  transformSpace, 
  showX, 
  showY, 
  showZ,
  isShiftPressed
}: { 
  transformMode: 'translate' | 'rotate' | 'scale';
  transformSpace: 'world' | 'local';
  showX: boolean;
  showY: boolean;
  showZ: boolean;
  isShiftPressed: boolean;
}) => {
  const { fileState } = useSlicerStore();
  const [models, setModels] = useState<ModelInstance[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const orbitControlsRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const processedFiles = useRef<Set<string>>(new Set());

  // Add new model when file is uploaded
  useEffect(() => {
    if (fileState.file) {
      const fileName = fileState.file.name;
      // Check if we've already processed this file
      if (!processedFiles.current.has(fileName)) {
        processedFiles.current.add(fileName);
        const newModel: ModelInstance = {
          id: Date.now().toString(),
          file: fileState.file,
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1]
        };
        setModels(prev => [...prev, newModel]);
      }
    }
  }, [fileState.file]);

  const handleTransformChange = (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => {
    setModels(prev => prev.map(model => 
      model.id === id 
        ? { ...model, position, rotation, scale }
        : model
    ));
  };

  // Handle click outside to deselect
  const handleCanvasClick = (e: ThreeEvent<PointerEvent>) => {
    if (e.target === e.currentTarget) {
      setSelectedModelId(null);
    }
  };

  // Handle transform dragging
  const handleTransformDragging = (dragging: boolean) => {
    setIsDragging(dragging);
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = !dragging;
    }
  };

  // Remove model
  const handleRemoveModel = (id: string) => {
    setModels(prev => {
      const modelToRemove = prev.find(model => model.id === id);
      if (modelToRemove) {
        processedFiles.current.delete(modelToRemove.file.name);
      }
      return prev.filter(model => model.id !== id);
    });
    if (selectedModelId === id) {
      setSelectedModelId(null);
    }
  };

  return (
    <>
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

      {models.map(model => (
        <InteractiveModel
          key={model.id}
          modelInstance={model}
          isSelected={model.id === selectedModelId}
          onSelect={() => setSelectedModelId(model.id)}
          onTransformChange={(pos, rot, scale) => handleTransformChange(model.id, pos, rot, scale)}
          transformMode={transformMode}
          transformSpace={transformSpace}
          showX={showX}
          showY={showY}
          showZ={showZ}
          isShiftPressed={isShiftPressed}
        />
      ))}

      <OrbitControls
        ref={orbitControlsRef}
        enablePan={!isDragging}
        enableZoom={!isDragging}
        enableRotate={!isDragging}
        minDistance={2}
        maxDistance={20}
        makeDefault
      />

      <mesh onPointerDown={handleCanvasClick} visible={false}>
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
};

export const ModelViewer = () => {
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [transformSpace, setTransformSpace] = useState<'world' | 'local'>('world');
  const [showX, setShowX] = useState(true);
  const [showY, setShowY] = useState(true);
  const [showZ, setShowZ] = useState(true);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          setTransformMode('translate');
          break;
        case 'e':
          setTransformMode('rotate');
          break;
        case 'r':
          setTransformMode('scale');
          break;
        case 'q':
          setTransformSpace(prev => prev === 'world' ? 'local' : 'world');
          break;
        case 'x':
          setShowX(prev => !prev);
          break;
        case 'y':
          setShowY(prev => !prev);
          break;
        case 'z':
          setShowZ(prev => !prev);
          break;
        case 'escape':
          setSelectedModelId(null);
          break;
        case 'shift':
          setIsShiftPressed(true);
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <Scene
          transformMode={transformMode}
          transformSpace={transformSpace}
          showX={showX}
          showY={showY}
          showZ={showZ}
          isShiftPressed={isShiftPressed}
        />
      </Canvas>
      <TransformControlsUI
        mode={transformMode}
        space={transformSpace}
        showX={showX}
        showY={showY}
        showZ={showZ}
        onModeChange={setTransformMode}
        onSpaceChange={setTransformSpace}
        onAxisToggle={(axis) => {
          switch (axis) {
            case 'x':
              setShowX(prev => !prev);
              break;
            case 'y':
              setShowY(prev => !prev);
              break;
            case 'z':
              setShowZ(prev => !prev);
              break;
          }
        }}
      />
    </div>
  );
};