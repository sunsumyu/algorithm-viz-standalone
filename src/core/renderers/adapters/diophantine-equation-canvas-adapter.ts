/**
 * 二元一次不定方程 (Diophantine Equation) 领域视觉适配器
 * 核心：不定方程解析式、解的存在性指示、最小正整数解与通解周期
 */

import { DiophantineStep } from './diophantine-equation-step-compiler';
import { composeUnifiedCanvas } from './unified-canvas-composer';

export function renderDiophantineEquationCanvas(container: HTMLElement, step: DiophantineStep): void {
  const mainBoard = `
    <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">
        📐 不定方程解析式: ${step.a}x + ${step.b}y = ${step.c}
      </div>
      <div style="font-size: 12px; color: #64748b;">
        ${step.gcd ? `最大公约数: gcd(${step.a}, ${step.b}) = ${step.gcd} | 整除判定: ${step.c} % ${step.gcd} = ${step.c % step.gcd}` : '待计算'}
      </div>
    </div>
  `;

  composeUnifiedCanvas(container, {
    mainBoardHtml: mainBoard,
    metrics: [
      {
        label: '解的存在性',
        value: step.hasSolution ? '必定有解' : '无整数解 (-1)',
        color: step.hasSolution ? '#059669' : '#dc2626',
      },
      {
        label: '最小正整数 x',
        value: step.minPositiveX !== undefined ? step.minPositiveX : '-',
        color: '#4338ca',
      },
      {
        label: '通解周期 dx',
        value: step.dx !== undefined ? step.dx : '-',
        color: '#d97706',
      },
    ],
    formula: {
      title: '二元一次不定方程状态',
      equation: `方程: ${step.a}x + ${step.b}y = ${step.c} ${step.minPositiveX !== undefined ? `| 最小正整数解: x=${step.minPositiveX}, y=${step.correspondingY}` : ''}`,
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
