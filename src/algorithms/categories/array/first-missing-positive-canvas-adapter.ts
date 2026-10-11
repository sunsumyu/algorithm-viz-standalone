/**
 * Hard 22: 缺失的第一个正数 — 画布适配器
 * 负责原地置换桶沙盘与鸽巢原理监视器渲染
 */

import { MissingPositiveStep } from './first-missing-positive-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderMissingPositiveCanvas(container: HTMLElement, step: MissingPositiveStep): void {
  container.innerHTML = `
    <div style="padding: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; gap: 14px;">
      <!-- 原地置换桶沙盘 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
            <span>📦 数组物理槽位归位状态 (原地隐式哈希桶)</span>
          </div>
          <span style="font-size: 11px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 999px;">
            有效区间 [1, ${step.nums.length}]
          </span>
        </div>

        <div style="display: flex; gap: 10px; overflow-x: auto; padding: 10px 4px;">
          ${step.nums.map((val, idx) => {
            const isFit = step.inPlaceStatus[idx];
            const isCurrent = idx === step.currentIndex;
            const isSwapped = step.swappedPair && step.swappedPair.includes(idx);

            let bg = '#f8fafc';
            let border = '#cbd5e1';
            let textColor = '#0f172a';
            let badgeBg = '#e2e8f0';
            let badgeText = '#475569';
            let shadow = 'none';

            if (isSwapped) {
              bg = '#fffbeb';
              border = '#f59e0b';
              textColor = '#b45309';
              badgeBg = '#fef3c7';
              badgeText = '#92400e';
              shadow = '0 0 10px rgba(245, 158, 11, 0.4)';
            } else if (isFit) {
              bg = '#f0fdf4';
              border = '#22c55e';
              textColor = '#15803d';
              badgeBg = '#dcfce7';
              badgeText = '#166534';
              shadow = '0 0 8px rgba(34, 197, 94, 0.25)';
            } else if (isCurrent) {
              bg = '#eff6ff';
              border = '#3b82f6';
              textColor = '#1d4ed8';
              badgeBg = '#dbeafe';
              badgeText = '#1e40af';
              shadow = '0 0 8px rgba(59, 130, 246, 0.25)';
            }

            return `
              <div style="
                flex: 1;
                min-width: 68px;
                max-width: 110px;
                height: 76px;
                background: ${bg};
                border: 2px solid ${border};
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: ${shadow};
                transition: all 0.2s ease;
                position: relative;
              ">
                <div style="font-size: 18px; font-weight: 800; color: ${textColor}; font-family: monospace;">${val}</div>
                <div style="font-size: 10px; color: ${badgeText}; background: ${badgeBg}; padding: 1px 6px; border-radius: 4px; margin-top: 4px; font-weight: 600;">
                  槽 #${idx} (应 ${idx + 1})
                </div>
                ${isFit ? '<span style="position: absolute; top: 4px; right: 6px; font-size: 10px; color: #16a34a; font-weight: bold;">✓</span>' : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; font-size: 11px; color: #64748b; padding-top: 10px; border-top: 1px dashed #e2e8f0;">
          <span>📌 <strong>置换法则</strong>：只要 nums[i] ∈ [1, N] 且 nums[nums[i]-1] ≠ nums[i]，立即交换至目标槽位。</span>
          <span>当前已归位: <strong style="color: #16a34a;">${step.inPlaceStatus.filter(Boolean).length} / ${step.nums.length}</strong></span>
        </div>
      </div>
    </div>
  `;
}

export function renderMissingPositiveAuxiliary(container: HTMLElement, step: MissingPositiveStep): void {
  const isDone = step.missingResult !== null;
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <span style="font-size: 11.5px; font-weight: 600; color: #475569;">当前置换决策:</span>
        <strong style="font-size: 12px; color: ${isDone ? '#16a34a' : '#2563eb'};">${step.decision}</strong>
      </div>
      ${renderFormulaCard(
        '原地哈希空间压缩公理',
        '对于长度为 N 的数组，最小缺失正数必在 [1, N+1] 之间。利用下标 x-1 作为数值 x 的唯一隐式归位槽！',
        '无需额外开辟哈希表，每个数字最多被置换一次进入正确位置，总时间严格 O(N)，额外空间严格 O(1)。',
        step.statusBadge
      )}
    </div>
  `;
}
