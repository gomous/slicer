declare module 'gcode-preview' {
  interface GCodePreviewOptions {
    canvas: HTMLCanvasElement;
    extrusionColor?: string;
    extrusionType?: 'line' | 'tube';
    tubeDiameter?: number;
  }

  interface GCodePreviewInstance {
    processGCode(gcode: string): void;
  }

  export function init(options: GCodePreviewOptions): GCodePreviewInstance;
} 