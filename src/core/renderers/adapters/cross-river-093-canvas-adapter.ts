/**
 * 经典过河问题 (Cross River) Canvas Adapter
 */

import { CrossRiverStep } from './cross-river-093-step-compiler';
import { renderDecisionBalance } from '../../../algorithms/categories/greedy/greedy-093/greedy-093-shared';

export class CrossRiver093CanvasAdapter {
  render(stageContainer: HTMLElement, step: CrossRiverStep): void {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态指标
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">总人数: <b>${step.times.length}</b> 人</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">左岸: ${step.leftBank.length}人 | 右岸: ${step.rightBank.length}人</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">累计最短总耗时:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.totalTime} 分钟</span>
        </div>
      </div>
    `;

    // 中部两岸人员分布沙盘
    const riverBox = document.createElement('div');
    riverBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 12px;';

    // 左岸
    const leftCard = document.createElement('div');
    leftCard.style.cssText = 'display: flex; flex-direction: column; gap: 6px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px; height: 100%; box-sizing: border-box;';
    leftCard.innerHTML = `
      <span style="font-size: 12px; font-weight: 700; color: #1e293b; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">🏞️ 左岸 (起点)</span>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
        ${step.leftBank.length === 0 ? '<span style="color: #94a3b8; font-size: 11px;">已全部渡河</span>' : step.leftBank.map(t => `
          <div style="padding: 4px 8px; border-radius: 6px; background: #eff6ff; border: 1px solid #bfdbfe; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #1d4ed8;">
            ⏱️ ${t}m
          </div>
        `).join('')}
      </div>
    `;
    riverBox.appendChild(leftCard);

    // 河流与小船
    const streamCard = document.createElement('div');
    streamCard.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 0 10px;';
    streamCard.innerHTML = `
      <span style="font-size: 24px;">🛶</span>
      <span style="font-size: 10px; font-weight: 600; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">限载2人·手电筒</span>
    `;
    riverBox.appendChild(streamCard);

    // 右岸
    const rightCard = document.createElement('div');
    rightCard.style.cssText = 'display: flex; flex-direction: column; gap: 6px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 10px; height: 100%; box-sizing: border-box;';
    rightCard.innerHTML = `
      <span style="font-size: 12px; font-weight: 700; color: #065f46; border-bottom: 1px dashed #86efac; padding-bottom: 4px;">🏝️ 右岸 (对岸)</span>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
        ${step.rightBank.length === 0 ? '<span style="color: #94a3b8; font-size: 11px;">尚无人抵达</span>' : step.rightBank.map(t => `
          <div style="padding: 4px 8px; border-radius: 6px; background: #ffffff; border: 1px solid #86efac; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #047857;">
            ✓ ${t}m
          </div>
        `).join('')}
      </div>
    `;
    riverBox.appendChild(rightCard);

    mainCard.appendChild(riverBox);

    // 底部当前轮次双策略天平卡片
    if (step.curRound) {
      const balanceBox = document.createElement('div');
      renderDecisionBalance(balanceBox, {
        leftTitle: `策略 1 (最快者当船夫)`,
        leftVal: `${step.curRound.cost1} 分钟`,
        rightTitle: `策略 2 (双快护航，慢者同行)`,
        rightVal: `${step.curRound.cost2} 分钟`,
        winner: step.curRound.winner === 'strategy1' ? 'left' : 'right',
        reason: step.curRound.winner === 'strategy1' ? `策略1更优 (${step.curRound.cost1} < ${step.curRound.cost2})` : `策略2更优 (${step.curRound.cost2} <= ${step.curRound.cost1})`,
      });
      mainCard.appendChild(balanceBox);
    }

    stageContainer.appendChild(mainCard);
  }
}

export const crossRiver093CanvasAdapter = new CrossRiver093CanvasAdapter();
