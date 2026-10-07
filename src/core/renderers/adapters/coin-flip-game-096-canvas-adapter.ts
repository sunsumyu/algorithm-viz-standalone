/**
 * 欧几里得翻硬币博弈 (Coin Flip Game SG) Canvas Adapter
 */

import { CoinFlipStep } from './coin-flip-game-096-step-compiler';
import {
  renderBitwiseXorBoard,
  renderPlayerBanner,
} from '../../../algorithms/categories/game/game-096/game-096-shared';

export class CoinFlipGame096CanvasAdapter {
  render(stageContainer: HTMLElement, step: CoinFlipStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部 Banner
    const statusText = step.isFirstWin === undefined
      ? `扫描硬币 #${step.curIdx + 1}...`
      : step.isFirstWin
      ? `正面硬币异或和 X=${step.xorSum} != 0 ➔ 先手必胜`
      : '正面硬币异或和 X=0 ➔ 先手必败';
    const formulaText = `XOR(${step.faceUpSgs.join(' ^ ') || '0'}) = ${step.xorSum}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 硬币行展示
    const coinsBox = document.createElement('div');
    coinsBox.style.cssText = 'display: flex; gap: 10px; justify-content: center; align-items: center; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto;';

    step.coins.forEach((c, idx) => {
      const isCur = step.curIdx === idx;
      const isHead = c === 1;

      const col = document.createElement('div');
      col.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 4px;';

      const coinCircle = document.createElement('div');
      coinCircle.style.cssText = `
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: monospace;
        font-size: 16px;
        font-weight: 800;
        background: ${isHead ? '#fef08a' : '#e2e8f0'};
        border: 2px solid ${isCur ? '#3b82f6' : isHead ? '#ca8a04' : '#94a3b8'};
        color: ${isHead ? '#854d0e' : '#64748b'};
        box-shadow: ${isCur ? '0 0 0 3px rgba(59,130,246,0.3)' : '0 1px 3px rgba(0,0,0,0.1)'};
        transition: all 0.2s ease;
      `;
      coinCircle.textContent = isHead ? '正' : '反';
      col.appendChild(coinCircle);

      const label = document.createElement('div');
      label.style.cssText = 'font-size: 10px; font-weight: 700; color: #64748b; font-family: monospace;';
      label.textContent = `#${idx + 1}`;
      col.appendChild(label);

      const sgTag = document.createElement('div');
      sgTag.style.cssText = `font-size: 9px; font-family: monospace; font-weight: 700; color: ${isHead ? '#2563eb' : '#94a3b8'};`;
      sgTag.textContent = `SG=${idx + 1}`;
      col.appendChild(sgTag);

      coinsBox.appendChild(col);
    });
    root.appendChild(coinsBox);

    // 3. 正面硬币异或看板
    if (step.faceUpSgs.length > 0) {
      renderBitwiseXorBoard(root, step.faceUpSgs, step.xorSum ?? 0);
    }

    stageContainer.appendChild(root);
  }
}

export const coinFlipGame096CanvasAdapter = new CoinFlipGame096CanvasAdapter();
