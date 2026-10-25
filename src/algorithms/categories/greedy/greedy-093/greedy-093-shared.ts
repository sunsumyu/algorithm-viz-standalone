/**
 * 第 93 课：左神贪心算法专题 5 - 共享类型与可视化辅助组件
 */

import { StepBase } from '../../../../core/step-visualizer';
import type { StepVar } from '../../../../core/interfaces';

export interface Greedy093Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string | number>;
  vars?: StepVar[];
  [key: string]: any;
}

export interface BalanceComparisonDef {
  leftTitle: string;
  leftVal: string | number;
  rightTitle: string;
  rightVal: string | number;
  winner: 'left' | 'right' | 'equal';
  reason: string;
}

export function renderDecisionBalance(
  container: HTMLElement,
  balance: BalanceComparisonDef
): void {
  const isLeftWinner = balance.winner === 'left';
  const isRightWinner = balance.winner === 'right';

  const leftBorder = isLeftWinner ? '#10b981' : '#334155';
  const leftBg = isLeftWinner ? 'rgba(16, 185, 129, 0.15)' : '#1e293b';
  const leftText = isLeftWinner ? '#34d399' : '#94a3b8';
  const leftGlow = isLeftWinner ? 'box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);' : '';

  const rightBorder = isRightWinner ? '#10b981' : '#334155';
  const rightBg = isRightWinner ? 'rgba(16, 185, 129, 0.15)' : '#1e293b';
  const rightText = isRightWinner ? '#34d399' : '#94a3b8';
  const rightGlow = isRightWinner ? 'box-shadow: 0 0 12px rgba(16, 185, 129, 0.25);' : '';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b; padding: 12px;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
        <span style="font-weight: 700; font-size: 12px; color: #f8fafc;">⚖️ 贪心决策天平 (Decision Balance)</span>
        <span style="font-size: 11px; color: #38bdf8; font-weight: 700; background: rgba(56,189,248,0.15); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">判定: ${balance.reason}</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 10px; align-items: center; padding: 6px 0;">
        <div style="background: ${leftBg}; border: 1.5px solid ${leftBorder}; border-radius: 6px; padding: 8px 12px; display: flex; flex-direction: column; gap: 4px; ${leftGlow} transition: all 0.2s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">${balance.leftTitle}</span>
            ${isLeftWinner ? '<span style="font-size: 10px; background: rgba(16,185,129,0.2); color: #34d399; padding: 1px 6px; border-radius: 4px; font-weight: 800; border: 1px solid #10b981;">最优选择 ✓</span>' : ''}
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 800; color: ${leftText};">
            ${balance.leftVal}
          </div>
        </div>

        <div style="font-weight: 900; color: #64748b; font-size: 14px; font-family: 'JetBrains Mono', monospace;">VS</div>

        <div style="background: ${rightBg}; border: 1.5px solid ${rightBorder}; border-radius: 6px; padding: 8px 12px; display: flex; flex-direction: column; gap: 4px; ${rightGlow} transition: all 0.2s ease;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">${balance.rightTitle}</span>
            ${isRightWinner ? '<span style="font-size: 10px; background: rgba(16,185,129,0.2); color: #34d399; padding: 1px 6px; border-radius: 4px; font-weight: 800; border: 1px solid #10b981;">最优选择 ✓</span>' : ''}
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 800; color: ${rightText};">
            ${balance.rightVal}
          </div>
        </div>
      </div>
    </div>
  `;
}
