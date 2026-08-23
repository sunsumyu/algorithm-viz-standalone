import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const UncrossedLinesSpec: AlgorithmSpec = {
  id: 'uncrossed-lines',
  name: '不相交的线 (Uncrossed Lines)',
  category: '子序列 DP',
  description: '在两条水平线上连接相同数字且线不相交，求最多可以绘制的不相交连接线条数（等价于求两数组 LCS）。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 1035,
    leetcodeUrl: 'https://leetcode.cn/problems/uncrossed-lines/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '二维DP'],
    description: '在两条独立的水平线上按给定的顺序写下 <code>nums1</code> 和 <code>nums2</code> 中的整数。<br/><br/>现在，可以绘制一些连接两个数字 <code>nums1[i]</code> 和 <code>nums2[j]</code> 的直线，这些直线需要同时满足：<br/>1. <code>nums1[i] == nums2[j]</code><br/>2. 且绘制的直线不与任何其他连线（水平、垂直或相交）相交。<br/><br/>请注意，连线即使在端点也不能相交：每个数字只能属于一条连线。<br/><br/>以这种方法绘制线条，并返回可以绘制的 <strong>最大连接线条数</strong> 。',
    examples: [
      {
        input: 'nums1 = [1,4,2], nums2 = [1,2,4]',
        output: '2',
        explanation: '可以连接 nums1[0] 和 nums2[0] (值为 1)，nums1[2] 和 nums2[1] (值为 2)。无法再连接 4，因为连线会相交。',
      },
      {
        input: 'nums1 = [2,5,1,2,5], nums2 = [10,5,2,1,5,2]',
        output: '3',
      },
    ],
    constraints: [
      '1 <= nums1.length, nums2.length <= 500',
      '1 <= nums1[i], nums2[j] <= 2000',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: 4, cpp: 4, python: 4, javascript: 3 },
    loopCheck: { java: 5, cpp: 5, python: 5, javascript: 4 },
    innerLoopCheck: { java: 6, cpp: 6, python: 6, javascript: 5 },
    stateTransfer: {
      java: { primary: [8, 10], context: [5, 6] },
      cpp: { primary: [8, 10], context: [5, 6] },
      python: { primary: [8, 10], context: [5, 6] },
      javascript: { primary: [7, 9], context: [4, 5] },
    },
    loopExit: { java: 5, cpp: 5, python: 5, javascript: 4 },
    returnResult: { java: 14, cpp: 14, python: 12, javascript: 13 },
  },
  code: {
    languages: {
      javascript: [
        'function maxUncrossedLines(nums1, nums2) {',
        '    const m = nums1.length, n = nums2.length;',
        '    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
        '    for (let i = 1; i <= m; i++) {',
        '        for (let j = 1; j <= n; j++) {',
        '            if (nums1[i - 1] === nums2[j - 1]) {',
        '                dp[i][j] = dp[i - 1][j - 1] + 1; // 匹配：连一条不相交线',
        '            } else {',
        '                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);',
        '            }',
        '        }',
        '    }',
        '    return dp[m][n];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxUncrossedLines(int[] nums1, int[] nums2) {',
        '        int m = nums1.length, n = nums2.length;',
        '        int[][] dp = new int[m + 1][n + 1];',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (nums1[i - 1] == nums2[j - 1]) {',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1;',
        '                } else {',
        '                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);',
        '                }',
        '            }',
        '        }',
        '        return dp[m][n];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxUncrossedLines(vector<int>& nums1, vector<int>& nums2) {',
        '        int m = nums1.size(), n = nums2.size();',
        '        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (nums1[i - 1] == nums2[j - 1]) {',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1;',
        '                } else {',
        '                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);',
        '                }',
        '            }',
        '        }',
        '        return dp[m][n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxUncrossedLines(self, nums1: List[int], nums2: List[int]) -> int:',
        '        m, n = len(nums1), len(nums2)',
        '        dp = [[0] * (n + 1) for _ in range(m + 1)]',
        '        for i in range(1, m + 1):',
        '            for j in range(1, n + 1):',
        '                if nums1[i - 1] == nums2[j - 1]:',
        '                    dp[i][j] = dp[i - 1][j - 1] + 1',
        '                else:',
        '                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])',
        '        return dp[m][n]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：接收两数组 nums1 和 nums2，求最大不相交连线条数。',
        2: '获取规模：m 为 nums1 长度，n 为 nums2 长度。',
        3: '开辟状态表：本质等价于求两数组的最长公共子序列 (LCS)。',
        4: '外层遍历 nums1。',
        5: '内层遍历 nums2。',
        6: '数值比对：检查 nums1[i-1] 是否与 nums2[j-1] 相同。',
        7: '匹配成功：绘制一条新线，由左上角转移 dp[i][j] = dp[i-1][j-1] + 1。',
        9: '数值不同：dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])。',
        13: '返回全局最多连线条数 dp[m][n]。',
      },
      java: {
        2: '函数入口：计算最大不相交线。',
        3: '获取数组规模 m 与 n。',
        4: '开辟 dp 网格。',
        5: '遍历 nums1。',
        6: '遍历 nums2。',
        7: '比对数值是否相同。',
        8: '匹配：连线 +1。',
        10: '不匹配：取上方/左方最大值。',
        14: '返回 dp[m][n]。',
      },
      cpp: {
        3: '函数入口。',
        4: '获取长度。',
        5: '开辟 dp 网格。',
        6: '外层循环。',
        7: '内层循环。',
        8: '匹配转移 +1。',
        10: '不匹配转移取最大。',
        14: '返回答案。',
      },
      python: {
        2: '函数入口。',
        3: '获取长度。',
        4: '初始化二维列表。',
        5: '外层循环。',
        6: '内层循环。',
        7: '匹配转移。',
        9: '不匹配转移。',
        11: '返回 dp[m][n]。',
      },
    },
    keyPoints: {
      title: '🎯 不相交的线 (Uncrossed Lines) 5 步法要点',
      summary: 'LeetCode 1035。经典题型转化：连线不相交且数字相同，数学本质就是两序列的最长公共子序列 (LCS)！',
      points: [
        { label: '一、问题模型转化', desc: '绘制不相交连线等价于在两个序列中寻找保持相对先后顺序相同的子序列，即 <strong>最长公共子序列 (LCS)</strong>。', icon: '🎯', badge: 'LCS 变种' },
        { label: '二、状态转移方程', desc: '• <code>nums1[i-1] == nums2[j-1]</code>：<code>dp[i][j] = dp[i-1][j-1] + 1</code>。<br>• <code>nums1[i-1] != nums2[j-1]</code>：<code>dp[i][j] = max(dp[i-1][j], dp[i][j-1])</code>。', icon: '⚡', badge: '标准 LCS 递推' },
        { label: '三、初始化与边界', desc: '<code>dp[i][0] = 0, dp[0][j] = 0</code>。', icon: '🎬', badge: '全 0 边界' },
        { label: '四、遍历推导顺序', desc: '双层正序递推，从左到右、从上到下。', icon: '🧭', badge: '左上到右下' },
        { label: '五、复杂度分析', desc: '• 时间复杂度：<code>O(m × n)</code>。<br>• 空间复杂度：<code>O(m × n)</code>。', icon: '⏱️', badge: 'O(m*n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let arr1: number[] = [1, 4, 2];
    let arr2: number[] = [1, 2, 4];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.nums1)) arr1 = input.nums1;
      else if (typeof input.nums1 === 'string') arr1 = input.nums1.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      else if (typeof input.s === 'string') arr1 = input.s.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));

      if (Array.isArray(input.nums2)) arr2 = input.nums2;
      else if (typeof input.nums2 === 'string') arr2 = input.nums2.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      else if (typeof input.t === 'string') arr2 = input.t.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    }

    const m = arr1.length;
    const n = arr2.length;
    const dp: DpCell[][] = Array.from({ length: m + 1 }, () =>
      Array.from({ length: n + 1 }, () => '-')
    );

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      v1?: number | string;
      v2?: number | string;
      curDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const v1 = opts.v1 ?? '-';
      const v2 = opts.v2 ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'nums1', value: `[${arr1.join(', ')}]`, type: 'string' as const, changed: chSet.has('n1') },
        { name: 'nums2', value: `[${arr2.join(', ')}]`, type: 'string' as const, changed: chSet.has('n2') },
        { name: 'm (长度1)', value: String(m), type: 'number' as const, changed: chSet.has('m') },
        { name: 'n (长度2)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: 'i (当前索引1)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (当前索引2)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'nums1[i-1]', value: String(v1), type: (typeof v1 === 'number' ? 'number' : 'string') as any, changed: chSet.has('v1') },
        { name: 'nums2[j-1]', value: String(v2), type: (typeof v2 === 'number' ? 'number' : 'string') as any, changed: chSet.has('v2') },
        { name: 'dp[i][j]', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpij') },
      ];
    };

    // Step 0: Function entry
    push({
      dp2d: clone2d(dp),
      source: arr1.map(String),
      target: arr2.map(String),
      message: `🎯 函数入口：计算 nums1 = [${arr1.join(',')}] 与 nums2 = [${arr2.join(',')}] 的最大不相交连线条数（等价于 LCS）。`,
      log: `entry: nums1=[${arr1.join(',')}], nums2=[${arr2.join(',')}]`,
      vars: makeVars({ changed: ['n1', 'n2', 'm', 'n'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Boundaries
    for (let i = 0; i <= m; i++) dp[i][0] = 0;
    for (let j = 0; j <= n; j++) dp[0][j] = 0;

    push({
      dp2d: clone2d(dp),
      source: arr1.map(String),
      target: arr2.map(String),
      message: '🎬 边界初始化：空前缀连线条数为 0 (dp[i][0]=0, dp[0][j]=0)。',
      log: 'init: dp[i][0]=0, dp[0][j]=0',
      vars: makeVars({ changed: ['dpij'] }),
      codeLine: { java: 4, cpp: 4, python: 4, javascript: 3 },
    });

    // Loops
    for (let i = 1; i <= m; i++) {
      const val1 = arr1[i - 1];

      push({
        dp2d: clone2d(dp),
        source: arr1.map(String),
        target: arr2.map(String),
        current: { row: i, col: 0 },
        message: `🔄 外层循环：i = ${i}，考察 nums1[${i - 1}] = ${val1}。`,
        log: `outer loop: i=${i}, val1=${val1}`,
        vars: makeVars({ i, v1: val1, changed: ['i', 'v1'] }),
        codeLine: { java: 5, cpp: 5, python: 5, javascript: 4 },
      });

      for (let j = 1; j <= n; j++) {
        const val2 = arr2[j - 1];
        const isMatch = val1 === val2;

        push({
          dp2d: clone2d(dp),
          source: arr1.map(String),
          target: arr2.map(String),
          current: { row: i, col: j },
          dependencies: isMatch
            ? [{ row: i - 1, col: j - 1 }]
            : [{ row: i - 1, col: j }, { row: i, col: j - 1 }],
          message: isMatch
            ? `🔍 比对数字：nums1[${i - 1}] (${val1}) === nums2[${j - 1}] (${val2}) 【可连一条不相交线 ✓】！`
            : `🔍 比对数字：nums1[${i - 1}] (${val1}) !== nums2[${j - 1}] (${val2}) 【数值不同 ✗】。`,
          log: `compare: nums1[${i-1}]=${val1}, nums2[${j-1}]=${val2}`,
          vars: makeVars({ i, j, v1: val1, v2: val2, changed: ['j', 'v2'] }),
          codeLine: {
            java: { primary: 7, context: [5, 6] },
            cpp: { primary: 7, context: [5, 6] },
            python: { primary: 6, context: [5] },
            javascript: { primary: 6, context: [4, 5] },
          },
        });

        let resultVal: number;
        if (isMatch) {
          const prev = (dp[i - 1][j - 1] as number) || 0;
          resultVal = prev + 1;
          dp[i][j] = resultVal;

          push({
            dp2d: clone2d(dp),
            source: arr1.map(String),
            target: arr2.map(String),
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j - 1 }],
            formula: `dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${prev} + 1 = ${resultVal}`,
            message: `⚡ 状态转移 (连线)：由左上方 dp[${i - 1}][${j - 1}] (${prev}) + 1 = ${resultVal} 条线。`,
            log: `match update: dp[${i}][${j}] = ${resultVal}`,
            vars: makeVars({ i, j, v1: val1, v2: val2, curDp: resultVal, changed: ['dpij'] }),
            codeLine: {
              java: { primary: 8, context: [5, 6] },
              cpp: { primary: 8, context: [5, 6] },
              python: { primary: 7, context: [5] },
              javascript: { primary: 7, context: [4, 5] },
            },
          });
        } else {
          const up = (dp[i - 1][j] as number) || 0;
          const left = (dp[i][j - 1] as number) || 0;
          resultVal = Math.max(up, left);
          dp[i][j] = resultVal;

          push({
            dp2d: clone2d(dp),
            source: arr1.map(String),
            target: arr2.map(String),
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j }, { row: i, col: j - 1 }],
            formula: `dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = max(${up}, ${left}) = ${resultVal}`,
            message: `⚡ 状态转移 (不连线)：取上方 (${up}) 与左方 (${left}) 较大者 = ${resultVal}。`,
            log: `nomatch update: dp[${i}][${j}] = ${resultVal}`,
            vars: makeVars({ i, j, v1: val1, v2: val2, curDp: resultVal, changed: ['dpij'] }),
            codeLine: {
              java: { primary: 10, context: [5, 6] },
              cpp: { primary: 10, context: [5, 6] },
              python: { primary: 9, context: [5] },
              javascript: { primary: 9, context: [4, 5] },
            },
          });
        }
      }
    }

    const ans = dp[m][n] as number;
    push({
      dp2d: clone2d(dp),
      source: arr1.map(String),
      target: arr2.map(String),
      current: { row: m, col: n },
      message: `🏁 算法结束：最多可以绘制 ${ans} 条不相交连线。`,
      log: `return: dp[${m}][${n}]=${ans}`,
      vars: makeVars({ curDp: ans, changed: ['dpij'] }),
      codeLine: { java: 14, cpp: 14, python: 12, javascript: 13 },
    });

    return steps;
  },
};
