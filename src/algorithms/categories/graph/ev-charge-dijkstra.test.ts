import { describe, it, expect } from 'vitest';
import {
  EVChargeDijkstraVisualizer,
  buildEVChargeSteps,
} from './ev-charge-dijkstra-renderer';
import { EV_CHARGE_CODE_LANGUAGES } from './ev-charge-dijkstra-problem-content';

describe('EVChargeDijkstra (LCP 35)', () => {
  it('should instantiate EVChargeDijkstraVisualizer properly', () => {
    const viz = new EVChargeDijkstraVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for lcp35_3cities preset', () => {
    const steps = buildEVChargeSteps('lcp35_3cities');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = EV_CHARGE_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-cur-city']).toBeDefined();
      expect(step.metrics?.['metric-cur-power']).toBeDefined();
      expect(step.metrics?.['metric-cur-cost']).toBeDefined();
      expect(step.metrics?.['metric-ev-phase']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curCity).toBe(2);
    expect(lastStep.cost).toBe(10);
  });

  it('should generate at least 20 granular steps for lcp35_shortcut preset', () => {
    const steps = buildEVChargeSteps('lcp35_shortcut');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = EV_CHARGE_CODE_LANGUAGES.java.length;
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
    expect(lastStep.curCity).toBe(2);
    expect(lastStep.cost).toBe(11);
  });

  it('should have complete code across all languages without empty stubs', () => {
    for (const lang of ['cpp', 'java', 'python', 'javascript']) {
      const code = EV_CHARGE_CODE_LANGUAGES[lang];
      expect(code).toBeDefined();
      expect(code.length).toBeGreaterThanOrEqual(35);
      const joined = code.join('\n');
      expect(joined).toMatch(/electriccarplan|electric_car_plan|visitcitymincost/i);
      expect(joined).toMatch(/dist/i);
      expect(joined).toMatch(/charge/i);
    }
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new EVChargeDijkstraVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'ev-charge-dijkstra',
      viewId: 'algo-ev-charge-dijkstra-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
