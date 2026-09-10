import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 鹰蛋 / 鸡蛋掉落 (Super Egg Drop)
 * LeetCode 887 / 左程云算法通关课 第083讲 观察与反向定义优化 DP
 * 维度反转技巧：定义 dp[m][k] 为 m 次尝试和 k 个鸡蛋最多能够确定的最高楼层数。
 * 递推方程：dp[m][k] = dp[m-1][k-1] + dp[m-1][k] + 1，求最小的 m 使得 dp[m][k] >= n。
 */
export const SuperEggDropSpec: AlgorithmSpec = {
  id: 'super-egg-drop',
  name: '高楼扔鸡蛋 (Super Egg Drop)',
  category: '优化与观察 DP',
  description:
    '给你 k 枚相同的鸡蛋，并可以使用一栋共 n 层的楼。求在最坏情况下，为了确定临界楼层 f 所需要的最少移动尝试次数。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 887,
    leetcodeUrl: 'https://leetcode.cn/problems/super-egg-drop/',
    difficulty: 'hard',
    tags: ['数学', '二分查找', '动态规划', '状态反转优化'],
    description:
      '给你 <code>k</code> 枚相同的鸡蛋，并可以使用一栋从第 <code>1</code> 层到第 <code>n</code> 层共有 <code>n</code> 层楼的建筑。<br/><br/>已知存在楼层 <code>0 <= f <= n</code> ，任何从高于 <code>f</code> 的楼层落下的鸡蛋都会碎，从 <code>f</code> 楼层或比它低的楼层落下的鸡蛋都不会破。<br/><br/>每次操作，你可以取一枚没有碎的鸡蛋并把它从任一楼层 <code>x</code> 扔下（满足 <code>1 <= x <= n</code>）。如果鸡蛋碎了，你就不能再次使用它。如果某枚鸡蛋扔下后没有碎，则可以在之后的操作中重复使用这枚鸡蛋。<br/><br/>请你计算在<strong>最坏情况下</strong>，为了<strong>确定</strong> <code>f</code> 的值，所需的最少移动尝试次数。<br/><br/><strong>维度反转逆向思维：</strong><br/>直接求 <code>f(k, n)</code> 复杂度较高。反向思考：<strong>拥有 $k$ 个鸡蛋、允许扔 $m$ 次，最多能测多少层楼？</strong><br/>令 <code>dp[m][k]</code> 为该状态下能测的最大楼层数：<br/>• 扔在当前楼层，若碎了：消耗 1 次机会与 1 个蛋，下方可测 <code>dp[m-1][k-1]</code> 层；<br/>• 若没碎：消耗 1 次机会，上方可测 <code>dp[m-1][k]</code> 层；<br/>• 加上当前楼层本身 <code>+ 1</code>。<br/>转移方程为：<code>dp[m][k] = dp[m-1][k-1] + dp[m-1][k] + 1</code>。只需不断累加步数 $m$，直到 <code>dp[m][k] >= n</code> 即可！',
    examples: [
      {
        input: 'k = 1, n = 2',
        output: '2',
        explanation: '只有 1 个蛋，只能从 1 楼逐层向上试，最坏扔 2 次。',
      },
      {
        input: 'k = 2, n = 6',
        output: '3',
        explanation: '第 1 次扔在 3 楼，若碎则试 1、2 楼；若没碎则第 2 次扔在 5 楼。最坏 3 次。',
      },
      {
        input: 'k = 3, n = 14',
        output: '4',
        explanation: '最坏情况下仅需 4 次移动。',
      },
    ],
    constraints: [
      '1 <= k <= 100',
      '1 <= n <= 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: 4, cpp: 5, python: 4, javascript: 3 },
    loopCheck: { java: 6, cpp: 7, python: 6, javascript: 5 },
    stateTransfer: {
      java: [7, 8, 9],
      cpp: [8, 9, 10],
      python: [7, 8],
      javascript: [6, 7, 8],
    },
    loopExit: { java: 11, cpp: 12, python: 9, javascript: 10 },
    returnResult: { java: 12, cpp: 13, python: 10, javascript: 11 },
  },
  code: {
    languages: {
      javascript: [
        'function superEggDrop(k, n) {',
        '  if (k === 1) return n;',
        '  const dp = new Array(k + 1).fill(0);',
        '  let m = 0;',
        '  while (dp[k] < n) {',
        '    m++;',
        '    for (let j = k; j >= 1; j--) {',
        '      dp[j] = dp[j] + dp[j - 1] + 1;',
        '    }',
        '  }',
        '  return m;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int superEggDrop(int k, int n) {',
        '        if (k == 1) return n;',
        '        int[] dp = new int[k + 1];',
        '        int m = 0;',
        '        while (dp[k] < n) {',
        '            m++;',
        '            for (int j = k; j >= 1; j--) {',
        '                dp[j] = dp[j] + dp[j - 1] + 1;',
        '            }',
        '        }',
        '        return m;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int superEggDrop(int k, int n) {',
        '        if (k == 1) return n;',
        '        vector<int> dp(k + 1, 0);',
        '        int m = 0;',
        '        while (dp[k] < n) {',
        '            m++;',
        '            for (int j = k; j >= 1; j--) {',
        '                dp[j] = dp[j] + dp[j - 1] + 1;',
        '            }',
        '        }',
        '        return m;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def superEggDrop(self, k: int, n: int) -> int:',
        '        if k == 1:',
        '            return n',
        '        dp = [0] * (k + 1)',
        '        m = 0',
        '        while dp[k] < n:',
        '            m += 1',
        '            for j in range(k, 0, -1):',
        '                dp[j] = dp[j] + dp[j - 1] + 1',
        '        return m',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入鸡蛋数 k 与目标总楼层 n。',
        2: '只有一个鸡蛋时无法承受破碎风险，只能从 1 楼线性测到 n 楼，必需要 n 次。',
        3: 'dp[j] 压缩记录当前移动步数下，持有 j 个鸡蛋最多能确定的楼层数。',
        4: 'm 记录当前尝试次数。',
        5: '当 k 个鸡蛋在 m 步下能测试的最大楼层数仍小于 n 时，继续增加步数 m。',
        7: '逆序更新 01 背包式压缩转移：dp[j] = dp[j] (没碎) + dp[j-1] (碎了) + 1 (当前层)。',
        11: '返回最少需要的移动步数 m。',
      },
      java: {
        2: '方法入口。',
        3: '单蛋边界处理。',
        4: '空间压缩一维数组。',
        7: '步数循环累加。',
        9: '逆序更新各蛋数上限。',
        12: '返回所需最少步数 m。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 向量。',
        7: '步数递增推进。',
        9: '维度反转状态转移。',
        13: '返回步数 m。',
      },
      python: {
        2: '方法入口。',
        5: '一维压缩状态列表。',
        7: 'while 推进尝试次数。',
        9: '逆序更新。',
        11: '返回 m。',
      },
    },
    keyPoints: {
      thinking:
        '维度反转的威力：直接求最低次数面临决策单调性与二分优化，逻辑繁琐；而将自变量与因变量互换（询问 m 次操作 k 个蛋最多测几层）后，状态转移方程极其优雅且线性可解，单调递增的 dp[m][k] 使得步数 $m \\le n$ 极速收敛。',
      state: 'dp[j] 表示当前 m 次移动下，持有 j 个蛋最多能检测的楼层跨度。',
      equation: 'dp[j] = dp[j] + dp[j-1] + 1',
      initAndBounds: 'dp 数组初始全为 0。当 dp[k] >= n 时停止。',
      complexity: '时间复杂度 $O(k \\cdot m)$ 其中 $m \\le O(k \\log n)$，空间复杂度仅 $O(k)$。',
    },
    faqList: [
      {
        tag: '为什么当前层要 +1',
        question: '转移方程中的 +1 代表什么含义？',
        answer:
          'dp[m-1][k-1] 是鸡蛋在当前楼层摔碎后，利用剩下 k-1 个蛋在 m-1 步内能在下方完全判定的楼层数；dp[m-1][k] 是鸡蛋没碎在上方能判定的楼层数。而当前扔鸡蛋的这个特定楼层本身也被验证了，因此必须 +1。',
      },
    ],
  },
  generateSteps: (input: { k?: number; n?: number } = {}): DpTraceStep[] => {
    const k = input?.k ?? 2;
    const n = input?.n ?? 6;
    const steps: DpTraceStep[] = [];

    if (k === 1) {
      steps.push(
        makeTraceStep({
          message: `🥚 仅有 1 个鸡蛋，无法承担任何破碎风险，只能从 1 楼逐层向上试探。最坏需要尝试 <strong>${n}</strong> 次。`,
          metrics: { minMoves: n },
        })
      );
      return steps;
    }

    const dp = new Array(k + 1).fill(0);
    let m = 0;

    steps.push(
      makeTraceStep({
        dp1d: dp.slice(1).map((v, i) => ({ value: v, label: `${i + 1}个蛋`, state: 'default' })),
        message: `🥚 拥有 ${k} 个鸡蛋，待测楼层 n = ${n}。启动维度反转 DP：探究在 m 步内持有 j 个鸡蛋最多能覆盖多少楼层。`,
        log: `初始化: k=${k}, n=${n}`,
        vars: [
          { name: '鸡蛋数 k', value: String(k) },
          { name: '总楼层 n', value: String(n) },
          { name: '当前步数 m', value: '0' },
        ],
        metrics: { minMoves: 0 },
      })
    );

    while (dp[k] < n) {
      m++;
      for (let j = k; j >= 1; j--) {
        dp[j] = dp[j] + dp[j - 1] + 1;
      }

      steps.push(
        makeTraceStep({
          dp1d: dp.slice(1).map((v, i) => ({
            value: v,
            label: `${i + 1}个蛋`,
            state: i + 1 === k ? 'active' : 'computed',
          })),
          message: `🚶 允许移动 <strong>m = ${m}</strong> 次：持有 ${k} 个鸡蛋最多可覆盖 <strong>${dp[k]}</strong> 层楼（${dp[k] >= n ? `已达到/超过目标 ${n} 层 ✓` : `仍不足目标 ${n} 层，继续增加步数`})。`,
          log: `m=${m}: dp = [${dp.slice(1).join(', ')}] -> dp[${k}]=${dp[k]}`,
          formula: 'dp[j] = dp[j] + dp[j - 1] + 1',
          vars: [
            { name: '尝试步数 m', value: String(m) },
            { name: `持有 ${k} 蛋最大覆盖楼层`, value: String(dp[k]) },
            { name: '是否达到目标 n', value: dp[k] >= n ? '是' : '否' },
          ],
          metrics: { minMoves: m },
        })
      );
    }

    steps.push(
      makeTraceStep({
        dp1d: dp.slice(1).map((v, i) => ({ value: v, label: `${i + 1}个蛋`, state: 'computed' })),
        message: `🏆 确定临界楼层所需的最少移动尝试次数为 <strong>${m}</strong> 次（在 ${m} 步下 ${k} 个蛋最多可测 ${dp[k]} 层楼，足以完全覆盖 ${n} 层）。`,
        log: `计算结束：最少步数 = ${m}`,
        vars: [
          { name: '最少移动次数', value: String(m) },
        ],
        metrics: { minMoves: m },
      })
    );

    return steps;
  },
};
