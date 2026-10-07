/**
 * 矩阵快速幂 (Matrix Exponentiation) 通用 Canvas Adapter
 * 统一渲染状态转移基底矩阵、幂次结果矩阵与推演决策卡片
 */

import { Math098Step, renderMatrix } from '../../../algorithms/categories/math/math-098/math-098-shared';

export class MatrixPower098CanvasAdapter {
  render(
    stageContainer: HTMLElement,
    step: Math098Step & { n?: number },
    baseTitle: string = '状态转移基底矩阵 base',
    ansTitle?: string
  ): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 矩阵展示区
    const matricesRow = document.createElement('div');
    matricesRow.style.cssText = 'display: flex; gap: 12px; flex-wrap: wrap;';
    if (step.curPowerMatrix) renderMatrix(matricesRow, step.curPowerMatrix, baseTitle);
    if (step.curAnsMatrix) {
      const title = ansTitle || `幂次结果矩阵 (base^${Math.max(0, (step.n ?? 2) - 2)})`;
      renderMatrix(matricesRow, step.curAnsMatrix, title);
    }
    root.appendChild(matricesRow);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const matrixPower098CanvasAdapter = new MatrixPower098CanvasAdapter();
