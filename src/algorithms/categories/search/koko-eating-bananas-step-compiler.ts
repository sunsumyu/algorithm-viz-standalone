/**
 * 爱吃香蕉的珂珂 (Koko Eating Bananas) - 步进编译器
 * LeetCode 875 (Medium / 左程云通关课 Class 056 二分答案法母题)
 */

import { StepBase } from '../../../core/step-visualizer';

export interface KokoStep extends StepBase {
  piles: number[];
  h: number;
  left: number;
  right: number;
  mid: number;
  totalHours: number;
  phase: 'init' | 'test-speed' | 'shrink-speed' | 'boost-speed' | 'finish';
  bestSpeed: number | null;
  message: string;
  log: string;
  codeLine?: number | Record<string, number>;
}

export const KOKO_BANANAS_CODES = {
  java: `public class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int left = 1, right = 0;
        for (int p : piles) right = Math.max(right, p);
        int ans = right;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (canFinish(piles, h, mid)) {
                ans = mid;        // 达标，尝试更慢速度
                right = mid - 1;
            } else {
                left = mid + 1;   // 超时，必须提速
            }
        }
        return ans;
    }
    private boolean canFinish(int[] piles, int h, int k) {
        long hours = 0;
        for (int p : piles) {
            hours += (p + k - 1) / k; // 上取整
        }
        return hours <= h;
    }
}`,
  cpp: `class Solution {
public:
    int minEatingSpeed(vector<int>& piles, int h) {
        int left = 1, right = *max_element(piles.begin(), piles.end());
        int ans = right;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            long long hours = 0;
            for (int p : piles) hours += (p + mid - 1) / mid;
            if (hours <= h) {
                ans = mid;
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        return ans;
    }
};`,
  python: `class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        left, right = 1, max(piles)
        ans = right
        while left <= right:
            mid = left + (right - left) // 2
            hours = sum((p + mid - 1) // mid for p in piles)
            if hours <= h:
                ans = mid
                right = mid - 1
            else:
                left = mid + 1
        return ans`,
};

export const KOKO_CODE_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 3, python: 3 },
  testSpeed: { java: 8, cpp: 8, python: 8 },
  shrinkSpeed: { java: 9, cpp: 9, python: 9 },
  boostSpeed: { java: 12, cpp: 12, python: 12 },
  finish: { java: 15, cpp: 15, python: 13 },
};

export function buildKokoSteps(piles: number[] = [3, 6, 7, 11], h: number = 8): KokoStep[] {
  const steps: KokoStep[] = [];

  let left = 1;
  let right = Math.max(...piles, 1);
  let ans = right;

  // Step 0: Init
  steps.push({
    piles: [...piles],
    h,
    left,
    right,
    mid: Math.floor((left + right) / 2),
    totalHours: 0,
    phase: 'init',
    bestSpeed: null,
    message: `算法启动：香蕉堆 [${piles.join(', ')}]，警察到达时限 h = ${h} 小时。速度二分区间设定为 [1 .. ${right}]。`,
    log: `初始化二分答案区间: [1 .. ${right}], 目标时限 h=${h}`,
    codeLine: KOKO_CODE_LINES.init,
  });

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);
    let hours = 0;
    for (const p of piles) {
      hours += Math.ceil(p / mid);
    }

    steps.push({
      piles: [...piles],
      h,
      left,
      right,
      mid,
      totalHours: hours,
      phase: 'test-speed',
      bestSpeed: ans,
      message: `检验速度 k = ${mid} 根/小时：吃完全部堆累计耗时 ${hours} 小时（时限 ${h} 小时）。`,
      log: `测试速度 k=${mid}: 耗时 ${hours}h / 限时 ${h}h`,
      codeLine: KOKO_CODE_LINES.testSpeed,
    });

    if (hours <= h) {
      ans = mid;
      steps.push({
        piles: [...piles],
        h,
        left,
        right,
        mid,
        totalHours: hours,
        phase: 'shrink-speed',
        bestSpeed: ans,
        message: `耗时 ${hours} <= ${h} 达标！记录可行解 ans = ${mid}，并尝试收缩上限求更慢速度：right = ${mid - 1}。`,
        log: `可行解 ans=${mid}, 收缩右边界 right=${mid - 1}`,
        codeLine: KOKO_CODE_LINES.shrinkSpeed,
      });
      right = mid - 1;
    } else {
      steps.push({
        piles: [...piles],
        h,
        left,
        right,
        mid,
        totalHours: hours,
        phase: 'boost-speed',
        bestSpeed: ans,
        message: `耗时 ${hours} > ${h} 超时！说明速度太慢，必须向右提速：left = ${mid + 1}。`,
        log: `超时！提高最低速度 left=${mid + 1}`,
        codeLine: KOKO_CODE_LINES.boostSpeed,
      });
      left = mid + 1;
    }
  }

  // Finish
  steps.push({
    piles: [...piles],
    h,
    left,
    right,
    mid: ans,
    totalHours: 0,
    phase: 'finish',
    bestSpeed: ans,
    message: `二分判定收敛：珂珂能在 ${h} 小时内吃完所有香蕉的最小吃速为 k = ${ans} 根/小时！`,
    log: `二分收敛：最优最小吃速 k=${ans}`,
    codeLine: KOKO_CODE_LINES.finish,
  });

  return steps;
}
