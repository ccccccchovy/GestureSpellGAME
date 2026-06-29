/**
 * Gesture Spell - Game SDK v1.0.0
 * 
 * 这是一个为第三方或内部游戏开发者提供的轻量级 SDK，
 * 用于在 Iframe 沙箱内与外层平台（AI 手部识别引擎）进行双向通信。
 */

class GestureSpellSDK {
    constructor() {
        this.isReady = false;
        this.onReadyCallback = null;
        this.onHandDataCallback = null;
        this.initMessageListener();
    }

    initMessageListener() {
        window.addEventListener('message', (event) => {
            const data = event.data;
            if (!data || !data.type) return;

            switch (data.type) {
                case 'INIT_ENV':
                    if (this.onReadyCallback) {
                        this.onReadyCallback(data.payload);
                    }
                    break;
                case 'AI_HAND_DATA':
                    if (this.isReady && this.onHandDataCallback) {
                        this.onHandDataCallback(data.payload);
                    }
                    break;
            }
        });
    }

    /**
     * 注册环境就绪回调。
     * @param {function} callback 
     */
    onReady(callback) {
        this.onReadyCallback = callback;
    }

    /**
     * 注册 AI 手势数据流回调。
     * @param {function} callback 
     */
    onHandData(callback) {
        this.onHandDataCallback = callback;
    }

    /**
     * 通知平台：游戏资源加载完毕，开始接收 AI 数据。
     */
    ready() {
        this.isReady = true;
        this.sendMessageToPlatform('GAME_READY');
    }

    /**
     * 通知平台：游戏结束。
     */
    gameOver() {
        this.sendMessageToPlatform('GAME_OVER');
    }

    /**
     * 提交分数至平台服务器。
     * @param {number} score 
     */
    submitScore(score) {
        this.sendMessageToPlatform('SUBMIT_SCORE', { score });
    }

    /**
     * 通知平台：退出游戏。
     */
    exitGame() {
        this.sendMessageToPlatform('EXIT_GAME');
    }

    sendMessageToPlatform(type, payload) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type, payload }, '*');
        } else {
            console.warn('[GestureSpell SDK] Not running inside an iframe. Message not sent:', type);
        }
    }
}

// 挂载到全局
if (typeof window !== 'undefined') {
    window.GestureSpellSDK = GestureSpellSDK;
}
