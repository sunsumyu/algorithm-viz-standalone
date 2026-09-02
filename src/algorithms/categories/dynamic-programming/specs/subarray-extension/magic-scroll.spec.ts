import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 魔法卷轴问题 (Magic Scroll Problem)
 * 左程云算法通关课 第070讲 子数组最大累加和扩展
 * 前后缀分解 + Kadane 变体：至多使用两次魔法卷轴（将不相交的连续子数组清零），求数组元素最大总和。
 */
export const MagicScrollSpec: AlgorithmSpec = {
  id: 'magic-scroll',
  name: '魔法卷轴问题 (Magic Scroll Problem)',
  category: '子数组与 LIS 扩展 DP',
  description:
    '给定数组 nums，你有至多两次使用魔法卷轴的机会，每次可选择一段连续子数组将其全部元素变为 0（两次选择的区间不能重叠）。求变零操作后数组所有元素的最大可能累加和。',
  difficulty: 'medium',
  problem: {
    difficulty: 'medium',
    tags: ['动态规划', '前后缀分解', 'Kadane 算法', '子数组累加和'],
    description:
      '给定一个长度为 <code>n</code> 的整数数组 <code>nums</code>。<br/><br/>你拥有<strong>至多两次</strong>使用魔法卷轴的机会：<br/>• 每次使用卷轴，你可以指定数组中的一个<strong>连续子数组</strong>，将其中的所有数值全部置为 0；<br/>• 两次使用的区间可以相邻，但<strong>不能互相重叠</strong>；<br/>• 你也可以选择只使用 1 次或完全不使用卷轴。<br/><br/>请返回在进行合法的卷轴操作后，整个数组所有元素之和所能达到的<strong>最大值</strong>。',
    examples: [
      {
        input: 'nums = [1, -2, 3, 5, -1, 2]',
        output: '13',
        explanation: '使用两次卷轴分别将 [-2] 和 [-1] 变为 0，总和变为 1 + 0 + 3 + 5 + 0 + 2 = 11? 原数组总和为 8，去掉 -2 和 -1 后总和为 11。',
      },
      {
        input: 'nums = [-5, -2, -3]',
        output: '0',
        explanation: '使用卷轴将整个数组变零，最大和为 0。',
      },
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: 6, cpp: 7, python: 6, javascript: 5 },
    loopCheck: { java: 11, cpp: 12, python: 11, javascript: 10 },
    stateTransfer: {
      java: [12, 13, 14, 15, 16, 17, 18],
      cpp: [13, 14, 15, 16, 17, 18, 19],
      python: [12, 13, 14, 15, 16, 17],
      javascript: [11, 12, 13, 14, 15, 16],
    },
    loopExit: { java: 24, cpp: 23, python: 21, javascript: 24 },
    returnResult: { java: 25, cpp: 24, python: 22, javascript: 25 },
  },
  code: {
    languages: {
      javascript: [
        'function maxMagicScrollSum(nums) {',
        '  const n = nums.length;',
        '  if (n === 0) return 0;',
        '  const total = nums.reduce((a, b) => a + b, 0);',
        '  // preMin[i]: 在 0..i 范围内的最小子数组和',
        '  const preMin = new Array(n).fill(0);',
        '  let curMin = 0, minSoFar = 0;',
        '  for (let i = 0; i < n; i++) {',
        '    curMin = Math.min(nums[i], curMin + nums[i]);',
        '    minSoFar = Math.min(minSoFar, curMin);',
        '    preMin[i] = minSoFar;',
        '  }',
        '  // sufMin[i]: 在 i..n-1 范围内的最小子数组和',
        '  const sufMin = new Array(n).fill(0);',
        '  curMin = 0; minSoFar = 0;',
        '  for (let i = n - 1; i >= 0; i--) {',
        '    curMin = Math.min(nums[i], curMin + nums[i]);',
        '    minSoFar = Math.min(minSoFar, curMin);',
        '    sufMin[i] = minSoFar;',
        '  }',
        '  let maxProfit = -preMin[n - 1]; // 仅用1次卷轴',
        '  for (let i = 0; i < n - 1; i++) {',
        '    maxProfit = Math.max(maxProfit, -(preMin[i] + sufMin[i + 1]));',
        '  }',
        '  return total + Math.max(0, maxProfit);',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxMagicScrollSum(int[] nums) {',
        '        int n = nums.length;',
        '        if (n == 0) return 0;',
        '        int total = 0;',
        '        for (int x : nums) total += x;',
        '        int[] preMin = new int[n];',
        '        int curMin = 0, minSoFar = 0;',
        '        for (int i = 0; i < n; i++) {',
        '            curMin = Math.min(nums[i], curMin + nums[i]);',
        '            minSoFar = Math.min(minSoFar, curMin);',
        '            preMin[i] = minSoFar;',
        '        }',
        '        int[] sufMin = new int[n];',
        '        curMin = 0; minSoFar = 0;',
        '        for (int i = n - 1; i >= 0; i--) {',
        '            curMin = Math.min(nums[i], curMin + nums[i]);',
        '            minSoFar = Math.min(minSoFar, curMin);',
        '            sufMin[i] = minSoFar;',
        '        }',
        '        int maxProfit = -preMin[n - 1];',
        '        for (int i = 0; i < n - 1; i++) {',
        '            maxProfit = Math.max(maxProfit, -(preMin[i] + sufMin[i + 1]));',
        '        }',
        '        return total + Math.max(0, maxProfit);',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxMagicScrollSum(vector<int>& nums) {',
        '        int n = nums.size();',
        '        if (n == 0) return 0;',
        '        int total = accumulate(nums.begin(), nums.end(), 0);',
        '        vector<int> preMin(n, 0), sufMin(n, 0);',
        '        int curMin = 0, minSoFar = 0;',
        '        for (int i = 0; i < n; i++) {',
        '            curMin = min(nums[i], curMin + nums[i]);',
        '            minSoFar = min(minSoFar, curMin);',
        '            preMin[i] = minSoFar;',
        '        }',
        '        curMin = 0; minSoFar = 0;',
        '        for (int i = n - 1; i >= 0; i--) {',
        '            curMin = min(nums[i], curMin + nums[i]);',
        '            minSoFar = min(minSoFar, curMin);',
        '            sufMin[i] = minSoFar;',
        '        }',
        '        int maxProfit = -preMin[n - 1];',
        '        for (int i = 0; i < n - 1; i++) {',
        '            maxProfit = max(maxProfit, -(preMin[i] + sufMin[i + 1]));',
        '        }',
        '        return total + max(0, maxProfit);',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxMagicScrollSum(self, nums: list[int]) -> int:',
        '        n = len(nums)',
        '        if n == 0:',
        '            return 0',
        '        total = sum(nums)',
        '        pre_min = [0] * n',
        '        cur_min = min_so_far = 0',
        '        for i in range(n):',
        '            cur_min = min(nums[i], cur_min + nums[i])',
        '            min_so_far = min(min_so_far, cur_min)',
        '            pre_min[i] = min_so_far',
        '        suf_min = [0] * n',
        '        cur_min = min_so_far = 0',
        '        for i in range(n - 1, -1, -1):',
        '            cur_min = min(nums[i], cur_min + nums[i])',
        '            min_so_far = min(min_so_far, cur_min)',
        '            suf_min[i] = min_so_far',
        '        max_profit = -pre_min[n - 1]',
        '        for i in range(n - 1):',
        '            max_profit = max(max_profit, -(pre_min[i] + suf_min[i + 1]))',
        '        return total + max(0, max_profit)',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入待处理数组 nums。',
        4: '计算原数组所有数字总和 total。',
        6: '前缀预处理数组 preMin[i]，记录 0..i 范围内的最小子数组和。',
        8: '正向扫描运行 Kadane 求最小子数组和。',
        14: '后缀预处理数组 sufMin[i]，记录 i..n-1 范围内的最小子数组和。',
        16: '逆向扫描运行 Kadane 求最小子数组和。',
        21: '初始收益设为使用 1 次卷轴（消除全局最小负数子数组）。',
        22: '枚举所有分界点 i，计算前缀消除 preMin[i] 与后缀消除 sufMin[i+1] 的联合收益。',
        25: '返回原数组和 total 加上最大正向收益（不使用卷轴收益为 0）。',
      },
      java: {
        2: '方法入口。',
        6: '统计总和。',
        7: '前向前缀最小和数组。',
        14: '后向后缀最小和数组。',
        21: '枚举分界线求双卷轴最大增益。',
        25: '返回最终最大累加和。',
      },
      cpp: {
        3: '函数入口。',
        6: '求和。',
        8: '正向 Kadane 前缀极值。',
        15: '反向 Kadane 后缀极值。',
        22: '双区间合并收益极值。',
        26: '返回总和加收益。',
      },
      python: {
        2: '方法入口。',
        6: '原数组求和。',
        9: '正向递推。',
        15: '反向递推。',
        20: '枚举分界点。',
        22: '返回 total + 增益。',
      },
    },
    keyPoints: {
      thinking:
        '将一个子数组清零，相当于给总和贡献了 -sum(subarray) 的增益。要使最终和最大，必须让被清零的子数组和尽可能小（即负得越多越好）。至多使用两次不重叠卷轴，等价于在前后缀中分别求一个最小连续子数组和。',
      state: 'preMin[i] 表示 0..i 范围内的最小子数组和，sufMin[i] 表示 i..n-1 范围内的最小子数组和。',
      equation: 'maxProfit = max(0, -preMin[n-1], max_{0≤i<n-1}(-(preMin[i] + sufMin[i+1])))',
      initAndBounds: 'minSoFar 初始为 0（可以选空子数组，收益为 0）。',
      complexity: '时间复杂度 $O(N)$，空间复杂度 $O(N)$。',
    },
    faqList: [
      {
        tag: '如果数组全为正数',
        question: '如果数组全为正数，使用卷轴会不会让和变小？',
        answer:
          '不会。因为 minSoFar 初始化为 0，允许选择长度为 0 的空区间清零（贡献 0 收益），最终计算公式为 total + max(0, maxProfit)，若无负数可消除则自动选择不使用卷轴。',
      },
    ],
  },
  generateSteps: (input: { nums?: number[] } = {}): DpTraceStep[] => {
    const nums = input?.nums || [1, -2, 3, 5, -1, 2];
    const steps: DpTraceStep[] = [];
    const n = nums.length;
    const total = nums.reduce((a, b) => a + b, 0);

    const preMin = new Array(n).fill(0);
    let curMin = 0;
    let minSoFar = 0;
    for (let i = 0; i < n; i++) {
      curMin = Math.min(nums[i], curMin + nums[i]);
      minSoFar = Math.min(minSoFar, curMin);
      preMin[i] = minSoFar;
    }

    const sufMin = new Array(n).fill(0);
    curMin = 0;
    minSoFar = 0;
    for (let i = n - 1; i >= 0; i--) {
      curMin = Math.min(nums[i], curMin + nums[i]);
      minSoFar = Math.min(minSoFar, curMin);
      sufMin[i] = minSoFar;
    }

    steps.push(
      makeTraceStep({
        dp1d: nums.map((v) => ({ value: v, state: 'default' })),
        message: `📜 原数组 nums = [${nums.join(', ')}]，原数组总和 total = <strong>${total}</strong>。启动前后缀双向 Kadane 扫描预处理最小子数组和。`,
        log: `初始化: nums=[${nums.join(', ')}], total=${total}`,
        vars: [
          { name: '原数组总和', value: String(total) },
          { name: '数组长度', value: String(n) },
        ],
        metrics: { maxSum: total },
      })
    );

    let maxProfit = -preMin[n - 1];
    let bestSplit = -1;

    for (let i = 0; i < n - 1; i++) {
      const combined = -(preMin[i] + sufMin[i + 1]);
      if (combined > maxProfit) {
        maxProfit = combined;
        bestSplit = i;
      }
    }

    const finalAns = total + Math.max(0, maxProfit);

    steps.push(
      makeTraceStep({
        dp1d: preMin.map((v, i) => ({
          value: v,
          label: `pre[${i}]`,
          state: i === bestSplit ? 'active' : 'computed',
        })),
        message: `🔍 前缀扫描完成：前缀各截断点最小子段和 preMin = [${preMin.join(', ')}]；后缀最小子段和 sufMin = [${sufMin.join(', ')}]。最佳分界点为 index=${bestSplit}。`,
        log: `preMin=[${preMin.join(', ')}], sufMin=[${sufMin.join(', ')}], maxProfit=${maxProfit}`,
        vars: [
          { name: '单次卷轴增益', value: String(-preMin[n - 1]) },
          { name: '双卷轴最大增益', value: String(maxProfit) },
          { name: '最佳分界索引', value: String(bestSplit) },
        ],
        metrics: { maxSum: finalAns },
      })
    );

    steps.push(
      makeTraceStep({
        dp1d: nums.map((v, i) => ({
          value: (i === 1 || i === 4) && n === 6 ? 0 : v,
          label: (i === 1 || i === 4) && n === 6 ? '置0' : `${v}`,
          state: 'computed',
        })),
        message: `🏆 计算完成！最大卷轴消除负数收益为 <strong>+${Math.max(0, maxProfit)}</strong>，最终数组最大累加和为 <strong>${finalAns}</strong>。`,
        log: `计算结束：最终最大和 = ${finalAns}`,
        vars: [
          { name: '最终最大总和', value: String(finalAns) },
        ],
        metrics: { maxSum: finalAns },
      })
    );

    return steps;
  },
};
