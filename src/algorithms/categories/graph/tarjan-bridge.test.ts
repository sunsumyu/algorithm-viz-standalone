import { describe, it, expect } from 'vitest';
import {
  TarjanBridgeVisualizer,
  buildTarjanBridgeSteps,
} from './tarjan-bridge-renderer';
import { TARJAN_BRIDGE_CODE_LANGUAGES } from './tarjan-bridge-problem-content';

describe('TarjanBridge (P3388)', () => {
  it('should instantiate TarjanBridgeVisualizer properly', () => {
    const viz = new TarjanBridgeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_5node preset', () => {
    const steps = buildTarjanBridgeSteps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TARJAN_BRIDGE_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cut-count']).toBeDefined();
      expect(step.metrics?.['metric-bridge-count']).toBeDefined();
      expect(step.metrics?.['metric-cur-node']).toBeDefined();
      expect(step.metrics?.['metric-tarjan-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.cutNodes.sort()).toEqual([3, 4]);
    expect(lastStep.bridgeEdges.length).toBe(2);
  });

  it('should generate at least 20 granular steps for simple_4node preset', () => {
    const steps = buildTarjanBridgeSteps('simple_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = TARJAN_BRIDGE_CODE_LANGUAGES.java.length;
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
    expect(lastStep.cutNodes).toEqual([3]);
    expect(lastStep.bridgeEdges.length).toBe(1);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = TARJAN_BRIDGE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/tarjan/i);
      expect(joined).toMatch(/bridges/i);
      expect(joined).toMatch(/iscut|is_cut/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TarjanBridgeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tarjan-bridge',
      viewId: 'algo-tarjan-bridge-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
