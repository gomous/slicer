import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { STLLoader } from 'three-stdlib';
import { Mesh, MeshStandardMaterial, Vector3, BufferGeometry } from 'three';

interface STLModelProps {
  file: File;
  onLoadComplete?: () => void;
  onLoadError?: (error: string) => void;
  onPointerOver?: (e: any) => void;
  onPointerOut?: (e: any) => void;
}

export interface STLModelHandle {
  setColor: (color: string) => void;
}

export const STLModel = forwardRef<STLModelHandle, STLModelProps>(
  ({ file, onLoadComplete, onLoadError, onPointerOver, onPointerOut }, ref) => {
    const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
    const materialRef = useRef<MeshStandardMaterial>(new MeshStandardMaterial({ color: '#3B82F6', metalness: 0.2, roughness: 0.3 }));

    useImperativeHandle(ref, () => ({
      setColor: (color: string) => {
        if (materialRef.current) {
          materialRef.current.color.set(color);
        }
      },
    }));

    useEffect(() => {
      let disposed = false;
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
            const center = loadedGeometry.boundingBox!.getCenter(new Vector3());
            loadedGeometry.translate(-center.x, -center.y, -center.z);

            // Scale
            const size = loadedGeometry.boundingBox!.getSize(new Vector3());
            const maxDimension = Math.max(size.x, size.y, size.z);
            const scale = 4 / maxDimension;
            loadedGeometry.scale(scale, scale, scale);

            // Dispose old geometry if exists
            if (geometry) geometry.dispose();

            if (!disposed) setGeometry(loadedGeometry);
            onLoadComplete?.();
          }
        } catch (err) {
          console.error('Failed to parse STL:', err);
          onLoadError?.('Failed to parse STL');
        }
      };
      reader.readAsArrayBuffer(file);
      return () => {
        disposed = true;
        if (geometry) geometry.dispose();
        if (materialRef.current) {
          materialRef.current.dispose();
        }
      };
    }, [file]);

    if (!geometry) return null;

    return (
      <mesh
        geometry={geometry}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={materialRef.current}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      />
    );
  }
);
