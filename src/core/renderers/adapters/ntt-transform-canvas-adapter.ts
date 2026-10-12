/**
 * Class 161: 快速数论变换 (NTT / Number Theoretic Transform) 领域视觉适配器
 * 核心：模 998244353 多项式系数沙盘、当前算法阶段卡、模域特性卡与原根蝶形引擎卡
 */

import { NTTStep } from './ntt-transform-step-compiler';
import { renderNTTBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderNTTTransformCanvas(container: HTMLElement, step: NTTStep): void {
  let limit = 1;
  while (limit < step.polyA.length + step.polyB.length - 1) limit <<= 1;

  composeUnifiedCanvas(container, {
    mainBoardHtml: renderNTTBoard(step.polyA, step.polyB, step.convResult, step.stage, limit),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#4338ca',
      },
      {
        label: '模域特性',
        value: '100% 整数无精度截断',
        color: '#059669',
      },
    ],
    formula: {
      title: 'NTT 原根同构蝶形引擎',
      equation: '单位根替换: \u03C9_n \u2261 g^{(P-1)/n} (mod P) | 模数 P = 998244353, g = 3 | 蝶形递推: A(x) = A_even(x^2) + x \u00B7 A_odd(x^2)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
