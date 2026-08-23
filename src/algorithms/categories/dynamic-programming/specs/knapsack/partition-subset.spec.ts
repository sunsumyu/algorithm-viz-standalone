import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const PartitionSubsetSpec: AlgorithmSpec = {
  id: 'partition-equal-subset-sum',
  name: '分割等和子集 (Partition Equal Subset Sum)',
  category: '背包 DP',
  description: '给你一个只包含正整数的非空数组 nums 。请你判断是否可以将这个数组分割成两个子集，使得两个子集的元素和相等。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 416,
    leetcodeUrl: 'https://leetcode.cn/problems/partition-equal-subset-sum/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '0-1背包'],
    description: '给你一个 <strong>只包含正整数</strong> 的 <strong>非空</strong> 数组 <code>nums</code> 。请你判断是否可以将这个数组分割成两个子集，使得两个子集的元素和相等。<br/><br/><strong>等价转化</strong>：判断是否能从 <code>nums</code> 中选出若干元素，使其总和恰好等于 <code>sum / 2</code>（0-1 背包问题）。',
    examples: [
      {
        input: 'nums = [1, 5, 11, 5]',
        output: 'true',
        explanation: '数组可以分割成 [1, 5, 5] 和 [11]，两者之和均为 11。',
      },
      {
        input: 'nums = [1, 2, 3, 5]',
        output: 'false',
        explanation: '数组总和为 11（奇数），无法分割成两个和相等的整数子集。',
      },
    ],
    constraints: [
      '1 <= nums.length <= 200',
      '1 <= nums[i] <= 100',
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
        'function canPartition(nums) {',
        '    const sum = nums.reduce((a, b) => a + b, 0);',
        '    if (sum % 2 !== 0) return false; // 奇数和无法平分',
        '    const target = sum / 2;',
        '    const dp = new Array(target + 1).fill(0); // dp[j] 表示容量 j 下的最大数值和',
        '    for (let i = 0; i < nums.length; i++) { // 遍历物品',
        '        for (let j = target; j >= nums[i]; j--) { // 倒序遍历容量（0-1背包）',
        '            dp[j] = Math.max(dp[j], dp[j - nums[i]] + nums[i]);',
        '        }',
        '    }',
        '    return dp[target] === target;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public boolean canPartition(int[] nums) {',
        '        int sum = 0;',
        '        for (int x : nums) sum += x;',
        '        if (sum % 2 != 0) return false;',
        '        int target = sum / 2;',
        '        int[] dp = new int[target + 1];',
        '        for (int i = 0; i < nums.length; i++) {',
        '            for (int j = target; j >= nums[i]; j--) {',
        '                dp[j] = Math.max(dp[j], dp[j - nums[i]] + nums[i]);',
        '            }',
        '        }',
        '        return dp[target] == target;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    bool canPartition(vector<int>& nums) {',
        '        int sum = accumulate(nums.begin(), nums.end(), 0);',
        '        if (sum % 2 != 0) return false;',
        '        int target = sum / 2;',
        '        vector<int> dp(target + 1, 0);',
        '        for (int i = 0; i < nums.size(); i++) {',
        '            for (int j = target; j >= nums[i]; j--) {',
        '                dp[j] = max(dp[j], dp[j - nums[i]] + nums[i]);',
        '            }',
        '        }',
        '        return dp[target] == target;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def canPartition(self, nums: List[int]) -> bool:',
        '        total = sum(nums)',
        '        if total % 2 != 0: return False',
        '        target = total // 2',
        '        dp = [0] * (target + 1)',
        '        for num in nums:',
        '            for j in range(target, num - 1, -1):',
        '                dp[j] = max(dp[j], dp[j - num] + num)',
        '        return dp[target] == target',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：判断数组 nums 是否能划分为等和两子集。',
        2: '求元素总和 sum。',
        3: '奇偶判断：若 sum 为奇数则无论如何都无法平分，直接返回 false。',
        4: '目标容量确定：target = sum / 2。',
        5: '开辟一维滚动数组：dp[j] 存储容量 j 能装入的最大元素和。',
        6: '外层循环：遍历数组元素 nums[i]。',
        7: '内层循环：容量从 target 到 nums[i] 倒序遍历（0-1 背包防止重复选取）。',
        8: '状态转移：dp[j] = Math.max(dp[j], dp[j - nums[i]] + nums[i])。',
        11: '返回判定：若最大可装和 dp[target] 恰好等于 target，说明能够完全填满，返回 true。',
      },
      java: {
        2: '函数入口。',
        4: '求总和。',
        5: '奇数和特判。',
        6: '目标容量 target = sum / 2。',
        7: '初始化 dp 数组。',
        8: '遍历元素。',
        9: '倒序遍历容量。',
        10: '0-1背包转移。',
        13: '返回 dp[target] == target。',
      },
      cpp: {
        3: '函数入口。',
        4: '求和与奇数特判。',
        6: '确定 target。',
        7: '开辟 dp 表。',
        8: '双层循环遍历。',
        10: '状态转移。',
        13: '返回判定。',
      },
      python: {
        2: '函数入口。',
        3: '计算总和。',
        4: '奇偶特判。',
        5: '计算 target。',
        6: '初始化列表。',
        7: '外层遍历。',
        8: '倒序遍历。',
        9: '状态转移。',
        10: '返回结果。',
      },
    },
    keyPoints: {
      title: '🎯 分割等和子集 5 步法系统精讲',
      summary: 'LeetCode 416 经典 0-1 背包应用题。将「等和子集」转化为「背包容量为 sum/2 的 0-1 背包能否恰好装满」！',
      points: [
        { label: '一、问题模型转化', desc: '求两子集和相等 $\Leftrightarrow$ 选取若干元素和恰好为 <code>sum / 2</code>。背包容量为 <code>target = sum / 2</code>，物品重量和价值均为 <code>nums[i]</code>。', icon: '🎯', badge: '等和转化' },
        { label: '二、状态转移方程', desc: '<code>dp[j] = max(dp[j], dp[j - nums[i]] + nums[i])</code>。', icon: '⚡', badge: '0-1背包模型' },
        { label: '三、初始化与边界条件', desc: '若 <code>sum % 2 !== 0</code> 直接返回 <code>false</code>。<code>dp</code> 数组全初始化为 0。', icon: '🎬', badge: '奇偶剪枝' },
        { label: '四、遍历推导顺序', desc: '外层遍历物品，内层<strong>倒序</strong>遍历容量 <code>j 从 target 到 nums[i]</code>。', icon: '🧭', badge: '倒序遍历容量' },
        { label: '五、判断标准', desc: '最后检查 <code>dp[target] === target</code> 是否成立。', icon: '⏱️', badge: '恰好装满' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let nums: number[] = [1, 5, 11, 5];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.nums)) nums = input.nums;
      else if (typeof input.nums === 'string') nums = input.nums.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      else if (typeof input.s === 'string') nums = input.s.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    }

    const sum = nums.reduce((a, b) => a + b, 0);
    const isOdd = sum % 2 !== 0;
    const target = isOdd ? Math.floor(sum / 2) : sum / 2;

    const dp: DpCell[] = Array(target + 1).fill(0);
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
        { name: 'sum (总和)', value: String(sum), type: 'number' as const, changed: chSet.has('sum') },
        { name: 'target (目标容量)', value: String(target), type: 'number' as const, changed: chSet.has('target') },
        { name: 'i (当前元素下标)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'nums[i] (元素值)', value: String(numVal), type: (typeof numVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('num') },
        { name: 'j (当前容量)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'dp[j] (当前最大和)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpj') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: nums.map(String),
      message: `🎯 函数入口：nums = [${nums.join(', ')}]，总和 sum = ${sum}。${isOdd ? '【总和为奇数，无法分割为等和整数子集】' : `目标背包容量 target = ${target}。`}`,
      log: `entry: sum=${sum}, target=${target}`,
      vars: makeVars({ changed: ['nums', 'sum', 'target'] }),
      thematicMeta: {
        type: 'knapsack',
        knapsack: {
          capacity: target,
          currentCapacity: 0,
          items: nums.map((v, idx) => ({ id: idx, name: `${v}`, weight: v, value: v })),
          action: 'idle',
        },
      },
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    if (isOdd) {
      push({
        dp1d: clone1d(dp),
        source: nums.map(String),
        message: `❌ 快速剪枝：总和 ${sum} 为奇数，无法等分，直接返回 false。`,
        log: `odd sum: return false`,
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
      message: `🎬 初始化：dp 数组全部置 0，目标凑成容量为 ${target} 的背包。`,
      log: `init: dp[0..${target}] = 0`,
      vars: makeVars({ curDp: 0, changed: ['dpj'] }),
      codeLine: { java: 7, cpp: 7, python: 6, javascript: 5 },
    });

    // Loops (0-1 背包: 外层 nums, 内层 j 从 target 到 num 倒序)
    for (let i = 0; i < nums.length; i++) {
      const num = nums[i];

      push({
        dp1d: clone1d(dp),
        source: nums.map(String),
        current: { index: num <= target ? num : 0 },
        message: `🔄 外层循环：考察元素 nums[${i}] = ${num}（重量与价值均为 ${num}）。`,
        log: `outer loop: num=${num}`,
        vars: makeVars({ i, curNum: num, changed: ['i', 'num'] }),
        thematicMeta: {
          type: 'knapsack',
          knapsack: {
            capacity: target,
            currentItemIndex: i,
            action: 'evaluate',
          },
        },
        codeLine: { java: 8, cpp: 8, python: 7, javascript: 6 },
      });

      for (let j = target; j >= num; j--) {
        const notTake = (dp[j] as number) || 0;
        const take = ((dp[j - num] as number) || 0) + num;
        const nextVal = Math.max(notTake, take);
        dp[j] = nextVal;

        const isTakeWinner = take > notTake;
        push({
          dp1d: clone1d(dp),
          source: nums.map(String),
          current: { index: j },
          dependencies: [{ index: j - num }],
          formula: `dp[${j}] = max(不放:${notTake}, 放入:${take}) = ${nextVal}`,
          message: isTakeWinner
            ? `⚡ 状态转移 (放入 ${num})：容量 ${j} 下获得更大元素和 dp[${j}] = ${nextVal}。`
            : `⏩ 状态保持：不放入 ${num}，保持 dp[${j}] = ${notTake}。`,
          log: `update: dp[${j}] = ${nextVal}`,
          vars: makeVars({ i, j, curNum: num, curDp: nextVal, changed: isTakeWinner ? ['dpj'] : [] }),
          thematicMeta: {
            type: 'knapsack',
            knapsack: {
              capacity: target,
              currentCapacity: nextVal,
              currentItemIndex: i,
              action: isTakeWinner ? 'include' : 'exclude',
            },
          },
          codeLine: {
            java: { primary: 10, context: [8, 9] },
            cpp: { primary: 10, context: [8, 9] },
            python: { primary: 9, context: [7, 8] },
            javascript: { primary: 8, context: [6, 7] },
          },
        });
      }
    }

    const canPartition = dp[target] === target;
    push({
      dp1d: clone1d(dp),
      source: nums.map(String),
      current: { index: target },
      message: canPartition
        ? `🎉 算法结束：dp[${target}] = ${dp[target]} 恰好填满目标容量 ${target} $\rightarrow$ 【可以分割为等和子集 (true)】！`
        : `❌ 算法结束：dp[${target}] = ${dp[target]} 无法达到目标容量 ${target} $\rightarrow$ 【无法分割为等和子集 (false)】。`,
      log: `return: dp[${target}]==${target} => ${canPartition}`,
      vars: makeVars({ j: target, curDp: dp[target], changed: ['dpj'] }),
      thematicMeta: {
        type: 'knapsack',
        knapsack: {
          capacity: target,
          currentCapacity: dp[target] as number,
          action: canPartition ? 'include' : 'idle',
        },
      },
      codeLine: { java: 13, cpp: 13, python: 11, javascript: 11 },
    });

    return steps;
  },
};
