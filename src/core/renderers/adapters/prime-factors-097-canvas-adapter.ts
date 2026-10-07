/**
 * 质因子分解 (Prime Factorization) Canvas Adapter
 */

import { PrimeFactorsStep } from './prime-factors-097-step-compiler';
import { renderFactorEquation } from '../../../algorithms/categories/math/math-097/math-097-shared';

export class PrimeFactors097CanvasAdapter {
  render(stageContainer: HTMLElement, step: PrimeFactorsStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 算术基本定理表达式看板
    renderFactorEquation(root, step.originalN, step.factors || [], step.currentRemainder);

    // 2. 质因子卡片瀑布流
    if (step.factors && step.factors.length > 0) {
      const cardsBox = document.createElement('div');
      cardsBox.style.cssText = 'display: flex; gap: 10px; flex-wrap: wrap; padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

      step.factors.forEach(f => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 8px 14px; border-radius: 6px; background: #eff6ff; border: 1.5px solid #3b82f6; display: flex; flex-direction: column; align-items: center;';
        item.innerHTML = `
          <span style="font-size: 11px; color: #64748b; font-weight: 700;">质因数</span>
          <span style="font-size: 18px; font-weight: 800; color: #1d4ed8; font-family: monospace;">${f.prime}</span>
          <span style="font-size: 11px; color: #0284c7; font-weight: 700; margin-top: 2px;">出现 ${f.power} 次</span>
        `;
        cardsBox.appendChild(item);
      });
      root.appendChild(cardsBox);
    }

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const primeFactors097CanvasAdapter = new PrimeFactors097CanvasAdapter();
