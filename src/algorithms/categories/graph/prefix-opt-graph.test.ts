import { describe, it, expect } from 'vitest';
import {
  PrefixOptGraphVisualizer,
  buildPrefixOptSteps,
} from './prefix-opt-graph-renderer';
import { PREFIX_OPT_CODE_LANGUAGES } from './prefix-opt-graph-problem-content';

describe('PrefixOptGraph', () => {
  it('should instantiate PrefixOptGraphVisualizer properly', () => {
    const viz = new PrefixOptGraphVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for prefix optimized mode', () => {
    const steps = buildPrefixOptSteps('prefix');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PREFIX_OPT_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-opt-mode']).toBeDefined();
      expect(step.metrics?.['metric-edge-count']).toBeDefined();
      expect(step.metrics?.['metric-cur-op']).toBeDefined();
      expect(step.metrics?.['metric-compression-ratio']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.numEdges).toBe(11);
  });

  it('should generate at least 20 granular steps for naive mode', () => {
    const steps = buildPrefixOptSteps('naive');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PREFIX_OPT_CODE_LANGUAGES.java.length;
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
    expect(lastStep.numEdges).toBe(16);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = PREFIX_OPT_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(30);
      const joined = code.join('\n');
      expect(joined).not.toMatch(/buildAtMostOne[^{]*\{\s*\}/);
      expect(joined).toMatch(/prefix/i);
      expect(joined).toMatch(/chain|edge/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new PrefixOptGraphVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'prefix-opt-graph',
      viewId: 'algo-prefix-opt-graph-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
