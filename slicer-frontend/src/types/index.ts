export interface SlicingParameters {
  layerHeight: number;
  infillPattern: string;
  infillDensity: number;
  nozzleSize: number;
}

export interface SlicingState {
  isSlicing: boolean;
  progress: number;
  result?: string;
  error?: string;
}

export interface FileState {
  files: Map<string, File>;
  preview: string | null;
  isLoading: boolean;
}