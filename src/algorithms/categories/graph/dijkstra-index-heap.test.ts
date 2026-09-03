import { describe, it, expect } from 'vitest';
import {
  DijkstraIndexHeapVisualizer,
  buildIndexHeapSteps,
} from './dijkstra-index-heap-renderer';
import { DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES } from './dijkstra-index-heap-problem-content';

describe('DijkstraIndexHeap', () => {
  it('should instantiate DijkstraIndexHeapVisualizer properly', () => {
    const viz = new DijkstraIndexHeapVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_4node preset', () => {
    const steps = buildIndexHeapSteps('classic_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in (step.codeLine as any)
        ? (step.codeLine as any).java
        : step.codeLine;
      const lines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-heap-size']).toBeDefined();
      expect(step.metrics?.['metric-settled-count']).toBeDefined();
      expect(step.metrics?.['metric-heap-cur']).toBeDefined();
      expect(step.metrics?.['metric-heap-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.settled.length).toBe(4);
    expect(lastStep.heapNodes.length).toBe(0);
  });

  it('should generate at least 20 granular steps for simple_triangle preset', () => {
    const steps = buildIndexHeapSteps('simple_triangle');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine = typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in (step.codeLine as any)
        ? (step.codeLine as any).java
        : step.codeLine;
      const lines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.settled.length).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = DIJKSTRA_INDEX_HEAP_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/heap|dijkstra/i);
      expect(joined).toMatch(/where/i);
      expect(joined).toMatch(/swap/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DijkstraIndexHeapVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'dijkstra-index-heap',
      viewId: 'algo-dijkstra-index-heap-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
