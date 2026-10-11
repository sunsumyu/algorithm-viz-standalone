/**
 * Class 005: 二分搜索与局部最小值检测 (Binary Search & Local Minimum) - 视觉适配器
 */

import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';
import { BinarySearch005Step } from './binary-search-005-step-compiler';

export function renderBinarySearch005Canvas(container: HTMLElement, step: BinarySearch005Step): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <!-- 顶部指标卡 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">左指针 L</div>
          <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">[${step.l}]</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">中点指针 MID</div>
          <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.mid >= 0 ? `[${step.mid}]` : '-'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">右指针 R</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">[${step.r}]</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #166534;">当前确定答案</div>
          <div style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.foundIndex >= 0 ? `下标 [${step.foundIndex}]` : '探测中...'}</div>
        </div>
      </div>

      <!-- 数组索引区间展板 -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 10px;">🔍 搜索序列与当前考量窗口</div>
        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          ${step.nums.map((val, idx) => {
            const inRange = idx >= step.l && idx <= step.r;
            const isMid = idx === step.mid;
            const isAns = idx === step.foundIndex;
            let border = '#cbd5e1';
            let bg = inRange ? '#eff6ff' : '#f1f5f9';
            let textCol = inRange ? '#1e293b' : '#94a3b8';
            if (isMid) { bg = '#fef3c7'; border = '#f59e0b'; }
            if (isAns) { bg = '#dcfce7'; border = '#22c55e'; textCol = '#15803d'; }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 44px;">
                <span style="font-size: 10px; font-family: monospace; color: ${isMid ? '#f59e0b' : idx === step.l ? '#0284c7' : idx === step.r ? '#059669' : '#94a3b8'}; font-weight: 700;">
                  ${isMid ? 'MID' : idx === step.l ? 'L' : idx === step.r ? 'R' : ''}
                </span>
                <div style="width: 44px; height: 38px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; font-weight: 700; color: ${textCol}; font-size: 15px;">
                  ${val}
                </div>
                <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">[${idx}]</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 决策卡片 -->
      ${renderFormulaCard(
        '二分状态转移推导',
        `当前探测窗口 [${step.l} .. ${step.r}] | mid = ${step.mid >= 0 ? step.mid : 'N/A'} (值 ${step.mid >= 0 ? step.nums[step.mid] : 'N/A'})`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
