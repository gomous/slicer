import { create } from 'zustand';

interface GcodeStore {
  gcodeFile: File | null;
  setGcodeFile: (file: File | null) => void;
}

export const useGcodeStore = create<GcodeStore>((set) => ({
  gcodeFile: null,
  setGcodeFile: (file) => set({ gcodeFile: file }),
})); 