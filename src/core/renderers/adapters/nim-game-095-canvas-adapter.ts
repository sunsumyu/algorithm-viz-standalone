/**
 * 经典尼姆博弈 (Nim Game) Canvas Adapter
 */

import { NimGameStep } from './nim-game-095-step-compiler';
import {
  renderBitwiseXorBoard,
  renderPlayerBanner,
  renderStonePiles,
} from '../../../algorithms/categories/game/game-095/game-095-shared';

export class NimGame095CanvasAdapter {
  render(stageContainer: HTMLElement, step: NimGameStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负 Banner
    const statusText = step.isFirstWin === undefined
      ? `正在扫描第 ${step.curPileIdx + 1} 堆...`
      : step.isFirstWin
      ? `异或和 X=${step.xorSum} != 0 ➔ 先手必胜`
      : '异或和 X=0 ➔ 局势平衡 (先手必败)';
    const formulaText = `X = ${step.piles.join(' ^ ')} = ${step.xorSum}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 石子物理堆叠图
    renderStonePiles(root, step.piles, step.curPileIdx);

    // 3. 二进制异或展开面板
    renderBitwiseXorBoard(root, step.piles, step.xorSum);

    // 4. 必胜决策建议卡片
    if (step.bestMove) {
      const moveCard = document.createElement('div');
      moveCard.style.cssText = 'padding: 10px 16px; background: #ecfdf5; border-radius: 8px; border: 1.5px solid #10b981; color: #065f46; font-size: 13px; line-height: 1.5;';
      moveCard.innerHTML = `
        <div style="font-weight: 800; display: flex; align-items: center; gap: 6px;">
          <span>🎯 先手最优操作提示:</span>
        </div>
        <div style="margin-top: 4px;">
          在<strong>第 ${step.bestMove.pileIdx + 1} 堆</strong>中拿走 <strong>${step.bestMove.takeCount}</strong> 颗石子（原 ${step.bestMove.before} 颗 ➔ 变为 ${step.bestMove.after} 颗）。
          操作完成后全局异或和降为 <strong>0</strong>，对手面对必败态！
        </div>
      `;
      root.appendChild(moveCard);
    }

    stageContainer.appendChild(root);
  }
}

export const nimGame095CanvasAdapter = new NimGame095CanvasAdapter();
