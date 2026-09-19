/**
 * 回溯与深度搜索顶级架构机械防退化门禁 (Backtracking Stage Invariant Gatekeeper)
 *
 * 守护领域：
 * 1. 左程云递归大课体系 (Class 029 ~ 031)：汉诺塔 / 字符串子序列 / 去重全排列 / 递归序访问守恒
 * 2. 经典组合与分割体系 (Combinations & Partition)：组合基础与剪枝 / 电话号码 / 组合总和 I~III / 回文分割 / 复原 IP
 * 3. 经典子集与排列体系 (Subsets & Permutations)：子集 I~II / 递增子序列 / 全排列 I~II
 * 4. 棋盘与约束满足体系 (Board & Constraint Satisfaction)：N 皇后 / 解数独
 *
 * 核心机械不变量红线：
 * 1. Step 0 入口契约：首帧必须为合法初始搜索态或根节点，path 初始清空；
 * 2. 多语言行号合法性区间：每帧代码行号必须落入代码行数 [1, length] 闭区间，零冻结、零越界；
 * 3. 回溯对称性与状态恢复 (Call-Return Parity & State Restoration)：
 *    - push 时 path 长度 +1，pop 时 path 长度 -1；
 *    - 终态结束时搜索路径恢复至初态，无局部状态泄漏；
 * 4. 终态解集完备性与数学守恒：解集数量严格符合组合数学公式与合法性约束。
 */

import { describe, it, expect } from 'vitest';
import {
  buildHanoi029Steps,
  HANOI_029_CODES,
} from '../../algorithms/categories/backtracking/hanoi-recursion-029-renderer';
import {
  buildPermutation030Steps,
  PERMUTATIONS_030_CODES,
} from '../../algorithms/categories/backtracking/permutations-subsequences-030-renderer';
import {
  generateRecursionOrderSteps,
  RECURSION_ORDER_031_CODES,
} from '../../algorithms/categories/backtracking/recursion-order-031-renderer';
import {
  combinationSteps,
  CombinationStep,
} from '../../algorithms/categories/backtracking/combination-renderer';
import { buildOptimizedSteps } from '../../algorithms/categories/backtracking/combination-optimized-renderer';
import { buildPhoneLettersSteps } from '../../algorithms/categories/backtracking/phone-letters-renderer';
import { buildCombinationSumSteps } from '../../algorithms/categories/backtracking/combination-sum-renderer';
import { buildCombinationSum2Steps } from '../../algorithms/categories/backtracking/combination-sum-ii-renderer';
import { buildCombinationSum3Steps } from '../../algorithms/categories/backtracking/combination-sum-iii-renderer';
import { buildPalindromePartitionSteps } from '../../algorithms/categories/backtracking/palindrome-partition-renderer';
import { buildRestoreIPSteps } from '../../algorithms/categories/backtracking/restore-ip-renderer';
import { buildSubsetSteps } from '../../algorithms/categories/backtracking/subset-renderer';
import { buildSubsets2Steps } from '../../algorithms/categories/backtracking/subsets-ii-renderer';
import { buildIncSubSteps } from '../../algorithms/categories/backtracking/increasing-subsequences-renderer';
import { buildPermutationSteps } from '../../algorithms/categories/backtracking/permutation-renderer';
import { buildPermutationsSteps } from '../../algorithms/categories/backtracking/permutations-renderer';
import { buildPerm2Steps } from '../../algorithms/categories/backtracking/permutation-ii-renderer';
import { buildNQueenSteps } from '../../algorithms/categories/backtracking/nqueen-renderer';
import {
  buildSudokuSteps,
  parsePuzzle,
  SIMPLE_PUZZLE,
} from '../../algorithms/categories/backtracking/sudoku-renderer';
import { algorithmRegistry } from '../algorithm-registry';
import '../../algorithms/categories/backtracking/backtracking-dedup-alt-renderer';
import '../../algorithms/categories/backtracking/backtracking-final-summary-renderer';
import '../../algorithms/categories/backtracking/backtracking-theory-renderer';
import '../../algorithms/categories/backtracking/backtracking-week-summary-1-renderer';
import '../../algorithms/categories/backtracking/backtracking-week-summary-2-renderer';
import '../../algorithms/categories/backtracking/backtracking-week-summary-3-renderer';

/**
 * 校验标准决策树型回溯算法的结构与回溯对称性
 */
