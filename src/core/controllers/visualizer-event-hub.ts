/**
 * 可视化平台强类型事件总线 (VisualizerEventHub) - 观察者模式 (Observer / Pub-Sub Pattern)
 * 遵循 GoF 观察者模式与深模块原则：
 * 提供强类型、零依赖、内存安全的全局与局部事件分发机制，彻底解耦控制器、播放器、渲染器与各种视图面板。
 */

export interface VisualizerEventMap {
  /** 单步状态变更事件 */
  'step:change': { currentStep: number; totalSteps: number; stepData: any };
  /** 播放状态变更事件 (播放/暂停/结束) */
  'playback:state': { isPlaying: boolean; isFinished: boolean };
  /** 播放速度变更事件 */
  'playback:speed': { speed: number };
  /** 算法切换事件 */
  'algorithm:switch': { algorithmId: string; model: any };
  /** 演化阶段切换事件 (Stage 1 / 2 / 3 / 4) */
  'stage:change': { stage: number; isMemo: boolean; direction: 'forward' | 'reverse' };
  /** 视角与舞台模式切换事件 (2D / 3D) */
  'view-mode:change': { mode: '2d' | '3d' };
  /** 主题风格变更事件 */
  'theme:change': { themeId: string };
  /** 布局分隔条拖拽变更事件 */
  'layout:resize': { splitterId: string; size: number };
}

export type EventHandler<T> = (payload: T) => void;
export type UnsubscribeFn = () => void;

export class VisualizerEventHub {
  private static instance: VisualizerEventHub | null = null;
  private listeners: Map<keyof VisualizerEventMap, Set<EventHandler<any>>> = new Map();

  /**
   * 获取单例实例
   */
  public static getInstance(): VisualizerEventHub {
    if (!this.instance) {
      this.instance = new VisualizerEventHub();
    }
    return this.instance;
  }

  /**
   * 订阅指定事件
   * @param event 事件名称
   * @param handler 回调处理函数
   * @returns 取消订阅函数 (UnsubscribeFn)
   */
  public on<K extends keyof VisualizerEventMap>(
    event: K,
    handler: EventHandler<VisualizerEventMap[K]>
  ): UnsubscribeFn {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    return () => {
      this.off(event, handler);
    };
  }

  /**
   * 单次订阅事件（触发一次后自动销毁）
   */
  public once<K extends keyof VisualizerEventMap>(
    event: K,
    handler: EventHandler<VisualizerEventMap[K]>
  ): UnsubscribeFn {
    const wrapper: EventHandler<VisualizerEventMap[K]> = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };
    return this.on(event, wrapper);
  }

  /**
   * 取消订阅事件
   */
  public off<K extends keyof VisualizerEventMap>(
    event: K,
    handler: EventHandler<VisualizerEventMap[K]>
  ): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 发布/广播事件
   */
  public emit<K extends keyof VisualizerEventMap>(
    event: K,
    payload: VisualizerEventMap[K]
  ): void {
    const handlers = this.listeners.get(event);
    if (handlers && handlers.size > 0) {
      // 拷贝一份迭代，防止在回调过程中增删订阅者引发并发修改问题
      const handlersCopy = Array.from(handlers);
      for (const handler of handlersCopy) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[VisualizerEventHub] Error in handler for event "${String(event)}":`, err);
        }
      }
    }
  }

  /**
   * 清除所有订阅监听（在页面卸载或重置时调用）
   */
  public clear(): void {
    this.listeners.clear();
  }

  /**
   * 获取当前订阅者数量统计（供健康检查与单测验证）
   */
  public listenerCount<K extends keyof VisualizerEventMap>(event?: K): number {
    if (event) {
      return this.listeners.get(event)?.size ?? 0;
    }
    let total = 0;
    for (const set of this.listeners.values()) {
      total += set.size;
    }
    return total;
  }
}

export const eventHub = VisualizerEventHub.getInstance();
