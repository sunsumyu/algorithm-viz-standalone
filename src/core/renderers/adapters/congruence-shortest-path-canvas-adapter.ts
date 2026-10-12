/**
 * Class 146: 同余最短路 (Congruence Shortest Path) 领域视觉适配器
 * 核心：同余系图拓扑沙盘、基准模数指示卡、累计可达楼层卡与降维公式卡
 */

import { CongruenceStep } from './congruence-shortest-path-step-compiler';
import { renderCongruenceBoard } from '../../../algorithms/categories/advanced-topics/advanced-142-148/advanced-142-148-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderCongruenceShortestPathCanvas(container: HTMLElement, step: CongruenceStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderCongruenceBoard(
      step.x,
      step.y,
      step.z,
      step.h,
      step.dist,
      step.curU,
      step.ansSoFar
    ),
    metrics: [
      {
        label: '基准同余系模数 x',
        value: `mod ${step.x}`,
        color: '#4338ca',
      },
      {
        label: '当前累计可达楼层数',
        value: `${step.ansSoFar}`,
        color: '#059669',
      },
    ],
    formula: {
      title: '同余最短路降维引擎',
      equation: '各余数类独立累加: Count(r) = floor((H - dist[r]) / x) + 1 | 总楼层 = \u2211 Count(r)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
