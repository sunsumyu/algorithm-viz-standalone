import { describe, it, expect } from 'vitest';
import {
  PruferSequenceVisualizer,
  buildPruferSteps,
} from './prufer-sequence-renderer';
import { PRUFER_CODE_LANGUAGES } from './prufer-sequence-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('PruferSequence (P6086 / Cayley)', () => {
  it('should instantiate PruferSequenceVisualizer properly', () => {
    const viz = new PruferSequenceVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for star_4node preset', () => {
    const steps = buildPruferSteps('star_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: PRUFER_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-cur-leaf', 'metric-prufer-seq', 'metric-cayley-count', 'metric-prufer-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.pruferSequence).toEqual([1, 1]);
  });

  it('should generate at least 20 granular steps for line_4node preset', () => {
    const steps = buildPruferSteps('line_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: PRUFER_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.pruferSequence).toEqual([2, 3]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(PRUFER_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/prufersequence|prufer_sequence|codec/i, /treetoprufer|tree_to_prufer/i, /prufertotree|prufer_to_tree/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(PruferSequenceVisualizer, {
      algorithmId: 'prufer-sequence',
      viewId: 'algo-prufer-sequence-view',
    });
  });
});
