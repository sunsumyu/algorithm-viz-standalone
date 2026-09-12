import { describe, it, expect } from 'vitest';
import { buildDJHSteps } from './dijkstra-heap-renderer';
import { DIJKSTRA_HEAP_CODE_LANGUAGES } from './dijkstra-heap-problem-content';

describe('DijkstraHeap (LeftChengYun Class 061)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildDJHSteps();
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DIJKSTRA_HEAP_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-extract']).toBeDefined();
      expect(step.metrics?.['metric-pq-size']).toBeDefined();
      expect(step.metrics?.['metric-relax-count']).toBeDefined();
      expect(step.metrics?.['metric-dist-info']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.dist).toEqual([0, 3, 1, 4, 7]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = DIJKSTRA_HEAP_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(10);
      const joined = code.join('\n');
      expect(joined).toMatch(/dijkstraheap|dijkstra_heap/i);
    }
  });
});
