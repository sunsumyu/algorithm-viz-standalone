import { describe, it, expect } from 'vitest';
import {
  AStarJourneyVisualizer,
  buildAStarJourneySteps,
} from './a-star-journey-renderer';
import { A_STAR_JOURNEY_CODE_LANGUAGES } from './a-star-journey-problem-content';

describe('AStarJourney', () => {
  it('should instantiate AStarJourneyVisualizer properly', () => {
    const viz = new AStarJourneyVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_3x4 preset', () => {
    const steps = buildAStarJourneySteps('classic_3x4');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = A_STAR_JOURNEY_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-astar-coord']).toBeDefined();
      expect(step.metrics?.['metric-astar-f']).toBeDefined();
      expect(step.metrics?.['metric-open-size']).toBeDefined();
      expect(step.metrics?.['metric-astar-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curR).toBe(2);
    expect(lastStep.curC).toBe(3);
    expect(lastStep.path.length).toBe(6);
  });

  it('should generate at least 20 granular steps for line_3x3 preset', () => {
    const steps = buildAStarJourneySteps('line_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = A_STAR_JOURNEY_CODE_LANGUAGES.java.length;
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
    expect(lastStep.curR).toBe(2);
    expect(lastStep.curC).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = A_STAR_JOURNEY_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/astar|a_star/i);
      expect(joined).toMatch(/heap|queue|open/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new AStarJourneyVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'a-star-journey',
      viewId: 'algo-a-star-journey-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
