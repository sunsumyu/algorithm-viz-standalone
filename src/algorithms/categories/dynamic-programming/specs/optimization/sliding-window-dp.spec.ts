import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 单调队列优化 DP / 跳跃游戏 VI (Sliding Window Monotonic Queue DP / Jump Game VI)
 * LeetCode 1696 / 左程云算法通关课 第130讲 单调队列优化 DP
 * 状态定义：dp[i] = nums[i] + max_{max(0, i-k) <= j < i} dp[j]。
 * 优化原理：窗口滑动时维护一个单调递减双端队列，使滑动窗口内的区间最值查询从 $O(k)$ 降至均摊 $O(1)$，整体复杂度降为 $O(N)$。
 */
export const SlidingWindowDpSpec: AlgorithmSpec = {
  id: 'sliding-window-dp',
  name: '单调队列优化 DP (跳跃游戏 VI)',
  category: '优化与观察 DP',
  description:
    '给定整数数组 nums 与整数 k。从索引 0 出发，每一步最多向前跳 k 格，所经位置的数值累加为得分。求到达最后一个索引 (n-1) 所能获得的最大总得分。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 1696,
    leetcodeUrl: 'https://leetcode.cn/problems/jump-game-vi/',
    difficulty: 'medium',
    tags: ['队列', '动态规划', '单调队列', '滑动窗口'],
    description:
      '给你一个下标从 <code>0</code> 开始的整数数组 <code>nums</code> 和一个整数 <code>k</code>。<br/><br/>一开始你在下标 <code>0</code> 处。每一步，你最多可以往前跳 <code>k</code> 步，但不能跳出数组的边界。也就是说，你可以从下标 <code>i</code> 跳到 <code>[i + 1, min(n - 1, i + k)]</code> 包含的任何下标处。<br/><br/>你的目标是到达数组最后一个位置（下标为 <code>n - 1</code> ），你的<strong>得分</strong>为经过的所有数字之和。<br/><br/>请你返回你能得到的<strong>最大得分</strong>。<br/><br/><strong>单调队列优化 DP：</strong><br/>朴素转移方程为 <code>dp[i] = nums[i] + max_{i-k <= j < i}(dp[j])</code>，直接枚举 $j$ 复杂度为 $O(N \\cdot k)$。<br/>由于候选集合是长度为 $k$ 的滑动窗口，我们维护一个<strong>单调递减的双端队列 deque</strong>（队首永远是当前窗口内最大的 <code>dp[j]</code>）：<br/>1. 若队首超出距离 $k$（<code>i - deque[0] > k</code>），队首弹出；<br/>2. <code>dp[i] = nums[i] + dp[deque[0]]</code>；<br/>3. 当队尾元素的 dp 值 $\\le$ 当前 <code>dp[i]</code> 时，队尾弹出；<br/>4. 将当前下标 $i$ 入队。整体时间复杂度优化为 $O(N)$。',
    examples: [
      {
        input: 'nums = [1, -1, -2, 4, -7, 3], k = 2',
        output: '7',
        explanation: '跳跃路径选择 0 -> 1 -> 3 -> 5，得分 1 + (-1) + 4 + 3 = 7。',
      },
      {
        input: 'nums = [10, -5, -2, 4, 0, 3], k = 3',
        output: '17',
        explanation: '跳跃路径 0 -> 3 -> 5，得分 10 + 4 + 3 = 17。',
      },
    ],
    constraints: [
      '1 <= nums.length, k <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 3, cpp: 4, python: 3, javascript: 2 },
    init: { java: 5, cpp: 6, python: 5, javascript: 3 },
    loopCheck: { java: 9, cpp: 10, python: 8, javascript: 7 },
    stateTransfer: {
      java: [10, 11, 12, 13, 14, 15],
      cpp: [11, 12, 13, 14, 15, 16],
      python: [9, 10, 11, 12, 13, 14],
      javascript: [8, 9, 10, 11, 12, 13],
    },
    loopExit: { java: 15, cpp: 15, python: 14, javascript: 13 },
    returnResult: { java: 16, cpp: 16, python: 15, javascript: 14 },
  },
  code: {
    languages: {
      javascript: [
        'function maxResult(nums, k) {',
        '  const n = nums.length;',
        '  const dp = new Array(n).fill(0);',
        '  dp[0] = nums[0];',
        '  const deque = [0]; // 维护单调递减下标',
        '  for (let i = 1; i < n; i++) {',
        '    if (deque[0] < i - k) deque.shift();',
        '    dp[i] = nums[i] + dp[deque[0]];',
        '    while (deque.length > 0 && dp[deque[deque.length - 1]] <= dp[i]) {',
        '      deque.pop();',
        '    }',
        '    deque.push(i);',
        '  }',
        '  return dp[n - 1];',
        '}',
      ],
      java: [
        'class Solution {',
        '    public int maxResult(int[] nums, int k) {',
        '        int n = nums.length;',
        '        int[] dp = new int[n];',
        '        dp[0] = nums[0];',
        '        Deque<Integer> deque = new ArrayDeque<>();',
        '        deque.addLast(0);',
        '        for (int i = 1; i < n; i++) {',
        '            if (deque.peekFirst() < i - k) deque.pollFirst();',
        '            dp[i] = nums[i] + dp[deque.peekFirst()];',
        '            while (!deque.isEmpty() && dp[deque.peekLast()] <= dp[i]) {',
        '                deque.pollLast();',
        '            }',
        '            deque.addLast(i);',
        '        }',
        '        return dp[n - 1];',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    int maxResult(vector<int>& nums, int k) {',
        '        int n = nums.size();',
        '        vector<int> dp(n, 0);',
        '        dp[0] = nums[0];',
        '        deque<int> dq = {0};',
        '        for (int i = 1; i < n; i++) {',
        '            if (dq.front() < i - k) dq.pop_front();',
        '            dp[i] = nums[i] + dp[dq.front()];',
        '            while (!dq.empty() && dp[dq.back()] <= dp[i]) {',
        '                dq.pop_back();',
        '            }',
        '            dq.push_back(i);',
        '        }',
        '        return dp[n - 1];',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def maxResult(self, nums: list[int], k: int) -> int:',
        '        from collections import deque',
        '        n = len(nums)',
        '        dp = [0] * n',
        '        dp[0] = nums[0]',
        '        dq = deque([0])',
        '        for i in range(1, n):',
        '            if dq[0] < i - k:',
        '                dq.popleft()',
        '            dp[i] = nums[i] + dp[dq[0]]',
        '            while dq and dp[dq[-1]] <= dp[i]:',
        '                dq.pop()',
        '            dq.append(i)',
        '        return dp[-1]',
      ],
    },
    lineExplanations: {
      javascript: {
        1: '函数入口，传入数组 nums 和最大跳跃跨度 k。',
        3: 'dp[i] 记录跳跃到达索引 i 处的最大累计得分。',
        4: '起点 0 处的得分为 nums[0]。',
        5: 'deque 存放窗口内的下标，保证对应 dp 严格递减。',
        7: '队首过期检查：若队首下标距离当前 i 超过 k 则滑出窗口。',
        8: 'O(1) 获取前 k 步中最大的 dp[deque[0]] 并累加当前 nums[i]。',
        9: '单调队列维护：淘汰队尾所有价值不如 dp[i] 的较老候选点。',
        12: '将当前下标 i 入队。',
        14: '返回到达终点 n-1 的最大得分。',
      },
      java: {
        2: '方法入口。',
        5: '初始化 dp 数组。',
        7: 'ArrayDeque 存放候选最优下标。',
        9: '过期滑出。',
        10: 'O(1) 状态转移。',
        11: '尾部单调性弹出。',
        15: '返回终点答案。',
      },
      cpp: {
        3: '函数入口。',
        6: '初始化。',
        8: 'std::deque 滑窗最值。',
        10: '转移。',
        11: '单调淘汰。',
        16: '返回 dp[n-1]。',
      },
      python: {
        2: '方法入口。',
        6: '初始化起始点得分。',
        8: '左端过期 popleft。',
        10: '转移。',
        11: '右端淘汰 pop。',
        14: '返回 dp[-1]。',
      },
    },
    keyPoints: {
      thinking:
        '单调队列优化 DP 是最经典的转移优化技巧之一：只要状态转移形如 $dp[i] = \text{opt}_{i-k \\le j < i}(dp[j]) + \text{cost}(i)$，即转移决策区间为一个固定长度的滑动窗口，且与 $i$ 无交叉乘积项，就可以使用单调队列将转移时间均摊降为 $O(1)$。',
      state: 'dp[i] 为到达位置 i 的最大得分；deque 保存可能作为最优前驱的递减下标。',
      equation: 'dp[i] = nums[i] + dp[deque[0]]',
      initAndBounds: 'dp[0] = nums[0], deque = [0]。',
      complexity: '时间复杂度 $O(N)$（每个元素入队、出队至多各一次），空间复杂度 $O(N)$。',
    },
    faqList: [
      {
        tag: '为什么单调队列能均摊 O(1)',
        question: 'while 循环弹出队尾会不会导致复杂度退化为 O(N^2)？',
        answer:
          '不会。因为数组中的每个下标 $i$ 最多只会被加入队列一次，也最多只会被从队头或队尾弹出一次。总的入队和出队操作次数上限是 $2N$，因此均摊到每次循环的操作时间是常数 $O(1)$。',
      },
    ],
  },
  generateSteps: (input: { nums?: number[]; k?: number } = {}): DpTraceStep[] => {
    const nums = input?.nums || [1, -1, -2, 4, -7, 3];
    const k = input?.k || 2;
    const n = nums.length;
    const steps: DpTraceStep[] = [];

    const dp = new Array(n).fill(0);
    dp[0] = nums[0];
    const deque = [0];

    steps.push(
      makeTraceStep({
        dp1d: nums.map((v, i) => ({
          value: i === 0 ? v : 0,
          label: `nums[${i}]=${v}`,
          state: i === 0 ? 'active' : 'default',
        })),
        message: `🦘 跳跃游戏 VI：数组 nums = [${nums.join(', ')}]，最大跳跃跨度 k = ${k}。起点 dp[0] = <strong>${nums[0]}</strong>，单调队列初始化为 [0]。`,
        log: `初始化: nums=[${nums.join(', ')}], k=${k}, dp[0]=${nums[0]}`,
        vars: [
          { name: '跳跃跨度 k', value: String(k) },
          { name: '当前单调队列', value: `[idx:0 (dp:${dp[0]})]` },
          { name: '起点得分', value: String(dp[0]) },
        ],
        metrics: { maxScore: dp[0] },
      })
    );

    for (let i = 1; i < n; i++) {
      let expired = false;
      if (deque[0] < i - k) {
        deque.shift();
        expired = true;
      }
      const bestFrom = deque[0];
      dp[i] = nums[i] + dp[bestFrom];

      let poppedCount = 0;
      while (deque.length > 0 && dp[deque[deque.length - 1]] <= dp[i]) {
        deque.pop();
        poppedCount++;
      }
      deque.push(i);

      steps.push(
        makeTraceStep({
          dp1d: dp.map((v, idx) => ({
            value: v,
            label: `dp[${idx}]`,
            state: idx === i ? 'active' : idx <= i ? 'computed' : 'default',
          })),
          current: { index: i },
          message: `👉 计算 <strong>i=${i}</strong> (nums[${i}]=${nums[i]})：<br/>• ${expired ? '⚠️ 队首超出窗口跨度 k 弹出；' : ''}从队列最优前驱 <code>idx=${bestFrom} (dp=${dp[bestFrom]})</code> 转移：dp[${i}] = ${nums[i]} + (${dp[bestFrom]}) = <strong>${dp[i]}</strong>；<br/>• 维护单调递减性：淘汰队尾 ${poppedCount} 个劣势元素，当前队列为 <code>[${deque.map((idx) => `${idx}(dp:${dp[idx]})`).join(', ')}]</code>。`,
          log: `step i=${i}: from idx=${bestFrom}, dp[${i}]=${dp[i]}, deque=[${deque.join(', ')}]`,
          formula: `dp[${i}] = nums[${i}] + dp[${bestFrom}]`,
          vars: [
            { name: '当前计算索引 i', value: String(i) },
            { name: '选择最优前驱', value: `idx:${bestFrom} (dp:${dp[bestFrom]})` },
            { name: '当前获得 dp 值', value: String(dp[i]) },
            { name: '单调队列状态', value: deque.map((idx) => `${idx}`).join(',') },
          ],
          metrics: { maxScore: dp[i] },
        })
      );
    }

    const finalAns = dp[n - 1];

    steps.push(
      makeTraceStep({
        dp1d: dp.map((v, i) => ({ value: v, label: `dp[${i}]`, state: 'computed' })),
        message: `🏆 跳跃游戏 VI 计算完成！到达终点索引 ${n - 1} 能够获得的最大总得分为 <strong>${finalAns}</strong>。`,
        log: `计算结束：终点最大得分 = ${finalAns}`,
        vars: [
          { name: '最终最高得分', value: String(finalAns) },
        ],
        metrics: { maxScore: finalAns },
      })
    );

    return steps;
  },
};