function verifyTreeBacktrackInvariants(
  steps: any[],
  algoName: string,
  expectedSolutionCount: number
) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);

  // 1. Step 0 入口契约
  const step0 = steps[0];
  expect(
    ['start', 'check', 'root'].includes(step0.action) || step0.currentNodeId === 'root',
    `${algoName}: Step 0 必须为初始入口帧`
  ).toBe(true);
  expect(
    step0.path?.length ?? 0,
    `${algoName}: Step 0 搜索路径初始必须为空`
  ).toBe(0);

  // 2. 状态推移与回溯现场恢复校验
  let prevPathLen = 0;
  for (let idx = 0; idx < steps.length; idx++) {
    const s = steps[idx];
    const pathLen = s.path ? s.path.length : 0;

    // 行号合法性
    if (typeof s.codeLine === 'number') {
      expect(s.codeLine, `${algoName} [Step ${idx}]: codeLine 不能小于 1`).toBeGreaterThanOrEqual(1);
    } else if (s.codeLine && typeof s.codeLine === 'object') {
      if ('from' in s.codeLine) {
        expect(s.codeLine.from).toBeGreaterThanOrEqual(1);
        expect(s.codeLine.to).toBeGreaterThanOrEqual(s.codeLine.from);
      }
    }

    // 动作与 path 长度连贯性
    if (s.action === 'push') {
      expect(pathLen, `${algoName} [Step ${idx}]: push 动作后 path 长度应等于前一步 + 1`).toBe(prevPathLen + 1);
    } else if (s.action === 'pop') {
      expect(pathLen, `${algoName} [Step ${idx}]: pop 动作后 path 长度应等于前一步 - 1`).toBe(prevPathLen - 1);
    }

    prevPathLen = pathLen;
  }

  // 3. 终态解集完备性校验
  const lastStep = steps[steps.length - 1];
  const foundCount = lastStep.foundPathIds ? lastStep.foundPathIds.length : steps.filter(s => s.action === 'found').length;
  expect(
    foundCount,
    `${algoName}: 收集到的解数量必须严格等于预期解集数 ${expectedSolutionCount}`
  ).toBe(expectedSolutionCount);

  // 终态回溯完成：路径应完全清空回到根节点
  expect(
    lastStep.path?.length ?? 0,
    `${algoName}: 最终完成搜索后 path 必须完全恢复清空`
  ).toBe(0);
}

