import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VisualizerEventHub, eventHub } from './visualizer-event-hub';

describe('VisualizerEventHub Observer Pattern Deep Module Guard', () => {
  beforeEach(() => {
    eventHub.clear();
  });

  it('should correctly subscribe and receive published events', () => {
    const fn = vi.fn();
    const unsubscribe = eventHub.on('step:change', fn);

    expect(eventHub.listenerCount('step:change')).toBe(1);

    eventHub.emit('step:change', {
      currentStep: 3,
      totalSteps: 10,
      stepData: { type: 'update', val: 5 }
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith({
      currentStep: 3,
      totalSteps: 10,
      stepData: { type: 'update', val: 5 }
    });

    // 取消订阅
    unsubscribe();
    expect(eventHub.listenerCount('step:change')).toBe(0);

    eventHub.emit('step:change', {
      currentStep: 4,
      totalSteps: 10,
      stepData: { type: 'update', val: 6 }
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should handle once() subscriptions by auto-unsubscribing after single trigger', () => {
    const fn = vi.fn();
    eventHub.once('playback:state', fn);

    expect(eventHub.listenerCount('playback:state')).toBe(1);

    eventHub.emit('playback:state', { isPlaying: true, isFinished: false });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(eventHub.listenerCount('playback:state')).toBe(0);

    eventHub.emit('playback:state', { isPlaying: false, isFinished: true });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should isolate errors in one handler from affecting other handlers', () => {
    const faultyHandler = () => {
      throw new Error('Test fault');
    };
    const safeHandler = vi.fn();

    eventHub.on('theme:change', faultyHandler);
    eventHub.on('theme:change', safeHandler);

    expect(() => {
      eventHub.emit('theme:change', { themeId: 'monument-valley' });
    }).not.toThrow();

    expect(safeHandler).toHaveBeenCalledWith({ themeId: 'monument-valley' });
  });
});
