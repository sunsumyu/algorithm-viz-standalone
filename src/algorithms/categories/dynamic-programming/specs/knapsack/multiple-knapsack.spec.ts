import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const MultipleKnapsackSpec: AlgorithmSpec = {
  id: 'multiple-knapsack',
  name: '多重背包问题 (Multiple Knapsack)',
  category: '背包 DP',
  description: '有 N 种物品和一个容量为 W 的背包。第 i 种物品最多有 nums[i] 件可用。求装入背包的最大总价值。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 0,
    leetcodeUrl: 'https://leetcode.cn/circle/article/000000/',
    difficulty: 'medium',
    tags: ['动态规划', '背包问题', '多重背包'],
    description: '有 <code>n</code> 种物品和一个容量为 <code>bagWeight</code> 的背包。<br/><br/>第 <code>i</code> 种物品的重量是 <code>weights[i]</code>，价值是 <code>values[i]</code>，最多有 <code>nums[i]</code> 件。<br/><br/>每种物品都有数量限制。请问在不超过背包最大容量的前提下，装入背包的物品 <strong>最大总价值</strong> 是多少？',
    examples: [
      {
        input: 'weights = [1, 3, 4], values = [15, 20, 30], nums = [2, 3, 2], bagWeight = 4',
        output: '45',
        explanation: '选 2 件物品 0 (重 1×2=2, 价 15×2=30) 和 1 件物品 1 的一部分，或 1 件物品 0 (重 1, 价 15) + 1 件物品 1 (重 3, 价 20) 总重 4，总价值 45。',
      },
    ],
    constraints: [
      '1 <= n <= 1000',
      '1 <= bagWeight <= 1000',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: 4, cpp: 4, python: 3, javascript: 3 },
    loopCheck: { java: 5, cpp: 5, python: 4, javascript: 4 },
    innerLoopCheck: { java: 6, cpp: 6, python: 5, javascript: 5 },
    stateTransfer: {
      java: { primary: 8, context: [5, 6, 7] },
      cpp: { primary: 8, context: [5, 6, 7] },
      python: { primary: 7, context: [4, 5, 6] },
      javascript: { primary: 7, context: [4, 5, 6] },
    },
    loopExit: { java: 5, cpp: 5, python: 4, javascript: 4 },
    returnResult: { java: 12, cpp: 12, python: 9, javascript: 10 },
  },
  code: {
    languages: {
      java: [
        'class Solution {',
        '    public int multipleKnapsack(int[] weights, int[] values, int[] nums, int bagWeight) {',
        '        int n = weights.length;',
        '        int[] dp = new int[bagWeight + 1];',
        '        for (int i = 0; i < n; i++) { // 遍历物品',
        '            for (int j = bagWeight; j >= weights[i]; j--) { // 倒序遍历容量',
        '                for (int k = 1; k <= nums[i] && j >= k * weights[i]; k++) { // 遍历件数',
        '                    dp[j] = Math.max(dp[j], dp[j - k * weights[i]] + k * values[i]);',
        '                }',
        '            }',
        '        }',
        '        return dp[bagWeight];',
        '    }',
        '}',
      ],
      javascript: [
        'function multipleKnapsack(weights, values, nums, bagWeight) {',
        '    const n = weights.length;',
        '    const dp = new Array(bagWeight + 1).fill(0);',
        '    for (let i = 0; i < n; i++) { // 遍历物品',
        '        for (let j = bagWeight; j >= weights[i]; j--) { // 倒序遍历容量',
        '            for (let k = 1; k <= nums[i] && j >= k * weights[i]; k++) { // 遍历选入数量',
        '                dp[j] = Math.max(dp[j], dp[j - k * weights[i]] + k * values[i]);',
        '            }',
        '        }',
        '    }',
        '    return dp[bagWeight];',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int multipleKnapsack(vector<int>& weights, vector<int>& values, vector<int>& nums, int bagWeight) {',
        '        int n = weights.size();',
        '        vector<int> dp(bagWeight + 1, 0);',
        '        for (int i = 0; i < n; i++) {',
        '            for (int j = bagWeight; j >= weights[i]; j--) {',
        '                for (int k = 1; k <= nums[i] && j >= k * weights[i]; k++) {',
        '                    dp[j] = max(dp[j], dp[j - k * weights[i]] + k * values[i]);',
        '                }',
        '            }',
        '        }',
        '        return dp[bagWeight];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def multipleKnapsack(self, weights: List[int], values: List[int], nums: List[int], bagWeight: int) -> int:',
        '        dp = [0] * (bagWeight + 1)',
        '        for i in range(len(weights)):',
        '            for j in range(bagWeight, weights[i] - 1, -1):',
        '                for k in range(1, nums[i] + 1):',
        '                    if j >= k * weights[i]:',
        '                        dp[j] = max(dp[j], dp[j - k * weights[i]] + k * values[i])',
        '        return dp[bagWeight]',
      ],
    },
    lineExplanations: {
      java: {
        2: '函数入口：多重背包求解。',
        4: '初始化一维状态数组 dp。',
        5: '外层遍历物品 i。',
        6: '中层倒序遍历容量 j（保证每种物品数量由 k 控制）。',
        7: '内层遍历选入件数 k。',
        8: '状态转移方程：比较取 k 件与不取。',
        12: '返回最大价值 dp[bagWeight]。',
      },
      javascript: {
        1: '函数入口。',
        3: '初始化 dp 数组。',
        4: '外层遍历物品。',
        5: '中层倒序遍历容量。',
        6: '内层遍历数量。',
        7: '状态转移。',
        10: '返回答案。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 数组。',
        6: '外层遍历物品。',
        7: '倒序遍历容量。',
        8: '遍历数量。',
        9: '累加转移。',
        13: '返回答案。',
      },
      python: {
        2: '函数入口。',
        3: '初始化 dp 列表。',
        4: '遍历物品。',
        5: '倒序遍历背包容量。',
        6: '遍历件数。',
        8: '状态转移。',
        9: '返回结果。',
      },
    },
    keyPoints: {
      title: '📦 多重背包 5 步法系统精讲',
      summary: '多重背包：每种物品有独立的数量上限 nums[i]。可以展开为 0-1 背包求解，或使用 3 层循环直接求解！',
      points: [
        { label: '一、核心转化思想', desc: '将多重背包展开为 0-1 背包（扁平化），或在 0-1 背包内部追加一层件数 k 的枚举。', icon: '📦', badge: '多重转0-1' },
        { label: '二、状态转移方程', desc: '<code>dp[j] = max(dp[j], dp[j - k * weight[i]] + k * value[i])</code>', icon: '⚡', badge: 'k件选优' },
        { label: '三、遍历顺序铁律', desc: '外层物品，中层容量必须<strong>倒序遍历</strong>，内层件数 $1 \le k \le nums[i]$。', icon: '🔄', badge: '中层倒序' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let weights = [1, 3, 4];
    let values = [15, 20, 30];
    let nums = [2, 3, 2];
    let bagWeight = 4;

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.weights)) weights = input.weights;
      if (Array.isArray(input.values)) values = input.values;
      if (Array.isArray(input.nums)) nums = input.nums;
      if (typeof input.bagWeight === 'number') bagWeight = input.bagWeight;
      else if (typeof input.n === 'number') bagWeight = input.n;
    }

    const n = weights.length;
    const dp: DpCell[] = Array(bagWeight + 1).fill(0);
    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    push({
      dp1d: clone1d(dp),
      message: `🎬 多重背包初始化：容量上限 ${bagWeight}`,
      log: `init: dp[0..${bagWeight}] = 0`,
      vars: [{ name: 'bagWeight', value: String(bagWeight), type: 'number' }],
      codeLine: { java: 4, cpp: 4, python: 3, javascript: 3 },
    });

    for (let i = 0; i < n; i++) {
      const w = weights[i];
      const v = values[i];
      const count = nums[i];

      for (let j = bagWeight; j >= w; j--) {
        for (let k = 1; k <= count && j >= k * w; k++) {
          const prev = dp[j - k * w] as number;
          const oldVal = dp[j] as number;
          const candidate = prev + k * v;
          if (candidate > oldVal) {
            dp[j] = candidate;
            push({
              dp1d: clone1d(dp),
              current: { index: j },
              dependencies: [{ index: j - k * w }],
              formula: `dp[${j}] = max(${oldVal}, dp[${j - k * w}] + ${k}*${v}) = ${dp[j]}`,
              message: `⚡ 选入 ${k} 件物品 ${i} (重 ${w}, 价 ${v})：dp[${j}] = ${dp[j]}`,
              log: `update: dp[${j}] = ${dp[j]}`,
              vars: [
                { name: 'i (物品)', value: String(i), type: 'number' },
                { name: 'j (容量)', value: String(j), type: 'number' },
                { name: 'k (件数)', value: String(k), type: 'number' },
                { name: 'dp[j]', value: String(dp[j]), type: 'number' },
              ],
              codeLine: { java: 8, cpp: 8, python: 7, javascript: 7 },
            });
          }
        }
      }
    }

    push({
      dp1d: clone1d(dp),
      current: { index: bagWeight },
      message: `🏁 算法结束：最大总价值为 ${dp[bagWeight]}`,
      log: `return: dp[${bagWeight}] = ${dp[bagWeight]}`,
      vars: [{ name: 'maxVal', value: String(dp[bagWeight]), type: 'number' }],
      codeLine: { java: 12, cpp: 12, python: 9, javascript: 10 },
    });

    return steps;
  },
};
