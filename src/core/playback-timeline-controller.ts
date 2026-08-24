/**
 * 时间轴播放控制器深度模块 (PlaybackTimelineController Deep Module)
 * 封装自动播放、暂停、步进、随机寻道与速度调节，提供零泄漏的定时器生命周期管理。
 */

export interface PlaybackTimelineOptions {
  /** 获取当前可用总步数 */
  getTotalSteps: () => number;
  /** 步数变更回调 */
  onStep: (stepIndex: number) => void;
  /** 播放状态变更回调 (可选) */
  onStateChange?: (isPlaying: boolean) => void;
  /** 默认播放间隔时间 (ms) */
  defaultSpeed?: number;
  /** 初始步数索引 (默认为 0) */
  initialStep?: number;
}

export class PlaybackTimelineController {
  private currentStep = 0;
  private isPlaying = false;
  private timer: any = null;
  private speed = 900;
  private options: PlaybackTimelineOptions;

  constructor(options: PlaybackTimelineOptions) {
    this.options = options;
    this.speed = options.defaultSpeed ?? 900;
    this.currentStep = options.initialStep ?? 0;
  }

  /**
   * 获取当前步骤索引
   */
  public getCurrentStep(): number {
    return this.currentStep;
  }

  /**
   * 获取播放状态
   */
  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * 获取当前播放间隔 (ms)
   */
  public getSpeed(): number {
    return this.speed;
  }

  /**
   * 设置播放速度
   */
  public setSpeed(speedMs: number): void {
    const validSpeed = Math.max(100, Math.min(3000, speedMs));
    this.speed = validSpeed;
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  /**
   * 开始自动播放
   */
  public play(): void {
    if (this.isPlaying) return;
    const total = this.options.getTotalSteps();
    if (total <= 0) return;

    // 如果已经在最后一步，从头开始
    if (this.currentStep >= total - 1) {
      this.seek(0);
    }

    this.isPlaying = true;
    this.notifyStateChange();

    this.timer = setInterval(() => {
      const currentTotal = this.options.getTotalSteps();
      if (this.currentStep < currentTotal - 1) {
        this.currentStep++;
        this.options.onStep(this.currentStep);
      } else {
        this.pause();
      }
    }, this.speed);
  }

  /**
   * 暂停自动播放
   */
  public pause(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.isPlaying) {
      this.isPlaying = false;
      this.notifyStateChange();
    }
  }

  /**
   * 切换播放/暂停
   */
  public toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * 单步前进
   */
  public stepForward(): void {
    this.pause();
    const total = this.options.getTotalSteps();
    if (this.currentStep < total - 1) {
      this.currentStep++;
      this.options.onStep(this.currentStep);
    }
  }

  /**
   * 单步后退
   */
  public stepBackward(): void {
    this.pause();
    if (this.currentStep > 0) {
      this.currentStep--;
      this.options.onStep(this.currentStep);
    }
  }

  /**
   * 定位到指定步数
   */
  public seek(targetIndex: number): void {
    const total = this.options.getTotalSteps();
    const clamped = Math.max(0, Math.min(Math.max(0, total - 1), targetIndex));
    this.currentStep = clamped;
    this.options.onStep(this.currentStep);
  }

  /**
   * 重置到初始步
   */
  public reset(): void {
    this.pause();
    this.seek(0);
  }

  /**
   * 销毁控制器，清理所有定时器
   */
  public destroy(): void {
    this.pause();
  }

  private notifyStateChange(): void {
    if (this.options.onStateChange) {
      this.options.onStateChange(this.isPlaying);
    }
  }
}
