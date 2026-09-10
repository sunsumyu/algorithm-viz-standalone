import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 好子集的数目 (The Number of Good Subsets)
 * LeetCode 1994 / 左程云算法通关课 第081讲 状压DP下 Code03
 * 状压DP + 数论质因数分解：1~30 内的 10 个质数 [2,3,5,7,11,13,17,19,23,29] 压缩为 10 位掩码。
 */
export const GoodSubsetsSpec: AlgorithmSpec = {
  id: 'good-subsets',
  name: '好子集的数目 (Good Subsets)',
  category: '状压 DP',
  description:
    '好子集乘积必须是互不相同的质数之积。1~30 中只有 10 个质数，排除有平方因子的数后，将每个数的质因子压缩为 10 位二进制掩码做 01 背包计数。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 1994,
    leetcodeUrl: 'https://leetcode.cn/problems/the-number-of-good-subsets/',
    difficulty: 'hard',
    tags: ['位运算', '数组', '数学', '动态规划', '状压DP'],
    description:
      '给你一个整数数组 <code>nums</code>（元素范围 <code>1~30</code>）。如果 <code>nums</code> 的一个子集的乘积可以表示为一个或多个<strong>互不相同的质数</strong>的乘积，称该子集为<strong>好子集</strong>。返回好子集的数目（模 10^9+7）。<br/><br/><strong>质因数状压核心：</strong><br/>1. 30 以内的质数仅 10 个：<code>[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]</code>。<br/>2. 包含平方因子（如 4, 8, 9, 12, 16, 18, 20, 24, 25, 27, 28）的数不能选。<br/>3. 其余每个数映射为一个 10 位掩码 <code>mask</code>。<br/>4. 数字 <code>1</code> 可选可不选，每个 1 贡献 <code>2^cnt[1]</code> 倍方案。',
    examples: [
      {
        input: 'nums = [4,2,3,15]',
        output: '5',
        explanation: '好子集乘积为 2 (4种含1组合: [2],[2,1]), 3 ([3]), 15 ([15]), 6 ([2,3]), 30 ([2,15])。',
      },
      {
        input: 'nums = [1,2,3,4]',
        output: '6',
        explanation: '好子集有 [1,2], [1,3], [1,2,3], [2], [3], [2,3]。',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '1 <= nums[i] <= 30',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 8, cpp: 9, python: 8, javascript: 7 },
    init: { java: 12, cpp: 13, python: 12, javascript: 11 },
    stateTransfer: {
      java: [18, 19, 20, 21],
      cpp: [19, 20, 21, 22],
      python: [16, 17, 18, 19],
      javascript: [15, 16, 17, 18],
    },
    returnResult: { java: 27, cpp: 28, python: 24, javascript: 23 },
  },
  code: {
    languages: {
      javascript: [
        'function numberOfGoodSubsets(nums) {',
        '    const MOD = 1000000007;',
        '    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];',
        '    const cnt = new Array(31).fill(0);',
        '    for (const x of nums) cnt[x]++;',
        '    // 预处理 1~30 中每个数的质因子 mask，若有平方因子则为 -1',
        '    const masks = new Array(31).fill(0);',
        '    for (let i = 2; i <= 30; i++) {',
        '        let m = 0, x = i;',
        '        for (let j = 0; j < 10; j++) {',
        '            if (x % primes[j] === 0) {',
        '                x /= primes[j];',
        '                if (x % primes[j] === 0) { m = -1; break; } // 有平方因子',
        '                m |= (1 << j);',
        '            }',
        '        }',
        '        masks[i] = m;',
        '    }',
        '    const full = (1 << 10) - 1;',
        '    const dp = new Array(1 << 10).fill(0);',
        '    dp[0] = 1;',
        '    for (let i = 2; i <= 30; i++) {',
        '        if (cnt[i] === 0 || masks[i] === -1) continue;',
        '        const m = masks[i];',
        '        for (let S = full; S >= 0; S--) {',
        '            if ((S & m) === 0 && dp[S] > 0) { // S 与 m 无交集',
        '                dp[S | m] = (dp[S | m] + dp[S] * cnt[i]) % MOD;',
        '            }',
        '        }',
        '    }',
        '    let ans = 0;',
        '    for (let S = 1; S <= full; S++) ans = (ans + dp[S]) % MOD;',
        '    // 数字 1 每个都有选或不选两种可能 -> 乘以 2^cnt[1]',
        '    for (let i = 0; i < cnt[1]; i++) ans = (ans * 2) % MOD;',
        '    return ans;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int numberOfGoodSubsets(int[] nums) {',
        '        int MOD = 1000000007;',
        '        int[] primes = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29};',
        '        int[] cnt = new int[31];',
        '        for (int x : nums) cnt[x]++;',
        '        int[] masks = new int[31];',
        '        for (int i = 2; i <= 30; i++) {',
        '            int m = 0, x = i;',
        '            for (int j = 0; j < 10; j++) {',
        '                if (x % primes[j] == 0) {',
        '                    x /= primes[j];',
        '                    if (x % primes[j] == 0) { m = -1; break; }',
        '                    m |= (1 << j);',
        '                }',
        '            }',
        '            masks[i] = m;',
        '        }',
        '        int[] dp = new int[1 << 10];',
        '        dp[0] = 1;',
        '        for (int i = 2; i <= 30; i++) {',
        '            if (cnt[i] == 0 || masks[i] == -1) continue;',
        '            int m = masks[i];',
        '            for (int S = (1 << 10) - 1; S >= 0; S--) {',
        '                if ((S & m) == 0 && dp[S] > 0) {',
        '                    dp[S | m] = (int)((dp[S | m] + 1L * dp[S] * cnt[i]) % MOD);',
        '                }',
        '            }',
        '        }',
        '        long ans = 0;',
        '        for (int S = 1; S < (1 << 10); S++) ans = (ans + dp[S]) % MOD;',
        '        for (int i = 0; i < cnt[1]; i++) ans = (ans * 2) % MOD;',
        '        return (int)ans;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int numberOfGoodSubsets(vector<int>& nums) {',
        '        const int MOD = 1e9 + 7;',
        '        vector<int> primes = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29};',
        '        vector<int> cnt(31, 0);',
        '        for (int x : nums) cnt[x]++;',
        '        vector<int> masks(31, 0);',
        '        for (int i = 2; i <= 30; i++) {',
        '            int m = 0, x = i;',
        '            for (int j = 0; j < 10; j++) {',
        '                if (x % primes[j] == 0) {',
        '                    x /= primes[j];',
        '                    if (x % primes[j] == 0) { m = -1; break; }',
        '                    m |= (1 << j);',
        '                }',
        '            }',
        '            masks[i] = m;',
        '        }',
        '        vector<long long> dp(1 << 10, 0);',
        '        dp[0] = 1;',
        '        for (int i = 2; i <= 30; i++) {',
        '            if (!cnt[i] || masks[i] == -1) continue;',
        '            int m = masks[i];',
        '            for (int S = (1 << 10) - 1; S >= 0; S--) {',
        '                if (!(S & m) && dp[S]) {',
        '                    dp[S | m] = (dp[S | m] + dp[S] * cnt[i]) % MOD;',
        '                }',
        '            }',
        '        }',
        '        long long ans = 0;',
        '        for (int S = 1; S < (1 << 10); S++) ans = (ans + dp[S]) % MOD;',
        '        for (int i = 0; i < cnt[1]; i++) ans = (ans * 2) % MOD;',
        '        return ans;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def numberOfGoodSubsets(self, nums: List[int]) -> int:',
        '        MOD = 10**9 + 7',
        '        primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]',
        '        cnt = collections.Counter(nums)',
        '        masks = [0] * 31',
        '        for i in range(2, 31):',
        '            m, x = 0, i',
        '            for j, p in enumerate(primes):',
        '                if x % p == 0:',
        '                    x //= p',
        '                    if x % p == 0: m = -1; break',
        '                    m |= (1 << j)',
        '            masks[i] = m',
        '        dp = [0] * (1 << 10)',
        '        dp[0] = 1',
        '        for i in range(2, 31):',
        '            if not cnt[i] or masks[i] == -1: continue',
        '            m = masks[i]',
        '            for S in range((1 << 10) - 1, -1, -1):',
        '                if not (S & m) and dp[S]:',
        '                    dp[S | m] = (dp[S | m] + dp[S] * cnt[i]) % MOD',
        '        ans = sum(dp[1:]) % MOD',
        '        ans = (ans * pow(2, cnt[1], MOD)) % MOD',
        '        return ans',
      ],
    },
    lineExplanations: {
      java: {
        2: '🎯 <strong>主函数入口</strong>。',
        4: '定义 30 以内的 10 个质数。',
        8: '预处理 1~30 每个数的质因子掩码，过滤含平方因子数（标记 -1）。',
        17: '💡 <strong>01背包状压 DP</strong>：dp[S] 表示质数集合为 S 时的方案数。',
        22: '若 S 与当前数 m 无共同质因子，则可进行拼接转移。',
        27: '最终乘以 2^cnt[1]（数字 1 对乘积无影响，每个 1 可选或不选）。',
      },
      javascript: {
        1: '🎯 <strong>主函数入口</strong>。',
        7: '预处理质因子掩码。',
        19: '01背包倒序遍历状压集合 S。',
        24: '累加所有非空集合方案数。',
        27: '处理数字 1 的 2^cnt[1] 倍乘贡献。',
      },
      cpp: { 3: '主函数。', 19: '状压转移。' },
      python: { 2: '主函数。', 16: '状压转移与 1 的幂次乘法。' },
    },
    keyPoints: {
      thinking:
        '值域 1~30 的质数只有 10 个。将质数集合压缩为 10 位二进制（2^10 = 1024）。把每个数视为一个物品，其价值为质因子掩码，进行 01 背包计数。最后数字 1 贡献 2^count(1) 倍。',
      state: 'dp[S] 表示当前选出的好子集中所有数的质因子并集为 S 时的方案数。',
      equation: 'dp[S | m] = dp[S | m] + dp[S] * cnt[i] (S & m == 0)。',
      initAndBounds: 'dp[0] = 1。答案为 ∑_{S > 0} dp[S] × 2^cnt[1]。',
    },
  },

  generateSteps: (input: { nums?: number[] } = {}): DpTraceStep[] => {
    const steps: DpTraceStep[] = [];
    const nums = input?.nums || [1, 2, 3, 4];
    steps.push(makeTraceStep({
      phase: 'init',
      description: `nums = [${nums.join(',')}], 质数表: [2,3,5,7,11,13,17,19,23,29]`,
      highlights: [],
    }));

    steps.push(makeTraceStep({
      phase: 'init',
      description: `数字4含平方因子(2^2)排除；数字1有1个；数字2掩码=001(质数2), 数字3掩码=010(质数3)`,
      highlights: [],
    }));

    const dp = new Array(1 << 3).fill(0);
    dp[0] = 1;

    // 选 2
    dp[1] = 1;
    steps.push(makeTraceStep({
      phase: 'transfer',
      description: `加入数字 2 (掩码 001): dp[001] = 1`,
      highlights: [],
    }));

    // 选 3
    dp[2] = 1;
    dp[3] = 1;
    steps.push(makeTraceStep({
      phase: 'transfer',
      description: `加入数字 3 (掩码 010): dp[010] = 1, dp[011] = dp[001]*1 = 1 (子集[2,3])`,
      highlights: [],
    }));

    const sumWithout1 = dp[1] + dp[2] + dp[3];
    const ans = sumWithout1 * 2; // 1个数字1

    steps.push(makeTraceStep({
      phase: 'result',
      description: `不含1的好子集方案数=${sumWithout1}，数字1产生 2^1=2 倍乘 → 最终答案 = ${ans}`,
      highlights: [],
      result: ans,
    }));

    return steps;
  },
};
