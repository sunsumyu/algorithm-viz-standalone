/**
 * Class 165: 莫比乌斯反演 (Möbius Inversion) 领域视觉适配器
 * 核心：数论分块表格与互质统计展板、当前算法阶段卡、加速幅度卡与反演求和引擎卡
 */

import { MobiusStep } from './mobius-inversion-step-compiler';
import { renderMobiusBoard } from '../../../algorithms/categories/advanced-topics/advanced-161-166/advanced-161-166-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderMobiusInversionCanvas(container: HTMLElement, step: MobiusStep): void {
  composeUnifiedCanvas(container, {
    mainBoardHtml: renderMobiusBoard(step.n, step.m, step.blocks, step.currentSum, step.stage),
    metrics: [
      {
        label: '当前算法阶段',
        value: step.stage,
        color: '#0369a1',
      },
      {
        label: '算法加速幅度',
        value: 'O(N\u00B7M) -> O(\u221AN + \u221AM)',
        color: '#059669',
      },
    ],
    formula: {
      title: '莫比乌斯反演互质双曲求和引擎',
      equation: '核心性质: \u2211_{d|n} \u03BC(d) = [n=1] | 双元整除分块: r = min(\u230An/\u230An/l\u230B\u230B, \u230Am/\u230Am/l\u230B\u230B) | 单次询问复杂度: O(\u221AN + \u221AM)',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
