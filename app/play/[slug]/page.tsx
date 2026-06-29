'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';
import { useGesture } from '@/core/ai/useGesture';
import { GameIframe } from '@/components/game/GameIframe';
import { CameraOverlay } from '@/components/game/CameraOverlay';

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [cameraGranted, setCameraGranted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const { trackingData, startTracking, stopTracking } = useGesture(videoRef);

  // Mock game data based on slug
  const gameName = slug === 'ninja-slice' ? '忍者切水果' : '魔法手印';
  const entryUrl = '/demo-game/index.html'; // 本地测试用的 Demo 游戏沙箱
  
  // 这里我们需要从数据库根据 slug 获取真实的 gameId
  // 为了测试闭环，如果从 url 参数拿不到真实的 UUID，就使用一个在数据库里真实存在的 ID
  // 我们将利用组件加载时去获取
  const [realGameId, setRealGameId] = useState<string | null>(null);

  useEffect(() => {
    // 动态获取当前 slug 对应的真实 game UUID
    fetch(`/api/game-by-slug?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 0 && data.data?.id) {
          setRealGameId(data.data.id);
        } else {
          console.error("未能找到对应的真实游戏 ID", data);
        }
      })
      .catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (cameraGranted) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => { stopTracking(); };
  }, [cameraGranted]);

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    stopTracking(); // 游戏结束，释放 AI 算力
  };

  const handleExit = () => {
    stopTracking();
    router.push('/games');
  };

  if (!cameraGranted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-arcade-black relative z-10 p-4">
        <Button 
          variant="secondary" 
          className="absolute top-8 left-8"
          onClick={() => router.push('/games')}
        >
          &lt; BACK TO LOBBY
        </Button>
        
        <div className="max-w-md w-full border-8 border-arcade-white p-8 text-center bg-arcade-gray relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          
          <h2 className="font-press-start text-arcade-red text-2xl mb-6 animate-pulse">WARNING:</h2>
          <p className="font-press-start text-arcade-white text-lg mb-8 leading-relaxed">
            CAMERA ACCESS REQUIRED TO PLAY THIS GAME.
          </p>
          
          <Button 
            className="w-full text-lg py-4"
            onClick={() => setCameraGranted(true)}
          >
            ENABLE CAMERA
          </Button>
          
          <p className="mt-6 text-arcade-pixel-gray text-xs font-dot-gothic">
            您的摄像头画面仅在本地浏览器处理，不会上传至任何服务器。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-arcade-black relative z-10 overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 border-b-[4px] border-arcade-white flex items-center justify-between px-6 bg-arcade-gray shrink-0 z-20">
        <Button variant="secondary" className="px-4 py-1 text-xs" onClick={handleExit}>
          &lt; BACK
        </Button>
        <div className="font-press-start text-arcade-green">{gameName}</div>
        <div className="font-press-start text-arcade-yellow">SCORE: {finalScore !== null ? finalScore : '0000'}</div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative">
        {finalScore !== null && (
          <div className="absolute inset-0 bg-black/80 z-40 flex flex-col items-center justify-center">
            <h2 className="font-press-start text-arcade-red text-4xl mb-4 animate-blink">GAME OVER</h2>
            <p className="font-press-start text-arcade-yellow text-2xl mb-8">FINAL SCORE: {finalScore}</p>
            <div className="flex gap-4">
              <Button onClick={() => { setFinalScore(null); setCameraGranted(false); }}>PLAY AGAIN</Button>
              <Button variant="secondary" onClick={handleExit}>EXIT TO LOBBY</Button>
            </div>
          </div>
        )}

        {realGameId ? (
          <GameIframe 
            gameId={realGameId} 
            entryUrl={entryUrl} 
            trackingData={trackingData}
            onGameOver={handleGameOver}
            onExit={handleExit}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-arcade-black">
            <span className="font-press-start text-arcade-yellow animate-pulse">VERIFYING GAME ID...</span>
          </div>
        )}
        
        {/* Camera Picture-in-Picture */}
        {finalScore === null && (
          <CameraOverlay trackingData={trackingData} videoRef={videoRef} />
        )}
      </div>
    </div>
  );
}