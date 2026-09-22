import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { MinArrowsStrategy } from './min-arrows-strategy';
import { NonOverlappingStrategy } from './non-overlapping-strategy';
import { MergeIntervalsStrategy } from './merge-intervals-strategy';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

describe('区间调度与互斥消除族顶层抽象门禁测试 (Interval Scheduling Gate Test)', () => {
  it('模型仓库必须完备注册 min-arrows, non-overlapping 与 merge-intervals 顶层模型', () => {
    expect(AlgorithmModelRepository.hasModel('min-arrows')).toBe(true);
    expect(AlgorithmModelRepository.hasModel('non-overlapping')).toBe(true);
    expect(AlgorithmModelRepository.hasModel('merge-intervals')).toBe(true);
  });

  describe('LeetCode 452: 用最少数量的箭引爆气球 (min-arrows)', () => {
    const strategy = new MinArrowsStrategy();
    const model = AlgorithmModelRepository.getModel('min-arrows');

    it('策略应能接管 min-arrows', () => {
      expect(strategy.canHandle('min-arrows')).toBe(true);
    });

    it('Stage 1 正向贪心推演应正确引爆气球', () => {
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.decision).toContain('最少需要 2 支箭');
      expect(last.variables?.return).toBe(2);
    });

    it('Stage 1 逆向贪心推演应能收敛', () => {
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'reverse',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(2);
    });

    it('Stage 2 记忆化搜索树应生成有效树节点 (treeRoot)', () => {
      const steps = strategy.generateSteps(model, {
        stage: 2,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const withTree = steps.find((s) => s.treeRoot != null);
      expect(withTree).toBeDefined();
      expect(withTree?.treeRoot?.val).toContain('dfs');
    });

    it('Stage 3 区间 LIS 动态规划应生成有效 dp 状态数组', () => {
      const steps = strategy.generateSteps(model, {
        stage: 3,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.stateArrays).toBeDefined();
      expect(last.variables?.result).toBe(2);
    });

    it('Stage 4 原地空间优化应正确收敛', () => {
      const steps = strategy.generateSteps(model, {
        stage: 4,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(2);
    });
  });

  describe('LeetCode 435: 无重叠区间 (non-overlapping)', () => {
    const strategy = new NonOverlappingStrategy();
    const model = AlgorithmModelRepository.getModel('non-overlapping');

    it('策略应能接管 non-overlapping', () => {
      expect(strategy.canHandle('non-overlapping')).toBe(true);
    });

    it('Stage 1 正向贪心推演应正确计算最少移除数', () => {
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.decision).toContain('最少需要移除 1 个区间');
      expect(last.variables?.return).toBe(1);
    });

    it('Stage 1 逆向贪心推演应能收敛', () => {
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'reverse',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(1);
    });

    it('Stage 2 记忆化搜索树应生成有效树节点 (treeRoot)', () => {
      const steps = strategy.generateSteps(model, {
        stage: 2,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const withTree = steps.find((s) => s.treeRoot != null);
      expect(withTree).toBeDefined();
    });

    it('Stage 3 动态规划应生成对偶结果', () => {
      const steps = strategy.generateSteps(model, {
        stage: 3,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.stateArrays).toBeDefined();
      expect(last.variables?.result).toBe(1);
    });

    it('Stage 4 原地空间优化应正确收敛', () => {
      const steps = strategy.generateSteps(model, {
        stage: 4,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(1);
    });
  });

  describe('LeetCode 56: 合并区间 (merge-intervals)', () => {
    const strategy = new MergeIntervalsStrategy();
    const model = AlgorithmModelRepository.getModel('merge-intervals');

    it('策略应能接管 merge-intervals', () => {
      expect(strategy.canHandle('merge-intervals')).toBe(true);
    });

    it('Stage 1 正向贪心推演应正确合并区间', () => {
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.decision).toContain('最终合并为 3 个不重叠区间');
      expect(last.variables?.return).toBe(3);
      expect(last.variables?.merged).toContain('[1,6]');
      expect(last.variables?.merged).toContain('[8,10]');
      expect(last.variables?.merged).toContain('[15,18]');
    });

    it('Stage 1 逆向贪心推演应能收敛并得到相同数量的合并区间', () => {
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'reverse',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(3);
    });

    it('Stage 2 记忆化搜索树应生成有效树节点 (treeRoot)', () => {
      const steps = strategy.generateSteps(model, {
        stage: 2,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const withTree = steps.find((s) => s.treeRoot != null);
      expect(withTree).toBeDefined();
    });

    it('Stage 3 动态规划应生成有效状态数组', () => {
      const steps = strategy.generateSteps(model, {
        stage: 3,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.stateArrays).toBeDefined();
    });

    it('Stage 4 原地空间优化应正确收敛', () => {
      const steps = strategy.generateSteps(model, {
        stage: 4,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(3);
    });
  });
});
