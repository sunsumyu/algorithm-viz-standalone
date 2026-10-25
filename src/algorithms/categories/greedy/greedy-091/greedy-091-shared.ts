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
        <!-- 左侧决策 -->
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

        <!-- 右侧决策 -->
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
    const bg = inRange ? 'rgba(56, 189, 248, 0.15)' : '#1e293b';
    const border = inRange ? '#38bdf8' : '#334155';
    const text = inRange ? '#38bdf8' : '#f8fafc';
    const glow = inRange ? 'box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);' : '';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 44px;">
        <!-- 顶部指针标签 -->
        <div style="height: 20px; display: flex; align-items: center; justify-content: center; gap: 2px;">
          ${matchedPointers.map(p => `
            <span style="font-size: 10px; font-weight: 800; color: ${p.color}; background: ${p.color}25; padding: 1px 5px; border-radius: 3px; border: 1px solid ${p.color}; box-shadow: 0 0 6px ${p.color}40;">
              ${p.label}
            </span>
          `).join('')}
        </div>

        <!-- 元素方块 -->
        <div style="width: 100%; height: 38px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${border}; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 14px; color: ${text}; ${glow} transition: all 0.2s ease;">
          ${val}
        </div>

        <!-- 底部索引 -->
        <span style="font-size: 10px; color: #64748b; font-family: 'JetBrains Mono', monospace;">[${idx}]</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 12px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b; box-sizing: border-box; width: 100%;">
      ${itemsHtml}
    </div>
  `;
}
