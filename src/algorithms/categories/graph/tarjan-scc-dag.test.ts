import { describe, it, expect } from 'vitest';
import {
  TarjanSCCDAGVisualizer,
  buildTarjanSCCSteps,
} from './tarjan-scc-dag-renderer';
import { TARJAN_SCC_DAG_CODE_LANGUAGES } from './tarjan-scc-dag-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('TarjanSCCDAG (P3387)', () => {
  it('should instantiate TarjanSCCDAGVisualizer properly', () => {
    const viz = new TarjanSCCDAGVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_5node preset', () => {
    const steps = buildTarjanSCCSteps('classic_5node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TARJAN_SCC_DAG_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-scc-count', 'metric-stack-len', 'metric-cur-node', 'metric-tarjan-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.sccList.length).toBe(2);
    expect(lastStep.condensedEdges.length).toBe(1);
  });

  it('should generate at least 20 granular steps for simple_4node preset', () => {
    const steps = buildTarjanSCCSteps('simple_4node');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: TARJAN_SCC_DAG_CODE_LANGUAGES
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.sccList.length).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(TARJAN_SCC_DAG_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/tarjan/i, /builddag|build_dag/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(TarjanSCCDAGVisualizer, {
      algorithmId: 'tarjan-scc-dag',
      viewId: 'algo-tarjan-scc-dag-view',
    });
  });
});
