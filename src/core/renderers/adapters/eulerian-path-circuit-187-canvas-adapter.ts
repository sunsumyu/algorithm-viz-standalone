/**
 * Class 187: 欧拉路径与欧拉回路 (Hierholzer Algorithm) 领域视觉适配器
 * 核心：度数统计与路径栈沙盘、当前算法阶段指示卡、当前弧优化卡与欧拉图充要条件卡
 */

import { renderEulerianPathBoard } from '../../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import { EulerianStep } from './eulerian-path-circuit-187-step-compiler';

export function renderEulerianPathCanvas(container: HTMLElement, step: EulerianStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderEulerianPathBoard(
      step.nodes,
      step.edges,
      step.inDeg,
      step.outDeg,
      step.pathStack,
      step.stage
    ),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#047857',
      },
      {
        label: '当前弧优化',
        value: '边使用即删，杜绝 O(E^2) 死循环',
        color: '#059669',
      },
    ],
    formula: {
      title: '有向图欧拉路径充要判定定理',
      equation: '恰有一个点 out = in + 1 (起点), 恰有一个点 in = out + 1 (终点), 其余点 in == out',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
