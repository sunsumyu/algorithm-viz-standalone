/**
 * 寻找峰值 (Find Peak Element) - 视觉适配器
 */

import { PeakElementStep } from './find-peak-element-step-compiler';

export function renderPeakElementCanvas(step: PeakElementStep): string {
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
