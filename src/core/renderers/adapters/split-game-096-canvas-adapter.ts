/**
 * 分裂石子游戏 SG 函数复合 (Split Game SG) Canvas Adapter
 */

import { SplitGameStep } from './split-game-096-step-compiler';
import {
  renderSgTable,
  renderPlayerBanner,
} from '../../../algorithms/categories/game/game-096/game-096-shared';

export class SplitGame096CanvasAdapter {
  render(stageContainer: HTMLElement, step: SplitGameStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部状态
    const statusText = step.isFirstWin === undefined
      ? `推导状态 x=${step.curIdx}...`
      : step.isFirstWin
      ? `SG(${step.n}) = ${step.sgTable?.[step.n]} > 0 ➔ 先手必胜`
      : `SG(${step.n}) = 0 ➔ 先手必败`;
    const formulaText = `SG(${step.curIdx}) = mex({${(step.appearSet || []).join(', ')}}) = ${step.computedMex ?? step.sgTable?.[step.curIdx ?? 0] ?? 0}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. SG 函数表
    renderSgTable(root, step.sgTable || [], step.curIdx, '分裂博弈 SG 函数打表');

    // 3. 当前步分裂方案卡片
    if (step.splitDetails && step.splitDetails.length > 0) {
      const splitCard = document.createElement('div');
      splitCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';

      const detailsHtml = step.splitDetails.map(d => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 4px; background: #f8fafc; border: 1px solid #e2e8f0; font-family: monospace; font-size: 12px;">
          <span>${step.curIdx} ➔ 分裂为 (${d.y}, ${d.z})</span>
          <span style="color: #0284c7; font-weight: 700;">SG(${d.y}) ^ SG(${d.z}) = ${d.xor}</span>
        </div>
      `).join('');

      splitCard.innerHTML = `
        <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
          🌿 状态 x=${step.curIdx} 的所有二分裂分支:
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;">
          ${detailsHtml}
        </div>
        <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #1e40af;">
          ${step.decision}
        </div>
      `;
      root.appendChild(splitCard);
    }

    stageContainer.appendChild(root);
  }
}

export const splitGame096CanvasAdapter = new SplitGame096CanvasAdapter();
