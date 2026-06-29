// 核心关键点类型
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 预定义的手势枚举
export enum GestureType {
  Unknown = 'UNKNOWN',
  OpenHand = 'OPEN_HAND',
  Fist = 'FIST',
  Pointing = 'POINTING',
  Peace = 'PEACE',
  ThumbsUp = 'THUMBS_UP',
}

// 单只手的结构
export interface HandData {
  handedness: 'Left' | 'Right';
  landmarks: Point3D[];
  currentGesture: GestureType;
}

// 引擎实时追踪结果
export interface TrackingResult {
  hands: HandData[];
  fps: number;
  latency: number;
  timestamp: number;
}

// 引擎运行状态
export enum EngineStatus {
  Idle = 'IDLE',
  Initializing = 'INITIALIZING',
  Running = 'RUNNING',
  Error = 'ERROR',
}
