/**
 * 位图结构设计与实现 (Bitset Array) - 视觉适配器
 */

import { BitsetArrayStep } from './bitset-array-step-compiler';
import { renderBitsetGrid } from './bit-shared';

export function renderBitsetArrayCanvas(stageContainer: HTMLElement, step: BitsetArrayStep): void {
  stageContainer.innerHTML = '';

  const root = document.createElement('div');
  root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 1. 位图桶阵列可视化
  if (step.bitsetView) {
    renderBitsetGrid(root, step.bitsetView.bits, step.bitsetView.activeBucket, step.bitsetView.activeBit);
  }

  // 2. 决策信息
  const info = document.createElement('div');
  info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
  info.textContent = step.decision;
  root.appendChild(info);

  stageContainer.appendChild(root);
}
