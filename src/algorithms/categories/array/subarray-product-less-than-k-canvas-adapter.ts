/**
 * 乘积小于 K 的子数组 — 画布渲染适配器
 */

import { ProductLessThanKStep } from './subarray-product-less-than-k-step-compiler';

export function renderProductLessThanKCanvas(container: HTMLElement, step: ProductLessThanKStep): void {
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

  container.innerHTML = `
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
