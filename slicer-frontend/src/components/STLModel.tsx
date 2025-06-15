import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useLoader } from '@react-three/fiber';
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
  setMaterial: (props: Partial<MeshStandardMaterial>) => void;
}

export const STLModel = forwardRef<STLModelHandle, STLModelProps>(
  ({ file, onLoadComplete, onLoadError, onPointerOver, onPointerOut }, ref) => {
    const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
    const materialRef = useRef<MeshStandardMaterial>(
      new MeshStandardMaterial({
        color: '#3B82F6',
        metalness: 0.2,
        roughness: 0.3,
        envMapIntensity: 1,
        transparent: true,
        opacity: 1
      })
    );

    useImperativeHandle(ref, () => ({
      setColor: (color: string) => {
        if (materialRef.current) {
          materialRef.current.color.set(color);
        }
      },
      setMaterial: (props: Partial<MeshStandardMaterial>) => {
        if (materialRef.current) {
          Object.assign(materialRef.current, props);
        }
      }
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

          // Auto-drop: move the model so its lowest Z is at z=0 (build plate)
          loadedGeometry.computeBoundingBox();
          const size = loadedGeometry.boundingBox!.getSize(new Vector3());
          const maxDimension = Math.max(size.x, size.y, size.z);
          // Auto-detect and scale to mm
          if (maxDimension > 500) {
            // Likely inches, convert to mm
            loadedGeometry.scale(25.4, 25.4, 25.4);
          } else if (maxDimension < 1) {
            // Likely meters, convert to mm
            loadedGeometry.scale(1000, 1000, 1000);
          }
          loadedGeometry.computeBoundingBox();
          const minZ = loadedGeometry.boundingBox!.min.z;
          loadedGeometry.translate(0, 0, -minZ);

          // Scale to fit within 150mm build plate (smaller for margin)
          loadedGeometry.computeBoundingBox();
          const fitSize = loadedGeometry.boundingBox!.getSize(new Vector3());
          const fitMax = Math.max(fitSize.x, fitSize.y, fitSize.z);
          if (fitMax > 150) {
            let fitScale = 150 / fitMax;
            fitScale *= 0.1; // Make 10x smaller
            loadedGeometry.scale(fitScale, fitScale, fitScale);
            // Re-drop to build plate after scaling
            loadedGeometry.computeBoundingBox();
            const newMinZ = loadedGeometry.boundingBox!.min.z;
            loadedGeometry.translate(0, 0, -newMinZ);
          } else {
            // Even if not fitting, still shrink by 10x
            loadedGeometry.scale(0.1, 0.1, 0.1);
            loadedGeometry.computeBoundingBox();
            const newMinZ = loadedGeometry.boundingBox!.min.z;
            loadedGeometry.translate(0, 0, -newMinZ);
          }

            // Dispose old geometry if exists
            if (geometry) geometry.dispose();

            if (!disposed) {
          setGeometry(loadedGeometry);
          onLoadComplete?.();
            }
        }
      } catch (err) {
        console.error('Failed to parse STL:', err);
        onLoadError?.('Failed to parse STL');
      }
    };

      reader.onerror = () => {
        onLoadError?.('Failed to read file');
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
        material={materialRef.current}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        castShadow
        receiveShadow
      />
  );
  }
);
