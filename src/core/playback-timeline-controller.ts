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

import { eventHub } from './controllers/visualizer-event-hub';
import {
  PlaybackCommandInvoker,
  StepForwardCommand,
  StepBackwardCommand,
  JumpToStepCommand,
  ResetTimelineCommand,
  IPlaybackReceiver
} from './controllers/playback-commands';

export class PlaybackTimelineController {
  private currentStep = 0;
  private isPlaying = false;
  private timer: any = null;
  private speed = 900;
  private options: PlaybackTimelineOptions;
  private commandInvoker = new PlaybackCommandInvoker();

  private receiver: IPlaybackReceiver = {
    getCurrentStep: () => this.currentStep,
    getTotalSteps: () => this.options.getTotalSteps(),
    setStep: (step: number) => {
      this.currentStep = step;
      this.options.onStep(step);
    },
    getStepData: (idx: number) => ({ index: idx })
  };

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
    eventHub.emit('playback:speed', { speed: validSpeed });
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
        eventHub.emit('step:change', {
          currentStep: this.currentStep,
          totalSteps: currentTotal,
          stepData: { index: this.currentStep }
        });
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
   * 单步前进 - 基于命令模式 (StepForwardCommand)
   */
  public stepForward(): void {
    this.pause();
    this.commandInvoker.executeCommand(new StepForwardCommand(this.receiver));
  }

  /**
   * 单步后退 - 基于命令模式 (StepBackwardCommand)
   */
  public stepBackward(): void {
    this.pause();
    this.commandInvoker.executeCommand(new StepBackwardCommand(this.receiver));
  }

  /**
   * 定位到指定步数 - 基于命令模式 (JumpToStepCommand)
   */
  public seek(targetIndex: number): void {
    const total = this.options.getTotalSteps();
    const clamped = Math.max(0, Math.min(Math.max(0, total - 1), targetIndex));
    this.commandInvoker.executeCommand(new JumpToStepCommand(this.receiver, clamped));
  }

  /**
   * 重置到初始步 - 基于命令模式 (ResetTimelineCommand)
   */
  public reset(): void {
    this.pause();
    this.commandInvoker.executeCommand(new ResetTimelineCommand(this.receiver));
  }

  /**
   * 撤销上一步操作 (Undo Command)
   */
  public undo(): boolean {
    this.pause();
    return this.commandInvoker.undo();
  }

  /**
   * 重做上一步撤销操作 (Redo Command)
   */
  public redo(): boolean {
    this.pause();
    return this.commandInvoker.redo();
  }

  /**
   * 销毁控制器，清理所有定时器
   */
  public destroy(): void {
    this.pause();
    this.commandInvoker.clear();
  }

  private notifyStateChange(): void {
    const total = this.options.getTotalSteps();
    const isFinished = this.currentStep >= total - 1;
    eventHub.emit('playback:state', { isPlaying: this.isPlaying, isFinished });
    if (this.options.onStateChange) {
      this.options.onStateChange(this.isPlaying);
    }
  }
}
