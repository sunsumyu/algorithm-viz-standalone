import { describe, it, expect } from 'vitest';
import { DpStepEngine } from '../engine/dp-step-engine';
import './index';

describe('Complete DP Specs Comprehensive Test Suite', () => {
  it('LastStoneWeightIiSpec calculates stone smash minimum weight', () => {
    const spec = DpStepEngine.get('last-stone-weight-ii');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(1049);

    const steps = DpStepEngine.generateSteps('last-stone-weight-ii', { stones: [2, 7, 4, 1, 8, 1] });
    const last = steps[steps.length - 1];
    expect(last.message).toContain('1');
  });

  it('OnesAndZeroesSpec calculates 2D-cost knapsack max subset', () => {
    const spec = DpStepEngine.get('ones-and-zeroes');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(474);

    const steps = DpStepEngine.generateSteps('ones-and-zeroes', {
      strs: ['10', '0001', '111001', '1', '0'],
      m: 5,
      n: 3,
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[5]?.[3]).toBe(4);
  });

  it('WordBreakSpec solves permutation knapsack word break', () => {
    const spec = DpStepEngine.get('word-break');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(139);

    const steps = DpStepEngine.generateSteps('word-break', {
      s: 'leetcode',
      wordDict: ['leet', 'code'],
    });
    const last = steps[steps.length - 1];
    expect(last.message).toContain('true');
  });

  it('StockIvSpec solves k-transaction state machine', () => {
    const spec = DpStepEngine.get('best-time-to-buy-and-sell-stock-iv');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(188);

    const steps = DpStepEngine.generateSteps('best-time-to-buy-and-sell-stock-iv', {
      k: 2,
      prices: [3, 2, 6, 5, 0, 3],
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[5]?.[4]).toBe(7);
  });

  it('LisSpec calculates longest increasing subsequence', () => {
    const spec = DpStepEngine.get('longest-increasing-subsequence');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(300);

    const steps = DpStepEngine.generateSteps('longest-increasing-subsequence', {
      nums: [10, 9, 2, 5, 3, 7, 101, 18],
    });
    const last = steps[steps.length - 1];
    expect(last.vars?.find((v) => v.name.includes('maxLen'))?.value).toBe('4');
  });

  it('LcisSpec calculates longest continuous increasing subsequence', () => {
    const spec = DpStepEngine.get('longest-continuous-increasing-subsequence');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(674);

    const steps = DpStepEngine.generateSteps('longest-continuous-increasing-subsequence', {
      nums: [1, 3, 5, 4, 7],
    });
    const last = steps[steps.length - 1];
    expect(last.vars?.find((v) => v.name.includes('maxLen'))?.value).toBe('3');
  });

  it('LongestRepeatedSubarraySpec calculates continuous common subarray', () => {
    const spec = DpStepEngine.get('longest-repeated-subarray');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(718);

    const steps = DpStepEngine.generateSteps('longest-repeated-subarray', {
      nums1: [1, 2, 3, 2, 1],
      nums2: [3, 2, 1, 4, 7],
    });
    const last = steps[steps.length - 1];
    expect(last.vars?.find((v) => v.name.includes('maxLen'))?.value).toBe('3');
  });

  it('MaxSubarraySpec calculates max subarray sum', () => {
    const spec = DpStepEngine.get('max-subarray-dp');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(53);

    const steps = DpStepEngine.generateSteps('max-subarray-dp', {
      nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    });
    const last = steps[steps.length - 1];
    expect(last.vars?.find((v) => v.name.includes('maxSum'))?.value).toBe('6');
  });

  it('DeleteDistanceSpec calculates min deletion steps', () => {
    const spec = DpStepEngine.get('delete-operation-for-two-strings');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(583);

    const steps = DpStepEngine.generateSteps('delete-operation-for-two-strings', {
      word1: 'sea',
      word2: 'eat',
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[3]?.[3]).toBe(2);
  });

  it('LongestPalindromicSubsequenceSpec calculates longest palindromic subsequence', () => {
    const spec = DpStepEngine.get('longest-palindromic-subsequence');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(516);

    const steps = DpStepEngine.generateSteps('longest-palindromic-subsequence', {
      s: 'bbbab',
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[0]?.[4]).toBe(4);
  });

  it('KnightProbabilitySpec executes via DpStepEngine', () => {
    const spec = DpStepEngine.get('knight-probability');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(688);

    const steps = DpStepEngine.generateSteps('knight-probability', { n: 3, k: 2, row: 0, column: 0 });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].metrics?.probability).toBeDefined();
  });

  it('OutOfBoundaryPathsSpec executes via DpStepEngine', () => {
    const spec = DpStepEngine.get('out-of-boundary-paths');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(576);

    const steps = DpStepEngine.generateSteps('out-of-boundary-paths', { m: 2, n: 2, maxMove: 2, startRow: 0, startColumn: 0 });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].metrics?.pathsCount).toBe(6);
  });

  it('ProfitableSchemesSpec executes via DpStepEngine', () => {
    const spec = DpStepEngine.get('profitable-schemes');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(879);

    const steps = DpStepEngine.generateSteps('profitable-schemes', { n: 5, minProfit: 3, group: [2, 2], profit: [2, 3] });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].metrics?.totalSchemes).toBe(2);
  });

  it('CountDigitOneSpec executes via DpStepEngine', () => {
    const spec = DpStepEngine.get('count-digit-one');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(233);

    const steps = DpStepEngine.generateSteps('count-digit-one', { n: 13 });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].metrics?.totalOnes).toBe(6);
  });

  it('NonNegativeConsecutiveOnesSpec executes via DpStepEngine', () => {
    const spec = DpStepEngine.get('non-negative-consecutive-ones');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(600);

    const steps = DpStepEngine.generateSteps('non-negative-consecutive-ones', { n: 5 });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].metrics?.validCount).toBe(5);
  });

  it('MaxCircularSubarraySpec executes via DpStepEngine', () => {
    const spec = DpStepEngine.get('max-circular-subarray');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(918);

    const steps = DpStepEngine.generateSteps('max-circular-subarray', { nums: [1, -2, 3, -2] });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].metrics?.maxSum).toBe(3);
  });

  it('MaxProductSubarraySpec executes via DpStepEngine', () => {
    const spec = DpStepEngine.get('max-product-subarray');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(152);

    const steps = DpStepEngine.generateSteps('max-product-subarray', { nums: [2, 3, -2, 4] });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].metrics?.maxProduct).toBe(6);
  });

  it('RussianDollEnvelopesSpec executes via DpStepEngine', () => {
    const spec = DpStepEngine.get('russian-doll-envelopes');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(354);

    const steps = DpStepEngine.generateSteps('russian-doll-envelopes', { envelopes: [[5, 4], [6, 4], [6, 7], [2, 3]] });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].metrics?.maxEnvelopes).toBe(3);
  });

  it('SuperEggDropSpec executes via DpStepEngine', () => {
    const spec = DpStepEngine.get('super-egg-drop');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(887);

    const steps = DpStepEngine.generateSteps('super-egg-drop', { k: 2, n: 6 });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].metrics?.minMoves).toBe(3);
  });

  it('SlidingWindowDpSpec executes via DpStepEngine', () => {
    const spec = DpStepEngine.get('sliding-window-dp');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(1696);

    const steps = DpStepEngine.generateSteps('sliding-window-dp', { nums: [1, -1, -2, 4, -7, 3], k: 2 });
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].metrics?.maxScore).toBe(7);
  });
});

