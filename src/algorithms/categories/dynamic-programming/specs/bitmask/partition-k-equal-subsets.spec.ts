import type { AlgorithmSpec, DpTraceStep } from '../../engine/types';
import { makeTraceStep } from '../../engine/dp-step-engine';

/**
 * 划分为k个相等的子集 (Partition to K Equal Sum Subsets)
 * LeetCode 698 / 左程云算法通关课 第080讲 状压DP上 Code03
 * 状压DP：用位掩码记录已分配元素，贪心填满 k 个容量为 target 的桶。
 */
export const PartitionKEqualSubsetsSpec: AlgorithmSpec = {
  id: 'partition-k-equal-subsets',
  name: '划分为k个相等子集 (Partition to K Equal Sum Subsets)',
  category: '状压 DP',
  description:
    '给 n 个数和 k，判断是否能划分为 k 个和相等的子集。用位掩码记录已分配元素，逐一填满每个桶。',
  difficulty: 'medium',
  problem: {
    leetcodeId: 698,
    leetcodeUrl: 'https://leetcode.cn/problems/partition-to-k-equal-sum-subsets/',
    difficulty: 'medium',
    tags: ['位运算', '状压DP', '回溯', '动态规划'],
    description:
      '给定 <code>nums</code> 数组和整数 <code>k</code>，判断能否将数组划分为 <code>k</code> 个非空子集，使得每个子集的元素和相等。<br/><br/><strong>核心思路：</strong>总和必须被 k 整除，令 target = sum/k。贪心策略：从大到小放入当前桶，桶满则换下一个桶。状压DP可用位掩码 status 记录哪些数已被分配，cur 记录当前桶的累加和。',
    examples: [
      {
        input: 'nums = [4,3,2,3,5,2,1], k = 4',
        output: 'true',
        explanation: '可以拆分为 [5], [4,1], [3,2], [3,2]。',
      },
      {
        input: 'nums = [1,2,3,4], k = 3',
        output: 'false',
        explanation: '总和 10 不能被 3 整除。',
      },
    ],
    constraints: [
      '1 <= k <= nums.length <= 16',
      '1 <= nums[i] <= 10^4',
    ],
  },
  semanticLines: {
    entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
    guard: { java: 5, cpp: 6, python: 4, javascript: 3 },
    init: { java: 8, cpp: 9, python: 7, javascript: 6 },
    stateTransfer: {
      java: [14, 15, 16, 17],
      cpp: [15, 16, 17, 18],
      python: [11, 12, 13, 14],
      javascript: [10, 11, 12, 13],
    },
    returnResult: { java: 21, cpp: 22, python: 17, javascript: 16 },
  },
  code: {
    languages: {
      javascript: [
        'function canPartitionKSubsets(nums, k) {',
        '    const sum = nums.reduce((a, b) => a + b, 0);',
        '    if (sum % k !== 0) return false;',
        '    const target = sum / k;',
        '    nums.sort((a, b) => b - a);',
        '    if (nums[0] > target) return false;',
        '    const buckets = new Array(k).fill(0);',
        '    return dfs(nums, buckets, 0, target);',
        '}',
        'function dfs(nums, buckets, idx, target) {',
        '    if (idx === nums.length) return true;',
        '    for (let i = 0; i < buckets.length; i++) {',
        '        if (buckets[i] + nums[idx] > target) continue;',
        '        if (i > 0 && buckets[i] === buckets[i - 1]) continue;',
        '        buckets[i] += nums[idx];',
        '        if (dfs(nums, buckets, idx + 1, target)) return true;',
        '        buckets[i] -= nums[idx];',
        '    }',
        '    return false;',
        '}',
      ],
      java: [
        'class Solution {',
        '    public boolean canPartitionKSubsets(int[] nums, int k) {',
        '        int sum = 0;',
        '        for (int n : nums) sum += n;',
        '        if (sum % k != 0) return false;',
        '        int target = sum / k;',
        '        Arrays.sort(nums);',
        '        // 反转为降序',
        '        for (int l = 0, r = nums.length - 1; l < r; l++, r--) {',
        '            int t = nums[l]; nums[l] = nums[r]; nums[r] = t;',
        '        }',
        '        if (nums[0] > target) return false;',
        '        return dfs(nums, new int[k], 0, target);',
        '    }',
        '    boolean dfs(int[] nums, int[] buckets, int idx, int target) {',
        '        if (idx == nums.length) return true;',
        '        for (int i = 0; i < buckets.length; i++) {',
        '            if (buckets[i] + nums[idx] > target) continue;',
        '            if (i > 0 && buckets[i] == buckets[i - 1]) continue;',
        '            buckets[i] += nums[idx];',
        '            if (dfs(nums, buckets, idx + 1, target)) return true;',
        '            buckets[i] -= nums[idx];',
        '        }',
        '        return false;',
        '    }',
        '}',
      ],
      cpp: [
        'class Solution {',
        'public:',
        '    bool canPartitionKSubsets(vector<int>& nums, int k) {',
        '        int sum = accumulate(nums.begin(), nums.end(), 0);',
        '        if (sum % k != 0) return false;',
        '        int target = sum / k;',
        '        sort(nums.rbegin(), nums.rend());',
        '        if (nums[0] > target) return false;',
        '        vector<int> buckets(k, 0);',
        '        return dfs(nums, buckets, 0, target);',
        '    }',
        '    bool dfs(vector<int>& nums, vector<int>& buckets, int idx, int target) {',
        '        if (idx == (int)nums.size()) return true;',
        '        for (int i = 0; i < (int)buckets.size(); i++) {',
        '            if (buckets[i] + nums[idx] > target) continue;',
        '            if (i > 0 && buckets[i] == buckets[i-1]) continue;',
        '            buckets[i] += nums[idx];',
        '            if (dfs(nums, buckets, idx + 1, target)) return true;',
        '            buckets[i] -= nums[idx];',
        '        }',
        '        return false;',
        '    }',
        '};',
      ],
      python: [
        'class Solution:',
        '    def canPartitionKSubsets(self, nums: List[int], k: int) -> bool:',
        '        total = sum(nums)',
        '        if total % k != 0: return False',
        '        target = total // k',
        '        nums.sort(reverse=True)',
        '        if nums[0] > target: return False',
        '        buckets = [0] * k',
        '        def dfs(idx):',
        '            if idx == len(nums): return True',
        '            for i in range(k):',
        '                if buckets[i] + nums[idx] > target: continue',
        '                if i > 0 and buckets[i] == buckets[i-1]: continue',
        '                buckets[i] += nums[idx]',
        '                if dfs(idx + 1): return True',
        '                buckets[i] -= nums[idx]',
        '            return False',
        '        return dfs(0)',
      ],
    },
    lineExplanations: {
      java: {
        2: '🎯 <strong>函数入口</strong>。',
        5: '总和不被 k 整除，直接 false。',
        12: '最大元素超过 target，不可能。',
        15: '递归回溯：把每个数放入 k 个桶之一。',
        19: '💡 <strong>剪枝</strong>：桶值相同时跳过避免重复搜索。',
      },
      javascript: {
        1: '🎯 <strong>函数入口</strong>。',
        3: '总和不被 k 整除 → false。',
        13: '💡 <strong>剪枝</strong>：桶值相同跳过。',
        15: '尝试放入当前桶后递归。',
      },
      cpp: { 3: '主函数。', 16: '剪枝跳过。' },
      python: { 2: '主函数。', 13: '剪枝跳过。' },
    },
    keyPoints: {
      thinking:
        '等和 k 子集划分是"火柴拼正方形"的一般化。用 k 个桶做回溯搜索，从大到小放入以加速剪枝。状压DP的形式是用 bitmask 记录已分配元素再用 cur 追踪当前桶的进度。',
      state: 'buckets[0..k-1] 记录每个桶的累积和，idx 表示正在分配第几个元素。',
      equation: '对 nums[idx] 尝试放入 buckets[i]（buckets[i] + nums[idx] ≤ target），递归 idx+1。',
      initAndBounds: '所有桶从 0 开始，target = sum/k。最大元素 > target 直接 false。',
    },
  },

  generateSteps: (input: { nums?: number[]; k?: number } = {}): DpTraceStep[] => {
    const steps: DpTraceStep[] = [];
    const nums = input?.nums ? [...input.nums] : [4, 3, 2, 3, 5, 2, 1];
    const k = input?.k || 4;
    const sum = nums.reduce((a, b) => a + b, 0);
    const target = sum / k;

    steps.push(makeTraceStep({
      phase: 'init',
      description: `数组: [${nums.join(',')}], k=${k}, 总和=${sum}, 目标=${target}`,
      highlights: [],
    }));

    nums.sort((a, b) => b - a);
    steps.push(makeTraceStep({
      phase: 'init',
      description: `降序排列: [${nums.join(',')}]`,
      highlights: [],
    }));

    const buckets = new Array(k).fill(0);
    let stepCount = 0;
    const maxSteps = 25;

    function dfs(idx: number): boolean {
      if (stepCount >= maxSteps) return false;
      if (idx === nums.length) {
        const ok = buckets.every(b => b === target);
        steps.push(makeTraceStep({
          phase: 'transfer',
          description: `所有数分配完，桶=[${buckets.join(',')}] → ${ok ? '✓' : '✗'}`,
          highlights: [],
        }));
        stepCount++;
        return ok;
      }
      for (let i = 0; i < k; i++) {
        if (buckets[i] + nums[idx] > target) continue;
        if (i > 0 && buckets[i] === buckets[i - 1]) continue;
        if (stepCount >= maxSteps) break;
        buckets[i] += nums[idx];
        steps.push(makeTraceStep({
          phase: 'transfer',
          description: `数${nums[idx]} → 桶${i}，桶=[${buckets.join(',')}]`,
          highlights: [],
        }));
        stepCount++;
        if (dfs(idx + 1)) return true;
        buckets[i] -= nums[idx];
      }
      return false;
    }

    const result = dfs(0);
    steps.push(makeTraceStep({
      phase: 'result',
      description: `最终结果：${result ? '能划分为 ' + k + ' 个等和子集 ✓' : '不能划分 ✗'}`,
      highlights: [],
      result,
    }));
    return steps;
  },
};

export const PartitionToKEqualSumSubsetsSpec = PartitionKEqualSubsetsSpec;

