import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Environment } from '@react-three/drei';
import { STLModel } from './STLModel';
import { useSlicerStore } from '../hooks/useSlicerStore';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { STLLoader, STLExporter } from 'three-stdlib';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { TransformControlsUI } from './TransformControlsUI';

// Build plate dimensions in mm
const BUILD_PLATE_WIDTH = 200;
const BUILD_PLATE_HEIGHT = 200;
const GRID_SIZE = 10; // Size of each grid cell in mm
const MIN_DISTANCE = 5; // Minimum distance between models in mm
const MIN_HEIGHT_ABOVE_PLATE = 0.1; // Minimum height above build plate in mm

interface ModelInstance {
  id: string;
  file: File;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  boundingBox?: THREE.Box3;
}

// Build plate component
const BuildPlate = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[BUILD_PLATE_WIDTH / 10, BUILD_PLATE_HEIGHT / 10]} />
      <meshStandardMaterial 
        color="#E5E7EB"
        metalness={0.1}
        roughness={0.8}
        transparent={true}
        opacity={0.8}
      />
  </mesh>
);
};

// Function to find a non-overlapping position
const findNonOverlappingPosition = (
  models: ModelInstance[],
  boundingBox: THREE.Box3,
  buildPlateWidth: number,
  buildPlateHeight: number
): [number, number, number] => {
  const gridWidth = Math.floor(buildPlateWidth / GRID_SIZE);
  const gridHeight = Math.floor(buildPlateHeight / GRID_SIZE);
  
  // Start from the center and spiral outward
  const centerX = Math.floor(gridWidth / 2);
  const centerZ = Math.floor(gridHeight / 2);
  
  // Create a spiral pattern of positions to check
  const positions: [number, number][] = [];
  let x = centerX;
  let z = centerZ;
  let step = 1;
  let leg = 0;
  
  while (positions.length < gridWidth * gridHeight) {
    positions.push([x, z]);
    
    switch (leg) {
      case 0: x += step; break;
      case 1: z += step; break;
      case 2: x -= step; break;
      case 3: z -= step; break;
    }
    
    if (Math.abs(x - centerX) === step && Math.abs(z - centerZ) === step) {
      leg = (leg + 1) % 4;
      if (leg === 0) step++;
    }
  }
  
  // Check each position
  for (const [gridX, gridZ] of positions) {
    const worldX = (gridX - centerX) * GRID_SIZE;
    const worldZ = (gridZ - centerZ) * GRID_SIZE;
    
    // Create a temporary bounding box at this position
    const tempBox = boundingBox.clone();
    tempBox.translate(new THREE.Vector3(worldX, MIN_HEIGHT_ABOVE_PLATE, worldZ));
    
    // Check if this position overlaps with any existing model
    let overlaps = false;
    for (const model of models) {
      if (model.boundingBox && tempBox.intersectsBox(model.boundingBox)) {
        overlaps = true;
        break;
      }
    }
    
    if (!overlaps) {
      return [worldX, MIN_HEIGHT_ABOVE_PLATE, worldZ];
    }
  }
  
  // If no position found, return center
  return [0, MIN_HEIGHT_ABOVE_PLATE, 0];
};

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
  isShiftPressed,
  onBoundingBoxUpdate
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
  onBoundingBoxUpdate: (id: string, boundingBox: THREE.Box3) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const transformRef = useRef<any>(null);
  const boxHelperRef = useRef<THREE.BoxHelper | null>(null);
  const { gl, camera, raycaster, mouse } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [activeAxis, setActiveAxis] = useState<'x' | 'y' | 'z' | null>(null);
  const lastMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // Initialize box helper when mesh is loaded
  useEffect(() => {
    if (meshRef.current && isModelLoaded && !boxHelperRef.current) {
      boxHelperRef.current = new THREE.BoxHelper(meshRef.current, isSelected ? 0x00ff00 : 0xffffff);
    }
  }, [meshRef.current, isModelLoaded, isSelected]);

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

  // Update bounding box when model changes
  useEffect(() => {
    if (meshRef.current && isModelLoaded) {
      const boundingBox = new THREE.Box3().setFromObject(meshRef.current);
      onBoundingBoxUpdate(modelInstance.id, boundingBox);
      
      // Update box helper
      if (boxHelperRef.current) {
        boxHelperRef.current.update();
      }
    }
  }, [modelInstance.position, modelInstance.rotation, modelInstance.scale, onBoundingBoxUpdate, isModelLoaded]);

  // Update box helper color when selection changes
  useEffect(() => {
    if (boxHelperRef.current) {
      boxHelperRef.current.material.color.setHex(isSelected ? 0x00ff00 : 0xffffff);
    }
  }, [isSelected]);

  // Handle transform changes
  const handleTransformChange = () => {
    if (meshRef.current) {
      const position = meshRef.current.position.toArray() as [number, number, number];
      const rotation = meshRef.current.rotation.toArray() as [number, number, number];
      const scale = meshRef.current.scale.toArray() as [number, number, number];
      
      // Ensure the model stays above the build plate
      if (position[1] < MIN_HEIGHT_ABOVE_PLATE) {
        position[1] = MIN_HEIGHT_ABOVE_PLATE;
        meshRef.current.position.y = MIN_HEIGHT_ABOVE_PLATE;
      }
      
      onTransformChange(position, rotation, scale);
    }
  };

  // Handle transform start
  const handleTransformStart = (e: any) => {
    e.stopPropagation();
    setIsDragging(true);
    setActiveAxis(e.axis);
    lastMousePosition.current = { x: mouse.x, y: mouse.y };
    gl.domElement.style.cursor = 'grabbing';
  };

  // Handle transform end
  const handleTransformEnd = () => {
    setIsDragging(false);
    setActiveAxis(null);
    gl.domElement.style.cursor = 'auto';
  };

  // Handle pointer down
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onSelect();
  };

  // Handle pointer missed
  const handlePointerMissed = () => {
    if (!isDragging) {
      onSelect();
    }
  };

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
        onPointerUp={handleTransformEnd}
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
          <STLModel 
            file={modelInstance.file}
            onLoadComplete={() => {
              if (meshRef.current) {
                // Rotate the model to align with Z-axis
                meshRef.current.rotation.x = -Math.PI / 2;
                
                const boundingBox = new THREE.Box3().setFromObject(meshRef.current);
                // Ensure the model is above the build plate
                const minY = boundingBox.min.y;
                if (minY < MIN_HEIGHT_ABOVE_PLATE) {
                  const offset = MIN_HEIGHT_ABOVE_PLATE - minY;
                  meshRef.current.position.y += offset;
                  boundingBox.translate(new THREE.Vector3(0, offset, 0));
                }
                onBoundingBoxUpdate(modelInstance.id, boundingBox);
                setIsModelLoaded(true);
              }
            }}
          />
        </mesh>
      </TransformControls>
      {/* Add box helper for visualization */}
      {boxHelperRef.current && isModelLoaded && (
        <primitive object={boxHelperRef.current} />
      )}
    </group>
  );
};

