import { describe, it, expect } from 'vitest';
import {
  AStarJourneyVisualizer,
  buildAStarJourneySteps,
} from './a-star-journey-renderer';
import { A_STAR_JOURNEY_CODE_LANGUAGES } from './a-star-journey-problem-content';
import {
  assertStepStreamContract,
  assertMultiLanguageCodeContract,
  assertVisualizerLifecycleContract,
} from '../../../core/testing/contract-assertions';

describe('AStarJourney', () => {
  it('should instantiate AStarJourneyVisualizer properly', () => {
    const viz = new AStarJourneyVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_3x4 preset', () => {
    const steps = buildAStarJourneySteps('classic_3x4');
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: A_STAR_JOURNEY_CODE_LANGUAGES,
      requiredMetricKeys: [
        'metric-astar-coord',
        'metric-astar-f',
        'metric-open-size',
        'metric-astar-phase',
      ],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curR).toBe(2);
    expect(lastStep.curC).toBe(3);
    expect(lastStep.path.length).toBe(6);
  });

  it('should generate at least 20 granular steps for line_3x3 preset', () => {
    const steps = buildAStarJourneySteps('line_3x3');
    assertStepStreamContract(steps, {
      minSteps: 20,
      codes: A_STAR_JOURNEY_CODE_LANGUAGES,
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.curR).toBe(2);
    expect(lastStep.curC).toBe(2);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(A_STAR_JOURNEY_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/astar|a_star/i, /heap|queue|open/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(AStarJourneyVisualizer, {
      algorithmId: 'a-star-journey',
      viewId: 'algo-a-star-journey-view',
    });
  });
});
