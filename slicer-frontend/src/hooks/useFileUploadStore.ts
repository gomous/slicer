import { create } from 'zustand';

interface FileUploadState {
  files: File[];
  addFile: (file: File) => void;
}

export const useFileUploadStore = create<FileUploadState>((set) => ({
  files: [],
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
})); 