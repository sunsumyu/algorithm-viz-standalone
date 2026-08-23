import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';
import type { DpTreeNode } from '../../dp-demo-visualizer';

export const ClimbStairsSpec: AlgorithmSpec = {
  id: 'climb-stairs',
  name: '爬楼梯 (Climbing Stairs)',
  category: '线性 DP',
  description: '经典斐波那契模型，每次可爬 1 阶或 2 阶，求爬到第 n 阶楼梯的方案总数。',
  difficulty: 'easy',
  problem: {
    leetcodeId: 70,
    leetcodeUrl: 'https://leetcode.cn/problems/climbing-stairs/',
    difficulty: 'easy',
    tags: ['动态规划', '数学', '记忆化搜索'],
    description: '假设你正在爬楼梯。需要 <code>n</code> 阶你才能到达楼顶。<br/><br/>每次你可以爬 <code>1</code> 或 <code>2</code> 个台阶。你有多少种不同的方法可以爬到楼顶？',
    examples: [
      {
        input: 'n = 2',
        output: '2',
        explanation: '有两种方法可以爬到楼顶：<br/>1. 1 阶 + 1 阶<br/>2. 2 阶',
      },
      {
        input: 'n = 3',
        output: '3',
        explanation: '有三种方法可以爬到楼顶：<br/>1. 1 阶 + 1 阶 + 1 阶<br/>2. 1 阶 + 2 阶<br/>3. 2 阶 + 1 阶',
      },
    ],
    constraints: [
      '1 <= n <= 45',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: [5, 6], cpp: [6, 7], python: 6, javascript: [4, 5] },
    loopCheck: { java: 7, cpp: 8, python: 7, javascript: 6 },
    stateTransfer: { java: 8, cpp: 9, python: 8, javascript: 7 },
    loopExit: { java: 7, cpp: 8, python: 7, javascript: 6 },
    returnResult: { java: 10, cpp: 11, python: 9, javascript: 9 },
  },
  code: {
    languages: {
      javascript: [
        'function climbStairs(n) {',
        '    if (n <= 2) return n; // 边界条件：1阶1种，2阶2种',
        '    const dp = new Array(n + 1).fill(0); // dp[i] 存爬到第 i 阶的方案总数',
        '    dp[1] = 1;',
        '    dp[2] = 2; // 边界初始化',
        '    for (let i = 3; i <= n; i++) { // 状态推进',
        '        dp[i] = dp[i - 1] + dp[i - 2]; // 状态转移方程',
        '    }',
        '    return dp[n]; // 返回爬到第 n 阶的方案数',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int climbStairs(int n) {',
        '        if (n <= 2) return n;',
        '        int[] dp = new int[n + 1];',
        '        dp[1] = 1;',
        '        dp[2] = 2;',
        '        for (int i = 3; i <= n; i++) {',
        '            dp[i] = dp[i - 1] + dp[i - 2];',
        '        }',
        '        return dp[n];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int climbStairs(int n) {',
        '        if (n <= 2) return n;',
        '        vector<int> dp(n + 1, 0);',
        '        dp[1] = 1;',
        '        dp[2] = 2;',
        '        for (int i = 3; i <= n; i++) {',
        '            dp[i] = dp[i - 1] + dp[i - 2];',
        '        }',
        '        return dp[n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def climbStairs(self, n: int) -> int:',
        '        if n <= 2:',
        '            return n',
        '        dp = [0] * (n + 1)',
        '        dp[1], dp[2] = 1, 2',
        '        for i in range(3, n + 1):',
        '            dp[i] = dp[i - 1] + dp[i - 2]',
        '        return dp[n]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：接收目标楼梯阶数 n，计算爬上楼顶的不同方案总数。',
        3: '🎬 <strong>边界特判守卫</strong>：若 n <= 2 直接返回 n。',
        4: '🗺️ <strong>开辟状态数组</strong>：dp[i] 表示爬到第 i 阶楼梯的方案总数。',
        5: '🎬 <strong>边界初始化 (dp[1])</strong>：爬到第 1 阶方案数 dp[1] = 1。',
        6: '🎬 <strong>边界初始化 (dp[2])</strong>：爬到第 2 阶方案数 dp[2] = 2。',
        7: '🔄 <strong>循环状态推进</strong>：从第 3 阶开始逐层递推求解直到第 n 阶。',
        8: '⚡ <strong>状态转移方程</strong>：最后一步跨 1 步来自 i-1 阶，跨 2 步来自 i-2 阶：dp[i] = dp[i - 1] + dp[i - 2]。',
        9: '循环作用域闭合。',
        10: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为爬到第 n 阶楼梯的不同走法总数。',
        11: '函数体结束。',
        12: '类定义结束。',
      },
      cpp: {
        1: '类定义 Solution。',
        2: '公有访问权限声明 public。',
        3: '🎯 <strong>函数主入口</strong>：接收目标楼梯阶数 n，计算爬上楼顶的不同方案总数。',
        4: '🎬 <strong>边界特判守卫</strong>：若 n <= 2 直接返回 n。',
        5: '🗺️ <strong>开辟状态空间</strong>：vector<int> dp(n + 1, 0)。',
        6: '🎬 <strong>边界初始化 (dp[1])</strong>：dp[1] = 1。',
        7: '🎬 <strong>边界初始化 (dp[2])</strong>：dp[2] = 2。',
        8: '🔄 <strong>循环状态推进</strong>：从第 3 阶开始逐层递推求解直到第 n 阶。',
        9: '⚡ <strong>状态转移方程</strong>：dp[i] = dp[i - 1] + dp[i - 2]。',
        10: '循环作用域闭合。',
        11: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为爬到第 n 阶楼梯的不同走法总数。',
        12: '函数体结束。',
        13: '类定义结束。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：climbStairs(n) 计算爬到第 n 阶走法总数。',
        3: '🎬 <strong>边界特判守卫</strong>：if n <= 2:',
        4: '🎬 <strong>边界特判返回</strong>：return n。',
        5: '🗺️ <strong>开辟状态数组</strong>：dp = [0] * (n + 1)。',
        6: '🎬 <strong>边界初始化</strong>：dp[1], dp[2] = 1, 2。',
        7: '🔄 <strong>循环状态推进</strong>：for i in range(3, n + 1):',
        8: '⚡ <strong>状态转移方程</strong>：dp[i] = dp[i - 1] + dp[i - 2]。',
        9: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>：接收目标楼梯阶数 n，计算爬上楼顶的不同方案总数。',
        2: '🎬 <strong>边界特判守卫</strong>：若 n=1 只有 1 种走法，n=2 有 2 种走法，直接返回。',
        3: '🗺️ <strong>开辟状态数组</strong>：dp[i] 表示爬到第 i 阶楼梯的方案总数。',
        4: '🎬 <strong>边界初始化 (dp[1])</strong>：爬到第 1 阶方案数 dp[1] = 1。',
        5: '🎬 <strong>边界初始化 (dp[2])</strong>：爬到第 2 阶方案数 dp[2] = 2。',
        6: '🔄 <strong>循环状态推进</strong>：从第 3 阶开始逐层递推求解直到第 n 阶。',
        7: '⚡ <strong>状态转移方程</strong>：最后一步跨 1 步来自 i-1 阶，跨 2 步来自 i-2 阶：dp[i] = dp[i - 1] + dp[i - 2]。',
        8: '作用域闭合。',
        9: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为爬到第 n 阶楼梯的不同走法总数。',
        10: '函数体结束。',
      },
    },
    keyPoints: {
      title: '🎯 爬楼梯 (Climbing Stairs) 5步动规核心要点',
      summary: 'LeetCode 70。经典的斐波那契模型应用，核心在于最后一步决策分类。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：爬上一个 <code>i</code> 阶楼梯的独立走法总数。', icon: '🎯', badge: '方案数统计' },
        { label: '二、状态转移方程', desc: '<code>dp[i] = dp[i - 1] + dp[i - 2]</code>（最后一步跨 1 阶或跨 2 阶）。', icon: '⚡', badge: '加法原理' },
        { label: '三、初始化与边界条件', desc: '<code>dp[1] = 1, dp[2] = 2</code>（若 n <= 2 直接返回 n）。', icon: '🎬', badge: '边界底座' },
        { label: '四、遍历推进顺序', desc: '从 <code>i = 3</code> 到 <code>n</code> 自底向上正序递推。', icon: '🧭', badge: '正向推导' },
        { label: '五、复杂度与完全背包变形', desc: '• 基础版：时间 <code>O(n)</code>，空间 <code>O(1)</code>。<br>• 进阶变形：若每次可爬 1..m 阶，即变为完全背包排列问题。', icon: '⏱️', badge: '背包进阶' },
      ],
    },
  },
  generateSteps: (input: { n?: number } | number): DpTraceStep[] => {
    const n = typeof input === 'number' ? input : (input?.n || 6);
    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));
    const numDp: number[] = Array(n + 1).fill(0);
    const dp: import('../../engine/types').DpCell[] = Array(n + 1).fill('-');

    const makeVars = (opts: {
      i?: number | string;
      prev1?: number | string;
      prev2?: number | string;
      currentDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const p1 = opts.prev1 ?? '-';
      const p2 = opts.prev2 ?? '-';
      const curDp = opts.currentDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'i (当前计算台阶)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'dp[i-1] (跨1步方案)', value: String(p1), type: (typeof p1 === 'number' ? 'number' : 'string') as any, changed: chSet.has('prev1') },
        { name: 'dp[i-2] (跨2步方案)', value: String(p2), type: (typeof p2 === 'number' ? 'number' : 'string') as any, changed: chSet.has('prev2') },
        { name: 'dp[i] (当前台阶方案数)', value: String(curDp), type: (typeof curDp === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
        { name: 'dp (方案总数数组)', value: `[${dp.slice(1).join(', ')}]`, type: 'string' as const, changed: chSet.has('dp') },
        { name: 'n (目标台阶)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
      ];
    };

    // Step 0: Function entry
    push({
      dp1d: clone1d(dp),
      staircase: {
        totalSteps: n,
        dp: clone1d(dp),
        characterPosition: -1, // 地面准备起跑态
      },
      message: `🎯 【函数主入口】进入 climbStairs(n = ${n})，准备求解爬上 ${n} 阶台阶的不同方案总数。`,
      log: `进入 climbStairs(n = ${n})`,
      formula: `climbStairs(${n})`,
      metrics: { i: '-', prev1: '-', prev2: '-', answer: '-' },
      vars: makeVars({ changed: ['n'] }),
      codeLine: {
        java: 2,
        cpp: 3,
        python: 2,
        javascript: 1,
      },
    });

    // Step 1: dp[1] = 1;
    numDp[1] = 1;
    dp[1] = 1;
    push({
      dp1d: clone1d(dp),
      current: { index: 1 },
      staircase: {
        totalSteps: n,
        dp: clone1d(dp),
        currentStep: 1,
        characterPosition: 1,
      },
      message: '🎬 【初始化边界 dp[1]】执行 dp[1] = 1;，爬到第 1 阶只有 1 种走法（从地面跨 1 步）。',
      log: '初始化: dp[1] = 1',
      formula: 'dp[1] = 1',
      metrics: { i: 1, prev1: '-', prev2: '-', answer: 1 },
      vars: makeVars({ currentDp: 1, changed: ['dp', 'dpi'] }),
      codeLine: {
        java: 5,
        cpp: 6,
        python: 6,
        javascript: 4,
      },
    });

    // Step 2: dp[2] = 2;
    if (n >= 2) {
      numDp[2] = 2;
      dp[2] = 2;
    }
    push({
      dp1d: clone1d(dp),
      current: { index: Math.min(2, n) },
      staircase: {
        totalSteps: n,
        dp: clone1d(dp),
        currentStep: Math.min(2, n),
        characterPosition: Math.min(2, n),
      },
      message: '🎬 【初始化边界 dp[2]】执行 dp[2] = 2;，爬到第 2 阶有 2 种走法（1+1 步或直接跨 2 步）。',
      log: '初始化: dp[2] = 2',
      formula: 'dp[2] = 2',
      metrics: { i: Math.min(2, n), prev1: '-', prev2: '-', answer: numDp[Math.min(2, n)] },
      vars: makeVars({ currentDp: 2, changed: ['dp', 'dpi'] }),
      codeLine: {
        java: 6,
        cpp: 7,
        python: 6,
        javascript: 5,
      },
    });

    for (let i = 3; i <= n; i++) {
      // Step: loop check
      push({
        dp1d: clone1d(dp),
        current: { index: i },
        dependencies: [{ index: i - 1 }, { index: i - 2 }],
        staircase: {
          totalSteps: n,
          dp: clone1d(dp),
          currentStep: i,
          fromSteps: [i - 2, i - 1],
          characterPosition: i - 1,
        },
        message: `🔄 【循环条件判断】执行 for 循环：当前 i = ${i} <= ${n} 为 true，准备计算到达第 ${i} 阶方案数。`,
        log: `for 循环推进: i = ${i} <= ${n} (true)`,
        formula: `for (int i = 3; i <= ${n}; i++) [i = ${i}]`,
        metrics: { i, prev1: numDp[i - 1], prev2: numDp[i - 2], answer: '待计算' },
        vars: makeVars({ i, prev1: numDp[i - 1], prev2: numDp[i - 2], changed: ['i', 'prev1', 'prev2'] }),
        codeLine: {
          java: 7,
          cpp: 8,
          python: 7,
          javascript: 6,
        },
      });

      // Step: state transfer
      numDp[i] = numDp[i - 1] + numDp[i - 2];
      dp[i] = numDp[i];
      const stepTree: DpTreeNode = {
        id: `climb_${i}`,
        val: `第${i}阶`,
        status: 'current',
        tag: `方案:${dp[i]}`,
        children: [
          { id: `climb_${i - 1}`, val: `跨1步从${i - 1}阶`, status: 'dependency', tag: `${dp[i - 1]} 种` },
          { id: `climb_${i - 2}`, val: `跨2步从${i - 2}阶`, status: 'dependency', tag: `${dp[i - 2]} 种` },
        ],
      };
      push({
        dp1d: clone1d(dp),
        tree: stepTree,
        current: { index: i },
        dependencies: [{ index: i - 1 }, { index: i - 2 }],
        staircase: {
          totalSteps: n,
          dp: clone1d(dp),
          currentStep: i,
          fromSteps: [i - 2, i - 1],
          bestFromStep: i - 1,
          characterPosition: i,
          isGoal: i === n,
        },
        message: `⚡ 【状态转移计算】执行 dp[${i}] = dp[${i - 1}] + dp[${i - 2}];：最后跨 1 步 (来自第 ${i - 1} 阶 ${dp[i - 1]} 种) + 跨 2 步 (来自第 ${i - 2} 阶 ${dp[i - 2]} 种) = ${dp[i]} 种。`,
        log: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i]}`,
        formula: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
        metrics: { i, prev1: numDp[i - 1], prev2: numDp[i - 2], answer: numDp[i] },
        vars: makeVars({ i, prev1: numDp[i - 1], prev2: numDp[i - 2], currentDp: numDp[i], changed: ['dp', 'dpi'] }),
        codeLine: {
          java: 8,
          cpp: 9,
          python: 8,
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
        dp: clone1d(dp),
        currentStep: n,
        characterPosition: n,
        isGoal: true,
      },
      message: `🏁 【循环条件终止】i 递增为 ${n + 1} <= ${n} 为 false，循环结束，跳出 for 循环。`,
      log: `for 循环结束: i = ${n + 1} > ${n}`,
      formula: `i = ${n + 1} <= ${n} ➔ false (循环终止)`,
      metrics: { i: n + 1, prev1: '-', prev2: '-', answer: numDp[n] },
      vars: makeVars({ i: n + 1, currentDp: numDp[n], changed: ['i'] }),
      codeLine: {
        java: 7,
        cpp: 8,
        python: 7,
        javascript: 6,
      },
    });

    // Step: return
    push({
      dp1d: clone1d(dp),
      current: { index: n },
      staircase: {
        totalSteps: n,
        dp: clone1d(dp),
        currentStep: n,
        fromSteps: [n - 2, n - 1],
        bestFromStep: n - 1,
        characterPosition: n,
        isGoal: true,
      },
      message: `🎉 【函数返回】执行 return dp[${n}];，爬到第 ${n} 阶总共有 ${dp[n]} 种不同的走法！`,
      log: `计算完成: climbStairs(${n}) = ${dp[n]}`,
      formula: `return dp[${n}] = ${dp[n]}`,
      metrics: { i: n, prev1: numDp[Math.max(1, n - 1)], prev2: numDp[Math.max(1, n - 2)], answer: numDp[n] },
      vars: makeVars({ i: n, currentDp: numDp[n], changed: ['dpi'] }),
      codeLine: {
        java: 10,
        cpp: 11,
        python: 9,
        javascript: 9,
      },
    });

    return steps;
  },
};
