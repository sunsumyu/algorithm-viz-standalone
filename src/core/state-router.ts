/**
 * 可视化状态保持与无缝过渡路由深度模块 (VisualizerStateRouter Deep Module)
 * 遵循单一职责与深度模块原则：
 * 封装状态到 URL Hash / Search 参数的序列化与反序列化，实现不同视图版本（如精简看板版与全景精讲版）之间的无缝 1:1 状态保持与上下文恢复。
 */

export interface VisualizerState {
  algo?: string;
  stage: string;
  dir: 'forward' | 'reverse';
  variant?: string;
  m: number;
  n: number;
  step: number;
  theme?: string;
}

export interface IVisualizerMemento {
  readonly id: string;
  readonly timestamp: number;
  readonly title: string;
  readonly state: Readonly<VisualizerState>;
}

/**
 * 可视化状态备忘录 (VisualizerMemento) - 备忘录模式 (Memento Pattern)
 * 保存可视化核心状态不可变快照
 */
export class VisualizerMemento implements IVisualizerMemento {
  public readonly id: string;
  public readonly timestamp: number;
  public readonly title: string;
  public readonly state: Readonly<VisualizerState>;

  constructor(state: VisualizerState, title?: string, id?: string) {
    this.id = id || `memento-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    this.timestamp = Date.now();
    this.title = title || `快照 (${new Date().toLocaleTimeString()})`;
    this.state = Object.freeze({ ...state });
  }
}

/**
 * 备忘录管理者 (VisualizerCaretaker) - 备忘录模式 (Memento Pattern)
 * 统一维护快照历史、支持快照回溯与按需检索
 */
export class VisualizerCaretaker {
  private history: IVisualizerMemento[] = [];
  private maxHistory: number;

  constructor(maxHistory: number = 30) {
    this.maxHistory = maxHistory;
  }

  public save(state: VisualizerState, title?: string): IVisualizerMemento {
    const memento = new VisualizerMemento(state, title);
    this.history.push(memento);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    return memento;
  }

  public getHistory(): readonly IVisualizerMemento[] {
    return [...this.history];
  }

  public getLatest(): IVisualizerMemento | null {
    return this.history.length > 0 ? this.history[this.history.length - 1] : null;
  }

  public getById(id: string): IVisualizerMemento | null {
    return this.history.find((m) => m.id === id) || null;
  }

  public clear(): void {
    this.history = [];
  }
}

export class VisualizerStateRouter {
  /**
   * 将当前可视化状态序列化为 URL Hash 字符串 (带 # 前缀)
   */
  public static serialize(state: Partial<VisualizerState>): string {
    const params = new URLSearchParams();
    if (state.algo) params.set('algo', state.algo);
    if (state.stage) params.set('stage', state.stage);
    if (state.dir) params.set('dir', state.dir);
    if (state.variant) params.set('variant', state.variant);
    if (state.theme) params.set('theme', state.theme);
    if (state.m !== undefined && state.m > 0) params.set('m', String(state.m));
    if (state.n !== undefined && state.n > 0) params.set('n', String(state.n));
    if (state.step !== undefined && state.step >= 0) params.set('step', String(state.step));
    const str = params.toString();
    return str ? `#${str}` : '';
  }

  /**
   * 从纯文本 Hash 字符串中解析状态（纯函数，无环境依赖）
   */
  public static parseHash(hash: string): Partial<VisualizerState> | null {
    if (!hash) return null;
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!cleanHash) return null;

    try {
      const params = new URLSearchParams(cleanHash);
      const result: Partial<VisualizerState> = {};

      const algo = params.get('algo');
      if (algo) result.algo = algo;

      const stage = params.get('stage');
      if (stage) result.stage = stage;

      const dir = params.get('dir');
      if (dir === 'forward' || dir === 'reverse') result.dir = dir;

      const variant = params.get('variant');
      if (variant) result.variant = variant;

      const theme = params.get('theme');
      if (theme) result.theme = theme;

      const m = parseInt(params.get('m') || '');
      if (!isNaN(m) && m > 0) result.m = m;

      const n = parseInt(params.get('n') || '');
      if (!isNaN(n) && n > 0) result.n = n;

      const step = parseInt(params.get('step') || '');
      if (!isNaN(step) && step >= 0) result.step = step;

      return Object.keys(result).length > 0 ? result : null;
    } catch {
      return null;
    }
  }

  /**
   * 从当前浏览器 window.location.hash 中恢复状态
   */
  public static restore(): Partial<VisualizerState> | null {
    if (typeof window === 'undefined' || !window.location) return null;
    return this.parseHash(window.location.hash);
  }

  /**
   * 更新当前页面的 URL Hash (无需重载页面)
   */
  public static updateHash(state: Partial<VisualizerState>): void {
    if (typeof window === 'undefined' || !window.history) return;
    const hash = this.serialize(state);
    window.history.replaceState(null, '', hash || window.location.pathname + window.location.search);
  }

  /**
   * 合并基础状态与补丁状态
   */
  public static mergeState(base: VisualizerState, patch: Partial<VisualizerState>): VisualizerState {
    return {
      algo: patch.algo ?? base.algo,
      stage: patch.stage ?? base.stage,
      dir: patch.dir ?? base.dir,
      variant: patch.variant ?? base.variant,
      m: patch.m ?? base.m,
      n: patch.n ?? base.n,
      step: patch.step ?? base.step,
      theme: patch.theme ?? base.theme
    };
  }

  /**
   * 无缝跳转切换视图版本并携带当前状态
   */
  public static switchView(targetUrl: string, currentState: Partial<VisualizerState>): void {
    const hash = this.serialize(currentState);
    const cleanUrl = targetUrl.split('#')[0];
    const destination = `${cleanUrl}${hash}`;

    if (typeof window !== 'undefined') {
      if (window.parent && (window.parent as any).__toggleUniquePathsVersion) {
        (window.parent as any).__toggleUniquePathsVersion(targetUrl.includes('lite') ? 'lite' : 'full', currentState);
      }
      window.location.href = destination;
    }
  }
}
