import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const PerfectSquaresSpec: AlgorithmSpec = {
  id: 'perfect-squares',
  name: '完全平方数 (Perfect Squares)',
  category: '背包 DP',
  description: '给你一个整数 n ，返回和为 n 的完全平方数的最少数量。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 279,
    leetcodeUrl: 'https://leetcode.cn/problems/perfect-squares/',
    difficulty: 'medium',
    tags: ['广度优先搜索', '数学', '动态规划', '完全背包'],
    description: '给你一个整数 <code>n</code> ，返回 <em>和为 <code>n</code> 的完全平方数的最少数量</em> 。<br/><br/><strong>完全平方数</strong> 是一个整数，其值等于另一个整数的平方；换句话说，其值等于一个整数乘以自身。例如，<code>1</code>、<code>4</code>、<code>9</code> 和 <code>16</code> 都是完全平方数，而 <code>3</code> 和 <code>11</code> 不是。<br/><br/><strong>模型转化</strong>：物品为 <code>1^2, 2^2, 3^2, ... <= n</code>，背包容量为 <code>n</code>，求装满背包所需的最少物品件数（完全背包求最小值）。',
    examples: [
      {
        input: 'n = 12',
        output: '3',
        explanation: '12 = 4 + 4 + 4，共 3 个完全平方数。',
      },
      {
        input: 'n = 13',
        output: '2',
        explanation: '13 = 4 + 9，共 2 个完全平方数。',
      },
    ],
    constraints: [
      '1 <= n <= 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [4, 5], cpp: [4, 5], python: [3, 4], javascript: [3, 4] },
    loopCheck: { java: 6, cpp: 6, python: 5, javascript: 5 },
    innerLoopCheck: { java: 7, cpp: 7, python: 6, javascript: 6 },
    stateTransfer: {
      java: { primary: 8, context: [6, 7] },
      cpp: { primary: 8, context: [6, 7] },
      python: { primary: 7, context: [5, 6] },
      javascript: { primary: 7, context: [5, 6] },
    },
    loopExit: { java: 6, cpp: 6, python: 5, javascript: 5 },
    returnResult: { java: 11, cpp: 11, python: 9, javascript: 10 },
  },
  code: {
    languages: {
      javascript: [
        'function numSquares(n) {',
        '    const dp = new Array(n + 1).fill(Infinity);',
        '    dp[0] = 0; // 和为 0 需 0 个平方数',
        '    for (let i = 1; i * i <= n; i++) { // 遍历完全平方数 1, 4, 9...',
        '        const sq = i * i;',
        '        for (let j = sq; j <= n; j++) { // 正序遍历容量（完全背包）',
        '            dp[j] = Math.min(dp[j], dp[j - sq] + 1);',
        '        }',
        '    }',
        '    return dp[n];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int numSquares(int n) {',
        '        int[] dp = new int[n + 1];',
        '        Arrays.fill(dp, Integer.MAX_VALUE);',
        '        dp[0] = 0;',
        '        for (int i = 1; i * i <= n; i++) {',
        '            int sq = i * i;',
        '            for (int j = sq; j <= n; j++) {',
        '                dp[j] = Math.min(dp[j], dp[j - sq] + 1);',
        '            }',
        '        }',
        '        return dp[n];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int numSquares(int n) {',
        '        vector<int> dp(n + 1, INT_MAX);',
        '        dp[0] = 0;',
        '        for (int i = 1; i * i <= n; i++) {',
        '            int sq = i * i;',
        '            for (int j = sq; j <= n; j++) {',
        '                dp[j] = min(dp[j], dp[j - sq] + 1);',
        '            }',
        '        }',
        '        return dp[n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def numSquares(self, n: int) -> int:',
        '        dp = [float(\'inf\')] * (n + 1)',
        '        dp[0] = 0',
        '        for i in range(1, int(n**0.5) + 1):',
        '            sq = i * i',
        '            for j in range(sq, n + 1):',
        '                dp[j] = min(dp[j], dp[j - sq] + 1)',
        '        return dp[n]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：求解和为 n 的最少完全平方数个数。',
        2: '开辟一维状态数组 dp[n + 1]，初始化为无穷大。',
        3: '初始化：dp[0] = 0（和为 0 需要 0 个数）。',
        4: '外层循环：遍历所有候选平方数 1, 4, 9... (i*i <= n)。',
        5: '计算当前平方数 sq = i * i。',
        6: '内层正序遍历容量：从 sq 到 n。',
        7: '取较小数量状态转移：dp[j] = Math.min(dp[j], dp[j - sq] + 1)。',
        10: '返回全局最优解 dp[n]。',
      },
      java: {
        2: '函数入口。',
        4: '填充 Integer.MAX_VALUE。',
        5: 'dp[0] = 0。',
        6: '外层遍历平方数。',
        8: '正序遍历容量。',
        9: 'min 转移。',
        12: '返回 dp[n]。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 向量与 dp[0] = 0。',
        6: '遍历完全平方数。',
        8: '正序遍历容量。',
        9: '转移求最小值。',
        12: '返回 dp[n]。',
      },
      python: {
        2: '函数入口。',
        3: '初始化列表。',
        4: 'dp[0] = 0。',
        5: '遍历平方根。',
        7: '正序遍历容量。',
        8: 'min 转移。',
        9: '返回 dp[n]。',
      },
    },
    keyPoints: {
      title: '🎯 完全平方数 5 步法系统精讲',
      summary: 'LeetCode 279。完全背包求最小价值。物品即为 1, 4, 9, 16... 等完全平方数，背包容量为 n，每种平方数可以无限次选取！',
      points: [
        { label: '一、模型转化', desc: '物品清单为 <code>i × i <= n</code> 的所有完全平方数，求恰好装满容量 <code>n</code> 的最少物品个数。', icon: '🎯', badge: '完全背包模型' },
        { label: '二、状态转移方程', desc: '<code>dp[j] = min(dp[j], dp[j - i*i] + 1)</code>。', icon: '⚡', badge: '求最小值' },
        { label: '三、初始化', desc: '<code>dp[0] = 0</code>，其余初始化为无穷大 <code>Infinity</code>。', icon: '🎬', badge: 'dp[0]=0' },
        { label: '四、遍历顺序', desc: '外层遍历完全平方数，内层<strong>正序</strong>遍历容量 <code>j 从 i*i 到 n</code>。', icon: '🧭', badge: '正序遍历' },
        { label: '五、复杂度分析', desc: '• 时间复杂度：<code>O(n × √n)</code>。<br>• 空间复杂度：<code>O(n)</code>。', icon: '⏱️', badge: 'O(n*√n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let n = 12;

    if (typeof input === 'object' && input) {
      if (typeof input.n === 'number') n = input.n;
      else if (typeof input.target === 'number') n = input.target;
      else if (typeof input.amount === 'number') n = input.amount;
      else if (typeof input.s === 'string') {
        const parsed = parseInt(input.s, 10);
        if (!isNaN(parsed)) n = parsed;
      }
    }

    const maxSquares = Math.floor(Math.sqrt(n));
    const squares: number[] = [];
    for (let i = 1; i <= maxSquares; i++) squares.push(i * i);

    const dp: DpCell[] = Array(n + 1).fill('∞');
    dp[0] = 0;

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      sqIdx?: number | string;
      curSq?: number | string;
      curJ?: number | string;
      curDp?: number | string;
      changed?: string[];
    }) => {
      const sIdx = opts.sqIdx ?? '-';
      const sqVal = opts.curSq ?? '-';
      const jVal = opts.curJ ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'n (目标和)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: 'squares (候选平方数)', value: `[${squares.join(', ')}]`, type: 'string' as const, changed: chSet.has('sqs') },
        { name: 'i (平方根基数)', value: String(sIdx), type: (typeof sIdx === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'sq (平方数值)', value: String(sqVal), type: (typeof sqVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('sq') },
        { name: 'j (当前金额)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'dp[j] (最少数量)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpj') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: squares.map(String),
      message: `🎯 函数入口：完全平方数。目标 n = ${n}，可选候选平方数 [${squares.join(', ')}]。`,
      log: `entry: n=${n}, squares=[${squares.join(',')}]`,
      vars: makeVars({ changed: ['n', 'sqs'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Init
    push({
      dp1d: clone1d(dp),
      source: squares.map(String),
      current: { index: 0 },
      message: `🎬 初始化：dp[0] = 0（凑成 0 需要 0 个平方数），其余位置初始化为 ∞。`,
      log: `init: dp[0]=0, others=inf`,
      vars: makeVars({ curJ: 0, curDp: 0, changed: ['dpj'] }),
      codeLine: { java: 5, cpp: 5, python: 4, javascript: 3 },
    });

    // Loops (完全背包: 外层平方数, 内层 j 从 sq 到 n)
    for (let i = 1; i <= maxSquares; i++) {
      const sq = i * i;

      push({
        dp1d: clone1d(dp),
        source: squares.map(String),
        current: { index: sq <= n ? sq : 0 },
        message: `🔄 外层循环：考察平方数 ${sq} (${i}²)。`,
        log: `outer loop: sq=${sq}`,
        vars: makeVars({ sqIdx: i, curSq: sq, changed: ['i', 'sq'] }),
        codeLine: { java: 6, cpp: 6, python: 5, javascript: 4 },
      });

      for (let j = sq; j <= n; j++) {
        const prev = dp[j - sq];
        const canTransfer = prev !== '∞';

        if (canTransfer) {
          const currentVal = dp[j] === '∞' ? n + 1 : Number(dp[j]);
          const candidate = Number(prev) + 1;
          const nextVal = Math.min(currentVal, candidate);
          dp[j] = nextVal;

          const isUpdated = nextVal < currentVal;
          push({
            dp1d: clone1d(dp),
            source: squares.map(String),
            current: { index: j },
            dependencies: [{ index: j - sq }],
            formula: `dp[${j}] = min(${currentVal === n + 1 ? '∞' : currentVal}, dp[${j - sq}] + 1) = ${nextVal}`,
            message: isUpdated
              ? `⚡ 状态转移：使用平方数 ${sq}，凑出 ${j} 的最少数量更新为 ${nextVal} 个。`
              : `⏩ 状态保持：保持原方案 ${currentVal} 个平方数。`,
            log: `update: dp[${j}] = ${nextVal}`,
            vars: makeVars({ sqIdx: i, curSq: sq, curJ: j, curDp: nextVal, changed: isUpdated ? ['dpj'] : [] }),
            codeLine: {
              java: { primary: 8, context: [6, 7] },
              cpp: { primary: 8, context: [6, 7] },
              python: { primary: 7, context: [5, 6] },
              javascript: { primary: 7, context: [5, 6] },
            },
          });
        }
      }
    }

    const ans = dp[n] as number;
    push({
      dp1d: clone1d(dp),
      source: squares.map(String),
      current: { index: n },
      message: `🏁 算法结束：和为 ${n} 的最少完全平方数数量为 dp[${n}] = ${ans} 个。`,
      log: `return: dp[${n}] = ${ans}`,
      vars: makeVars({ curJ: n, curDp: ans, changed: ['dpj'] }),
      codeLine: { java: 11, cpp: 11, python: 9, javascript: 10 },
    });

    return steps;
  },
};
