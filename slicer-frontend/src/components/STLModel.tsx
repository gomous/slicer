import React, { useEffect, useRef, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { STLLoader } from 'three-stdlib';
import { Mesh, MeshStandardMaterial } from 'three';
import * as THREE from 'three';

interface STLModelProps {
  file: File;
  onLoadComplete?: () => void;
  onLoadError?: (error: string) => void;
}

export const STLModel: React.FC<STLModelProps> = ({ file, onLoadComplete, onLoadError }) => {
  const meshRef = useRef<Mesh>(null);
  const [geometry, setGeometry] = useState<any>(null);

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        if (buffer && buffer instanceof ArrayBuffer) {
          const loader = new STLLoader();
          const loadedGeometry = loader.parse(buffer);

          // Center geometry
          loadedGeometry.computeBoundingBox();
          const center = loadedGeometry.boundingBox!.getCenter(new THREE.Vector3());
          loadedGeometry.translate(-center.x, -center.y, -center.z);

          // Scale
          const size = loadedGeometry.boundingBox!.getSize(new THREE.Vector3());
          const maxDimension = Math.max(size.x, size.y, size.z);
          const scale = 4 / maxDimension;
          loadedGeometry.scale(scale, scale, scale);

          setGeometry(loadedGeometry);
          onLoadComplete?.();
        }
      } catch (err) {
        console.error('Failed to parse STL:', err);
        onLoadError?.('Failed to parse STL');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [file]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
  });

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial color="#3B82F6" metalness={0.2} roughness={0.3} />
    </mesh>
  );
};
