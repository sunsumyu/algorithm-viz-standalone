/**
 * 尼姆博弈 SG 函数证明 (Nim Game SG) Canvas Adapter
 */

import { NimSgStep } from './nim-game-sg-096-step-compiler';
import {
  renderMexCard,
  renderSgTable,
} from '../../../algorithms/categories/game/game-096/game-096-shared';

export class NimGameSg096CanvasAdapter {
  render(stageContainer: HTMLElement, step: NimSgStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. SG 表格展示
    renderSgTable(root, step.sgTable || [], step.curIdx, '尼姆单堆 SG 函数递推表 (SG(x) ≡ x)');

    // 2. mex 计算卡片
    if (step.appearSet) {
      renderMexCard(root, step.appearSet, step.computedMex ?? step.curIdx ?? 0, `状态 x=${step.curIdx} 的 mex 算子推导`);
    }

    // 3. 数学解说
    const mathCard = document.createElement('div');
    mathCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';
    mathCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        ✨ 为什么 Bouton 定理等于异或和？
      </div>
      <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
        根据 SG 定理，任意两个独立子游戏的复合游戏其 SG 值为各自 SG 值的异或：<code>SG(G1 + G2) = SG(G1) ^ SG(G2)</code>。
        既然每个单堆的 <code>SG(ai) = ai</code>，那么 <code>k</code> 堆尼姆博弈的总 SG 值必然精确等于 <code>a1 ^ a2 ^ ... ^ ak</code>！
      </div>
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(mathCard);

    stageContainer.appendChild(root);
  }
}

export const nimGameSg096CanvasAdapter = new NimGameSg096CanvasAdapter();
