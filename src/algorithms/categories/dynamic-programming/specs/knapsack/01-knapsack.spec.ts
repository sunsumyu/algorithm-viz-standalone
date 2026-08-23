import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone2d, makeTraceStep } from '../../engine/dp-step-engine';

export const Knapsack01Spec: AlgorithmSpec = {
  id: '01-knapsack',
  name: '0-1 背包问题 (0-1 Knapsack)',
  category: '背包 DP',
  description: '有 N 件物品和一个容量为 W 的背包。第 i 件物品的重量是 weight[i]，价值是 value[i]。每件物品只能选一次，求装入背包的最大总价值。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 0,
    leetcodeUrl: 'https://leetcode.cn/circle/article/000000/',
    difficulty: 'medium',
    tags: ['动态规划', '背包DP', '经典模型'],
    description: '有 <code>n</code> 件物品和一个容量为 <code>w</code> 的背包。第 <code>i</code> 件物品的重量是 <code>weight[i]</code>，价值是 <code>value[i]</code>。<br/><br/>每件物品 <strong>只能使用一次</strong>（即 0 件或 1 件）。<br/><br/>请问在不超过背包最大容量的前提下，装入背包的物品 <strong>最大总价值</strong> 是多少？',
    examples: [
      {
        input: 'weights = [1, 3, 4], values = [15, 20, 30], bagWeight = 4',
        output: '35',
        explanation: '选择物品 0 (重量 1, 价值 15) 和物品 1 (重量 3, 价值 20)，总重量 4 <= 4，总价值 15 + 20 = 35。',
      },
      {
        input: 'weights = [2, 3, 4, 5], values = [3, 4, 5, 6], bagWeight = 8',
        output: '10',
        explanation: '选择物品 1 (重量 3, 价值 4) 和物品 3 (重量 5, 价值 6)，总重量 8 <= 8，总价值 4 + 6 = 10。',
      },
    ],
    constraints: [
      '1 <= n <= 1000',
      '1 <= w <= 1000',
      '1 <= weight[i], value[i] <= 1000',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: 4, cpp: 4, python: 4, javascript: 3 },
    loopCheck: { java: 6, cpp: 6, python: 6, javascript: 5 },
    innerLoopCheck: { java: 7, cpp: 7, python: 7, javascript: 6 },
    stateTransfer: {
      java: { primary: [9, 11], context: [6, 7] },
      cpp: { primary: [9, 11], context: [6, 7] },
      python: { primary: [9, 11], context: [6, 7] },
      javascript: { primary: [8, 10], context: [5, 6] },
    },
    loopExit: { java: 6, cpp: 6, python: 6, javascript: 5 },
    returnResult: { java: 15, cpp: 15, python: 13, javascript: 14 },
  },
  code: {
    languages: {
      javascript: [
        'function knapsack01(weights, values, bagWeight) {',
        '    const n = weights.length;',
        '    const dp = Array.from({ length: n }, () => new Array(bagWeight + 1).fill(0));',
        '    for (let j = weights[0]; j <= bagWeight; j++) dp[0][j] = values[0]; // 初始化第 0 件物品',
        '    for (let i = 1; i < n; i++) { // 遍历物品',
        '        for (let j = 0; j <= bagWeight; j++) { // 遍历背包容量',
        '            if (j < weights[i]) {',
        '                dp[i][j] = dp[i - 1][j]; // 放不下第 i 件物品',
        '            } else {',
        '                dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - weights[i]] + values[i]); // 不放 vs 放',
        '            }',
        '        }',
        '    }',
        '    return dp[n - 1][bagWeight];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int knapsack01(int[] weights, int[] values, int bagWeight) {',
        '        int n = weights.length;',
        '        int[][] dp = new int[n][bagWeight + 1];',
        '        for (int j = weights[0]; j <= bagWeight; j++) dp[0][j] = values[0];',
        '        for (int i = 1; i < n; i++) {',
        '            for (int j = 0; j <= bagWeight; j++) {',
        '                if (j < weights[i]) {',
        '                    dp[i][j] = dp[i - 1][j];',
        '                } else {',
        '                    dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - weights[i]] + values[i]);',
        '                }',
        '            }',
        '        }',
        '        return dp[n - 1][bagWeight];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int knapsack01(vector<int>& weights, vector<int>& values, int bagWeight) {',
        '        int n = weights.size();',
        '        vector<vector<int>> dp(n, vector<int>(bagWeight + 1, 0));',
        '        for (int j = weights[0]; j <= bagWeight; j++) dp[0][j] = values[0];',
        '        for (int i = 1; i < n; i++) {',
        '            for (int j = 0; j <= bagWeight; j++) {',
        '                if (j < weights[i]) {',
        '                    dp[i][j] = dp[i - 1][j];',
        '                } else {',
        '                    dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - weights[i]] + values[i]);',
        '                }',
        '            }',
        '        }',
        '        return dp[n - 1][bagWeight];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def knapsack01(self, weights: List[int], values: List[int], bagWeight: int) -> int:',
        '        n = len(weights)',
        '        dp = [[0] * (bagWeight + 1) for _ in range(n)]',
        '        for j in range(weights[0], bagWeight + 1): dp[0][j] = values[0]',
        '        for i in range(1, n):',
        '            for j in range(bagWeight + 1):',
        '                if j < weights[i]:',
        '                    dp[i][j] = dp[i - 1][j]',
        '                else:',
        '                    dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - weights[i]] + values[i])',
        '        return dp[n - 1][bagWeight]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：传入物品重量 weights、价值 values 与背包总容量 bagWeight。',
        2: '获取规模：n 为物品总件数。',
        3: '开辟二维状态表：dp[i][j] 表示从下标为 0..i 的物品中任意取，放进容量为 j 的背包的最大总价值。',
        4: '初始化第 0 行：当容量 j >= weights[0] 时，放入第 0 个物品获取其价值 values[0]。',
        5: '外层循环：逐一遍历物品 i 从 1 到 n-1。',
        6: '内层循环：遍历背包容量 j 从 0 到 bagWeight。',
        7: '容量不足判定：背包当前容量 j < weights[i]，装不下物品 i。',
        8: '不放物品 i：直接继承上一个物品的最优价值 dp[i][j] = dp[i-1][j]。',
        10: '放 vs 不放取最大：比较【不放物品 i: dp[i-1][j]】与【腾出空间放入物品 i: dp[i-1][j-weights[i]] + values[i]】取大者。',
        14: '返回全局最优解：dp[n-1][bagWeight] 即为最终最大总价值。',
      },
      java: {
        2: '函数入口：0-1背包最大价值求解。',
        3: '获取物品数量 n。',
        4: '开辟 dp[n][bagWeight+1] 状态表。',
        5: '初始化第 0 件物品。',
        6: '外层遍历物品 i。',
        7: '内层遍历容量 j。',
        8: '容量不足分支。',
        9: '装不下：dp[i][j] = dp[i-1][j]。',
        11: '放 vs 不放决策：dp[i][j] = Math.max(dp[i-1][j], dp[i-1][j-weights[i]] + values[i])。',
        15: '返回 dp[n-1][bagWeight]。',
      },
      cpp: {
        3: '函数入口。',
        4: '获取长度。',
        5: '定义 dp 表。',
        6: '初始化首行。',
        7: '外层循环遍历物品。',
        8: '内层循环遍历容量。',
        9: '装不下继承上方。',
        11: '决策最大值。',
        15: '返回答案。',
      },
      python: {
        2: '函数入口。',
        3: '获取规模。',
        4: '初始化二维列表。',
        5: '初始化第一行。',
        6: '遍历物品。',
        7: '遍历容量。',
        8: '容量判断。',
        10: '转移取 max。',
        12: '返回结果。',
      },
    },
    keyPoints: {
      title: '🎯 0-1 背包问题 5 步法系统精讲',
      summary: '动态规划最核心基石模型。每件物品只能选 0 次或 1 次。核心在于决策【不放】与【腾出容量放入】之间的价值博弈。',
      points: [
        { label: '一、状态定义', desc: '<code>dp[i][j]</code>：从下标 <code>0..i</code> 的物品中选取，放入容量为 <code>j</code> 的背包所能获得的最大总价值。', icon: '🎯', badge: '物品×容量二维状态' },
        { label: '二、状态转移方程', desc: '• 若 <code>j < weights[i]</code>：<code>dp[i][j] = dp[i-1][j]</code>（装不下）。<br>• 若 <code>j >= weights[i]</code>：<code>dp[i][j] = max(dp[i-1][j], dp[i-1][j - weights[i]] + values[i])</code>（不放 vs 放入）。', icon: '⚡', badge: '经典二选一' },
        { label: '三、初始化与边界条件', desc: '• 第一列 <code>dp[i][0] = 0</code>：容量为 0 时价值必为 0。<br>• 第一行 <code>dp[0][j]</code>：当 <code>j >= weights[0]</code> 时初始化为 <code>values[0]</code>，其余为 0。', icon: '🎬', badge: '首行首列初始化' },
        { label: '四、遍历推导顺序', desc: '先遍历物品，再遍历容量；或先遍历容量，再遍历物品（二维情况下均可，一维滚动数组必须倒序遍历容量）。', icon: '🧭', badge: '正序遍历' },
        { label: '五、时空复杂度', desc: '• 时间复杂度：<code>O(n × W)</code>。<br>• 空间复杂度：<code>O(n × W)</code>，可滚动数组优化至 <code>O(W)</code>。', icon: '⏱️', badge: 'O(n*W)' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let weights: number[] = [1, 3, 4];
    let values: number[] = [15, 20, 30];
    let bagWeight = 4;

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.weights)) weights = input.weights;
      else if (typeof input.weights === 'string') weights = input.weights.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
      else if (typeof input.nums === 'string') weights = input.nums.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));

      if (Array.isArray(input.values)) values = input.values;
      else if (typeof input.values === 'string') values = input.values.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));

      if (typeof input.bagWeight === 'number') bagWeight = input.bagWeight;
      else if (typeof input.w === 'number') bagWeight = input.w;
      else if (typeof input.target === 'number') bagWeight = input.target;
    }

    if (values.length < weights.length) {
      values = weights.map((w) => w * 10);
    }

    const n = weights.length;
    const dp: DpCell[][] = Array.from({ length: n }, () =>
      Array.from({ length: bagWeight + 1 }, () => '-')
    );

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      curW?: number | string;
      curV?: number | string;
      curDp?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const cw = opts.curW ?? '-';
      const cv = opts.curV ?? '-';
      const cur = opts.curDp ?? '-';
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'weights (重量)', value: `[${weights.join(', ')}]`, type: 'string' as const, changed: chSet.has('w') },
        { name: 'values (价值)', value: `[${values.join(', ')}]`, type: 'string' as const, changed: chSet.has('v') },
        { name: 'bagWeight (容量)', value: String(bagWeight), type: 'number' as const, changed: chSet.has('bw') },
        { name: 'i (当前物品)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'j (当前容量)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'weight[i]', value: String(cw), type: (typeof cw === 'number' ? 'number' : 'string') as any, changed: chSet.has('cw') },
        { name: 'value[i]', value: String(cv), type: (typeof cv === 'number' ? 'number' : 'string') as any, changed: chSet.has('cv') },
        { name: 'dp[i][j] (最大价值)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpij') },
      ];
    };

    // Step 0: Function entry
    push({
      dp2d: clone2d(dp),
      source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
      message: `🎯 函数入口：0-1 背包问题。共 ${n} 件物品，背包最大容量为 ${bagWeight}。`,
      log: `entry: n=${n}, bagWeight=${bagWeight}`,
      vars: makeVars({ changed: ['w', 'v', 'bw'] }),
      thematicMeta: {
        type: 'knapsack',
        knapsack: {
          capacity: bagWeight,
          currentCapacity: 0,
          items: weights.map((w, idx) => ({ id: idx, name: `物品${idx}`, weight: w, value: values[idx] })),
          action: 'idle',
        },
      },
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    // Step 1: Initialize first row (item 0)
    for (let j = 0; j <= bagWeight; j++) {
      dp[0][j] = j >= weights[0] ? values[0] : 0;
    }

    push({
      dp2d: clone2d(dp),
      source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
      message: `🎬 初始化首行（物品 0，重 ${weights[0]}，价 ${values[0]}）：当容量 j >= ${weights[0]} 时可装入物品 0，价值为 ${values[0]}。`,
      log: `init row 0: weight=${weights[0]}, value=${values[0]}`,
      vars: makeVars({ i: 0, curW: weights[0], curV: values[0], changed: ['dpij'] }),
      thematicMeta: {
        type: 'knapsack',
        knapsack: {
          capacity: bagWeight,
          currentCapacity: weights[0] <= bagWeight ? weights[0] : 0,
          currentItemIndex: 0,
          action: 'include',
        },
      },
      codeLine: { java: 5, cpp: 5, python: 5, javascript: 4 },
    });

    // Loops
    for (let i = 1; i < n; i++) {
      const curWeight = weights[i];
      const curValue = values[i];

      push({
        dp2d: clone2d(dp),
        source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
        current: { row: i, col: 0 },
        message: `🔄 外层循环：考察物品 ${i}（重量 ${curWeight}，价值 ${curValue}）。`,
        log: `outer loop: item ${i}, weight=${curWeight}, value=${curValue}`,
        vars: makeVars({ i, curW: curWeight, curV: curValue, changed: ['i', 'cw', 'cv'] }),
        thematicMeta: {
          type: 'knapsack',
          knapsack: {
            capacity: bagWeight,
            currentItemIndex: i,
            action: 'evaluate',
          },
        },
        codeLine: { java: 6, cpp: 6, python: 6, javascript: 5 },
      });

      for (let j = 0; j <= bagWeight; j++) {
        const canFit = j >= curWeight;

        push({
          dp2d: clone2d(dp),
          source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
          current: { row: i, col: j },
          dependencies: canFit
            ? [{ row: i - 1, col: j }, { row: i - 1, col: j - curWeight }]
            : [{ row: i - 1, col: j }],
          message: canFit
            ? `🔍 容量检查：当前背包容量 ${j} >= 物品重量 ${curWeight} 【可以放入，在不放与放入中二选一】。`
            : `🔍 容量检查：当前背包容量 ${j} < 物品重量 ${curWeight} 【装不下，只能不放】。`,
          log: `check: item=${i}, cap=${j}, canFit=${canFit}`,
          vars: makeVars({ i, j, curW: curWeight, curV: curValue, changed: ['j'] }),
          codeLine: {
            java: { primary: 8, context: [6, 7] },
            cpp: { primary: 8, context: [6, 7] },
            python: { primary: 8, context: [6, 7] },
            javascript: { primary: 7, context: [5, 6] },
          },
        });

        let resultVal: number;
        if (!canFit) {
          resultVal = (dp[i - 1][j] as number) || 0;
          dp[i][j] = resultVal;

          push({
            dp2d: clone2d(dp),
            source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j }],
            formula: `dp[${i}][${j}] = dp[${i - 1}][${j}] = ${resultVal}`,
            message: `⚡ 状态转移 (装不下)：继承上一个物品在容量 ${j} 下的价值 dp[${i - 1}][${j}] = ${resultVal}。`,
            log: `update: dp[${i}][${j}] = ${resultVal}`,
            vars: makeVars({ i, j, curW: curWeight, curV: curValue, curDp: resultVal, changed: ['dpij'] }),
            thematicMeta: {
              type: 'knapsack',
              knapsack: {
                capacity: bagWeight,
                currentCapacity: j,
                currentItemIndex: i,
                action: 'exclude',
              },
            },
            codeLine: {
              java: { primary: 9, context: [6, 7] },
              cpp: { primary: 9, context: [6, 7] },
              python: { primary: 9, context: [6, 7] },
              javascript: { primary: 8, context: [5, 6] },
            },
          });
        } else {
          const notTake = (dp[i - 1][j] as number) || 0;
          const take = ((dp[i - 1][j - curWeight] as number) || 0) + curValue;
          resultVal = Math.max(notTake, take);
          dp[i][j] = resultVal;

          const isTakeWinner = take > notTake;
          push({
            dp2d: clone2d(dp),
            source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
            current: { row: i, col: j },
            dependencies: [{ row: i - 1, col: j }, { row: i - 1, col: j - curWeight }],
            formula: `dp[${i}][${j}] = max(不放:${notTake}, 放入:${take}) = ${resultVal}`,
            message: `⚡ 状态转移 (二选一)：【不放: ${notTake}】 vs 【放入 (腾出 ${curWeight} 容量 + 价值 ${curValue}): ${take}】 $\rightarrow$ 最优价值 = ${resultVal}。`,
            log: `update: max(${notTake}, ${take}) => dp[${i}][${j}] = ${resultVal}`,
            vars: makeVars({ i, j, curW: curWeight, curV: curValue, curDp: resultVal, changed: ['dpij'] }),
            thematicMeta: {
              type: 'knapsack',
              knapsack: {
                capacity: bagWeight,
                currentCapacity: isTakeWinner ? j : ((dp[i - 1][j] as number) || 0),
                currentItemIndex: i,
                action: isTakeWinner ? 'include' : 'exclude',
              },
            },
            codeLine: {
              java: { primary: 11, context: [6, 7] },
              cpp: { primary: 11, context: [6, 7] },
              python: { primary: 11, context: [6, 7] },
              javascript: { primary: 10, context: [5, 6] },
            },
          });
        }
      }
    }

    const ans = dp[n - 1][bagWeight] as number;
    push({
      dp2d: clone2d(dp),
      source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
      current: { row: n - 1, col: bagWeight },
      message: `🏁 算法结束：在背包最大容量 ${bagWeight} 下，装入物品的最大总价值为 dp[${n - 1}][${bagWeight}] = ${ans}。`,
      log: `return: dp[${n - 1}][${bagWeight}] = ${ans}`,
      vars: makeVars({ curDp: ans, changed: ['dpij'] }),
      thematicMeta: {
        type: 'knapsack',
        knapsack: {
          capacity: bagWeight,
          currentCapacity: bagWeight,
          totalValue: ans,
          action: 'idle',
        },
      },
      codeLine: { java: 15, cpp: 15, python: 13, javascript: 14 },
    });

    return steps;
  },
};
