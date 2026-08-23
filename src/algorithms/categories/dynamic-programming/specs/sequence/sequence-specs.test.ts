import { describe, it, expect } from 'vitest';
import { DpStepEngine } from '../../engine/dp-step-engine';
import '../index';

describe('Sequence DP Specs Architecture Verification', () => {
  it('LcsSpec computes LCS correctly and has complete problem metadata', () => {
    const spec = DpStepEngine.get('lcs');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(1143);
    expect(spec?.problem?.difficulty).toBe('medium');

    const steps = DpStepEngine.generateSteps('lcs', { s: 'abcde', t: 'ace' });
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[5]?.[3]).toBe(3);
    expect(last.message).toContain('3');
  });

  it('EditDistanceSpec computes minimum edit distance correctly with backtrack path', () => {
    const spec = DpStepEngine.get('edit-distance');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(72);
    expect(spec?.problem?.difficulty).toBe('hard');

    const steps = DpStepEngine.generateSteps('edit-distance', { s: 'horse', t: 'ros' });
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.metrics?.answer).toBe(3);
    expect(last.backtrackPath?.length).toBeGreaterThan(0);
  });

  it('PalindromicSubstringsSpec counts palindromes correctly', () => {
    const spec = DpStepEngine.get('pal-count');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(647);

    const steps = DpStepEngine.generateSteps('pal-count', { s: 'aaa' });
    const last = steps[steps.length - 1];
    expect(last.message).toContain('6');
  });

  it('UncrossedLinesSpec calculates max uncrossed lines equivalent to LCS', () => {
    const spec = DpStepEngine.get('uncrossed-lines');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(1035);

    const steps = DpStepEngine.generateSteps('uncrossed-lines', {
      nums1: [1, 4, 2],
      nums2: [1, 2, 4],
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[3]?.[3]).toBe(2);
  });

  it('IsSubsequenceSpec accurately verifies subsequence relationship', () => {
    const spec = DpStepEngine.get('is-subseq');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(392);

    const stepsTrue = DpStepEngine.generateSteps('is-subseq', { s: 'abc', t: 'ahbgdc' });
    expect(stepsTrue[stepsTrue.length - 1].message).toContain('是子序列');

    const stepsFalse = DpStepEngine.generateSteps('is-subseq', { s: 'axc', t: 'ahbgdc' });
    expect(stepsFalse[stepsFalse.length - 1].message).toContain('不是子序列');
  });

  it('DistinctSubsequencesSpec computes occurrences count correctly', () => {
    const spec = DpStepEngine.get('distinct-sub');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(115);

    const steps = DpStepEngine.generateSteps('distinct-sub', { s: 'rabbbit', t: 'rabbit' });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[7]?.[6]).toBe(3);
    expect(last.message).toContain('3 种');
  });
});
