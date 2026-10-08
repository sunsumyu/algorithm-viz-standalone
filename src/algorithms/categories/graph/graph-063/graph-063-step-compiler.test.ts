// @vitest-environment jsdom
/**
 * 左程云 Class 063: 双向广搜与折半搜索 Step Compilers 伴生测试
 */

import { describe, it, expect } from 'vitest';
import { buildWordLadder063Steps } from './word-ladder-063-step-compiler';
import { buildSnacksWays063Steps } from './snacks-ways-buy-tickets-063-step-compiler';
import { buildClosestSubsequenceSum063Steps } from './closest-subsequence-sum-063-step-compiler';
import { buildPartitionMinDiff063Steps } from './partition-minimize-difference-063-step-compiler';

describe('Graph Class 063 Step Compilers 独立伴生契约测试', () => {
  it('buildWordLadder063Steps: 生成完整波前推进步进与 codeLine', () => {
    const steps = buildWordLadder063Steps('hit_to_cog');
    expect(steps.length).toBeGreaterThan(4);
    expect(steps[0].status).toBe('init');
    expect(steps[steps.length - 1].status).toBe('meet');
    expect(steps[steps.length - 1].stepLen).toBe(5);
    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message.length).toBeGreaterThan(0);
    }
  });

  it('buildWordLadder063Steps: 处理无解情况', () => {
    const steps = buildWordLadder063Steps('unreachable');
    const last = steps[steps.length - 1];
    expect(last.stepLen).toBe(0);
    expect(last.status).toBe('done');
  });

  it('buildSnacksWays063Steps: 牛牛背包折半搜索方案数正确', () => {
    const steps = buildSnacksWays063Steps('standard_3_snacks');
    expect(steps.length).toBeGreaterThan(5);
    const last = steps[steps.length - 1];
    expect(last.totalWays).toBe(8);
    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
    }
  });

  it('buildClosestSubsequenceSum063Steps: 最接近子序列和双向二分逼近', () => {
    const steps = buildClosestSubsequenceSum063Steps('leetcode_example_1');
    expect(steps.length).toBeGreaterThan(5);
    const last = steps[steps.length - 1];
    expect(last.bestDiff).toBe(0);
    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
    }
  });

  it('buildPartitionMinDiff063Steps: 选数分桶与二分配对求得最小差', () => {
    const steps = buildPartitionMinDiff063Steps('leetcode_example_1');
    expect(steps.length).toBeGreaterThan(4);
    const last = steps[steps.length - 1];
    expect(last.bestDiff).toBe(2);
    expect(last.status).toBe('done');
    for (const step of steps) {
      expect(typeof step.line).toBe('number');
      expect(step.line).toBeGreaterThanOrEqual(1);
    }
  });

  it('buildPartitionMinDiff063Steps: 应对负数用例', () => {
    const steps = buildPartitionMinDiff063Steps('leetcode_example_2');
    const last = steps[steps.length - 1];
    expect(last.bestDiff).toBe(72);
  });
});
