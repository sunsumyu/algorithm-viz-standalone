import { describe, it, expect } from 'vitest';
import { MinMeanCycleVisualizer, buildMinMeanCycleSteps } from './min-mean-cycle-renderer';
import { MIN_MEAN_CYCLE_CODE_LANGUAGES } from './min-mean-cycle-problem-content';

describe('MinMeanCycle (Karp / 0-1 Fractional Programming)', () => {
  it('should instantiate MinMeanCycleVisualizer properly', () => {
    const viz = new MinMeanCycleVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new MinMeanCycleVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'min-mean-cycle',
      viewId: 'algo-min-mean-cycle-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });

  it('buildMinMeanCycleSteps 必须生成精细逐语句执行流 (>= 18 步) 且行号在 Java 源码范围内', () => {
    const steps = buildMinMeanCycleSteps('four-nodes');
    const javaLines = MIN_MEAN_CYCLE_CODE_LANGUAGES.java.length;

    expect(steps.length).toBeGreaterThanOrEqual(18);
    expect(javaLines).toBeGreaterThanOrEqual(60);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.metrics).toBeDefined();
      expect(step.metrics!['metric-bounds']).toBeDefined();
      expect(step.metrics!['metric-guess-lambda']).toBeDefined();
      expect(step.metrics!['metric-cycle-status']).toBeDefined();

      const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in step.codeLine ? (step.codeLine as any).java : step.codeLine;
      const rawLines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of rawLines) {
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(javaLines);
      }
    }

    const firstLine = typeof steps[0].codeLine === 'object' && steps[0].codeLine !== null ? (steps[0].codeLine as any).java : steps[0].codeLine;
    const lastLine = typeof steps[steps.length - 1].codeLine === 'object' && steps[steps.length - 1].codeLine !== null ? (steps[steps.length - 1].codeLine as any).java : steps[steps.length - 1].codeLine;
    expect(firstLine).toBe(56);
    expect(lastLine).toBe(73);
  });
});
