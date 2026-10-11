/**
 * 位运算核心神技 (Brian Kernighan & Bit Tricks) - 视觉适配器
 */

import { BitTricksStep } from './bit-tricks-step-compiler';
import { renderBitGrid, renderBitComparison } from './bit-shared';

export function renderBitTricksCanvas(stageContainer: HTMLElement, step: BitTricksStep): void {
  stageContainer.innerHTML = '';

  const root = document.createElement('div');
  root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

  // 1. 若有对齐对比视效
  if (step.comparisonView) {
    renderBitComparison(root, step.comparisonView);
  }

  // 2. 单个数值的二进制视效
  if (step.bitView) {
    renderBitGrid(
      root,
      step.bitView.title || '二进制位视效',
      step.bitView.num,
      step.bitView.bitsCount || 16,
      step.bitView.highlightMask || 0,
      step.bitView.secondaryMask || 0
    );
  }

  // 3. 决策信息
  const info = document.createElement('div');
  info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
  info.textContent = step.decision;
  root.appendChild(info);

  stageContainer.appendChild(root);
}
