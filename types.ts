export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export type ModelType = 'fast' | 'pro';
export type Resolution = '1K' | '2K' | '4K';

export interface GenerationSettings {
  apiKey: string;
  productImage: UploadedImage | null;
  customModelImage: UploadedImage | null; // Now required logic-wise
  sceneImage: UploadedImage | null;
  prompt: string;
  imageCount: number;
  modelType: ModelType;
  resolution: Resolution;
  // useCustomModel removed
}

export interface GeneratedImage {
  id: string;
  url: string;
}

export enum AppStatus {
  IDLE = 'idle',
  GENERATING = 'generating',
  SUCCESS = 'success',
  ERROR = 'error',
}
