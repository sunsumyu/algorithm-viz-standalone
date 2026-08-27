import { eventHub } from './visualizer-event-hub';

/**
 * 可视化平台命令接口 (Command Pattern Interface)
 * 遵循 GoF 命令模式与单一职责原则：
 * 将播放控制请求封装为独立的对象，支持参数化调用、撤销、回溯与日志追踪。
 */
export interface IVisualizerCommand {
  readonly name: string;
  canExecute(): boolean;
  execute(): boolean;
  undo(): boolean;
}

/**
 * 播放控制器上下文接收者接口 (Command Receiver)
 */
export interface IPlaybackReceiver {
  getCurrentStep(): number;
  getTotalSteps(): number;
  setStep(targetStep: number): void;
  getStepData(index: number): any;
}

/**
 * 单步前进命令 (Step Forward Command)
 */
export class StepForwardCommand implements IVisualizerCommand {
  public readonly name = 'StepForwardCommand';
  private prevStepIndex = 0;

  constructor(private receiver: IPlaybackReceiver) {}

  public canExecute(): boolean {
    return this.receiver.getCurrentStep() < this.receiver.getTotalSteps() - 1;
  }

  public execute(): boolean {
    if (!this.canExecute()) return false;
    this.prevStepIndex = this.receiver.getCurrentStep();
    const nextStep = this.prevStepIndex + 1;
    this.receiver.setStep(nextStep);

    eventHub.emit('step:change', {
      currentStep: nextStep,
      totalSteps: this.receiver.getTotalSteps(),
      stepData: this.receiver.getStepData(nextStep)
    });
    return true;
  }

  public undo(): boolean {
    this.receiver.setStep(this.prevStepIndex);
    eventHub.emit('step:change', {
      currentStep: this.prevStepIndex,
      totalSteps: this.receiver.getTotalSteps(),
      stepData: this.receiver.getStepData(this.prevStepIndex)
    });
    return true;
  }
}

/**
 * 单步后退命令 (Step Backward Command)
 */
export class StepBackwardCommand implements IVisualizerCommand {
  public readonly name = 'StepBackwardCommand';
  private prevStepIndex = 0;

  constructor(private receiver: IPlaybackReceiver) {}

  public canExecute(): boolean {
    return this.receiver.getCurrentStep() > 0;
  }

  public execute(): boolean {
    if (!this.canExecute()) return false;
    this.prevStepIndex = this.receiver.getCurrentStep();
    const nextStep = this.prevStepIndex - 1;
    this.receiver.setStep(nextStep);

    eventHub.emit('step:change', {
      currentStep: nextStep,
      totalSteps: this.receiver.getTotalSteps(),
      stepData: this.receiver.getStepData(nextStep)
    });
    return true;
  }

  public undo(): boolean {
    this.receiver.setStep(this.prevStepIndex);
    eventHub.emit('step:change', {
      currentStep: this.prevStepIndex,
      totalSteps: this.receiver.getTotalSteps(),
      stepData: this.receiver.getStepData(this.prevStepIndex)
    });
    return true;
  }
}

/**
 * 目标步直接跳转命令 (Jump To Step Command)
 */
export class JumpToStepCommand implements IVisualizerCommand {
  public readonly name = 'JumpToStepCommand';
  private prevStepIndex = 0;

  constructor(
    private receiver: IPlaybackReceiver,
    private targetStep: number
  ) {}

  public canExecute(): boolean {
    const total = this.receiver.getTotalSteps();
    return this.targetStep >= 0 && this.targetStep < total;
  }

  public execute(): boolean {
    if (!this.canExecute()) return false;
    this.prevStepIndex = this.receiver.getCurrentStep();
    this.receiver.setStep(this.targetStep);

    eventHub.emit('step:change', {
      currentStep: this.targetStep,
      totalSteps: this.receiver.getTotalSteps(),
      stepData: this.receiver.getStepData(this.targetStep)
    });
    return true;
  }

  public undo(): boolean {
    this.receiver.setStep(this.prevStepIndex);
    eventHub.emit('step:change', {
      currentStep: this.prevStepIndex,
      totalSteps: this.receiver.getTotalSteps(),
      stepData: this.receiver.getStepData(this.prevStepIndex)
    });
    return true;
  }
}

/**
 * 时间线重置命令 (Reset Timeline Command)
 */
export class ResetTimelineCommand implements IVisualizerCommand {
  public readonly name = 'ResetTimelineCommand';
  private prevStepIndex = 0;

  constructor(private receiver: IPlaybackReceiver) {}

  public canExecute(): boolean {
    return this.receiver.getTotalSteps() > 0;
  }

  public execute(): boolean {
    if (!this.canExecute()) return false;
    this.prevStepIndex = this.receiver.getCurrentStep();
    this.receiver.setStep(0);

    eventHub.emit('step:change', {
      currentStep: 0,
      totalSteps: this.receiver.getTotalSteps(),
      stepData: this.receiver.getStepData(0)
    });
    return true;
  }

  public undo(): boolean {
    this.receiver.setStep(this.prevStepIndex);
    eventHub.emit('step:change', {
      currentStep: this.prevStepIndex,
      totalSteps: this.receiver.getTotalSteps(),
      stepData: this.receiver.getStepData(this.prevStepIndex)
    });
    return true;
  }
}

/**
 * 播放命令调用器 (PlaybackCommandInvoker)
 * 负责执行命令并维护执行历史堆栈
 */
export class PlaybackCommandInvoker {
  private history: IVisualizerCommand[] = [];
  private undoHistory: IVisualizerCommand[] = [];
  private maxHistorySize = 50;

  /**
   * 执行命令
   */
  public executeCommand(command: IVisualizerCommand): boolean {
    if (!command.canExecute()) return false;
    const success = command.execute();
    if (success) {
      this.history.push(command);
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }
      this.undoHistory = []; // 清空重做栈
    }
    return success;
  }

  /**
   * 撤销上一命令
   */
  public undo(): boolean {
    const lastCmd = this.history.pop();
    if (!lastCmd) return false;
    const success = lastCmd.undo();
    if (success) {
      this.undoHistory.push(lastCmd);
    }
    return success;
  }

  /**
   * 重做上一撤销命令
   */
  public redo(): boolean {
    const nextCmd = this.undoHistory.pop();
    if (!nextCmd) return false;
    return this.executeCommand(nextCmd);
  }

  /**
   * 清空历史
   */
  public clear(): void {
    this.history = [];
    this.undoHistory = [];
  }

  public getHistoryCount(): number {
    return this.history.length;
  }
}
