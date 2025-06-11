import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050';

export interface SliceParams {
  layer_height: number;
  infill: number;
  nozzle: number;
}

export const slicerApi = {
  sliceFile: async (file: File, params: SliceParams) => {
    const formData = new FormData();
    formData.append('model', file);
    formData.append('layer_height', params.layer_height.toString());
    formData.append('infill', `${params.infill}%`);
    formData.append('nozzle', params.nozzle.toString());

    try {
      // First, send the STL file for slicing
      const sliceResponse = await axios.post(`${API_BASE_URL}/slice`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      // Get the G-code file path from the response
      const gcodePath = sliceResponse.data.gcode_path;
      
      // Fetch the G-code file
      const gcodeResponse = await axios.get(`${API_BASE_URL}${gcodePath}`, {
        responseType: 'blob'
      });

      // Create a File object from the G-code content
      const gcodeBlob = new Blob([gcodeResponse.data], { type: 'text/plain' });
      
      // Get the original filename from the STL file and replace .stl with .gcode
      const originalName = file.name.replace('.stl', '.gcode');
      const gcodeFile = new File([gcodeBlob], originalName, { type: 'text/plain' });
      
      return gcodeFile;
    } catch (error) {
      console.error('Error slicing file:', error);
      throw error;
    }
  },
}; 