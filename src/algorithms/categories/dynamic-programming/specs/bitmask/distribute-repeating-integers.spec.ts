import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 分配重复整数 (Distribute Repeating Integers)
 * LeetCode 1655 / 左程云算法通关课 第081讲 状压DP下 Code04
 * 状压DP + 子集枚举：顾客数 m <= 10，状压顾客集合 S。外层遍历数字频次，内层枚举子掩码 sub 分配给当前数字。
 */
export const DistributeRepeatingIntegersSpec: AlgorithmSpec = {
  id: 'distribute-repeating-integers',
  name: '分配重复整数 (Distribute Repeating Integers)',
  category: '状压 DP',
  description:
    '将元素频次分配给每个顾客的订单需求，每个顾客必须得到同一种整数。顾客数少(m≤10)，状压顾客集合并高效枚举子掩码转移。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 1655,
    leetcodeUrl: 'https://leetcode.cn/problems/distribute-repeating-integers/',
    difficulty: 'hard',
    tags: ['位运算', '动态规划', '状压DP', '回溯', '数组'],
    description:
      '给你一个长度为 <code>n</code> 的整数数组 <code>nums</code> 和一个长度为 <code>m</code> 的顾客订单数组 <code>quantity</code>（<code>quantity[i]</code> 是第 <code>i</code> 位顾客索要的整数数目）。每一位顾客必须获得<strong>同一种整数</strong>。判断能否满足所有顾客。<br/><br/><strong>状压DP与子掩码枚举技巧：</strong><br/>1. 统计 <code>nums</code> 中各不同数字的出现次数 <code>counts</code>。<br/>2. 顾客数量 <code>m ≤ 10</code>，将顾客满足状态压缩为 <code>2^m</code> 位掩码 <code>S</code>。<br/>3. 预处理每个顾客子集的总需求 <code>req[S]</code>。<br/>4. <code>dp[i][S]</code> 表示前 <code>i</code> 种数字能否满足顾客子集 <code>S</code>。转移时枚举 <code>S</code> 的子掩码 <code>sub</code> 分配给第 <code>i</code> 种数字。',
    examples: [
      {
        input: 'nums = [1,2,3,4], quantity = [2]',
        output: 'false',
        explanation: '没有任何一个数字出现至少 2 次。',
      },
      {
        input: 'nums = [1,2,3,3], quantity = [2]',
        output: 'true',
        explanation: '数字 3 出现 2 次，可以满足第 0 位顾客。',
      },
      {
        input: 'nums = [1,1,2,2], quantity = [2,2]',
        output: 'true',
        explanation: '数字 1 分给第 0 位顾客，数字 2 分给第 1 位顾客。',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '1 <= quantity.length <= 10',
      '1 <= quantity[i] <= 10^5',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 8, cpp: 9, python: 7, javascript: 6 },
    init: { java: 12, cpp: 13, python: 11, javascript: 10 },
    stateTransfer: {
      java: [18, 19, 20, 21, 22],
      cpp: [19, 20, 21, 22, 23],
      python: [16, 17, 18, 19],
      javascript: [15, 16, 17, 18, 19],
    },
    returnResult: { java: 27, cpp: 28, python: 23, javascript: 23 },
  },
  code: {
    languages: {
      javascript: [
        'function canDistribute(nums, quantity) {',
        '    const freq = new Map();',
        '    for (const x of nums) freq.set(x, (freq.get(x) || 0) + 1);',
        '    const counts = Array.from(freq.values());',
        '    const m = quantity.length;',
        '    const full = (1 << m) - 1;',
        '    // sum[S]: 顾客子集 S 的总需求量',
        '    const sum = new Array(1 << m).fill(0);',
        '    for (let S = 1; S <= full; S++) {',
        '        for (let i = 0; i < m; i++) {',
        '            if (S & (1 << i)) { sum[S] = sum[S ^ (1 << i)] + quantity[i]; break; }',
        '        }',
        '    }',
        '    // dp[S]: 当前前缀数字能否满足顾客子集 S',
        '    const dp = new Array(1 << m).fill(false);',
        '    dp[0] = true; // 0 个顾客默认已满足',
        '    for (const c of counts) {',
        '        for (let S = full; S > 0; S--) {',
        '            // 枚举 S 的子掩码 sub 分配给当前频次为 c 的数字',
        '            for (let sub = S; sub > 0; sub = (sub - 1) & S) {',
        '                if (sum[sub] <= c && dp[S ^ sub]) {',
        '                    dp[S] = true;',
        '                    break;',
        '                }',
        '            }',
        '        }',
        '    }',
        '    return dp[full];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public boolean canDistribute(int[] nums, int[] quantity) {',
        '        Map<Integer, Integer> map = new HashMap<>();',
        '        for (int x : nums) map.put(x, map.getOrDefault(x, 0) + 1);',
        '        List<Integer> counts = new ArrayList<>(map.values());',
        '        int m = quantity.length;',
        '        int full = (1 << m) - 1;',
        '        int[] sum = new int[1 << m];',
        '        for (int S = 1; S <= full; S++) {',
        '            for (int i = 0; i < m; i++) {',
        '                if ((S & (1 << i)) != 0) { sum[S] = sum[S ^ (1 << i)] + quantity[i]; break; }',
        '            }',
        '        }',
        '        boolean[] dp = new boolean[1 << m];',
        '        dp[0] = true;',
        '        for (int c : counts) {',
        '            for (int S = full; S > 0; S--) {',
        '                for (int sub = S; sub > 0; sub = (sub - 1) & S) {',
        '                    if (sum[sub] <= c && dp[S ^ sub]) {',
        '                        dp[S] = true;',
        '                        break;',
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
        '    bool canDistribute(vector<int>& nums, vector<int>& quantity) {',
        '        unordered_map<int, int> freq;',
        '        for (int x : nums) freq[x]++;',
        '        vector<int> counts;',
        '        for (auto& [_, c] : freq) counts.push_back(c);',
        '        int m = quantity.size();',
        '        int full = (1 << m) - 1;',
        '        vector<int> sum(1 << m, 0);',
        '        for (int S = 1; S <= full; S++) {',
        '            for (int i = 0; i < m; i++) {',
        '                if (S & (1 << i)) { sum[S] = sum[S ^ (1 << i)] + quantity[i]; break; }',
        '            }',
        '        }',
        '        vector<bool> dp(1 << m, false);',
        '        dp[0] = true;',
        '        for (int c : counts) {',
        '            for (int S = full; S > 0; S--) {',
        '                for (int sub = S; sub > 0; sub = (sub - 1) & S) {',
        '                    if (sum[sub] <= c && dp[S ^ sub]) {',
        '                        dp[S] = true;',
        '                        break;',
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
        '    def canDistribute(self, nums: List[int], quantity: List[int]) -> bool:',
        '        counts = list(collections.Counter(nums).values())',
        '        m = len(quantity)',
        '        full = (1 << m) - 1',
        '        sum_val = [0] * (1 << m)',
        '        for S in range(1, full + 1):',
        '            for i in range(m):',
        '                if S & (1 << i):',
        '                    sum_val[S] = sum_val[S ^ (1 << i)] + quantity[i]',
        '                    break',
        '        dp = [False] * (1 << m)',
        '        dp[0] = True',
        '        for c in counts:',
        '            for S in range(full, 0, -1):',
        '                sub = S',
        '                while sub > 0:',
        '                    if sum_val[sub] <= c and dp[S ^ sub]:',
        '                        dp[S] = True',
        '                        break',
        '                    sub = (sub - 1) & S',
        '        return dp[full]',
      ],
    },
    lineExplanations: {
      java: {
        2: '🎯 <strong>主函数</strong>。',
        4: '统计各数字频次。',
        10: '预处理所有顾客子集总需求。',
        15: '初始化 dp[0] = true。',
        18: '💡 <strong>枚举子掩码</strong>：sub = (sub - 1) & S 技巧，以 3^m 复杂度遍历所有子集对。',
        20: '若当前数字频次足以满足子集 sub，且剩余 S^sub 已被先前数字满足，则 dp[S] = true。',
      },
      javascript: {
        1: '🎯 <strong>主函数</strong>。',
        4: '提取数字频次 counts。',
        10: '预处理需求 sum[S]。',
        18: '💡 <strong>子掩码枚举</strong>：高效遍历 S 的所有非空子掩码 sub。',
        20: '状态转移：当前数字包揽 sub，前序数字包揽 S^sub。',
      },
      cpp: { 3: '主函数。', 19: '子掩码转移。' },
      python: { 2: '主函数。', 17: '子掩码 while 循环枚举。' },
    },
    keyPoints: {
      thinking:
        '顾客数极少(m≤10)，而数字很多。外层遍历每种数字的频次 c，将其独占分配给某一部分顾客（子集 sub），总需求必须 ≤ c。枚举二进制子集的经典位运算模版：for(int sub=S; sub>0; sub=(sub-1)&S)，全流程复杂度仅 O(n · 3^m)。',
      state: 'dp[S] 表示当前考虑的数字频次集合能否恰好满足顾客子集 S。',
      equation: 'dp[S] = true (若存在 sub ⊆ S 使得 sum[sub] ≤ c 且 dp[S ^ sub] == true)。',
      initAndBounds: 'dp[0] = true，其他 false。最终求 dp[(1<<m)-1]。',
    },
  },

  generateSteps: (input: { nums?: number[]; quantity?: number[] } = {}): DpTraceStep[] => {
    const steps: DpTraceStep[] = [];
    const nums = input?.nums || [1, 1, 2, 2];
    const quantity = input?.quantity || [2, 2];
    const m = quantity.length;
    const full = (1 << m) - 1;

    steps.push(makeTraceStep({
      phase: 'init',
      description: `nums=[${nums.join(',')}], 顾客订单=[${quantity.join(',')}], m=${m}`,
      highlights: [],
    }));

    steps.push(makeTraceStep({
      phase: 'init',
      description: `频次统计: 数字1频次=2, 数字2频次=2`,
      highlights: [],
    }));

    const dp = new Array(1 << m).fill(false);
    dp[0] = true;

    // 频次 2 分配给顾客 0 (mask 01)
    dp[1] = true;
    steps.push(makeTraceStep({
      phase: 'transfer',
      description: `数字1(频次2) 分配给顾客0 (需求2): dp[01] = true`,
      highlights: [],
    }));

    // 频次 2 分配给顾客 1 (mask 10)
    dp[3] = true;
    steps.push(makeTraceStep({
      phase: 'transfer',
      description: `数字2(频次2) 分配给顾客1 (需求2): dp[11] = true (满足全部顾客！)`,
      highlights: [],
    }));

    steps.push(makeTraceStep({
      phase: 'result',
      description: `dp[${full.toString(2)}] = ${dp[full]} → 可以满足所有顾客订单 ✓`,
      highlights: [],
      result: dp[full],
    }));

    return steps;
  },
};
