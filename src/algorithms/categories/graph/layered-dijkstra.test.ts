import { describe, it, expect } from 'vitest';
import {
  LayeredDijkstraVisualizer,
  buildLayeredDijkstraSteps,
} from './layered-dijkstra-renderer';
import { LAYERED_DIJKSTRA_CODE_LANGUAGES } from './layered-dijkstra-problem-content';

describe('LayeredDijkstra (P4568)', () => {
  it('should instantiate LayeredDijkstraVisualizer properly', () => {
    const viz = new LayeredDijkstraVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for p4568_standard preset', () => {
    const steps = buildLayeredDijkstraSteps('p4568_standard');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = LAYERED_DIJKSTRA_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-layer-state']).toBeDefined();
      expect(step.metrics?.['metric-layer-dist']).toBeDefined();
      expect(step.metrics?.['metric-layer-pq']).toBeDefined();
      expect(step.metrics?.['metric-layer-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curDist).toBe(4);
  });

  it('should generate at least 20 granular steps for simple_3node preset', () => {
    const steps = buildLayeredDijkstraSteps('simple_3node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = LAYERED_DIJKSTRA_CODE_LANGUAGES.java.length;
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
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curDist).toBe(0);
  });
});
