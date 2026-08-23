import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const UniqueBstSpec: AlgorithmSpec = {
  id: 'unique-bst',
  name: '不同的二叉搜索树 (Unique BST)',
  category: '线性 DP',
  description: '给定一个整数 n，求恰由 n 个节点组成且节点值从 1 到 n 互不相同的二叉搜索树有多少种？',
  difficulty: 'medium',
  problem: {
    leetcodeId: 96,
    leetcodeUrl: 'https://leetcode.cn/problems/unique-binary-search-trees/',
    difficulty: 'medium',
    tags: ['树', '二叉搜索树', '动态规划', '数学', '卡特兰数'],
    description: '给你一个整数 <code>n</code> ，求恰由 <code>n</code> 个节点组成且节点值从 <code>1</code> 到 <code>n</code> 互不相同的 <strong>二叉搜索树（BST）</strong> 有多少种？返回满足题意的二叉搜索树的种数。',
    examples: [
      {
        input: 'n = 3',
        output: '5',
        explanation: '3 个节点可构成的 5 种不同形态 BST。',
      },
      {
        input: 'n = 1',
        output: '1',
      },
    ],
    constraints: [
      '1 <= n <= 19',
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
        'function numTrees(n) {',
        '    const dp = new Array(n + 1).fill(0); // dp[i] 表示 i 个不同节点组成的 BST 数量',
        '    dp[0] = 1; // 空树作为子树乘法基底算 1 种',
        '    for (let i = 1; i <= n; i++) { // 节点规模递增',
        '        for (let j = 1; j <= i; j++) { // 枚举以 j 作为根节点',
        '            dp[i] += dp[j - 1] * dp[i - j]; // 左子树形态 × 右子树形态',
        '        }',
        '    }',
        '    return dp[n]; // 返回 n 个节点的 BST 数量 (卡特兰数)',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int numTrees(int n) {',
        '        int[] dp = new int[n + 1];',
        '        dp[0] = 1;',
        '        for (int i = 1; i <= n; i++) {',
        '            for (int j = 1; j <= i; j++) {',
        '                dp[i] += dp[j - 1] * dp[i - j];',
        '            }',
        '        }',
        '        return dp[n];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int numTrees(int n) {',
        '        vector<int> dp(n + 1, 0);',
        '        dp[0] = 1;',
        '        for (int i = 1; i <= n; i++) {',
        '            for (int j = 1; j <= i; j++) {',
        '                dp[i] += dp[j - 1] * dp[i - j];',
        '            }',
        '        }',
        '        return dp[n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def numTrees(self, n: int) -> int:',
        '        dp = [0] * (n + 1)',
        '        dp[0] = 1',
        '        for i in range(1, n + 1):',
        '            for j in range(1, i + 1):',
        '                dp[i] += dp[j - 1] * dp[i - j]',
        '        return dp[n]',
      ],
    },
    lineExplanations: {
      java: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：接收节点总数 n，计算不同形态二叉搜索树（BST）的总数。',
        3: '🗺️ <strong>开辟状态数组</strong>：dp[i] 表示由 i 个不同节点组成的 BST 形态种数。',
        4: '🎬 <strong>边界初始化 (dp[0])</strong>：空树形态种数 dp[0] = 1（乘法乘积基底）。',
        5: '🔄 <strong>外层循环节点规模</strong>：从 i = 1 逐步推导到 n 个节点。',
        6: '🔍 <strong>内层枚举根节点 j</strong>：枚举以 j 作为根节点（1 <= j <= i）。',
        7: '⚡ <strong>笛卡尔积状态转移</strong>：左子树有 j-1 个节点，右子树有 i-j 个节点：dp[i] += dp[j-1] * dp[i-j]。',
        8: '内层作用域闭合。',
        9: '外层作用域闭合。',
        10: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为 n 个节点构成的不同 BST 数量（卡特兰数）。',
        11: '函数体结束。',
        12: '类定义结束。',
      },
      cpp: {
        1: '类定义 Solution。',
        2: '公有访问权限声明 public。',
        3: '🎯 <strong>函数主入口</strong>：接收节点总数 n，计算不同形态二叉搜索树（BST）的总数。',
        4: '🗺️ <strong>开辟状态空间</strong>：vector<int> dp(n + 1, 0)。',
        5: '🎬 <strong>边界初始化 (dp[0])</strong>：dp[0] = 1。',
        6: '🔄 <strong>外层循环节点规模</strong>：for (int i = 1; i <= n; i++)。',
        7: '🔍 <strong>内层枚举根节点 j</strong>：for (int j = 1; j <= i; j++)。',
        8: '⚡ <strong>笛卡尔积状态转移</strong>：dp[i] += dp[j-1] * dp[i-j]。',
        9: '内层循环闭合。',
        10: '外层循环闭合。',
        11: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
        12: '函数体结束。',
        13: '类定义结束。',
      },
      python: {
        1: '类定义 Solution。',
        2: '🎯 <strong>函数主入口</strong>：numTrees(n) 求解 n 个节点构成的不同 BST 数量。',
        3: '🗺️ <strong>开辟状态数组</strong>：dp = [0] * (n + 1)。',
        4: '🎬 <strong>边界初始化</strong>：dp[0] = 1。',
        5: '🔄 <strong>外层循环推进</strong>：for i in range(1, n + 1):',
        6: '🔍 <strong>内层枚举根节点</strong>：for j in range(1, i + 1):',
        7: '⚡ <strong>状态转移决策</strong>：dp[i] += dp[j - 1] * dp[i - j]。',
        8: '🏁 <strong>返回全局最优解</strong>：return dp[n]。',
      },
      javascript: {
        1: '🎯 <strong>函数主入口</strong>：接收节点总数 n，计算不同形态二叉搜索树（BST）的总数。',
        2: '🗺️ <strong>开辟状态数组</strong>：dp[i] 表示由 i 个不同节点组成的 BST 形态种数。',
        3: '🎬 <strong>边界初始化 (dp[0])</strong>：空树形态种数 dp[0] = 1（乘法乘积基底）。',
        4: '🔄 <strong>外层循环节点规模</strong>：从 i = 1 逐步推导到 n 个节点。',
        5: '🔍 <strong>内层枚举根节点 j</strong>：枚举以 j 作为根节点（1 <= j <= i）。',
        6: '⚡ <strong>笛卡尔积状态转移</strong>：左子树有 j-1 个节点，右子树有 i-j 个节点：dp[i] += dp[j-1] * dp[i-j]。',
        7: '内层作用域闭合。',
        8: '外层作用域闭合。',
        9: '🏁 <strong>返回全局最优解</strong>：dp[n] 即为 n 个节点构成的不同 BST 数量（卡特兰数）。',
        10: '函数体结束。',
      },
    },
    keyPoints: {
      title: '🎯 不同的二叉搜索树 (Unique BST) 5步动规核心要点',
      summary: 'LeetCode 96。经典卡特兰数模型，利用二叉搜索树左小右大的性质将根节点左右划分为子问题。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i]</code>：<code>i</code> 个互不相同节点所能构成的不同形态 BST 数量。', icon: '🎯', badge: '形态种数' },
        { label: '二、状态转移方程', desc: '<code>dp[i] += dp[j - 1] * dp[i - j]</code>（以 <code>j</code> 为根，左子树 <code>j-1</code> 个节点，右子树 <code>i-j</code> 个节点）。', icon: '⚡', badge: '笛卡尔积' },
        { label: '三、初始化与边界条件', desc: '<code>dp[0] = 1</code>（空树作为子树乘法基底算 1 种）。', icon: '🎬', badge: '空树基底' },
        { label: '四、遍历推进顺序', desc: '外层节点数 <code>i: 1..n</code>，内层根节点 <code>j: 1..i</code>。', icon: '🧭', badge: '双重循环' },
        { label: '五、数学卡特兰数', desc: '• 动态规划：时间 <code>O(n^2)</code>，空间 <code>O(n)</code>。<br>• 闭式公式：卡特兰数 <code>C_n = (2n)! / ((n+1)! * n!)</code>。', icon: '⏱️', badge: '卡特兰数' },
      ],
    },
  },
  generateSteps: (input: { n?: number } | number): DpTraceStep[] => {
    const n = typeof input === 'number' ? input : (input?.n || 3);
    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));
    const numDp: number[] = Array(n + 1).fill(0);
    const dp: import('../../engine/types').DpCell[] = Array(n + 1).fill('-');

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      left?: number | string;
      right?: number | string;
      currentDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const lVal = opts.left ?? '-';
      const rVal = opts.right ?? '-';
      const curDp = opts.currentDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'n (节点总数)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: 'dp (形态数数组)', value: `[${dp.join(', ')}]`, type: 'string' as const, changed: chSet.has('dp') },
        { name: 'i (当前规模)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (选定根节点)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: '左子树 dp[j-1]', value: String(lVal), type: (typeof lVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('left') },
        { name: '右子树 dp[i-j]', value: String(rVal), type: (typeof rVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('right') },
        { name: 'dp[i] (当前总形态数)', value: String(curDp), type: (typeof curDp === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpi') },
      ];
    };

    // Step 0: Function entry
    push({
      dp1d: clone1d(dp),
      current: { index: 0 },
      message: `🎯 【函数主入口】进入 numTrees(n = ${n})，准备求解 ${n} 个节点所能构成的不同 BST 数量。`,
      log: `进入 numTrees(n = ${n})`,
      formula: `numTrees(${n})`,
      metrics: { i: '-', j: '-', '左子树 dp[j-1]': '-', '右子树 dp[i-j]': '-', 'dp[i]': '-' },
      vars: makeVars({ changed: ['n'] }),
      codeLine: { java: 2, cpp: 3, python: 2, javascript: 1 },
    });

    // Step 1: dp[0] = 1
    numDp[0] = 1;
    dp[0] = 1;
    push({
      dp1d: clone1d(dp),
      current: { index: 0 },
      message: '🎬 【初始化边界 dp[0]】执行 dp[0] = 1;，空树作为子树乘积基底记为 1 种形态。',
      log: '初始化: dp[0] = 1',
      formula: 'dp[0] = 1',
      metrics: { i: 0, j: '-', '左子树 dp[j-1]': '-', '右子树 dp[i-j]': '-', 'dp[i]': 1 },
      vars: makeVars({ currentDp: 1, changed: ['dp', 'dpi'] }),
      codeLine: { java: 4, cpp: 5, python: 4, javascript: 3 },
    });

    for (let i = 1; i <= n; i++) {
      // Outer loop check
      push({
        dp1d: clone1d(dp),
        current: { index: i },
        message: `🔄 【外层循环递推】当前节点规模 i = ${i} <= ${n} 为 true，准备计算由 ${i} 个节点组成的 BST 数量。`,
        log: `外层循环: i = ${i} <= ${n}`,
        formula: `for (int i = 1; i <= ${n}; i++) [i = ${i}]`,
        metrics: { i, j: '-', '左子树 dp[j-1]': '-', '右子树 dp[i-j]': '-', 'dp[i]': numDp[i] || '-' },
        vars: makeVars({ i, changed: ['i'] }),
        codeLine: { java: 5, cpp: 6, python: 5, javascript: 4 },
      });

      for (let j = 1; j <= i; j++) {
        const leftCount = numDp[j - 1];
        const rightCount = numDp[i - j];
        const addCount = leftCount * rightCount;
        numDp[i] += addCount;
        dp[i] = numDp[i];

        push({
          dp1d: clone1d(dp),
          current: { index: i },
          dependencies: [{ index: j - 1 }, { index: i - j }],
          message: `⚡ 【笛卡尔积累加】根节点取 j = ${j}：左子树 ${j - 1} 节点 (${leftCount} 种) × 右子树 ${i - j} 节点 (${rightCount} 种) = 贡献 ${addCount} 种，累加后 dp[${i}] = ${dp[i]}。`,
          log: `dp[${i}] += dp[${j - 1}] * dp[${i - j}] = ${leftCount} * ${rightCount} = ${addCount} ➔ dp[${i}] = ${dp[i]}`,
          formula: `dp[${i}] += dp[${j - 1}] × dp[${i - j}] = ${leftCount} × ${rightCount} = ${addCount}`,
          metrics: { i, j, '左子树 dp[j-1]': leftCount, '右子树 dp[i-j]': rightCount, 'dp[i]': numDp[i] },
          vars: makeVars({ i, j, left: leftCount, right: rightCount, currentDp: numDp[i], changed: ['j', 'left', 'right', 'dp', 'dpi'] }),
          codeLine: { java: 7, cpp: 8, python: 7, javascript: 6 },
        });
      }
    }

    // Return
    push({
      dp1d: clone1d(dp),
      current: { index: n },
      message: `🎉 【函数返回】执行 return dp[${n}];，由 ${n} 个不同节点构成的二叉搜索树总共有 ${dp[n]} 种形态！`,
      log: `计算完成: return dp[${n}] = ${dp[n]}`,
      formula: `return dp[${n}] = ${dp[n]}`,
      metrics: { i: n, j: '-', '左子树 dp[j-1]': '-', '右子树 dp[i-j]': '-', 'dp[i]': numDp[n] },
      vars: makeVars({ i: n, currentDp: numDp[n], changed: ['dpi'] }),
      codeLine: { java: 10, cpp: 11, python: 8, javascript: 9 },
    });

    return steps;
  },
};
