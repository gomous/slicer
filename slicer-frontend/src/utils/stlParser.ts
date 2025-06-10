export interface STLGeometry {
  vertices: Float32Array;
  normals: Float32Array;
  triangleCount: number;
}

export class STLParser {
  static async parseSTL(file: File): Promise<STLGeometry> {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);
    
    // Check if it's binary or ASCII STL
    if (this.isBinarySTL(arrayBuffer)) {
      return this.parseBinarySTL(dataView);
    } else {
      return this.parseASCIISTL(arrayBuffer);
    }
  }

  private static isBinarySTL(buffer: ArrayBuffer): boolean {
    // Binary STL files start with an 80-byte header
    // ASCII STL files start with "solid"
    const header = new Uint8Array(buffer, 0, 5);
    const headerString = String.fromCharCode(...header);
    return !headerString.toLowerCase().startsWith('solid');
  }

  private static parseBinarySTL(dataView: DataView): STLGeometry {
    // Skip 80-byte header
    let offset = 80;
    
    // Read number of triangles (4 bytes)
    const triangleCount = dataView.getUint32(offset, true);
    offset += 4;
    
    const vertices = new Float32Array(triangleCount * 9); // 3 vertices * 3 coordinates
    const normals = new Float32Array(triangleCount * 9);  // 3 normals * 3 coordinates
    
    for (let i = 0; i < triangleCount; i++) {
      const baseIndex = i * 9;
      
      // Read normal vector (3 floats)
      const nx = dataView.getFloat32(offset, true); offset += 4;
      const ny = dataView.getFloat32(offset, true); offset += 4;
      const nz = dataView.getFloat32(offset, true); offset += 4;
      
      // Read 3 vertices (9 floats total)
      for (let j = 0; j < 9; j += 3) {
        vertices[baseIndex + j] = dataView.getFloat32(offset, true); offset += 4;
        vertices[baseIndex + j + 1] = dataView.getFloat32(offset, true); offset += 4;
        vertices[baseIndex + j + 2] = dataView.getFloat32(offset, true); offset += 4;
        
        // Assign normal to each vertex
        normals[baseIndex + j] = nx;
        normals[baseIndex + j + 1] = ny;
        normals[baseIndex + j + 2] = nz;
      }
      
      // Skip attribute byte count (2 bytes)
      offset += 2;
    }
    
    return { vertices, normals, triangleCount };
  }

  private static parseASCIISTL(buffer: ArrayBuffer): STLGeometry {
    const text = new TextDecoder().decode(buffer);
    const lines = text.split('\n').map(line => line.trim());
    
    const vertices: number[] = [];
    const normals: number[] = [];
    let currentNormal: [number, number, number] = [0, 0, 0];
    
    for (const line of lines) {
      if (line.startsWith('facet normal')) {
        const parts = line.split(/\s+/);
        currentNormal = [
          parseFloat(parts[2]),
          parseFloat(parts[3]),
          parseFloat(parts[4])
        ];
      } else if (line.startsWith('vertex')) {
        const parts = line.split(/\s+/);
        vertices.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        );
        normals.push(...currentNormal);
      }
    }
    
    return {
      vertices: new Float32Array(vertices),
      normals: new Float32Array(normals),
      triangleCount: vertices.length / 9
    };
  }
}