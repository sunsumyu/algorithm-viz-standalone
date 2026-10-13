import { describe, it, expect } from 'vitest';
import {
  EVChargeDijkstraVisualizer,
  buildEVChargeSteps,
} from './ev-charge-dijkstra-renderer';
import { EV_CHARGE_CODE_LANGUAGES } from './ev-charge-dijkstra-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('EVChargeDijkstra (LCP 35)', () => {
  it('should instantiate EVChargeDijkstraVisualizer properly', () => {
    const viz = new EVChargeDijkstraVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for lcp35_3cities preset', () => {
    const steps = buildEVChargeSteps('lcp35_3cities');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: EV_CHARGE_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-city', 'metric-cur-power', 'metric-cur-cost', 'metric-ev-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curCity).toBe(2);
    expect(lastStep.cost).toBe(10);
  });

  it('should generate at least 20 granular steps for lcp35_shortcut preset', () => {
    const steps = buildEVChargeSteps('lcp35_shortcut');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: EV_CHARGE_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curCity).toBe(2);
    expect(lastStep.cost).toBe(11);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(EV_CHARGE_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/electriccarplan|electric_car_plan|visitcitymincost/i, /dist/i, /charge/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(EVChargeDijkstraVisualizer, {
      algorithmId: 'ev-charge-dijkstra',
      viewId: 'algo-ev-charge-dijkstra-view',
    });
  });
});
