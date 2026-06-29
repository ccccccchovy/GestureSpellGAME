import { TrackingResult } from '../ai/gesture-types';

export type IncomingMessageType = 'GAME_READY' | 'GAME_OVER' | 'SUBMIT_SCORE' | 'EXIT_GAME';

export interface IncomingMessage {
  type: IncomingMessageType;
  payload?: any;
}

type MessageHandler = (payload: any) => void;

export class PostMessageBus {
  private targetWindow: Window | null = null;
  private targetOrigin: string = '*';
  private handlers: Map<IncomingMessageType, MessageHandler[]> = new Map();
  private messageListener: (event: MessageEvent) => void;

  constructor() {
    this.messageListener = this.handleMessage.bind(this);
  }

  /**
   * 初始化总线并开始监听窗口消息
   */
  public connect(iframe: HTMLIFrameElement, targetOrigin: string = '*') {
    if (iframe.contentWindow) {
      this.targetWindow = iframe.contentWindow;
      this.targetOrigin = targetOrigin;
      window.addEventListener('message', this.messageListener);
    }
  }

  /**
   * 断开连接并移除监听器
   */
  public disconnect() {
    window.removeEventListener('message', this.messageListener);
    this.targetWindow = null;
    this.handlers.clear();
  }

  /**
   * 向 Iframe 内的游戏发送环境初始化信息
   */
  public sendInitEnv(username: string = 'Guest') {
    this.sendMessage('INIT_ENV', {
      platformVersion: '1.0',
      user: { username }
    });
  }

  /**
   * 向 Iframe 内的游戏高频发送 AI 追踪数据
   */
  public sendHandData(trackingData: TrackingResult) {
    // 为了减小序列化开销，仅发送必要字段
    this.sendMessage('AI_HAND_DATA', {
      timestamp: trackingData.timestamp,
      hands: trackingData.hands
    });
  }

  /**
   * 注册游戏消息监听器
   */
  public on(type: IncomingMessageType, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  /**
   * 移除游戏消息监听器
   */
  public off(type: IncomingMessageType, handler: MessageHandler) {
    const typeHandlers = this.handlers.get(type);
    if (typeHandlers) {
      this.handlers.set(type, typeHandlers.filter(h => h !== handler));
    }
  }

  // --- Private ---

  private sendMessage(type: string, payload: any) {
    if (!this.targetWindow) return;
    try {
      this.targetWindow.postMessage(
        { type, payload },
        this.targetOrigin
      );
    } catch (e) {
      console.error('Failed to postMessage to iframe', e);
    }
  }

  private handleMessage(event: MessageEvent) {
    // 在生产环境中应校验 event.origin
    // if (event.origin !== this.targetOrigin && this.targetOrigin !== '*') return;

    const data = event.data as IncomingMessage;
    if (!data || !data.type) return;

    const handlers = this.handlers.get(data.type);
    if (handlers) {
      handlers.forEach(handler => handler(data.payload));
    }
  }
}
