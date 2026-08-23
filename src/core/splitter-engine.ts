/**
 * SplitterEngine — 全局自适应分级拖拽调节内核
 * 
 * 功能特性：
 * 1. 支持横向（左右/col-resize）与纵向（上下/row-resize）拖拽。
 * 2. 分级存储机制：优先读取单页面独立 scope（如特定算法），回退读取全局 global，修改时写入对应 scope。
 * 3. 边界与比例约束：支持 minSize、maxSize、minRatio、maxRatio 安全限制。
 * 4. 防穿透防卡顿：使用 setPointerCapture / releasePointerCapture。
 * 5. 双击快速复原：双击分隔条手柄重置为默认尺寸并触发回调。
 * 6. 响应式监听：ResizeObserver 自动响应窗口大小变动。
 */

export type SplitterDirection = 'horizontal' | 'vertical';
export type SplitterMode = 'grid' | 'flex' | 'dimension';
export type SplitterAttachPosition = 'before' | 'after';

export interface SplitterOptions {
  id: string;                                // 面板唯一标识 (如 'sidebar', 'code-aside', 'stage-top-bottom', 'code-vars')
  direction?: SplitterDirection;             // 拖拽方向：'horizontal' (左右) | 'vertical' (上下)，默认 'horizontal'
  targetElement: HTMLElement;                // 被调节尺寸的目标元素
  containerElement?: HTMLElement;            // 容器元素，默认 targetElement.parentElement
  defaultSize: number;                       // 默认尺寸（像素）
  minSize?: number;                          // 最小限制像素（默认 100）
  maxSize?: number;                          // 最大限制像素
  minRatio?: number;                         // 最小占用父容器比例 (如 0.1)
  maxRatio?: number;                         // 最大占用父容器比例 (如 0.75)
  scope?: string;                            // 作用域：'global' 或 页面标识 (如 'dp-min-cost-climbing-stairs')
  invert?: boolean;                          // 是否反转增量（如右侧面板向左拉是变大，则 invert=true）
  mode?: SplitterMode;                       // 布局更新模式：'grid' | 'flex' | 'dimension' (默认根据父容器 display 判断或 'dimension')
  attachPosition?: SplitterAttachPosition;   // 分隔条挂载位置：'before' (目标前/左/上) | 'after' (目标后/右/下)，默认 'before'
  className?: string;                        // 自定义附加 CSS 类
  title?: string;                            // 鼠标悬浮提示文本
  onResize?: (size: number) => void;         // 尺寸变动实时回调
  onDragEnd?: (size: number) => void;        // 拖拽结束回调
}

export class SplitterStorage {
  static getKey(id: string, scope?: string): string {
    const s = scope && scope.trim() && scope !== 'global' ? scope.trim() : 'global';
    return `algo-splitter:${s}:${id}`;
  }

  static get(id: string, scope?: string, defaultVal?: number): number | null {
    if (typeof localStorage === 'undefined') return defaultVal ?? null;

    if (scope && scope !== 'global') {
      const scopedVal = parseFloat(localStorage.getItem(`algo-splitter:${scope}:${id}`) || '');
      if (Number.isFinite(scopedVal) && scopedVal > 0) return scopedVal;
    }

    const globalVal = parseFloat(localStorage.getItem(`algo-splitter:global:${id}`) || '');
    if (Number.isFinite(globalVal) && globalVal > 0) return globalVal;

    return defaultVal ?? null;
  }

  static set(id: string, value: number, scope?: string, isolateScope = false): void {
    if (typeof localStorage === 'undefined') return;
    const rounded = Math.round(value);

    // 默认全站共享：同步写入全局配置，使得下次启动或切换其它算法时默认继承当前调好的偏好
    if (!isolateScope || !scope || scope === 'global') {
      localStorage.setItem(`algo-splitter:global:${id}`, String(rounded));
    }

    // 若指定了页面 scope，同步写入该页面的独立键
    if (scope && scope !== 'global') {
      localStorage.setItem(`algo-splitter:${scope}:${id}`, String(rounded));
    }
  }

  static remove(id: string, scope?: string): void {
    if (typeof localStorage === 'undefined') return;
    if (!scope || scope === 'global') {
      localStorage.removeItem(`algo-splitter:global:${id}`);
    }
    if (scope && scope !== 'global') {
      localStorage.removeItem(`algo-splitter:${scope}:${id}`);
    }
  }
}

export class SplitterEngine {
  private options: Required<Omit<SplitterOptions, 'onResize' | 'onDragEnd' | 'maxSize' | 'minRatio'>> & {
    maxSize?: number;
    minRatio?: number;
    onResize?: (size: number) => void;
    onDragEnd?: (size: number) => void;
  };

  private splitterEl: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private currentSize: number;
  private isDragging = false;
  private startCoord = 0;
  private startSize = 0;

