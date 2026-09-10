import { describe, it, expect } from 'vitest';
import {
  PruferSequenceVisualizer,
  buildPruferSteps,
} from './prufer-sequence-renderer';
import { PRUFER_CODE_LANGUAGES } from './prufer-sequence-problem-content';

describe('PruferSequence (P6086 / Cayley)', () => {
  it('should instantiate PruferSequenceVisualizer properly', () => {
    const viz = new PruferSequenceVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for star_4node preset', () => {
    const steps = buildPruferSteps('star_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PRUFER_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-leaf']).toBeDefined();
      expect(step.metrics?.['metric-prufer-seq']).toBeDefined();
      expect(step.metrics?.['metric-cayley-count']).toBeDefined();
      expect(step.metrics?.['metric-prufer-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.pruferSequence).toEqual([1, 1]);
  });

  it('should generate at least 20 granular steps for line_4node preset', () => {
    const steps = buildPruferSteps('line_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PRUFER_CODE_LANGUAGES.java.length;
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
    expect(lastStep.pruferSequence).toEqual([2, 3]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = PRUFER_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/prufersequence|prufer_sequence|codec/i);
      expect(joined).toMatch(/treetoprufer|tree_to_prufer/i);
      expect(joined).toMatch(/prufertotree|prufer_to_tree/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new PruferSequenceVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'prufer-sequence',
      viewId: 'algo-prufer-sequence-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
