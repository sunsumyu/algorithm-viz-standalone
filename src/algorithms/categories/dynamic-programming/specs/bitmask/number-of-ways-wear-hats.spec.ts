import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 每个人戴不同帽子的方案数 (Number of Ways to Wear Different Hats to Each Other)
 * LeetCode 1434 / 左程云算法通关课 第081讲 状压DP下 Code01
 * 维度反转状压DP：人少帽子多(n<=10, hats<=40)，状压"人"的分配状态 status，按"帽子"逐顶分配。
 */
export const NumberOfWaysWearHatsSpec: AlgorithmSpec = {
  id: 'number-of-ways-wear-hats',
  name: '每个人戴不同帽子的方案数',
  category: '状压 DP',
  description:
    'n 个人每个人有喜欢的帽子列表，每人戴不同帽子。因为人少(n≤10)而帽子多(40顶)，将人的分配状态做二进制压缩，按帽子维度逐一决策分配给谁。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 1434,
    leetcodeUrl: 'https://leetcode.cn/problems/number-of-ways-wear-different-hats-to-each-other/',
    difficulty: 'hard',
    tags: ['位运算', '动态规划', '状压DP', '数组'],
    description:
      '总共有 <code>n</code> 个人和 <code>40</code> 顶不同的帽子（编号 1~40）。每个人喜欢若干顶帽子。请返回每个人都戴不同帽子且都是自己喜欢的帽子的方案数（对 10^9+7 取模）。<br/><br/><strong>核心技巧（反转状态）：</strong>人数 <code>n ≤ 10</code>，如果对帽子状压需要 2^40 太大；但对"人"状压只有 <code>2^10 = 1024</code> 种状态。因此转化为：依次考虑第 <code>i</code> 顶帽子（1..40），可以不分给任何人，或者分给喜欢它的某个人 <code>p</code>（前提是 <code>p</code> 当前还没分到帽子）。',
    examples: [
      {
        input: 'hats = [[3,4],[4,5],[5]]',
        output: '1',
        explanation: '唯一方案：人0戴帽子3，人1戴帽子4，人2戴帽子5。',
      },
      {
        input: 'hats = [[3,5,1],[3,5]]',
        output: '4',
        explanation: '人0选1人1选3，人0选1人1选5，人0选3人1选5，人0选5人1选3，共4种。',
      },
    ],
    constraints: [
      'n == hats.length, 1 <= n <= 10',
      '1 <= hats[i].length <= 40',
      '1 <= hats[i][j] <= 40',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 5, cpp: 6, python: 5, javascript: 4 },
    init: { java: 9, cpp: 10, python: 8, javascript: 8 },
    stateTransfer: {
      java: [15, 16, 17, 18],
      cpp: [16, 17, 18, 19],
      python: [13, 14, 15, 16],
      javascript: [13, 14, 15, 16],
    },
    returnResult: { java: 22, cpp: 23, python: 19, javascript: 19 },
  },
  code: {
    languages: {
      javascript: [
        'function numberWays(hats) {',
        '    const MOD = 1000000007;',
        '    const n = hats.length;',
        '    // 反向映射：hatToPersons[h] = 喜欢第 h 顶帽子的人的列表',
        '    const hatToPersons = Array.from({ length: 41 }, () => []);',
        '    for (let p = 0; p < n; p++) {',
        '        for (const h of hats[p]) hatToPersons[h].push(p);',
        '    }',
        '    const full = (1 << n) - 1;',
        '    // dp[S]: 已经满足了集合 S 中的人时的方案数',
        '    const dp = new Array(1 << n).fill(0);',
        '    dp[0] = 1; // 0 个人被满足时方案数为 1',
        '    for (let h = 1; h <= 40; h++) {',
        '        // 倒序遍历集合 S（01背包滚动数组思想）',
        '        for (let S = full; S >= 0; S--) {',
        '            if (dp[S] === 0) continue;',
        '            for (const p of hatToPersons[h]) {',
        '                if (!(S & (1 << p))) { // 人 p 还没戴帽子',
        '                    const nxt = S | (1 << p);',
        '                    dp[nxt] = (dp[nxt] + dp[S]) % MOD;',
        '                }',
        '            }',
        '        }',
        '    }',
        '    return dp[full];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int numberWays(List<List<Integer>> hats) {',
        '        int MOD = 1000000007, n = hats.size();',
        '        List<Integer>[] hatToPersons = new ArrayList[41];',
        '        for (int i = 1; i <= 40; i++) hatToPersons[i] = new ArrayList<>();',
        '        for (int p = 0; p < n; p++) {',
        '            for (int h : hats.get(p)) hatToPersons[h].add(p);',
        '        }',
        '        int full = (1 << n) - 1;',
        '        int[] dp = new int[1 << n];',
        '        dp[0] = 1;',
        '        for (int h = 1; h <= 40; h++) {',
        '            for (int S = full; S >= 0; S--) {',
        '                if (dp[S] == 0) continue;',
        '                for (int p : hatToPersons[h]) {',
        '                    if ((S & (1 << p)) == 0) {',
        '                        dp[S | (1 << p)] = (dp[S | (1 << p)] + dp[S]) % MOD;',
        '                    }',
        '                }',
        '            }',
        '        }',
        '        return dp[full];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int numberWays(vector<vector<int>>& hats) {',
        '        const int MOD = 1e9 + 7;',
        '        int n = hats.size();',
        '        vector<vector<int>> hatToPersons(41);',
        '        for (int p = 0; p < n; p++) {',
        '            for (int h : hats[p]) hatToPersons[h].push_back(p);',
        '        }',
        '        int full = (1 << n) - 1;',
        '        vector<int> dp(1 << n, 0);',
        '        dp[0] = 1;',
        '        for (int h = 1; h <= 40; h++) {',
        '            for (int S = full; S >= 0; S--) {',
        '                if (!dp[S]) continue;',
        '                for (int p : hatToPersons[h]) {',
        '                    if (!(S & (1 << p))) {',
        '                        dp[S | (1 << p)] = (dp[S | (1 << p)] + dp[S]) % MOD;',
        '                    }',
        '                }',
        '            }',
        '        }',
        '        return dp[full];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def numberWays(self, hats: List[List[int]]) -> int:',
        '        MOD = 10**9 + 7',
        '        n = len(hats)',
        '        hat_to_persons = collections.defaultdict(list)',
        '        for p in range(n):',
        '            for h in hats[p]: hat_to_persons[h].append(p)',
        '        full = (1 << n) - 1',
        '        dp = [0] * (1 << n)',
        '        dp[0] = 1',
        '        for h in range(1, 41):',
        '            for S in range(full, -1, -1):',
        '                if not dp[S]: continue',
        '                for p in hat_to_persons[h]:',
        '                    if not (S & (1 << p)):',
        '                        dp[S | (1 << p)] = (dp[S | (1 << p)] + dp[S]) % MOD',
        '        return dp[full]',
      ],
    },
    lineExplanations: {
      java: {
        2: '🎯 <strong>主函数</strong>。',
        4: '反转映射：统计每顶帽子被哪些人喜欢。',
        9: '状压 DP 表：dp[S] 表示满足了人的子集 S 的方案数。',
        11: '💡 <strong>外层遍历帽子 1~40</strong>（每顶帽子是一件独立资源）。',
        13: '💡 <strong>倒序遍历人集合 S</strong>：类似于 01 背包空间压缩。',
        15: '若人 p 还没戴帽子，将帽子 h 分配给人 p，方案数累加。',
      },
      javascript: {
        1: '🎯 <strong>函数入口</strong>。',
        5: '反向建立帽子到人的映射。',
        11: '初始 dp[0] = 1。',
        13: '外层遍历帽子编号 1~40。',
        15: '倒序更新状压集合 S。',
        23: '返回所有人均戴上帽子的总方案数 dp[full]。',
      },
      cpp: { 3: '主函数。', 12: '外层帽子，内层状压子集。' },
      python: { 2: '主函数。', 10: '01背包式倒序状压转移。' },
    },
    keyPoints: {
      thinking:
        '维度反转技巧：人数量很小(n≤10)，帽子很多(40顶)。直接按人分配帽子需要 2^40 状态；反过来按帽子给人分配，状态只需 2^n = 1024。每顶帽子要么不分配，要么分给一个还没戴帽子的人。',
      state: 'dp[S] 表示前 h 顶帽子分配后，满足了子集 S 中所有人的合法方案数。',
      equation: 'dp[S | (1<<p)] = (dp[S | (1<<p)] + dp[S]) % MOD (p ∉ S 且 p 喜欢帽子 h)。',
      initAndBounds: 'dp[0] = 1，其他全 0。目标求 dp[(1<<n)-1]。',
    },
  },

  generateSteps: (input: { hats?: number[][] } = {}): DpTraceStep[] => {
    const steps: DpTraceStep[] = [];
    const hats = input?.hats || [[3, 4], [4, 5], [5]];
    const n = hats.length;
    const full = (1 << n) - 1;

    steps.push(makeTraceStep({
      phase: 'init',
      description: `人数 n=${n}，喜好: 人0=[3,4], 人1=[4,5], 人2=[5]`,
      highlights: [],
    }));

    const dp = new Array(1 << n).fill(0);
    dp[0] = 1;

    const hatToPersons: number[][] = Array.from({ length: 6 }, () => []);
    for (let p = 0; p < n; p++) {
      for (const h of hats[p]!) {
        if (h <= 5) hatToPersons[h]!.push(p);
      }
    }

    steps.push(makeTraceStep({
      phase: 'init',
      description: `反向映射：帽子3→[0], 帽子4→[0,1], 帽子5→[1,2]`,
      highlights: [],
    }));

    for (let h = 1; h <= 5; h++) {
      if (hatToPersons[h]!.length === 0) continue;
      steps.push(makeTraceStep({
        phase: 'transfer',
        description: `--- 决策第 ${h} 顶帽子 (喜欢它的人: [${hatToPersons[h]!.join(',')}]) ---`,
        highlights: [],
      }));

      for (let S = full; S >= 0; S--) {
        if (dp[S] === 0) continue;
        for (const p of hatToPersons[h]!) {
          if (!(S & (1 << p))) {
            const nxt = S | (1 << p);
            dp[nxt] += dp[S];
            steps.push(makeTraceStep({
              phase: 'transfer',
              description: `帽子${h} 给 人${p}: 状态 ${S.toString(2).padStart(n, '0')} → ${nxt.toString(2).padStart(n, '0')}, dp[${nxt.toString(2).padStart(n, '0')}]=${dp[nxt]}`,
              highlights: [],
            }));
          }
        }
      }
    }

    steps.push(makeTraceStep({
      phase: 'result',
      description: `最终每个人都戴上帽子的方案数 dp[${full.toString(2)}] = ${dp[full]}`,
      highlights: [],
      result: dp[full],
    }));

    return steps;
  },
};
