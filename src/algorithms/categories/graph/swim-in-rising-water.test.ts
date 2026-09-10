import { describe, it, expect } from 'vitest';
import {
  SwimInRisingWaterVisualizer,
  buildSwimInRisingWaterSteps,
} from './swim-in-rising-water-renderer';
import { SWIM_IN_RISING_WATER_CODE_LANGUAGES } from './swim-in-rising-water-problem-content';

describe('SwimInRisingWater (LeetCode 778 - Class 064 Code03)', () => {
  it('should instantiate SwimInRisingWaterVisualizer properly', () => {
    const viz = new SwimInRisingWaterVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for leetcode5 preset', () => {
    const steps = buildSwimInRisingWaterSteps('leetcode5');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = SWIM_IN_RISING_WATER_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-time']).toBeDefined();
      expect(step.metrics?.['metric-cur-pos']).toBeDefined();
      expect(step.metrics?.['metric-pq-size']).toBeDefined();
      expect(step.metrics?.['metric-swim-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curWaterLevel).toBe(20);
    expect(lastStep.bestPath).toBeDefined();
  });

  it('should generate at least 15 granular steps for simple3 preset', () => {
    const steps = buildSwimInRisingWaterSteps('simple3');
    expect(steps.length).toBeGreaterThanOrEqual(15);

    const javaLinesCount = SWIM_IN_RISING_WATER_CODE_LANGUAGES.java.length;
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
    expect(lastStep.curWaterLevel).toBe(8);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const [lang, codeLines] of Object.entries(SWIM_IN_RISING_WATER_CODE_LANGUAGES)) {
      expect(codeLines.length).toBeGreaterThan(15);
      const nonEmptyLines = codeLines.filter((l) => l.trim().length > 0);
      expect(nonEmptyLines.length).toBeGreaterThan(10);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new SwimInRisingWaterVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'swim-in-rising-water',
      viewId: 'algo-swim-in-rising-water-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
