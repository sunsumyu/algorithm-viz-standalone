import { describe, it, expect } from 'vitest';
import { buildTopoSteps } from './topological-sort-renderer';
import { TOPOLOGICAL_SORT_CODE_LANGUAGES } from './topological-sort-problem-content';

describe('TopologicalSort (Kahn Algorithm LC 210)', () => {
  it('should generate at least 20 granular steps for standard DAG', () => {
    const steps = buildTopoSteps();
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TOPOLOGICAL_SORT_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-node']).toBeDefined();
      expect(step.metrics?.['metric-queue-elements']).toBeDefined();
      expect(step.metrics?.['metric-topo-len']).toBeDefined();
      expect(step.metrics?.['metric-cycle-status']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.order.length).toBe(6);
    const order = lastStep.order;
    expect(order.indexOf(5)).toBeLessThan(order.indexOf(2));
    expect(order.indexOf(5)).toBeLessThan(order.indexOf(0));
    expect(order.indexOf(4)).toBeLessThan(order.indexOf(0));
    expect(order.indexOf(4)).toBeLessThan(order.indexOf(1));
    expect(order.indexOf(2)).toBeLessThan(order.indexOf(3));
    expect(order.indexOf(3)).toBeLessThan(order.indexOf(1));
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = TOPOLOGICAL_SORT_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(15);
      const joined = code.join('\n');
      expect(joined).toMatch(/findorder|find_order/i);
    }
  });
});
