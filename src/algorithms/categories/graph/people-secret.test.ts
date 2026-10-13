import { describe, it, expect } from 'vitest';
import {
  PeopleSecretVisualizer,
  buildSecretExpertSteps,
} from './people-secret-renderer';
import { PEOPLE_SECRET_CODE_LANGUAGES } from './people-secret-problem-content';
import {
  assertVisualizerLifecycleContract,
  assertMultiLanguageCodeContract,
  assertStepStreamContract,
} from '../../../core/testing/contract-assertions';

describe('FindAllPeopleWithSecret (LeetCode 2092)', () => {
  it('should instantiate PeopleSecretVisualizer properly', () => {
    const viz = new PeopleSecretVisualizer();
    expect(viz).toBeDefined();
  });

  it('should generate at least 20 granular steps for classic_6expert preset', () => {
    const steps = buildSecretExpertSteps('classic_6expert');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    assertStepStreamContract(steps, {
      codes: PEOPLE_SECRET_CODE_LANGUAGES,
      requiredMetricKeys: ['metric-secret-time', 'metric-known-count', 'metric-cur-meeting', 'metric-secret-phase'],
    });

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.knownExperts).toEqual([0, 1, 2, 3]);
    expect(lastStep.knownExperts.includes(4)).toBe(false);
    expect(lastStep.knownExperts.includes(5)).toBe(false);
  });

  it('should generate at least 20 granular steps for multitime_5expert preset', () => {
    const steps = buildSecretExpertSteps('multitime_5expert');
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = PEOPLE_SECRET_CODE_LANGUAGES.java.length;
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
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.status).toBe('done');
    expect(lastStep.knownExperts).toEqual([0, 1, 2, 3, 4]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(PEOPLE_SECRET_CODE_LANGUAGES, {
      minLines: 35,
      requiredPatterns: [/findallpeople|find_all_people/i, /parent|father/i, /find/i, /union|unite/i],
    });
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(PeopleSecretVisualizer, {
      algorithmId: 'people-secret',
      viewId: 'algo-people-secret-view',
    });
  });
});
