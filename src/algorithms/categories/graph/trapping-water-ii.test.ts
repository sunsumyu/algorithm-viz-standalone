import { describe, it, expect } from 'vitest';
import {
  TrappingWaterIIVisualizer,
  buildTrappingWaterIISteps,
} from './trapping-water-ii-renderer';
import { TRAPPING_WATER_II_CODE_LANGUAGES } from './trapping-water-ii-problem-content';

describe('TrappingWaterII (LeetCode 407)', () => {
  it('should instantiate TrappingWaterIIVisualizer properly', () => {
    const viz = new TrappingWaterIIVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_3x6 preset', () => {
    const steps = buildTrappingWaterIISteps('classic_3x6');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TRAPPING_WATER_II_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-trap2-total']).toBeDefined();
      expect(step.metrics?.['metric-trap2-board']).toBeDefined();
      expect(step.metrics?.['metric-trap2-heap']).toBeDefined();
      expect(step.metrics?.['metric-trap2-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalWater).toBe(4);
  });

  it('should generate at least 20 granular steps for simple_3x3 preset', () => {
    const steps = buildTrappingWaterIISteps('simple_3x3');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TRAPPING_WATER_II_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const lines = Array.isArray(step.codeLine) ? step.codeLine : [step.codeLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.totalWater).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = TRAPPING_WATER_II_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/traprainwater|trap_rain_water/i);
      expect(joined).toMatch(/heightmap|height_map/i);
      expect(joined).toMatch(/heap|priority_queue/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TrappingWaterIIVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'trapping-water-ii',
      viewId: 'algo-trapping-water-ii-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
