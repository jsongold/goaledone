export namespace Camera {
  export interface CaptureState {
    isStreaming: boolean;
    imageUrl: string | null;
    error: string | null;
  }

  export interface CaptureActions {
    startCamera: () => Promise<void>;
    stopCamera: () => void;
    captureImage: () => Promise<void>;
    resetCapture: () => void;
  }

  export interface MediaConfig {
    video: {
      width: { ideal: number };
      height: { ideal: number };
      facingMode: string;
    };
  }

  export const defaultConfig: MediaConfig = {
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: 'environment'
    }
  };
}