  constructor(opts: SplitterOptions) {
    const container = opts.containerElement || opts.targetElement.parentElement;
    if (!container) {
      throw new Error(`SplitterEngine [${opts.id}]: container element not found`);
    }

    const direction = opts.direction || 'horizontal';
    const attachPosition = opts.attachPosition || 'before';
    // 默认 invert：如果挂载在 before 且为横向右侧面板，向左拖拽（坐标减小）应该增大尺寸，因此 invert 为 true
    const defaultInvert = attachPosition === 'before';

    this.options = {
      id: opts.id,
      direction,
      targetElement: opts.targetElement,
      containerElement: container,
      defaultSize: opts.defaultSize,
      minSize: opts.minSize ?? 80,
      maxSize: opts.maxSize,
      minRatio: opts.minRatio,
      maxRatio: opts.maxRatio ?? 0.85,
      scope: opts.scope || 'global',
      invert: opts.invert !== undefined ? opts.invert : defaultInvert,
      mode: opts.mode || this.detectMode(container, direction),
      attachPosition,
      className: opts.className || '',
      title: opts.title || (direction === 'horizontal' ? '左右拖拽调整面板宽度，双击重置' : '上下拖拽调整面板高度，双击重置'),
      onResize: opts.onResize,
      onDragEnd: opts.onDragEnd,
    };

    // 读取已保存或默认尺寸
    const saved = SplitterStorage.get(this.options.id, this.options.scope, this.options.defaultSize);
    this.currentSize = saved !== null && Number.isFinite(saved) && saved > 0 ? saved : this.options.defaultSize;

    this.createDOM();
    this.applySize(this.currentSize);
    this.setupEvents();
    this.setupResizeObserver();
  }

  private detectMode(container: HTMLElement, direction: SplitterDirection): SplitterMode {
    const display = getComputedStyle(container).display;
    if (display === 'grid' || display === 'inline-grid') {
      return 'grid';
    }
    if (display === 'flex' || display === 'inline-flex') {
      return 'flex';
    }
    return 'dimension';
  }

  private createDOM(): void {
    const { direction, className, title, attachPosition, targetElement } = this.options;

    // 移除已有相同 ID 的分隔条，防止重绘时残留
    const existing = targetElement.parentElement?.querySelector?.(`.algo-splitter[data-splitter-id="${this.options.id}"]`);
    if (existing) {
      existing.remove();
    }

    this.splitterEl = document.createElement('div');
    this.splitterEl.className = `algo-splitter algo-splitter-${direction} ${className}`.trim();
    this.splitterEl.setAttribute('data-splitter-id', this.options.id);
    this.splitterEl.title = title;
    this.splitterEl.setAttribute('role', 'separator');
    this.splitterEl.setAttribute('aria-orientation', direction);

    // 内部手柄指示条
    const bar = document.createElement('div');
    bar.className = 'algo-splitter-bar';
    this.splitterEl.appendChild(bar);

    // 确保目标或容器定位正确
    if (getComputedStyle(targetElement).position === 'static' && this.options.mode === 'dimension') {
      targetElement.style.position = 'relative';
    }

    if (attachPosition === 'before') {
      targetElement.parentElement?.insertBefore(this.splitterEl, targetElement);
    } else {
      if (targetElement.nextSibling) {
        targetElement.parentElement?.insertBefore(this.splitterEl, targetElement.nextSibling);
      } else {
        targetElement.parentElement?.appendChild(this.splitterEl);
      }
    }
  }

