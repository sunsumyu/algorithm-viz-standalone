import { describe, it, expect } from 'vitest';
import { buildNCSteps } from './negative-cycle-renderer';
import { NEGATIVE_CYCLE_CODE_LANGUAGES } from './negative-cycle-problem-content';

describe('NegativeCycle (LeftChengYun Class 061 / P3385)', () => {
  it('should generate at least 20 granular steps for cycle graph', () => {
    const steps = buildNCSteps();
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = NEGATIVE_CYCLE_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.statusText).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine =
        typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in (step.codeLine as any)
          ? (step.codeLine as any).java
          : step.codeLine;
      const lines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-nc-round']).toBeDefined();
      expect(step.metrics?.['metric-nc-edge']).toBeDefined();
      expect(step.metrics?.['metric-nc-cycle']).toBeDefined();
      expect(step.metrics?.['metric-nc-dist']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('cycle-detected');
    expect(lastStep.hasCycle).toBe(true);
    expect(lastStep.cycleEdges.length).toBeGreaterThan(0);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = NEGATIVE_CYCLE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(10);
      const joined = code.join('\n');
      expect(joined).toMatch(/hasnegativecycle|has_negative_cycle/i);
    }
  });
});
