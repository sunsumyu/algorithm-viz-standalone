import { describe, it, expect } from 'vitest';
import {
  PrimVisualizer,
  buildPrimSteps,
} from './mst-prim-renderer';
import { MST_PRIM_CODE_LANGUAGES } from './mst-prim-problem-content';

describe('MST Prim (LeftChengYun Class 058)', () => {
  it('should instantiate PrimVisualizer properly', () => {
    const viz = new PrimVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildPrimSteps();
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = MST_PRIM_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-prim-nodes']).toBeDefined();
      expect(step.metrics?.['metric-prim-weight']).toBeDefined();
      expect(step.metrics?.['metric-prim-edge']).toBeDefined();
      expect(step.metrics?.['metric-prim-dist']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.mstEdges.length).toBe(4);
    expect(lastStep.totalWeight).toBe(16);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = MST_PRIM_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(10);
      const joined = code.join('\n');
      expect(joined).toMatch(/prim/i);
    }
  });
});
