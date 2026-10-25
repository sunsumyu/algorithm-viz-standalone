/**
 * 乘法逆元单点求法 (Modular Inverse Single) Canvas Adapter
 */

import { InverseSingleStep } from './inverse-single-099-step-compiler';
import { renderInverseCards } from '../../../algorithms/categories/math/math-099/math-099-shared';

export class InverseSingle099CanvasAdapter {
  render(stageContainer: HTMLElement, step: InverseSingleStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 逆元卡片展示
    if (step.inversesTable) {
      renderInverseCards(root, step.inversesTable, step.activeNum, step.p);
    }

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 10px 14px; background: #0f172a; border-radius: 6px; border: 1px solid #1e293b; border-left: 3px solid #38bdf8; font-size: 12px; color: #cbd5e1;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const inverseSingle099CanvasAdapter = new InverseSingle099CanvasAdapter();
