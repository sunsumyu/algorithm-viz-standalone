/**
 * 巴什博弈与 SG 函数打表 (Bash Game SG) Canvas Adapter
 */

import { BashSgStep } from './bash-game-sg-096-step-compiler';
import {
  renderMexCard,
  renderSgTable,
} from '../../../algorithms/categories/game/game-096/game-096-shared';

export class BashGameSg096CanvasAdapter {
  render(stageContainer: HTMLElement, step: BashSgStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. SG 函数表格看板
    renderSgTable(root, step.sgTable || [], step.curIdx, `巴什博弈 SG 函数打表 (m=${step.m})`);

    // 2. 当前步 mex 计算卡片
    if (step.appearSet) {
      renderMexCard(root, step.appearSet, step.computedMex ?? 0, `求解 SG(${step.curIdx}) 的 mex 算子`);
    }

    // 3. 周期规律验证卡片
    const infoCard = document.createElement('div');
    infoCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; line-height: 1.6; color: #334155;';
    infoCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
        💡 周期律归纳观察:
      </div>
      <div style="font-size: 12px; color: #475569; margin-bottom: 6px;">
        因为每次只能从前 <strong>m=${step.m}</strong> 项转移，因此后继集合的大小为 m，其 mex 必然落在 <code>0 ~ m</code> 之间，从而严格形成长度为 <strong>m+1=${step.m + 1}</strong> 的循环节！
      </div>
      <div style="padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(infoCard);

    stageContainer.appendChild(root);
  }
}

export const bashGameSg096CanvasAdapter = new BashGameSg096CanvasAdapter();
