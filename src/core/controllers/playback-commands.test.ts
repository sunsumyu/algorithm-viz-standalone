import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  StepForwardCommand,
  StepBackwardCommand,
  JumpToStepCommand,
  ResetTimelineCommand,
  PlaybackCommandInvoker,
  IPlaybackReceiver
} from './playback-commands';
import { eventHub } from './visualizer-event-hub';

describe('Playback Commands Deep Module Guard (Command Pattern)', () => {
  let currentStep = 0;
  const totalSteps = 5;
  const mockSteps = [
    { type: 'init', val: 0 },
    { type: 'entry', val: 1 },
    { type: 'update', val: 2 },
    { type: 'update', val: 3 },
    { type: 'return', val: 4 }
  ];

  const receiver: IPlaybackReceiver = {
    getCurrentStep: () => currentStep,
    getTotalSteps: () => totalSteps,
    setStep: (step: number) => {
      currentStep = step;
    },
    getStepData: (idx: number) => mockSteps[idx]
  };

  let invoker: PlaybackCommandInvoker;

  beforeEach(() => {
    currentStep = 0;
    eventHub.clear();
    invoker = new PlaybackCommandInvoker();
  });

  it('should execute StepForwardCommand and update receiver & eventHub', () => {
    const fn = vi.fn();
    eventHub.on('step:change', fn);

    const cmd = new StepForwardCommand(receiver);
    const success = invoker.executeCommand(cmd);

    expect(success).toBe(true);
    expect(currentStep).toBe(1);
    expect(fn).toHaveBeenCalledWith({
      currentStep: 1,
      totalSteps: 5,
      stepData: mockSteps[1]
    });
  });

  it('should support undo and redo via PlaybackCommandInvoker', () => {
    invoker.executeCommand(new StepForwardCommand(receiver)); // step 1
    invoker.executeCommand(new StepForwardCommand(receiver)); // step 2
    expect(currentStep).toBe(2);

    invoker.undo();
    expect(currentStep).toBe(1);

    invoker.redo();
    expect(currentStep).toBe(2);
  });

  it('should execute JumpToStepCommand and ResetTimelineCommand correctly', () => {
    invoker.executeCommand(new JumpToStepCommand(receiver, 3));
    expect(currentStep).toBe(3);

    invoker.executeCommand(new ResetTimelineCommand(receiver));
    expect(currentStep).toBe(0);
  });

  it('should reject execution when boundary conditions are not met', () => {
    currentStep = 0;
    const backwardCmd = new StepBackwardCommand(receiver);
    expect(backwardCmd.canExecute()).toBe(false);
    expect(invoker.executeCommand(backwardCmd)).toBe(false);

    currentStep = 4;
    const forwardCmd = new StepForwardCommand(receiver);
    expect(forwardCmd.canExecute()).toBe(false);
    expect(invoker.executeCommand(forwardCmd)).toBe(false);
  });
});
