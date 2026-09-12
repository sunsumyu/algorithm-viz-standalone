import { describe, it, expect } from 'vitest';
import { buildFloydSteps } from './floyd-renderer';
import { FLOYD_CODE_LANGUAGES } from './floyd-problem-content';

describe('FloydWarshall (LeftChengYun Class 061)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildFloydSteps();
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = FLOYD_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-floyd-k']).toBeDefined();
      expect(step.metrics?.['metric-floyd-pair']).toBeDefined();
      expect(step.metrics?.['metric-floyd-relax']).toBeDefined();
      expect(step.metrics?.['metric-floyd-dist']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.matrix[0][3]).toBe(9);
    expect(lastStep.matrix[0][1]).toBe(5);
    expect(lastStep.matrix[1][3]).toBe(4);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = FLOYD_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(10);
      const joined = code.join('\n');
      expect(joined).toMatch(/floydwarshall|floyd_warshall/i);
    }
  });
});
