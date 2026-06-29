'use client';

import { useEffect, useRef, useState } from 'react';
import { PostMessageBus } from '@/core/sdk/PostMessageBus';
import { TrackingResult } from '@/core/ai/gesture-types';
import { submitScore } from '@/services/score.actions';

interface GameIframeProps {
  gameId: string;
  entryUrl: string;
  trackingData: TrackingResult | null;
  onGameOver?: (score: number) => void;
  onExit?: () => void;
}

export function GameIframe({ gameId, entryUrl, trackingData, onGameOver, onExit }: GameIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const busRef = useRef<PostMessageBus | null>(null);
  
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化总线与事件监听
  useEffect(() => {
    if (!iframeRef.current) return;

    const bus = new PostMessageBus();
    busRef.current = bus;
    bus.connect(iframeRef.current);

    // 注册游戏发来的事件
    bus.on('GAME_READY', () => {
      setIsReady(true);
      // 发送平台环境信息
      bus.sendInitEnv('Player1'); // 实际中可从 Context 获取
    });

    bus.on('GAME_OVER', () => {
      console.log('Game Over signal received from Iframe');
      // 可以触发 UI 层显示结算面板
    });

    bus.on('SUBMIT_SCORE', async (payload: { score: number }) => {
      console.log(`Submitting score: ${payload.score}`);
      try {
        const res = await submitScore(gameId, payload.score);
        if (res.code === 0) {
            console.log('Score saved successfully');
        } else {
            console.error('Score save failed:', res.message);
        }
      } catch (e) {
        console.error(e);
      }
      
      if (onGameOver) {
        onGameOver(payload.score);
      }
    });

    bus.on('EXIT_GAME', () => {
      if (onExit) onExit();
    });

    return () => {
      bus.disconnect();
      busRef.current = null;
    };
  }, [gameId, onGameOver, onExit]);

  // 将追踪数据桥接传递给游戏
  useEffect(() => {
    if (isReady && busRef.current && trackingData) {
      busRef.current.sendHandData(trackingData);
    }
  }, [trackingData, isReady]);

  const handleIframeError = () => {
    setError('FAILED TO LOAD GAME ASSET');
  };

  return (
    <div className="w-full h-full relative bg-black border-[4px] border-arcade-green flex items-center justify-center overflow-hidden">
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-arcade-black z-20">
            <span className="font-press-start text-arcade-red animate-blink text-xl mb-4">ERROR</span>
            <span className="font-dot-gothic text-arcade-pixel-gray">{error}</span>
        </div>
      )}
      
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
            <span className="font-press-start text-arcade-yellow animate-pulse text-lg">LOADING GAME...</span>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={entryUrl}
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin allow-downloads"
        onError={handleIframeError}
      />
    </div>
  );
}