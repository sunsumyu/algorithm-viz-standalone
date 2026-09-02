import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 我能赢吗 (Can I Win)
 * LeetCode 464 / 左程云算法通关课 第080讲 状压DP上 Code01
 * 状压DP + 博弈论：用位掩码记录 1~n 哪些数字已被选取，记忆化搜索判断先手是否必胜。
 */
export const CanIWinSpec: AlgorithmSpec = {
  id: 'can-i-win',
  name: '我能赢吗 (Can I Win)',
  category: '状压 DP',
  description:
    '两个玩家轮流从 1~n 中选数（不放回），累加和 ≥ m 的一方获胜。用位掩码记录数字池状态，记忆化搜索判断先手是否必胜。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 464,
    leetcodeUrl: 'https://leetcode.cn/problems/can-i-win/',
    difficulty: 'medium',
    tags: ['位运算', '记忆化搜索', '博弈论', '状压DP', '动态规划'],
    description:
      '两个玩家轮流从公共整数池 <code>1~n</code> 中不放回地选数，选出的数累加起来，谁在自己回合让累加和 <code>≥ m</code> 谁获胜。<br/><br/><strong>核心思路：</strong>用一个二进制掩码 <code>status</code> 记录哪些数字还可选。<code>f(status, rest)</code> 表示当前数字池状态为 <code>status</code>，还需凑 <code>rest</code> 时当前玩家是否能赢。若存在某个可选数字 <code>i</code>，使得 <code>i ≥ rest</code>（直接胜）或 <code>f(去掉i后的状态, rest - i) == false</code>（对手必败），则当前玩家必胜。',
    examples: [
      {
        input: 'maxChoosableInteger = 10, desiredTotal = 11',
        output: 'false',
        explanation: '无论先手选什么，后手都有策略获胜。',
      },
      {
        input: 'maxChoosableInteger = 10, desiredTotal = 0',
        output: 'true',
        explanation: '目标为 0，先手还没出手累加和已满足 ≥ 0，直接获胜。',
      },
      {
        input: 'maxChoosableInteger = 10, desiredTotal = 1',
        output: 'true',
        explanation: '先手选 1 即可达到目标。',
      },
    ],
    constraints: [
      '1 <= maxChoosableInteger <= 20',
      '0 <= desiredTotal <= 300',
    ],
  },
  semanticLines: {
    entry: { java: 3, cpp: 4, python: 2, javascript: 1 },
    guard: { java: 6, cpp: 7, python: 5, javascript: 4 },
    init: { java: 10, cpp: 11, python: 9, javascript: 8 },
    stateTransfer: {
      java: [16, 17, 18, 19],
      cpp: [17, 18, 19, 20],
      python: [13, 14, 15, 16],
      javascript: [11, 12, 13, 14],
    },
    returnResult: { java: 23, cpp: 24, python: 20, javascript: 18 },
  },
  code: {
    languages: {
      javascript: [
        'function canIWin(n, m) {',
        '    if (m === 0) return true;',
        '    if (n * (n + 1) / 2 < m) return false;',
        '    // dp[status]: 0 没算过, 1 先手赢, -1 先手输',
        '    const dp = new Array(1 << (n + 1)).fill(0);',
        '    return dfs(n, (1 << (n + 1)) - 1, m, dp);',
        '}',
        'function dfs(n, status, rest, dp) {',
        '    if (dp[status] !== 0) return dp[status] === 1;',
        '    let ans = false;',
        '    for (let i = 1; i <= n && !ans; i++) {',
        '        if ((status & (1 << i)) !== 0) { // 数字 i 可用',
        '            if (i >= rest || !dfs(n, status ^ (1 << i), rest - i, dp)) {',
        '                ans = true; // 选 i 后直接赢 或 对手必输',
        '            }',
        '        }',
        '    }',
        '    dp[status] = ans ? 1 : -1;',
        '    return ans;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public boolean canIWin(int n, int m) {',
        '        if (m == 0) return true;',
        '        if (n * (n + 1) / 2 < m) return false;',
        '        int[] dp = new int[1 << (n + 1)];',
        '        return f(n, (1 << (n + 1)) - 1, m, dp);',
        '    }',
        '    boolean f(int n, int status, int rest, int[] dp) {',
        '        if (dp[status] != 0) return dp[status] == 1;',
        '        boolean ans = false;',
        '        for (int i = 1; i <= n && !ans; i++) {',
        '            if ((status & (1 << i)) != 0) {',
        '                if (i >= rest || !f(n, status ^ (1 << i), rest - i, dp)) {',
        '                    ans = true;',
        '                }',
        '            }',
        '        }',
        '        dp[status] = ans ? 1 : -1;',
        '        return ans;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    bool canIWin(int n, int m) {',
        '        if (m == 0) return true;',
        '        if (n * (n + 1) / 2 < m) return false;',
        '        vector<int> dp(1 << (n + 1), 0);',
        '        return f(n, (1 << (n + 1)) - 1, m, dp);',
        '    }',
        '    bool f(int n, int status, int rest, vector<int>& dp) {',
        '        if (dp[status] != 0) return dp[status] == 1;',
        '        bool ans = false;',
        '        for (int i = 1; i <= n && !ans; i++) {',
        '            if (status & (1 << i)) {',
        '                if (i >= rest || !f(n, status ^ (1 << i), rest - i, dp)) {',
        '                    ans = true;',
        '                }',
        '            }',
        '        }',
        '        dp[status] = ans ? 1 : -1;',
        '        return ans;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def canIWin(self, n: int, m: int) -> bool:',
        '        if m == 0: return True',
        '        if n * (n + 1) // 2 < m: return False',
        '        dp = {}',
        '        def f(status, rest):',
        '            if status in dp: return dp[status]',
        '            ans = False',
        '            for i in range(1, n + 1):',
        '                if status & (1 << i):',
        '                    if i >= rest or not f(status ^ (1 << i), rest - i):',
        '                        ans = True; break',
        '            dp[status] = ans',
        '            return ans',
        '        return f((1 << (n + 1)) - 1, m)',
      ],
    },
    lineExplanations: {
      java: {
        2: '🎯 <strong>函数主入口</strong>：canIWin(n, m)。',
        3: '特判：目标 0，先手直接获胜。',
        4: '特判：所有数加起来不够 m，不可能有赢家。',
        5: '状压 DP 表：1 << (n+1) 种状态。',
        8: '记忆化搜索：f(n, status, rest, dp)。',
        11: '枚举 1~n 所有可选数字。',
        13: '💡 <strong>核心转移</strong>：选 i 后直接赢（i ≥ rest）或对手必败。',
        18: '缓存：1 代表先手赢，-1 代表先手输。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        4: '用数组做记忆化缓存。',
        8: '递归函数：当前 status 可选数字集合，还需凑 rest。',
        12: '数字 i 可用（位检查）。',
        13: '💡 <strong>核心转移</strong>：选 i 直接赢 or 对手必败。',
        18: '记录结果。',
      },
      cpp: {
        3: '主函数。',
        9: '记忆化搜索函数。',
        14: '核心转移。',
      },
      python: {
        2: '主函数。',
        6: '记忆化搜索（用字典缓存）。',
        11: '核心转移。',
      },
    },
    keyPoints: {
      thinking:
        '博弈论 + 状压DP：两人博弈的关键是"当前玩家能否找到至少一种选择让对手必败"。用一个二进制数记录哪些数字还在池中（位为1表示可选），这就是状态压缩。',
      state: 'dp[status] 表示数字池状态为 status 时，当前玩家是否能赢（1=赢, -1=输, 0=未计算）。',
      equation: '若 ∃ i ∈ 可选集合 使得 (i ≥ rest) 或 f(status ^ (1<<i), rest - i) == false，则 f(status, rest) = true',
      initAndBounds: 'status 全 1 表示 1~n 都可选；rest 初始为 m。',
    },
  },

  generateSteps: (params: Record<string, number> = {}): DpTraceStep[] => {
    const n = params.n || 4;
    const m = params.m || 6;
    const steps: DpTraceStep[] = [];

    steps.push(makeTraceStep({
      phase: 'init',
      description: `初始化：数字池 1~${n}，目标累加和 ≥ ${m}`,
      highlights: [],
    }));

    if (m === 0) {
      steps.push(makeTraceStep({
        phase: 'result',
        description: '目标为 0，先手直接获胜 → true',
        highlights: [],
        result: true,
      }));
      return steps;
    }

    const total = n * (n + 1) / 2;
    if (total < m) {
      steps.push(makeTraceStep({
        phase: 'result',
        description: `所有数累加和 ${total} < ${m}，不可能有赢家 → false`,
        highlights: [],
        result: false,
      }));
      return steps;
    }

    // 简化版：展示小规模的搜索过程
    const dp = new Map<number, boolean>();
    let stepCount = 0;
    const maxSteps = 30; // 限制演示步数

    function dfs(status: number, rest: number, depth: number): boolean {
      if (stepCount >= maxSteps) return false;
      if (dp.has(status)) {
        const cached = dp.get(status)!;
        steps.push(makeTraceStep({
          phase: 'transfer',
          description: `${'  '.repeat(depth)}查缓存 status=${status.toString(2).padStart(n + 1, '0')} → ${cached ? '先手赢' : '先手输'}`,
          highlights: [],
        }));
        stepCount++;
        return cached;
      }

      const available: number[] = [];
      for (let i = 1; i <= n; i++) {
        if (status & (1 << i)) available.push(i);
      }

      steps.push(makeTraceStep({
        phase: 'transfer',
        description: `${'  '.repeat(depth)}当前可选 [${available.join(',')}]，还需凑 ${rest}`,
        highlights: [],
      }));
      stepCount++;

      let ans = false;
      for (let i = 1; i <= n && !ans; i++) {
        if (!(status & (1 << i))) continue;
        if (stepCount >= maxSteps) break;

        if (i >= rest) {
          steps.push(makeTraceStep({
            phase: 'transfer',
            description: `${'  '.repeat(depth + 1)}选 ${i} ≥ rest(${rest})，直接获胜！`,
            highlights: [],
          }));
          stepCount++;
          ans = true;
        } else {
          steps.push(makeTraceStep({
            phase: 'transfer',
            description: `${'  '.repeat(depth + 1)}尝试选 ${i}，rest 变为 ${rest - i}，轮到对手`,
            highlights: [],
          }));
          stepCount++;
          if (!dfs(status ^ (1 << i), rest - i, depth + 2)) {
            ans = true;
          }
        }
      }

      dp.set(status, ans);
      steps.push(makeTraceStep({
        phase: 'transfer',
        description: `${'  '.repeat(depth)}结论：status=${status.toString(2).padStart(n + 1, '0')} → ${ans ? '先手赢 ✓' : '先手输 ✗'}`,
        highlights: [],
      }));
      stepCount++;
      return ans;
    }

    const initStatus = (1 << (n + 1)) - 2; // bits 1~n 置1
    const result = dfs(initStatus, m, 0);

    steps.push(makeTraceStep({
      phase: 'result',
      description: `最终结果：先手${result ? '能赢 ✓ → true' : '不能赢 ✗ → false'}`,
      highlights: [],
      result,
    }));

    return steps;
  },
};
