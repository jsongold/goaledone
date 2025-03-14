export namespace OCR {
  export interface OCRState {
    isProcessing: boolean;
    capturedText: string | null;
    error: string | null;
  }

  export interface OCRActions {
    processImage: (imageUrl: string) => Promise<void>;
    reset: () => void;
  }

  export interface ImageProcessor {
    extractTextFromUrl: (url: string) => Promise<string>;
  }

  // Simple text extraction from URL using native browser capabilities
  export class BrowserImageProcessor implements ImageProcessor {
    async extractTextFromUrl(url: string): Promise<string> {
      try {
        // Create an image element to load the URL
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        // Create canvas to draw the image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }

        // Draw image to canvas
        ctx.drawImage(img, 0, 0);

        // Here you would typically integrate with a proper OCR service
        // For now, we'll return a placeholder
        return 'Text extraction requires OCR service integration';
      } catch (error) {
        throw new Error(`Failed to process image: ${(error as Error).message}`);
      }
    }
  }
}