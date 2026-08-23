import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const HouseRobberSpec: AlgorithmSpec = {
  id: 'house-robber',
  name: '打家劫舍 (House Robber)',
  category: '状态机 DP',
  description: '你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。计算在不触动警报装置的情况下，一夜之内能够偷窃到的最高金额。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 198,
    leetcodeUrl: 'https://leetcode.cn/problems/house-robber/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '状态机DP'],
    description: '你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，<strong>如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警</strong>。<br/><br/>给定一个代表每个房屋存放金额的非负整数数组，计算你 <strong>不触动警报装置的情况下</strong> ，一夜之内能够偷窃到的最高金额。',
    examples: [
      {
        input: 'nums = [1, 2, 3, 1]',
        output: '4',
        explanation: '偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。偷窃到的最高金额 = 1 + 3 = 4 。',
      },
      {
        input: 'nums = [2, 7, 9, 3, 1]',
        output: '12',
        explanation: '偷窃 1 号房屋 (金额 = 2), 偷窃 3 号房屋 (金额 = 9)，接着偷窃 5 号房屋 (金额 = 1)。偷窃到的最高金额 = 2 + 9 + 1 = 12 。',
      },
    ],
    constraints: [
      '1 <= nums.length <= 100',
      '0 <= nums[i] <= 400',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    guard: { java: [3, 4], cpp: [3, 4], python: [3, 4], javascript: [2, 3] },
    init: { java: [6, 7], cpp: [6, 7], python: [5, 6], javascript: [5, 6] },
    loopCheck: { java: 8, cpp: 8, python: 7, javascript: 7 },
    stateTransfer: {
      java: { primary: 9, context: [8] },
      cpp: { primary: 9, context: [8] },
      python: { primary: 8, context: [7] },
      javascript: { primary: 8, context: [7] },
    },
    loopExit: { java: 8, cpp: 8, python: 7, javascript: 7 },
    returnResult: { java: 11, cpp: 11, python: 9, javascript: 10 },
  },
  code: {
    languages: {
      javascript: [
        'function rob(nums) {',
        '    if (!nums || nums.length === 0) return 0;',
        '    if (nums.length === 1) return nums[0];',
        '    const dp = new Array(nums.length).fill(0);',
        '    dp[0] = nums[0]; // 只有一间房，必偷',
        '    dp[1] = Math.max(nums[0], nums[1]); // 前两间房，选金额较大的一间',
        '    for (let i = 2; i < nums.length; i++) {',
        '        dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]); // 不偷第 i 间 vs 偷第 i 间',
        '    }',
        '    return dp[nums.length - 1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int rob(int[] nums) {',
        '        if (nums == null || nums.length == 0) return 0;',
        '        if (nums.length == 1) return nums[0];',
        '        int[] dp = new int[nums.length];',
        '        dp[0] = nums[0];',
        '        dp[1] = Math.max(nums[0], nums[1]);',
        '        for (int i = 2; i < nums.length; i++) {',
        '            dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i]);',
        '        }',
        '        return dp[nums.length - 1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int rob(vector<int>& nums) {',
        '        if (nums.empty()) return 0;',
        '        if (nums.size() == 1) return nums[0];',
        '        vector<int> dp(nums.size(), 0);',
        '        dp[0] = nums[0];',
        '        dp[1] = max(nums[0], nums[1]);',
        '        for (int i = 2; i < nums.size(); i++) {',
        '            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i]);',
        '        }',
        '        return dp.back();',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def rob(self, nums: List[int]) -> int:',
        '        if not nums: return 0',
        '        if len(nums) == 1: return nums[0]',
        '        dp = [0] * len(nums)',
        '        dp[0] = nums[0]',
        '        dp[1] = max(nums[0], nums[1])',
        '        for i in range(2, len(nums)):',
        '            dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])',
        '        return dp[-1]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：求解沿街房屋最大偷窃金额。',
        2: '边界特判：空数组直接返回 0。',
        3: '单间特判：只有一间房屋时，直接偷走 nums[0]。',
        4: '开辟一维状态数组 dp[nums.length]。',
        5: '初始化 dp[0] = nums[0]。',
        6: '初始化 dp[1] = max(nums[0], nums[1])（相邻互斥，只能二选一）。',
        7: '循环：从第 2 间房屋遍历到最后一间。',
        8: '状态决策：【不偷第 i 间：dp[i-1]】vs【偷第 i 间：dp[i-2] + nums[i]】取最大值。',
        10: '返回最后一间累计最大金额 dp[nums.length - 1]。',
      },
      java: {
        2: '函数入口。',
        3: '空数组保护。',
        4: '长度为 1 特判。',
        5: '定义 dp 表。',
        6: 'dp[0] = nums[0]。',
        7: 'dp[1] = max(nums[0], nums[1])。',
        8: '循环遍历。',
        9: '二选一状态转移。',
        11: '返回 dp[n-1]。',
      },
      cpp: {
        3: '函数入口。',
        4: '空向量与单元素特判。',
        6: '定义 dp 向量。',
        7: '初始化前两项。',
        9: '循环遍历。',
        10: 'max 状态转移。',
        12: '返回结果。',
      },
      python: {
        2: '函数入口。',
        3: '特判分支。',
        5: '初始化列表。',
        6: '初始化前两项。',
        8: '遍历递推。',
        9: '状态转移。',
        10: '返回 dp[-1]。',
      },
    },
    keyPoints: {
      title: '🎯 打家劫舍 5 步法系统精讲',
      summary: 'LeetCode 198。经典互斥约束 DP 模型。决策点在于：当前房屋偷还是不偷！若偷，则前一间必不能偷（从 i-2 转移）；若不偷，则继承前一间最优值（从 i-1 转移）。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：考虑前 <code>i</code> 间房屋（下标 <code>0..i</code>），能够偷窃到的最高总金额。', icon: '🎯', badge: '前i间最高金额' },
        { label: '二、状态转移方程', desc: '<code>dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])</code>。<br>• 不偷第 i 间：金额为 <code>dp[i - 1]</code>。<br>• 偷第 i 间：必须隔开相邻房屋，金额为 <code>dp[i - 2] + nums[i]</code>。', icon: '⚡', badge: '偷 vs 不偷' },
        { label: '三、初始化与边界条件', desc: '<code>dp[0] = nums[0]</code>；<code>dp[1] = max(nums[0], nums[1])</code>。', icon: '🎬', badge: '前两间初始化' },
        { label: '四、时空复杂度', desc: '• 时间复杂度：<code>O(n)</code>。<br>• 空间复杂度：<code>O(n)</code>，可用两个滚动变量优化为 <code>O(1)</code>。', icon: '⏱️', badge: 'O(n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let nums: number[] = [2, 7, 9, 3, 1];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.nums)) nums = input.nums;
      else if (typeof input.nums === 'string') nums = input.nums.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    }

    const n = nums.length;
    const dp: DpCell[] = Array(n).fill('-');

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      curNum?: number | string;
      curDp?: DpCell | number | string;
      action?: string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const numVal = opts.curNum ?? '-';
      const cur = opts.curDp ?? '-';
      const act = opts.action ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'nums (房屋金额)', value: `[${nums.join(', ')}]`, type: 'string' as const, changed: chSet.has('nums') },
        { name: 'n (房屋总数)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: 'i (当前房屋)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'nums[i] (本屋现金)', value: String(numVal), type: (typeof numVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('num') },
        { name: '当前决策', value: act, type: 'string' as const, changed: chSet.has('act') },
        { name: 'dp[i] (累计最大金额)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: nums.map((v, idx) => `房${idx}($${v})`),
      message: `🎯 函数入口：打家劫舍。沿街共有 ${n} 间房屋，金额为 [${nums.join(', ')}]。相邻房屋不能连续偷窃。`,
      log: `entry: nums=[${nums.join(',')}]`,
      vars: makeVars({ changed: ['nums', 'n'] }),
      thematicMeta: {
        type: 'robber',
        robber: {
          houses: nums.map((v, idx) => ({ index: idx, val: v })),
          curHouse: 0,
          robbedHouses: [],
          decision: 'skip',
          totalStolen: 0,
        },
      },
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    if (n === 0) return steps;
    if (n === 1) {
      dp[0] = nums[0];
      push({
        dp1d: clone1d(dp),
        source: nums.map((v, idx) => `房${idx}($${v})`),
        current: { index: 0 },
        message: `🏁 只有一间房屋：直接偷窃第 0 间，获得最大金额 $${nums[0]}。`,
        log: `only one house: dp[0]=${nums[0]}`,
        vars: makeVars({ i: 0, curNum: nums[0], curDp: nums[0], action: '🥷 偷窃第0间', changed: ['dpi', 'act'] }),
        codeLine: { java: 4, cpp: 4, python: 4, javascript: 3 },
      });
      return steps;
    }

    // Step 1: Init dp[0] & dp[1]
    dp[0] = nums[0];
    push({
      dp1d: clone1d(dp),
      source: nums.map((v, idx) => `房${idx}($${v})`),
      current: { index: 0 },
      message: `🎬 初始化第 0 间：只有第 0 间房，必偷 $\rightarrow$ dp[0] = ${nums[0]}。`,
      log: `init: dp[0] = ${nums[0]}`,
      vars: makeVars({ i: 0, curNum: nums[0], curDp: nums[0], action: '🥷 偷第0间', changed: ['dpi', 'act'] }),
      thematicMeta: {
        type: 'robber',
        robber: {
          houses: nums.map((v, idx) => ({ index: idx, val: v })),
          curHouse: 0,
          robbedHouses: [0],
          decision: 'rob',
          totalStolen: nums[0],
        },
      },
      codeLine: { java: 6, cpp: 7, python: 6, javascript: 5 },
    });

    dp[1] = Math.max(nums[0], nums[1]);
    const robHouse1 = nums[1] > nums[0];
    push({
      dp1d: clone1d(dp),
      source: nums.map((v, idx) => `房${idx}($${v})`),
      current: { index: 1 },
      dependencies: [{ index: 0 }],
      formula: `dp[1] = max(nums[0]:${nums[0]}, nums[1]:${nums[1]}) = ${dp[1]}`,
      message: `🎬 初始化第 1 间：前两间房相邻互斥，只能偷金额更大的一间 $\rightarrow$ dp[1] = max(${nums[0]}, ${nums[1]}) = ${dp[1]}。`,
      log: `init: dp[1] = ${dp[1]}`,
      vars: makeVars({ i: 1, curNum: nums[1], curDp: dp[1], action: robHouse1 ? '🥷 偷第1间' : '⏩ 偷第0间', changed: ['dpi', 'act'] }),
      thematicMeta: {
        type: 'robber',
        robber: {
          houses: nums.map((v, idx) => ({ index: idx, val: v })),
          curHouse: 1,
          robbedHouses: robHouse1 ? [1] : [0],
          decision: robHouse1 ? 'rob' : 'skip',
          totalStolen: dp[1] as number,
        },
      },
      codeLine: { java: 7, cpp: 8, python: 7, javascript: 6 },
    });

    // Loops
    for (let i = 2; i < n; i++) {
      const notRob = dp[i - 1] as number;
      const robThis = (dp[i - 2] as number) + nums[i];
      const best = Math.max(notRob, robThis);
      dp[i] = best;

      const isRobWinner = robThis > notRob;
      push({
        dp1d: clone1d(dp),
        source: nums.map((v, idx) => `房${idx}($${v})`),
        current: { index: i },
        dependencies: [{ index: i - 1 }, { index: i - 2 }],
        formula: `dp[${i}] = max(不偷:${notRob}, 偷:${robThis}) = ${best}`,
        message: isRobWinner
          ? `⚡ 状态决策 (偷第 ${i} 间)：跳过相邻前一间，累加前两间最优值 dp[${i - 2}] ($${dp[i - 2]}) + 本屋现金 $${nums[i]} = $${robThis} > 不偷 ($${notRob}) $\rightarrow$ dp[${i}] = $${best}。`
          : `⏩ 状态决策 (不偷第 ${i} 间)：若偷本屋 ($${nums[i]}) 加上 dp[${i - 2}] 仅得 $${robThis}，不如保持前一间最优值 $${notRob} $\rightarrow$ dp[${i}] = $${best}。`,
        log: `update: dp[${i}] = ${best}`,
        vars: makeVars({ i, curNum: nums[i], curDp: best, action: isRobWinner ? `🥷 偷第${i}间(+$${nums[i]})` : `⏩ 不偷第${i}间(继承$${notRob})`, changed: ['i', 'num', 'act', 'dpi'] }),
        thematicMeta: {
          type: 'robber',
          robber: {
            houses: nums.map((v, idx) => ({ index: idx, val: v })),
            curHouse: i,
            decision: isRobWinner ? 'rob' : 'skip',
            totalStolen: best,
          },
        },
        codeLine: {
          java: { primary: 9, context: [8] },
          cpp: { primary: 10, context: [9] },
          python: { primary: 9, context: [8] },
          javascript: { primary: 8, context: [7] },
        },
      });
    }

    const ans = dp[n - 1] as number;
    push({
      dp1d: clone1d(dp),
      source: nums.map((v, idx) => `房${idx}($${v})`),
      current: { index: n - 1 },
      message: `🏁 算法结束：不触动警报装置能够偷窃到的最高金额为 dp[${n - 1}] = $${ans}。`,
      log: `return: dp[${n - 1}] = ${ans}`,
      vars: makeVars({ i: n - 1, curDp: ans, action: '🎉 偷窃完成', changed: ['dpi', 'act'] }),
      thematicMeta: {
        type: 'robber',
        robber: {
          houses: nums.map((v, idx) => ({ index: idx, val: v })),
          curHouse: n - 1,
          totalStolen: ans,
        },
      },
      codeLine: { java: 11, cpp: 12, python: 10, javascript: 10 },
    });

    return steps;
  },
};
