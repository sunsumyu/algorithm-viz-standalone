import { describe, it, expect } from 'vitest';
import {
  KonigMinVertexCoverVisualizer,
  buildKonigSteps,
} from './konig-min-vertex-cover-renderer';
import { KONIG_CODE_LANGUAGES } from './konig-min-vertex-cover-problem-content';

describe('KonigMinVertexCover (König Theorem)', () => {
  it('should instantiate KonigMinVertexCoverVisualizer properly', () => {
    const viz = new KonigMinVertexCoverVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic preset', () => {
    const steps = buildKonigSteps('classic');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = KONIG_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-match-size']).toBeDefined();
      expect(step.metrics?.['metric-cover-size']).toBeDefined();
      expect(step.metrics?.['metric-indep-size']).toBeDefined();
      expect(step.metrics?.['metric-konig-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.matchedEdges.length).toBe(3);
    expect(lastStep.coverSet.length).toBe(3);
    expect(lastStep.independentSet?.length).toBe(4);
    expect(lastStep.coverSet.sort()).toEqual(['L4', 'R1', 'R2']);
  });

  it('should generate at least 20 granular steps for simple preset', () => {
    const steps = buildKonigSteps('simple');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = KONIG_CODE_LANGUAGES.java.length;
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
    expect(lastStep.matchedEdges.length).toBe(2);
    expect(lastStep.coverSet.length).toBe(2);
    expect(lastStep.independentSet?.length).toBe(3);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = KONIG_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/dfs/i);
      expect(joined).toMatch(/maxmatching|max_matching/i);
      expect(joined).toMatch(/alternatingdfs|alternating_dfs/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new KonigMinVertexCoverVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'konig-min-vertex-cover',
      viewId: 'algo-konig-min-vertex-cover-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
