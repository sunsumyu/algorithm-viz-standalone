import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PlaybackCoordinator } from './playback-coordinator';

describe('PlaybackCoordinator (Deep Module)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('初始状态应符合零 DOM 纯状态机契约', () => {
    const stepChanged = vi.fn();
    const stateChanged = vi.fn();

    const coordinator = new PlaybackCoordinator({
      totalSteps: 5,
      speed: 800,
      onStepChange: stepChanged,
      onStateChange: stateChanged,
    });

    expect(coordinator.currentIndex).toBe(0);
    expect(coordinator.totalSteps).toBe(5);
    expect(coordinator.isPlaying()).toBe(false);
    expect(coordinator.speed).toBe(800);
    expect(coordinator.isFinished).toBe(false);
    expect(coordinator.canGoNext).toBe(true);
    expect(coordinator.canGoPrev).toBe(false);
  });

  it('单步步进与回退应精确触发回调并具备边界保护', () => {
    const stepChanged = vi.fn();
    const coordinator = new PlaybackCoordinator({
      totalSteps: 3,
      onStepChange: stepChanged,
    });

    coordinator.next();
    expect(coordinator.currentIndex).toBe(1);
    expect(stepChanged).toHaveBeenCalledWith(1, false);

    coordinator.next();
    expect(coordinator.currentIndex).toBe(2);
    expect(coordinator.isFinished).toBe(true);
    expect(coordinator.canGoNext).toBe(false);

    // 到达终点继续 next 不应越界
    coordinator.next();
    expect(coordinator.currentIndex).toBe(2);

    // 回退
    coordinator.prev();
    expect(coordinator.currentIndex).toBe(1);
    expect(coordinator.canGoPrev).toBe(true);

    coordinator.prev();
    expect(coordinator.currentIndex).toBe(0);
    expect(coordinator.canGoPrev).toBe(false);

    // 到达起点继续 prev 不应为负
    coordinator.prev();
    expect(coordinator.currentIndex).toBe(0);
  });

  it('直接跳转 seek 应安全截断非法下标并自动暂停正在运行的播放', () => {
    const stepChanged = vi.fn();
    const coordinator = new PlaybackCoordinator({
      totalSteps: 10,
      onStepChange: stepChanged,
    });

    coordinator.play();
    expect(coordinator.isPlaying()).toBe(true);

    coordinator.seek(5);
    expect(coordinator.currentIndex).toBe(5);
    expect(coordinator.isPlaying()).toBe(false); // seek 自动暂停
    expect(stepChanged).toHaveBeenCalledWith(5, false);

    // 超出边界截断
    coordinator.seek(999);
    expect(coordinator.currentIndex).toBe(9);

    coordinator.seek(-50);
    expect(coordinator.currentIndex).toBe(0);
  });

  it('自动播放状态机在到达终点时应自动暂停', () => {
    const stepIndices: number[] = [];
    const coordinator = new PlaybackCoordinator({
      totalSteps: 3,
      speed: 500,
      onStepChange: (idx) => stepIndices.push(idx),
    });

    coordinator.play();
    expect(coordinator.isPlaying()).toBe(true);

    // 步进到 index 1
    vi.advanceTimersByTime(500);
    expect(coordinator.currentIndex).toBe(1);
    expect(stepIndices).toEqual([1]);

    // 步进到 index 2 (终点)
    vi.advanceTimersByTime(500);
    expect(coordinator.currentIndex).toBe(2);
    expect(coordinator.isFinished).toBe(true);

    // 终点检测自动暂停
    vi.advanceTimersByTime(500);
    expect(coordinator.isPlaying()).toBe(false);
    expect(stepIndices).toEqual([1, 2]);
  });

  it('在播放完成状态下再次触发 play 或 togglePlay 应自动回绕到第 0 步重新播放', () => {
    const stepIndices: number[] = [];
    const coordinator = new PlaybackCoordinator({
      totalSteps: 3,
      speed: 300,
      onStepChange: (idx) => stepIndices.push(idx),
    });

    coordinator.seek(2);
    expect(coordinator.isFinished).toBe(true);

    coordinator.togglePlay();
    expect(coordinator.currentIndex).toBe(0);
    expect(coordinator.isPlaying()).toBe(true);

    vi.advanceTimersByTime(300);
    expect(coordinator.currentIndex).toBe(1);
  });

  it('动态修改播放速度应无缝生效且不造成时钟并发竞态', () => {
    const coordinator = new PlaybackCoordinator({
      totalSteps: 5,
      speed: 1000,
    });

    coordinator.play();
    vi.advanceTimersByTime(1000);
    expect(coordinator.currentIndex).toBe(1);

    // 切换为高速模式
    coordinator.setSpeed(200);
    vi.advanceTimersByTime(200);
    expect(coordinator.currentIndex).toBe(2);
  });

  it('动态重置总步数 setTotalSteps 应暂停并安全重置或收敛下标', () => {
    const coordinator = new PlaybackCoordinator({
      totalSteps: 10,
    });

    coordinator.seek(8);
    coordinator.play();

    // 重新生成后只有 4 步，默认重置为 0
    coordinator.setTotalSteps(4, true);
    expect(coordinator.totalSteps).toBe(4);
    expect(coordinator.currentIndex).toBe(0);
    expect(coordinator.isPlaying()).toBe(false);

    // 若指定非重置模式，下标应被 clamp
    coordinator.seek(3);
    coordinator.setTotalSteps(2, false);
    expect(coordinator.totalSteps).toBe(2);
    expect(coordinator.currentIndex).toBe(1);
  });

  it('调用 destroy 应严格幂等清除计时器，不向已销毁实例分发事件', () => {
    const stepChanged = vi.fn();
    const coordinator = new PlaybackCoordinator({
      totalSteps: 5,
      speed: 400,
      onStepChange: stepChanged,
    });

    coordinator.play();
    expect(coordinator.isPlaying()).toBe(true);

    coordinator.destroy();
    expect(coordinator.isPlaying()).toBe(false);

    // 计时器触发时不应有任何动作
    vi.advanceTimersByTime(1000);
    expect(stepChanged).not.toHaveBeenCalled();
  });
});
