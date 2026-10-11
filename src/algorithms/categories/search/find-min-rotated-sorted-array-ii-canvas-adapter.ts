/**
 * Hard 27: 寻找旋转排序数组中的最小值 II (Find Minimum in Rotated Sorted Array II) - 视觉适配器
 */

import { MinRotatedStep } from './find-min-rotated-sorted-array-ii-step-compiler';

export function renderMinRotatedCanvas(container: HTMLElement, step: MinRotatedStep): void {
  const cardsHtml = step.nums
    .map((v, i) => {
      const isL = step.left === i;
      const isR = step.right === i;
      const isM = step.mid === i;
      const isAns = step.minVal !== null && step.left === i;

      let border = 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.7);';
      const badges: string[] = [];

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
