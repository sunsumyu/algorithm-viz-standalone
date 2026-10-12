/**
 * Class 176: KM 算法与带权二分图最佳匹配 (KM Algorithm) 领域视觉适配器
 * 核心：顶标与权值矩阵沙盘、当前算法阶段指示卡、对偶定理卡与顶标调整公式卡
 */

import { renderKMBoard } from '../../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { KMStep } from './km-matching-176-step-compiler';

export function renderKMCanvas(container: HTMLElement, step: KMStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderKMBoard(step.n, step.w, step.lx, step.ly, step.matchRight, step.totalWeight, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#be185d',
      },
      {
        label: '线性规划对偶',
        value: '\u2211 W = \u2211 Lx + \u2211 Ly',
        color: '#059669',
      },
    ],
    formula: {
      title: 'KM 算法顶标理论与相等子图',
      equation: '可行顶标: Lx[i] + Ly[j] \u2265 W[i][j] | 相等边: Lx[i] + Ly[j] = W[i][j] | 松弛量调整: \u0394 = min(Lx + Ly - W), Lx -= \u0394, Ly += \u0394',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
