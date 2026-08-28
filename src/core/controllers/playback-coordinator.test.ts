import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlaybackCoordinator } from './playback-coordinator';

describe('PlaybackCoordinator (Deep Module Unit Tests)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. 单步前进与后退状态流转', () => {
    const stepFn = vi.fn();
    const statusFn = vi.fn();
    const coordinator = new PlaybackCoordinator({
      totalSteps: 5,
      onStepChange: stepFn,
      onStatusChange: statusFn
    });

    expect(coordinator.getCurrentStep()).toBe(0);
    expect(coordinator.stepForward()).toBe(true);
    expect(coordinator.getCurrentStep()).toBe(1);
    expect(stepFn).toHaveBeenCalledWith(1, false);

    expect(coordinator.stepBackward()).toBe(true);
    expect(coordinator.getCurrentStep()).toBe(0);

    // 边界拦截：0 步无法继续后退
    expect(coordinator.stepBackward()).toBe(false);
    expect(coordinator.getCurrentStep()).toBe(0);
  });

  it('2. 自动连续播放与步进时钟调度', () => {
    const stepFn = vi.fn();
    const statusFn = vi.fn();
    const coordinator = new PlaybackCoordinator({
      totalSteps: 4,
      speedMs: 200,
      onStepChange: stepFn,
      onStatusChange: statusFn
    });

    coordinator.play();
    expect(coordinator.isPlaying()).toBe(true);
    expect(statusFn).toHaveBeenCalledWith('playing');

    // 推进 200ms
    vi.advanceTimersByTime(200);
    expect(coordinator.getCurrentStep()).toBe(1);
    expect(stepFn).toHaveBeenCalledWith(1, true);

    // 推进 400ms -> 到达第 3 步 (末尾) 自动暂停并触发 completed
    vi.advanceTimersByTime(400);
    expect(coordinator.getCurrentStep()).toBe(3);
    expect(coordinator.isPlaying()).toBe(false);
    expect(statusFn).toHaveBeenCalledWith('completed');
  });

  it('3. 精确跳转 seek 与动态变速 setSpeed', () => {
    const stepFn = vi.fn();
    const coordinator = new PlaybackCoordinator({
      totalSteps: 10,
      speedMs: 500,
      onStepChange: stepFn
    });

    coordinator.seek(7);
    expect(coordinator.getCurrentStep()).toBe(7);
    expect(stepFn).toHaveBeenCalledWith(7, false);

    // 播放中途变速
    coordinator.play();
    coordinator.setSpeed(100);
    vi.advanceTimersByTime(100);
    expect(coordinator.getCurrentStep()).toBe(8);
  });

  it('4. 实例销毁与定时器零泄漏', () => {
    const stepFn = vi.fn();
    const coordinator = new PlaybackCoordinator({
      totalSteps: 5,
      speedMs: 200,
      onStepChange: stepFn
    });

    coordinator.play();
    coordinator.destroy();
    expect(coordinator.isPlaying()).toBe(false);

    // 销毁后定时器不会继续触发
    vi.advanceTimersByTime(500);
    expect(stepFn).not.toHaveBeenCalled();
  });
});
