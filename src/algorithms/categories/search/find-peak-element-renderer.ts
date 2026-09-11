/**
 * 寻找峰值 (Find Peak Element)
 * LeetCode 162 (Medium / 左程云通关课 Class 005 进阶)
 * 核心原语:
 *  数组局部极值二分查找。nums[-1] = nums[n] = -∞。
 *  无序数组中只要 nums[mid] < nums[mid + 1]，说明右侧必定存在峰值 (向高处走必有峰值)；
 *  反之 nums[mid] > nums[mid + 1]，说明 mid 自身或左侧必定存在峰值。
 *  时间复杂度 O(log N)，空间复杂度 O(1)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
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
  codeLine: number;
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
    codeLine: 4,
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
      codeLine: 5,
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
        codeLine: 7,
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
        codeLine: 10,
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
    codeLine: 13,
  });

  return steps;
}

function renderPeakElementCanvas(step: PeakElementStep): string {
  const { nums, left, right, mid, phase, peakIdx } = step;

  const maxVal = Math.max(...nums, 1);
  const minVal = Math.min(...nums, 0);
  const valRange = Math.max(maxVal - minVal, 1);

  const bars = nums
    .map((val, idx) => {
      const isPeak = peakIdx === idx;
      const isMid = phase !== 'finish' && idx === mid;
      const isRange = idx >= left && idx <= right;

      let bgColor = 'rgba(255, 255, 255, 0.06)';
      let borderColor = 'rgba(255, 255, 255, 0.15)';
      let textColor = '#94a3b8';

      if (isPeak) {
        bgColor = 'rgba(16, 185, 129, 0.35)';
        borderColor = '#10b981';
        textColor = '#34d399';
      } else if (isMid) {
        bgColor = 'rgba(245, 158, 11, 0.35)';
        borderColor = '#f59e0b';
        textColor = '#fbbf24';
      } else if (isRange) {
        bgColor = 'rgba(59, 130, 246, 0.18)';
        borderColor = 'rgba(59, 130, 246, 0.4)';
        textColor = '#93c5fd';
      }

      const barHeight = Math.max(24, Math.round(((val - minVal) / valRange) * 110 + 20));

      let badge = '';
      if (idx === left && idx === right && phase !== 'finish') {
        badge = '<span style="color:#ec4899;font-weight:700;">L/R</span>';
      } else if (idx === left && phase !== 'finish') {
        badge = '<span style="color:#60a5fa;font-weight:700;">L</span>';
      } else if (idx === right && phase !== 'finish') {
        badge = '<span style="color:#a78bfa;font-weight:700;">R</span>';
      } else if (isPeak) {
        badge = '<span style="color:#34d399;font-weight:700;">★ 峰顶</span>';
      }

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 44px; margin: 0 4px;">
        <div style="font-size: 11px; height: 16px; margin-bottom: 4px;">${badge}</div>
        <div style="
          width: 100%;
          height: ${barHeight}px;
          background: ${bgColor};
          border: 2px solid ${borderColor};
          border-radius: 6px 6px 0 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 6px;
          color: ${textColor};
          font-weight: 700;
          font-size: 14px;
          transition: all 0.25s ease;
        ">${val}</div>
        <div style="
          width: 100%;
          text-align: center;
          background: rgba(15, 23, 42, 0.6);
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 11px;
          color: #64748b;
          padding: 2px 0;
        ">[${idx}]</div>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">海拔/坡度剖面图（二分爬坡查找）</div>
          <div style="display: flex; gap: 10px; font-size: 11px;">
            <span style="color: #93c5fd;">● 当前区间 [L..R]</span>
            <span style="color: #fbbf24;">● 当前 Mid</span>
            <span style="color: #34d399;">● 局部峰值</span>
          </div>
        </div>
        <div style="display: flex; align-items: flex-end; justify-content: center; min-height: 170px; padding-bottom: 8px;">
          ${bars}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">左边界 Left</div>
          <div style="font-size: 16px; font-weight: 700; color: #60a5fa;">${left}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">中点 Mid</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${mid}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">右边界 Right</div>
          <div style="font-size: 16px; font-weight: 700; color: #a78bfa;">${right}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">判定峰值下标</div>
          <div style="font-size: 16px; font-weight: 700; color: ${peakIdx !== null ? '#34d399' : '#64748b'};">
            ${peakIdx !== null ? `${peakIdx} (值 ${nums[peakIdx]})` : '查找中...'}
          </div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'find-peak-element',
  name: '寻找峰值',
  category: 'search',
  difficulty: 2,
  learningGoal: 'LeetCode 162: 在无序数组中寻找局部峰值元素。巧妙利用“往高处走必有峰值”的单调上坡性质，在 O(log N) 时间内锁定极值。',
  codeLanguages: PEAK_ELEMENT_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.nums as string | number[] | undefined;
    let arr = [1, 2, 1, 3, 5, 6, 4];
    if (typeof raw === 'string') {
      try {
        arr = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        arr = [1, 2, 1, 3, 5, 6, 4];
      }
    } else if (Array.isArray(raw) && raw.length > 0) {
      arr = raw.map(Number);
    }
    return buildPeakElementSteps(arr);
  },
  renderCanvas: (container: HTMLElement, step: PeakElementStep) => {
    container.innerHTML = renderPeakElementCanvas(step);
  },
  inputs: [
    {
      id: 'nums',
      label: '数组元素',
      type: 'text',
      defaultValue: '1, 2, 1, 3, 5, 6, 4',
      placeholder: '用逗号分隔的数字序列',
    },
  ],
});
