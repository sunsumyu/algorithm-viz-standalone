/**
 * Class 082: 斜率优化 DP 与单调队列凸包 (Slope Optimization DP) CanvasAdapter
 * 职责：纯粹的几何凸包切线沙盘与决策点渲染
 */

import { renderSlopeOptBoard } from '../../../algorithms/categories/dynamic-programming/dp-079-083/dp-079-083-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { SlopeOpt082Step } from './slope-optimization-dp-082-step-compiler';

export function renderSlopeOptCanvas(container: HTMLElement, step: SlopeOpt082Step): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderSlopeOptBoard(step.points, step.hullIndices, step.curSlope, step.bestJ, step.curDp),
    formula: {
      title: '斜率优化 DP 核心几何定理',
      equation: '\\text{dp}[i] = \\min_{j < i} \\{ \\text{dp}[j] - (\\text{sumT}[i] + S) \\cdot \\text{sumF}[j] \\} + \\text{sumT}[i] \\cdot \\text{sumF}[i] + S \\cdot \\text{sumF}[n]',
      explanation: '移项改写为点斜式 $Y = K \\cdot X + B$：$Y_j = \\text{dp}[j]$，$X_j = \\text{sumF}[j]$，斜率 $K = \\text{sumT}[i] + S$。最小化截距 $B$ 等价于以斜率 $K$ 的切线寻找下凸壳的切点。',
    },
  });
}
