/**
 * Class 055: 单调队列·下 自动化测试套件
 * 覆盖 Code01, Code02, Code03 的 Step 生成器、算法正确性、1-based 代码行号与 DOM 契约
 */

import { describe, it, expect } from 'vitest';
import { buildShortestSubarraySteps } from './shortest-subarray-sum-k-055-renderer';
import { buildMaxValueOfEquationSteps } from './max-value-of-equation-055-renderer';
import { buildMaxTasksAssignSteps } from './max-tasks-assign-055-renderer';
import {
  renderShortestSubarrayBoard,
  renderMaxValueOfEquationBoard,
  renderMaxTasksAssignBoard,
} from './queue-055-shared';
import {
  CODE01_SHORTEST_SUBARRAY_CODES,
  CODE02_MAX_EQUATION_CODES,
  CODE03_TASKS_ASSIGN_CODES,
} from './queue-055-stage-codes';

function verifyLineBounds(steps: any[], codes: Record<string, string[]>, desc: string) {
  for (const step of steps) {
    if (!step.codeLine) continue;
    for (const [lang, line] of Object.entries(step.codeLine)) {
      if (typeof line !== 'number') continue;
      const codeList = codes[lang];
      expect(codeList, `${desc} 缺少语言 ${lang}`).toBeDefined();
      expect(line, `${desc} ${lang} 行号 ${line} 必须 >= 1`).toBeGreaterThanOrEqual(1);
      expect(line, `${desc} ${lang} 行号 ${line} 超出源码总行数 ${codeList.length}`).toBeLessThanOrEqual(codeList.length);
    }
  }
}

describe('Class 055: 单调队列·下 核心算法套件', () => {
  describe('Code01: 和至少为 K 的最短子数组 (LeetCode 862)', () => {
    it('标准用例 [2, -1, 2, 1], K=3 得到最短长度 2', () => {
      const steps = buildShortestSubarraySteps([2, -1, 2, 1], 3);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.bestLen).toBe(2);
      verifyLineBounds(steps, CODE01_SHORTEST_SUBARRAY_CODES, 'Code01');
    });

    it('单元素用例 [1], K=1 得到最短长度 1', () => {
      const steps = buildShortestSubarraySteps([1], 1);
      const last = steps[steps.length - 1];
      expect(last.bestLen).toBe(1);
    });

    it('含较大负数用例 [84, -37, 32, 40, 95], K=167 得到最短长度 3', () => {
      const steps = buildShortestSubarraySteps([84, -37, 32, 40, 95], 167);
      const last = steps[steps.length - 1];
      expect(last.bestLen).toBe(3);
    });

    it('无解用例 [1, 2], K=4 得到 -1', () => {
      const steps = buildShortestSubarraySteps([1, 2], 4);
      const last = steps[steps.length - 1];
      expect(last.bestLen).toBe(-1);
    });

    it('沙盘渲染契约: 零 h1~h6, 零 [object Object]', () => {
      const steps = buildShortestSubarraySteps();
      const html = renderShortestSubarrayBoard(steps[2]);
      expect(html).not.toMatch(/<h[1-6]/i);
      expect(html).not.toContain('[object Object]');
      expect(html).toContain('单调递增前缀和队列');
    });
  });

  describe('Code02: 满足不等式的最大值 (LeetCode 1499)', () => {
    it('标准用例 [(1,3), (2,0), (5,10), (6,-10)], K=1 得到 4', () => {
      const pts: Array<[number, number]> = [
        [1, 3],
        [2, 0],
        [5, 10],
        [6, -10],
      ];
      const steps = buildMaxValueOfEquationSteps(pts, 1);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.curBestAns).toBe(4);
      verifyLineBounds(steps, CODE02_MAX_EQUATION_CODES, 'Code02');
    });

    it('用例 [(0,0), (3,0), (9,2)], K=3 得到 3', () => {
      const pts: Array<[number, number]> = [
        [0, 0],
        [3, 0],
        [9, 2],
      ];
      const steps = buildMaxValueOfEquationSteps(pts, 3);
      const last = steps[steps.length - 1];
      expect(last.curBestAns).toBe(3);
    });

    it('沙盘渲染契约: 零 h1~h6, 零 [object Object]', () => {
      const steps = buildMaxValueOfEquationSteps();
      const html = renderMaxValueOfEquationBoard(steps[1]);
      expect(html).not.toMatch(/<h[1-6]/i);
      expect(html).not.toContain('[object Object]');
      expect(html).toContain('单调递减队列');
    });
  });

  describe('Code03: 你可以安排的最多任务数目 (LeetCode 2071)', () => {
    it('标准用例 tasks=[3,2,1], workers=[0,3,3], pills=1, s=1 得到 3', () => {
      const steps = buildMaxTasksAssignSteps([3, 2, 1], [0, 3, 3], 1, 1);
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.midM).toBe(3);
      verifyLineBounds(steps, CODE03_TASKS_ASSIGN_CODES, 'Code03');
    });

    it('服药方可完成用例 tasks=[5,4], workers=[0,0,0], pills=1, s=5 得到 1', () => {
      const steps = buildMaxTasksAssignSteps([5, 4], [0, 0, 0], 1, 5);
      const last = steps[steps.length - 1];
      expect(last.midM).toBe(1);
    });

    it('无需药丸全解用例 tasks=[2,3,4], workers=[2,3,5], pills=0, s=2 得到 3', () => {
      const steps = buildMaxTasksAssignSteps([2, 3, 4], [2, 3, 5], 0, 2);
      const last = steps[steps.length - 1];
      expect(last.midM).toBe(3);
    });

    it('沙盘渲染契约: 零 h1~h6, 零 [object Object]', () => {
      const steps = buildMaxTasksAssignSteps();
      const html = renderMaxTasksAssignBoard(steps[1]);
      expect(html).not.toMatch(/<h[1-6]/i);
      expect(html).not.toContain('[object Object]');
      expect(html).toContain('二分探测中点');
    });
  });

  describe('注册中心与别名统合门禁 (Class 055)', () => {
    it('全量算法与别名必须在 algorithmRegistry 中正确解析', async () => {
      const { algorithmRegistry } = await import('../../../../core/algorithm-registry');
      await import('../../../batch-39-index');

      const expectedMappings = [
        {
          id: 'shortest-subarray-sum-k-055',
          aliases: [
            'class055-code01',
            'shortest-subarray-sum-k',
            'shortest-subarray-862',
            'leetcode-862',
          ],
        },
        {
          id: 'max-value-of-equation-055',
          aliases: [
            'class055-code02',
            'max-value-of-equation',
            'max-value-of-equation-1499',
            'leetcode-1499',
          ],
        },
        {
          id: 'max-tasks-assign-055',
          aliases: [
            'class055-code03',
            'max-tasks-assign',
            'max-task-assign',
            'leetcode-2071',
          ],
        },
      ];

      for (const item of expectedMappings) {
        const manifest = algorithmRegistry.getManifest(item.id);
        expect(manifest, `Algorithm with id ${item.id} must be registered`).toBeDefined();
        for (const alias of item.aliases) {
          expect(manifest?.aliases).toContain(alias);
          const resolvedByAlias = algorithmRegistry.getManifest(alias);
          expect(resolvedByAlias?.id, `Alias ${alias} should resolve to ${item.id}`).toBe(item.id);
        }
      }
    });
  });
});
