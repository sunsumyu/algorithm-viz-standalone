/**
 * 寻找峰值 (Find Peak Element) - 步进编译器
 * LeetCode 162 (Medium / 左程云通关课 Class 005 进阶)
 */

import { StepBase } from '../../../core/step-visualizer';

export interface PeakElementStep extends StepBase {
  nums: number[];
  left: number;
  right: number;
  mid: number;
  phase: 'init' | 'check-slope' | 'shrink-left' | 'shrink-right' | 'finish';
  peakIdx: number | null;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
}

export const PEAK_ELEMENT_CODES = {
  java: `public class Solution {
    public int findPeakElement(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < nums[mid + 1]) {
                // 上坡：向高处走，峰值必在右侧
                left = mid + 1;
            } else {
                // 下坡：峰值在 mid 或左侧
                right = mid;
            }
        }
        return left;
    }
}`,
  cpp: `class Solution {
public:
    int findPeakElement(vector<int>& nums) {
        int left = 0, right = nums.size() - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < nums[mid + 1]) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        return left;
    }
};`,
  python: `class Solution:
    def findPeakElement(self, nums: list[int]) -> int:
        left, right = 0, len(nums) - 1
        while left < right:
            mid = left + (right - left) // 2
            if nums[mid] < nums[mid + 1]:
                left = mid + 1
            else:
                right = mid
        return left`,
};

export const PEAK_ELEMENT_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 4, python: 3 },
  checkSlope: { java: 6, cpp: 7, python: 6 },
  shrinkLeft: { java: 8, cpp: 8, python: 7 },
  shrinkRight: { java: 11, cpp: 10, python: 9 },
  finish: { java: 14, cpp: 13, python: 10 },
};

export function buildPeakElementSteps(nums: number[] = [1, 2, 1, 3, 5, 6, 4]): PeakElementStep[] {
  const steps: PeakElementStep[] = [];

  let left = 0;
  let right = nums.length - 1;

  // Step 0: Init
  steps.push({
    nums: [...nums],
    left,
    right,
    mid: Math.floor((left + right) / 2),
    phase: 'init',
    peakIdx: null,
    message: `算法启动：在无序数组中寻找局部峰值。初始区间 [left:${left} .. right:${right}]。`,
    log: `初始化峰值二分: left=0, right=${right}`,
    codeLine: PEAK_ELEMENT_CODE_LINES.init,
  });

  while (left < right) {
    const mid = Math.floor(left + (right - left) / 2);

    steps.push({
      nums: [...nums],
      left,
      right,
      mid,
      phase: 'check-slope',
      peakIdx: null,
      message: `检测中点斜率：mid = ${mid} (值 ${nums[mid]}) 与 mid+1 = ${mid + 1} (值 ${nums[mid + 1]})。`,
      log: `比较 nums[${mid}]=${nums[mid]} 与 nums[${mid + 1}]=${nums[mid + 1]}`,
      codeLine: PEAK_ELEMENT_CODE_LINES.checkSlope,
    });

    if (nums[mid] < nums[mid + 1]) {
      steps.push({
        nums: [...nums],
        left,
        right,
        mid,
        phase: 'shrink-left',
        peakIdx: null,
        message: `上坡趋势：nums[${mid}] < nums[${mid + 1}]，向高处走右侧必有峰值！收缩 left = mid + 1 = ${mid + 1}。`,
        log: `上坡: left = ${mid + 1}`,
        codeLine: PEAK_ELEMENT_CODE_LINES.shrinkLeft,
      });
      left = mid + 1;
    } else {
      steps.push({
        nums: [...nums],
        left,
        right,
        mid,
        phase: 'shrink-right',
        peakIdx: null,
        message: `下坡趋势：nums[${mid}] > nums[${mid + 1}]，峰值在当前 mid 或其左侧！收缩 right = mid = ${mid}。`,
        log: `下坡: right = ${mid}`,
        codeLine: PEAK_ELEMENT_CODE_LINES.shrinkRight,
      });
      right = mid;
    }
  }

  // Final step
  steps.push({
    nums: [...nums],
    left,
    right,
    mid: left,
    phase: 'finish',
    peakIdx: left,
    message: `二分收敛：left === right === ${left}。找到峰值元素 nums[${left}] = ${nums[left]}！`,
    log: `收敛命中峰值 index=${left}, value=${nums[left]}`,
    codeLine: PEAK_ELEMENT_CODE_LINES.finish,
  });

  return steps;
}
