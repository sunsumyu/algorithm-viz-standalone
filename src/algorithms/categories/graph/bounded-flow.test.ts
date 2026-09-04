import { describe, it, expect } from 'vitest';
import {
  BoundedFlowVisualizer,
  buildBoundedFlowSteps,
} from './bounded-flow-renderer';
import { BOUNDED_FLOW_CODE_LANGUAGES } from './bounded-flow-problem-content';

describe('BoundedFlow (Feasible Circulation - LOJ 115)', () => {
  it('should instantiate BoundedFlowVisualizer properly', () => {
    const viz = new BoundedFlowVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for four-nodes preset', () => {
    const steps = buildBoundedFlowSteps('four-nodes');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = BOUNDED_FLOW_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['cur-phase']).toBeDefined();
      expect(step.metrics?.['super-flow']).toBeDefined();
      expect(step.metrics?.['feasible-status']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.phase).toBe('ALL_DONE');
    expect(lastStep.isFeasible).toBe(true);
    expect(lastStep.totalPushed).toBe(2);
  });

  it('should generate at least 20 granular steps for triangle preset', () => {
    const steps = buildBoundedFlowSteps('triangle');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = BOUNDED_FLOW_CODE_LANGUAGES.java.length;
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
    expect(lastStep.phase).toBe('ALL_DONE');
    expect(lastStep.isFeasible).toBe(true);
    expect(lastStep.totalPushed).toBe(1);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = BOUNDED_FLOW_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(40);
      const joined = code.join('\n');
      expect(joined).toMatch(/addboundededge|add_bounded_edge/i);
      expect(joined).toMatch(/buildsupersourcesink|build_super_source_sink/i);
      expect(joined).toMatch(/hasfeasibleflow|has_feasible_flow/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BoundedFlowVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'bounded-flow',
      viewId: 'algo-bounded-flow-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
