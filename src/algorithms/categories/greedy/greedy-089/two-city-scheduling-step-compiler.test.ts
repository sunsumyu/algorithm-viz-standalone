import { describe, it, expect } from 'vitest';
import {
  buildTwoCityStage1Steps,
  buildTwoCityStage2Steps,
  buildTwoCityStage3Steps,
  parseTwoCityInput,
} from './two-city-scheduling-step-compiler';

describe('Two City Scheduling Step Compiler', () => {
  const sampleCosts = [[10, 20], [30, 200], [400, 50], [30, 20]];

  it('Stage 1 generates brute force combinations steps', () => {
    const steps = buildTwoCityStage1Steps(sampleCosts);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    expect(steps[steps.length - 1].totalCost).toBe(110);
  });

  it('Stage 2 generates delta sorting greedy steps with line linkage', () => {
    const steps = buildTwoCityStage2Steps(sampleCosts);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
    const last = steps[steps.length - 1];
    expect(last.totalCost).toBe(110);
    expect(last.assignedA.length).toBe(2);
    expect(last.assignedB.length).toBe(2);
  });

  it('Stage 3 generates exchange argument proof steps', () => {
    const steps = buildTwoCityStage3Steps(sampleCosts);
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].decision).toContain('阶段 3');
  });

  it('parseTwoCityInput parses input across stages and ensures even size', () => {
    const s1 = parseTwoCityInput({ 'input-costs': '10,20; 30,200; 400,50; 30,20' }, 1);
    const s2 = parseTwoCityInput({ 'input-costs': '10,20; 30,200; 400,50; 30,20' }, 2);
    const s3 = parseTwoCityInput({ 'input-costs': '10,20; 30,200; 400,50; 30,20' }, 3);
    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);
  });
});
