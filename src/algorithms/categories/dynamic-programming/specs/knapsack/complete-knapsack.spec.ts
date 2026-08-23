import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const CompleteKnapsackSpec: AlgorithmSpec = {
  id: 'complete-knapsack',
  name: '完全背包问题 (Complete Knapsack)',
  category: '背包 DP',
  description: '有 N 种物品和一个容量为 W 的背包，每种物品都有无限件可用。求装入背包的最大总价值。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 0,
    leetcodeUrl: 'https://leetcode.cn/circle/article/000000/',
    difficulty: 'medium',
    tags: ['动态规划', '完全背包', '经典模型'],
    description: '有 <code>n</code> 种物品和一个容量为 <code>w</code> 的背包。第 <code>i</code> 种物品的重量是 <code>weights[i]</code>，价值是 <code>values[i]</code>。<br/><br/>每种物品 <strong>都有无限件可用</strong>。<br/><br/>请问在不超过背包最大容量的前提下，装入背包的物品 <strong>最大总价值</strong> 是多少？',
    examples: [
      {
        input: 'weights = [1, 3, 4], values = [15, 20, 30], bagWeight = 4',
        output: '60',
        explanation: '选择 4 件物品 0 (重量 1, 价值 15)，总重量 4 <= 4，总价值 15 × 4 = 60。',
      },
    ],
    constraints: [
      '1 <= n <= 1000',
      '1 <= w <= 1000',
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
        'function completeKnapsack(weights, values, bagWeight) {',
        '    const n = weights.length;',
        '    const dp = new Array(bagWeight + 1).fill(0);',
        '    for (let i = 0; i < n; i++) { // 遍历物品',
        '        for (let j = weights[i]; j <= bagWeight; j++) { // 正序遍历容量（完全背包）',
        '            dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);',
        '        }',
        '    }',
        '    return dp[bagWeight];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int completeKnapsack(int[] weights, int[] values, int bagWeight) {',
        '        int n = weights.length;',
        '        int[] dp = new int[bagWeight + 1];',
        '        for (int i = 0; i < n; i++) {',
        '            for (int j = weights[i]; j <= bagWeight; j++) {',
        '                dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i]);',
        '            }',
        '        }',
        '        return dp[bagWeight];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int completeKnapsack(vector<int>& weights, vector<int>& values, int bagWeight) {',
        '        int n = weights.size();',
        '        vector<int> dp(bagWeight + 1, 0);',
        '        for (int i = 0; i < n; i++) {',
        '            for (int j = weights[i]; j <= bagWeight; j++) {',
        '                dp[j] = max(dp[j], dp[j - weights[i]] + values[i]);',
        '            }',
        '        }',
        '        return dp[bagWeight];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def completeKnapsack(self, weights: List[int], values: List[int], bagWeight: int) -> int:',
        '        dp = [0] * (bagWeight + 1)',
        '        for i in range(len(weights)):',
        '            for j in range(weights[i], bagWeight + 1):',
        '                dp[j] = max(dp[j], dp[j - weights[i]] + values[i])',
        '        return dp[bagWeight]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：完全背包问题求解。',
        2: '获取规模：n 为物品种数。',
        3: '开辟一维状态数组 dp[bagWeight + 1]。',
        4: '外层遍历物品种类。',
        5: '内层正序遍历容量：从当前物品重量 weights[i] 到 bagWeight（正序允许同件物品累加使用）。',
        6: '状态转移：dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i])。',
        9: '返回全局最大价值 dp[bagWeight]。',
      },
      java: {
        2: '函数入口。',
        4: '初始化 dp 数组。',
        5: '外层遍历物品。',
        6: '正序遍历容量。',
        7: 'max 转移。',
        10: '返回 dp[bagWeight]。',
      },
      cpp: {
        3: '函数入口。',
        5: '初始化 dp 向量。',
        6: '外层循环。',
        7: '内层正序循环。',
        8: '转移取最大。',
        10: '返回答案。',
      },
      python: {
        2: '函数入口。',
        3: '初始化列表。',
        4: '遍历物品。',
        5: '正序遍历容量。',
        6: '状态转移。',
        8: '返回 dp[bagWeight]。',
      },
    },
    keyPoints: {
      title: '🎯 完全背包问题 5 步法系统精讲',
      summary: '0-1 背包与完全背包的核心分水岭在于：0-1 背包容量必须倒序（防止重复选择），而完全背包容量必须正序（允许重复累加选择）！',
      points: [
        { label: '一、核心区别 (遍历方向)', desc: '• <strong>0-1 背包</strong>：容量 <code>j</code> <strong>倒序</strong>（每个物品只用 1 次）。<br>• <strong>完全背包</strong>：容量 <code>j</code> <strong>正序</strong>（每个物品可用无限次）。', icon: '🎯', badge: '正序 vs 倒序' },
        { label: '二、状态转移方程', desc: '<code>dp[j] = max(dp[j], dp[j - weights[i]] + values[i])</code>。', icon: '⚡', badge: '一维转移' },
        { label: '三、初始化', desc: '<code>dp</code> 数组全部初始化为 0。', icon: '🎬', badge: '全 0 初始化' },
        { label: '四、组合 vs 排列', desc: '• 先物品后容量：求<strong>组合数</strong>（无序）。<br>• 先容量后物品：求<strong>排列数</strong>（有序）。', icon: '🧭', badge: '遍历顺序哲学' },
        { label: '五、时空复杂度', desc: '• 时间复杂度：<code>O(n × W)</code>。<br>• 空间复杂度：<code>O(W)</code>。', icon: '⏱️', badge: 'O(n*W)' },
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

      if (Array.isArray(input.values)) values = input.values;
      else if (typeof input.values === 'string') values = input.values.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));

      if (typeof input.bagWeight === 'number') bagWeight = input.bagWeight;
      else if (typeof input.w === 'number') bagWeight = input.w;
    }

    const n = weights.length;
    const dp: DpCell[] = Array(bagWeight + 1).fill(0);

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
        { name: 'dp[j] (当前最大价值)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpj') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
      message: `🎯 函数入口：完全背包问题。共 ${n} 种物品（无限件可用），背包最大容量为 ${bagWeight}。`,
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

    // Step 1: Init
    push({
      dp1d: clone1d(dp),
      source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
      current: { index: 0 },
      message: `🎬 初始化：dp[0..${bagWeight}] 初始为 0。`,
      log: `init dp = 0`,
      vars: makeVars({ curDp: 0, changed: ['dpj'] }),
      codeLine: { java: 4, cpp: 4, python: 3, javascript: 3 },
    });

    // Loops (完全背包: 外层物品, 内层正序 j 从 weight 到 bagWeight)
    for (let i = 0; i < n; i++) {
      const curWeight = weights[i];
      const curValue = values[i];

      push({
        dp1d: clone1d(dp),
        source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
        current: { index: curWeight <= bagWeight ? curWeight : 0 },
        message: `🔄 外层循环：考察物品 ${i}（重量 ${curWeight}，价值 ${curValue}，无限件可用）。`,
        log: `outer loop: item ${i}`,
        vars: makeVars({ i, curW: curWeight, curV: curValue, changed: ['i', 'cw', 'cv'] }),
        thematicMeta: {
          type: 'knapsack',
          knapsack: {
            capacity: bagWeight,
            currentItemIndex: i,
            action: 'evaluate',
          },
        },
        codeLine: { java: 5, cpp: 5, python: 4, javascript: 4 },
      });

      for (let j = curWeight; j <= bagWeight; j++) {
        const notTake = dp[j] as number;
        const take = (dp[j - curWeight] as number) + curValue;
        const nextVal = Math.max(notTake, take);
        dp[j] = nextVal;

        const isTakeWinner = take > notTake;
        push({
          dp1d: clone1d(dp),
          source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
          current: { index: j },
          dependencies: [{ index: j - curWeight }],
          formula: `dp[${j}] = max(${notTake}, dp[${j - curWeight}] + ${curValue}) = ${nextVal}`,
          message: isTakeWinner
            ? `⚡ 状态转移 (放入物品 ${i})：容量 ${j} 下总价值提升至 ${nextVal}。`
            : `⏩ 状态保持：保持容量 ${j} 下的价值 ${notTake}。`,
          log: `update: dp[${j}] = ${nextVal}`,
          vars: makeVars({ i, j, curW: curWeight, curV: curValue, curDp: nextVal, changed: isTakeWinner ? ['dpj'] : [] }),
          thematicMeta: {
            type: 'knapsack',
            knapsack: {
              capacity: bagWeight,
              currentCapacity: nextVal,
              currentItemIndex: i,
              action: isTakeWinner ? 'include' : 'exclude',
            },
          },
          codeLine: {
            java: { primary: 7, context: [5, 6] },
            cpp: { primary: 7, context: [5, 6] },
            python: { primary: 6, context: [4, 5] },
            javascript: { primary: 6, context: [4, 5] },
          },
        });
      }
    }

    const ans = dp[bagWeight] as number;
    push({
      dp1d: clone1d(dp),
      source: weights.map((w, idx) => `物品${idx}(重${w},价${values[idx]})`),
      current: { index: bagWeight },
      message: `🏁 算法结束：完全背包最大总价值为 dp[${bagWeight}] = ${ans}。`,
      log: `return: dp[${bagWeight}] = ${ans}`,
      vars: makeVars({ j: bagWeight, curDp: ans, changed: ['dpj'] }),
      thematicMeta: {
        type: 'knapsack',
        knapsack: {
          capacity: bagWeight,
          currentCapacity: bagWeight,
          totalValue: ans,
          action: 'idle',
        },
      },
      codeLine: { java: 10, cpp: 10, python: 8, javascript: 9 },
    });

    return steps;
  },
};
