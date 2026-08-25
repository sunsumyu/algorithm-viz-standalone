/**
 * 可视化状态保持与无缝过渡路由深度模块 (VisualizerStateRouter Deep Module)
 * 遵循单一职责与深度模块原则：
 * 封装状态到 URL Hash 的序列化与反序列化，实现不同视图版本（如精简版与精讲版）之间的无缝 1:1 状态保持与上下文恢复。
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

export class VisualizerStateRouter {
  /**
   * 将当前可视化状态序列化为 URL Hash
   */
  public static serialize(state: VisualizerState): string {
    const params = new URLSearchParams();
    if (state.algo) params.set('algo', state.algo);
    if (state.stage) params.set('stage', state.stage);
    if (state.dir) params.set('dir', state.dir);
    if (state.variant) params.set('variant', state.variant);
    if (state.theme) params.set('theme', state.theme);
    if (state.m !== undefined && state.m > 0) params.set('m', String(state.m));
    if (state.n !== undefined && state.n > 0) params.set('n', String(state.n));
    if (state.step !== undefined && state.step >= 0) params.set('step', String(state.step));
    return `#${params.toString()}`;
  }

  /**
   * 从当前窗口 URL Hash 解析并恢复状态
   */
  public static restore(): Partial<VisualizerState> | null {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    if (!hash) return null;

    try {
      const params = new URLSearchParams(hash);
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
   * 更新当前页面的 URL Hash (无需重载页面)
   */
  public static updateHash(state: VisualizerState): void {
    if (typeof window === 'undefined' || !window.history) return;
    const hash = this.serialize(state);
    window.history.replaceState(null, '', hash);
  }

  /**
   * 无缝跳转切换视图版本并携带当前状态
   */
  public static switchView(targetUrl: string, currentState: VisualizerState): void {
    const hash = this.serialize(currentState);
    const cleanUrl = targetUrl.split('#')[0];
    const destination = `${cleanUrl}${hash}`;

    if (window.parent && (window.parent as any).__toggleUniquePathsVersion) {
      (window.parent as any).__toggleUniquePathsVersion(targetUrl.includes('lite') ? 'lite' : 'full', currentState);
    }
    window.location.href = destination;
  }
}