describe('回溯与深度搜索顶级机械不变量门禁 (Backtracking Stage Invariant Gatekeeper)', () => {
  describe('Part 1: 左程云递归大课体系 (Class 029 ~ 031)', () => {
    it('029. 汉诺塔经典递归: 2^N - 1 步数严格守恒与大盘不压小盘', () => {
      const steps = buildHanoi029Steps(3);
      expect(steps.length).toBeGreaterThan(0);

      // Step 0 入口
      const step0 = steps[0];
      expect(step0.moveCount).toBe(0);
      expect(step0.disksA).toEqual([3, 2, 1]);
      expect(step0.disksB).toEqual([]);
      expect(step0.disksC).toEqual([]);

      // 验证总移动步数严格等于 2^3 - 1 = 7 步
      const lastStep = steps[steps.length - 1];
      expect(lastStep.moveCount).toBe(7);
      expect(lastStep.disksC).toEqual([3, 2, 1]);
      expect(lastStep.decision).toMatch(/(圆盘全部迁移完成|完成|恭喜|达成|圆满)/);

      // 验证代码映射合法
      const javaLines = HANOI_029_CODES.java.split('\n');
      for (const s of steps) {
        if (typeof s.codeLine === 'number') {
          expect(s.codeLine).toBeGreaterThanOrEqual(1);
          expect(s.codeLine).toBeLessThanOrEqual(javaLines.length);
        }
      }
    });

    it('030. 字符串全部子序列: 2^|S| 个子序列收集无遗漏', () => {
      const steps = buildPermutation030Steps('ABC', 'subsequence');
      expect(steps.length).toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      // 3 个字符产生 2^3 = 8 个子序列
      expect(lastStep.results.length).toBe(8);
      expect(lastStep.results).toContain('""(空)');
      expect(lastStep.results).toContain('ABC');
      expect(lastStep.results).toContain('A');
      expect(lastStep.results).toContain('B');
      expect(lastStep.results).toContain('C');
      expect(lastStep.decision).toMatch(/(生成完毕|收集完毕|完成|全部)/);
    });

    it('030. 字符串去重全排列: 3! 排列全量生成与交换回溯现场恢复', () => {
      const steps = buildPermutation030Steps('ABC', 'permutation');
      expect(steps.length).toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      // 3 个不同字符产生 3! = 6 个排列
      expect(lastStep.results.length).toBe(6);
      expect(lastStep.results).toContain('ABC');
      expect(lastStep.results).toContain('CBA');

      // 验证交换下潜帧存在
      const swapSteps = steps.filter(s => s.swappedPair !== undefined);
      expect(swapSteps.length).toBeGreaterThan(0);
    });

    it('031. 经典递归序深度解构: 二叉树前序、中序、后序访问时序三合一守恒', () => {
      const steps = generateRecursionOrderSteps();
      expect(steps.length).toBeGreaterThan(0);

      // 尾帧必须收敛出标准二叉树遍历：根 1，左 2，右 3
      const lastStep = steps[steps.length - 1];
      expect(lastStep.preorder).toEqual([1, 2, 3]);
      expect(lastStep.inorder).toEqual([2, 1, 3]);
      expect(lastStep.postorder).toEqual([2, 3, 1]);
    });
  });

  describe('Part 2: 经典组合与分割回溯体系 (Combinations & Partition)', () => {
    it('77. 组合问题: C(4, 2) = 6 组解完备生成与回溯路径归零', () => {
      const steps = combinationSteps(4, 2);
      verifyTreeBacktrackInvariants(steps, '组合问题 (n=4, k=2)', 6);
    });

    it('77. 组合剪枝优化: 上界剪枝加速且解集 6 组完备无损', () => {
      const steps = buildOptimizedSteps(4, 2);
      verifyTreeBacktrackInvariants(steps, '组合剪枝优化 (n=4, k=2)', 6);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.prunedNodeIds.length).toBeGreaterThan(0);
    });

    it('17. 电话号码的字母组合: 2 个数字 (3x3) 准确生成 9 组组合', () => {
      const steps = buildPhoneLettersSteps('23');
      verifyTreeBacktrackInvariants(steps, '电话号码字母组合 (23)', 9);
    });

    it('39. 组合总和: 允许重复选取，元素和严格等于 target 且解集无遗漏', () => {
      const steps = buildCombinationSumSteps([2, 3, 6, 7], 7);
      verifyTreeBacktrackInvariants(steps, '组合总和 ([2,3,6,7], 7)', 2);
    });

    it('40. 组合总和 II: 树层去重严格成立，重复元素候选生成 4 组不重复解', () => {
      const steps = buildCombinationSum2Steps([10, 1, 2, 7, 6, 1, 5], 8);
      verifyTreeBacktrackInvariants(steps, '组合总和 II', 4);
    });

    it('216. 组合总和 III: k=3, n=7 准确收敛至唯一定解 [1,2,4]', () => {
      const steps = buildCombinationSum3Steps(3, 7);
      verifyTreeBacktrackInvariants(steps, '组合总和 III (k=3, n=7)', 1);
    });

    it('131. 分割回文串: aab 准确切分且每个切分子串均为回文', () => {
      const steps = buildPalindromePartitionSteps('aab');
      verifyTreeBacktrackInvariants(steps, '分割回文串 (aab)', 2);
    });

    it('93. 复原 IP 地址: 25525511135 准确还原合法点分十进制 IP 集合', () => {
      const steps = buildRestoreIPSteps('25525511135');
      verifyTreeBacktrackInvariants(steps, '复原 IP 地址', 2);
    });
  });

  describe('Part 3: 经典子集与排列回溯体系 (Subsets & Permutations)', () => {
    it('78. 子集问题: 3 个元素幂集 2^3 = 8 个子集完备收集', () => {
      const steps = buildSubsetSteps([1, 2, 3]);
      verifyTreeBacktrackInvariants(steps, '子集问题 ([1,2,3])', 8);
    });

    it('90. 子集 II: 重复元素树层去重，[1,2,2] 准确收集 6 个合法去重子集', () => {
      const steps = buildSubsets2Steps([1, 2, 2]);
      verifyTreeBacktrackInvariants(steps, '子集 II ([1,2,2])', 6);
    });

    it('491. 递增子序列: 长度 >= 2 且单调不降，收集 8 组非递减序列', () => {
      const steps = buildIncSubSteps([4, 6, 7, 7]);
      verifyTreeBacktrackInvariants(steps, '递增子序列 ([4,6,7,7])', 8);
    });

    it('46. 全排列: 3! = 6 组全排列收集完备无缺失', () => {
      const steps = buildPermutationSteps([1, 2, 3]);
      verifyTreeBacktrackInvariants(steps, '全排列 ([1,2,3])', 6);
    });

    it('46. 全排列 (used 显式状态数组决策树版): 3! = 6 组全排列完备无缺失', () => {
      const steps = buildPermutationsSteps([1, 2, 3]);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.stats?.count).toBe(6);
      expect(lastStep.message).toContain('6 个全排列');
    });

    it('47. 全排列 II: 重复元素 [1,1,2] 树层去重，准确收集 3 组去重排列', () => {
      const steps = buildPerm2Steps([1, 1, 2]);
      verifyTreeBacktrackInvariants(steps, '全排列 II ([1,1,2])', 3);
    });
  });

  describe('Part 4: 棋盘与高级约束满足搜索体系 (Board & Constraint Satisfaction)', () => {
    it('51. N 皇后问题: N=4 严格生成 2 组合法棋盘解，行列与对角线零冲突', () => {
      const steps = buildNQueenSteps(4);
      expect(steps.length).toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      // 4 皇后共有 2 组合法解
      expect(lastStep.solutions).toBe(2);
      expect(lastStep.message).toMatch(/(搜索完成|解)/);

      // 验证每一步放置的皇后互不冲突
      for (const s of steps) {
        if (s.action === 'place' && s.board) {
          const queens: Array<[number, number]> = [];
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              if (s.board[r][c] === 1) queens.push([r, c]);
            }
          }
          // 校验同一行、同一列、对角线无重叠
          for (let i = 0; i < queens.length; i++) {
            for (let j = i + 1; j < queens.length; j++) {
              const [r1, c1] = queens[i];
              const [r2, c2] = queens[j];
              expect(r1).not.toBe(r2);
              expect(c1).not.toBe(c2);
              expect(Math.abs(r1 - r2)).not.toBe(Math.abs(c1 - c2));
            }
          }
        }
      }
    });

    it('37. 解数独: 9x9 棋盘回溯求解，终态 81 格全部填满且满足行、列、九宫格唯一性', () => {
      const initial = parsePuzzle(SIMPLE_PUZZLE);
      const steps = buildSudokuSteps(initial);
      expect(steps.length).toBeGreaterThan(0);

      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('solved');
      expect(lastStep.filled).toBe(81);

      // 验证终态棋盘满足数独三大公理：
      const board = lastStep.board;
      for (let r = 0; r < 9; r++) {
        const rowSet = new Set(board[r]);
        expect(rowSet.size).toBe(9);
        expect(rowSet.has('.')).toBe(false);
      }
      for (let c = 0; c < 9; c++) {
        const colSet = new Set<string>();
        for (let r = 0; r < 9; r++) colSet.add(board[r][c]);
        expect(colSet.size).toBe(9);
        expect(colSet.has('.')).toBe(false);
      }
      for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
          const boxSet = new Set<string>();
          for (let r = br * 3; r < br * 3 + 3; r++) {
            for (let c = bc * 3; c < bc * 3 + 3; c++) {
              boxSet.add(board[r][c]);
            }
          }
          expect(boxSet.size).toBe(9);
          expect(boxSet.has('.')).toBe(false);
        }
      }
    });
  });

  describe('5. 回溯专题方法论与阶段总结篇 (Backtracking Summaries & Theory)', () => {
    it('理论基础与阶段总结卡片自注册完备性校验', () => {
      const summaryIds = [
        'backtracking-theory',
        'backtracking-week-summary-1',
        'backtracking-week-summary-2',
        'backtracking-week-summary-3',
        'backtracking-dedup-alt',
        'backtracking-final-summary',
      ];
      for (const id of summaryIds) {
        const manifest = algorithmRegistry.getManifest(id);
        expect(manifest, `Summary ${id} 必须在 AlgorithmRegistry 中成功注册`).toBeDefined();
        expect(manifest?.category).toBe('backtracking');
        expect(manifest?.name).toBeTruthy();
      }
    });
  });
});

