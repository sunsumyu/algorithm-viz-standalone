/**
 * 播放时钟与时序协调调度深模块 (PlaybackCoordinator Deep Module)
 *
 * 遵循深模块原则 (Deep Module & Seam Architecture)：
 * 1. 100% 零 DOM 依赖 (Zero-DOM)：纯领域状态机与安全定时调度，可在 Node.js / Vitest 环境中纯粹单测。
 * 2. 深度封装：彻底隐藏计时器生命周期、自校准单步调度、自动完成流转、防越界收敛 (Clamping) 与动态步数委托。
 * 3. 极窄接口与高杠杆：对外仅暴露状态流转方法与时序坐标通知，对算法具体领域数据（网格/树/堆栈）完全无感。
 * 4. 彻底消除时序竞争与定时器泄漏 (Idempotent Teardown)。
 */

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'completed';

export interface PlaybackSnapshot {
  currentIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  status: PlaybackStatus;
  isFinished: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export interface PlaybackOptions {
  /** 总步数或动态步数获取函数 */
  totalSteps?: number | (() => number);
  /** 初始步骤索引 (0-based) */
  initialIndex?: number;
  initialStep?: number;
  /** 单步播放间隔时间 (毫秒)，默认 900ms */
  speed?: number;
  speedMs?: number;
  /** 步骤索引改变事件回调（由单步、跳转、自动播放触发） */
  onStepChange?: (index: number, isAutoTick: boolean) => void;
  /** 播放状态变更回调 */
  onStatusChange?: (status: PlaybackStatus) => void;
  /** 完整状态快照变更事件回调 */
  onStateChange?: (snapshot: PlaybackSnapshot) => void;
}

export type PlaybackCoordinatorOptions = PlaybackOptions;

export class PlaybackCoordinator {
  private _totalStepsProvider: number | (() => number);
  private _currentIndex: number = 0;
  private _speed: number = 900;
  private _status: PlaybackStatus = 'idle';
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _isDestroyed: boolean = false;

  private readonly onStepChange?: (index: number, isAutoTick: boolean) => void;
  private readonly onStatusChange?: (status: PlaybackStatus) => void;
  private readonly onStateChange?: (snapshot: PlaybackSnapshot) => void;

  constructor(options: PlaybackOptions = {}) {
    this._totalStepsProvider = options.totalSteps ?? 0;
    this._speed = Math.max(10, options.speed ?? options.speedMs ?? 900);
    this.onStepChange = options.onStepChange;
    this.onStatusChange = options.onStatusChange;
    this.onStateChange = options.onStateChange;

    const rawInitial = options.initialIndex ?? options.initialStep ?? 0;
    this._currentIndex = this.clampIndex(rawInitial);
  }

  // ================= 状态查询 Getter / Methods =================

  public getTotalSteps(): number {
    return typeof this._totalStepsProvider === 'function'
      ? Math.max(0, this._totalStepsProvider())
      : Math.max(0, this._totalStepsProvider);
  }

  public get totalSteps(): number {
    return this.getTotalSteps();
  }

  public getCurrentStep(): number {
    return this._currentIndex;
  }

  public get currentIndex(): number {
    return this._currentIndex;
  }

  public get speed(): number {
    return this._speed;
  }

  public get speedMs(): number {
    return this._speed;
  }

  public isPlaying(): boolean {
    return this._status === 'playing';
  }

  public get status(): PlaybackStatus {
    return this._status;
  }

  public getStatus(): PlaybackStatus {
    return this._status;
  }

  public get isFinished(): boolean {
    const total = this.getTotalSteps();
    if (total <= 0) return true;
    return this._currentIndex >= total - 1;
  }

  public get canGoNext(): boolean {
    const total = this.getTotalSteps();
    return total > 0 && this._currentIndex < total - 1;
  }

  public get canGoPrev(): boolean {
    const total = this.getTotalSteps();
    return total > 0 && this._currentIndex > 0;
  }

  public getSnapshot(): PlaybackSnapshot {
    return {
      currentIndex: this._currentIndex,
      totalSteps: this.getTotalSteps(),
      isPlaying: this.isPlaying(),
      speed: this._speed,
      status: this._status,
      isFinished: this.isFinished,
      canGoNext: this.canGoNext,
      canGoPrev: this.canGoPrev,
    };
  }

  // ================= 播放状态机操作 =================

  /**
   * 启动自动连续播放
   * 若当前已到达末尾，播放时自动从头开始
   */
  public play(): void {
    if (this._isDestroyed) return;
    const total = this.getTotalSteps();
    if (total <= 0) return;
    if (this._status === 'playing') return;

    if (this.isFinished) {
      this._currentIndex = 0;
      this.notifyStepChange(false);
    }

    this.setStatus('playing');
    this.scheduleNextTick();
  }

