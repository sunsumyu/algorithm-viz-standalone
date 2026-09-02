import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 最优账单平衡 (Optimal Account Balancing)
 * LeetCode 465 / 左程云算法通关课 第081讲 状压DP下 Code02
 * 状压DP：求最多能够划分出多少个和为 0 的不相交子集。交易次数 = 非零负债人数 m - 最大子集数 maxSubsets。
 */
export const OptimalAccountBalancingSpec: AlgorithmSpec = {
  id: 'optimal-account-balancing',
  name: '最优账单平衡 (Optimal Account Balancing)',
  category: '状压 DP',
  description:
    '给一组转账记录，求清零所有债务的最少转账次数。先计算每个人净负债，转化为：最多能拆分出多少个和为0的独立子集。最少次数 = m - maxSubsets。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 465,
    leetcodeUrl: 'https://leetcode.cn/problems/optimal-account-balancing/',
    difficulty: 'hard',
    tags: ['位运算', '动态规划', '状压DP', '数组'],
    description:
      '一群朋友互相借钱，给定交易记录 <code>transactions[i] = [from, to, amount]</code>。求还清所有债务所需的最少交易笔数。<br/><br/><strong>数学转化与核心结论：</strong><br/>1. 统计每个人净负债（收入-支出），过滤掉净负债为 0 的人，剩下 <code>m</code> 个非零负债者，且这 <code>m</code> 个人的总和必为 <code>0</code>。<br/>2. 若一个子集内所有人负债和为 <code>0</code>，该子集内部只需 <code>size - 1</code> 笔交易即可全部结清。<br/>3. 若能将 <code>m</code> 个人划分为 <code>k</code> 个和为 <code>0</code> 的独立子集，总交易次数为 <code>∑(size_i - 1) = m - k</code>。<br/>4. <strong>为了使交易次数最小，必须使和为 0 的子集数 k 最大！</strong>',
    examples: [
      {
        input: 'transactions = [[0,1,10],[2,0,5]]',
        output: '2',
        explanation: '人0净付5，人1净收10，人2净付5。人0付5给人1，人2付5给人1，共2笔。',
      },
      {
        input: 'transactions = [[0,1,10],[1,0,1],[1,2,5],[2,0,5]]',
        output: '1',
        explanation: '人0净收4，人1净付4，人2收支平衡0。只需人1付4给人0即可。',
      },
    ],
    constraints: [
      '1 <= transactions.length <= 8',
      '非零负债人数 m <= 16',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 7, cpp: 8, python: 7, javascript: 6 },
    init: { java: 11, cpp: 12, python: 11, javascript: 10 },
    stateTransfer: {
      java: [17, 18, 19, 20],
      cpp: [18, 19, 20, 21],
      python: [16, 17, 18, 19],
      javascript: [15, 16, 17, 18],
    },
    returnResult: { java: 24, cpp: 25, python: 22, javascript: 21 },
  },
  code: {
    languages: {
      javascript: [
        'function minTransfers(transactions) {',
        '    const debtMap = new Map();',
        '    for (const [u, v, w] of transactions) {',
        '        debtMap.set(u, (debtMap.get(u) || 0) - w);',
        '        debtMap.set(v, (debtMap.get(v) || 0) + w);',
        '    }',
        '    const debts = Array.from(debtMap.values()).filter(d => d !== 0);',
        '    const m = debts.length;',
        '    if (m === 0) return 0;',
        '    const full = (1 << m) - 1;',
        '    // sum[S]: 集合 S 中所有人的负债累加和',
        '    const sum = new Array(1 << m).fill(0);',
        '    for (let S = 1; S <= full; S++) {',
        '        for (let i = 0; i < m; i++) {',
        '            if (S & (1 << i)) {',
        '                sum[S] = sum[S ^ (1 << i)] + debts[i];',
        '                break;',
        '            }',
        '        }',
        '    }',
        '    // dp[S]: 集合 S 最多能拆分出多少个和为 0 的子集',
        '    const dp = new Array(1 << m).fill(0);',
        '    for (let S = 1; S <= full; S++) {',
        '        if (sum[S] === 0) {',
        '            // 尝试从 S 的子集组合而来',
        '            for (let i = 0; i < m; i++) {',
        '                if (S & (1 << i)) {',
        '                    dp[S] = Math.max(dp[S], dp[S ^ (1 << i)]);',
        '                }',
        '            }',
        '            dp[S] += 1; // S 自身和为 0，额外增加 1 个子集',
        '        } else {',
        '            for (let i = 0; i < m; i++) {',
        '                if (S & (1 << i)) dp[S] = Math.max(dp[S], dp[S ^ (1 << i)]);',
        '            }',
        '        }',
        '    }',
        '    return m - dp[full];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int minTransfers(int[][] transactions) {',
        '        Map<Integer, Integer> map = new HashMap<>();',
        '        for (int[] t : transactions) {',
        '            map.put(t[0], map.getOrDefault(t[0], 0) - t[2]);',
        '            map.put(t[1], map.getOrDefault(t[1], 0) + t[2]);',
        '        }',
        '        List<Integer> list = new ArrayList<>();',
        '        for (int d : map.values()) if (d != 0) list.add(d);',
        '        int m = list.size();',
        '        if (m == 0) return 0;',
        '        int[] debts = new int[m];',
        '        for (int i = 0; i < m; i++) debts[i] = list.get(i);',
        '        int full = (1 << m) - 1;',
        '        int[] sum = new int[1 << m];',
        '        for (int S = 1; S <= full; S++) {',
        '            for (int i = 0; i < m; i++) {',
        '                if ((S & (1 << i)) != 0) { sum[S] = sum[S ^ (1 << i)] + debts[i]; break; }',
        '            }',
        '        }',
        '        int[] dp = new int[1 << m];',
        '        for (int S = 1; S <= full; S++) {',
        '            for (int i = 0; i < m; i++) {',
        '                if ((S & (1 << i)) != 0) dp[S] = Math.max(dp[S], dp[S ^ (1 << i)]);',
        '            }',
        '            if (sum[S] == 0) dp[S]++;',
        '        }',
        '        return m - dp[full];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int minTransfers(vector<vector<int>>& transactions) {',
        '        unordered_map<int, int> debt;',
        '        for (auto& t : transactions) { debt[t[0]] -= t[2]; debt[t[1]] += t[2]; }',
        '        vector<int> debts;',
        '        for (auto& [_, d] : debt) if (d != 0) debts.push_back(d);',
        '        int m = debts.size();',
        '        if (m == 0) return 0;',
        '        int full = (1 << m) - 1;',
        '        vector<int> sum(1 << m, 0), dp(1 << m, 0);',
        '        for (int S = 1; S <= full; S++) {',
        '            for (int i = 0; i < m; i++) {',
        '                if (S & (1 << i)) { sum[S] = sum[S ^ (1 << i)] + debts[i]; break; }',
        '            }',
        '        }',
        '        for (int S = 1; S <= full; S++) {',
        '            for (int i = 0; i < m; i++) {',
        '                if (S & (1 << i)) dp[S] = max(dp[S], dp[S ^ (1 << i)]);',
        '            }',
        '            if (sum[S] == 0) dp[S]++;',
        '        }',
        '        return m - dp[full];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def minTransfers(self, transactions: List[List[int]]) -> int:',
        '        debt = collections.defaultdict(int)',
        '        for u, v, w in transactions: debt[u] -= w; debt[v] += w',
        '        debts = [d for d in debt.values() if d != 0]',
        '        m = len(debts)',
        '        if m == 0: return 0',
        '        full = (1 << m) - 1',
        '        sum_val = [0] * (1 << m)',
        '        for S in range(1, full + 1):',
        '            for i in range(m):',
        '                if S & (1 << i):',
        '                    sum_val[S] = sum_val[S ^ (1 << i)] + debts[i]',
        '                    break',
        '        dp = [0] * (1 << m)',
        '        for S in range(1, full + 1):',
        '            for i in range(m):',
        '                if S & (1 << i): dp[S] = max(dp[S], dp[S ^ (1 << i)])',
        '            if sum_val[S] == 0: dp[S] += 1',
        '        return m - dp[full]',
      ],
    },
    lineExplanations: {
      java: {
        2: '🎯 <strong>函数主入口</strong>。',
        4: '统计每个人净负债：支出减，收入加。',
        9: '过滤掉净负债为 0 的人，得有效人数 m。',
        15: '预处理所有子集 S 的负债总和 sum[S]。',
        22: '💡 <strong>状压转移</strong>：dp[S] = max_{i}(dp[S ^ (1<<i)]) + (sum[S]==0 ? 1 : 0)。',
        26: '最优交易次数 = 人数 m - 最大和为0子集数 dp[full]。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>。',
        7: '过滤有效负债人。',
        13: '预处理子集和 sum[S]。',
        24: '💡 <strong>状压转移</strong>：累加最大和为 0 的子集数。',
        37: '返回 m - dp[full]。',
      },
      cpp: { 3: '主函数。', 21: '状压转移。' },
      python: { 2: '主函数。', 17: '状压转移。' },
    },
    keyPoints: {
      thinking:
        '最优账单平衡核心性质：每个和为 0 的独立子集需要 (size - 1) 笔交易。将 m 个人划分为 k 个和为 0 的子集，总交易数就是 m - k。欲使交易次数最小，等价于求最多能划分出多少个和为 0 的不相交子集。',
      state: 'dp[S] 表示子集 S 中最多能够包含的和为 0 的不相交子集数。',
      equation: 'dp[S] = max_{i ∈ S}(dp[S ^ (1<<i)]) + (sum[S] == 0 ? 1 : 0)',
      initAndBounds: 'dp[0] = 0，目标求 m - dp[(1<<m)-1]。',
    },
  },

  generateSteps: (input: { debts?: number[]; transactions?: number[][] } = {}): DpTraceStep[] => {
    const steps: DpTraceStep[] = [];
    let debts = input?.debts;
    if (!debts && input?.transactions) {
      const balance: Record<number, number> = {};
      for (const [from, to, amount] of input.transactions) {
        balance[from] = (balance[from] || 0) - amount;
        balance[to] = (balance[to] || 0) + amount;
      }
      debts = Object.values(balance).filter((b) => b !== 0);
    }
    if (!debts || debts.length === 0) debts = [-5, 10, -5];
    const m = debts.length;
    const full = (1 << m) - 1;

    steps.push(makeTraceStep({
      phase: 'init',
      description: `非零负债列表 debts = [${debts.join(',')}], 有效人数 m=${m}`,
      highlights: [],
    }));

    const sum = new Array(1 << m).fill(0);
    for (let S = 1; S <= full; S++) {
      for (let i = 0; i < m; i++) {
        if (S & (1 << i)) {
          sum[S] = sum[S ^ (1 << i)] + debts[i]!;
          break;
        }
      }
    }

    const dp = new Array(1 << m).fill(0);
    for (let S = 1; S <= full; S++) {
      for (let i = 0; i < m; i++) {
        if (S & (1 << i)) {
          dp[S] = Math.max(dp[S], dp[S ^ (1 << i)]!);
        }
      }
      if (sum[S] === 0) {
        dp[S]++;
        steps.push(makeTraceStep({
          phase: 'transfer',
          description: `子集 ${S.toString(2).padStart(m, '0')} 和为 0！dp[${S.toString(2).padStart(m, '0')}]=${dp[S]} (包含1个独立和0集合)`,
          highlights: [],
        }));
      }
    }

    const ans = m - dp[full]!;
    steps.push(makeTraceStep({
      phase: 'result',
      description: `全集最大和0子集数=${dp[full]}, 最少交易笔数 = m(${m}) - ${dp[full]} = ${ans}`,
      highlights: [],
      result: ans,
    }));

    return steps;
  },
};
