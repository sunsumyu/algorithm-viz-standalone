import { describe, it, expect } from 'vitest';
import { buildSPFASteps } from './spfa-renderer';
import { SPFA_CODE_LANGUAGES } from './spfa-problem-content';
import {
  assertMultiLanguageCodeContract,
} from '../../../core/testing/contract-assertions';

describe('SPFA (LeftChengYun Class 061)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildSPFASteps();
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = SPFA_CODE_LANGUAGES.java.length;
    for (const step of steps) {
      expect(step.statusText).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.codeLine).toBeDefined();
      const javaLine =
        typeof step.codeLine === 'object' && step.codeLine !== null && 'java' in (step.codeLine as any)
          ? (step.codeLine as any).java
          : step.codeLine;
      const lines = Array.isArray(javaLine) ? javaLine : [javaLine];
      for (const line of lines) {
        expect(line).toBeGreaterThan(0);
        expect(line).toBeLessThanOrEqual(javaLinesCount);
      }
      expect(step.metrics).toBeDefined();
      expect(step.metrics?.['metric-spfa-queue']).toBeDefined();
      expect(step.metrics?.['metric-spfa-cur']).toBeDefined();
      expect(step.metrics?.['metric-spfa-relax']).toBeDefined();
      expect(step.metrics?.['metric-spfa-dist']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.dist).toEqual([0, 4, 2, 5, 3]);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(SPFA_CODE_LANGUAGES, {
      minLines: 15,
      requiredPatterns: [/spfa/i],
    });
  });
});