  /**
   * 暂停自动播放
   */
  public pause(): void {
    if (this._status !== 'playing') return;
    this.clearTimer();
    this.setStatus('paused');
  }

  /**
   * 播放 / 暂停切换
   */
  public togglePlay(): void {
    if (this.isFinished) {
      this.seek(0);
      this.play();
      return;
    }
    this.isPlaying() ? this.pause() : this.play();
  }

  /**
   * 单步前进一步
   * @returns 是否成功前进 (到达末尾时返回 false)
   */
  public stepForward(): boolean {
    this.pause();
    const total = this.getTotalSteps();
    if (this._currentIndex < total - 1) {
      this._currentIndex++;
      this.notifyStepChange(false);
      if (this._currentIndex === total - 1) {
        this.setStatus('completed');
      }
      return true;
    }
    return false;
  }

  /**
   * 单步后退一步
   * @returns 是否成功后退 (到达起点时返回 false)
   */
  public stepBackward(): boolean {
    this.pause();
    if (this._currentIndex > 0) {
      this._currentIndex--;
      this.notifyStepChange(false);
      return true;
    }
    return false;
  }

  /** 别名：单步前进 */
  public next(): void {
    this.stepForward();
  }

  /** 别名：单步后退 */
  public prev(): void {
    this.stepBackward();
  }

  /**
   * 精确跳转到指定步数索引
   */
  public seek(index: number): void {
    if (this._isDestroyed) return;
    this.pause();
    const total = this.getTotalSteps();
    const clamped = this.clampIndex(index);
    if (clamped !== this._currentIndex) {
      this._currentIndex = clamped;
      this.notifyStepChange(false);
      if (this._currentIndex === total - 1 && total > 1) {
        this.setStatus('completed');
      }
    }
  }

  /**
   * 复位重置到起始第 0 步并暂停
   */
  public reset(): void {
    this.pause();
    this._currentIndex = 0;
    this.setStatus('idle');
    this.notifyStepChange(false);
  }

  /**
   * 动态更新播放速度 (毫秒)
   */
  public setSpeed(speedMs: number): void {
    const validSpeed = Math.max(10, speedMs);
    if (validSpeed !== this._speed) {
      this._speed = validSpeed;
      if (this.isPlaying()) {
        this.clearTimer();
        this.scheduleNextTick();
      }
      this.notifyStateChange();
    }
  }

  /**
   * 更新总步数 (当算法入参切换或重新生成单步流时)
   */
  public setTotalSteps(total: number | (() => number), resetToStart: boolean = true): void {
    this.pause();
    this._totalStepsProvider = total;
    if (resetToStart) {
      this._currentIndex = 0;
    } else {
      this._currentIndex = this.clampIndex(this._currentIndex);
    }
    this.setStatus('idle');
    this.notifyStateChange();
  }

  /**
   * 彻底销毁实例并清除所有定时器引用，保证幂等性与零泄漏
   */
  public destroy(): void {
    this._isDestroyed = true;
    this.clearTimer();
    this.setStatus('idle');
  }

  // ================= 内部调度机制 =================

  private scheduleNextTick(): void {
    this.clearTimer();
    if (!this.isPlaying() || this._isDestroyed) return;

    this._timer = setTimeout(() => {
      if (!this.isPlaying() || this._isDestroyed) return;

      const total = this.getTotalSteps();
      if (this._currentIndex < total - 1) {
        this._currentIndex++;
        this.notifyStepChange(true);

        if (this._currentIndex < total - 1) {
          this.scheduleNextTick();
        } else {
          this.clearTimer();
          this.setStatus('completed');
        }
      } else {
        this.clearTimer();
        this.setStatus('completed');
      }
    }, this._speed);
  }

  private clearTimer(): void {
    if (this._timer !== null) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  private clampIndex(index: number): number {
    const total = this.getTotalSteps();
    if (total <= 0) return 0;
    return Math.max(0, Math.min(index, total - 1));
  }

  private setStatus(status: PlaybackStatus): void {
    if (this._status !== status) {
      this._status = status;
      this.onStatusChange?.(this._status);
      this.notifyStateChange();
    }
  }

  private notifyStepChange(isAutoTick: boolean): void {
    if (this._isDestroyed) return;
    this.onStepChange?.(this._currentIndex, isAutoTick);
    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    if (this._isDestroyed) return;
    this.onStateChange?.(this.getSnapshot());
  }
}
