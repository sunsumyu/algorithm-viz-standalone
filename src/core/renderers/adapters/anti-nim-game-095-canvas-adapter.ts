/**
 * 反尼姆博弈 (Anti-Nim Game) Canvas Adapter
 */

import { AntiNimStep } from './anti-nim-game-095-step-compiler';
import {
  renderBitwiseXorBoard,
  renderPlayerBanner,
  renderStonePiles,
} from '../../../algorithms/categories/game/game-095/game-095-shared';

export class AntiNimGame095CanvasAdapter {
  render(stageContainer: HTMLElement, step: AntiNimStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部胜负 Banner
    const statusText = step.isFirstWin === undefined
      ? `正在扫描第 ${step.curPileIdx + 1} 堆...`
      : step.isFirstWin
      ? 'SJ 定理判定 ➔ 先手必胜'
      : 'SJ 定理判定 ➔ 先手必败';
    const formulaText = step.isAllOneOrZero
      ? `纯孤立堆: 堆数=${step.piles.length} (偶数胜/奇数败)`
      : `充裕堆模式: XOR=${step.xorSum}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 石子物理堆叠图
    renderStonePiles(root, step.piles, step.curPileIdx);

    // 3. 二进制异或展开面板 (当存在 > 1 堆时显示)
    if (!step.isAllOneOrZero) {
      renderBitwiseXorBoard(root, step.piles, step.xorSum);
    }

    // 4. SJ 定理逻辑图解卡片
    const theoryCard = document.createElement('div');
    theoryCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';
    theoryCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        📜 贾志鹏 SJ 定理 (Anti-Nim 黄金准则):
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
        <div style="padding: 8px 10px; border-radius: 6px; background: ${step.isAllOneOrZero ? '#eff6ff' : '#f8fafc'}; border: 1.5px solid ${step.isAllOneOrZero ? '#3b82f6' : '#e2e8f0'};">
          <div style="font-weight: 700; color: #1e40af;">情形一：所有堆石子数 <= 1</div>
          <div style="font-size: 11px; color: #64748b;">先手必胜 ⟺ 堆数为偶数 (k % 2 == 0)</div>
        </div>
        <div style="padding: 8px 10px; border-radius: 6px; background: ${!step.isAllOneOrZero ? '#eff6ff' : '#f8fafc'}; border: 1.5px solid ${!step.isAllOneOrZero ? '#3b82f6' : '#e2e8f0'};">
          <div style="font-weight: 700; color: #1e40af;">情形二：至少一堆石子数 > 1</div>
          <div style="font-size: 11px; color: #64748b;">先手必胜 ⟺ 异或和 X != 0</div>
        </div>
      </div>
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(theoryCard);

    stageContainer.appendChild(root);
  }
}

export const antiNimGame095CanvasAdapter = new AntiNimGame095CanvasAdapter();
