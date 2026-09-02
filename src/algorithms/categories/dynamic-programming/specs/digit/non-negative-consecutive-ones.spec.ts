import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 不含连续1的非负整数 (Non-negative Integers without Consecutive Ones)
 * LeetCode 600 / 左程云算法通关课 第085讲 数位DP
 * 斐波那契数位DP：长度为 k 的无连续 1 二进制串数量满足斐波那契数列 dp[k] = dp[k-1] + dp[k-2]。
 */
export const NonNegativeConsecutiveOnesSpec: AlgorithmSpec = {
  id: 'non-negative-consecutive-ones',
  name: '不含连续1的非负整数 (Non-negative Integers without Consecutive Ones)',
  category: '数位 DP',
  description:
    '给定一个正整数 n，统计在范围 [0, n] 内的所有整数中，其二进制表示中不包含任何连续的 1 的整数个数。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 600,
    leetcodeUrl: 'https://leetcode.cn/problems/non-negative-integers-without-consecutive-ones/',
    difficulty: 'hard',
    tags: ['动态规划', '数位DP', '位运算'],
    description:
      '给定一个正整数 <code>n</code>，请你统计在 <code>[0, n]</code> 范围的整数中，其二进制表示中不包含<strong>任何连续的 1</strong> 的整数个数。<br/><br/><strong>斐波那契数位DP：</strong><br/>1. 预处理 <code>dp[i]</code>：长度为 <code>i</code> 的二进制串且不含连续 1 的合法个数，满足 <code>dp[0] = 1, dp[1] = 2, dp[i] = dp[i-1] + dp[i-2]</code>。<br/>2. 从高位向低位扫描 <code>n</code> 的每一位：若当前位为 1，假设当前位填 0，则低位可任意合法填写，贡献 <code>dp[i]</code>；若前一位也是 1，则触发连续 1 无法继续向后探索，直接退出；若扫描至最低位仍未发生冲突，则包含 <code>n</code> 本身 (+1)。',
    examples: [
      {
        input: 'n = 5',
        output: '5',
        explanation: '0(000), 1(001), 2(010), 4(100), 5(101) 的二进制均不含连续 1。3(011) 包含连续 1 排除。共 5 个。',
      },
      {
        input: 'n = 1',
        output: '2',
        explanation: '0 和 1 均合法，共 2 个。',
      },
      {
        input: 'n = 2',
        output: '3',
        explanation: '0, 1, 2 均合法，共 3 个。',
      },
    ],
    constraints: [
      '1 <= n <= 10^9',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: 5, cpp: 6, python: 4, javascript: 3 },
    loopCheck: { java: 9, cpp: 10, python: 8, javascript: 7 },
    stateTransfer: {
      java: [11, 12, 13, 14, 15, 16],
      cpp: [12, 13, 14, 15, 16, 17],
      python: [10, 11, 12, 13, 14, 15],
      javascript: [9, 10, 11, 12, 13, 14],
    },
    loopExit: { java: 19, cpp: 20, python: 18, javascript: 17 },
    returnResult: { java: 21, cpp: 22, python: 19, javascript: 19 },
  },
  code: {
    languages: {
      javascript: [
        'function findIntegers(n) {',
        '  const dp = new Array(32).fill(0);',
        '  dp[0] = 1;',
        '  dp[1] = 2;',
        '  for (let i = 2; i < 32; i++) {',
        '    dp[i] = dp[i - 1] + dp[i - 2];',
        '  }',
        '  let ans = 0, prev = 0;',
        '  for (let i = 30; i >= 0; i--) {',
        '    if ((n & (1 << i)) !== 0) {',
        '      ans += dp[i];',
        '      if (prev === 1) return ans;',
        '      prev = 1;',
        '    } else {',
        '      prev = 0;',
        '    }',
        '  }',
        '  return ans + 1;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int findIntegers(int n) {',
        '        int[] dp = new int[32];',
        '        dp[0] = 1;',
        '        dp[1] = 2;',
        '        for (int i = 2; i < 32; i++) {',
        '            dp[i] = dp[i - 1] + dp[i - 2];',
        '        }',
        '        int ans = 0, prev = 0;',
        '        for (int i = 30; i >= 0; i--) {',
        '            if ((n & (1 << i)) != 0) {',
        '                ans += dp[i];',
        '                if (prev == 1) return ans;',
        '                prev = 1;',
        '            } else {',
        '                prev = 0;',
        '            }',
        '        }',
        '        return ans + 1;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int findIntegers(int n) {',
        '        vector<int> dp(32, 0);',
        '        dp[0] = 1;',
        '        dp[1] = 2;',
        '        for (int i = 2; i < 32; i++) {',
        '            dp[i] = dp[i - 1] + dp[i - 2];',
        '        }',
        '        int ans = 0, prev = 0;',
        '        for (int i = 30; i >= 0; i--) {',
        '            if ((n & (1 << i)) != 0) {',
        '                ans += dp[i];',
        '                if (prev == 1) return ans;',
        '                prev = 1;',
        '            } else {',
        '                prev = 0;',
        '            }',
        '        }',
        '        return ans + 1;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def findIntegers(self, n: int) -> int:',
        '        dp = [0] * 32',
        '        dp[0], dp[1] = 1, 2',
        '        for i in range(2, 32):',
        '            dp[i] = dp[i - 1] + dp[i - 2]',
        '        ans, prev = 0, 0',
        '        for i in range(30, -1, -1):',
        '            if (n & (1 << i)) != 0:',
        '                ans += dp[i]',
        '                if prev == 1:',
        '                    return ans',
        '                prev = 1',
        '            else:',
        '                prev = 0',
        '        return ans + 1',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入上界整数 n。',
        2: 'dp[i] 表示长度为 i 的二进制位中，不含连续 1 的合法组合总数。',
        3: 'dp[0]=1（空串算1种），dp[1]=2（0和1共2种）。',
        6: '斐波那契状态转移：最高位为0有dp[i-1]种，最高位为1则次高位必为0有dp[i-2]种。',
        9: '从高位到低位扫描 n 的二进制每一位（最高30位）。',
        11: '若当前位为 1，假设当前位填 0，则更低 i 位可任意合法分配，累加 dp[i]。',
        12: '若前一位也是 1，说明已出现连续 1，无法继续沿着 n 的前缀向下匹配，提前结束。',
        18: '扫描完整且自身无连续 1，计入 n 本身 (+1) 返回。',
      },
      java: {
        2: '方法入口。',
        4: '预处理斐波那契数组。',
        10: '高位向低位位运算扫描。',
        12: '当前位填 0 产生的合法分支数累加。',
        13: '前缀出现连续 1 提前剪枝。',
        18: '包含 n 本身返回。',
      },
      cpp: {
        3: '函数入口。',
        5: '预处理合法串数 dp 数组。',
        11: '逆序按位判定。',
        13: '前缀冲突检测。',
        19: '返回结果。',
      },
      python: {
        2: '方法入口。',
        4: '初始化斐波那契序列。',
        9: '高位向下遍历。',
        12: '连续 1 剪枝退出。',
        16: '返回 ans + 1。',
      },
    },
    keyPoints: {
      thinking:
        '数位DP与斐波那契数列：任何长度为 k 的合法二进制串，若首位填 0 则后 k-1 位合法（dp[k-1] 种）；若首位填 1 则次位必须填 0，后 k-2 位合法（dp[k-2] 种）。因此 dp[k] = dp[k-1] + dp[k-2]。扫描 n 时利用类似前缀树的思想快速计数。',
      state: 'dp[i] 为长度为 i 的任意合法无连续 1 的二进制串数量。',
      equation: 'dp[i] = dp[i-1] + dp[i-2]',
      initAndBounds: 'dp[0] = 1, dp[1] = 2。位宽最高 30 位（10^9 < 2^30）。',
      complexity: '时间复杂度 $O(\\log_2 n)$，空间复杂度 $O(1)$。',
    },
    faqList: [
      {
        tag: '为什么 ans 最终要 +1',
        question: '为什么扫描结束且未触发 prev==1 时要返回 ans + 1？',
        answer:
          '在从高位到低位的扫描过程中，每次遇到 1 都只统计了“当前位填 0”的分支（即严格小于 n 当前位对应前缀的合法数字）。如果整个扫描过程顺利走到最低位而没有出现连续的 1，说明数字 n 本身也是一个合法的无连续 1 数字，因此必须 +1 计入 n 本身。',
      },
    ],
  },
  generateSteps: (input: { n?: number } = {}): DpTraceStep[] => {
    const n = input?.n ?? 5;
    const steps: DpTraceStep[] = [];

    const dp = new Array(32).fill(0);
    dp[0] = 1;
    dp[1] = 2;
    for (let i = 2; i < 32; i++) {
      dp[i] = dp[i - 1] + dp[i - 2];
    }

    const nBin = n.toString(2);
    const highestBit = nBin.length - 1;

    steps.push(
      makeTraceStep({
        dp1d: dp.slice(0, highestBit + 2).map((v, i) => ({ value: v, label: `dp[${i}]`, state: 'computed' })),
        message: `🔢 输入 n = ${n} (二进制为 <code>${nBin}</code>，最高位为第 ${highestBit} 位)。斐波那契数位基准表 dp[0..${highestBit + 1}] 初始化完成。`,
        log: `初始化: n=${n} (0b${nBin}), 最高位=${highestBit}`,
        vars: [
          { name: 'n (十进制)', value: String(n) },
          { name: 'n (二进制)', value: nBin },
          { name: '最高位索引', value: String(highestBit) },
        ],
        metrics: { validCount: 0 },
      })
    );

    let ans = 0;
    let prev = 0;
    let earlyExit = false;

    for (let i = highestBit; i >= 0; i--) {
      const bit = (n & (1 << i)) !== 0 ? 1 : 0;
      if (bit === 1) {
        ans += dp[i];
        if (prev === 1) {
          steps.push(
            makeTraceStep({
              dp1d: dp.slice(0, highestBit + 2).map((v, idx) => ({
                value: v,
                label: `dp[${idx}]`,
                state: idx === i ? 'active' : 'computed',
              })),
              message: `⚠️ 扫描至第 ${i} 位（bit=1）：检测到前一位也为 1（出现连续 1 模式 <code>11...</code>）。后续分支必然违反规则，停止向下探索，当前累计答案为 <strong>${ans}</strong>。`,
              log: `bit index=${i}: 出现连续1剪枝 -> ans=${ans}`,
              vars: [
                { name: '当前位索引', value: String(i) },
                { name: '当前位数值', value: '1' },
                { name: '触发剪枝', value: '是 (连续1)' },
                { name: '累计合法数', value: String(ans) },
              ],
              metrics: { validCount: ans },
            })
          );
          earlyExit = true;
          break;
        }
        prev = 1;

        steps.push(
          makeTraceStep({
            dp1d: dp.slice(0, highestBit + 2).map((v, idx) => ({
              value: v,
              label: `dp[${idx}]`,
              state: idx === i ? 'active' : 'computed',
            })),
            message: `🔍 扫描第 ${i} 位（bit=1）：若该位填 0，则后 ${i} 位可任意合法搭配，贡献 <code>dp[${i}] = ${dp[i]}</code>，累计合法数为 <strong>${ans}</strong>。`,
            log: `bit index=${i}: bit=1 -> add dp[${i}]=${dp[i]}, ans=${ans}`,
            vars: [
              { name: '当前位索引', value: String(i) },
              { name: '当前位贡献', value: `+${dp[i]}` },
              { name: '累计合法数', value: String(ans) },
            ],
            metrics: { validCount: ans },
          })
        );
      } else {
        prev = 0;
        steps.push(
          makeTraceStep({
            dp1d: dp.slice(0, highestBit + 2).map((v, idx) => ({
              value: v,
              label: `dp[${idx}]`,
              state: idx === i ? 'active' : 'computed',
            })),
            message: `🔍 扫描第 ${i} 位（bit=0）：该位只能填 0，无额外分支贡献。`,
            log: `bit index=${i}: bit=0 -> 无新增分支`,
            vars: [
              { name: '当前位索引', value: String(i) },
              { name: '当前位数值', value: '0' },
              { name: '累计合法数', value: String(ans) },
            ],
            metrics: { validCount: ans },
          })
        );
      }
    }

    if (!earlyExit) {
      ans += 1;
      steps.push(
        makeTraceStep({
          dp1d: dp.slice(0, highestBit + 2).map((v, idx) => ({ value: v, label: `dp[${idx}]`, state: 'computed' })),
          message: `✨ 顺利扫描至最低位且未出现连续 1，额外计入 n 本身 (<code>${nBin}</code>)，总合法数为 <strong>${ans}</strong>。`,
          log: `未触发剪枝，+1 计入 n 本身 -> ans=${ans}`,
          vars: [
            { name: '计入 n 本身', value: '+1' },
            { name: '最终合法数', value: String(ans) },
          ],
          metrics: { validCount: ans },
        })
      );
    }

    return steps;
  },
};
