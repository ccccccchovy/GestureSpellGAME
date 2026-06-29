'use client';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { useGesture } from '@/core/ai/useGesture';
import { EngineStatus } from '@/core/ai/gesture-types';
import { useRef, useEffect } from 'react';

export default function HandTestLab() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { status, trackingData, startTracking, stopTracking } = useGesture(videoRef);

  // 绘制手部骨骼点
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !trackingData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 匹配视频实际分辨率
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 8-bit 风格：关闭抗锯齿
    ctx.imageSmoothingEnabled = false;

    trackingData.hands.forEach(hand => {
      // 绘制连线
      ctx.strokeStyle = '#39FF14'; // 霓虹绿
      ctx.lineWidth = 2;
      
      const connections = [
        [0,1,2,3,4], // 拇指
        [0,5,6,7,8], // 食指
        [9,10,11,12], // 中指 (不连到0，稍后处理掌心)
        [13,14,15,16], // 无名指
        [0,17,18,19,20], // 小指
        [5,9,13,17] // 掌心横向连线
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

      // 绘制节点 (方形像素点)
      ctx.fillStyle = '#39FF14';
      hand.landmarks.forEach(pt => {
        const x = pt.x * canvas.width;
        const y = pt.y * canvas.height;
        ctx.fillRect(x - 3, y - 3, 6, 6);
      });
      
      // 绘制手势状态标签
      ctx.fillStyle = '#FFD700';
      ctx.font = '16px "Press Start 2P", monospace';
      const wrist = hand.landmarks[0];
      ctx.fillText(`${hand.handedness} - ${hand.currentGesture}`, wrist.x * canvas.width, wrist.y * canvas.height + 20);
    });
  }, [trackingData]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 p-8 flex flex-col md:flex-row gap-8 relative z-10 max-w-7xl mx-auto w-full">
        <div className="w-full mb-4 md:mb-8 absolute top-0 left-0 px-8 py-4 flex justify-between items-center">
            <h1 className="font-press-start text-xl text-arcade-white">LAB: HAND TRACKING</h1>
            <span className={`font-press-start ${status === EngineStatus.Running ? 'text-arcade-green animate-pulse' : 'text-arcade-pixel-gray'}`}>
              STATUS: {status}
            </span>
        </div>

        {/* Left: Camera Feed */}
        <div className="w-full md:w-1/2 flex flex-col mt-16">
          <div className="aspect-video bg-black border-[4px] border-arcade-green relative flex items-center justify-center overflow-hidden">
            <div className="absolute top-2 left-2 w-4 h-4 border-t-4 border-l-4 border-arcade-green z-20"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-4 border-r-4 border-arcade-green z-20"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-4 border-l-4 border-arcade-green z-20"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-4 border-r-4 border-arcade-green z-20"></div>
            
            {!trackingData && <span className="font-dot-gothic text-arcade-green opacity-50 z-20 absolute">CAMERA PREVIEW</span>}
            
            <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover" 
              playsInline 
              muted 
              style={{ transform: 'scaleX(-1)' }} // 镜像显示
            />
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              style={{ transform: 'scaleX(-1)' }} // 匹配镜像
            />
          </div>
          <div className="mt-4 flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={startTracking} disabled={status === EngineStatus.Running}>
              START TRACKING
            </Button>
            <Button variant="danger" className="flex-1" onClick={stopTracking} disabled={status !== EngineStatus.Running}>
              STOP
            </Button>
          </div>
        </div>

        {/* Right: Data Logs */}
        <div className="w-full md:w-1/2 flex flex-col mt-16">
          <div className="flex-1 bg-arcade-gray border-[4px] border-arcade-white p-4 font-press-start text-xs text-arcade-green overflow-hidden relative flex flex-col">
            <div className="absolute top-0 left-0 w-full bg-arcade-white text-arcade-black px-2 py-1 mb-2 flex justify-between">
              <span>RAW DATA LOGS</span>
              {trackingData && <span>FPS: {trackingData.fps} | LAT: {trackingData.latency}ms</span>}
            </div>
            <div className="mt-8 space-y-2 h-full overflow-y-auto pb-4 pt-2">
              {trackingData ? (
                trackingData.hands.map((hand, hIdx) => (
                  <div key={hIdx} className="mb-4">
                    <p className="text-arcade-yellow">=== HAND {hIdx + 1} ({hand.handedness}) ===</p>
                    <p className="text-arcade-white mb-2">GESTURE: {hand.currentGesture}</p>
                    {hand.landmarks.map((pt, i) => (
                      <p key={i}>
                        P{i}: x:{pt.x.toFixed(3)} y:{pt.y.toFixed(3)} z:{pt.z.toFixed(3)}
                        {i === 8 && ' <- INDEX TIP'}
                      </p>
                    ))}
                  </div>
                ))
              ) : (
                <p className="animate-pulse opacity-50">_WAITING FOR NEXT FRAME...</p>
              )}
            </div>
          </div>
          <div className="mt-4">
             <Button variant="secondary" className="w-full">EXPORT JSON</Button>
          </div>
        </div>

      </main>
    </div>
  );
}