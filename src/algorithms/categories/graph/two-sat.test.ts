import { describe, it, expect } from 'vitest';
import { TwoSATVisualizer, buildTwoSATSteps } from './two-sat-renderer';
import { TWO_SAT_CODE_LANGUAGES } from './two-sat-problem-content';

describe('TwoSAT (P4782)', () => {
  it('should instantiate TwoSATVisualizer properly', () => {
    const viz = new TwoSATVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for satisfiable preset', () => {
    const steps = buildTwoSATSteps('satisfiable');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TWO_SAT_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-sat-status']).toBeDefined();
      expect(step.metrics?.['metric-sat-assign']).toBeDefined();
      expect(step.metrics?.['metric-cur-clause']).toBeDefined();
      expect(step.metrics?.['metric-scc-count']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.isSatisfiable).toBe(true);
    expect(lastStep.chosenLiterals).toContain('x1 = False (0)');
    expect(lastStep.chosenLiterals).toContain('x2 = True (1)');
  });

  it('should generate at least 20 granular steps for unsatisfiable preset', () => {
    const steps = buildTwoSATSteps('unsatisfiable');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TWO_SAT_CODE_LANGUAGES.java.length;
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
    expect(lastStep.isSatisfiable).toBe(false);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = TWO_SAT_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/tarjan/i);
      expect(joined).toMatch(/scc/i);
      expect(joined).toMatch(/solve/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TwoSATVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'two-sat-problem',
      viewId: 'algo-two-sat-problem-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
