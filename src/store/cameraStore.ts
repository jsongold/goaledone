import { StateCreator, create } from 'zustand';
import { Camera } from '../domain/camera';

interface CameraStore extends Camera.CaptureState, Camera.CaptureActions {}

type CameraStateCreator = StateCreator<CameraStore>;

export const useCameraStore = create<CameraStore>((set: CameraStateCreator, get: CameraStateCreator) => ({
  isStreaming: false,
  imageUrl: null,
  error: null,

  startCamera: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(Camera.defaultConfig);
      set({ isStreaming: true, error: null });
      return stream;
    } catch (error) {
      set({ error: 'Failed to access camera: ' + (error as Error).message });
      throw error;
    }
  },

  stopCamera: () => {
    set({ isStreaming: false, error: null });
  },

  captureImage: async () => {
    try {
      const videoElement = document.querySelector('video');
      const canvas = document.createElement('canvas');
      if (!videoElement) {
        throw new Error('Video element not found');
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      context.drawImage(videoElement, 0, 0);
      const imageUrl = canvas.toDataURL('image/jpeg');
      set({ imageUrl, error: null });
    } catch (error) {
      set({ error: 'Failed to capture image: ' + (error as Error).message });
      throw error;
    }
  },

  resetCapture: () => {
    set({ imageUrl: null, error: null });
  }
}));