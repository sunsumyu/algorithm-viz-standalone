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
import { PlaybackCoordinator } from './controllers/playback-coordinator';
import {
  PlaybackCommandInvoker,
  StepForwardCommand,
  StepBackwardCommand,
  JumpToStepCommand,
  ResetTimelineCommand,
  IPlaybackReceiver
} from './controllers/playback-commands';

export class PlaybackTimelineController {
  private coordinator: PlaybackCoordinator;
  private options: PlaybackTimelineOptions;
  private commandInvoker = new PlaybackCommandInvoker();

  private receiver: IPlaybackReceiver = {
    getCurrentStep: () => this.coordinator.getCurrentStep(),
    getTotalSteps: () => this.options.getTotalSteps(),
    setStep: (step: number) => {
      this.coordinator.seek(step);
    },
    getStepData: (idx: number) => ({ index: idx })
  };

  constructor(options: PlaybackTimelineOptions) {
    this.options = options;
    this.coordinator = new PlaybackCoordinator({
      totalSteps: () => options.getTotalSteps(),
      initialStep: options.initialStep ?? 0,
      speedMs: options.defaultSpeed ?? 900,
      onStepChange: (stepIndex, isAuto) => {
        this.options.onStep(stepIndex);
        if (isAuto) {
          eventHub.emit('step:change', {
            currentStep: stepIndex,
            totalSteps: this.options.getTotalSteps(),
            stepData: { index: stepIndex }
          });
        }
      },
      onStatusChange: (status) => {
        const isPlaying = status === 'playing';
        const total = this.options.getTotalSteps();
        const isFinished = this.coordinator.getCurrentStep() >= total - 1;
        this.options.onStateChange?.(isPlaying);
        eventHub.emit('playback:state', { isPlaying, isFinished });
      }
    });
  }

  /**
   * 获取当前步骤索引
   */
  public getCurrentStep(): number {
    return this.coordinator.getCurrentStep();
  }

  /**
   * 获取播放状态
   */
  public getIsPlaying(): boolean {
    return this.coordinator.isPlaying();
  }

  /**
   * 获取当前播放间隔 (ms)
   */
  public getSpeed(): number {
    return (this.coordinator as any).speedMs ?? 600;
  }

  /**
   * 设置播放速度
   */
  public setSpeed(speedMs: number): void {
    const validSpeed = Math.max(50, Math.min(3000, speedMs));
    this.coordinator.setSpeed(validSpeed);
    eventHub.emit('playback:speed', { speed: validSpeed });
  }

  /**
   * 开始自动播放
   */
  public play(): void {
    this.coordinator.play();
  }

  /**
   * 暂停自动播放
   */
  public pause(): void {
    this.coordinator.pause();
  }

  /**
   * 切换播放/暂停
   */
  public toggle(): void {
    this.coordinator.togglePlay();
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
   * 动态更新总步数并可选重置当前指针
   */
  public setTotalSteps(total: number, resetToStart = false): void {
    this.coordinator.setTotalSteps(total, resetToStart);
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
   * 销毁控制器与解绑
   */
  public destroy(): void {
    this.coordinator.destroy();
  }

  private notifyStateChange(): void {
    const isPlaying = this.coordinator.isPlaying();
    const total = this.options.getTotalSteps();
    const isFinished = this.coordinator.getCurrentStep() >= total - 1;
    this.options.onStateChange?.(isPlaying);
    eventHub.emit('playback:state', { isPlaying, isFinished });
  }
}
