import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const FibonacciSpec: AlgorithmSpec = {
  id: 'fibonacci',
  name: '斐波那契数 (Fibonacci Number)',
  category: '线性 DP',
  description: 'F(0) = 0, F(1) = 1, F(n) = F(n - 1) + F(n - 2)，求解第 n 项斐波那契数。',
  difficulty: 'easy',
  problem: {
    leetcodeId: 509,
    leetcodeUrl: 'https://leetcode.cn/problems/fibonacci-number/',
    difficulty: 'easy',
    tags: ['数学', '动态规划', '递归', '记忆化搜索'],
    description: '斐波那契数 （通常用 <code>F(n)</code> 表示）形成的序列称为 <strong>斐波那契数列</strong> 。该数列由 <code>0</code> 和 <code>1</code> 开始，后面的每一项数字都是前面两项数字的和。也就是：<br/><br/><code>F(0) = 0, F(1) = 1</code><br/><code>F(n) = F(n - 1) + F(n - 2)</code>（对于 <code>n > 1</code>）<br/><br/>给定 <code>n</code> ，请计算 <code>F(n)</code> 。',
    examples: [
      {
        input: 'n = 2',
        output: '1',
        explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1',
      },
      {
        input: 'n = 3',
        output: '2',
        explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2',
      },
      {
        input: 'n = 4',
        output: '3',
        explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3',
      },
    ],
    constraints: [
      '0 <= n <= 30',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: [5, 6], cpp: [6, 7], python: 5, javascript: [4, 5] },
    loopCheck: { java: 7, cpp: 8, python: 6, javascript: 6 },
    stateTransfer: { java: 8, cpp: 9, python: 7, javascript: 7 },
    loopExit: { java: 7, cpp: 8, python: 6, javascript: 6 },
    returnResult: { java: 10, cpp: 11, python: 8, javascript: 9 },
  },
  code: {
    languages: {
      javascript: [
        'function fib(n) {',
        '    if (n < 2) return n; // 边界条件',
        '    const dp = new Array(n + 1).fill(0); // dp[i] 存第 i 个斐波那契数',
        '    dp[0] = 0;',
        '    dp[1] = 1; // 边界初始化',
        '    for (let i = 2; i <= n; i++) { // 状态推进',
        '        dp[i] = dp[i - 1] + dp[i - 2]; // 状态转移方程',
        '    }',
        '    return dp[n]; // 返回第 n 项结果',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int fib(int n) {',
        '        if (n < 2) return n;',
        '        int[] dp = new int[n + 1];',
        '        dp[0] = 0;',
        '        dp[1] = 1;',
        '        for (int i = 2; i <= n; i++) {',
        '            dp[i] = dp[i - 1] + dp[i - 2];',
        '        }',
        '        return dp[n];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int fib(int n) {',
        '        if (n < 2) return n;',
        '        vector<int> dp(n + 1, 0);',
        '        dp[0] = 0;',
        '        dp[1] = 1;',
        '        for (int i = 2; i <= n; i++) {',
        '            dp[i] = dp[i - 1] + dp[i - 2];',
        '        }',
        '        return dp[n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def fib(self, n: int) -> int:',
        '        if n < 2:',
        '            return n',
        '        dp = [0] * (n + 1)',
        '        dp[0], dp[1] = 0, 1',
        '        for i in range(2, n + 1):',
        '            dp[i] = dp[i - 1] + dp[i - 2]',
        '        return dp[n]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：接收数字 n，计算第 n 个斐波那契数 F(n)。',
        3: '🎬 <strong>边界特判守卫</strong>：若 n < 2 直接返回 n（F(0)=0, F(1)=1）。',
        4: '🗺️ <strong>开辟状态数组</strong>：dp[i] 存储第 i 项的斐波那契数。',
        5: '🎬 <strong>边界初始化 (dp[0])</strong>：第 0 项基础状态 dp[0] = 0。',
        6: '🎬 <strong>边界初始化 (dp[1])</strong>：第 1 项基础状态 dp[1] = 1。',
        7: '🔄 <strong>循环状态推进</strong>：从 i = 2 开始自底向上递推计算至第 n 项。',
        8: '⚡ <strong>状态转移方程</strong>：当前项等于前两项之和：dp[i] = dp[i - 1] + dp[i - 2]。',
        9: '循环作用域闭合。',
        10: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为所求的第 n 个斐波那契数。',
        11: '函数体结束。',
        12: '类定义结束。',
      },
      cpp: {
        1: '类定义 Solution。',
        2: '公有访问权限声明 public。',
        3: '🎯 <strong>函数主入口</strong>：接收数字 n，计算第 n 个斐波那契数 F(n)。',
        4: '🎬 <strong>边界特判守卫</strong>：若 n < 2 直接返回 n。',
        5: '🗺️ <strong>开辟状态空间</strong>：vector<int> dp(n + 1, 0)。',
        6: '🎬 <strong>边界初始化 (dp[0])</strong>：dp[0] = 0。',
        7: '🎬 <strong>边界初始化 (dp[1])</strong>：dp[1] = 1。',
        8: '🔄 <strong>循环状态推进</strong>：for (int i = 2; i <= n; i++) 循环求解。',
        9: '⚡ <strong>状态转移方程</strong>：dp[i] = dp[i - 1] + dp[i - 2]。',
        10: '循环作用域闭合。',
        11: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
        12: '函数体结束。',
        13: '类定义结束。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：fib(n) 求解斐波那契数第 n 项。',
        3: '🎬 <strong>边界特判守卫</strong>：if n < 2:',
        4: '🎬 <strong>边界特判返回</strong>：return n。',
        5: '🗺️ <strong>开辟状态数组</strong>：dp = [0] * (n + 1)。',
        6: '🎬 <strong>边界初始化</strong>：dp[0], dp[1] = 0, 1。',
        7: '🔄 <strong>循环状态推进</strong>：for i in range(2, n + 1):',
        8: '⚡ <strong>状态转移方程</strong>：dp[i] = dp[i - 1] + dp[i - 2]。',
        9: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>：接收数字 n，计算第 n 个斐波那契数 F(n)。',
        2: '🎬 <strong>边界特判守卫</strong>：若 n < 2 直接返回 n。',
        3: '🗺️ <strong>开辟状态数组</strong>：dp[i] 存储第 i 项的斐波那契数。',
        4: '🎬 <strong>边界初始化 (dp[0])</strong>：第 0 项基础状态 dp[0] = 0。',
        5: '🎬 <strong>边界初始化 (dp[1])</strong>：第 1 项基础状态 dp[1] = 1。',
        6: '🔄 <strong>循环状态推进</strong>：从 i = 2 开始自底向上递推计算至第 n 项。',
        7: '⚡ <strong>状态转移方程</strong>：当前项等于前两项之和：dp[i] = dp[i - 1] + dp[i - 2]。',
        8: '作用域闭合。',
        9: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为所求的第 n 个斐波那契数。',
        10: '函数体结束。',
      },
    },
    keyPoints: {
      title: '🎯 斐波那契数 (Fibonacci) 5步动规核心要点',
      summary: 'LeetCode 509。动态规划最基础入门题，建立状态转移与自底向上求解意识。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：第 <code>i</code> 个斐波那契数值。', icon: '🎯', badge: '项值' },
        { label: '二、状态转移方程', desc: '<code>dp[i] = dp[i - 1] + dp[i - 2]</code>。', icon: '⚡', badge: '两项相加' },
        { label: '三、初始化与边界条件', desc: '<code>dp[0] = 0, dp[1] = 1</code>。', icon: '🎬', badge: '数学基底' },
        { label: '四、遍历推进顺序', desc: '从 <code>i = 2</code> 到 <code>n</code> 从左到右递推。', icon: '🧭', badge: '正向推导' },
        { label: '五、复杂度与演进', desc: '• 时间 <code>O(n)</code>，空间 <code>O(1)</code>（滚动变量）。<br>• 进阶：矩阵快速幂 <code>O(log n)</code>。', icon: '⏱️', badge: '矩阵进阶' },
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
        { name: 'i (当前计算项)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'dp[i-1] (前一项)', value: String(p1), type: (typeof p1 === 'number' ? 'number' : 'string') as any, changed: chSet.has('prev1') },
        { name: 'dp[i-2] (前两项)', value: String(p2), type: (typeof p2 === 'number' ? 'number' : 'string') as any, changed: chSet.has('prev2') },
        { name: 'dp[i] (当前项结果)', value: String(curDp), type: (typeof curDp === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
        { name: 'dp (斐波那契数组)', value: `[${dp.join(', ')}]`, type: 'string' as const, changed: chSet.has('dp') },
        { name: 'n (目标项)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
      ];
    };

    // Step 0: Function entry
    push({
      dp1d: clone1d(dp),
      message: `🎯 【函数主入口】进入 fib(n = ${n})，准备求解第 ${n} 个斐波那契数 F(${n})。`,
      log: `进入 fib(n = ${n})`,
      formula: `fib(${n})`,
      metrics: { i: '-', prev1: '-', prev2: '-', answer: '-' },
      vars: makeVars({ changed: ['n'] }),
      codeLine: {
        java: 2,
        cpp: 3,
        python: 2,
        javascript: 1,
      },
    });

    // Step 1: dp[0] = 0
    numDp[0] = 0;
    dp[0] = 0;
    push({
      dp1d: clone1d(dp),
      current: { index: 0 },
      message: '🎬 【初始化边界 dp[0]】执行 dp[0] = 0;，基础状态 F(0) = 0。',
      log: '初始化: dp[0] = 0',
      formula: 'dp[0] = 0',
      metrics: { i: 0, prev1: '-', prev2: '-', answer: 0 },
      vars: makeVars({ currentDp: 0, changed: ['dp', 'dpi'] }),
      codeLine: {
        java: 5,
        cpp: 6,
        python: 5,
        javascript: 4,
      },
    });

    // Step 2: dp[1] = 1
    if (n >= 1) {
      numDp[1] = 1;
      dp[1] = 1;
    }
    push({
      dp1d: clone1d(dp),
      current: { index: 1 },
      message: '🎬 【初始化边界 dp[1]】执行 dp[1] = 1;，基础状态 F(1) = 1。',
      log: '初始化: dp[1] = 1',
      formula: 'dp[1] = 1',
      metrics: { i: 1, prev1: '-', prev2: '-', answer: 1 },
      vars: makeVars({ currentDp: 1, changed: ['dp', 'dpi'] }),
      codeLine: {
        java: 6,
        cpp: 7,
        python: 5,
        javascript: 5,
      },
    });

    for (let i = 2; i <= n; i++) {
      // Step: loop check
      push({
        dp1d: clone1d(dp),
        current: { index: i },
        dependencies: [{ index: i - 1 }, { index: i - 2 }],
        message: `🔄 【循环条件判断】执行 for 循环：当前 i = ${i} <= ${n} 为 true，进入循环体计算第 ${i} 项斐波那契数。`,
        log: `for 循环推进: i = ${i} <= ${n} (true)`,
        formula: `for (int i = 2; i <= ${n}; i++) [i = ${i}]`,
        metrics: { i, prev1: numDp[i - 1], prev2: numDp[i - 2], answer: '待计算' },
        vars: makeVars({ i, prev1: numDp[i - 1], prev2: numDp[i - 2], changed: ['i', 'prev1', 'prev2'] }),
        codeLine: {
          java: 7,
          cpp: 8,
          python: 6,
          javascript: 6,
        },
      });

      // Step: state transfer
      numDp[i] = numDp[i - 1] + numDp[i - 2];
      dp[i] = numDp[i];
      push({
        dp1d: clone1d(dp),
        current: { index: i },
        dependencies: [{ index: i - 1 }, { index: i - 2 }],
        message: `⚡ 【状态转移计算】执行 dp[${i}] = dp[${i - 1}] + dp[${i - 2}];：前一项 dp[${i - 1}](${dp[i - 1]}) + 前两项 dp[${i - 2}](${dp[i - 2]}) = ${dp[i]}。`,
        log: `dp[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
        formula: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`,
        metrics: { i, prev1: numDp[i - 1], prev2: numDp[i - 2], answer: numDp[i] },
        vars: makeVars({ i, prev1: numDp[i - 1], prev2: numDp[i - 2], currentDp: numDp[i], changed: ['dp', 'dpi'] }),
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
      message: `🏁 【循环条件终止】i 递增为 ${n + 1} <= ${n} 为 false，循环结束，跳出 for 循环。`,
      log: `for 循环结束: i = ${n + 1} > ${n}`,
      formula: `i = ${n + 1} <= ${n} ➔ false (循环终止)`,
      metrics: { i: n + 1, prev1: '-', prev2: '-', answer: numDp[n] },
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
      message: `🎉 【函数返回】执行 return dp[${n}];，计算得出第 ${n} 个斐波那契数 F(${n}) = ${dp[n]}！`,
      log: `计算完成: fib(${n}) = ${dp[n]}`,
      formula: `return dp[${n}] = ${dp[n]}`,
      metrics: { i: n, prev1: numDp[Math.max(0, n - 1)], prev2: numDp[Math.max(0, n - 2)], answer: numDp[n] },
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
