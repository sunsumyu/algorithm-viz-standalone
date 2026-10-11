/**
 * 和为 K 的子数组 — 步进推演编译器
 * LeetCode 560：前缀和 + 哈希表
 */

import { StepBase } from '../../../core/step-visualizer';

export interface SubarraySumStep extends StepBase {
  nums: number[];
  k: number;
  currentIdx: number;
  currentPrefixSum: number;
  targetPrefix: number;
  matchedCount: number;
  totalCount: number;
  prefixMap: Record<number, number>;
  phase: 'init' | 'compute-sum' | 'match-found' | 'update-map' | 'finish';
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
}

export const SUBARRAY_SUM_CODES = {
  java: `public class Solution {
    public int subarraySum(int[] nums, int k) {
        Map<Integer, Integer> map = new HashMap<>();
        map.put(0, 1); // 基础空前缀
        int count = 0, pre = 0;
        
        for (int x : nums) {
            pre += x;
            // 寻找历史前缀和使得 pre - target = k => target = pre - k
            if (map.containsKey(pre - k)) {
                count += map.get(pre - k);
            }
            map.put(pre, map.getOrDefault(pre, 0) + 1);
        }
        return count;
    }
}`,
  cpp: `class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        unordered_map<int, int> mp;
        mp[0] = 1;
        int count = 0, pre = 0;
        for (int x : nums) {
            pre += x;
            if (mp.count(pre - k)) {
                count += mp[pre - k];
            }
            mp[pre]++;
        }
        return count;
    }
};`,
  python: `class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        mp = {0: 1}
        count = 0
        pre = 0
        for x in nums:
            pre += x
            if pre - k in mp:
                count += mp[pre - k]
            mp[pre] = mp.get(pre, 0) + 1
        return count`,
};

export const SUBARRAY_SUM_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 4, cpp: 4, python: 3 },
  computeSum: { java: 8, cpp: 7, python: 6 },
  matchFound: { java: 11, cpp: 9, python: 8 },
  updateMap: { java: 13, cpp: 11, python: 9 },
  finish: { java: 15, cpp: 13, python: 10 },
};

export function buildSubarraySumSteps(nums: number[] = [1, 2, 3, -2, 1, 4], k: number = 3): SubarraySumStep[] {
  const steps: SubarraySumStep[] = [];
  const map: Record<number, number> = { 0: 1 };
  let count = 0;
  let pre = 0;

  // Step 0: Init
  steps.push({
    nums: [...nums],
    k,
    currentIdx: -1,
    currentPrefixSum: 0,
    targetPrefix: 0 - k,
    matchedCount: 0,
    totalCount: 0,
    prefixMap: { ...map },
    phase: 'init',
    message: `算法启动：寻找和为 k = ${k} 的子数组。初始化前缀和哈希表 map.put(0, 1) 代表空前缀。`,
    log: `初始化前缀和 map: { 0: 1 }, 目标 k=${k}`,
    codeLine: SUBARRAY_SUM_CODE_LINES.init,
  });

  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    pre += x;
    const target = pre - k;
    const match = map[target] || 0;

    steps.push({
      nums: [...nums],
      k,
      currentIdx: i,
      currentPrefixSum: pre,
      targetPrefix: target,
      matchedCount: match,
      totalCount: count,
      prefixMap: { ...map },
      phase: 'compute-sum',
      message: `处理 nums[${i}] = ${x}：累计当前前缀和 pre = ${pre}。需寻找的历史前缀为 target = pre - k = ${pre} - ${k} = ${target}。`,
      log: `前缀和 pre=${pre}, 检索 target=${target}`,
      codeLine: SUBARRAY_SUM_CODE_LINES.computeSum,
    });

    if (match > 0) {
      count += match;
      steps.push({
        nums: [...nums],
        k,
        currentIdx: i,
        currentPrefixSum: pre,
        targetPrefix: target,
        matchedCount: match,
        totalCount: count,
        prefixMap: { ...map },
        phase: 'match-found',
        message: `🎯 命中子数组！哈希表中存在 ${match} 个前缀和为 ${target} 的切分点！累加计数 count += ${match} -> ${count}。`,
        log: `命中前缀和 ${target} (${match}次), 累加后 count=${count}`,
        codeLine: SUBARRAY_SUM_CODE_LINES.matchFound,
      });
    }

    map[pre] = (map[pre] || 0) + 1;
    steps.push({
      nums: [...nums],
      k,
      currentIdx: i,
      currentPrefixSum: pre,
      targetPrefix: target,
      matchedCount: match,
      totalCount: count,
      prefixMap: { ...map },
      phase: 'update-map',
      message: `记录前缀和：将当前 pre = ${pre} 写入哈希表，该前缀和出现频次更新为 ${map[pre]}。`,
      log: `更新 map[${pre}] = ${map[pre]}`,
      codeLine: SUBARRAY_SUM_CODE_LINES.updateMap,
    });
  }

  // Finish
  steps.push({
    nums: [...nums],
    k,
    currentIdx: nums.length,
    currentPrefixSum: pre,
    targetPrefix: pre - k,
    matchedCount: 0,
    totalCount: count,
    prefixMap: { ...map },
    phase: 'finish',
    message: `全数组扫描完毕！数组中累计和为 k = ${k} 的连续子数组总数为 ${count} 个。`,
    log: `算法执行完毕，返回 count=${count}`,
    codeLine: SUBARRAY_SUM_CODE_LINES.finish,
  });

  return steps;
}
