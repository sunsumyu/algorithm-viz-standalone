import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const TargetSumSpec: AlgorithmSpec = {
  id: 'target-sum',
  name: '目标和 (Target Sum)',
  category: '背包 DP',
  description: '给你一个非负整数数组 nums 和一个整数 target 。向数组中的每个整数前添加 \'+\' 或 \'-\' ，然后串联起所有整数，可以构造一个表达式。返回可以通过上述方法构造的、运算结果等于 target 的不同表达式的数目。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 494,
    leetcodeUrl: 'https://leetcode.cn/problems/target-sum/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '回溯', '0-1背包'],
    description: '给你一个非负整数数组 <code>nums</code> 和一个整数 <code>target</code> 。<br/><br/>向数组中的每个整数前添加 <code>\'+\'</code> 或 <code>\'-\'</code> ，然后串联起所有整数，可以构造一个 <strong>表达式</strong> ：<br/><br/>例如，<code>nums = [2, 1]</code> ，可以在 <code>2</code> 之前添加 <code>\'+\'</code> ，在 <code>1</code> 之前添加 <code>\'-\'</code> ，然后串联起来得到表达式 <code>"+2-1"</code> 。<br/><br/>返回可以通过上述方法构造的、运算结果等于 <code>target</code> 的不同 <strong>表达式的数目</strong> 。<br/><br/><strong>数学转化</strong>：设正数和为 <code>P</code>，负数绝对值和为 <code>N</code>。则 <code>P - N = target</code> 且 <code>P + N = sum</code>，两式相加得 <code>2P = sum + target</code> $\Rightarrow$ <code>P = (sum + target) / 2</code>。即求解装满容量为 <code>(sum + target) / 2</code> 的 0-1 背包方案数！',
    examples: [
      {
        input: 'nums = [1, 1, 1, 1, 1], target = 3',
        output: '5',
        explanation: '一共有 5 种方法让最终目标和为 3：<br/>-1+1+1+1+1 = 3<br/>+1-1+1+1+1 = 3<br/>+1+1-1+1+1 = 3<br/>+1+1+1-1+1 = 3<br/>+1+1+1+1-1 = 3',
      },
      {
        input: 'nums = [1], target = 1',
        output: '1',
      },
    ],
    constraints: [
      '1 <= nums.length <= 20',
      '0 <= nums[i] <= 1000',
      '0 <= sum(nums[i]) <= 1000',
      '-1000 <= target <= 1000',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [6, 7], cpp: [6, 7], python: [5, 6], javascript: [5, 6] },
    loopCheck: { java: 8, cpp: 8, python: 7, javascript: 7 },
    innerLoopCheck: { java: 9, cpp: 9, python: 8, javascript: 8 },
    stateTransfer: {
      java: { primary: 10, context: [8, 9] },
      cpp: { primary: 10, context: [8, 9] },
      python: { primary: 9, context: [7, 8] },
      javascript: { primary: 9, context: [7, 8] },
    },
    loopExit: { java: 8, cpp: 8, python: 7, javascript: 7 },
    returnResult: { java: 13, cpp: 13, python: 11, javascript: 12 },
  },
  code: {
    languages: {
      javascript: [
        'function findTargetSumWays(nums, target) {',
        '    const sum = nums.reduce((a, b) => a + b, 0);',
        '    if (Math.abs(target) > sum || (sum + target) % 2 !== 0) return 0; // 无解快速返回',
        '    const bag = (sum + target) / 2;',
        '    const dp = new Array(bag + 1).fill(0);',
        '    dp[0] = 1; // 凑成容量 0 有 1 种方法（什么都不选）',
        '    for (let i = 0; i < nums.length; i++) { // 遍历物品',
        '        for (let j = bag; j >= nums[i]; j--) { // 倒序遍历容量',
        '            dp[j] += dp[j - nums[i]]; // 累加装满容量 j 的组合数',
        '        }',
        '    }',
        '    return dp[bag];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int findTargetSumWays(int[] nums, int target) {',
        '        int sum = 0;',
        '        for (int x : nums) sum += x;',
        '        if (Math.abs(target) > sum || (sum + target) % 2 != 0) return 0;',
        '        int bag = (sum + target) / 2;',
        '        int[] dp = new int[bag + 1];',
        '        dp[0] = 1;',
        '        for (int i = 0; i < nums.length; i++) {',
        '            for (int j = bag; j >= nums[i]; j--) {',
        '                dp[j] += dp[j - nums[i]];',
        '            }',
        '        }',
        '        return dp[bag];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int findTargetSumWays(vector<int>& nums, int target) {',
        '        int sum = accumulate(nums.begin(), nums.end(), 0);',
        '        if (abs(target) > sum || (sum + target) % 2 != 0) return 0;',
        '        int bag = (sum + target) / 2;',
        '        vector<int> dp(bag + 1, 0);',
        '        dp[0] = 1;',
        '        for (int i = 0; i < nums.size(); i++) {',
        '            for (int j = bag; j >= nums[i]; j--) {',
        '                dp[j] += dp[j - nums[i]];',
        '            }',
        '        }',
        '        return dp[bag];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def findTargetSumWays(self, nums: List[int], target: int) -> int:',
        '        total = sum(nums)',
        '        if abs(target) > total or (total + target) % 2 != 0: return 0',
        '        bag = (total + target) // 2',
        '        dp = [0] * (bag + 1)',
        '        dp[0] = 1',
        '        for num in nums:',
        '            for j in range(bag, num - 1, -1):',
        '                dp[j] += dp[j - num]',
        '        return dp[bag]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：计算添加正负号使运算结果等于 target 的表达式方案数。',
        2: '计算元素总和 sum。',
        3: '无解特判：若 |target| > sum 或 (sum + target) 为奇数，无论如何都凑不出整数解，直接返回 0。',
        4: '数学推导转化：正数子集和 bag = (sum + target) / 2。',
        5: '定义一维组合计数状态数组 dp[bag + 1]。',
        6: '初始化：dp[0] = 1（填满容量 0 只有 1 种选法：什么都不选）。',
        7: '外层循环：遍历数组元素 nums[i]。',
        8: '内层循环：容量 j 从 bag 到 nums[i] 倒序遍历（0-1 背包计数模型）。',
        9: '累加方案数：dp[j] += dp[j - nums[i]]。',
        12: '返回答案：dp[bag] 即为得到目标和的全部可能表达式总数。',
      },
      java: {
        2: '函数入口。',
        4: '求和。',
        5: '无解剪枝。',
        6: '背包容量 bag = (sum + target) / 2。',
        7: '开辟 dp 表。',
        8: 'dp[0] = 1。',
        9: '外层遍历 nums。',
        10: '倒序遍历容量。',
        11: '方案数加和转移。',
        14: '返回 dp[bag]。',
      },
      cpp: {
        3: '函数入口。',
        4: '求和与边界判断。',
        6: '计算正数子集容量。',
        7: '定义 dp 数组。',
        8: '基底初始化。',
        9: '双层循环遍历。',
        11: '加和转移。',
        14: '返回结果。',
      },
      python: {
        2: '函数入口。',
        3: '求总和与特判。',
        4: '计算 bag 容量。',
        5: '初始化列表。',
        6: 'dp[0] = 1。',
        7: '遍历元素。',
        8: '倒序遍历。',
        9: '累加方案。',
        10: '返回 dp[bag]。',
      },
    },
    keyPoints: {
      title: '🎯 目标和 (Target Sum) 5 步法系统精讲',
      summary: 'LeetCode 494。0-1 背包求装满容量的方案数。核心在于数学方程转化推导出 P = (sum + target) / 2！',
      points: [
        { label: '一、数学公式推导', desc: '正数集和 <code>P</code>，负数绝对值和 <code>N</code>：<br><code>P - N = target</code> 且 <code>P + N = sum</code> $\Rightarrow$ <code>P = (sum + target) / 2</code>。<br>问题完全等价于：从 nums 中挑选元素装满容量为 <code>P</code> 的背包有多少种方法。', icon: '🎯', badge: '代数推导' },
        { label: '二、状态定义与转移', desc: '<code>dp[j]</code>：装满容量为 <code>j</code> 的背包的方案数。<br>状态转移方程：<code>dp[j] += dp[j - nums[i]]</code>。', icon: '⚡', badge: '计数累加' },
        { label: '三、初始化与无解剪枝', desc: '• <code>dp[0] = 1</code>（装满容量 0 有 1 种方法）。<br>• 若 <code>|target| > sum</code> 或 <code>(sum + target) % 2 != 0</code> 直接返回 0。', icon: '🎬', badge: 'dp[0]=1' },
        { label: '四、遍历推导顺序', desc: '外层遍历物品，内层<strong>倒序</strong>遍历背包容量 <code>j 从 bag 到 nums[i]</code>。', icon: '🧭', badge: '倒序递推' },
        { label: '五、复杂度分析', desc: '• 时间复杂度：<code>O(nums.length × bag)</code>。<br>• 空间复杂度：<code>O(bag)</code>。', icon: '⏱️', badge: 'O(N*bag)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let nums: number[] = [1, 1, 1, 1, 1];
    let target = 3;

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.nums)) nums = input.nums;
      else if (typeof input.nums === 'string') nums = input.nums.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      else if (typeof input.s === 'string') nums = input.s.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));

      if (typeof input.target === 'number') target = input.target;
      else if (typeof input.t === 'number') target = input.t;
      else if (typeof input.targetInput === 'number') target = input.targetInput;
    }

    const sum = nums.reduce((a, b) => a + b, 0);
    const isValid = Math.abs(target) <= sum && (sum + target) % 2 === 0;
    const bag = isValid ? (sum + target) / 2 : -1;
    const cap = Math.max(0, bag);

    const dp: DpCell[] = Array(cap + 1).fill(0);
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
        { name: 'nums (输入数组)', value: `[${nums.join(', ')}]`, type: 'string' as const, changed: chSet.has('nums') },
        { name: 'target (目标和)', value: String(target), type: 'number' as const, changed: chSet.has('target') },
        { name: 'sum (总和)', value: String(sum), type: 'number' as const, changed: chSet.has('sum') },
        { name: 'bag (正数集容量)', value: String(bag), type: 'number' as const, changed: chSet.has('bag') },
        { name: 'i (当前元素)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'nums[i] (元素值)', value: String(numVal), type: (typeof numVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('num') },
        { name: 'j (当前容量)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'dp[j] (方案数)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpj') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: nums.map(String),
      message: `🎯 函数入口：目标和。nums = [${nums.join(', ')}]，target = ${target}。推导正数子集容量 bag = (${sum} + ${target}) / 2 = ${bag}。`,
      log: `entry: sum=${sum}, target=${target}, bag=${bag}`,
      vars: makeVars({ changed: ['nums', 'target', 'sum', 'bag'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    if (!isValid || bag < 0) {
      push({
        dp1d: clone1d(dp),
        source: nums.map(String),
        message: `❌ 快速剪枝：|target| > sum 或 (sum + target) 为奇数，无法整除为有效整数容量，直接返回 0。`,
        log: `invalid target: return 0`,
        vars: makeVars({}),
        codeLine: { java: 5, cpp: 5, python: 4, javascript: 3 },
      });
      return steps;
    }

    // Step 1: Init
    push({
      dp1d: clone1d(dp),
      source: nums.map(String),
      current: { index: 0 },
      message: `🎬 初始化：dp[0] = 1（凑出容量 0 有 1 种方案：什么都不选）。`,
      log: `init: dp[0] = 1`,
      vars: makeVars({ j: 0, curDp: 1, changed: ['dpj'] }),
      codeLine: { java: 8, cpp: 8, python: 6, javascript: 6 },
    });

    // Loops
    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];

      push({
        dp1d: clone1d(dp),
        source: nums.map(String),
        current: { index: num <= bag ? num : 0 },
        message: `🔄 外层循环：考察元素 nums[${i}] = ${num}。`,
        log: `outer loop: num=${num}`,
        vars: makeVars({ i, curNum: num, changed: ['i', 'num'] }),
        codeLine: { java: 9, cpp: 9, python: 7, javascript: 7 },
      });

      for (let j = bag; j >= num; j--) {
        const prev = dp[j - num] as number;
        const oldVal = dp[j] as number;
        dp[j] = oldVal + prev;

        push({
          dp1d: clone1d(dp),
          source: nums.map(String),
          current: { index: j },
          dependencies: [{ index: j - num }],
          formula: `dp[${j}] += dp[${j - num}] (${prev}) => ${dp[j]}`,
          message: `⚡ 状态累加：使用元素 ${num}，装满容量 ${j} 的方案数由 ${oldVal} 累加 ${prev} 变为 ${dp[j]}。`,
          log: `update: dp[${j}] += dp[${j - num}] = ${dp[j]}`,
          vars: makeVars({ i, j, curNum: num, curDp: dp[j], changed: ['dpj'] }),
          codeLine: {
            java: { primary: 10, context: [9] },
            cpp: { primary: 10, context: [9] },
            python: { primary: 9, context: [8] },
            javascript: { primary: 9, context: [8] },
          },
        });
      }
    }

    const ans = dp[bag] as number;
    push({
      dp1d: clone1d(dp),
      source: nums.map(String),
      current: { index: bag },
      message: `🏁 算法结束：装满正数集容量 ${bag} 共有 dp[${bag}] = ${ans} 种方法 $\rightarrow$ 运算结果等于 ${target} 的不同表达式总数为 ${ans}。`,
      log: `return: dp[${bag}] = ${ans}`,
      vars: makeVars({ j: bag, curDp: ans, changed: ['dpj'] }),
      codeLine: { java: 13, cpp: 13, python: 11, javascript: 12 },
    });

    return steps;
  },
};
