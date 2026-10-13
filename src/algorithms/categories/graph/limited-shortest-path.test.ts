import { assertStepStreamContract } from '../../../core/testing/contract-assertions';
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
    assertStepStreamContract(steps, {
      minSteps: 15,
      codes: LIMITED_SHORTEST_PATH_CODE_LANGUAGES,
      requireStatusText: true,
      requiredMetricKeys: ['metric-lsp-round', 'metric-lsp-dst'],
    });


    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.dist[4]).toBe(9);
  });
});
