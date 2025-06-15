import { create } from 'zustand';
import { SlicingParameters, SlicingState, FileState } from '../types';
import { slicerApi } from '../services/slicerApi';
import { useGcodeStore } from './useGcodeStore';

interface SlicerStore {
  // File state
  fileState: FileState;
  setFile: (file: File | null) => void;
  removeFile: (fileName: string) => void;
  setPreview: (preview: string | null) => void;
  setFileLoading: (loading: boolean) => void;
  // Combined STL
  combinedStlFile: File | null;
  setCombinedStlFile: (file: File | null) => void;
  
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
    files: new Map<string, File>(),
    preview: null,
    isLoading: false,
  },
  setFile: (file) => set((state) => ({ 
    fileState: { 
      ...state.fileState, 
      files: file ? new Map(state.fileState.files).set(file.name, file) : state.fileState.files,
      preview: file ? state.fileState.preview : null 
    } 
  })),
  removeFile: (fileName) => set((state) => {
    const newFiles = new Map(state.fileState.files);
    newFiles.delete(fileName);
    return {
      fileState: {
        ...state.fileState,
        files: newFiles
      }
    };
  }),
  setPreview: (preview) => set((state) => ({ 
    fileState: { ...state.fileState, preview } 
  })),
  setFileLoading: (isLoading) => set((state) => ({ 
    fileState: { ...state.fileState, isLoading } 
  })),
  // Combined STL
  combinedStlFile: null,
  setCombinedStlFile: (file) => set({ combinedStlFile: file }),
  
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
    const { parameters, fileState, combinedStlFile } = get();
    // Prefer combined STL file if present
    if (combinedStlFile) {
      set((state) => ({
        slicingState: {
          isSlicing: true,
          progress: 0,
          error: undefined,
          result: undefined,
        }
      }));
      try {
        const slicedFile = await slicerApi.sliceFile(combinedStlFile, {
          layer_height: parameters.layerHeight,
          infill: parameters.infillDensity,
          nozzle: parameters.nozzleSize
        });
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
      return;
    }
    // Fallback: slice all files if no combined STL
    if (fileState.files.size === 0) {
      set((state) => ({
        slicingState: { 
          ...state.slicingState, 
          error: 'No files selected' 
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
      for (const [fileName, file] of fileState.files) {
        const slicedFile = await slicerApi.sliceFile(file, {
          layer_height: parameters.layerHeight,
          infill: parameters.infillDensity,
          nozzle: parameters.nozzleSize
        });
        useGcodeStore.getState().setGcodeFile(slicedFile);
      }
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