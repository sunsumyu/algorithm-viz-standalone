import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { CandyStrategy } from './candy-strategy';
import { TwoPassNeighborStepCompiler } from './two-pass-neighbor-step-compiler';

describe('双向前后缀分解与邻域扫描族顶层抽象门禁测试 (Two-Pass Neighbor Gate Test)', () => {
  it('模型仓库必须完备注册 candy 顶层模型', () => {
    expect(AlgorithmModelRepository.hasModel('candy')).toBe(true);
    const model = AlgorithmModelRepository.getModel('candy');
    expect(model.id).toBe('candy');
    expect(model.category).toBe('greedy');
  });

  describe('LeetCode 135: 分发糖果 (candy)', () => {
    const strategy = new CandyStrategy();
    const model = AlgorithmModelRepository.getModel('candy');

    it('策略应能接管 candy', () => {
      expect(strategy.canHandle('candy')).toBe(true);
    });

    it('Stage 1 双向贪心正向推演 (左->右 后接 右->左) 应正确计算最少糖果', () => {
      // 默认入参: [1, 2, 87, 87, 87, 2, 1]
      // left:  [1, 2, 3, 1, 1, 1, 1]
      // right: [1, 1, 1, 1, 3, 2, 1]
      // fusion (max): [1, 2, 3, 1, 3, 2, 1] => sum = 13
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.decision).toContain('最少需要准备 13 颗糖果');
      expect(last.variables?.return).toBe(13);
      expect(last.stateArrays?.find((a) => a.id === 'left')).toBeDefined();
      expect(last.stateArrays?.find((a) => a.id === 'right')).toBeDefined();
      expect(last.stateArrays?.find((a) => a.id === 'candies')).toBeDefined();
    });

    it('Stage 1 自定义入参 ratings = [1, 0, 2] 应得出 5 颗糖果', () => {
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'forward',
        customInputs: {
          ratings: [1, 0, 2],
        },
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(5);
    });

    it('Stage 1 逆向推演 (先从右往左，再从左往右) 结果应完全等价', () => {
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'reverse',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(13);
    });

    it('Stage 2 记忆化搜索与 DAG 依赖树应生成有效树节点 (treeRoot)', () => {
      const steps = strategy.generateSteps(model, {
        stage: 2,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const withBranches = steps.find((s) => (s.treeRoot?.children?.length ?? 0) > 0);
      expect(withBranches).toBeDefined();
      expect(withBranches?.treeRoot?.children[0]?.val).toContain('dfs');
      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(13);
    });

    it('Stage 3 拓扑序状态转移 DP 应生成有效 dp 状态数组', () => {
      const steps = strategy.generateSteps(model, {
        stage: 3,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.stateArrays?.find((a) => a.id === 'dp')).toBeDefined();
      expect(last.variables?.return).toBe(13);
    });

    it('Stage 4 单趟峰谷 O(1) 空间常数优化贪心推演应收敛', () => {
      const steps = strategy.generateSteps(model, {
        stage: 4,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(13);
      expect(last.variables?.spaceComplexity).toBe('O(1)');
    });
  });
});
