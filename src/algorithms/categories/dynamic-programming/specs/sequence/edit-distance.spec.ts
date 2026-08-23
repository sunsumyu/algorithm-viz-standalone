import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';
import type { DpBacktrackStep } from '../../../../../core/interfaces';

export const EditDistanceSpec: AlgorithmSpec = {
  id: 'edit-distance',
  name: '编辑距离 (Edit Distance)',
  category: '子序列 DP',
  description: '给你两个单词 word1 和 word2，计算出将 word1 转换成 word2 所使用的最少操作数（插入、删除、替换）。',
  difficulty: 'hard',
  problem: {
    leetcodeId: 72,
    leetcodeUrl: 'https://leetcode.cn/problems/edit-distance/',
    difficulty: 'hard',
    tags: ['字符串', '动态规划', '经典难题'],
    description: '给你两个单词 <code>word1</code> 和 <code>word2</code>， 请返回将 <code>word1</code> 转换成 <code>word2</code> 所使用的最少操作数 。<br/><br/>你可以对一个单词进行如下三种操作：<br/>1. 插入一个字符<br/>2. 删除一个字符<br/>3. 替换一个字符',
    examples: [
      {
        input: 'word1 = "horse", word2 = "ros"',
        output: '3',
        explanation: 'horse -> rorse (将 \'h\' 替换为 \'r\')<br/>rorse -> rose (删除 \'r\')<br/>rose -> ros (删除 \'e\')',
      },
      {
        input: 'word1 = "intention", word2 = "execution"',
        output: '5',
        explanation: 'intention -> inention (删除 \'t\')<br/>inention -> enention (将 \'i\' 替换为 \'e\')<br/>enention -> exention (将 \'n\' 替换为 \'x\')<br/>exention -> exection (将 \'n\' 替换为 \'c\')<br/>exection -> execution (插入 \'u\')',
      },
    ],
    constraints: [
      '0 <= word1.length, word2.length <= 500',
      'word1 和 word2 由小写英文字母组成',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [4, 5], cpp: [4, 5], python: [4, 5], javascript: [3, 4] },
    loopCheck: { java: 6, cpp: 6, python: 6, javascript: 5 },
    innerLoopCheck: { java: 7, cpp: 7, python: 7, javascript: 6 },
    stateTransfer: {
      java: { primary: [9, 11], context: [6, 7] },
      cpp: { primary: [9, 11], context: [6, 7] },
      python: { primary: [9, 11], context: [6, 7] },
      javascript: { primary: [8, 10], context: [5, 6] },
    },
    loopExit: { java: 6, cpp: 6, python: 6, javascript: 5 },
    returnResult: { java: 16, cpp: 16, python: 13, javascript: 14 },
  },
  code: {
    languages: {
      javascript: [
        'function minDistance(word1, word2) {',
        '    const m = word1.length, n = word2.length;',
        '    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));',
        '    for (let i = 0; i <= m; i++) dp[i][0] = i; // 删除 i 次',
        '    for (let j = 0; j <= n; j++) dp[0][j] = j; // 插入 j 次',
        '    for (let i = 1; i <= m; i++) {',
        '        for (let j = 1; j <= n; j++) {',
        '            if (word1[i - 1] === word2[j - 1]) {',
        '                dp[i][j] = dp[i - 1][j - 1]; // 字符相同：代价为 0',
        '            } else {',
        '                dp[i][j] = Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1])) + 1;',
        '            }',
        '        }',
        '    }',
        '    return dp[m][n];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int minDistance(String word1, String word2) {',
        '        int m = word1.length(), n = word2.length();',
        '        int[][] dp = new int[m + 1][n + 1];',
        '        for (int i = 0; i <= m; i++) dp[i][0] = i;',
        '        for (int j = 0; j <= n; j++) dp[0][j] = j;',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (word1.charAt(i - 1) == word2.charAt(j - 1)) {',
        '                    dp[i][j] = dp[i - 1][j - 1];',
        '                } else {',
        '                    dp[i][j] = Math.min(dp[i - 1][j], Math.min(dp[i][j - 1], dp[i - 1][j - 1])) + 1;',
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
        '    int minDistance(string word1, string word2) {',
        '        int m = word1.size(), n = word2.size();',
        '        vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));',
        '        for (int i = 0; i <= m; i++) dp[i][0] = i;',
        '        for (int j = 0; j <= n; j++) dp[0][j] = j;',
        '        for (int i = 1; i <= m; i++) {',
        '            for (int j = 1; j <= n; j++) {',
        '                if (word1[i - 1] == word2[j - 1]) {',
        '                    dp[i][j] = dp[i - 1][j - 1];',
        '                } else {',
        '                    dp[i][j] = min(dp[i - 1][j], min(dp[i][j - 1], dp[i - 1][j - 1])) + 1;',
        '                }',
        '            }',
        '        }',
        '        return dp[m][n];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def minDistance(self, word1: str, word2: str) -> int:',
        '        m, n = len(word1), len(word2)',
        '        dp = [[0] * (n + 1) for _ in range(m + 1)]',
        '        for i in range(m + 1): dp[i][0] = i',
        '        for j in range(n + 1): dp[0][j] = j',
        '        for i in range(1, m + 1):',
        '            for j in range(1, n + 1):',
        '                if word1[i - 1] == word2[j - 1]:',
        '                    dp[i][j] = dp[i - 1][j - 1]',
        '                else:',
        '                    dp[i][j] = min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1',
        '        return dp[m][n]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：计算将 word1 转换为 word2 的最少编辑操作步数。',
        2: '获取规模：m 为 word1 长度，n 为 word2 长度。',
        3: '开辟二维状态网格 dp[m+1][n+1]。',
        4: '行初始化：当 word2 为空串时，删除 word1 前 i 个字符需 i 步 (dp[i][0] = i)。',
        5: '列初始化：当 word1 为空串时，插入 word2 前 j 个字符需 j 步 (dp[0][j] = j)。',
        6: '外层循环：遍历 word1 的前缀长度 i。',
        7: '内层循环：遍历 word2 的前缀长度 j。',
        8: '字符比对：检查当前结尾字符 word1[i-1] 是否等于 word2[j-1]。',
        9: '字符相同：无需任何编辑代价，直接继承 dp[i-1][j-1]。',
        10: '字符不同：在删除(上)、插入(左)、替换(左上)三种操作中取最小值 + 1。',
        14: '返回答案：dp[m][n] 即为全局最少编辑距离。',
      },
      java: {
        2: '函数入口：计算将 word1 转换为 word2 的最少编辑操作步数。',
        3: '获取规模：m 为 word1 长度，n 为 word2 长度。',
        4: '开辟二维状态网格 dp[m+1][n+1]。',
        5: '行初始化：当 word2 为空串时，删除 word1 前 i 个字符需 i 步 (dp[i][0] = i)。',
        6: '列初始化：当 word1 为空串时，插入 word2 前 j 个字符需 j 步 (dp[0][j] = j)。',
        7: '外层循环：遍历 word1 的前缀长度 i。',
        8: '内层循环：遍历 word2 的前缀长度 j。',
        9: '字符比对：检查当前结尾字符 word1.charAt(i-1) 是否等于 word2.charAt(j-1)。',
        10: '字符相同：无需任何编辑代价，直接继承 dp[i-1][j-1]。',
        12: '字符不同：在删除(上)、插入(左)、替换(左上)三种操作中取最小值 + 1。',
        16: '返回答案：dp[m][n] 即为全局最少编辑距离。',
      },
      cpp: {
        3: '函数入口：计算编辑距离。',
        4: '获取长度 m, n。',
        5: '初始化 dp 向量表。',
        6: '边界初始化行与列。',
        7: '外层循环 i 从 1 到 m。',
        8: '内层循环 j 从 1 到 n。',
        9: '字符相同：dp[i][j] = dp[i-1][j-1]。',
        11: '字符不同：取删除、插入、替换最小值 + 1。',
        16: '返回 dp[m][n]。',
      },
      python: {
        2: '函数入口：计算编辑距离。',
        3: '获取长度 m, n。',
        4: '初始化二维列表。',
        5: '边界初始化。',
        6: '遍历 i 从 1 到 m。',
        7: '遍历 j 从 1 到 n。',
        8: '字符相同：dp[i][j] = dp[i-1][j-1]。',
        10: '字符不同：min(删除, 插入, 替换) + 1。',
        13: '返回 dp[m][n]。',
      },
    },
    keyPoints: {
      title: '🎯 编辑距离 (Edit Distance) 5 步法要点',
      summary: 'LeetCode 72 经典难题。自底向上构建 2D 状态网格，全面覆盖增、删、改三大原子编辑动作。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：将 <code>word1[0..i-1]</code> 转换为 <code>word2[0..j-1]</code> 所需的最少操作步数。', icon: '🎯', badge: '二维状态定义' },
        { label: '二、状态转移方程', desc: '• <strong>字符相等</strong>：<code>dp[i][j] = dp[i-1][j-1]</code>（成本 +0）。<br>• <strong>字符不同</strong>：<code>dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1</code>。<br>分别对应：删除 word1[i-1]、插入 word2[j-1]、替换 word1[i-1]。', icon: '⚡', badge: '三向决策取最小' },
        { label: '三、初始化与边界条件', desc: '• <code>dp[i][0] = i</code>：目标串为空，只能连续删除 i 次。<br>• <code>dp[0][j] = j</code>：源串为空，只能连续插入 j 次。<br>• <code>dp[0][0] = 0</code>：两空串无需操作。', icon: '🎬', badge: '线性递增边界' },
        { label: '四、遍历推进顺序', desc: '从 <code>i = 1..m</code>、<code>j = 1..n</code> 从左向右、从上到下逐行推进。', icon: '🧭', badge: '左上到右下' },
        { label: '五、时空复杂度', desc: '• 时间复杂度：<code>O(m × n)</code>。<br>• 空间复杂度：<code>O(m × n)</code>。', icon: '⏱️', badge: 'O(m*n)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    const s1 = typeof input === 'object' && input ? (input.s || input.word1 || 'horse') : 'horse';
    const s2 = typeof input === 'object' && input ? (input.t || input.word2 || 'ros') : 'ros';

    const a = s1.split('');
    const b = s2.split('');
    const rows = a.length + 1;
    const cols = b.length + 1;
    const m = a.length;
    const n = b.length;

    const dp: DpCell[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
    const fullDp = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let r = 0; r < rows; r++) fullDp[r][0] = r;
    for (let c = 0; c < cols; c++) fullDp[0][c] = c;
    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        const isM = a[i - 1] === b[j - 1];
        fullDp[i][j] = isM
          ? fullDp[i - 1][j - 1]
          : Math.min(fullDp[i - 1][j], fullDp[i][j - 1], fullDp[i - 1][j - 1]) + 1;
      }
    }

    // Build backtrackPath
    const backtrackPath: DpBacktrackStep[] = [];
    let br = rows - 1;
    let bc = cols - 1;
    while (br > 0 || bc > 0) {
      const curVal = fullDp[br][bc];
      const curA = br > 0 ? a[br - 1] : '';
      const curB = bc > 0 ? b[bc - 1] : '';

      if (br > 0 && bc > 0 && curA === curB && fullDp[br - 1][bc - 1] === curVal) {
        backtrackPath.unshift({
          i: br, j: bc, action: 'match',
          charA: curA, charB: curB, cost: 0,
          title: `保持不变 [${curA}]`, badge: 'KEEP', badgeClass: 'match',
          desc: `两端字符均为 '${curA}'，无需修改 (成本 +0)`,
        });
        br--; bc--;
      } else if (br > 0 && bc > 0 && fullDp[br - 1][bc - 1] + 1 === curVal) {
        backtrackPath.unshift({
          i: br, j: bc, action: 'replace',
          charA: curA, charB: curB, cost: 1,
          title: `替换 [${curA}] ➔ [${curB}]`, badge: 'REPLACE', badgeClass: 'replace',
          desc: `将源字符 '${curA}' 替换为目标字符 '${curB}' (成本 +1)`,
        });
        br--; bc--;
      } else if (br > 0 && fullDp[br - 1][bc] + 1 === curVal) {
        backtrackPath.unshift({
          i: br, j: bc, action: 'delete',
          charA: curA, charB: curB, cost: 1,
          title: `删除 [${curA}]`, badge: 'DELETE', badgeClass: 'delete',
          desc: `从源串中删除字符 '${curA}' (成本 +1)`,
        });
        br--;
      } else if (bc > 0 && fullDp[br][bc - 1] + 1 === curVal) {
        backtrackPath.unshift({
          i: br, j: bc, action: 'insert',
          charA: curA, charB: curB, cost: 1,
          title: `插入 [${curB}]`, badge: 'INSERT', badgeClass: 'insert',
          desc: `在目标串末尾插入 '${curB}' (成本 +1)`,
        });
        bc--;
      } else {
        break;
      }
    }

    const steps: DpTraceStep[] = [];
    const cellStepMap = new Map<string, number>();

    const push = (step: DpTraceStep) => {
      const idx = steps.length;
      if (step.current && typeof step.current.row === 'number' && typeof step.current.col === 'number') {
        cellStepMap.set(`${step.current.row},${step.current.col}`, idx);
      }
      steps.push(makeTraceStep({
        tree: null,
        backtrackPath,
        ...step,
      }));
    };

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      char1?: string;
      char2?: string;
      curDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const c1 = opts.char1 ?? '-';
      const c2 = opts.char2 ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'word1', value: `"${s1}"`, type: 'string' as const, changed: chSet.has('w1') },
        { name: 'word2', value: `"${s2}"`, type: 'string' as const, changed: chSet.has('w2') },
        { name: 'm (长度1)', value: String(m), type: 'number' as const, changed: chSet.has('m') },
        { name: 'n (长度2)', value: String(n), type: 'number' as const, changed: chSet.has('n') },
        { name: 'i (当前索引1)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (当前索引2)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'word1[i-1]', value: c1 === '-' ? '-' : `'${c1}'`, type: 'string' as const, changed: chSet.has('c1') },
        { name: 'word2[j-1]', value: c2 === '-' ? '-' : `'${c2}'`, type: 'string' as const, changed: chSet.has('c2') },
        { name: 'dp[i][j]', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpij') },
      ];
    };

    // Step 0: Function entry
    for (let r = 0; r < rows; r++) dp[r][0] = r;
    for (let c = 0; c < cols; c++) dp[0][c] = c;

    push({
      dp2d: clone2d(dp),
      source: a,
      target: b,
      message: `🎯 函数入口：计算将 word1 = "${s1}" 转换成 word2 = "${s2}" 的最少编辑距离。`,
      log: `entry: word1="${s1}", word2="${s2}"`,
      vars: makeVars({ changed: ['w1', 'w2', 'm', 'n'] }),
      metrics: { i: 0, j: 0, answer: 0, status: '初始化' },
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Loops
    for (let i = 1; i <= m; i++) {
      const char1 = a[i - 1];

      for (let j = 1; j <= n; j++) {
        const char2 = b[j - 1];
        const isMatch = char1 === char2;

        let resultVal: number;
        let actionType: 'match' | 'replace' | 'delete' | 'insert';
        let actionDesc = '';
        let formulaStr = '';
        let deps: Array<{ row: number; col: number }> = [];

        if (isMatch) {
          resultVal = (dp[i - 1][j - 1] as number) || 0;
          dp[i][j] = resultVal;
          actionType = 'match';
          actionDesc = `字符相同无需操作 (dp[${i - 1}][${j - 1}] = ${resultVal})`;
          formulaStr = `dp[${i}][${j}] = dp[${i - 1}][${j - 1}]`;
          deps = [{ row: i - 1, col: j - 1 }];
        } else {
          const deleteCost = (dp[i - 1][j] as number) || 0;
          const insertCost = (dp[i][j - 1] as number) || 0;
          const replaceCost = (dp[i - 1][j - 1] as number) || 0;
          const minPrev = Math.min(deleteCost, insertCost, replaceCost);
          resultVal = minPrev + 1;
          dp[i][j] = resultVal;

          formulaStr = `dp[${i}][${j}] = min(dp[${i - 1}][${j}], dp[${i}][${j - 1}], dp[${i - 1}][${j - 1}]) + 1`;
          deps = [{ row: i - 1, col: j }, { row: i, col: j - 1 }, { row: i - 1, col: j - 1 }];

          if (minPrev === replaceCost) {
            actionType = 'replace';
            actionDesc = `替换 '${char1}' ➔ '${char2}' (成本 ${resultVal})`;
          } else if (minPrev === deleteCost) {
            actionType = 'delete';
            actionDesc = `删除 '${char1}' (成本 ${resultVal})`;
          } else {
            actionType = 'insert';
            actionDesc = `插入 '${char2}' (成本 ${resultVal})`;
          }
        }

        const candidates = [
          {
            name: `删除 '${char1}' (上方 dp[${i - 1}][${j}])`,
            cost: ((dp[i - 1][j] as number) || 0) + 1,
            isChosen: !isMatch && actionType === 'delete',
          },
          {
            name: `插入 '${char2}' (左方 dp[${i}][${j - 1}])`,
            cost: ((dp[i][j - 1] as number) || 0) + 1,
            isChosen: !isMatch && actionType === 'insert',
          },
          {
            name: isMatch ? `字符相同保持不变` : `替换 '${char1}'➔'${char2}' (左上角 dp[${i - 1}][${j - 1}])`,
            cost: isMatch ? ((dp[i - 1][j - 1] as number) || 0) : ((dp[i - 1][j - 1] as number) || 0) + 1,
            isChosen: isMatch || actionType === 'replace',
          },
        ];

        push({
          dp2d: clone2d(dp),
          source: a,
          target: b,
          current: { row: i, col: j },
          dependencies: deps,
          formula: formulaStr,
          formulaSubstituted: isMatch
            ? `dp[${i}][${j}] = ${resultVal}`
            : `min(${dp[i - 1][j]}, ${dp[i][j - 1]}, ${dp[i - 1][j - 1]}) + 1 = ${resultVal}`,
          message: isMatch
            ? `🎯【字符匹配】word1[${i - 1}] ('${char1}') === word2[${j - 1}] ('${char2}') $\rightarrow$ 继承左上角 dp[${i - 1}][${j - 1}] = ${resultVal}。`
            : `⚡【三向决策】'${char1}' ➔ '${char2}'：最优选择【${actionDesc}】，更新 dp[${i}][${j}] = ${resultVal}。`,
          log: `update: dp[${i}][${j}]=${resultVal}, action=${actionType}`,
          vars: makeVars({ i, j, char1, char2, curDp: resultVal, changed: ['dpij'] }),
          actionMeta: { type: actionType, cost: isMatch ? 0 : 1, label: actionDesc },
          storyMeta: {
            goal: `将前缀 "${s1.slice(0, i)}" 转换到 "${s2.slice(0, j)}"`,
            candidates,
            conclusion: `最优决策为【${actionDesc}】，最小步数 = ${resultVal}`,
          },
          metrics: { i, j, answer: resultVal, status: '状态转移' },
          codeLine: {
            java: { primary: isMatch ? 10 : 12, context: [7, 8] },
            cpp: { primary: isMatch ? 10 : 12, context: [7, 8] },
            python: { primary: isMatch ? 9 : 11, context: [6, 7] },
            javascript: { primary: isMatch ? 9 : 11, context: [6, 7] },
          },
        });
      }
    }

    // Final Return
    const ans = dp[m][n] as number;
    backtrackPath.forEach((node) => {
      const key = `${node.i},${node.j}`;
      if (cellStepMap.has(key)) node.stepIndex = cellStepMap.get(key);
    });

    push({
      dp2d: clone2d(dp),
      source: a,
      target: b,
      current: { row: m, col: n },
      message: `🏁 算法结束：返回全局最优解 dp[${m}][${n}] = ${ans}（将 "${s1}" 转换为 "${s2}" 最少需要 ${ans} 步编辑）。`,
      log: `return: dp[${m}][${n}]=${ans}`,
      vars: makeVars({ curDp: ans, changed: ['dpij'] }),
      metrics: { i: m, j: n, answer: ans, status: '已完成' },
      codeLine: { java: 16, cpp: 16, python: 13, javascript: 14 },
    });

    return steps;
  },
};
