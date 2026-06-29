'use client';

import { useEffect, useRef } from 'react';
import { TrackingResult } from '@/core/ai/gesture-types';

interface CameraOverlayProps {
  trackingData: TrackingResult | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function CameraOverlay({ trackingData, videoRef }: CameraOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 绘制手部骨骼点
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !trackingData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.imageSmoothingEnabled = false;

    trackingData.hands.forEach(hand => {
      ctx.strokeStyle = '#39FF14';
      ctx.lineWidth = 4;
      
      const connections = [
        [0,1,2,3,4], [0,5,6,7,8], [9,10,11,12],
        [13,14,15,16], [0,17,18,19,20], [5,9,13,17]
      ];

      connections.forEach(line => {
        ctx.beginPath();
        line.forEach((idx, i) => {
          const pt = hand.landmarks[idx];
          const x = pt.x * canvas.width;
          const y = pt.y * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });

      ctx.fillStyle = '#39FF14';
      hand.landmarks.forEach(pt => {
        const x = pt.x * canvas.width;
        const y = pt.y * canvas.height;
        ctx.fillRect(x - 5, y - 5, 10, 10);
      });
    });
  }, [trackingData, videoRef]);

  return (
    <div className="absolute bottom-4 left-4 w-48 aspect-video border-[2px] border-arcade-white bg-black flex items-center justify-center overflow-hidden z-50">
        <video 
            ref={videoRef as any} 
            className="absolute inset-0 w-full h-full object-cover" 
            playsInline 
            muted 
            style={{ transform: 'scaleX(-1)' }} 
        />
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full z-10 pointer-events-none"
            style={{ transform: 'scaleX(-1)' }}
        />
        
        {!trackingData && (
            <span className="font-dot-gothic text-xs text-arcade-green text-center absolute z-20 opacity-80 animate-pulse">
              WAITING FOR<br/>AI ENGINE...
            </span>
        )}
    </div>
  );
}