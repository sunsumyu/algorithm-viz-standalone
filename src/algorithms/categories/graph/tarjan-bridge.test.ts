import { describe, it, expect } from 'vitest';
import {
  TarjanBridgeVisualizer,
  buildTarjanBridgeSteps,
} from './tarjan-bridge-renderer';
import { TARJAN_BRIDGE_CODE_LANGUAGES } from './tarjan-bridge-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('TarjanBridge (P3388)', () => {
  it('should instantiate TarjanBridgeVisualizer properly', () => {
    const viz = new TarjanBridgeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_5node preset', () => {
    const steps = buildTarjanBridgeSteps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TARJAN_BRIDGE_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cut-count', 'metric-bridge-count', 'metric-cur-node', 'metric-tarjan-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.cutNodes.sort()).toEqual([3, 4]);
    expect(lastStep.bridgeEdges.length).toBe(2);
  });

  it('should generate at least 20 granular steps for simple_4node preset', () => {
    const steps = buildTarjanBridgeSteps('simple_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TARJAN_BRIDGE_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.cutNodes).toEqual([3]);
    expect(lastStep.bridgeEdges.length).toBe(1);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(TARJAN_BRIDGE_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/tarjan/i, /bridges/i, /iscut|is_cut/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(TarjanBridgeVisualizer, {
      algorithmId: 'tarjan-bridge',
      viewId: 'algo-tarjan-bridge-view',
    });
  });
});
