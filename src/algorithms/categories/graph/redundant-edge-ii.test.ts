import { describe, it, expect } from 'vitest';
import { buildRedundantIISteps } from './redundant-edge-ii-renderer';
import { REDUNDANT_EDGE_II_CODE_LANGUAGES } from './redundant-edge-ii-problem-content';

describe('Redundant Connection II (LeftChengYun Class 057 / LC 685)', () => {
  it('should generate at least 15 granular steps for standard graph', () => {
    const steps = buildRedundantIISteps();
    expect(steps.length).toBeGreaterThanOrEqual(15);

    const javaLinesCount = REDUNDANT_EDGE_II_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-re2-conflict']).toBeDefined();
      expect(step.metrics?.['metric-re2-cycle']).toBeDefined();
      expect(step.metrics?.['metric-re2-indegree']).toBeDefined();
      expect(step.metrics?.['metric-re2-uf']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.resultEdge).toEqual([2, 3]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = REDUNDANT_EDGE_II_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(10);
      const joined = code.join('\n');
      expect(joined).toMatch(/findredundantdirectedconnection|find_redundant_directed_connection/i);
    }
  });
});
