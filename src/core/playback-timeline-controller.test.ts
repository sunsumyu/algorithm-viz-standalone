import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlaybackTimelineController } from './playback-timeline-controller';

describe('PlaybackTimelineController Deep Module', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('初始状态应该正确', () => {
    const onStep = vi.fn();
    const controller = new PlaybackTimelineController({
      getTotalSteps: () => 10,
      onStep,
      defaultSpeed: 800,
    });

    expect(controller.getCurrentStep()).toBe(0);
    expect(controller.getIsPlaying()).toBe(false);
    expect(controller.getSpeed()).toBe(800);
  });

  it('单步前进与后退应该精准回调且受边界约束', () => {
    const onStep = vi.fn();
    const controller = new PlaybackTimelineController({
      getTotalSteps: () => 3,
      onStep,
    });

    controller.stepForward();
    expect(controller.getCurrentStep()).toBe(1);
    expect(onStep).toHaveBeenCalledWith(1);

    controller.stepForward();
    expect(controller.getCurrentStep()).toBe(2);

    // 触碰最大边界，不再前进
    controller.stepForward();
    expect(controller.getCurrentStep()).toBe(2);

    // 后退
    controller.stepBackward();
    expect(controller.getCurrentStep()).toBe(1);

    controller.stepBackward();
    expect(controller.getCurrentStep()).toBe(0);

    // 触碰最小边界，不再后退
    controller.stepBackward();
    expect(controller.getCurrentStep()).toBe(0);
  });

  it('自动播放应该按节奏推进并在末尾自动暂停', () => {
    const onStep = vi.fn();
    const onStateChange = vi.fn();
    const controller = new PlaybackTimelineController({
      getTotalSteps: () => 3,
      onStep,
      onStateChange,
      defaultSpeed: 500,
    });

    controller.play();
    expect(controller.getIsPlaying()).toBe(true);
    expect(onStateChange).toHaveBeenCalledWith(true);

    // 经过 500ms -> 第 1 步
    vi.advanceTimersByTime(500);
    expect(controller.getCurrentStep()).toBe(1);
    expect(onStep).toHaveBeenCalledWith(1);

    // 经过 500ms -> 第 2 步 (最后一步)
    vi.advanceTimersByTime(500);
    expect(controller.getCurrentStep()).toBe(2);
    expect(onStep).toHaveBeenCalledWith(2);

    // 再经过 500ms -> 触发越界自动暂停
    vi.advanceTimersByTime(500);
    expect(controller.getIsPlaying()).toBe(false);
    expect(onStateChange).toHaveBeenCalledWith(false);
  });

  it('seek 应该支持精准寻道并触发边界保护', () => {
    const onStep = vi.fn();
    const controller = new PlaybackTimelineController({
      getTotalSteps: () => 10,
      onStep,
    });

    controller.seek(5);
    expect(controller.getCurrentStep()).toBe(5);
    expect(onStep).toHaveBeenCalledWith(5);

    controller.seek(999);
    expect(controller.getCurrentStep()).toBe(9);

    controller.seek(-50);
    expect(controller.getCurrentStep()).toBe(0);
  });

  it('调整播放速度在播放中应该无缝重启定时器', () => {
    const onStep = vi.fn();
    const controller = new PlaybackTimelineController({
      getTotalSteps: () => 10,
      onStep,
      defaultSpeed: 1000,
    });

    controller.play();
    expect(controller.getIsPlaying()).toBe(true);

    controller.setSpeed(200);
    expect(controller.getSpeed()).toBe(200);
    expect(controller.getIsPlaying()).toBe(true);

    vi.advanceTimersByTime(200);
    expect(controller.getCurrentStep()).toBe(1);

    controller.destroy();
    expect(controller.getIsPlaying()).toBe(false);
  });
});
