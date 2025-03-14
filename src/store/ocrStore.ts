import { StateCreator, create } from 'zustand';
import { Camera } from '../domain/camera';
import { OCR } from '../domain/ocr';

interface OCRStore extends 
  Camera.CaptureState, 
  Camera.CaptureActions, 
  OCR.OCRState,
  OCR.OCRActions {}

type OCRStateCreator = StateCreator<OCRStore>;

export const useOCRStore = create<OCRStore>((set: OCRStateCreator, get: OCRStateCreator) => {
  const imageProcessor = new OCR.BrowserImageProcessor();

  return {
    // Camera state
    isStreaming: false,
    imageUrl: null,
    error: null,

    // OCR state
    isProcessing: false,
    capturedText: null,

    // Camera actions
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

        // Automatically process the captured image
        await get().processImage(imageUrl);
      } catch (error) {
        set({ error: 'Failed to capture image: ' + (error as Error).message });
        throw error;
      }
    },

    resetCapture: () => {
      set({ 
        imageUrl: null, 
        error: null,
        capturedText: null,
        isProcessing: false 
      });
    },

    // OCR actions
    processImage: async (imageUrl: string) => {
      set({ isProcessing: true, error: null });
      try {
        const text = await imageProcessor.extractTextFromUrl(imageUrl);
        set({ capturedText: text, isProcessing: false });
      } catch (error) {
        set({ 
          error: 'Failed to process image: ' + (error as Error).message,
          isProcessing: false 
        });
        throw error;
      }
    },

    reset: () => {
      set({ 
        imageUrl: null,
        capturedText: null,
        error: null,
        isProcessing: false 
      });
    }
  };
});