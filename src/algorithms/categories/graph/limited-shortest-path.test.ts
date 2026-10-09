import { describe, it, expect } from 'vitest';
import {
  limitedShortestPathVisualizer,
  buildLSPSteps,
  withMetrics,
} from './limited-shortest-path-renderer';
import { LIMITED_SHORTEST_PATH_CODE_LANGUAGES } from './limited-shortest-path-problem-content';

describe('LimitedShortestPath (LC 787 - Cheapest Flights Within K Stops)', () => {
  it('应当正确实例化 limitedShortestPathVisualizer', () => {
    const viz = new limitedShortestPathVisualizer();
    expect(viz).toBeDefined();
  });

  it('应当生成足够的步骤，且包含状态备份与有效代码行号', () => {
    const rawSteps = buildLSPSteps();
    const steps = withMetrics(rawSteps);
    expect(steps.length).toBeGreaterThanOrEqual(15);

    const javaLinesCount = LIMITED_SHORTEST_PATH_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.statusText).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-lsp-round']).toBeDefined();
      expect(step.metrics?.['metric-lsp-dst']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.dist[4]).toBe(9);
  });
});
