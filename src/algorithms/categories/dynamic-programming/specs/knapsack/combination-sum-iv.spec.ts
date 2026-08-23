import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const CombinationSumIvSpec: AlgorithmSpec = {
  id: 'combination-sum-iv',
  name: '组合总和 Ⅳ (Combination Sum IV)',
  category: '背包 DP',
  description: '给你一个由 不同 整数组成的数组 nums 和一个目标整数 target 。请你从 nums 中找出并返回总和为 target 的元素组合的个数（不同序列视为不同组合，即求排列数）。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 377,
    leetcodeUrl: 'https://leetcode.cn/problems/combination-sum-iv/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '完全背包', '排列数'],
    description: '给你一个由 <strong>不同</strong> 整数组成的数组 <code>nums</code> ，和一个目标整数 <code>target</code> 。请你从 <code>nums</code> 中找出并返回总和为 <code>target</code> 的元素组合的个数。<br/><br/>题目数据保证答案符合 32 位整数范围。<br/><br/><strong>关键提示</strong>：虽然题目名称叫「组合总和 Ⅳ」，但由于 <strong>顺序不同被视为不同组合</strong>（如 (1, 1, 2) 和 (1, 2, 1) 不同），因此本质上是求解 <strong>完全背包排列数</strong>！',
    examples: [
      {
        input: 'nums = [1, 2, 3], target = 4',
        output: '7',
        explanation: '所有可能的组合为：<br/>(1, 1, 1, 1)<br/>(1, 1, 2)<br/>(1, 2, 1)<br/>(1, 3)<br/>(2, 1, 1)<br/>(2, 2)<br/>(3, 1)<br/>共有 7 种。',
      },
      {
        input: 'nums = [9], target = 3',
        output: '0',
      },
    ],
    constraints: [
      '1 <= nums.length <= 200',
      '1 <= nums[i] <= 1000',
      'nums 中的所有元素 互不相同',
      '1 <= target <= 1000',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: 4, cpp: 4, python: 3, javascript: 3 },
    loopCheck: { java: 5, cpp: 5, python: 4, javascript: 4 },
    innerLoopCheck: { java: 6, cpp: 6, python: 5, javascript: 5 },
    stateTransfer: {
      java: { primary: 7, context: [5, 6] },
      cpp: { primary: 7, context: [5, 6] },
      python: { primary: 6, context: [4, 5] },
      javascript: { primary: 6, context: [4, 5] },
    },
    loopExit: { java: 5, cpp: 5, python: 4, javascript: 4 },
    returnResult: { java: 11, cpp: 11, python: 8, javascript: 10 },
  },
  code: {
    languages: {
      javascript: [
        'function combinationSum4(nums, target) {',
        '    const dp = new Array(target + 1).fill(0);',
        '    dp[0] = 1; // 容量为 0 的排列数为 1（空排列）',
        '    for (let i = 1; i <= target; i++) { // 外层遍历容量（求排列数：先容量后物品）',
        '        for (let j = 0; j < nums.length; j++) { // 内层遍历物品',
        '            if (i >= nums[j]) {',
        '                dp[i] += dp[i - nums[j]];',
        '            }',
        '        }',
        '    }',
        '    return dp[target];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int combinationSum4(int[] nums, int target) {',
        '        int[] dp = new int[target + 1];',
        '        dp[0] = 1;',
        '        for (int i = 1; i <= target; i++) {',
        '            for (int j = 0; j < nums.length; j++) {',
        '                if (i >= nums[j]) {',
        '                    dp[i] += dp[i - nums[j]];',
        '                }',
        '            }',
        '        }',
        '        return dp[target];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int combinationSum4(vector<int>& nums, int target) {',
        '        vector<uint64_t> dp(target + 1, 0);',
        '        dp[0] = 1;',
        '        for (int i = 1; i <= target; i++) {',
        '            for (int x : nums) {',
        '                if (i >= x && dp[i] + dp[i - x] < INT_MAX) {',
        '                    dp[i] += dp[i - x];',
        '                }',
        '            }',
        '        }',
        '        return dp[target];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def combinationSum4(self, nums: List[int], target: int) -> int:',
        '        dp = [0] * (target + 1)',
        '        dp[0] = 1',
        '        for i in range(1, target + 1):',
        '            for num in nums:',
        '                if i >= num:',
        '                    dp[i] += dp[i - num]',
        '        return dp[target]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：求解凑成 target 的有序排列总数。',
        2: '开辟一维状态数组 dp[target + 1]。',
        3: '初始化：dp[0] = 1（空排列方案数为 1）。',
        4: '外层遍历容量 i：从 1 到 target（排列问题必须先遍历背包容量）。',
        5: '内层遍历物品 nums[j]：每个位置都可以尝试放入任意合法物品。',
        6: '容量足够判定：当前容量 i >= nums[j]。',
        7: '排列数累加：dp[i] += dp[i - nums[j]]。',
        10: '返回 dp[target]。',
      },
      java: {
        2: '函数入口。',
        4: '初始化 dp 表。',
        5: '外层遍历背包容量。',
        6: '内层遍历物品。',
        7: '累加排列数。',
        11: '返回 dp[target]。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 向量。',
        6: '外层遍历容量。',
        7: '内层遍历物品。',
        9: '累加排列数。',
        13: '返回答案。',
      },
      python: {
        2: '函数入口。',
        3: '初始化列表。',
        4: 'dp[0] = 1。',
        5: '外层遍历容量。',
        6: '内层遍历数字。',
        7: '累加状态。',
        8: '返回结果。',
      },
    },
    keyPoints: {
      title: '🎯 组合总和 Ⅳ 5 步法系统精讲',
      summary: 'LeetCode 377。完全背包求排列数。灵魂所在：外层遍历背包容量，内层遍历物品！这与零钱兑换 II（先物品后容量求组合数）形成了最经典的对比！',
      points: [
        { label: '一、排列 vs 组合铁律', desc: '• <strong>组合数（零钱兑换 II）</strong>：外层物品，内层容量（物品添加顺序唯一）。<br>• <strong>排列数（组合总和 Ⅳ）</strong>：外层容量，内层物品（每一阶段物品均可重复尝试作为末尾元素）。', icon: '🎯', badge: '先容量后物品' },
        { label: '二、状态转移方程', desc: '<code>dp[i] += dp[i - num]</code>（当 <code>i >= num</code>）。', icon: '⚡', badge: '排列累加' },
        { label: '三、初始化', desc: '<code>dp[0] = 1</code>，其余为 0。', icon: '🎬', badge: 'dp[0]=1' },
        { label: '四、复杂度分析', desc: '• 时间复杂度：<code>O(target × nums.length)</code>。<br>• 空间复杂度：<code>O(target)</code>。', icon: '⏱️', badge: 'O(target*N)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let nums: number[] = [1, 2, 3];
    let target = 4;

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.nums)) nums = input.nums;
      else if (typeof input.nums === 'string') nums = input.nums.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));

      if (typeof input.target === 'number') target = input.target;
      else if (typeof input.t === 'number') target = input.t;
    }

    const dp: DpCell[] = Array(target + 1).fill(0);
    dp[0] = 1;

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      curNum?: number | string;
      curDp?: DpCell | number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const numVal = opts.curNum ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'nums (元素集)', value: `[${nums.join(', ')}]`, type: 'string' as const, changed: chSet.has('nums') },
        { name: 'target (目标和)', value: String(target), type: 'number' as const, changed: chSet.has('target') },
        { name: 'i (当前容量)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (元素下标)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'nums[j] (当前元素)', value: String(numVal), type: (typeof numVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('num') },
        { name: 'dp[i] (排列数)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: nums.map(String),
      message: `🎯 函数入口：组合总和 Ⅳ。nums = [${nums.join(', ')}]，求组成目标和 ${target} 的有序排列数。`,
      log: `entry: nums=[${nums.join(',')}], target=${target}`,
      vars: makeVars({ changed: ['nums', 'target'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Init
    push({
      dp1d: clone1d(dp),
      source: nums.map(String),
      current: { index: 0 },
      message: `🎬 初始化：dp[0] = 1（空排列方案数为 1）。`,
      log: `init: dp[0] = 1`,
      vars: makeVars({ i: 0, curDp: 1, changed: ['dpi'] }),
      codeLine: { java: 4, cpp: 4, python: 3, javascript: 3 },
    });

    // Loops (完全背包排列数: 外层容量 i 从 1 到 target, 内层 nums)
    for (let i = 1; i <= target; i++) {
      push({
        dp1d: clone1d(dp),
        source: nums.map(String),
        current: { index: i },
        message: `🔄 外层循环：当前背包容量 i = ${i}（先容量后物品，推导有序排列）。`,
        log: `outer loop: cap=${i}`,
        vars: makeVars({ i, curDp: dp[i], changed: ['i'] }),
        codeLine: { java: 5, cpp: 5, python: 4, javascript: 4 },
      });

      for (let j = 0; j < nums.length; j++) {
        const num = nums[j];
        if (i >= num) {
          const prev = dp[i - num] as number;
          const oldVal = dp[i] as number;
          dp[i] = oldVal + prev;

          push({
            dp1d: clone1d(dp),
            source: nums.map(String),
            current: { index: i },
            dependencies: [{ index: i - num }],
            formula: `dp[${i}] += dp[${i - num}] (${prev}) => ${dp[i]}`,
            message: `⚡ 排列累加：以数字 ${num} 作为序列结尾，dp[${i}] 由 ${oldVal} 累加 ${prev} 变为 ${dp[i]} 种排列。`,
            log: `update: dp[${i}] += dp[${i - num}] = ${dp[i]}`,
            vars: makeVars({ i, j, curNum: num, curDp: dp[i], changed: ['dpi', 'num'] }),
            codeLine: {
              java: { primary: 7, context: [5, 6] },
              cpp: { primary: 7, context: [5, 6] },
              python: { primary: 6, context: [4, 5] },
              javascript: { primary: 6, context: [4, 5] },
            },
          });
        }
      }
    }

    const ans = dp[target] as number;
    push({
      dp1d: clone1d(dp),
      source: nums.map(String),
      current: { index: target },
      message: `🏁 算法结束：凑成目标和 ${target} 共有 dp[${target}] = ${ans} 种不同排列。`,
      log: `return: dp[${target}] = ${ans}`,
      vars: makeVars({ i: target, curDp: ans, changed: ['dpi'] }),
      codeLine: { java: 11, cpp: 11, python: 8, javascript: 10 },
    });

    return steps;
  },
};
