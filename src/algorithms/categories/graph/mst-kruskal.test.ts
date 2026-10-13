import { describe, it, expect } from 'vitest';
import {
  buildKruskalSteps,
} from './mst-kruskal-renderer';
import { MST_KRUSKAL_CODE_LANGUAGES } from './mst-kruskal-problem-content';
import {
  assertMultiLanguageCodeContract,
} from '../../../core/testing/contract-assertions';

describe('MST Kruskal (LeftChengYun Class 058)', () => {
  it('should generate at least 20 granular steps for standard graph', () => {
    const steps = buildKruskalSteps();
    expect(steps.length).toBeGreaterThanOrEqual(20);

    const javaLinesCount = MST_KRUSKAL_CODE_LANGUAGES.java.length;
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
      expect(step.metrics?.['metric-kruskal-edges']).toBeDefined();
      expect(step.metrics?.['metric-kruskal-weight']).toBeDefined();
      expect(step.metrics?.['metric-kruskal-edge']).toBeDefined();
      expect(step.metrics?.['metric-kruskal-uf']).toBeDefined();
    }

    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.mstEdges.length).toBe(4);
    expect(lastStep.totalWeight).toBe(16);
  });

  it('should have complete code across all languages without empty stubs', () => {
    assertMultiLanguageCodeContract(MST_KRUSKAL_CODE_LANGUAGES, {
      minLines: 10,
      requiredPatterns: [/kruskal/i],
    });
  });
});
