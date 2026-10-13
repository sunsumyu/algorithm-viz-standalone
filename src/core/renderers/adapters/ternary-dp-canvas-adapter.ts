/**
 * 三进制状压 DP (Ternary DP) Canvas 适配器
 */

import { TernaryDpStep } from './ternary-dp-step-compiler';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderTernaryDpCanvas(container: HTMLElement, step: TernaryDpStep): void {
  const mainBoard = `
    <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">
        🔺 三进制状态活跃样本池 (0:自由, 1:受覆, 2:已放)
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${step.topStates.map(item => `
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 11px;">
            <span style="font-weight: 700; color: #6366f1;">#${item.state} (${item.ternaryStr}_3)</span>: 
            <span style="color: #059669; font-weight: 700;">+${item.val} 装置</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  composeUnifiedCanvas(container, {
    mainBoardHtml: mainBoard,
    metrics: [
      {
        label: '当前推进到行',
        value: `第 ${step.curRow} 行`,
        color: '#4338ca',
      },
      {
        label: '有效合法状态总数',
        value: `${step.validStateCount} / ${step.totalStates}`,
        color: '#059669',
      },
      {
        label: '当前最大放置装置数',
        value: step.bestAns,
        color: '#d97706',
      },
    ],
    formula: {
      title: '三进制状态转移',
      equation: `当前最优解: ${step.bestAns} | 状态衰减法则: digit = max(0, digit - 1)`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