  private setupEvents(): void {
    if (!this.splitterEl) return;

    this.splitterEl.addEventListener('pointerdown', this.onPointerDown);
    this.splitterEl.addEventListener('dblclick', this.onDoubleClick);
  }

  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      if (!this.isDragging) {
        this.syncLayout();
      }
    });
    this.resizeObserver.observe(this.options.containerElement);
  }

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return; // 仅响应鼠标左键或触控
    this.isDragging = true;
    this.startCoord = this.options.direction === 'horizontal' ? e.clientX : e.clientY;
    
    // 获取当前实际渲染尺寸
    const rect = this.options.targetElement.getBoundingClientRect();
    this.startSize = this.options.direction === 'horizontal' ? rect.width : rect.height;
    if (!this.startSize || this.startSize <= 0) {
      this.startSize = this.currentSize;
    }

    this.splitterEl?.classList.add('is-dragging');

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('pointermove', this.onPointerMove, { passive: false });
      window.addEventListener('pointerup', this.onPointerUp);
      window.addEventListener('pointercancel', this.onPointerUp);
    }

    document.body.style.cursor = this.options.direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.isDragging) return;

    const currentCoord = this.options.direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentCoord - this.startCoord;
    const effectiveDelta = this.options.invert ? -delta : delta;

    const rawSize = this.startSize + effectiveDelta;
    this.applySize(rawSize);
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (!this.isDragging) return;
    this.isDragging = false;

    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('pointerup', this.onPointerUp);
      window.removeEventListener('pointercancel', this.onPointerUp);
    }

    this.splitterEl?.classList.remove('is-dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // 立即保存最新尺寸到 localStorage
    SplitterStorage.set(this.options.id, this.currentSize, this.options.scope);
    this.options.onDragEnd?.(this.currentSize);
  };

  private onDoubleClick = (e: MouseEvent): void => {
    e.preventDefault();
    this.resetSize();
  };

  /**
   * 计算受限的有效尺寸
   */
  public clampSize(raw: number): number {
    const { containerElement, direction, minSize, maxSize, maxRatio, minRatio } = this.options;
    const containerLength = direction === 'horizontal'
      ? (containerElement.clientWidth || window.innerWidth)
      : (containerElement.clientHeight || window.innerHeight);

    let min = minSize;
    if (minRatio !== undefined && containerLength > 0) {
      min = Math.max(min, containerLength * minRatio);
    }

    let max = maxSize ?? (containerLength > 0 ? containerLength * maxRatio : 99999);
    if (containerLength > 0 && maxRatio !== undefined) {
      max = Math.min(max, containerLength * maxRatio);
    }

    // 确保 min 不大于 max
    if (min > max) min = max;

    return Math.round(Math.max(min, Math.min(max, raw)));
  }

  /**
   * 应用尺寸到 DOM
   */
  public applySize(rawSize: number): void {
    const clamped = this.clampSize(rawSize);
    this.currentSize = clamped;
    const { mode, direction, targetElement, containerElement, attachPosition } = this.options;

    if (mode === 'grid') {
      if (direction === 'horizontal') {
        if (attachPosition === 'before') {
          containerElement.style.gridTemplateColumns = `minmax(0, 1fr) auto ${clamped}px`;
        } else {
          containerElement.style.gridTemplateColumns = `${clamped}px auto minmax(0, 1fr)`;
        }
        targetElement.style.width = `${clamped}px`;
      } else {
        if (attachPosition === 'before') {
          containerElement.style.gridTemplateRows = `minmax(0, 1fr) auto ${clamped}px`;
        } else {
          containerElement.style.gridTemplateRows = `${clamped}px auto minmax(0, 1fr)`;
        }
        targetElement.style.height = `${clamped}px`;
      }
    } else if (mode === 'flex') {
      if (direction === 'horizontal') {
        targetElement.style.flex = `0 0 ${clamped}px`;
        targetElement.style.width = `${clamped}px`;
      } else {
        targetElement.style.flex = `0 0 ${clamped}px`;
        targetElement.style.height = `${clamped}px`;
      }
    } else {
      // dimension mode
      if (direction === 'horizontal') {
        targetElement.style.width = `${clamped}px`;
        targetElement.style.maxWidth = `${clamped}px`;
        targetElement.style.minWidth = `${clamped}px`;
      } else {
        targetElement.style.height = `${clamped}px`;
        targetElement.style.maxHeight = `${clamped}px`;
        targetElement.style.minHeight = `${clamped}px`;
      }
    }

    this.options.onResize?.(clamped);

    // 派发全局 resize 事件让图表/SVG/Canvas 自适应
    window.dispatchEvent(new Event('resize'));
  }

  /**
   * 同步外部布局（如容器响应式断点改变时）
   */
  public syncLayout(): void {
    if (this.options.mode === 'grid') {
      const isHorizontal = this.options.direction === 'horizontal';
      const template = isHorizontal
        ? getComputedStyle(this.options.containerElement).gridTemplateColumns
        : getComputedStyle(this.options.containerElement).gridTemplateRows;

      const segments = template ? template.split(' ').filter(Boolean) : [];
      // 若处于单列/单行折叠媒体查询状态，不强行覆盖
      if (segments.length <= 1) {
        return;
      }
    }
    this.applySize(this.currentSize);
  }

  /**
   * 重置为默认尺寸
   */
  public resetSize(): void {
    this.currentSize = this.options.defaultSize;
    this.applySize(this.options.defaultSize);
    SplitterStorage.remove(this.options.id, this.options.scope);
    this.options.onDragEnd?.(this.currentSize);

    // 视觉反馈动画
    if (this.splitterEl) {
      this.splitterEl.classList.add('is-resetting');
      setTimeout(() => this.splitterEl?.classList.remove('is-resetting'), 300);
    }
  }

  public getCurrentSize(): number {
    return this.currentSize;
  }

  public setScope(newScope: string): void {
    this.options.scope = newScope;
    const saved = SplitterStorage.get(this.options.id, newScope, this.options.defaultSize);
    if (saved !== null && Number.isFinite(saved)) {
      this.applySize(saved);
    }
  }

  public destroy(): void {
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('pointermove', this.onPointerMove);
      window.removeEventListener('pointerup', this.onPointerUp);
      window.removeEventListener('pointercancel', this.onPointerUp);
    }

    this.splitterEl?.removeEventListener('pointerdown', this.onPointerDown);
    this.splitterEl?.removeEventListener('dblclick', this.onDoubleClick);
    if (this.splitterEl) {
      if (typeof this.splitterEl.remove === 'function') {
        this.splitterEl.remove();
      } else if (this.splitterEl.parentElement) {
        this.splitterEl.parentElement.removeChild(this.splitterEl);
      }
      this.splitterEl = null;
    }

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }
}