const Scene = ({ 
  transformMode, 
  transformSpace, 
  showX, 
  showY, 
  showZ,
  isShiftPressed,
  setCombinedStlUrl
}: { 
  transformMode: 'translate' | 'rotate' | 'scale';
  transformSpace: 'world' | 'local';
  showX: boolean;
  showY: boolean;
  showZ: boolean;
  isShiftPressed: boolean;
  setCombinedStlUrl: (url: string | null) => void;
}) => {
  const { fileState } = useSlicerStore();
  const [models, setModels] = useState<ModelInstance[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const orbitControlsRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const processedFiles = useRef<Set<string>>(new Set());

  // Add new model when file is uploaded
  useEffect(() => {
    const currentFiles = Array.from(fileState.files.values());
    const currentFileNames = new Set(currentFiles.map(f => f.name));
    
    // Remove models for files that no longer exist
    setModels(prev => {
      const newModels = prev.filter(model => currentFileNames.has(model.file.name));
      // Update processed files set
      processedFiles.current = new Set(currentFileNames);
      return newModels;
    });

    // Add new models for files that don't have models yet
    currentFiles.forEach(file => {
      if (!processedFiles.current.has(file.name)) {
        processedFiles.current.add(file.name);
        
        // Create a new model with initial position
        const newModel: ModelInstance = {
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file: file,
          position: [0, 0.1, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1]
        };
        
        setModels(prev => [...prev, newModel]);
      }
    });
  }, [fileState.files]);

  const handleTransformChange = (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => {
    setModels(prev => prev.map(model => 
      model.id === id 
        ? { ...model, position, rotation, scale }
        : model
    ));
  };

  const handleBoundingBoxUpdate = (id: string, boundingBox: THREE.Box3) => {
    setModels(prev => {
      const model = prev.find(m => m.id === id);
      if (!model) return prev;

      // If this is the first bounding box update for this model, find a non-overlapping position
      if (!model.boundingBox) {
        const position = findNonOverlappingPosition(
          prev.filter(m => m.id !== id),
          boundingBox,
          BUILD_PLATE_WIDTH,
          BUILD_PLATE_HEIGHT
        );
        
        return prev.map(m => 
          m.id === id 
            ? { ...m, position, boundingBox }
            : m
        );
      }

      // Otherwise just update the bounding box
      return prev.map(m => 
        m.id === id 
          ? { ...m, boundingBox }
          : m
      );
    });
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

  // Move the combined STL logic here
  useEffect(() => {
    const combineAndExport = async () => {
      if (!models || models.length === 0) {
        setCombinedStlUrl(null);
        return;
      }
      const loader = new STLLoader();
      const transformedGeometries: THREE.BufferGeometry[] = [];
      for (const model of models) {
        const buffer = await model.file.arrayBuffer();
        const geometry = loader.parse(buffer);
        geometry.computeBoundingBox();
        // Auto-drop
        const minZ = geometry.boundingBox!.min.z;
        geometry.translate(0, 0, -minZ);
        // Apply transform
        const matrix = new THREE.Matrix4();
        matrix.compose(
          new THREE.Vector3(...model.position),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(...model.rotation)),
          new THREE.Vector3(...model.scale)
        );
        geometry.applyMatrix4(matrix);
        // Strip all attributes except 'position'
        Object.keys(geometry.attributes).forEach(attr => {
          if (attr !== 'position') geometry.deleteAttribute(attr);
        });
        transformedGeometries.push(geometry);
      }
      const mergedGeometry = BufferGeometryUtils.mergeGeometries(transformedGeometries, false);
      if (!mergedGeometry) {
        setCombinedStlUrl(null);
        return;
      }
      const exporter = new STLExporter();
      const mesh = new THREE.Mesh(mergedGeometry);
      const stlString = exporter.parse(mesh);
      const blob = new Blob([stlString], { type: 'model/stl' });
      // No download, just create the File object for backend
      const combinedStlFile = new File([blob], 'combined.stl', { type: 'model/stl' });
      useSlicerStore.getState().setCombinedStlFile(combinedStlFile);
    };
    combineAndExport();
    return () => {};
  }, [models, setCombinedStlUrl]);

  return (
    <>
            <Environment preset="studio" />
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
            <directionalLight position={[-10, -10, -5]} intensity={0.3} />
            
      {/* Build plate */}
      <BuildPlate />
      
      {/* Grid helper for build plate */}
            <Grid
        args={[BUILD_PLATE_WIDTH / 10, BUILD_PLATE_WIDTH / 10]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6B7280"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#374151"
              fadeDistance={25}
              fadeStrength={1}
              followCamera={false}
        infiniteGrid={false}
        position={[0, 0.01, 0]} // Slightly above build plate to prevent z-fighting
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
          onBoundingBoxUpdate={handleBoundingBoxUpdate}
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
  const { fileState } = useSlicerStore();

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
          setCombinedStlUrl={() => {}}
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