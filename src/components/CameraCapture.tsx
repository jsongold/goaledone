/** @jsxImportSource react */
import React, { useState, useCallback } from 'react';
import { useCameraStore } from '../store/cameraStore';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  className?: string;
}

export function CameraCapture({ className }: CameraCaptureProps): JSX.Element {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const { isStreaming, error, startCamera, stopCamera, captureImage } = useCameraStore();

  const handleStartCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      await startCamera();
    } catch (err) {
      console.error('Camera access error:', err);
    }
  }, [startCamera]);

  const handleStopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    stopCamera();
    setShowCamera(false);
  }, [stopCamera]);

  const handleCameraClick = async () => {
    setShowCamera(true);
    await handleStartCamera();
  };

  const handleCapture = async () => {
    try {
      await captureImage();
      handleStopCamera();
    } catch (err) {
      console.error('Capture failed:', err);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleCameraClick}
        disabled={!isStreaming}
        className={`p-4 bg-purple-600 text-white rounded-full shadow-lg ${
          error ? 'opacity-50 blur-[1px] cursor-not-allowed bg-gray-300' : 'hover:bg-purple-700 transition-colors transform hover:scale-105'
        } ${!isStreaming ? 'disabled:bg-gray-300' : ''}`}
        aria-label="Open camera"
      >
        <Camera aria-hidden="true" className="w-6 h-6" />
      </button>

      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex justify-end p-4">
            <button
              onClick={handleStopCamera}
              className="text-white p-2 hover:bg-gray-800 rounded-full"
              aria-label="Close camera"
            >
              <X aria-hidden="true" className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex justify-center p-4 bg-black bg-opacity-50">
            <button
              onClick={handleCapture}
              className="bg-white text-black p-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
              aria-label="Take photo"
            >
              <Camera aria-hidden="true" className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}