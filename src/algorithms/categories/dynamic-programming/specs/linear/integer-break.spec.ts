import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const IntegerBreakSpec: AlgorithmSpec = {
  id: 'integer-break',
  name: '整数拆分 (Integer Break)',
  category: '线性 DP',
  description: '将正整数 n 拆分为至少两个正整数之和，使这些正整数的乘积最大化。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 343,
    leetcodeUrl: 'https://leetcode.cn/problems/integer-break/',
    difficulty: 'medium',
    tags: ['数学', '动态规划'],
    description: '给定一个正整数 <code>n</code> ，将其拆分为 <code>k</code> 个 <strong>正整数</strong> 的和（ <code>k >= 2</code> ），并使这些整数的乘积最大化。<br/><br/>返回 <em>你可以获得的最大乘积</em> 。',
    examples: [
      {
        input: 'n = 2',
        output: '1',
        explanation: '2 = 1 + 1, 1 × 1 = 1',
      },
      {
        input: 'n = 10',
        output: '36',
        explanation: '10 = 3 + 3 + 4, 3 × 3 × 4 = 36',
      },
    ],
    constraints: [
      '2 <= n <= 58',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    init: { java: 4, cpp: 5, python: 4, javascript: 3 },
    loopCheck: { java: 5, cpp: 6, python: 5, javascript: 4 },
    innerLoopCheck: { java: 6, cpp: 7, python: 6, javascript: 5 },
    stateTransfer: { java: 7, cpp: 8, python: 7, javascript: 6 },
    loopExit: { java: 5, cpp: 6, python: 5, javascript: 4 },
    returnResult: { java: 10, cpp: 11, python: 8, javascript: 9 },
  },
  code: {
    languages: {
      javascript: [
        'function integerBreak(n) {',
        '    const dp = new Array(n + 1).fill(0); // dp[i] 表示拆分正整数 i 获得的最大乘积',
        '    dp[2] = 1; // 边界条件：2 只能拆为 1 + 1，乘积为 1',
        '    for (let i = 3; i <= n; i++) { // 从 3 逐步推导到 n',
        '        for (let j = 1; j <= Math.floor(i / 2); j++) { // 剪枝对称性优化',
        '            dp[i] = Math.max(dp[i], Math.max(j * (i - j), j * dp[i - j]));',
        '        }',
        '    }',
        '    return dp[n]; // 返回拆分 n 的最大乘积',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int integerBreak(int n) {',
        '        int[] dp = new int[n + 1];',
        '        dp[2] = 1;',
        '        for (int i = 3; i <= n; i++) {',
        '            for (int j = 1; j <= i / 2; j++) {',
        '                dp[i] = Math.max(dp[i], Math.max(j * (i - j), j * dp[i - j]));',
        '            }',
        '        }',
        '        return dp[n];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int integerBreak(int n) {',
        '        vector<int> dp(n + 1, 0);',
        '        dp[2] = 1;',
        '        for (int i = 3; i <= n; i++) {',
        '            for (int j = 1; j <= i / 2; j++) {',
        '                dp[i] = max(dp[i], max(j * (i - j), j * dp[i - j]));',
        '            }',
        '        }',
        '        return dp[n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def integerBreak(self, n: int) -> int:',
        '        dp = [0] * (n + 1)',
        '        dp[2] = 1',
        '        for i in range(3, n + 1):',
        '            for j in range(1, i // 2 + 1):',
        '                dp[i] = max(dp[i], max(j * (i - j), j * dp[i - j]))',
        '        return dp[n]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：接收正整数 n，计算拆分后的最大乘积。',
        3: '🗺️ <strong>开辟状态数组</strong>：dp[i] 表示拆分正整数 i 获得的最大乘积。',
        4: '🎬 <strong>边界初始化 (dp[2])</strong>：正整数 2 只能拆分成 1+1，dp[2] = 1。',
        5: '🔄 <strong>外层循环递推</strong>：从 i = 3 开始自底向上逐步推导至 n。',
        6: '🔍 <strong>内层枚举拆分点</strong>：枚举第一个拆分出的整数 j（利用对称性只需枚举到 i/2）。',
        7: '⚡ <strong>双重取最大状态转移</strong>：拆成 2 个数 j*(i-j) 或拆成多个数 j*dp[i-j]，取全局最大。',
        8: '内层循环闭合。',
        9: '外层循环闭合。',
        10: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为拆分 n 的最大乘积。',
        11: '函数体结束。',
        12: '类定义结束。',
      },
      cpp: {
        1: '类定义 Solution。',
        2: '公有访问权限声明 public。',
        3: '🎯 <strong>函数主入口</strong>：接收正整数 n，计算拆分后的最大乘积。',
        4: '🗺️ <strong>开辟状态空间</strong>：vector<int> dp(n + 1, 0)。',
        5: '🎬 <strong>边界初始化 (dp[2])</strong>：dp[2] = 1。',
        6: '🔄 <strong>外层循环递推</strong>：for (int i = 3; i <= n; i++)。',
        7: '🔍 <strong>内层枚举拆分点</strong>：for (int j = 1; j <= i / 2; j++)。',
        8: '⚡ <strong>双重取最大状态转移</strong>：dp[i] = max(dp[i], max(j*(i-j), j*dp[i-j]))。',
        9: '内层循环闭合。',
        10: '外层循环闭合。',
        11: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
        12: '函数体结束。',
        13: '类定义结束。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：integerBreak(n) 求解拆分正整数 n 的最大乘积。',
        3: '🗺️ <strong>开辟状态数组</strong>：dp = [0] * (n + 1)。',
        4: '🎬 <strong>边界初始化</strong>：dp[2] = 1。',
        5: '🔄 <strong>外层循环推进</strong>：for i in range(3, n + 1):',
        6: '🔍 <strong>内层枚举拆分点</strong>：for j in range(1, i // 2 + 1):',
        7: '⚡ <strong>状态转移决策</strong>：dp[i] = max(dp[i], max(j * (i - j), j * dp[i - j]))。',
        8: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>：接收正整数 n，计算拆分后的最大乘积。',
        2: '🗺️ <strong>开辟状态数组</strong>：dp[i] 表示拆分正整数 i 获得的最大乘积。',
        3: '🎬 <strong>边界初始化 (dp[2])</strong>：正整数 2 只能拆分成 1+1，dp[2] = 1。',
        4: '🔄 <strong>外层循环递推</strong>：从 i = 3 开始自底向上逐步推导至 n。',
        5: '🔍 <strong>内层枚举拆分点</strong>：枚举第一个拆分出的整数 j（利用对称性只需枚举到 i/2）。',
        6: '⚡ <strong>双重取最大状态转移</strong>：拆成 2 个数 j*(i-j) 或拆成多个数 j*dp[i-j]，取全局最大。',
        7: '内层作用域闭合。',
        8: '外层作用域闭合。',
        9: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为拆分 n 的最大乘积。',
        10: '函数体结束。',
      },
    },
    keyPoints: {
      title: '🎯 整数拆分 (Integer Break) 5步动规核心要点',
      summary: 'LeetCode 343。将数字拆分成多个正整数求最大乘积，核心在于拆为 2 个数与拆为多个数的转移选优。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：正整数 <code>i</code> 拆分后的最大乘积。', icon: '🎯', badge: '最大乘积' },
        { label: '二、状态转移方程', desc: '<code>dp[i] = max(dp[i], max(j * (i - j), j * dp[i - j]))</code>。', icon: '⚡', badge: '二选一选优' },
        { label: '三、初始化与边界条件', desc: '<code>dp[2] = 1</code>（从 0 和 1 拆分无意义）。', icon: '🎬', badge: '基底初始' },
        { label: '四、遍历推进顺序', desc: '外层 <code>i: 3..n</code>，内层 <code>j: 1..(i/2)</code>（剪枝对称性）。', icon: '🧭', badge: '双重循环' },
        { label: '五、数学贪心演进', desc: '• 动态规划：时间 <code>O(n^2)</code>，空间 <code>O(n)</code>。<br>• 数学规律：尽量多拆出 3，乘积最大。', icon: '⏱️', badge: '数学贪心' },
      ],
    },
  },
  generateSteps: (input: { n?: number } | number): DpTraceStep[] => {
    const n = typeof input === 'number' ? input : (input?.n || 10);
    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));
    const numDp: number[] = Array(n + 1).fill(0);
    const dp: import('../../engine/types').DpCell[] = Array(n + 1).fill('-');

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      opt1?: number | string;
      opt2?: number | string;
      currentDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const o1 = opts.opt1 ?? '-';
      const o2 = opts.opt2 ?? '-';
      const curDp = opts.currentDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'n (目标整数)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: 'dp (最大乘积数组)', value: `[${dp.slice(2).join(', ')}]`, type: 'string' as const, changed: chSet.has('dp') },
        { name: 'i (当前拆分目标)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (拆分切分点)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'j*(i-j) (拆为两数)', value: String(o1), type: (typeof o1 === 'number' ? 'number' : 'string') as any, changed: chSet.has('opt1') },
        { name: 'j*dp[i-j] (拆为多数)', value: String(o2), type: (typeof o2 === 'number' ? 'number' : 'string') as any, changed: chSet.has('opt2') },
        { name: 'dp[i] (当前最大乘积)', value: String(curDp), type: (typeof curDp === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
      ];
    };

    // Step 0: Function entry
    push({
      dp1d: clone1d(dp),
      current: { index: 0 },
      message: `🎯 【函数主入口】进入 integerBreak(n = ${n})，准备求解拆分正整数 ${n} 的最大乘积。`,
      log: `进入 integerBreak(n = ${n})`,
      formula: `integerBreak(${n})`,
      metrics: { i: '-', j: '-', 'j*(i-j)': '-', 'j*dp[i-j]': '-', 'dp[i]': '-' },
      vars: makeVars({ changed: ['n'] }),
      codeLine: { java: 2, cpp: 3, python: 2, javascript: 1 },
    });

    // Step 1: dp[2] = 1
    numDp[2] = 1;
    dp[2] = 1;
    push({
      dp1d: clone1d(dp),
      current: { index: 2 },
      message: '🎬 【初始化边界 dp[2]】执行 dp[2] = 1;，数字 2 只能拆分成 1+1，乘积为 1。',
      log: '初始化: dp[2] = 1',
      formula: 'dp[2] = 1',
      metrics: { i: 2, j: '-', 'j*(i-j)': '-', 'j*dp[i-j]': '-', 'dp[i]': 1 },
      vars: makeVars({ currentDp: 1, changed: ['dp', 'dpi'] }),
      codeLine: { java: 4, cpp: 5, python: 4, javascript: 3 },
    });

    for (let i = 3; i <= n; i++) {
      // Outer loop check
      push({
        dp1d: clone1d(dp),
        current: { index: i },
        message: `🔄 【外层循环递推】当前 i = ${i} <= ${n} 为 true，准备计算拆分数字 ${i} 的最大乘积。`,
        log: `外层循环: i = ${i} <= ${n}`,
        formula: `for (int i = 3; i <= ${n}; i++) [i = ${i}]`,
        metrics: { i, j: '-', 'j*(i-j)': '-', 'j*dp[i-j]': '-', 'dp[i]': numDp[i] || '-' },
        vars: makeVars({ i, changed: ['i'] }),
        codeLine: { java: 5, cpp: 6, python: 5, javascript: 4 },
      });

      const maxJ = Math.floor(i / 2);
      for (let j = 1; j <= maxJ; j++) {
        const opt1 = j * (i - j);
        const opt2 = j * numDp[i - j];
        const prevDp = numDp[i];
        numDp[i] = Math.max(numDp[i], Math.max(opt1, opt2));
        dp[i] = numDp[i];

        push({
          dp1d: clone1d(dp),
          current: { index: i },
          dependencies: [{ index: i - j }],
          message: `⚡ 【内层拆分决策】j = ${j}：拆成两数 (${j}×${i - j}=${opt1}) vs 拆成多数 (${j}×dp[${i - j}](${numDp[i - j]})=${opt2})，当前 dp[${i}] 更新为 ${dp[i]}。`,
          log: `dp[${i}] = max(${prevDp}, ${opt1}, ${opt2}) = ${dp[i]}`,
          formula: `dp[${i}] = max(dp[${i}], max(${j}×(${i}-${j}), ${j}×dp[${i - j}])) = ${dp[i]}`,
          metrics: { i, j, 'j*(i-j)': opt1, 'j*dp[i-j]': opt2, 'dp[i]': numDp[i] },
          vars: makeVars({ i, j, opt1, opt2, currentDp: numDp[i], changed: ['j', 'opt1', 'opt2', 'dp', 'dpi'] }),
          codeLine: { java: 7, cpp: 8, python: 7, javascript: 6 },
        });
      }
    }

    // Return
    push({
      dp1d: clone1d(dp),
      current: { index: n },
      message: `🎉 【函数返回】执行 return dp[${n}];，拆分正整数 ${n} 的最大乘积为 ${dp[n]}！`,
      log: `计算完成: return dp[${n}] = ${dp[n]}`,
      formula: `return dp[${n}] = ${dp[n]}`,
      metrics: { i: n, j: '-', 'j*(i-j)': '-', 'j*dp[i-j]': '-', 'dp[i]': numDp[n] },
      vars: makeVars({ i: n, currentDp: numDp[n], changed: ['dpi'] }),
      codeLine: { java: 10, cpp: 11, python: 8, javascript: 9 },
    });

    return steps;
  },
};
