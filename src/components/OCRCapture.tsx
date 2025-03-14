import React, { useEffect, useRef } from 'react';
import { useOCRStore } from '../store/ocrStore';

export const OCRCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { 
    isStreaming,
    isProcessing, 
    imageUrl,
    capturedText, 
    error,
    startCamera, 
    stopCamera, 
    captureImage, 
    resetCapture 
  } = useOCRStore();

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await startCamera();
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Camera setup failed:', err);
      }
    };

    setupCamera();

    return () => {
      stopCamera();
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera, stopCamera]);

  const handleCapture = async () => {
    try {
      await captureImage();
    } catch (err) {
      console.error('Capture failed:', err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {error && (
        <div className="text-red-500 bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

      <div className="relative w-full max-w-lg aspect-video">
        {!imageUrl && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded"
          />
        )}
        
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Captured"
            className="w-full h-full object-cover rounded"
          />
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white">Processing...</div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!imageUrl && (
          <button
            onClick={handleCapture}
            disabled={!isStreaming}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
          >
            Capture
          </button>
        )}

        {imageUrl && (
          <>
            <button
              onClick={resetCapture}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Retake
            </button>
          </>
        )}
      </div>

      {capturedText && (
        <div className="w-full max-w-lg mt-4">
          <h3 className="text-lg font-semibold mb-2">Extracted Text:</h3>
          <div className="bg-white p-4 rounded shadow">
            {capturedText}
          </div>
        </div>
      )}
    </div>
  );
};