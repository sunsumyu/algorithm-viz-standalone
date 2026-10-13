import { describe, it, expect } from 'vitest';
import {
  HeavyLightDecompositionVisualizer,
  buildHLDSteps,
} from './heavy-light-decomposition-renderer';
import { HLD_CODE_LANGUAGES } from './heavy-light-decomposition-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('HeavyLightDecomposition (P3384)', () => {
  it('should instantiate HeavyLightDecompositionVisualizer properly', () => {
    const viz = new HeavyLightDecompositionVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_6node preset', () => {
    const steps = buildHLDSteps('classic_6node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: HLD_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-heavy-chain', 'metric-path-segments', 'metric-cur-node', 'metric-hld-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.topNodes[4]).toBe(1);
    expect(lastStep.topNodes[6]).toBe(3);
    expect(lastStep.pathSegments).toEqual([[5, 6], [1, 3]]);
  });

  it('should generate at least 20 granular steps for line_4node preset', () => {
    const steps = buildHLDSteps('line_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: HLD_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.topNodes[4]).toBe(1);
    expect(lastStep.pathSegments).toEqual([[1, 4]]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(HLD_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/dfs1/i, /dfs2/i, /getpathsegments|get_path_segments/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(HeavyLightDecompositionVisualizer, {
      algorithmId: 'heavy-light-decomposition',
      viewId: 'algo-heavy-light-decomposition-view',
    });
  });
});
