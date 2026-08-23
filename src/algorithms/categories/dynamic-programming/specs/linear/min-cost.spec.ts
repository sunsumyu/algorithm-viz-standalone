import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const MinCostSpec: AlgorithmSpec = {
  id: 'min-cost',
  name: '使用最小花费爬楼梯 (Min Cost Climbing Stairs)',
  category: '线性 DP',
  description: '每爬 1 阶或 2 阶需要支付对应体力值，求登上楼顶所需支付的最低总花费。',
  difficulty: 'easy',
  problem: {
    leetcodeId: 746,
    leetcodeUrl: 'https://leetcode.cn/problems/min-cost-climbing-stairs/',
    difficulty: 'easy',
    tags: ['数组', '动态规划', '线性DP'],
    description: '给你一个整数数组 <code>cost</code> ，其中 <code>cost[i]</code> 是从楼梯第 <code>i</code> 个台阶向上爬需要支付的费用。一旦你支付此费用，即可选择向上爬一个或者两个台阶。<br/><br/>你可以选择从下标为 <code>0</code> 或下标为 <code>1</code> 的台阶开始爬楼梯。<br/><br/>请你计算并返回达到楼梯顶部的最低花费。',
    examples: [
      {
        input: 'cost = [10, 15, 20]',
        output: '15',
        explanation: '你将从下标为 1 的台阶开始。支付 15 ，向上爬两个台阶，到达楼梯顶部。总花费为 15 。',
      },
      {
        input: 'cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]',
        output: '6',
        explanation: '你将从下标为 0 的台阶开始。依次跨步至台阶 0 -> 2 -> 4 -> 6 -> 7 -> 9 -> 楼顶，最低总花费为 6 。',
      },
    ],
    constraints: [
      '2 <= cost.length <= 1000',
      '0 <= cost[i] <= 999',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    init: { java: [5, 6], cpp: [6, 7], python: 5, javascript: [4, 5] },
    loopCheck: { java: 7, cpp: 8, python: 6, javascript: 6 },
    stateTransfer: { java: 8, cpp: 9, python: 7, javascript: 7 },
    loopExit: { java: 7, cpp: 8, python: 6, javascript: 6 },
    returnResult: { java: 10, cpp: 11, python: 8, javascript: 9 },
  },
  code: {
    languages: {
      javascript: [
        'function minCostClimbingStairs(cost) {',
        '    const n = cost.length;',
        '    const dp = new Array(n + 1).fill(0); // dp[i] 存到达第 i 阶的最低花费',
        '    dp[0] = 0;',
        '    dp[1] = 0; // 可从 0 或 1 阶自由起跳',
        '    for (let i = 2; i <= n; i++) {',
        '        dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);',
        '    }',
        '    return dp[n]; // 返回到达楼顶平台的最少花费',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int minCostClimbingStairs(int[] cost) {',
        '        int n = cost.length;',
        '        int[] dp = new int[n + 1];',
        '        dp[0] = 0;',
        '        dp[1] = 0;',
        '        for (int i = 2; i <= n; i++) {',
        '            dp[i] = Math.min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);',
        '        }',
        '        return dp[n];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int minCostClimbingStairs(vector<int>& cost) {',
        '        int n = cost.size();',
        '        vector<int> dp(n + 1, 0);',
        '        dp[0] = 0;',
        '        dp[1] = 0;',
        '        for (int i = 2; i <= n; i++) {',
        '            dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2]);',
        '        }',
        '        return dp[n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def minCostClimbingStairs(self, cost: List[int]) -> int:',
        '        n = len(cost)',
        '        dp = [0] * (n + 1)',
        '        dp[0] = dp[1] = 0',
        '        for i in range(2, n + 1):',
        '            dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])',
        '        return dp[n]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：接收台阶体力消耗数组 cost，计算登上楼顶所需支付的最低体力。',
        3: '规模提取：获取台阶总数 n。注意楼顶平台对应下标 n。',
        4: '🗺️ <strong>开辟状态空间</strong>：dp[i] 表示到达第 i 阶台阶平台所需的最低花费。',
        5: '🎬 <strong>初始化起跳点 (dp[0])</strong>：可以选择从下标 0 免费起步，初始花费为 0。',
        6: '🎬 <strong>初始化起跳点 (dp[1])</strong>：也可以选择从下标 1 免费起步，初始花费为 0。',
        7: '🔄 <strong>循环状态推进</strong>：从第 2 阶开始一直递推计算到楼顶平台第 n 阶。',
        8: '⚡ <strong>状态转移方程</strong>：到达第 i 阶的花费 = min(来自 i-1 阶跳上来的累积花费, 来自 i-2 阶跳上来的累积花费)。',
        9: '循环作用域闭合。',
        10: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为到达最高楼顶平台所需的最少总体力花费。',
        11: '函数体结束。',
        12: '类定义结束。',
      },
      cpp: {
        1: '类定义 Solution。',
        2: '公有访问权限声明 public。',
        3: '🎯 <strong>函数主入口</strong>：接收台阶体力消耗数组 cost，计算登上楼顶所需支付的最低体力。',
        4: '规模提取：int n = cost.size()。',
        5: '🗺️ <strong>开辟状态空间</strong>：vector<int> dp(n + 1, 0)。',
        6: '🎬 <strong>初始化起跳点 (dp[0])</strong>：可以选择从下标 0 免费起步，dp[0] = 0。',
        7: '🎬 <strong>初始化起跳点 (dp[1])</strong>：也可以选择从下标 1 免费起步，dp[1] = 0。',
        8: '🔄 <strong>循环状态推进</strong>：for (int i = 2; i <= n; i++) 逐阶递推至楼顶。',
        9: '⚡ <strong>状态转移方程</strong>：dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])。',
        10: '循环作用域闭合。',
        11: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
        12: '函数体结束。',
        13: '类定义结束。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：minCostClimbingStairs(cost) 计算到达楼顶的最低消耗。',
        3: '规模提取：n = len(cost)。',
        4: '🗺️ <strong>开辟状态数组</strong>：dp = [0] * (n + 1)。',
        5: '🎬 <strong>初始化起跳点</strong>：dp[0] = dp[1] = 0。',
        6: '🔄 <strong>循环状态推进</strong>：for i in range(2, n + 1):',
        7: '⚡ <strong>状态转移方程</strong>：dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])。',
        8: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>：接收台阶体力消耗数组 cost，计算登上楼顶所需支付的最低体力。',
        2: '规模提取：const n = cost.length，注意楼顶平台对应下标 n。',
        3: '🗺️ <strong>开辟状态空间</strong>：dp[i] 表示到达第 i 阶台阶平台所需的最低花费。',
        4: '🎬 <strong>初始化起跳点 (dp[0])</strong>：可以选择从下标 0 免费起步，初始花费为 0。',
        5: '🎬 <strong>初始化起跳点 (dp[1])</strong>：也可以选择从下标 1 免费起步，初始花费为 0。',
        6: '🔄 <strong>循环状态推进</strong>：从第 2 阶开始一直递推计算到楼顶平台第 n 阶。',
        7: '⚡ <strong>状态转移方程</strong>：到达第 i 阶的花费 = min(来自 i-1 阶跳上来的累积花费, 来自 i-2 阶跳上来的累积花费)。',
        8: '作用域闭合。',
        9: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为到达最高楼顶平台所需的最少总体力花费。',
        10: '函数体结束。',
      },
    },
    keyPoints: {
      title: '🎯 使用最小花费爬楼梯 (Min Cost) 5步动规核心要点',
      summary: 'LeetCode 746。经典带权线性递推问题，关键在于认清“楼顶”是第 n 阶（下标 cost.length）。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：到达第 <code>i</code> 个台阶平台所需支付的最低累计体力花费。', icon: '🎯', badge: '累计最小代价' },
        { label: '二、状态转移方程', desc: '<code>dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])</code>。', icon: '⚡', badge: '双路选优' },
        { label: '三、初始化与边界条件', desc: '<code>dp[0] = 0, dp[1] = 0</code>（题目规定可从下标 0 或 1 免费起跑）。', icon: '🎬', badge: '零成本起步' },
        { label: '四、遍历推进顺序', desc: '从 <code>i = 2</code> 顺序推演至 <code>n = cost.length</code>。', icon: '🧭', badge: '正向推导' },
        { label: '五、复杂度与优化', desc: '• 时间 <code>O(n)</code>，空间 <code>O(n)</code>。<br>• 空间可用滚动变量 <code>p, q</code> 压缩至 <code>O(1)</code>。', icon: '⏱️', badge: '滚动优化' },
      ],
    },
  },
  generateSteps: (input: { nums?: number[] } | number[]): DpTraceStep[] => {
    const raw = Array.isArray(input) ? input : (input?.nums || [10, 15, 20]);
    const nums = raw.length ? raw : [10, 15, 20];
    const n = nums.length;
    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep({ source: nums.map(String), ...step }));
    const numDp: number[] = Array(n + 1).fill(0);
    const dp: import('../../engine/types').DpCell[] = Array(n + 1).fill('-');

    const makeVars = (opts: {
      i?: number | string;
      from1?: number | string;
      from2?: number | string;
      currentDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const f1 = opts.from1 ?? '-';
      const f2 = opts.from2 ?? '-';
      const curDp = opts.currentDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'i (当前台阶)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'c1 (从 i-1 跨步)', value: String(f1), type: (typeof f1 === 'number' ? 'number' : 'string') as any, changed: chSet.has('c1') },
        { name: 'c2 (从 i-2 跨步)', value: String(f2), type: (typeof f2 === 'number' ? 'number' : 'string') as any, changed: chSet.has('c2') },
        { name: 'dp[i] (最优花费)', value: String(curDp), type: (typeof curDp === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
        { name: 'dp (花费数组)', value: `[${dp.join(', ')}]`, type: 'string' as const, changed: chSet.has('dp') },
        { name: 'cost (台阶花费)', value: `[${nums.join(', ')}]`, type: 'string' as const, changed: chSet.has('cost') },
        { name: 'n (楼顶台阶)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
      ];
    };

    // Step 0: Function entry
    push({
      dp1d: clone1d(dp),
      staircase: {
        totalSteps: n,
        costs: nums,
        dp: clone1d(dp),
        characterPosition: -1, // 地面准备起跑态
      },
      message: `🎯 【函数主入口】进入 minCostClimbingStairs(cost)，接收台阶花费数组 cost = [${nums.join(', ')}]，准备求解到达楼顶平台 (${n}) 的最低累积体力消耗。`,
      log: `进入 minCostClimbingStairs(cost = [${nums.join(', ')}])`,
      formula: 'minCostClimbingStairs(cost)',
      metrics: { i: '-', from1: '-', from2: '-', answer: '-' },
      vars: makeVars({ changed: ['cost', 'n'] }),
      codeLine: {
        java: 2,
        cpp: 3,
        python: 2,
        javascript: 1,
      },
    });

    // Step 1: dp[0] = 0;
    numDp[0] = 0;
    dp[0] = 0;
    push({
      dp1d: clone1d(dp),
      current: { index: 0 },
      staircase: {
        totalSteps: n,
        costs: nums,
        dp: clone1d(dp),
        currentStep: 0,
        characterPosition: 0,
      },
      message: '🎬 【初始化起跳点 dp[0]】执行 dp[0] = 0;，可以选择从下标 0 免费起步，初始体力消耗为 0。',
      log: '初始化: dp[0] = 0',
      formula: 'dp[0] = 0',
      metrics: { i: 0, from1: '-', from2: '-', answer: 0 },
      vars: makeVars({ currentDp: 0, changed: ['dp', 'dpi'] }),
      codeLine: {
        java: 5,
        cpp: 6,
        python: 5,
        javascript: 4,
      },
    });

    // Step 2: dp[1] = 0;
    numDp[1] = 0;
    dp[1] = 0;
    push({
      dp1d: clone1d(dp),
      current: { index: 1 },
      staircase: {
        totalSteps: n,
        costs: nums,
        dp: clone1d(dp),
        currentStep: 1,
        characterPosition: 1,
      },
      message: '🎬 【初始化起跳点 dp[1]】执行 dp[1] = 0;，也可以选择从下标 1 免费起步，初始体力消耗为 0。',
      log: '初始化: dp[1] = 0',
      formula: 'dp[1] = 0',
      metrics: { i: 1, from1: '-', from2: '-', answer: 0 },
      vars: makeVars({ currentDp: 0, changed: ['dp', 'dpi'] }),
      codeLine: {
        java: 6,
        cpp: 7,
        python: 5,
        javascript: 5,
      },
    });

    for (let i = 2; i <= n; i++) {
      const c1 = numDp[i - 1] + nums[i - 1];
      const c2 = numDp[i - 2] + nums[i - 2];
      const bestFrom = c1 <= c2 ? i - 1 : i - 2;

      // Step: loop check
      push({
        dp1d: clone1d(dp),
        current: { index: i },
        dependencies: [{ index: i - 1 }, { index: i - 2 }],
        staircase: {
          totalSteps: n,
          costs: nums,
          dp: clone1d(dp),
          currentStep: i,
          fromSteps: [i - 2, i - 1],
          characterPosition: i - 1,
        },
        message: `🔄 【循环条件判断】执行 for 循环：当前 i = ${i} <= ${n} 为 true，进入循环体计算到达第 ${i === n ? '楼顶(目标平台)' : i + ' 阶'} 的最低花费。`,
        log: `for 循环推进: i = ${i} <= ${n} (true)`,
        formula: `for (int i = 2; i <= ${n}; i++) [i = ${i}]`,
        metrics: { i, from1: `${numDp[i - 1]}+${nums[i - 1]}`, from2: `${numDp[i - 2]}+${nums[i - 2]}`, answer: '待计算' },
        vars: makeVars({ i, from1: c1, from2: c2, changed: ['i', 'c1', 'c2'] }),
        codeLine: {
          java: 7,
          cpp: 8,
          python: 6,
          javascript: 6,
        },
      });

      // Step: state calculation
      numDp[i] = Math.min(c1, c2);
      dp[i] = numDp[i];
      push({
        dp1d: clone1d(dp),
        current: { index: i },
        dependencies: [{ index: i - 1 }, { index: i - 2 }],
        staircase: {
          totalSteps: n,
          costs: nums,
          dp: clone1d(dp),
          currentStep: i,
          fromSteps: [i - 2, i - 1],
          bestFromStep: bestFrom,
          characterPosition: i,
          isGoal: i === n,
        },
        message: `⚡ 【状态转移决策】执行 dp[${i}] = Math.min(...)：从第 ${i - 1} 阶跳来 (dp[${i - 1}]+cost[${i - 1}]=${c1}) 与从第 ${i - 2} 阶跳来 (dp[${i - 2}]+cost[${i - 2}]=${c2})，取较小值 ${dp[i]}。`,
        log: `dp[${i}] = min(${c1}, ${c2}) = ${dp[i]}`,
        formula: `dp[${i}] = min(dp[${i - 1}]+cost[${i - 1}], dp[${i - 2}]+cost[${i - 2}]) = min(${c1}, ${c2}) = ${dp[i]}`,
        metrics: { i, from1: c1, from2: c2, answer: numDp[i] },
        vars: makeVars({ i, from1: c1, from2: c2, currentDp: numDp[i], changed: ['dp', 'dpi'] }),
        codeLine: {
          java: 8,
          cpp: 9,
          python: 7,
          javascript: 7,
        },
      });
    }

    // Step: loop exit
    push({
      dp1d: clone1d(dp),
      current: { index: n },
      staircase: {
        totalSteps: n,
        costs: nums,
        dp: clone1d(dp),
        currentStep: n,
        characterPosition: n,
        isGoal: true,
      },
      message: `🏁 【循环条件终止】i 递增为 ${n + 1} <= ${n} 为 false，循环结束，跳出 for 循环。`,
      log: `for 循环结束: i = ${n + 1} > ${n}`,
      formula: `i = ${n + 1} <= ${n} ➔ false (循环终止)`,
      metrics: { i: n + 1, from1: '-', from2: '-', answer: numDp[n] },
      vars: makeVars({ i: n + 1, currentDp: numDp[n], changed: ['i'] }),
      codeLine: {
        java: 7,
        cpp: 8,
        python: 6,
        javascript: 6,
      },
    });

    // Step: return
    push({
      dp1d: clone1d(dp),
      current: { index: n },
      staircase: {
        totalSteps: n,
        costs: nums,
        dp: clone1d(dp),
        currentStep: n,
        bestFromStep: (numDp[n - 1] + nums[n - 1] <= numDp[n - 2] + nums[n - 2]) ? n - 1 : n - 2,
        characterPosition: n,
        isGoal: true,
      },
      message: `🎉 【函数返回】执行 return dp[${n}];，到达楼顶平台所需的最少总体力花费为 ${dp[n]}！`,
      log: `计算完成: return dp[${n}] = ${dp[n]}`,
      formula: `return dp[${n}] = ${dp[n]}`,
      metrics: { i: n, from1: numDp[Math.max(0, n - 1)] + nums[Math.max(0, n - 1)], from2: numDp[Math.max(0, n - 2)] + nums[Math.max(0, n - 2)], answer: numDp[n] },
      vars: makeVars({ i: n, currentDp: numDp[n], changed: ['dpi'] }),
      codeLine: {
        java: 10,
        cpp: 11,
        python: 8,
        javascript: 9,
      },
    });

    return steps;
  },
};
