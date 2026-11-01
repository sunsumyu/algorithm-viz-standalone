import { describe, it, expect } from 'vitest';
import {
  UsageTracker,
  USAGE_LOG_STORAGE_KEY,
  MAX_TRACKED_EVENTS,
  type UsageReportSink,
} from './usage-tracker';

describe('UsageTracker (行为追踪器)', () => {
  it('应当记录事件并绑定当前追踪身份', () => {
    const tracker = new UsageTracker('test-session-1');
    tracker.setIdentity('138****8000');

    const event = tracker.track('APP_LAUNCH');
    expect(event.type).toBe('APP_LAUNCH');
    expect(event.identity).toBe('138****8000');
    expect(event.sid).toBe('test-session-1');
    expect(event.seq).toBe(1);
    expect(tracker.getEvents()).toHaveLength(1);
  });

  it('算法打开事件应携带算法 ID 与自定义详情', () => {
    const tracker = new UsageTracker();
    tracker.track('ALGORITHM_OPEN', {
      algorithmId: 'binary-search',
      detail: { entry: 'sidebar' },
    });

    const event = tracker.getEvents()[0];
    expect(event.algorithmId).toBe('binary-search');
    expect(event.detail).toEqual({ entry: 'sidebar' });
  });

  it('序号应当跨事件单调递增', () => {
    const tracker = new UsageTracker();
    const a = tracker.track('APP_LAUNCH');
    const b = tracker.track('COPY_TEXT');
    const c = tracker.track('ALGORITHM_OPEN', { algorithmId: 'x' });
    expect(b.seq).toBe(a.seq + 1);
    expect(c.seq).toBe(b.seq + 1);
  });

  it('日志应当有界：超过上限时保留最新事件', () => {
    const tracker = new UsageTracker();
    for (let i = 0; i < MAX_TRACKED_EVENTS + 50; i++) {
      tracker.track('COPY_TEXT');
    }
    const events = tracker.getEvents();
    expect(events).toHaveLength(MAX_TRACKED_EVENTS);
    expect(events[events.length - 1].seq).toBe(MAX_TRACKED_EVENTS + 50);
  });

  it('注入上报接缝后应当推送新事件，失败时保留待补发', async () => {
    const tracker = new UsageTracker();
    const received: number[][] = [];
    let shouldFail = true;
    const sink: UsageReportSink = {
      name: 'mock-sink',
      report: async (events) => {
        if (shouldFail) throw new Error('network down');
        received.push(events.map((e) => e.seq));
      },
    };
    tracker.setSink(sink);

    tracker.track('APP_LAUNCH');
    expect(await tracker.flush()).toBe(false);

    shouldFail = false;
    expect(await tracker.flush()).toBe(true);
    expect(received).toHaveLength(1);
    expect(received[0]).toEqual([1]);
  });

  it('导出 JSON 应可解析且包含完整事件链', () => {
    const tracker = new UsageTracker('export-session');
    tracker.setIdentity('VIP-USER');
    tracker.track('APP_LAUNCH');
    tracker.track('ALGORITHM_OPEN', { algorithmId: 'two-sum' });

    const parsed = JSON.parse(tracker.exportEventsJson()) as {
      sessionId: string;
      identity: string;
      count: number;
      events: Array<{ type: string; algorithmId?: string }>;
    };
    expect(parsed.sessionId).toBe('export-session');
    expect(parsed.identity).toBe('VIP-USER');
    expect(parsed.count).toBe(2);
    expect(parsed.events[1].algorithmId).toBe('two-sum');
  });

  it('clear() 应当清空内存与持久化日志', () => {
    const tracker = new UsageTracker();
    tracker.track('APP_LAUNCH');
    tracker.clear();
    expect(tracker.getEvents()).toHaveLength(0);
  });
});
