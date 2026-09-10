import { describe, it, expect } from 'vitest';
import {
  ChordalGraphVisualizer,
  buildChordalGraphSteps,
} from './chordal-graph-renderer';
import { CHORDAL_GRAPH_CODE_LANGUAGES } from './chordal-graph-problem-content';

describe('ChordalGraph (P3199)', () => {
  it('should instantiate ChordalGraphVisualizer properly', () => {
    const viz = new ChordalGraphVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for chordal graph case', () => {
    const steps = buildChordalGraphSteps('chordal');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = CHORDAL_GRAPH_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-node']).toBeDefined();
      expect(step.metrics?.['metric-peo-len']).toBeDefined();
      expect(step.metrics?.['metric-chordal-status']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.isChordal).toBe(true);
    expect(lastStep.status).toBe('done');
    expect(lastStep.peoOrder).toEqual([2, 1, 3, 4]);
  });

  it('should generate at least 20 granular steps for non-chordal graph case', () => {
    const steps = buildChordalGraphSteps('non-chordal');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = CHORDAL_GRAPH_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-node']).toBeDefined();
      expect(step.metrics?.['metric-peo-len']).toBeDefined();
      expect(step.metrics?.['metric-chordal-status']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.isChordal).toBe(false);
    expect(lastStep.status).toBe('done');
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = CHORDAL_GRAPH_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(30);
      const joined = code.join('\n');
      expect(joined).not.toMatch(/isChordal[^{]*\{\s*return (true|True);\s*\}/);
      expect(joined).toMatch(/mcs/i);
      expect(joined).toMatch(/peo/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new ChordalGraphVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'chordal-graph',
      viewId: 'algo-chordal-graph-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
