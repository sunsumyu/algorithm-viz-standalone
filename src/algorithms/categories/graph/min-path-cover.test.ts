import { describe, it, expect } from 'vitest';
import { MinPathCoverVisualizer, buildMinPathCoverSteps } from './min-path-cover-renderer';
import { MIN_PATH_COVER_CODE_LANGUAGES } from './min-path-cover-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('MinPathCover (P2764)', () => {
  it('should instantiate MinPathCoverVisualizer properly', () => {
    const viz = new MinPathCoverVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(MinPathCoverVisualizer, {
      algorithmId: 'min-path-cover',
      viewId: 'algo-min-path-cover-view',
    });
  });

  it('buildMinPathCoverSteps 必须生成精细逐语句执行流 (>= 20 步) 且行号在 Java 源码范围内', () => {
    const steps = buildMinPathCoverSteps();
    const javaLines = MIN_PATH_COVER_CODE_LANGUAGES.java.length;

    expect(steps.length).toBeGreaterThanOrEqual(20);
    expect(javaLines).toBeGreaterThanOrEqual(50);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.metrics).toBeDefined();
      expect(step.metrics!['metric-match-count']).toBeDefined();
      expect(step.metrics!['metric-path-count']).toBeDefined();
      expect(step.metrics!['metric-cur-node']).toBeDefined();
      expect(step.metrics!['metric-path-formula']).toBeDefined();

      const rawLines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of rawLines) {
        expect(line).toBeGreaterThanOrEqual(1);
        expect(line).toBeLessThanOrEqual(javaLines);
      }
    }

    expect(steps[0].codeLine).toBe(29);
    expect(steps[steps.length - 1].codeLine).toBe(51);
  });
});
