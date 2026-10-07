/**
 * 巴什博弈 (Bash Game) CanvasAdapter
 * 职责：挂载与更新胜负判定 Banner、石子物理堆叠图与策略剖析卡
 */

import { BashGameStep } from './bash-game-095-step-compiler';
import { renderPlayerBanner, renderStonePiles } from '../../../algorithms/categories/game/game-095/game-095-shared';

export class BashGame095CanvasAdapter {
  render(stageContainer: HTMLElement, step: BashGameStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负判定 Banner
    const statusText = step.isFirstWin === undefined
      ? '推演计算中...'
      : step.isFirstWin
      ? `余数 r=${step.r} != 0 ➔ 先手必胜`
      : `余数 r=0 ➔ 先手必败 (后手必胜)`;
    const formulaText = `n % (m + 1) = ${step.n} % ${step.m + 1} = ${step.r}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 石子物理堆叠视图
    renderStonePiles(root, step.piles || [step.n], step.activePileIdx);

    // 3. 策略推导核心解说卡片
    const card = document.createElement('div');
    card.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';
    card.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
        <span>🎯 博弈对称性策略剖析:</span>
      </div>
      <div>
        石子总数 <strong>n = ${step.n}</strong>，每次取 <strong>1 ~ ${step.m}</strong> 颗，周期基底 <strong>m + 1 = ${step.m + 1}</strong>。
      </div>
      <div style="margin-top: 6px; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(card);

    stageContainer.appendChild(root);
  }
}

export const bashGame095CanvasAdapter = new BashGame095CanvasAdapter();
