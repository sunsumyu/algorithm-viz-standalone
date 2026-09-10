import { describe, it, expect } from 'vitest';
import { buildCombinationTree, combinationSteps } from './combination-renderer';
import { buildOptimizedTree, buildOptimizedSteps } from './combination-optimized-renderer';
import { buildCombinationSumTree, buildCombinationSumSteps } from './combination-sum-renderer';
import { buildCombinationSum2Tree, buildCombinationSum2Steps } from './combination-sum-ii-renderer';

describe('Backtracking Algorithms Step Generation & Tree Construction (回溯核心算法与决策树推导测试)', () => {
  describe('Combination (组合问题 LeetCode 77 - 完整决策树)', () => {
    it('1. n=4, k=2 构建完整决策树，叶子节点收集 6 个有效解', () => {
      const root = buildCombinationTree(4, 2);
      expect(root).toBeDefined();
      expect(root.children.length).toBe(4); // 根节点 4 个子分支: 1, 2, 3, 4

      const steps = combinationSteps(4, 2);
      expect(steps.length).toBeGreaterThan(0);

      // 提取找到的全部组合
      const foundSteps = steps.filter(s => s.action === 'found');
      expect(foundSteps.length).toBe(6);

      const combinations = foundSteps.map(s => s.path);
      expect(combinations).toEqual([
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
        [3, 4],
      ]);
    });

    it('2. n=3, k=3 生成唯一定解 [1, 2, 3]', () => {
      const steps = combinationSteps(3, 3);
      const foundSteps = steps.filter(s => s.action === 'found');
      expect(foundSteps.length).toBe(1);
      expect(foundSteps[0].path).toEqual([1, 2, 3]);
    });
  });

  describe('Combination Optimized (组合优化 - 剪枝决策树)', () => {
    it('3. n=4, k=2 剪枝上界验证：首层 i=4 时剩余候选不足，触发剪枝', () => {
      const root = buildOptimizedTree(4, 2);
      expect(root.children.length).toBe(4);

      // 根节点子分支 4 (i=4) 应该被标记为剪枝
      const child4 = root.children.find(c => c.value === '4');
      expect(child4).toBeDefined();
      expect(child4?.isPruned).toBe(true);

      // 剪枝后依然正确收集全部 6 个解
      const steps = buildOptimizedSteps(4, 2);
      const foundPaths = steps[steps.length - 1].foundPathIds;
      expect(foundPaths.length).toBe(6);
    });

    it('4. 验证剪枝节点被正确收集到 prunedNodeIds 中', () => {
      const steps = buildOptimizedSteps(4, 2);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.prunedNodeIds.length).toBeGreaterThan(0);
    });
  });

  describe('Combination Sum (组合总和 LeetCode 39 - 可重复选取与累加剪枝)', () => {
    it('5. candidates=[2,3,6,7], target=7 收集解 [[2,2,3], [7]]', () => {
      const steps = buildCombinationSumSteps([2, 3, 6, 7], 7);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.foundPathIds.length).toBe(2);
    });
  });

  describe('Combination Sum II (组合总和 II LeetCode 40 - 树层去重)', () => {
    it('6. candidates=[10,1,2,7,6,1,5], target=8 正确去重并收集 4 组解', () => {
      const steps = buildCombinationSum2Steps([10, 1, 2, 7, 6, 1, 5], 8);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      // 8 的解集: [1,1,6], [1,2,5], [1,7], [2,6] -> 4 组
      expect(lastStep.foundPathIds.length).toBe(4);
    });
  });
});
