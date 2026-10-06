/**
 * Class 109: 树状数组求逆序对数 (Inversion Count) 画布渲染适配器
 * 负责离散化 Rank 倒序扫描轴与逆序对累计状态看板渲染
 */

import { FenwickInversionStep } from './fenwick-inversion-step-compiler';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderFenwickInversionCanvas(container: HTMLElement, step: FenwickInversionStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <div style="margin-bottom: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px;">
          倒序扫描序列 (当前指针: ${step.curIdx >= 0 ? `下标 ${step.curIdx}` : '无'})
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto;">
          ${step.nums.map((val, idx) => {
            const isCur = idx === step.curIdx;
            const isProcessed = step.curIdx >= 0 && idx > step.curIdx;
            return `
              <div style="display: flex; flex-direction: column; align-items: center; min-width: 42px;">
                <span style="font-size: 10px; color: #94a3b8;">${idx}</span>
                <div style="width: 42px; height: 36px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${isCur ? '#e0e7ff' : isProcessed ? '#dcfce7' : '#ffffff'}; border: 2px solid ${isCur ? '#6366f1' : isProcessed ? '#22c55e' : '#cbd5e1'}; border-radius: 6px; font-weight: 700; font-size: 13px; color: #1e293b;">
                  <span>${val}</span>
                  <span style="font-size: 9px; color: #64748b;">R:${step.ranks[idx]}</span>
                </div>
                ${isCur ? '<span style="font-size: 10px; color: #6366f1;">▲ 考察</span>' : '<div style="height: 14px;"></div>'}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      ${renderFormulaCard(
        '逆序对动态统计看板',
        `当前元素: ${step.curNum} (Rank=${step.curRank}) | 本步右侧较小元素: +${step.smallerCount} | 累计逆序对数: ${step.totalInversions}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
