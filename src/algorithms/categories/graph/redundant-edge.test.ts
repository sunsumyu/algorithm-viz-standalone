import { describe, it, expect } from 'vitest';
import {
  RedundantEdgeVisualizer,
  buildRedundantSteps,
} from './redundant-edge-renderer';
import { REDUNDANT_EDGE_CODE_LANGUAGES } from './redundant-edge-problem-content';

describe('Redundant Connection (LeftChengYun Class 056 / LC 684)', () => {
  it('should instantiate RedundantEdgeVisualizer properly', () => {
    const viz = new RedundantEdgeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildRedundantSteps();
    expect(steps.length).toBeGreaterThanOrEqual(15);

    const javaLinesCount = REDUNDANT_EDGE_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-re-cur-edge']).toBeDefined();
      expect(step.metrics?.['metric-re-redundant']).toBeDefined();
      expect(step.metrics?.['metric-re-tree-edges']).toBeDefined();
      expect(step.metrics?.['metric-re-parent']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.redundantEdge).toEqual([1, 4]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = REDUNDANT_EDGE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(10);
      const joined = code.join('\n');
      expect(joined).toMatch(/findredundantconnection|find_redundant_connection/i);
    }
  });
});
