import { create } from 'zustand';
import { slicerApi, SliceParams } from '../services/slicerApi';

interface GcodeStore {
  gcodeFile: File | null;
  isLoading: boolean;
  error: string | null;
  gcodeCache: Map<string, File>;  // Cache for G-code files
  setGcodeFile: (file: File | null) => void;
  sliceFile: (file: File, params: SliceParams) => Promise<void>;
  getCachedGcode: (filename: string) => File | undefined;
  clearCache: () => void;
}

export const useGcodeStore = create<GcodeStore>((set, get) => ({
  gcodeFile: null,
  isLoading: false,
  error: null,
  gcodeCache: new Map(),
  
  setGcodeFile: (file) => {
    if (file) {
      // Add to cache when setting a new file
      get().gcodeCache.set(file.name, file);
    }
    set({ gcodeFile: file });
  },
  
  sliceFile: async (file, params) => {
    set({ isLoading: true, error: null });
    try {
      // Check cache first
      const cacheKey = `${file.name}-${params.layer_height}-${params.infill}-${params.nozzle}`;
      const cachedFile = get().gcodeCache.get(cacheKey);
      
      if (cachedFile) {
        set({ gcodeFile: cachedFile, isLoading: false });
        return;
      }

      const slicedFile = await slicerApi.sliceFile(file, params);
      // Add to cache
      get().gcodeCache.set(cacheKey, slicedFile);
      set({ gcodeFile: slicedFile, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to slice file', 
        isLoading: false 
      });
    }
  },

  getCachedGcode: (filename: string) => {
    return get().gcodeCache.get(filename);
  },

  clearCache: () => {
    set({ gcodeCache: new Map() });
  },
})); 