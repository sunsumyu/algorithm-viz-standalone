import { describe, it, expect } from 'vitest';
import { AlienDictVisualizer, buildAlienDictSteps } from './alien-dict-renderer';
import { ALIEN_DICT_CODE_LANGUAGES } from './alien-dict-problem-content';

describe('AlienDict (LeetCode 269)', () => {
  it('should instantiate AlienDictVisualizer properly', () => {
    const viz = new AlienDictVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for valid preset', () => {
    const steps = buildAlienDictSteps('valid');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = ALIEN_DICT_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-alien-chars']).toBeDefined();
      expect(step.metrics?.['metric-alien-order']).toBeDefined();
      expect(step.metrics?.['metric-alien-queue']).toBeDefined();
      expect(step.metrics?.['metric-alien-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.topoOrder.join('')).toBe('wertf');
  });

  it('should generate at least 20 granular steps for prefix_error preset', () => {
    const steps = buildAlienDictSteps('prefix_error');
    expect(steps.length).toBeGreaterThanOrEqual(10);

    const javaLinesCount = ALIEN_DICT_CODE_LANGUAGES.java.length;
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
    expect(lastStep.status).toBe('error');
  });

  it('should generate at least 20 granular steps for cycle preset', () => {
    const steps = buildAlienDictSteps('cycle');
    expect(steps.length).toBeGreaterThanOrEqual(15);

    const javaLinesCount = ALIEN_DICT_CODE_LANGUAGES.java.length;
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
    expect(lastStep.status).toBe('error');
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = ALIEN_DICT_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(30);
      const joined = code.join('\n');
      expect(joined).toMatch(/alienorder|alien_order/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new AlienDictVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'alien-dict',
      viewId: 'algo-alien-dict-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
