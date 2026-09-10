/**
 * 第 91 课：左神贪心算法专题 3 - 共享类型与可视化辅助组件
 * 提供多指针网格、滑动窗口与天平比对卡片、堆队列渲染等
 */

import { StepBase } from '../../../../core/step-visualizer';
import type { StepVar } from '../../../../core/interfaces';

export interface Greedy091Step extends StepBase {
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

/**
 * 渲染贪心决策天平比对卡片
 */
export function renderDecisionBalance(
  container: HTMLElement,
  balance: BalanceComparisonDef
): void {
  const isLeftWinner = balance.winner === 'left';
  const isRightWinner = balance.winner === 'right';

  const leftBorder = isLeftWinner ? '#10b981' : '#e2e8f0';
  const leftBg = isLeftWinner ? '#ecfdf5' : '#ffffff';
  const leftText = isLeftWinner ? '#047857' : '#475569';

  const rightBorder = isRightWinner ? '#10b981' : '#e2e8f0';
  const rightBg = isRightWinner ? '#ecfdf5' : '#ffffff';
  const rightText = isRightWinner ? '#047857' : '#475569';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px;">
        <span style="font-weight: 700; font-size: 12px; color: #1e293b;">⚖️ 贪心决策天平 (Decision Balance)</span>
        <span style="font-size: 11px; color: #64748b; font-weight: 600;">判定: <b style="color: #059669;">${balance.reason}</b></span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: center;">
        <!-- 左侧决策 -->
        <div style="background: ${leftBg}; border: 1.5px solid ${leftBorder}; border-radius: 6px; padding: 6px 10px; display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #64748b; font-weight: 600;">${balance.leftTitle}</span>
            ${isLeftWinner ? '<span style="font-size: 10px; background: #10b981; color: #fff; padding: 1px 4px; border-radius: 4px; font-weight: 700;">最优选择 ✓</span>' : ''}
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: ${leftText};">
            ${balance.leftVal}
          </div>
        </div>

        <div style="font-weight: 700; color: #94a3b8; font-size: 12px;">VS</div>

        <!-- 右侧决策 -->
        <div style="background: ${rightBg}; border: 1.5px solid ${rightBorder}; border-radius: 6px; padding: 6px 10px; display: flex; flex-direction: column; gap: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #64748b; font-weight: 600;">${balance.rightTitle}</span>
            ${isRightWinner ? '<span style="font-size: 10px; background: #10b981; color: #fff; padding: 1px 4px; border-radius: 4px; font-weight: 700;">最优选择 ✓</span>' : ''}
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: ${rightText};">
            ${balance.rightVal}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染数组序列与多指针追踪
 */
export function renderArrayPointers(
  container: HTMLElement,
  arr: number[],
  pointers: { index: number; label: string; color: string }[],
  highlightRange?: [number, number]
): void {
  const itemsHtml = arr.map((val, idx) => {
    let inRange = false;
    if (highlightRange && idx >= highlightRange[0] && idx <= highlightRange[1]) {
      inRange = true;
    }

    const matchedPointers = pointers.filter(p => p.index === idx);
    const bg = inRange ? '#eff6ff' : '#ffffff';
    const border = inRange ? '#3b82f6' : '#e2e8f0';
    const text = inRange ? '#1d4ed8' : '#334155';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 42px;">
        <!-- 顶部指针标签 -->
        <div style="height: 18px; display: flex; align-items: center; justify-content: center; gap: 2px;">
          ${matchedPointers.map(p => `
            <span style="font-size: 10px; font-weight: 700; color: ${p.color}; background: ${p.color}15; padding: 1px 4px; border-radius: 3px; border: 1px solid ${p.color}40;">
              ${p.label}
            </span>
          `).join('')}
        </div>

        <!-- 元素方块 -->
        <div style="width: 100%; height: 36px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${border}; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 13px; color: ${text}; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
          ${val}
        </div>

        <!-- 底部索引 -->
        <span style="font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">[${idx}]</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; box-sizing: border-box; width: 100%;">
      ${itemsHtml}
    </div>
  `;
}
