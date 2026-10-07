/**
 * 三堆石子取斐波那契数 SG 博弈 (Three Stones Pick Fibonacci) Canvas Adapter
 */

import { ThreeStonesFibStep } from './three-stones-fibonacci-096-step-compiler';
import {
  renderPlayerBanner,
  renderSgTable,
} from '../../../algorithms/categories/game/game-096/game-096-shared';

export class ThreeStonesFibonacci096CanvasAdapter {
  render(stageContainer: HTMLElement, step: ThreeStonesFibStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负判定 Banner
    const statusText = step.isFirstWin === undefined
      ? '推演计算中...'
      : step.isFirstWin
      ? `总异或和 X=${step.xorSum} != 0 ➔ 先手必胜`
      : '总异或和 X=0 ➔ 先手必败';
    const formulaText = `SG = ${step.sg1} ^ ${step.sg2} ^ ${step.sg3} = ${step.xorSum}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 单堆 SG 表展示
    renderSgTable(root, step.sgTable || [], undefined, '单堆斐波那契 SG 递推函数表');

    // 3. 三堆异或状态分解卡片
    const pilesCard = document.createElement('div');
    pilesCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';

    const piles = [
      { name: '第一堆', val: step.n1, sg: step.sg1 },
      { name: '第二堆', val: step.n2, sg: step.sg2 },
      { name: '第三堆', val: step.n3, sg: step.sg3 },
    ];

    const cardsHtml = piles.map(p => `
      <div style="flex: 1; padding: 10px; border-radius: 6px; background: #f8fafc; border: 1.5px solid #cbd5e1; text-align: center;">
        <div style="font-size: 11px; color: #64748b; font-weight: 700;">${p.name}</div>
        <div style="font-size: 16px; font-weight: 800; color: #1e293b; font-family: monospace; margin: 4px 0;">${p.val} 颗</div>
        <div style="font-size: 12px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px; border: 1px solid #38bdf860;">
          SG(${p.val}) = ${p.sg}
        </div>
      </div>
    `).join('');

    pilesCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">
        📦 各堆 SG 状态与异或合成:
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 8px;">
        ${cardsHtml}
      </div>
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(pilesCard);

    stageContainer.appendChild(root);
  }
}

export const threeStonesFibonacci096CanvasAdapter = new ThreeStonesFibonacci096CanvasAdapter();
