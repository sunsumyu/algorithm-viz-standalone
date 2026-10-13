import { describe, it, expect } from 'vitest';
import {
  ChordalGraphVisualizer,
  buildChordalGraphSteps,
} from './chordal-graph-renderer';
import { CHORDAL_GRAPH_CODE_LANGUAGES } from './chordal-graph-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('ChordalGraph (P3199)', () => {
  it('should instantiate ChordalGraphVisualizer properly', () => {
    const viz = new ChordalGraphVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for chordal graph case', () => {
    const steps = buildChordalGraphSteps('chordal');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: CHORDAL_GRAPH_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-node', 'metric-peo-len', 'metric-chordal-status'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.isChordal).toBe(true);
    expect(lastStep.status).toBe('done');
    expect(lastStep.peoOrder).toEqual([2, 1, 3, 4]);
  });

  it('should generate at least 20 granular steps for non-chordal graph case', () => {
    const steps = buildChordalGraphSteps('non-chordal');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: CHORDAL_GRAPH_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-node', 'metric-peo-len', 'metric-chordal-status'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.isChordal).toBe(false);
    expect(lastStep.status).toBe('done');
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(CHORDAL_GRAPH_CODE_LANGUAGES, {
      minLines: 30,
      requiredPatterns: [/mcs/i, /peo/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(ChordalGraphVisualizer, {
      algorithmId: 'chordal-graph',
      viewId: 'algo-chordal-graph-view',
    });
  });
});
