import { describe, it, expect } from 'vitest';
import { DpStepEngine } from '../../engine/dp-step-engine';
import '../index';

describe('Knapsack DP Specs Architecture Verification', () => {
  it('Knapsack01Spec computes max value with 2D DP table', () => {
    const spec = DpStepEngine.get('01-knapsack');
    expect(spec).toBeDefined();
    expect(spec?.name).toContain('0-1 背包');

    const steps = DpStepEngine.generateSteps('01-knapsack', {
      weights: [1, 3, 4],
      values: [15, 20, 30],
      bagWeight: 4,
    });
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[2]?.[4]).toBe(35);
    expect(last.message).toContain('35');
  });

  it('CompleteKnapsackSpec computes max value allowing duplicate items', () => {
    const spec = DpStepEngine.get('complete-knapsack');
    expect(spec).toBeDefined();

    const steps = DpStepEngine.generateSteps('complete-knapsack', {
      weights: [1, 3, 4],
      values: [15, 20, 30],
      bagWeight: 4,
    });
    const last = steps[steps.length - 1];
    expect(last.dp1d?.[4]).toBe(60);
  });

  it('CoinChangeSpec finds minimum coins for amount', () => {
    const spec = DpStepEngine.get('coin-change');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(322);

    const steps = DpStepEngine.generateSteps('coin-change', {
      coins: [1, 2, 5],
      amount: 11,
    });
    const last = steps[steps.length - 1];
    expect(last.dp1d?.[11]).toBe(3);
    expect(last.message).toContain('3 枚');
  });

  it('CoinChangeIiSpec counts combinations correctly', () => {
    const spec = DpStepEngine.get('coin-change-ii');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(518);

    const steps = DpStepEngine.generateSteps('coin-change-ii', {
      coins: [1, 2, 5],
      amount: 5,
    });
    const last = steps[steps.length - 1];
    expect(last.dp1d?.[5]).toBe(4);
    expect(last.message).toContain('4 种');
  });

  it('PartitionSubsetSpec determines partition possibility', () => {
    const spec = DpStepEngine.get('partition-equal-subset-sum');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(416);

    const stepsTrue = DpStepEngine.generateSteps('partition-equal-subset-sum', {
      nums: [1, 5, 11, 5],
    });
    const lastTrue = stepsTrue[stepsTrue.length - 1];
    expect(lastTrue.message).toContain('可以分割');

    const stepsFalse = DpStepEngine.generateSteps('partition-equal-subset-sum', {
      nums: [1, 2, 3, 5],
    });
    const lastFalse = stepsFalse[stepsFalse.length - 1];
    expect(lastFalse.message).toContain('无法等分');
  });

  it('TargetSumSpec computes target expressions count', () => {
    const spec = DpStepEngine.get('target-sum');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(494);

    const steps = DpStepEngine.generateSteps('target-sum', {
      nums: [1, 1, 1, 1, 1],
      target: 3,
    });
    const last = steps[steps.length - 1];
    expect(last.dp1d?.[4]).toBe(5);
    expect(last.message).toContain('5 种');
  });

  it('CombinationSumIvSpec calculates permutations count', () => {
    const spec = DpStepEngine.get('combination-sum-iv');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(377);

    const steps = DpStepEngine.generateSteps('combination-sum-iv', {
      nums: [1, 2, 3],
      target: 4,
    });
    const last = steps[steps.length - 1];
    expect(last.dp1d?.[4]).toBe(7);
    expect(last.message).toContain('7 种');
  });

  it('PerfectSquaresSpec finds minimum number of squares', () => {
    const spec = DpStepEngine.get('perfect-squares');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(279);

    const steps = DpStepEngine.generateSteps('perfect-squares', { n: 12 });
    const last = steps[steps.length - 1];
    expect(last.dp1d?.[12]).toBe(3);
    expect(last.message).toContain('3 个');
  });
});
