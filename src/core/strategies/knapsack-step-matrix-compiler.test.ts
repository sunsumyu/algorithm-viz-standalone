import { describe, it, expect } from 'vitest';
import { KnapsackStepMatrixCompiler, KnapsackDomainConfig } from './knapsack-step-matrix-compiler';

describe('KnapsackStepMatrixCompiler Pipeline Deep Module Guard', () => {
  const sampleConfig: KnapsackDomainConfig = {
    modelId: 'partition-equal-subset-sum',
    kind: 'partition-subset',
    items: [
      { index: 0, weight: 1, value: 1 },
      { index: 1, weight: 5, value: 5 },
      { index: 2, weight: 11, value: 11 },
      { index: 3, weight: 5, value: 5 }
    ],
    capacity: 11,
    oddCheck: {
      hasOddFail: false,
      sum: 22
    }
  };

  it('should compile Stage 1 (Pure Recursion) steps correctly', () => {
    const steps = KnapsackStepMatrixCompiler.compile(sampleConfig, 1);
    expect(steps.length).toBeGreaterThan(5);
    expect(steps[0].type).toBe('entry');
    expect(steps[steps.length - 1].type).toBe('return');
  });

  it('should compile Stage 2 (Memoized Search) with memo hit steps', () => {
    const memoConfig: KnapsackDomainConfig = {
      modelId: 'partition-equal-subset-sum',
      kind: 'partition-subset',
      items: [
        { index: 0, weight: 2, value: 2 },
        { index: 1, weight: 2, value: 2 },
        { index: 2, weight: 2, value: 2 },
        { index: 3, weight: 2, value: 2 }
      ],
      capacity: 3,
      isMemo: true
    };
    const steps = KnapsackStepMatrixCompiler.compile(memoConfig, 2);
    expect(steps.length).toBeGreaterThan(5);
    const memoHit = steps.find(s => s.type === 'memo-hit');
    expect(memoHit).toBeDefined();
  });

  it('should compile Stage 3 (2D DP Tabulation) with valid state matrix', () => {
    const steps = KnapsackStepMatrixCompiler.compile(sampleConfig, 3);
    expect(steps.length).toBeGreaterThan(10);
    const updateSteps = steps.filter(s => s.type === 'update');
    expect(updateSteps.length).toBeGreaterThan(0);
    expect(updateSteps[0].grid).toBeDefined();
  });

  it('should compile Stage 4 (1D Rolling Compression) with 1D dp slots', () => {
    const steps = KnapsackStepMatrixCompiler.compile(sampleConfig, 4);
    expect(steps.length).toBeGreaterThan(5);
    const update1d = steps.find(s => s.type === 'update-1d');
    expect(update1d).toBeDefined();
    expect(update1d?.dp1d).toBeDefined();
  });

  it('should handle odd check failure cleanly', () => {
    const oddFailConfig: KnapsackDomainConfig = {
      ...sampleConfig,
      oddCheck: {
        hasOddFail: true,
        sum: 23
      }
    };
    const steps = KnapsackStepMatrixCompiler.compile(oddFailConfig, 3);
    expect(steps.length).toBe(1);
    expect(steps[0].tag).toContain('奇数总和 23 无法平分');
  });
});
