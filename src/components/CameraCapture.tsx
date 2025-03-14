import React, { useEffect, useRef } from 'react';
import { useCameraStore } from '../store/cameraStore';

export const CameraCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { 
    isStreaming, 
    imageUrl, 
    error,
    startCamera, 
    stopCamera, 
    captureImage, 
    resetCapture 
  } = useCameraStore();

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
    </div>
  );
};