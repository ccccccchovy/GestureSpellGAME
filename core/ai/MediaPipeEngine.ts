import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { EngineStatus, GestureType, HandData, Point3D, TrackingResult } from './gesture-types';

export class MediaPipeEngine {
  private static instance: MediaPipeEngine | null = null;
  
  private handLandmarker: HandLandmarker | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private isRunning: boolean = false;
  private status: EngineStatus = EngineStatus.Idle;
  private isMockMode: boolean = false; // Mock 模式降级标志

  // 性能统计
  private lastVideoTime: number = -1;
  private framesCount: number = 0;
  private lastFpsTime: number = 0;
  private currentFps: number = 0;
  private currentLatency: number = 0;

  // 回调函数
  private onResultCallback: ((result: TrackingResult) => void) | null = null;
  private onStatusChangeCallback: ((status: EngineStatus) => void) | null = null;

  private constructor() {}

  public static getInstance(): MediaPipeEngine {
    if (!MediaPipeEngine.instance) {
      MediaPipeEngine.instance = new MediaPipeEngine();
    }
    return MediaPipeEngine.instance;
  }

  private setStatus(newStatus: EngineStatus) {
    this.status = newStatus;
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(newStatus);
    }
  }

  public getStatus() {
    return this.status;
  }

  public setCallbacks(
    onResult: (res: TrackingResult) => void,
    onStatusChange?: (status: EngineStatus) => void
  ) {
    this.onResultCallback = onResult;
    if (onStatusChange) {
      this.onStatusChangeCallback = onStatusChange;
    }
  }

  public async initialize() {
    if (this.handLandmarker || this.isMockMode) return;
    this.setStatus(EngineStatus.Initializing);
    
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: '/models/hand_landmarker.task', // 尝试加载本地模型
          delegate: 'GPU' 
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      this.setStatus(EngineStatus.Idle);
    } catch (err) {
      console.warn('⚠️ MediaPipe Init Error (Fallback to Mock Mode):', err);
      // 模型加载失败时自动降级到模拟模式
      this.isMockMode = true;
      this.setStatus(EngineStatus.Idle);
    }
  }

  public async startCamera(videoElement: HTMLVideoElement) {
    if (this.isRunning) return;
    
    this.videoElement = videoElement;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' }
      });
      this.videoElement.srcObject = stream;
      
      await new Promise<void>((resolve) => {
        this.videoElement!.onloadedmetadata = () => {
          this.videoElement!.play();
          resolve();
        };
      });

      this.isRunning = true;
      this.setStatus(EngineStatus.Running);
      this.lastFpsTime = performance.now();
      
      this.detectFrame();
    } catch (err) {
      console.error('Camera Error:', err);
      this.setStatus(EngineStatus.Error);
    }
  }

  public stopCamera() {
    this.isRunning = false;
    this.setStatus(EngineStatus.Idle);
    
    if (this.videoElement && this.videoElement.srcObject) {
      const stream = this.videoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      this.videoElement.srcObject = null;
    }
  }

  private detectFrame = async () => {
    if (!this.isRunning || !this.videoElement) return;

    let startTimeMs = performance.now();
    
    if (this.videoElement.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.videoElement.currentTime;
      
      let handsData: HandData[] = [];

      if (this.isMockMode) {
        // Mock 模式：生成模拟的浮动数据
        this.currentLatency = Math.round(15 + Math.random() * 10);
        handsData = this.generateMockHandData(startTimeMs);
      } else if (this.handLandmarker) {
        // 真实模式：调用 MediaPipe
        const results = this.handLandmarker.detectForVideo(this.videoElement, startTimeMs);
        this.currentLatency = Math.round(performance.now() - startTimeMs);
        
        if (results.landmarks && results.handednesses) {
          for (let i = 0; i < results.landmarks.length; i++) {
            const landmarks = results.landmarks[i];
            const handedness = results.handednesses[i][0].categoryName as 'Left' | 'Right';
            const correctedHandedness = handedness === 'Left' ? 'Right' : 'Left';
            
            handsData.push({
              handedness: correctedHandedness,
              landmarks: landmarks as Point3D[],
              currentGesture: this.analyzeGesture(landmarks)
            });
          }
        }
      }
      
      // 计算 FPS
      this.framesCount++;
      if (startTimeMs - this.lastFpsTime >= 1000) {
        this.currentFps = this.framesCount;
        this.framesCount = 0;
        this.lastFpsTime = startTimeMs;
      }

      if (this.onResultCallback) {
        this.onResultCallback({
          hands: handsData,
          fps: this.currentFps,
          latency: this.currentLatency,
          timestamp: startTimeMs
        });
      }
    }

    requestAnimationFrame(this.detectFrame);
  }

  // 生成模拟的手部骨骼点数据 (为了测试 UI 渲染)
  private generateMockHandData(time: number): HandData[] {
    const wave = Math.sin(time / 500) * 0.1;
    const mockLandmarks: Point3D[] = [];
    
    // 生成 21 个围绕中心点波动的关键点
    const centerX = 0.5 + wave;
    const centerY = 0.5 + Math.cos(time / 400) * 0.1;
    
    for(let i=0; i<21; i++) {
      mockLandmarks.push({
        x: centerX + (Math.random() - 0.5) * 0.2,
        y: centerY + (Math.random() - 0.5) * 0.2,
        z: (Math.random() - 0.5) * 0.1
      });
    }

    return [{
      handedness: 'Right',
      landmarks: mockLandmarks,
      currentGesture: GestureType.OpenHand
    }];
  }

  private analyzeGesture(landmarks: any[]): GestureType {
    const wrist = landmarks[0];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    
    const getDist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
    
    const indexDist = getDist(indexTip, wrist);
    const middleDist = getDist(middleTip, wrist);
    const indexBaseDist = getDist(landmarks[5], wrist);

    if (indexDist < indexBaseDist && middleDist < indexBaseDist) {
      return GestureType.Fist;
    } else if (indexDist > indexBaseDist * 1.5 && middleDist < indexBaseDist) {
      return GestureType.Pointing;
    } else if (indexDist > indexBaseDist * 1.5 && middleDist > indexBaseDist * 1.5) {
      return GestureType.OpenHand; 
    }
    
    return GestureType.Unknown;
  }
}
