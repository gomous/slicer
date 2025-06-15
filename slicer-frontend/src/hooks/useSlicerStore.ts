import { create } from 'zustand';
import { SlicingParameters, SlicingState, FileState } from '../types';
import { slicerApi } from '../services/slicerApi';
import { useGcodeStore } from './useGcodeStore';

interface SlicerStore {
  // File state
  fileState: FileState;
  setFile: (file: File | null) => void;
  setPreview: (preview: string | null) => void;
  setFileLoading: (loading: boolean) => void;
  
  // Slicing parameters
  parameters: SlicingParameters;
  updateParameters: (params: Partial<SlicingParameters>) => void;
  
  // Slicing state
  slicingState: SlicingState;
  startSlicing: () => Promise<void>;
  resetSlicing: () => void;
}

export const useSlicerStore = create<SlicerStore>((set, get) => ({
  // File state
  fileState: {
    file: null,
    preview: null,
    isLoading: false,
  },
  setFile: (file) => set((state) => ({ 
    fileState: { 
      ...state.fileState, 
      file,
      // Keep the preview if we're just updating the file
      preview: file ? state.fileState.preview : null 
    } 
  })),
  setPreview: (preview) => set((state) => ({ 
    fileState: { ...state.fileState, preview } 
  })),
  setFileLoading: (isLoading) => set((state) => ({ 
    fileState: { ...state.fileState, isLoading } 
  })),
  
  // Slicing parameters
  parameters: {
    layerHeight: 0.2,
    infillPattern: 'grid',
    infillDensity: 20,
    nozzleSize: 0.4,
  },
  updateParameters: (params) => set((state) => ({
    parameters: { ...state.parameters, ...params }
  })),
  
  // Slicing state
  slicingState: {
    isSlicing: false,
    progress: 0,
  },
  startSlicing: async () => {
    const { parameters, fileState } = get();
    
    if (!fileState.file) {
      set((state) => ({
        slicingState: { 
          ...state.slicingState, 
          error: 'No file selected' 
        }
      }));
      return;
    }

    set((state) => ({
      slicingState: {
        isSlicing: true,
        progress: 0,
        error: undefined,
        result: undefined,
      }
    }));

    try {
      // Call the actual slicing API
      const slicedFile = await slicerApi.sliceFile(fileState.file, {
        layer_height: parameters.layerHeight,
        infill: parameters.infillDensity,
        nozzle: parameters.nozzleSize
      });

      // Update the G-code store with the sliced file
      useGcodeStore.getState().setGcodeFile(slicedFile);
      
      set((state) => ({
        slicingState: {
          ...state.slicingState,
          isSlicing: false,
          progress: 100,
          result: 'G-code generated successfully!',
        }
      }));
    } catch (error) {
      set((state) => ({
        slicingState: {
          ...state.slicingState,
          isSlicing: false,
          error: error instanceof Error ? error.message : 'Failed to slice model',
        }
      }));
    }
  },
  resetSlicing: () => set((state) => ({
    slicingState: {
      isSlicing: false,
      progress: 0,
      error: undefined,
      result: undefined,
    }
  })),
}));