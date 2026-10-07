import { describe, it, expect } from 'vitest';
import {
  buildConnectSticksStage1Steps,
  buildConnectSticksStage2Steps,
  buildConnectSticksStage3Steps,
  parseConnectSticksInput,
} from './minimum-cost-connect-sticks-step-compiler';

describe('Minimum Cost Connect Sticks Step Compiler', () => {
  it('Stage 1 generates valid brute force comparison steps', () => {
    const steps = buildConnectSticksStage1Steps([2, 4, 3]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    expect(steps[steps.length - 1].totalCost).toBe(14);
  });

  it('Stage 2 generates Huffman min heap steps with line linkage', () => {
    const steps = buildConnectSticksStage2Steps([1, 8, 3, 5]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
    const last = steps[steps.length - 1];
    expect(last.totalCost).toBe(30);

    // Single stick guard
    const singleSteps = buildConnectSticksStage2Steps([5]);
    expect(singleSteps[1].totalCost).toBe(0);
  });

  it('Stage 3 generates Huffman depth invariant proof steps', () => {
    const steps = buildConnectSticksStage3Steps([2, 4, 3]);
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].decision).toContain('阶段 3');
  });

  it('parseConnectSticksInput parses custom input arrays across stages', () => {
    const s1 = parseConnectSticksInput({ 'input-sticks': '5, 5, 5, 5' }, 1);
    const s2 = parseConnectSticksInput({ 'input-sticks': '5, 5, 5, 5' }, 2);
    const s3 = parseConnectSticksInput({ 'input-sticks': '5, 5, 5, 5' }, 3);
    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);
  });
});
