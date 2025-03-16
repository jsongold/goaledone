import React from 'react';
import { useCameraStore } from '../store/cameraStore';
import { Camera } from 'lucide-react';

export const CameraCapture = () => {
  const { isStreaming, error, captureImage } = useCameraStore();

  const handleCapture = async () => {
    try {
      await captureImage();
    } catch (err) {
      console.error('Capture failed:', err);
    }
  };

  return (
    <button
      onClick={handleCapture}
      disabled={!isStreaming}
      className={`p-4 bg-purple-600 text-white rounded-full shadow-lg ${error ? 'opacity-50 blur-[1px] cursor-not-allowed bg-gray-300' : 'hover:bg-purple-700 transition-colors transform hover:scale-105'} ${!isStreaming ? 'disabled:bg-gray-300' : ''}`}
    >
      <Camera className="w-6 h-6" />
    </button>
  );
};