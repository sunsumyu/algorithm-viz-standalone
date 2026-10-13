/**
 * 倍增优化 DP (Binary Lifting DP) Canvas 适配器
 */

import { BinaryLiftingDpStep } from './binary-lifting-dp-step-compiler';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderBinaryLiftingDpCanvas(container: HTMLElement, step: BinaryLiftingDpStep): void {
  const mainBoard = `
    <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px;">
        🌀 环形状态图转移拓扑 (0 ➔ 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 0)
      </div>
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
        ${Array.from({ length: 6 }).map((_, id) => {
          const isCur = id === step.cur;
          const isStart = id === step.start;
          return `
            <div style="width: 48px; height: 48px; border-radius: 50%; background: ${isCur ? '#6366f1' : isStart ? '#fef3c7' : '#ffffff'}; border: 2px solid ${isCur ? '#4338ca' : isStart ? '#f59e0b' : '#cbd5e1'}; color: ${isCur ? '#ffffff' : '#1e293b'}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
              <span>#${id}</span>
              ${isCur ? '<span style="font-size: 8px; color: #e0e7ff;">当前</span>' : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  composeUnifiedCanvas(container, {
    mainBoardHtml: mainBoard,
    metrics: [
      {
        label: '当前所处节点',
        value: `#${step.cur}`,
        color: '#4338ca',
      },
      {
        label: '剩余待跳步数',
        value: `${step.remainingSteps} / ${step.targetSteps}`,
        color: '#059669',
      },
      {
        label: '累计跳转轨迹',
        value: step.path.map(p => `#${p}`).join(' ➔ '),
        color: '#d97706',
      },
    ],
    formula: {
      title: '倍增优化 DP 执行状态',
      equation: `起点: #${step.start} | 目标步数: ${step.targetSteps} | 当前二进制位 k = ${step.k >= 0 ? step.k : '完毕'}`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
