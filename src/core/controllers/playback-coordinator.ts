/**
 * 播放时序与时钟调度协调器 (PlaybackCoordinator Deep Module)
 * 遵循单一职责与深模块原则：
 * 彻底封装播放/暂停状态机、定时器生命周期管理 (setInterval/clearInterval)、
 * 播放倍速切换、边界自动终止与跳转 (seek) 控制。
 * 对外呈现纯净的高杠杆接口，调用方无需直接接触或管理任何定时器 ID。
 */

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'completed';

export interface PlaybackCoordinatorOptions {
  /** 总步数或动态步数获取函数 */
  totalSteps: number | (() => number);
  /** 初始步数索引 (0-based) */
  initialStep?: number;
  /** 播放间隔时间 (毫秒)，默认 600ms */
  speedMs?: number;
  /** 步数发生变更时的通知回调 */
  onStepChange: (index: number, isAutoTick: boolean) => void;
  /** 播放状态变更回调 */
  onStatusChange?: (status: PlaybackStatus) => void;
}

export class PlaybackCoordinator {
  private totalStepsProvider: number | (() => number);
  private currentStep: number;
  private speedMs: number;
  private timerId: any = null;
  private status: PlaybackStatus = 'idle';
  private onStepChange: (index: number, isAutoTick: boolean) => void;
  private onStatusChange?: (status: PlaybackStatus) => void;

  constructor(options: PlaybackCoordinatorOptions) {
    this.totalStepsProvider = options.totalSteps;
    this.speedMs = Math.max(50, options.speedMs ?? 600);
    this.onStepChange = options.onStepChange;
    this.onStatusChange = options.onStatusChange;
    const total = this.getTotalSteps();
    this.currentStep = Math.min(Math.max(0, options.initialStep ?? 0), Math.max(0, total - 1));
  }

  public getTotalSteps(): number {
    return typeof this.totalStepsProvider === 'function'
      ? Math.max(0, this.totalStepsProvider())
      : Math.max(0, this.totalStepsProvider);
  }

  /**
   * 启动自动连续播放
   */
  public play(): void {
    const total = this.getTotalSteps();
    if (total <= 0) return;
    if (this.status === 'playing') return;

    // 若当前已达末尾，播放时自动从头开始
    if (this.currentStep >= total - 1) {
      this.currentStep = 0;
      this.onStepChange(this.currentStep, false);
    }

    this.setStatus('playing');
    this.startTimer();
  }

  /**
   * 暂停自动播放
   */
  public pause(): void {
    if (this.status !== 'playing') return;
    this.clearTimer();
    this.setStatus('paused');
  }

  /**
   * 播放 / 暂停快速切换
   */
  public togglePlay(): void {
    if (this.isPlaying()) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * 单步前进一步
   */
  public stepForward(): boolean {
    this.pause();
    const total = this.getTotalSteps();
    if (this.currentStep < total - 1) {
      this.currentStep++;
      this.onStepChange(this.currentStep, false);
      if (this.currentStep === total - 1) {
        this.setStatus('completed');
      }
      return true;
    }
    return false;
  }

  /**
   * 单步后退一步
   */
  public stepBackward(): boolean {
    this.pause();
    if (this.currentStep > 0) {
      this.currentStep--;
      this.onStepChange(this.currentStep, false);
      return true;
    }
    return false;
  }

  /**
   * 精确跳转到指定步数索引
   */
  public seek(index: number): void {
    const total = this.getTotalSteps();
    const target = Math.min(Math.max(0, index), Math.max(0, total - 1));
    this.currentStep = target;
    this.onStepChange(this.currentStep, false);
    if (this.currentStep === total - 1 && total > 1) {
      this.setStatus('completed');
    }
  }

  /**
   * 动态更新播放速度
   */
  public setSpeed(speedMs: number): void {
    this.speedMs = Math.max(50, speedMs);
    if (this.isPlaying()) {
      this.clearTimer();
      this.startTimer();
    }
  }

  /**
   * 复位重置到起始第 0 步
   */
  public reset(): void {
    this.pause();
    this.currentStep = 0;
    this.setStatus('idle');
    this.onStepChange(this.currentStep, false);
  }

  /**
   * 更新总步数 (当算法或参数切换时)
   */
  public setTotalSteps(total: number | (() => number), resetToStart: boolean = true): void {
    this.pause();
    this.totalStepsProvider = total;
    const totalNum = this.getTotalSteps();
    if (resetToStart || this.currentStep >= totalNum) {
      this.currentStep = 0;
    }
    this.setStatus('idle');
  }

  public getCurrentStep(): number {
    return this.currentStep;
  }

  public isPlaying(): boolean {
    return this.status === 'playing';
  }

  public getStatus(): PlaybackStatus {
    return this.status;
  }

  /**
   * 彻底销毁实例并清除一切定时器引用，防止内存泄漏
   */
  public destroy(): void {
    this.clearTimer();
    this.setStatus('idle');
  }

  // ================= 内部时序处理 =================

  private startTimer(): void {
    this.clearTimer();
    this.timerId = setInterval(() => {
      const total = this.getTotalSteps();
      if (this.currentStep < total - 1) {
        this.currentStep++;
        this.onStepChange(this.currentStep, true);
        if (this.currentStep >= total - 1) {
          this.pause();
          this.setStatus('completed');
        }
      } else {
        this.pause();
        this.setStatus('completed');
      }
    }, this.speedMs);
  }

  private clearTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private setStatus(status: PlaybackStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.onStatusChange?.(this.status);
    }
  }
}
