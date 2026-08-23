import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const TriangleSpec: AlgorithmSpec = {
  id: 'triangle',
  name: '三角形最小路径和 (Triangle)',
  category: '网格 DP',
  description: '给定一个三角形 triangle ，找出自顶向下的最小路径和。每一步只能移动到下一行中相邻的结点上。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 120,
    leetcodeUrl: 'https://leetcode.cn/problems/triangle/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '三角形DP'],
    description: '给定一个三角形 <code>triangle</code> ，找出自顶向下的最小路径和。<br/><br/>每一步只能移动到下一行中相邻的结点上。相邻的结点 是指 <strong>下标与上一层结点下标相同或者等于上一层结点下标 + 1</strong> 的两个结点。也就是说，如果正位于当前行的下标 <code>i</code> ，那么下一步可以移动到下一行的下标 <code>i</code> 或 <code>i + 1</code> 。<br/><br/><strong>最优解法</strong>：自底向上（Bottom-Up）动态规划，无需处理复杂的边界与最终扫描求 min！',
    examples: [
      {
        input: 'triangle = [[2],[3,4],[6,5,7],[4,1,8,3]]',
        output: '11',
        explanation: '自顶向下的最小路径和为 11 (即 2 + 3 + 5 + 1 = 11)。',
      },
      {
        input: 'triangle = [[-10]]',
        output: '-10',
      },
    ],
    constraints: [
      '1 <= triangle.length <= 200',
      'triangle[0].length == 1',
      'triangle[i].length == triangle[i - 1].length + 1',
      '-10^4 <= triangle[i][j] <= 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: 4, cpp: 4, python: 3, javascript: 3 },
    loopCheck: { java: 5, cpp: 5, python: 4, javascript: 4 },
    innerLoopCheck: { java: 6, cpp: 6, python: 5, javascript: 5 },
    stateTransfer: {
      java: { primary: 7, context: [5, 6] },
      cpp: { primary: 7, context: [5, 6] },
      python: { primary: 6, context: [4, 5] },
      javascript: { primary: 6, context: [4, 5] },
    },
    loopExit: { java: 5, cpp: 5, python: 4, javascript: 4 },
    returnResult: { java: 10, cpp: 10, python: 8, javascript: 9 },
  },
  code: {
    languages: {
      javascript: [
        'function minimumTotal(triangle) {',
        '    const n = triangle.length;',
        '    const dp = Array.from({ length: n }, (_, i) => [...triangle[i]]); // 复制三角形状态',
        '    // 自底向上递推：从倒数第二层逐步向上计算',
        '    for (let i = n - 2; i >= 0; i--) { // 倒序遍历行',
        '        for (let j = 0; j <= i; j++) { // 遍历当前行各节点',
        '            dp[i][j] += Math.min(dp[i + 1][j], dp[i + 1][j + 1]); // 取正下方与右下方较小者',
        '        }',
        '    }',
        '    return dp[0][0]; // 顶点汇聚即为全局最小路径和',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int minimumTotal(List<List<Integer>> triangle) {',
        '        int n = triangle.size();',
        '        int[][] dp = new int[n][n];',
        '        for (int j = 0; j < n; j++) dp[n - 1][j] = triangle.get(n - 1).get(j);',
        '        for (int i = n - 2; i >= 0; i--) {',
        '            for (int j = 0; j <= i; j++) {',
        '                dp[i][j] = triangle.get(i).get(j) + Math.min(dp[i + 1][j], dp[i + 1][j + 1]);',
        '            }',
        '        }',
        '        return dp[0][0];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int minimumTotal(vector<vector<int>>& triangle) {',
        '        int n = triangle.size();',
        '        vector<vector<int>> dp = triangle;',
        '        for (int i = n - 2; i >= 0; i--) {',
        '            for (int j = 0; j <= i; j++) {',
        '                dp[i][j] += min(dp[i + 1][j], dp[i + 1][j + 1]);',
        '            }',
        '        }',
        '        return dp[0][0];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def minimumTotal(self, triangle: List[List[int]]) -> int:',
        '        dp = [row[:] for row in triangle]',
        '        for i in range(len(triangle) - 2, -1, -1):',
        '            for j in range(len(triangle[i])):',
        '                dp[i][j] += min(dp[i + 1][j], dp[i + 1][j + 1])',
        '        return dp[0][0]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：求解三角形自顶向下的最小路径和。',
        2: '获取层数 n。',
        3: '初始化 dp 数组为三角形各层初始权值。',
        4: '自底向上（Bottom-Up）思想：从倒数第二层 (n - 2) 开始逐层向上归约。',
        5: '外层倒序遍历行 i。',
        6: '内层遍历行中各节点 j。',
        7: '状态转移：当前节点最小路径和 = 当前权值 + Math.min(正下方子节点, 右下方子节点)。',
        10: '返回顶点 dp[0][0]，天然即为全图全局最优解！',
      },
      java: {
        2: '函数入口。',
        4: '初始化 dp 表。',
        5: '最底层初始化。',
        6: '自底向上遍历行。',
        7: '遍历列。',
        8: '取两个子节点最小值加和。',
        11: '返回顶点 dp[0][0]。',
      },
      cpp: {
        3: '函数入口。',
        5: '复制三角形向量。',
        6: '自底向上循环。',
        7: '内层循环。',
        8: '转移累加。',
        11: '返回 dp[0][0]。',
      },
      python: {
        2: '函数入口。',
        3: '深拷贝三角形。',
        4: '倒序遍历各行。',
        5: '遍历各列元素。',
        6: '取 min 转移。',
        7: '返回 dp[0][0]。',
      },
    },
    keyPoints: {
      title: '🎯 三角形最小路径和 5 步法系统精讲',
      summary: 'LeetCode 120。自底向上（Bottom-Up）优于自顶向下的典型代表！若自顶向下需处理斜边边界并在最后一行遍历求 min；而自底向上无需任何边界特判，最终顶点 dp[0][0] 直达答案！',
      points: [
        { label: '一、逆向思考 (自底向上)', desc: '从最后一行往上推导，每个点 <code>(i, j)</code> 的两个子分支刚好是 <code>(i + 1, j)</code> 与 <code>(i + 1, j + 1)</code>。', icon: '🎯', badge: '自底向上' },
        { label: '二、状态转移方程', desc: '<code>dp[i][j] = triangle[i][j] + min(dp[i + 1][j], dp[i + 1][j + 1])</code>。', icon: '⚡', badge: '双子分支' },
        { label: '三、初始化', desc: '最底层的 <code>dp</code> 值即为 <code>triangle[n-1]</code> 本身。', icon: '🎬', badge: '最底层为基' },
        { label: '四、复杂度分析', desc: '• 时间复杂度：<code>O(n^2)</code>。<br>• 空间复杂度：<code>O(n^2)</code>，可原地或一维压缩至 <code>O(n)</code>。', icon: '⏱️', badge: 'O(N^2)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let triangle: number[][] = [
      [2],
      [3, 4],
      [6, 5, 7],
      [4, 1, 8, 3],
    ];

    if (typeof input === 'object' && input && Array.isArray(input.triangle)) {
      triangle = input.triangle;
    }

    const n = triangle.length;
    const dp: DpCell[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: i + 1 }, (_, j) => triangle[i][j])
    );

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      curVal?: number | string;
      curDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const tVal = opts.curVal ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'i (当前层数)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (当前节点)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'triangle[i][j]', value: String(tVal), type: (typeof tVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('t') },
        { name: 'dp[i][j] (自底向上最小和)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpij') },
        { name: 'n (总层数)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
      ];
    };

    // Step 0: Entry
    push({
      dp2d: clone2d(dp),
      message: `🎯 函数入口：三角形最小路径和。共 ${n} 层，采用自底向上（Bottom-Up）逆向推导。`,
      log: `entry: n=${n}`,
      vars: makeVars({ changed: ['n'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Init bottom layer
    push({
      dp2d: clone2d(dp),
      message: `🎬 初始化最底层（第 ${n - 1} 层）：[${triangle[n - 1].join(', ')}]，自身即为向下的最小路径和。`,
      log: `init bottom: [${triangle[n - 1].join(',')}]`,
      vars: makeVars({ i: n - 1, changed: ['dpij'] }),
      codeLine: { java: 5, cpp: 5, python: 3, javascript: 3 },
    });

    // Loops (自底向上: i 从 n-2 倒序到 0)
    for (let i = n - 2; i >= 0; i--) {
      for (let j = 0; j <= i; j++) {
        const leftChild = dp[i + 1][j] as number;
        const rightChild = dp[i + 1][j + 1] as number;
        const selfVal = triangle[i][j];
        const minChild = Math.min(leftChild, rightChild);
        const resultVal = selfVal + minChild;
        dp[i][j] = resultVal;

        const isLeftWinner = leftChild <= rightChild;
        push({
          dp2d: clone2d(dp),
          current: { row: i, col: j },
          dependencies: [{ row: i + 1, col: j }, { row: i + 1, col: j + 1 }],
          formula: `dp[${i}][${j}] = ${selfVal} + min(${leftChild}, ${rightChild}) = ${selfVal} + ${minChild} = ${resultVal}`,
          message: `⚡ 状态转移：节点 (${i}, ${j}) (权值 ${selfVal}) 比较两个下一层子分支【正下方 (${leftChild})】vs【右下方 (${rightChild})】$\rightarrow$ 选择较小值 ${minChild}，dp[${i}][${j}] = ${resultVal}。`,
          log: `update: dp[${i}][${j}] = ${resultVal}`,
          vars: makeVars({ i, j, curVal: selfVal, curDp: resultVal, changed: ['i', 'j', 't', 'dpij'] }),
          codeLine: {
            java: { primary: 8, context: [6, 7] },
            cpp: { primary: 8, context: [6, 7] },
            python: { primary: 6, context: [4, 5] },
            javascript: { primary: 7, context: [5, 6] },
          },
        });
      }
    }

    const ans = dp[0][0] as number;
    push({
      dp2d: clone2d(dp),
      current: { row: 0, col: 0 },
      message: `🏁 算法结束：三角形自顶向下的最小路径总和为顶点汇聚值 dp[0][0] = ${ans}。`,
      log: `return: dp[0][0] = ${ans}`,
      vars: makeVars({ i: 0, j: 0, curVal: triangle[0][0], curDp: ans, changed: ['dpij'] }),
      codeLine: { java: 11, cpp: 11, python: 7, javascript: 10 },
    });

    return steps;
  },
};
