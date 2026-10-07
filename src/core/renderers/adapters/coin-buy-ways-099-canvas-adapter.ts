/**
 * 硬币购物方案数 (Coin Buy Ways) Canvas Adapter
 */

import { CoinBuyStep } from './coin-buy-ways-099-step-compiler';
import { renderIeFlow } from '../../../algorithms/categories/math/math-099/math-099-shared';

export class CoinBuyWays099CanvasAdapter {
  render(stageContainer: HTMLElement, step: CoinBuyStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 容斥原理子集交集流水线
    if (step.ieSubsets) {
      renderIeFlow(root, step.ieSubsets, step.finalValue ?? 0);
    }

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const coinBuyWays099CanvasAdapter = new CoinBuyWays099CanvasAdapter();
