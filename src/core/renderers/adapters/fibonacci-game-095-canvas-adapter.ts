/**
 * 斐波那契博弈 (Fibonacci Game) CanvasAdapter
 * 职责：挂载与更新胜负判定 Banner、石子物理堆叠图与齐肯多夫分解看板
 */

import { FibonacciStep } from './fibonacci-game-095-step-compiler';
import { renderPlayerBanner, renderStonePiles } from '../../../algorithms/categories/game/game-095/game-095-shared';

export class FibonacciGame095CanvasAdapter {
  render(stageContainer: HTMLElement, step: FibonacciStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负 Banner
    const statusText = step.isFirstWin === undefined
      ? `递推对比中: 当前 b=${step.curB}...`
      : step.isFirstWin
      ? `n=${step.n} 非斐波那契数 ➔ 先手必胜`
      : `n=${step.n} 为斐波那契数 ➔ 先手必败`;
    const formulaText = `b=${step.curB} ${step.curB === step.n ? '==' : '!='} n=${step.n}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 石子物理堆叠图
    renderStonePiles(root, step.piles || [step.n], 0);

    // 3. 齐肯多夫分解与斐波那契序列看板
    const decompCard = document.createElement('div');
    decompCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';

    const decompHtml = step.zeckendorf.length > 0
      ? step.zeckendorf.map((val, idx) => `
          <span style="padding: 3px 10px; border-radius: 6px; background: ${idx === 0 ? '#ecfdf5' : '#eff6ff'}; border: 1.5px solid ${idx === 0 ? '#10b981' : '#3b82f6'}; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: ${idx === 0 ? '#047857' : '#1d4ed8'};">
            F=${val} ${idx === 0 ? '👈 首步必取' : ''}
          </span>
        `).join(' <span style="color: #94a3b8; font-weight: 700;">+</span> ')
      : '<span style="color: #94a3b8;">无分解</span>';

    decompCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
        <span>📜 齐肯多夫定理 (Zeckendorf Decomposition):</span>
        <span style="font-size: 11px; color: #64748b; font-weight: 600;">每个正整数唯一表示为不连续斐波那契数之和</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0; flex-wrap: wrap;">
        <span style="font-weight: 700; font-family: 'JetBrains Mono', monospace; color: #1e293b;">n = ${step.n} =</span>
        ${decompHtml}
      </div>
      <div style="margin-top: 8px; font-size: 12px; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(decompCard);

    stageContainer.appendChild(root);
  }
}

export const fibonacciGame095CanvasAdapter = new FibonacciGame095CanvasAdapter();
