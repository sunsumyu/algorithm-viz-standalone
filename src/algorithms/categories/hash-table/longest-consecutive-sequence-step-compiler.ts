/**
 * 最长连续序列 — 步进推演编译器
 * LeetCode 128：哈希表 O(N) 判起点延伸
 */

import { StepBase } from '../../../core/step-visualizer';

export interface LongestConsecutiveStep extends StepBase {
  nums: number[];
  numSet: number[];
  currentNum: number;
  isStreakStart: boolean;
  currentStreak: number[];
  longestStreak: number[];
  maxLen: number;
  phase: 'init' | 'check-start' | 'expand' | 'update-max' | 'finish';
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
}

export const LONGEST_CONSECUTIVE_CODES = {
  java: `public class Solution {
    public int longestConsecutive(int[] nums) {
        Set<Integer> set = new HashSet<>();
        for (int num : nums) set.add(num);
        int longestStreak = 0;
        
        for (int num : set) {
            // 只有当前数字是连续序列的起点时才展开探索
            if (!set.contains(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;
                while (set.contains(currentNum + 1)) {
                    currentNum += 1;
                    currentStreak += 1;
                }
                longestStreak = Math.max(longestStreak, currentStreak);
            }
        }
        return longestStreak;
    }
}`,
  cpp: `class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> numSet(nums.begin(), nums.end());
        int longestStreak = 0;
        for (int num : numSet) {
            if (!numSet.count(num - 1)) {
                int cur = num;
                int streak = 1;
                while (numSet.count(cur + 1)) {
                    cur++;
                    streak++;
                }
                longestStreak = max(longestStreak, streak);
            }
        }
        return longestStreak;
    }
};`,
  python: `class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        num_set = set(nums)
        longest = 0
        for num in num_set:
            if num - 1 not in num_set:
                cur = num
                streak = 1
                while cur + 1 in num_set:
                    cur += 1
                    streak += 1
                longest = max(longest, streak)
        return longest`,
};

export const LONGEST_CONSECUTIVE_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 4, python: 3 },
  checkStart: { java: 9, cpp: 7, python: 6 },
  expand: { java: 12, cpp: 10, python: 9 },
  updateMax: { java: 16, cpp: 14, python: 12 },
  finish: { java: 19, cpp: 17, python: 13 },
};

export function buildLongestConsecutiveSteps(
  nums: number[] = [100, 4, 200, 1, 3, 2]
): LongestConsecutiveStep[] {
  const steps: LongestConsecutiveStep[] = [];
  const set = new Set(nums);
  const uniqueNums = Array.from(set).sort((a, b) => a - b);

  let maxLen = 0;
  let bestStreak: number[] = [];

  // Step 0: Init
  steps.push({
    nums: [...nums],
    numSet: [...uniqueNums],
    currentNum: -1,
    isStreakStart: false,
    currentStreak: [],
    longestStreak: [],
    maxLen: 0,
    phase: 'init',
    message: `算法启动：原数组有 ${nums.length} 个数，去重后哈希集合有 ${uniqueNums.length} 个元素。`,
    log: `初始化 HashSet: {${uniqueNums.join(', ')}}`,
    codeLine: LONGEST_CONSECUTIVE_CODE_LINES.init,
  });

  for (const num of uniqueNums) {
    const isStart = !set.has(num - 1);

    steps.push({
      nums: [...nums],
      numSet: [...uniqueNums],
      currentNum: num,
      isStreakStart: isStart,
      currentStreak: isStart ? [num] : [],
      longestStreak: [...bestStreak],
      maxLen,
      phase: 'check-start',
      message: `考察数字 ${num}：检查 ${num - 1} 是否存在于哈希表。${isStart ? `不存在！确认 ${num} 是连续序列的“起点”！` : `存在 ${num - 1}，说明 ${num} 只是中途点，直接跳过以保 O(N)！`}`,
      log: `判断起点 num=${num}: ${num - 1} 在集合? ${!isStart}`,
      codeLine: LONGEST_CONSECUTIVE_CODE_LINES.checkStart,
    });

    if (isStart) {
      let cur = num;
      const curStreak = [cur];

      while (set.has(cur + 1)) {
        cur += 1;
        curStreak.push(cur);
        steps.push({
          nums: [...nums],
          numSet: [...uniqueNums],
          currentNum: cur,
          isStreakStart: true,
          currentStreak: [...curStreak],
          longestStreak: [...bestStreak],
          maxLen,
          phase: 'expand',
          message: `连续递增命中：集合中存在 ${cur}！当前连续链条扩展为 [${curStreak.join(' -> ')}] (长度 ${curStreak.length})。`,
          log: `链条延伸: 找到 ${cur}, 当前长度=${curStreak.length}`,
          codeLine: LONGEST_CONSECUTIVE_CODE_LINES.expand,
        });
      }

      if (curStreak.length > maxLen) {
        maxLen = curStreak.length;
        bestStreak = [...curStreak];
        steps.push({
          nums: [...nums],
          numSet: [...uniqueNums],
          currentNum: num,
          isStreakStart: true,
          currentStreak: [...curStreak],
          longestStreak: [...bestStreak],
          maxLen,
          phase: 'update-max',
          message: `刷新最长连续序列！序列 [${bestStreak.join(', ')}]，最大长度更新为 ${maxLen}。`,
          log: `更新最长连续序列: len=${maxLen}`,
          codeLine: LONGEST_CONSECUTIVE_CODE_LINES.updateMax,
        });
      }
    }
  }

  // Finish
  steps.push({
    nums: [...nums],
    numSet: [...uniqueNums],
    currentNum: -1,
    isStreakStart: false,
    currentStreak: [],
    longestStreak: [...bestStreak],
    maxLen,
    phase: 'finish',
    message: `算法完成：全集合扫描完毕。最长数字连续序列为 [${bestStreak.join(' ➔ ')}]，长度为 ${maxLen}。`,
    log: `算法收敛完成，最大长度=${maxLen}`,
    codeLine: LONGEST_CONSECUTIVE_CODE_LINES.finish,
  });

  return steps;
}
