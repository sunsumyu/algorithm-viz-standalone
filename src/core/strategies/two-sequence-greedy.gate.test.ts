import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from '../model-repository';
import { AssignCookiesStrategy } from './assign-cookies-strategy';

describe('双序列单调贪心匹配族顶层抽象门禁测试 (Two-Sequence Greedy Gate Test)', () => {
  it('模型仓库必须完备注册 assign-cookies 顶层模型', () => {
    expect(AlgorithmModelRepository.hasModel('assign-cookies')).toBe(true);
    const model = AlgorithmModelRepository.getModel('assign-cookies');
    expect(model.id).toBe('assign-cookies');
    expect(model.category).toBe('greedy');
  });

  describe('LeetCode 455: 分发饼干 (assign-cookies)', () => {
    const strategy = new AssignCookiesStrategy();
    const model = AlgorithmModelRepository.getModel('assign-cookies');

    it('策略应能准确接管 assign-cookies', () => {
      expect(strategy.canHandle('assign-cookies')).toBe(true);
    });

    it('Stage 1 正向推演 (小胃口小饼干优先) 应准确计算满足孩子数', () => {
      // 默认入参: g=[1, 2, 3], s=[1, 2, 4] => 能满足 3 个孩子
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(3);

      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(3);
      expect(last.stateArrays?.find((a) => a.id === 'g')).toBeDefined();
      expect(last.stateArrays?.find((a) => a.id === 's')).toBeDefined();
    });

    it('Stage 1 逆向推演 (大胃口大饼干优先) 应准确收敛且与正向结果一致', () => {
      const steps = strategy.generateSteps(model, {
        stage: 1,
        direction: 'reverse',
      });
      expect(steps.length).toBeGreaterThan(3);

      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(3);
    });

    it('Stage 2 递归记忆化搜索应具备状态依赖树', () => {
      const steps = strategy.generateSteps(model, {
        stage: 2,
        direction: 'forward',
      });
      expect(steps.length).toBeGreaterThan(0);
      const rootStep = steps[0];
      expect(rootStep.treeRoot).toBeDefined();
      expect(rootStep.treeRoot?.val).toContain('dfs');
    });

    it('Stage 3 双序列 DP 状态矩阵必须输出 2D Grid、具备单元格双微步与依赖高亮', () => {
      const steps = strategy.generateSteps(model, {
        stage: 3,
        direction: 'forward',
      });
      // 3x3 矩阵，每个单元格必须有探查 (Probe) 与落盘 (Commit) 2 个微步，总步数应大于 20 步
      expect(steps.length).toBeGreaterThanOrEqual(20);

      const first = steps[0];
      expect(first.grid).toBeDefined();
      expect(first.grid?.length).toBe(4); // m + 1 = 4
      expect(first.grid?.[0]?.length).toBe(4); // n + 1 = 4

      // 必须包含携带 deps (包含上方/左方/左上) 的探查微步
      const probeStep = steps.find((s) => s.deps && s.deps.length >= 2);
      expect(probeStep, '必须存在明确声明上方与左方状态依赖源的探查微步').toBeDefined();

      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(3);
      expect(last.grid).toBeDefined();

      // 数学不变量硬断言：最终 DP 矩阵必须满足非递减单调性
      const finalGrid = last.grid!;
      for (let i = 1; i <= 3; i++) {
        for (let j = 1; j <= 3; j++) {
          const val = finalGrid[i][j] as number;
          const top = finalGrid[i - 1][j] as number;
          const left = finalGrid[i][j - 1] as number;
          expect(val).toBeGreaterThanOrEqual(top);
          expect(val).toBeGreaterThanOrEqual(left);
        }
      }
    });
  });
});
