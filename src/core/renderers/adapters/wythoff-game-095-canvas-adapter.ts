/**
 * 威佐夫博弈 (Wythoff Game) CanvasAdapter
 * 职责：挂载与更新胜负判定 Banner、石子物理堆叠图与黄金分割奇异局势序列看板
 */

import { WythoffStep } from './wythoff-game-095-step-compiler';
import { renderPlayerBanner, renderStonePiles } from '../../../algorithms/categories/game/game-095/game-095-shared';

export class WythoffGame095CanvasAdapter {
  render(stageContainer: HTMLElement, step: WythoffStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负 Banner
    const statusText = step.isFirstWin === undefined
      ? `差值 k=${step.k}, 正在对比奇异局势...`
      : step.isFirstWin
      ? `(${step.a}, ${step.b}) 非奇异局势 ➔ 先手必胜`
      : `(${step.a}, ${step.b}) 为第 ${step.k} 奇异局势 ➔ 先手必败`;
    const formulaText = `ak = floor(${step.k} × 1.618) = ${step.ak} ${step.a === step.ak ? '==' : '!='} a=${step.a}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 石子物理堆叠图
    renderStonePiles(root, step.piles || [step.a, step.b], step.a === step.ak ? undefined : 0);

    // 3. 黄金分割奇异局势表看板
    const coldCard = document.createElement('div');
    coldCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';

    // 预计算前 7 个奇异局势
    const phi = (Math.sqrt(5) + 1) / 2;
    const sampleCold = [0, 1, 2, 3, 4, 5, 6].map(idx => {
      const calcA = Math.floor(idx * phi);
      const calcB = calcA + idx;
      const isMatch = step.a === calcA && step.b === calcB;
      return `
        <span style="padding: 3px 8px; border-radius: 6px; background: ${isMatch ? '#fee2e2' : '#f8fafc'}; border: 1.5px solid ${isMatch ? '#ef4444' : '#e2e8f0'}; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: ${isMatch ? '#b91c1c' : '#475569'};">
          k=${idx}: (${calcA}, ${calcB})
        </span>
      `;
    }).join('');

    coldCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
        <span>✨ 威佐夫奇异局势序列 (Cold Positions):</span>
        <span style="font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace;">φ ≈ 1.6180339887...</span>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0;">
        ${sampleCold}
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(coldCard);

    stageContainer.appendChild(root);
  }
}

export const wythoffGame095CanvasAdapter = new WythoffGame095CanvasAdapter();
