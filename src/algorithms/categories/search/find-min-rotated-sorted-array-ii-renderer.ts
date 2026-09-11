/**
 * Hard 27: 寻找旋转排序数组中的最小值 II (Find Minimum in Rotated Sorted Array II)
 * LeetCode 154 (Hard / 包含重复元素的二分查找压轴题)
 * 核心原语:
 *  已知一个升序排列的数组在某未知轴点上进行了旋转，且数组中【可能包含重复元素】
 *  三路二分决策：
 *   1. nums[mid] > nums[right]: 最小值必定在右半区 (left = mid + 1)
 *   2. nums[mid] < nums[right]: 最小值在左半区包含 mid (right = mid)
 *   3. nums[mid] == nums[right]: 无法断定在左还是在右！但至少 right 位置的值与 mid 重复，安全执行 (right--) 收缩！
 *  最差退化至 O(N)，平均极速 O(log N)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
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
  codeLine: number;
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
    codeLine: 4,
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
        codeLine: 8,
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
        codeLine: 11,
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
        codeLine: 14,
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
    codeLine: 17,
  });

  return steps;
}

export function renderMinRotatedCanvas(container: HTMLElement, step: MinRotatedStep) {
  const cardsHtml = step.nums
    .map((v, i) => {
      const isL = step.left === i;
      const isR = step.right === i;
      const isM = step.mid === i;
      const isAns = step.minVal !== null && step.left === i;

      let border = 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.7);';
      let badges: string[] = [];

      if (isAns) {
        border = 'border: 2px solid #34d399; background: rgba(6, 78, 59, 0.5); box-shadow: 0 0 12px rgba(52, 211, 153, 0.4);';
        badges.push('<span style="color: #34d399; font-weight: bold;">⭐ 最小值</span>');
      }
      if (isM) {
        badges.push('<span style="color: #fbbf24; font-weight: bold;">mid</span>');
      }
      if (isL) {
        badges.push('<span style="color: #38bdf8; font-weight: bold;">left</span>');
      }
      if (isR) {
        badges.push('<span style="color: #f43f5e; font-weight: bold;">right</span>');
      }

      return `
      <div style="
        padding: 10px 14px;
        border-radius: 8px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 60px;
        transition: all 0.2s;
      ">
        <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">[${i}]</div>
        <div style="font-size: 20px; font-weight: bold; color: #f8fafc; margin: 4px 0;">${v}</div>
        <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 2px; font-size: 10px; align-items: center;">
          ${badges.join('')}
        </div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">带重复元素的三路二分查找决策沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            [${step.left} .. ${step.right}]
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #38bdf8;">left: ${step.left}</span>
          <span style="color: #fbbf24;">mid: ${step.mid}</span>
          <span style="color: #f43f5e;">right: ${step.right}</span>
          ${
            step.minVal !== null
              ? `<span style="padding: 2px 8px; border-radius: 4px; font-weight: bold; background: rgba(52, 211, 153, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);">全局最小值: ${step.minVal}</span>`
              : ''
          }
        </div>
      </div>

      <!-- 数组卡片序列 -->
      <div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 16px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${cardsHtml}
      </div>

      <!-- 三分支原理说明卡片 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">1. mid &gt; right</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">说明中间仍属于旋转前段高地，跌落拐点必在右半区，果断收缩 left = mid + 1。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fde047;">2. mid &lt; right</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">说明右半区严格单调递增，拐点在 mid 或左侧，安全收缩 right = mid。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fb7185;">3. mid == right (平缓退化)</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">重复元素阻断单调性判断！但由于 nums[mid] 承载相同数值，执行 right-- 绝不丢解。</div>
        </div>
      </div>
    </div>
  `;
}

export const findMinRotatedSortedArrayIIVisualizer = registerDeclarativeAlgorithm<MinRotatedStep>({
  id: 'find-min-rotated-sorted-array-ii',
  name: 'Hard 27: 寻找旋转排序数组最小值 II (LeetCode 154)',
  category: 'search',
  icon: '📉',
  difficulty: 3,
  levelOrder: 154,
  learningGoal: '深刻理解带重复元素二分查找的三分支决策模型，掌握通过 right-- 平缓降级解决单调性歧义的关键技巧',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 154 - Hard)</h3>
      <p>已知一个按升序排列的整数数组 <code>nums</code> ，预先未知在某个点上进行了旋转。数组中<strong>可能包含重复元素</strong>，找出其中的最小元素：</p>
      <ul>
        <li><strong>为什么是 Hard？</strong> 若无重复元素（LeetCode 153），通过 <code>nums[mid]</code> 与 <code>nums[right]</code> 大小比对可在严格 $O(\log N)$ 完成。</li>
        <li><strong>重复元素破解</strong>：当 <code>nums[mid] == nums[right]</code> 时，无法直接砍半！例如 <code>[3, 3, 1, 3]</code> 与 <code>[1, 3, 3, 3]</code>，最小值可能在左也可能在右。
          <br/><strong>神来之笔</strong>：此时只需执行 <code>right--</code>！因为即使 <code>nums[right]</code> 是最小值，其值也已经由 <code>nums[mid]</code> 保留备份，因此单步收缩绝对不会丢失最优解！</li>
      </ul>
    </div>
  `,
  codeLanguages: MIN_ROTATED_CODES,
  inputs: [
    {
      id: 'case',
      label: '预设旋转数组',
      type: 'select',
      defaultValue: 'case1',
      options: [
        { label: '[2, 2, 2, 0, 1, 2] (经典重复折断)', value: 'case1' },
        { label: '[10, 1, 10, 10, 10] (两端重复)', value: 'case2' },
      ],
    },
  ],
  generateSteps: (input) => {
    const c = input?.case || 'case1';
    const nums = c === 'case2' ? [10, 1, 10, 10, 10] : [2, 2, 2, 0, 1, 2];
    return buildMinRotatedSteps(nums);
  },
  renderCanvas: (container, step) => {
    renderMinRotatedCanvas(container, step);
  },
});
