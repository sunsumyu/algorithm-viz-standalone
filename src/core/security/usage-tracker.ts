/**
 * 全域用户行为追踪器 (Usage Tracker)
 *
 * 职责：
 * 1. 记录应用全生命周期安全与使用事件：启动、算法打开、复制、登录注册、
 *    激活、扣次消费、权益兑换与安全违规；
 * 2. 本地有界环形日志持久化 (localStorage, 默认上限 1000 条)，零网络依赖；
 * 3. 事件绑定当前授权身份 (手机号掩码 / 激活码 user_id)，为泄露溯源与
 *    未来按量计费对账提供完整行为链证据；
 * 4. 预留 `UsageReportSink` 上报接缝：未来接入计费服务端时注入 HTTP sink
 *    即可实现事件回传，本模块契约保持不变。
 */

export type UsageEventType =
  | 'APP_LAUNCH'
  | 'ALGORITHM_OPEN'
  | 'COPY_TEXT'
  | 'ACCOUNT_REGISTERED'
  | 'ACCOUNT_LOGGED_IN'
  | 'ACCOUNT_LOGGED_OUT'
  | 'LICENSE_ACTIVATED'
  | 'CREDIT_CONSUMED'
  | 'VOUCHER_REDEEMED'
  | 'ACCESS_DENIED'
  | 'SECURITY_VIOLATION';

export interface UsageEvent {
  /** 单调递增序号 */
  seq: number;
  /** 事件时间戳 (epoch ms) */
  t: number;
  type: UsageEventType;
  /** 当前授权身份（手机号掩码 / user_id / anonymous） */
  identity: string;
  /** 会话标识（每次应用启动唯一） */
  sid: string;
  algorithmId?: string;
  detail?: Record<string, unknown>;
}

/**
 * 事件上报接缝：未来计费服务端实现该接口注入即可
 */
export interface UsageReportSink {
  readonly name: string;
  report(events: UsageEvent[]): Promise<void>;
}

export const USAGE_LOG_STORAGE_KEY = 'alg_viz_usage_log_v1';
export const MAX_TRACKED_EVENTS = 1000;

function generateSessionId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export class UsageTracker {
  private events: UsageEvent[] = [];
  private seqCursor = 0;
  private sessionId: string;
  private identity = 'anonymous';
  private sink: UsageReportSink | null = null;
  private pendingForSink: UsageEvent[] = [];

  constructor(sessionId: string = generateSessionId()) {
    this.sessionId = sessionId;
    this.events = this.loadFromStorage();
    this.seqCursor = this.events.length > 0 ? this.events[this.events.length - 1].seq : 0;
  }

  /**
   * 绑定当前授权身份（登录 / 激活状态变化时调用）
   */
  public setIdentity(identity: string): void {
    if (identity && identity !== this.identity) {
      this.identity = identity;
    }
  }

  public getIdentity(): string {
    return this.identity;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * 注入未来计费服务端的上报器（接缝）
   */
  public setSink(sink: UsageReportSink | null): void {
    this.sink = sink;
  }

  /**
   * 记录一次使用事件（追加持久化 + 触发上报）
   */
  public track(type: UsageEventType, payload?: { algorithmId?: string; detail?: Record<string, unknown> }): UsageEvent {
    this.seqCursor += 1;
    const event: UsageEvent = {
      seq: this.seqCursor,
      t: Date.now(),
      type,
      identity: this.identity,
      sid: this.sessionId,
      ...(payload?.algorithmId ? { algorithmId: payload.algorithmId } : {}),
      ...(payload?.detail ? { detail: payload.detail } : {}),
    };

    this.events.push(event);
    if (this.events.length > MAX_TRACKED_EVENTS) {
      this.events.splice(0, this.events.length - MAX_TRACKED_EVENTS);
    }
    this.persistToStorage();

    if (this.sink) {
      this.pendingForSink.push(event);
      void this.flush();
    }

    return event;
  }

  /**
   * 将缓冲事件推送给已注入的上报器；失败静默保留待下次补发
   */
  public async flush(): Promise<boolean> {
    if (!this.sink || this.pendingForSink.length === 0) {
      return false;
    }
    const batch = this.pendingForSink;
    try {
      await this.sink.report(batch);
      this.pendingForSink = this.pendingForSink.filter((e) => !batch.includes(e));
      return true;
    } catch {
      return false;
    }
  }

  public getEvents(): UsageEvent[] {
    return [...this.events];
  }

  public exportEventsJson(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        sessionId: this.sessionId,
        identity: this.identity,
        count: this.events.length,
        events: this.events,
      },
      null,
      2
    );
  }

  public clear(): void {
    this.events = [];
    this.pendingForSink = [];
    this.seqCursor = 0;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(USAGE_LOG_STORAGE_KEY);
    }
  }

  private loadFromStorage(): UsageEvent[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    try {
      const raw = localStorage.getItem(USAGE_LOG_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as UsageEvent[];
      return Array.isArray(parsed) ? parsed.slice(-MAX_TRACKED_EVENTS) : [];
    } catch {
      return [];
    }
  }

  private persistToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(USAGE_LOG_STORAGE_KEY, JSON.stringify(this.events));
    } catch {
      // 存储配额满等异常：追踪日志不得影响主流程
    }
  }
}

export const usageTracker = new UsageTracker();
