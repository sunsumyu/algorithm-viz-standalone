import type { AlgorithmSpec, DpTraceStep, DpCell } from '../../engine/types';
import { clone1d, makeTraceStep } from '../../engine/dp-step-engine';

export const LastStoneWeightIiSpec: AlgorithmSpec = {
  id: 'last-stone-weight-ii',
  name: '最后一块石头的重量 II (Last Stone Weight II)',
  category: '背包 DP',
  description: '有一堆石头，用整数数组 stones 表示。每一回合选出任意两块石头进行粉碎。返回最后剩下的一块石头的最小可能重量。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 1049,
    leetcodeUrl: 'https://leetcode.cn/problems/last-stone-weight-ii/',
    difficulty: 'medium',
    tags: ['数组', '动态规划', '0-1背包'],
    description: '有一堆石头，用整数数组 <code>stones</code> 表示。其中 <code>stones[i]</code> 表示第 <code>i</code> 块石头的重量。<br/><br/>每一回合，从中选出 <strong>任意两块石头</strong> ，然后将它们一起粉碎。假设石头的重量分别为 <code>x</code> 和 <code>y</code>，且 <code>x <= y</code>。那么粉碎的可能结果如下：<br/>• 如果 <code>x == y</code>，那么两块石头都会被完全粉碎；<br/>• 如果 <code>x != y</code>，那么重量为 <code>x</code> 的石头将会完全粉碎，而重量为 <code>y</code> 的石头新重量为 <code>y - x</code>。<br/><br/>最后，<strong>最多只会剩下一块</strong> 石头。返回此石头 <strong>最小的可能重量</strong> 。若没有石头剩下，就返回 <code>0</code>。<br/><br/><strong>数学等价转换</strong>：粉碎过程等价于将所有石头分成总重量最接近的两堆，最小差值即为 <code>sum - 2 * dp[target]</code>（其中 <code>target = sum / 2</code>）！',
    examples: [
      {
        input: 'stones = [2,7,4,1,8,1]',
        output: '1',
        explanation: '组合成两堆：[2, 7, 1] (和=10) 与 [4, 8, 1] (和=13)，差值最小为 13 - 10 = 1 磅。',
      },
      {
        input: 'stones = [31,26,33,21,40]',
        output: '5',
      },
    ],
    constraints: [
      '1 <= stones.length <= 30',
      '1 <= stones[i] <= 100',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 2, python: 2, javascript: 1 },
    init: { java: [3, 8], cpp: [3, 7], python: [3, 5], javascript: [2, 4] },
    loopCheck: { java: 9, cpp: 8, python: 6, javascript: 5 },
    innerLoopCheck: { java: 10, cpp: 9, python: 7, javascript: 6 },
    stateTransfer: {
      java: { primary: 11, context: [9, 10] },
      cpp: { primary: 10, context: [8, 9] },
      python: { primary: 8, context: [6, 7] },
      javascript: { primary: 7, context: [5, 6] },
    },
    loopExit: { java: 9, cpp: 8, python: 6, javascript: 5 },
    returnResult: { java: 14, cpp: 13, python: 9, javascript: 10 },
  },
  code: {
    languages: {
      javascript: [
        'function lastStoneWeightII(stones) {',
        '    const sum = stones.reduce((a, b) => a + b, 0);',
        '    const target = Math.floor(sum / 2);',
        '    const dp = new Array(target + 1).fill(0);',
        '    for (let i = 0; i < stones.length; i++) { // 遍历石头物品',
        '        for (let j = target; j >= stones[i]; j--) { // 倒序遍历背包容量',
        '            dp[j] = Math.max(dp[j], dp[j - stones[i]] + stones[i]);',
        '        }',
        '    }',
        '    return sum - 2 * dp[target]; // 另一堆减去当前堆重量差',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int lastStoneWeightII(int[] stones) {',
        '        int sum = 0;',
        '        for (int stone : stones) sum += stone;',
        '        int target = sum / 2;',
        '        int[] dp = new int[target + 1];',
        '        for (int i = 0; i < stones.length; i++) {',
        '            for (int j = target; j >= stones[i]; j--) {',
        '                dp[j] = Math.max(dp[j], dp[j - stones[i]] + stones[i]);',
        '            }',
        '        }',
        '        return sum - 2 * dp[target];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int lastStoneWeightII(vector<int>& stones) {',
        '        int sum = 0;',
        '        for (int stone : stones) sum += stone;',
        '        int target = sum / 2;',
        '        vector<int> dp(target + 1, 0);',
        '        for (int i = 0; i < stones.size(); i++) {',
        '            for (int j = target; j >= stones[i]; j--) {',
        '                dp[j] = max(dp[j], dp[j - stones[i]] + stones[i]);',
        '            }',
        '        }',
        '        return sum - 2 * dp[target];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def lastStoneWeightII(self, stones: List[int]) -> int:',
        '        total_sum = sum(stones)',
        '        target = total_sum // 2',
        '        dp = [0] * (target + 1)',
        '        for stone in stones:',
        '            for j in range(target, stone - 1, -1):',
        '                dp[j] = max(dp[j], dp[j - stone] + stone)',
        '        return total_sum - 2 * dp[target]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口：最后一块石头的重量 II。',
        2: '计算所有石头总重量 sum。',
        3: '将容量目标定为一半 target = floor(sum / 2)。',
        4: '初始化 0-1 背包 dp[target + 1]。',
        5: '外层遍历每块石头。',
        6: '内层从 target 到 stones[i] 倒序遍历容量，防止物品重复使用。',
        7: '0-1 背包状态转移：max(不放, 放入第 i 块石头)。',
        10: '返回两堆石头的最小差值 sum - 2 * dp[target]。',
      },
      java: {
        2: '函数入口。',
        4: '累加总和。',
        5: '背包目标容量。',
        7: '外层遍历石头。',
        8: '倒序遍历容量。',
        9: '状态转移。',
        12: '返回差值。',
      },
      cpp: {
        3: '函数入口。',
        5: '计算总和与半数目标。',
        7: '循环递推。',
        9: '状态转移。',
        13: '返回结果。',
      },
      python: {
        2: '函数入口。',
        3: '计算 sum 与 target。',
        5: '外层遍历物品。',
        6: '倒序遍历容量。',
        7: '状态转移。',
        8: '返回两堆差值。',
      },
    },
    keyPoints: {
      title: '🎯 最后一块石头的重量 II 5 步法系统精讲',
      summary: 'LeetCode 1049。通过数学思维将「石头两两粉碎」等价转化为「将所有石头分成总重量最接近的两堆」的 0-1 背包问题！',
      points: [
        { label: '一、问题等价转换', desc: '石块粉碎等价于在每个石头前添加 <code>+</code> 或 <code>-</code> 符号，最终使差值最小。即求容量为 <code>target = sum / 2</code> 的背包最多能装入多少重量 <code>dp[target]</code>。', icon: '🎯', badge: '分两堆' },
        { label: '二、状态转移方程', desc: '<code>dp[j] = max(dp[j], dp[j - stones[i]] + stones[i])</code>。', icon: '⚡', badge: '0-1背包' },
        { label: '三、倒序遍历', desc: '一维数组容量 <code>j</code> 必须从 <code>target</code> 递减至 <code>stones[i]</code>，防止同一块石头被重复装入。', icon: '🎬', badge: '倒序防污染' },
        { label: '四、最终答案推导', desc: '两堆重量分别为 <code>dp[target]</code> 和 <code>sum - dp[target]</code>，最小差值为 <code>(sum - dp[target]) - dp[target] = sum - 2 * dp[target]</code>。', icon: '⏱️', badge: 'sum - 2*dp' },
      ],
    },
  },
  generateSteps: (input: any): DpTraceStep[] => {
    let stones: number[] = [2, 7, 4, 1, 8, 1];

    if (typeof input === 'object' && input) {
      if (Array.isArray(input.stones)) stones = input.stones;
      else if (Array.isArray(input.nums)) stones = input.nums;
      else if (typeof input.nums === 'string') stones = input.nums.split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    }

    const sum = stones.reduce((a, b) => a + b, 0);
    const target = Math.floor(sum / 2);
    const dp: DpCell[] = Array(target + 1).fill(0);

    const steps: DpTraceStep[] = [];
    const push = (step: DpTraceStep) => steps.push(makeTraceStep(step));

    const makeVars = (opts: {
      i?: number | string;
      j?: number | string;
      curStone?: number | string;
      curDp?: DpCell | number | string;
      ans?: number | string;
      changed?: string[];
    }) => {
      const iVal = opts.i ?? '-';
      const jVal = opts.j ?? '-';
      const stVal = opts.curStone ?? '-';
      const cur = opts.curDp ?? '-';
      const a = opts.ans ?? (sum - 2 * (dp[target] as number));
      const chSet = new Set(opts.changed || []);

      return [
        { name: 'stones (石头重量)', value: `[${stones.join(', ')}]`, type: 'string' as const, changed: chSet.has('st') },
        { name: 'sum (总重)', value: String(sum), type: 'number' as const, changed: chSet.has('sum') },
        { name: 'target (半重目标 ⌊sum/2⌋)', value: String(target), type: 'number' as const, changed: chSet.has('tgt') },
        { name: 'i (当前石头)', value: String(iVal), type: (typeof iVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('i') },
        { name: 'stones[i] (重量)', value: String(stVal), type: (typeof stVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('sti') },
        { name: 'j (容量)', value: String(jVal), type: (typeof jVal === 'number' ? 'number' : 'string') as any, changed: chSet.has('j') },
        { name: 'dp[j] (当前容量最大承重)', value: String(cur), type: (typeof cur === 'number' ? 'number' : 'string') as any, changed: chSet.has('dpj') },
        { name: '当前最小差值', value: String(a), type: (typeof a === 'number' ? 'number' : 'string') as any, changed: chSet.has('ans') },
      ];
    };

    // Step 0: Entry
    push({
      dp1d: clone1d(dp),
      source: stones.map((s, idx) => `石${idx}(重${s})`),
      message: `🎯 函数入口：最后一块石头的重量 II。石头总重量 sum = ${sum}，转化为容量 target = ⌊${sum}/2⌋ = ${target} 的 0-1 背包问题。`,
      log: `entry: sum=${sum}, target=${target}`,
      vars: makeVars({ changed: ['st', 'sum', 'tgt'] }),
      codeLine: { java: 2, cpp: 2, python: 2, javascript: 1 },
    });

    for (let i = 0; i < stones.length; i++) {
      const stone = stones[i];
      for (let j = target; j >= stone; j--) {
        const notTake = dp[j] as number;
        const take = (dp[j - stone] as number) + stone;
        const best = Math.max(notTake, take);
        dp[j] = best;

        const isTake = take > notTake;
        push({
          dp1d: clone1d(dp),
          source: stones.map((s, idx) => `石${idx}(重${s})`),
          current: { index: j },
          dependencies: [{ index: j - stone }],
          formula: `dp[${j}] = max(不选:${notTake}, 选石${i}:${take}) = ${best}`,
          message: isTake
            ? `⚡ 放入第 ${i} 块石头 (重 ${stone})：容量 ${j} 下承重提升至 ${best}。`
            : `⏩ 跳过第 ${i} 块石头 (重 ${stone})：保持历史承重 ${best}。`,
          log: `dp[${j}] = ${best}`,
          vars: makeVars({ i, j, curStone: stone, curDp: best, changed: ['i', 'j', 'sti', 'dpj'] }),
          codeLine: {
            java: { primary: 11, context: [9, 10] },
            cpp: { primary: 10, context: [8, 9] },
            python: { primary: 8, context: [6, 7] },
            javascript: { primary: 7, context: [5, 6] },
          },
        });
      }
    }

    const finalAns = sum - 2 * (dp[target] as number);
    push({
      dp1d: clone1d(dp),
      source: stones.map((s, idx) => `石${idx}(重${s})`),
      current: { index: target },
      message: `🏁 算法结束：第一堆最大重量 dp[${target}] = ${dp[target]}，两堆石头最小差值为 ${sum} - 2 × ${dp[target]} = ${finalAns}。`,
      log: `return: diff=${finalAns}`,
      vars: makeVars({ curDp: dp[target], ans: finalAns, changed: ['dpj', 'ans'] }),
      codeLine: { java: 14, cpp: 13, python: 9, javascript: 10 },
    });

    return steps;
  },
};
