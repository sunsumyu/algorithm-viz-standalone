/**
 * 素数幂石子博弈 (Prime Power Stones) CanvasAdapter
 * 职责：挂载与更新胜负判定 Banner、石子物理堆叠图与素数幂模 6 分布看板
 */

import { PrimePowerStep } from './prime-power-stones-095-step-compiler';
import { renderPlayerBanner, renderStonePiles } from '../../../algorithms/categories/game/game-095/game-095-shared';

export class PrimePowerStones095CanvasAdapter {
  render(stageContainer: HTMLElement, step: PrimePowerStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负判定 Banner
    const statusText = step.isFirstWin === undefined
      ? '推演中...'
      : step.isFirstWin
      ? `n % 6 = ${step.mod} != 0 ➔ 先手必胜`
      : `n % 6 = 0 ➔ 先手必败 (6的倍数)`;
    const formulaText = `n % 6 = ${step.n} % 6 = ${step.mod}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 石子物理堆叠视图
    renderStonePiles(root, step.piles || [step.n], step.activePileIdx);

    // 3. 素数幂与模 6 分布看板
    const powersCard = document.createElement('div');
    powersCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';

    const samplePowers = [1, 2, 3, 4, 5, 7, 8, 9, 11, 13, 16, 17, 19, 23, 25, 27, 29, 31];
    const chipsHtml = samplePowers.map(p => {
      const rem = p % 6;
      return `
        <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; background: #f1f5f9; border: 1px solid #cbd5e1; font-family: 'JetBrains Mono', monospace; font-size: 12px;">
          <strong>${p}</strong>
          <span style="color: #64748b; font-size: 10px;">(mod6=${rem})</span>
        </span>
      `;
    }).join('');

    powersCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        💡 为什么素数幂模 6 绝不可能是 0？
      </div>
      <div style="color: #475569; font-size: 12px; margin-bottom: 8px;">
        若 p^k 是 6 的倍数，则必须同时包含因子 2 和 3。但 p 是素数，其幂次 p^k 只有一个质因子，不可能同时被 2 和 3 整除！
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
        ${chipsHtml}
      </div>
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(powersCard);

    stageContainer.appendChild(root);
  }
}

export const primePowerStones095CanvasAdapter = new PrimePowerStones095CanvasAdapter();
