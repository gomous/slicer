import { create } from 'zustand';
import { slicerApi, SliceParams } from '../services/slicerApi';

interface GcodeStore {
  gcodeFile: File | null;
  isLoading: boolean;
  error: string | null;
  setGcodeFile: (file: File | null) => void;
  sliceFile: (file: File, params: SliceParams) => Promise<void>;
}

export const useGcodeStore = create<GcodeStore>((set) => ({
  gcodeFile: null,
  isLoading: false,
  error: null,
  setGcodeFile: (file) => set({ gcodeFile: file }),
  sliceFile: async (file, params) => {
    set({ isLoading: true, error: null });
    try {
      const slicedFile = await slicerApi.sliceFile(file, params);
      set({ gcodeFile: slicedFile, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to slice file', 
        isLoading: false 
      });
    }
  },
})); 