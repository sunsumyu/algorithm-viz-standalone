import { describe, it, expect } from 'vitest';
import {
  buildSortedArrayToBstStage1Steps,
  buildSortedArrayToBstStage2Steps,
  buildSortedArrayToBstStage3Steps,
  parseAndBuildSortedArrayToBstNums,
  collectTreeValues,
} from './sorted-array-to-bst-step-compiler';

describe('SortedArrayToBstStepCompiler (LeetCode 108)', () => {
  it('正确处理空数组边界（Stage 1, 2, 3 均产生退出步）', () => {
    const s1 = buildSortedArrayToBstStage1Steps([]);
    expect(s1.length).toBe(1);
    expect(s1[0].action).toBe('done');
    expect(s1[0].tree).toBeNull();
    expect(s1[0].codeLine).toBeDefined();

    const s2 = buildSortedArrayToBstStage2Steps([]);
    expect(s2.length).toBe(1);
    expect(s2[0].action).toBe('done');
    expect(s2[0].tree).toBeNull();

    const s3 = buildSortedArrayToBstStage3Steps([]);
    expect(s3.length).toBe(1);
    expect(s3[0].action).toBe('done');
    expect(s3[0].tree).toBeNull();
  });

  it('Stage 1 偏左中点成功构建奇数长度 [-10, -3, 0, 5, 9]', () => {
    const nums = [-10, -3, 0, 5, 9];
    const steps = buildSortedArrayToBstStage1Steps(nums);
    expect(steps.length).toBeGreaterThan(10);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.tree).toBeDefined();
    expect(last.tree?.val).toBe(0);

    // 验证所有步骤代码行号
    for (const step of steps) {
      expect(step.codeLine).toBeDefined();
    }
  });

  it('Stage 1 与 Stage 2 在偶数长度 [1, 2, 3, 4] 下的中点与根节点拓扑偏转差异', () => {
    const nums = [1, 2, 3, 4];
    const s1 = buildSortedArrayToBstStage1Steps(nums);
    const s2 = buildSortedArrayToBstStage2Steps(nums);

    const s1Root = s1[s1.length - 1].tree?.val;
    const s2Root = s2[s2.length - 1].tree?.val;

    // 偏左中点：floor(3/2) = 1 (值为 2)
    // 偏右中点：floor(4/2) = 2 (值为 3)
    expect(s1Root).toBe(2);
    expect(s2Root).toBe(3);
  });

  it('Stage 3 三队列显式 BFS 迭代模拟构建成功完成', () => {
    const nums = [-10, -3, 0, 5, 9];
    const steps = buildSortedArrayToBstStage3Steps(nums);
    expect(steps.length).toBeGreaterThan(5);

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.tree?.val).toBe(0);

    for (const step of steps) {
      expect(step.bfsQueues).toBeDefined();
    }
  });

  it('collectTreeValues 辅助函数完整收获节点序列', () => {
    const s1 = buildSortedArrayToBstStage1Steps([1, 2, 3]);
    const root = s1[s1.length - 1].tree;
    const vals = collectTreeValues(root);
    expect(vals.sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it('parseAndBuildSortedArrayToBstNums 正确解析输入列表与默认值', () => {
    const nums = parseAndBuildSortedArrayToBstNums({ 'input-nums': '1, 3, 5, 7' });
    expect(nums).toEqual([1, 3, 5, 7]);

    const defaultNums = parseAndBuildSortedArrayToBstNums();
    expect(defaultNums).toEqual([-10, -3, 0, 5, 9]);
  });
});
