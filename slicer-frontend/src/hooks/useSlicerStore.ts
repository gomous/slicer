import { create } from 'zustand';
import { SlicingParameters, SlicingState, FileState } from '../types';

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
    fileState: { ...state.fileState, file } 
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

    // Mock API call with progress simulation
    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        set((state) => ({
          slicingState: { ...state.slicingState, progress: i }
        }));
      }
      
      // Mock successful response
      await new Promise(resolve => setTimeout(resolve, 500));
      set((state) => ({
        slicingState: {
          ...state.slicingState,
          isSlicing: false,
          result: 'G-code generated successfully! (Mock result)',
        }
      }));
    } catch (error) {
      set((state) => ({
        slicingState: {
          ...state.slicingState,
          isSlicing: false,
          error: 'Failed to slice model',
        }
      }));
    }
  },
  resetSlicing: () => set((state) => ({
    slicingState: { isSlicing: false, progress: 0 }
  })),
}));