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

    it('Stage 2 递归记忆化搜索必须具备真实递归树、2D 备忘录网格与充分步进密度 (禁止伪实现)', () => {
      const steps = strategy.generateSteps(model, {
        stage: 2,
        direction: 'forward',
      });
      // 严禁 4 步糊弄：真实 DFS 必须包含深入、分支探查、剪枝与回溯落盘，步数必须 >= 12
      expect(steps.length, 'Stage 2 步数必须 >= 12 步，严禁几步假装实现').toBeGreaterThanOrEqual(12);

      // Card 1: 必须携带完整 (m+1)x(n+1) 的二维备忘录 Grid
      const firstStep = steps[0];
      expect(firstStep.grid, 'Stage 2 必须提供二维备忘录 Grid 对象').toBeDefined();
      expect(firstStep.grid?.length).toBe(4); // m + 1 = 4
      expect(firstStep.grid?.[0]?.length).toBe(4); // n + 1 = 4

      // Card 2: 必须具备真实状态依赖树，且节点数 >= 6
      const lastStep = steps[steps.length - 1];
      expect(lastStep.treeRoot, 'Stage 2 最终步必须包含完备依赖树').toBeDefined();

      const countTreeNodes = (node?: any): number => {
        if (!node) return 0;
        let count = 1;
        if (node.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            count += countTreeNodes(child);
          }
        }
        return count;
      };
      const totalNodes = countTreeNodes(lastStep.treeRoot);
      expect(totalNodes, 'Stage 2 递归状态依赖树节点数必须 >= 6').toBeGreaterThanOrEqual(6);

      // 必须存在备忘录写入落盘与小人坐标动态走动
      const nonZeroCoords = steps.filter((s) => (s.currentI ?? 0) > 0 || (s.currentJ ?? 0) > 0);
      expect(nonZeroCoords.length, '小人必须在 2D 备忘录网格中真实移动探测').toBeGreaterThan(0);

      // 验证存在剪枝或者多分支回溯步骤
      const hasBacktrackingOrPruning = steps.some(
        (s) => s.decision?.includes('剪枝') || s.decision?.includes('回溯落盘')
      );
      expect(hasBacktrackingOrPruning, 'Stage 2 必须展现备忘录剪枝或回溯落盘').toBe(true);
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

    it('Stage 4 空间压缩与单趟双指针必须声明 stage: 4 且具备充分步进密度', () => {
      const steps = strategy.generateSteps(model, {
        stage: 4,
        direction: 'forward',
      });
      expect(steps.length, 'Stage 4 步数必须 >= 6 步').toBeGreaterThanOrEqual(6);
      expect(steps.every((s) => s.stage === 4), '所有步骤必须属于 Stage 4').toBe(true);

      const last = steps[steps.length - 1];
      expect(last.variables?.return).toBe(3);
      expect(last.metrics?.['space']).toBe('O(1)');
    });

    it('所有阶段 (Stage 1-4) 的每一个步骤必须 100% 具备有效代码行号 (typeof step.line === "number" && step.line >= 1)，彻底杜绝代码联动高亮失效', () => {
      for (const stage of [1, 2, 3, 4]) {
        for (const direction of ['forward', 'reverse'] as const) {
          const steps = strategy.generateSteps(model, { stage, direction });
          expect(steps.length, `Stage ${stage} ${direction} 必须有步骤`).toBeGreaterThan(0);
          
          steps.forEach((step, idx) => {
            expect(
              typeof step.line === 'number' && step.line >= 1,
              `Stage ${stage} ${direction} 第 ${idx} 步 [${step.decision || step.message}] 的 step.line 必须为有效正整数，当前值为: ${step.line}`
            ).toBe(true);
          });
        }
      }
    });
  });
});
