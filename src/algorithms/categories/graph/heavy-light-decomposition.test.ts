import { describe, it, expect } from 'vitest';
import {
  HeavyLightDecompositionVisualizer,
  buildHLDSteps,
} from './heavy-light-decomposition-renderer';
import { HLD_CODE_LANGUAGES } from './heavy-light-decomposition-problem-content';

describe('HeavyLightDecomposition (P3384)', () => {
  it('should instantiate HeavyLightDecompositionVisualizer properly', () => {
    const viz = new HeavyLightDecompositionVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_6node preset', () => {
    const steps = buildHLDSteps('classic_6node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = HLD_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-heavy-chain']).toBeDefined();
      expect(step.metrics?.['metric-path-segments']).toBeDefined();
      expect(step.metrics?.['metric-cur-node']).toBeDefined();
      expect(step.metrics?.['metric-hld-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.topNodes[4]).toBe(1);
    expect(lastStep.topNodes[6]).toBe(3);
    expect(lastStep.pathSegments).toEqual([[5, 6], [1, 3]]);
  });

  it('should generate at least 20 granular steps for line_4node preset', () => {
    const steps = buildHLDSteps('line_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = HLD_CODE_LANGUAGES.java.length;
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
    expect(lastStep.topNodes[4]).toBe(1);
    expect(lastStep.pathSegments).toEqual([[1, 4]]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = HLD_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/dfs1/i);
      expect(joined).toMatch(/dfs2/i);
      expect(joined).toMatch(/getpathsegments|get_path_segments/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new HeavyLightDecompositionVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'heavy-light-decomposition',
      viewId: 'algo-heavy-light-decomposition-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
