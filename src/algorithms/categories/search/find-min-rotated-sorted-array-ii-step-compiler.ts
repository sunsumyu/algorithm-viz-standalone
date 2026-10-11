/**
 * Hard 27: 寻找旋转排序数组中的最小值 II (Find Minimum in Rotated Sorted Array II) - 步进编译器
 * LeetCode 154 (Hard / 包含重复元素的二分查找压轴题)
 */

import { StepBase } from '../../../core/step-visualizer';

export interface MinRotatedStep extends StepBase {
  nums: number[];
  left: number;
  right: number;
  mid: number;
  phase: 'init' | 'compare' | 'shrink' | 'finish';
  minVal: number | null;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
}

export const MIN_ROTATED_CODES = {
  java: `public class Solution {
    public int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) {
                // 最小值必在 mid 右侧
                left = mid + 1;
            } else if (nums[mid] < nums[right]) {
                // 最小值在 mid 或其左侧
                right = mid;
            } else {
                // 相等时，安全排除右端重复项
                right--;
            }
        }
        return nums[left];
    }
}`,
  cpp: `class Solution {
public:
    int findMin(vector<int>& nums) {
        int left = 0, right = nums.size() - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) {
                left = mid + 1;
            } else if (nums[mid] < nums[right]) {
                right = mid;
            } else {
                right--;
            }
        }
        return nums[left];
    }
};`,
  python: `class Solution:
    def findMin(self, nums: list[int]) -> int:
        left, right = 0, len(nums) - 1
        while left < right:
            mid = left + (right - left) // 2
            if nums[mid] > nums[right]:
                left = mid + 1
            elif nums[mid] < nums[right]:
                right = mid
            else:
                right -= 1
        return nums[left]`,
};

export const MIN_ROTATED_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 4, python: 3 },
  greater: { java: 8, cpp: 8, python: 7 },
  less: { java: 11, cpp: 10, python: 9 },
  equal: { java: 14, cpp: 12, python: 11 },
  finish: { java: 17, cpp: 15, python: 12 },
};

export function buildMinRotatedSteps(nums: number[] = [2, 2, 2, 0, 1, 2]): MinRotatedStep[] {
  const steps: MinRotatedStep[] = [];

  let left = 0;
  let right = nums.length - 1;

  // Step 0: Init
  steps.push({
    nums: [...nums],
    left,
    right,
    mid: Math.floor((left + right) / 2),
    phase: 'init',
    minVal: null,
    message: `算法启动：查找旋转数组中的最小值。初始区间 [left:${left} .. right:${right}]，初始 mid = ${Math.floor((left + right) / 2)}。`,
    log: `初始化三路二分查找: left=0, right=${right}`,
    codeLine: MIN_ROTATED_CODE_LINES.init,
  });

  while (left < right) {
    const mid = Math.floor(left + (right - left) / 2);

    if (nums[mid] > nums[right]) {
      steps.push({
        nums: [...nums],
        left,
        right,
        mid,
        phase: 'compare',
        minVal: null,
        message: `nums[mid:${mid}] = ${nums[mid]} > nums[right:${right}] = ${nums[right]}：说明旋转破坏点必在右半区！收缩 left = mid + 1 = ${mid + 1}。`,
        log: `mid > right: 收缩至右区间 [${mid + 1} .. ${right}]`,
        codeLine: MIN_ROTATED_CODE_LINES.greater,
      });
      left = mid + 1;
    } else if (nums[mid] < nums[right]) {
      steps.push({
        nums: [...nums],
        left,
        right,
        mid,
        phase: 'compare',
        minVal: null,
        message: `nums[mid:${mid}] = ${nums[mid]} < nums[right:${right}] = ${nums[right]}：说明右半区严格递增，最小值在 mid 或左侧。收缩 right = mid = ${mid}。`,
        log: `mid < right: 收缩至左区间 [${left} .. ${mid}]`,
        codeLine: MIN_ROTATED_CODE_LINES.less,
      });
      right = mid;
    } else {
      steps.push({
        nums: [...nums],
        left,
        right,
        mid,
        phase: 'shrink',
        minVal: null,
        message: `⚡ nums[mid:${mid}] == nums[right:${right}] = ${nums[mid]}：存在重复元素，无法判定单调侧！由于 nums[mid] 仍保留该值，安全执行 right-- 排除末端重复项。`,
        log: `mid == right: 安全线性退化 right-- (right=${right - 1})`,
        codeLine: MIN_ROTATED_CODE_LINES.equal,
      });
      right--;
    }
  }

  // Finish
  steps.push({
    nums: [...nums],
    left,
    right,
    mid: left,
    phase: 'finish',
    minVal: nums[left],
    message: `🎉 二分搜索收敛！left 与 right 重合于索引 [${left}]，找到旋转数组中的全局最小值 【${nums[left]}】！`,
    log: `找到全局最小值: nums[${left}] = ${nums[left]}`,
    codeLine: MIN_ROTATED_CODE_LINES.finish,
  });

  return steps;
}
