import { describe, it, expect } from 'vitest';
import {
  buildCompletenessQueueSteps,
  buildCompletenessStaticArraySteps,
  buildCompletenessSentinelSteps,
  buildCompleteness036Steps,
  parseAndBuildCompletenessTree,
} from './completeness-binary-tree-step-compiler';

describe('CompletenessBinaryTreeStepCompiler (LeetCode 958)', () => {
  it('正确处理空树输入（Stage 1, 2, 3）', () => {
    const s1 = buildCompletenessQueueSteps(null);
    expect(s1.length).toBe(2);
    expect(s1[s1.length - 1].isValid).toBe(true);
    expect(s1[0].codeLine).toBeDefined();

    const s2 = buildCompletenessStaticArraySteps(null);
    expect(s2.length).toBe(2);
    expect(s2[s2.length - 1].isValid).toBe(true);

    const s3 = buildCompletenessSentinelSteps(null);
    expect(s3.length).toBe(2);
    expect(s3[s3.length - 1].isValid).toBe(true);
  });

  it('Stage 1 成功验证标准完全二叉树 [1, 2, 3, 4, 5, 6]', () => {
    const root = parseAndBuildCompletenessTree({ tree: '1, 2, 3, 4, 5, 6' });
    const steps = buildCompletenessQueueSteps(root);
    expect(steps.length).toBeGreaterThan(5);

    const last = steps[steps.length - 1];
    expect(last.isValid).toBe(true);
    expect(last.decision).toContain('完全二叉树校验通过');

    // 验证所有步骤的 1-based 多语言代码行号映射
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
      if (typeof step.codeLine === 'object' && step.codeLine !== null) {
        expect((step.codeLine as any).java).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('Stage 1 准确拦截【有右无左】违规用例 [1, 2, 3, null, 4]', () => {
    const root = parseAndBuildCompletenessTree({ tree: '1, 2, 3, null, 4' });
    const steps = buildCompletenessQueueSteps(root);
    const last = steps[steps.length - 1];
    expect(last.isValid).toBe(false);
    expect(last.violationReason).toBe('有右无左违规');
  });

  it('Stage 1 准确拦截【断点后出现非叶子】违规用例 [1, 2, 3, 4, null, 6, 7]', () => {
    const root = parseAndBuildCompletenessTree({ tree: '1, 2, 3, 4, null, 6, 7' });
    const steps = buildCompletenessQueueSteps(root);
    const last = steps[steps.length - 1];
    expect(last.isValid).toBe(false);
    expect(last.violationReason).toBe('断点后出现非叶子节点');
  });

  it('Stage 2 静态数组连续内存队列模拟正确演进与通过', () => {
    const root = parseAndBuildCompletenessTree({ tree: '1, 2, 3, 4, 5, 6' });
    const steps = buildCompletenessStaticArraySteps(root);
    expect(steps.length).toBeGreaterThan(5);

    for (const step of steps) {
      expect(step.staticQueueState).toBeDefined();
      expect(step.codeLine).toBeDefined();
    }

    const last = steps[steps.length - 1];
    expect(last.isValid).toBe(true);
  });

  it('Stage 2 静态数组准确拦截违规', () => {
    const root = parseAndBuildCompletenessTree({ tree: '1, 2, 3, null, 4' });
    const steps = buildCompletenessStaticArraySteps(root);
    const last = steps[steps.length - 1];
    expect(last.isValid).toBe(false);
    expect(last.violationReason).toBe('有右无左违规');
  });

  it('Stage 3 空节点哨兵单调性队列正确演进与断层拦截', () => {
    const validRoot = parseAndBuildCompletenessTree({ tree: '1, 2, 3, 4, 5, 6' });
    const validSteps = buildCompletenessSentinelSteps(validRoot);
    expect(validSteps[validSteps.length - 1].isValid).toBe(true);

    const invalidRoot = parseAndBuildCompletenessTree({ tree: '1, 2, 3, 4, null, 6, 7' });
    const invalidSteps = buildCompletenessSentinelSteps(invalidRoot);
    const last = invalidSteps[invalidSteps.length - 1];
    expect(last.isValid).toBe(false);
    expect(last.violationReason).toBe('紧凑排布中存在空隙断层');
  });

  it('Legacy buildCompleteness036Steps 兼容函数返回合法步骤', () => {
    const steps = buildCompleteness036Steps();
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[steps.length - 1].isValid).toBe(true);
  });
});
