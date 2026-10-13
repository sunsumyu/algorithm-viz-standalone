/**
 * 轮廓线 DP (Profile DP) Canvas 适配器
 */

import { ProfileDpStep } from './profile-dp-step-compiler';
import { renderProfileGrid } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderProfileDpCanvas(container: HTMLElement, step: ProfileDpStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderProfileGrid(
      step.n,
      step.m,
      step.curR,
      step.curC,
      step.activeMask,
      step.finalAns !== undefined ? step.finalAns : step.validStatesCount
    ),
    metrics: [
      {
        label: '当前单元格坐标',
        value: `(${step.curR}, ${step.curC})`,
        color: '#4338ca',
      },
      {
        label: '当前有效轮廓数',
        value: step.validStatesCount,
        color: '#059669',
      },
      {
        label: '最终铺满方案数',
        value: step.finalAns !== undefined ? step.finalAns : '计算中',
        color: '#d97706',
      },
    ],
    formula: {
      title: '轮廓线 DP 转移引擎',
      equation: `当前状态掩码: ${step.activeMask.toString(2).padStart(step.m, '0')} ${step.finalAns !== undefined ? `| 最终铺满总方案 = ${step.finalAns}` : ''}`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
