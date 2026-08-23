import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const HouseRobberIiSpec: AlgorithmSpec = {
  id: 'house-robber-ii',
  name: '打家劫舍 II (House Robber II)',
  category: '状态机 DP',
  description: '这个地方所有的房屋都围成一圈，这意味着第一个房屋和最后一个房屋是紧挨着的。同时相邻的房屋装有防盗系统。计算在不触动警报装置的情况下，能够偷窃到的最高金额。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 213,
    leetcodeUrl: 'https://leetcode.cn/problems/house-robber-ii/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '环形DP'],
    description: '你是一个专业的小偷，计划偷窃沿街的房屋，每间房内都藏有一定的现金。这个地方所有的房屋都 <strong>围成一圈</strong> ，这意味着第一个房屋和最后一个房屋是紧挨着的。<br/><br/>同时，相邻的房屋装有相互连通的防盗系统，<strong>如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警</strong>。<br/><br/><strong>破圈法核心思路</strong>：环形问题拆解为两个线性的子问题取最大值！<br/>• <strong>情况一（包含首不包含尾）</strong>：考虑下标区间 <code>[0, n - 2]</code>。<br/>• <strong>情况二（包含尾不包含首）</strong>：考虑下标区间 <code>[1, n - 1]</code>。',
    examples: [
      {
        input: 'nums = [2, 3, 2]',
        output: '3',
        explanation: '你不能先偷窃 1 号房屋（金额 = 2），然后偷窃 3 号房屋（金额 = 2）, 因为他们是相邻的。最大为偷窃 2 号房屋（金额 = 3）。',
      },
      {
        input: 'nums = [1, 2, 3, 1]',
        output: '4',
        explanation: '偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。总金额 = 1 + 3 = 4 。',
      },
    ],
    constraints: [
      '1 <= nums.length <= 100',
      '0 <= nums[i] <= 1000',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    guard: { java: [3, 4], cpp: [3, 4], python: [3, 4], javascript: [2, 3] },
    init: { java: 6, cpp: 6, python: 5, javascript: 5 },
    stateTransfer: {
      java: { primary: 7, context: [6] },
      cpp: { primary: 7, context: [6] },
      python: { primary: 6, context: [5] },
      javascript: { primary: 6, context: [5] },
    },
    returnResult: { java: 8, cpp: 8, python: 7, javascript: 7 },
  },
  code: {
    languages: {
      javascript: [
        'function rob(nums) {',
        '    const n = nums.length;',
        '    if (n === 0) return 0;',
        '    if (n === 1) return nums[0];',
        '    // 环形拆解为两个线性区间取最大值',
        '    return Math.max(robRange(nums, 0, n - 2), robRange(nums, 1, n - 1));',
        '}',
        '',
        'function robRange(nums, start, end) {',
        '    if (start === end) return nums[start];',
        '    let prev2 = nums[start], prev1 = Math.max(nums[start], nums[start + 1]);',
        '    for (let i = start + 2; i <= end; i++) {',
        '        const cur = Math.max(prev1, prev2 + nums[i]);',
        '        prev2 = prev1;',
        '        prev1 = cur;',
        '    }',
        '    return prev1;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int rob(int[] nums) {',
        '        int n = nums.length;',
        '        if (n == 0) return 0;',
        '        if (n == 1) return nums[0];',
        '        return Math.max(robRange(nums, 0, n - 2), robRange(nums, 1, n - 1));',
        '    }',
        '    private int robRange(int[] nums, int start, int end) {',
        '        if (start == end) return nums[start];',
        '        int prev2 = nums[start], prev1 = Math.max(nums[start], nums[start + 1]);',
        '        for (int i = start + 2; i <= end; i++) {',
        '            int cur = Math.max(prev1, prev2 + nums[i]);',
        '            prev2 = prev1;',
        '            prev1 = cur;',
        '        }',
        '        return prev1;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int rob(vector<int>& nums) {',
        '        int n = nums.size();',
        '        if (n == 0) return 0;',
        '        if (n == 1) return nums[0];',
        '        return max(robRange(nums, 0, n - 2), robRange(nums, 1, n - 1));',
        '    }',
        '    int robRange(vector<int>& nums, int start, int end) {',
        '        if (start == end) return nums[start];',
        '        int prev2 = nums[start], prev1 = max(nums[start], nums[start + 1]);',
        '        for (int i = start + 2; i <= end; i++) {',
        '            int cur = max(prev1, prev2 + nums[i]);',
        '            prev2 = prev1;',
        '            prev1 = cur;',
        '        }',
        '        return prev1;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def rob(self, nums: List[int]) -> int:',
        '        if not nums: return 0',
        '        if len(nums) == 1: return nums[0]',
        '        return max(self.robRange(nums, 0, len(nums) - 2), self.robRange(nums, 1, len(nums) - 1))',
        '',
        '    def robRange(self, nums: List[int], start: int, end: int) -> int:',
        '        if start == end: return nums[start]',
        '        prev2, prev1 = nums[start], max(nums[start], nums[start + 1])',
        '        for i in range(start + 2, end + 1):',
        '            prev2, prev1 = prev1, max(prev1, prev2 + nums[i])',
        '        return prev1',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：求解环形房屋最大偷窃金额。',
        2: '获取房屋数量 n。',
        3: '空数组保护。',
        4: '单间房屋直接偷走 nums[0]。',
        6: '核心破圈：取【包含首间房不包含尾房 [0..n-2]】与【包含尾房不包含首房 [1..n-1]】的较大值。',
        9: '区间线性打家劫舍辅助函数 robRange。',
        11: '滚动变量 prev2, prev1 初始化。',
        12: '遍历区间房屋进行常规二选一状态转移。',
        17: '返回区间最优值。',
      },
      java: {
        2: '函数入口。',
        4: '单元素特判。',
        6: '双区间求 max。',
        8: 'robRange 辅助方法。',
        12: '区间转移计算。',
        17: '返回区间答案。',
      },
      cpp: {
        3: '函数入口。',
        5: '特判。',
        6: '双区间求最大。',
        8: 'robRange 实现。',
        12: '递推循环。',
        16: '返回最优值。',
      },
      python: {
        2: '函数入口。',
        4: '单间特判。',
        5: '双区间 max。',
        7: 'robRange 方法。',
        9: '区间状态转移。',
        11: '返回结果。',
      },
    },
    keyPoints: {
      title: '🎯 打家劫舍 II (环形破圈) 5 步法系统精讲',
      summary: 'LeetCode 213。环形结构破局关键：首尾相连导致首尾不能同时被偷。因此直接化环为链，拆分为两个线性的「打家劫舍 I」问题取最大值！',
      points: [
        { label: '一、环形破局 (化环为链)', desc: '• <strong>区间一 <code>[0, n-2]</code></strong>：考虑首房，绝不考虑尾房。<br>• <strong>区间二 <code>[1, n-1]</code></strong>：考虑尾房，绝不考虑首房。', icon: '🎯', badge: '破圈双区间' },
        { label: '二、状态转移方程', desc: '在每个线性子区间内：<code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>。', icon: '⚡', badge: '线性复用' },
        { label: '三、初始化与单间特判', desc: '<code>if (n === 1) return nums[0];</code>（只有 1 间房时不存在环形冲突）。', icon: '🎬', badge: '单间特判' },
        { label: '四、时空复杂度', desc: '• 时间复杂度：<code>O(n)</code>（两次线性遍历）。<br>• 空间复杂度：<code>O(1)</code>（常数级变量）。', icon: '⏱️', badge: 'O(n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let nums: number[] = [2, 3, 2];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.nums)) nums = input.nums;
      else if (typeof input.nums === 'string') nums = input.nums.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    }

    const n = nums.length;
    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      stage?: string;
      range?: string;
      curAns1?: number | string;
      curAns2?: number | string;
      curMax?: number | string;
      changed?: string[];
    }) => {
      const st = opts.stage ?? '-';
      const rg = opts.range ?? '-';
      const a1 = opts.curAns1 ?? '-';
      const a2 = opts.curAns2 ?? '-';
      const mx = opts.curMax ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'nums (环形房屋)', value: `[${nums.join(', ')}]`, type: 'string' as const, changed: chSet.has('nums') },
        { name: 'n (房屋总数)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: '当前计算阶段', value: st, type: 'string' as const, changed: chSet.has('st') },
        { name: '当前破圈区间', value: rg, type: 'string' as const, changed: chSet.has('rg') },
        { name: '方案一最优值 [0..n-2]', value: String(a1), type: (typeof a1 === 'number' ? 'number' : 'string') as any, changed: chSet.has('a1') },
        { name: '方案二最优值 [1..n-1]', value: String(a2), type: (typeof a2 === 'number' ? 'number' : 'string') as any, changed: chSet.has('a2') },
        { name: '全局最优金额', value: String(mx), type: (typeof mx === 'number' ? 'number' : 'string') as any, changed: chSet.has('mx') },
      ];
    };

    // Step 0: Entry
    push({
      source: nums.map((v, idx) => `房${idx}($${v})`),
      message: `🎯 函数入口：打家劫舍 II（环形）。首尾房 0 与 ${n - 1} 环形相邻，不可同时被偷。采用【化环为链破圈法】。`,
      log: `entry: nums=[${nums.join(',')}]`,
      vars: makeVars({ stage: '入口准备', changed: ['nums', 'n', 'st'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    if (n === 1) {
      push({
        source: nums.map((v, idx) => `房${idx}($${v})`),
        current: { index: 0 },
        message: `🏁 只有 1 间房：直接偷走 nums[0] = $${nums[0]}。`,
        log: `only one: ans=${nums[0]}`,
        vars: makeVars({ curMax: nums[0], changed: ['mx'] }),
        codeLine: { java: 4, cpp: 4, python: 4, javascript: 4 },
      });
      return steps;
    }

    // Phase 1: Range [0 .. n-2]
    const range1 = nums.slice(0, n - 1);
    const dp1: DpCell[] = Array(range1.length).fill(0);
    dp1[0] = range1[0];
    if (range1.length > 1) dp1[1] = Math.max(range1[0], range1[1]);
    for (let i = 2; i < range1.length; i++) {
      dp1[i] = Math.max(dp1[i - 1] as number, (dp1[i - 2] as number) + range1[i]);
    }
    const ans1 = dp1[range1.length - 1] as number;

    push({
      dp1d: clone1d(dp1),
      source: range1.map((v, idx) => `房${idx}($${v})`),
      message: `🎬 阶段一【包含首房，放弃尾房】：考察区间 [0 .. ${n - 2}]，线性 DP 求得最优值 = $${ans1}。`,
      log: `range [0..${n-2}]: ans1=${ans1}`,
      vars: makeVars({ stage: '阶段一 [0..n-2]', range: `[0..${n - 2}]`, curAns1: ans1, curMax: ans1, changed: ['st', 'rg', 'a1', 'mx'] }),
      codeLine: { java: 6, cpp: 6, python: 5, javascript: 6 },
    });

    // Phase 2: Range [1 .. n-1]
    const range2 = nums.slice(1);
    const dp2: DpCell[] = Array(range2.length).fill(0);
    dp2[0] = range2[0];
    if (range2.length > 1) dp2[1] = Math.max(range2[0], range2[1]);
    for (let i = 2; i < range2.length; i++) {
      dp2[i] = Math.max(dp2[i - 1] as number, (dp2[i - 2] as number) + range2[i]);
    }
    const ans2 = dp2[range2.length - 1] as number;

    push({
      dp1d: clone1d(dp2),
      source: range2.map((v, idx) => `房${idx + 1}($${v})`),
      message: `🎬 阶段二【包含尾房，放弃首房】：考察区间 [1 .. ${n - 1}]，线性 DP 求得最优值 = $${ans2}。`,
      log: `range [1..${n-1}]: ans2=${ans2}`,
      vars: makeVars({ stage: '阶段二 [1..n-1]', range: `[1..${n - 1}]`, curAns1: ans1, curAns2: ans2, curMax: Math.max(ans1, ans2), changed: ['st', 'rg', 'a2', 'mx'] }),
      codeLine: { java: 6, cpp: 6, python: 5, javascript: 6 },
    });

    const finalAns = Math.max(ans1, ans2);
    push({
      source: nums.map((v, idx) => `房${idx}($${v})`),
      message: `🏁 算法结束：两方案取最大值 Math.max(${ans1}, ${ans2}) = $${finalAns}。`,
      log: `return: max(${ans1}, ${ans2}) = ${finalAns}`,
      vars: makeVars({ stage: '计算结束', curAns1: ans1, curAns2: ans2, curMax: finalAns, changed: ['st', 'mx'] }),
      codeLine: { java: 6, cpp: 6, python: 5, javascript: 6 },
    });

    return steps;
  },
};
