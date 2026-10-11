/**
 * 乘积小于 K 的子数组 (Subarray Product Less Than K) — 步进推演编译器
 * LeetCode 713 (Medium)
 */

import { StepBase } from '../../../core/step-visualizer';

export interface ProductLessThanKStep extends StepBase {
  nums: number[];
  k: number;
  left: number;
  right: number;
  prod: number;
  count: number;
  addedCount: number;
  phase: 'init' | 'expand' | 'shrink' | 'finish';
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
}

export const PRODUCT_LESS_THAN_K_CODES = {
  java: `public class Solution {
    public int numSubarrayProductLessThanK(int[] nums, int k) {
        if (k <= 1) return 0;
        int prod = 1, ans = 0, left = 0;
        
        for (int right = 0; right < nums.length; right++) {
            prod *= nums[right];
            while (prod >= k) {
                prod /= nums[left];
                left++;
            }
            ans += (right - left + 1);
        }
        return ans;
    }
}`,
  cpp: `class Solution {
public:
    int numSubarrayProductLessThanK(vector<int>& nums, int k) {
        if (k <= 1) return 0;
        int prod = 1, ans = 0, left = 0;
        for (int right = 0; right < nums.size(); right++) {
            prod *= nums[right];
            while (prod >= k) {
                prod /= nums[left];
                left++;
            }
            ans += (right - left + 1);
        }
        return ans;
    }
};`,
  python: `class Solution:
    def numSubarrayProductLessThanK(self, nums: list[int], k: int) -> int:
        if k <= 1: return 0
        prod, ans, left = 1, 0, 0
        for right, val in enumerate(nums):
            prod *= val
            while prod >= k:
                prod //= nums[left]
                left += 1
            ans += right - left + 1
        return ans`,
};

export const PRODUCT_LESS_THAN_K_CODE_LINES: Record<string, Record<string, number>> = {
  kLeOne: { java: 3, cpp: 3, python: 3 },
  init: { java: 4, cpp: 4, python: 4 },
  expand: { java: 7, cpp: 6, python: 6 },
  shrink: { java: 9, cpp: 8, python: 8 },
  count: { java: 12, cpp: 11, python: 10 },
  finish: { java: 14, cpp: 13, python: 11 },
};

export function buildProductLessThanKSteps(
  nums: number[] = [10, 5, 2, 6],
  k: number = 100
): ProductLessThanKStep[] {
  const steps: ProductLessThanKStep[] = [];

  if (k <= 1) {
    steps.push({
      nums: [...nums],
      k,
      left: 0,
      right: 0,
      prod: 1,
      count: 0,
      addedCount: 0,
      phase: 'finish',
      message: `k = ${k} <= 1：正整数数组子数组乘积至少为 1，不可能严格小于 k，直接返回 0。`,
      log: `k<=1 特判直接返回 0`,
      codeLine: PRODUCT_LESS_THAN_K_CODE_LINES.kLeOne,
    });
    return steps;
  }

  let prod = 1;
  let ans = 0;
  let left = 0;

  // Step 0: Init
  steps.push({
    nums: [...nums],
    k,
    left: 0,
    right: 0,
    prod: 1,
    count: 0,
    addedCount: 0,
    phase: 'init',
    message: `算法启动：原数组 [${nums.join(', ')}]，目标乘积阈值 k = ${k}。初始化双指针窗口 [0..0]。`,
    log: `初始化双指针: k=${k}`,
    codeLine: PRODUCT_LESS_THAN_K_CODE_LINES.init,
  });

  for (let right = 0; right < nums.length; right++) {
    prod *= nums[right];

    steps.push({
      nums: [...nums],
      k,
      left,
      right,
      prod,
      count: ans,
      addedCount: 0,
      phase: 'expand',
      message: `窗口向右扩展：引入 nums[${right}] = ${nums[right]}，当前窗口乘积 prod 更新为 ${prod}。`,
      log: `引入 nums[${right}]=${nums[right]} -> prod=${prod}`,
      codeLine: PRODUCT_LESS_THAN_K_CODE_LINES.expand,
    });

    while (prod >= k && left <= right) {
      const oldProd = prod;
      prod = Math.floor(prod / nums[left]);
      steps.push({
        nums: [...nums],
        k,
        left,
        right,
        prod,
        count: ans,
        addedCount: 0,
        phase: 'shrink',
        message: `乘积超标：prod = ${oldProd} >= k (${k})！左指针收缩：除以 nums[${left}] (${nums[left]})，left 从 ${left} 移至 ${left + 1}。`,
        log: `收缩 left=${left + 1}, 新 prod=${prod}`,
        codeLine: PRODUCT_LESS_THAN_K_CODE_LINES.shrink,
      });
      left++;
    }

    const added = right - left + 1;
    ans += added;

    steps.push({
      nums: [...nums],
      k,
      left,
      right,
      prod,
      count: ans,
      addedCount: added,
      phase: 'expand',
      message: `窗口合法 [${left} .. ${right}] (prod = ${prod} < ${k})：以 nums[${right}] 结尾的新增子数组有 ${added} 个。累计总数达 ${ans}。`,
      log: `新增 +${added} 个子数组 -> 累计 ans=${ans}`,
      codeLine: PRODUCT_LESS_THAN_K_CODE_LINES.count,
    });
  }

  // Finish
  steps.push({
    nums: [...nums],
    k,
    left,
    right: nums.length - 1,
    prod,
    count: ans,
    addedCount: 0,
    phase: 'finish',
    message: `全数组扫描完毕！乘积严格小于 ${k} 的连续子数组总数为 ${ans} 个。`,
    log: `算法收敛完成，返回 ans=${ans}`,
    codeLine: PRODUCT_LESS_THAN_K_CODE_LINES.finish,
  });

  return steps;
}
