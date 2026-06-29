import { useEffect, useState, useRef } from 'react';
import { MediaPipeEngine } from './MediaPipeEngine';
import { EngineStatus, TrackingResult } from './gesture-types';

export function useGesture(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState<EngineStatus>(EngineStatus.Idle);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);

  useEffect(() => {
    const engine = MediaPipeEngine.getInstance();
    
    // 初始化引擎
    engine.initialize();

    // 设置回调
    engine.setCallbacks(
      (result) => {
        setTrackingData(result);
      },
      (newStatus) => {
        setStatus(newStatus);
      }
    );

    return () => {
      // 在组件卸载时不要销毁引擎实例 (保证单例复用)，但可以停止摄像头
      // 这里的逻辑根据实际需求：如果是单页面应用，可以在 Layout 中统一管理
      // 这里为了防止多次开启，可以在 hook unmount 时停止
      engine.stopCamera();
    };
  }, []);

  const startTracking = async () => {
    if (videoRef.current) {
      const engine = MediaPipeEngine.getInstance();
      await engine.startCamera(videoRef.current);
    }
  };

  const stopTracking = () => {
    MediaPipeEngine.getInstance().stopCamera();
  };

  return {
    status,
    trackingData,
    startTracking,
    stopTracking
  };
}
