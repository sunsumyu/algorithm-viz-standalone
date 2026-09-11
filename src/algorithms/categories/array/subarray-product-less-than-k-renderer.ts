/**
 * 乘积小于 K 的子数组 (Subarray Product Less Than K)
 * LeetCode 713 (Medium / 大厂高频双指针滑动窗口)
 * 核心原语:
 *  给你一个正整数数组 nums 和一个整数 k，请你返回该数组内乘积严格小于 k 的连续子数组的数目。
 *  滑动窗口单调递增性：
 *   全为正整数，随着窗口扩大，乘积严格单调递增。
 *   右指针 right 逐步扩展，维护窗口内乘积 prod *= nums[right]。
 *   若 prod >= k，收缩左指针 left 直到 prod < k。
 *   关键组合计数：每一个满足条件的合法窗口 [left .. right]，
 *   以 nums[right] 结尾的所有子数组均合法，新增子数组数目严格等于 (right - left + 1)！
 *  时间复杂度 O(N)，空间复杂度 O(1)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
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
  codeLine: number;
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

export function buildProductLessThanKSteps(nums: number[] = [10, 5, 2, 6], k: number = 100): ProductLessThanKStep[] {
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
      codeLine: 3,
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
    codeLine: 4,
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
      codeLine: 7,
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
        codeLine: 9,
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
      codeLine: 12,
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
    codeLine: 14,
  });

  return steps;
}

function renderProductLessThanKCanvas(step: ProductLessThanKStep): string {
  const { nums, k, left, right, prod, count, addedCount, phase } = step;

  const cards = nums
    .map((val, idx) => {
      const inWin = idx >= left && idx <= right && phase !== 'finish';
      const isL = idx === left && phase !== 'finish';
      const isR = idx === right && phase !== 'finish';

      let bg = 'rgba(255, 255, 255, 0.05)';
      let border = '1px solid rgba(255, 255, 255, 0.1)';
      let color = '#94a3b8';

      if (inWin) {
        bg = 'rgba(56, 189, 248, 0.2)';
        border = '2px solid #38bdf8';
        color = '#bae6fd';
      }

      let tag = '';
      if (isL && isR) tag = '<span style="color:#ec4899;font-weight:700;">L/R</span>';
      else if (isL) tag = '<span style="color:#60a5fa;font-weight:700;">L</span>';
      else if (isR) tag = '<span style="color:#a78bfa;font-weight:700;">R</span>';

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
        <div style="font-size: 11px; height: 16px; margin-bottom: 4px;">${tag}</div>
        <div style="
          width: 100%;
          height: 44px;
          background: ${bg};
          border: ${border};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color};
          font-weight: 700;
          font-size: 18px;
          transition: all 0.2s;
        ">${val}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 4px;">[${idx}]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">滑动窗口双指针 [L .. R] 乘积跟踪</div>
          <div style="font-size: 11px; color: ${prod < k ? '#34d399' : '#ef4444'}; font-weight: 700;">
            当前窗口积: ${prod} (${prod < k ? `✓ < ${k}` : `✗ >= ${k}`})
          </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; min-height: 75px;">
          ${cards}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">目标阈值 k</div>
          <div style="font-size: 16px; font-weight: 700; color: #60a5fa;">${k}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前窗口积 prod</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${prod}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">本轮新增子数组</div>
          <div style="font-size: 16px; font-weight: 700; color: ${addedCount > 0 ? '#34d399' : '#94a3b8'};">
            +${addedCount}
          </div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">累计合格子数组</div>
          <div style="font-size: 18px; font-weight: 700; color: #ec4899;">${count}</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'subarray-product-less-than-k',
  name: '乘积小于 K 的子数组',
  category: 'array',
  difficulty: 2,
  learningGoal: 'LeetCode 713: 统计乘积严格小于 k 的连续子数组数。利用正整数单调性双指针窗口与每次 right - left + 1 的贡献累加，O(N) 极速完成。',
  codeLanguages: PRODUCT_LESS_THAN_K_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.nums as string | number[] | undefined;
    const rawK = Number(inputs?.k ?? 100);
    let arr = [10, 5, 2, 6];
    if (typeof raw === 'string') {
      try {
        arr = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        arr = [10, 5, 2, 6];
      }
    } else if (Array.isArray(raw) && raw.length > 0) {
      arr = raw.map(Number);
    }
    return buildProductLessThanKSteps(arr, isNaN(rawK) ? 100 : rawK);
  },
  renderCanvas: (container: HTMLElement, step: ProductLessThanKStep) => {
    container.innerHTML = renderProductLessThanKCanvas(step);
  },
  inputs: [
    {
      id: 'nums',
      label: '正整数序列',
      type: 'text',
      defaultValue: '10, 5, 2, 6',
      placeholder: '逗号分隔正整数',
    },
    {
      id: 'k',
      label: '乘积阈值 k',
      type: 'number',
      defaultValue: 100,
      placeholder: '阈值 k',
    },
  ],
});
