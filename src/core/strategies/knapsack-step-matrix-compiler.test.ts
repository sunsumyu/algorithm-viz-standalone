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
    const transferSteps = steps.filter(s => s.type === 'transfer' || s.type === 'update');
    expect(transferSteps.length).toBeGreaterThan(0);
    expect(transferSteps[0].grid).toBeDefined();

    // 零跳步断言
    expect(steps.some(s => s.type === 'loop-outer')).toBe(true);
    expect(steps.some(s => s.type === 'loop-inner')).toBe(true);
    expect(steps.some(s => s.type === 'cond')).toBe(true);
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

  it('should compile complete-knapsack, coin-change-ii, coin-change across all 4 stages', () => {
    // 1. complete-knapsack
    const completeConfig: KnapsackDomainConfig = {
      modelId: 'complete-knapsack',
      kind: 'complete-standard',
      items: [
        { index: 0, weight: 1, value: 15 },
        { index: 1, weight: 3, value: 20 },
        { index: 2, weight: 4, value: 30 }
      ],
      capacity: 4
    };
    const s3Complete = KnapsackStepMatrixCompiler.compile(completeConfig, 3);
    const lastS3Complete = s3Complete[s3Complete.length - 1];
    expect(lastS3Complete.type).toBe('return');
    expect(lastS3Complete.grid?.[2][4]).toBe(60); // 4 * 15 = 60

    const s4Complete = KnapsackStepMatrixCompiler.compile(completeConfig, 4);
    const lastS4Complete = s4Complete[s4Complete.length - 1];
    expect(lastS4Complete.type).toBe('return');
    expect(lastS4Complete.memoj).toBe(60);

    // 2. coin-change-ii (count combinations)
    const coin2Config: KnapsackDomainConfig = {
      modelId: 'coin-change-ii',
      kind: 'coin-change-count',
      items: [
        { index: 0, weight: 1, value: 1 },
        { index: 1, weight: 2, value: 2 },
        { index: 2, weight: 5, value: 5 }
      ],
      capacity: 5
    };
    const s3Coin2 = KnapsackStepMatrixCompiler.compile(coin2Config, 3);
    const lastS3Coin2 = s3Coin2[s3Coin2.length - 1];
    expect(lastS3Coin2.grid?.[2][5]).toBe(4); // 4 种组合

    const s4Coin2 = KnapsackStepMatrixCompiler.compile(coin2Config, 4);
    const lastS4Coin2 = s4Coin2[s4Coin2.length - 1];
    expect(lastS4Coin2.memoj).toBe(4);

    // 3. coin-change (min coins)
    const coinConfig: KnapsackDomainConfig = {
      modelId: 'coin-change',
      kind: 'coin-change-min',
      items: [
        { index: 0, weight: 1, value: 1 },
        { index: 1, weight: 2, value: 1 },
        { index: 2, weight: 5, value: 1 }
      ],
      capacity: 5
    };
    const s3Coin = KnapsackStepMatrixCompiler.compile(coinConfig, 3);
    const lastS3Coin = s3Coin[s3Coin.length - 1];
    expect(lastS3Coin.grid?.[2][5]).toBe(1); // 1 枚 (面额 5)

    const s4Coin = KnapsackStepMatrixCompiler.compile(coinConfig, 4);
    const lastS4Coin = s4Coin[s4Coin.length - 1];
    expect(lastS4Coin.memoj).toBe(1);
  });
});
