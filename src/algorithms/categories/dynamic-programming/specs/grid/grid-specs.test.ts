import { describe, it, expect } from 'vitest';
import { DpStepEngine } from '../../engine/dp-step-engine';
import '../index';

describe('Grid DP Specs Architecture Verification', () => {
  it('UniquePathsSpec calculates total distinct paths accurately', () => {
    const spec = DpStepEngine.get('unique-paths');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(62);

    const steps = DpStepEngine.generateSteps('unique-paths', { m: 3, n: 7 });
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[2]?.[6]).toBe(28);
    expect(last.message).toContain('28 条');
  });

  it('UniquePathsIiSpec correctly avoids obstacles', () => {
    const spec = DpStepEngine.get('unique-paths-ii');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(63);

    const steps = DpStepEngine.generateSteps('unique-paths-ii', {
      grid: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ],
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[2]?.[2]).toBe(2);
    expect(last.message).toContain('2 条');
  });

  it('MinimumPathSumSpec calculates minimal weight path sum', () => {
    const spec = DpStepEngine.get('min-path-sum');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(64);

    const steps = DpStepEngine.generateSteps('min-path-sum', {
      grid: [
        [1, 3, 1],
        [1, 5, 1],
        [4, 2, 1],
      ],
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[2]?.[2]).toBe(7);
    expect(last.message).toContain('7');
  });

  it('TriangleSpec computes minimal path bottom-up converging to apex', () => {
    const spec = DpStepEngine.get('triangle');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(120);

    const steps = DpStepEngine.generateSteps('triangle', {
      triangle: [
        [2],
        [3, 4],
        [6, 5, 7],
        [4, 1, 8, 3],
      ],
    });
    const last = steps[steps.length - 1];
    expect(last.dp2d?.[0]?.[0]).toBe(11);
    expect(last.message).toContain('11');
  });

  it('MaximalSquareSpec finds largest square area with 3-neighbor min rule', () => {
    const spec = DpStepEngine.get('maximal-square');
    expect(spec).toBeDefined();
    expect(spec?.problem?.leetcodeId).toBe(221);

    const steps = DpStepEngine.generateSteps('maximal-square', {
      matrix: [
        ['1', '0', '1', '0', '0'],
        ['1', '0', '1', '1', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '0', '0', '1', '0'],
      ],
    });
    const last = steps[steps.length - 1];
    expect(last.vars?.find((v) => v.name.includes('maxSide'))?.value).toBe('2');
    expect(last.message).toContain('4');
  });
});
