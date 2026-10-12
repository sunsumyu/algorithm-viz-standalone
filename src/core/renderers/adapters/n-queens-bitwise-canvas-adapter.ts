/**
 * N 皇后极速位运算解法 (LeetCode 51/52)
 * Canvas Adapter: 棋盘实时状态与三向位掩码控制台呈现
 */

import type { NQueensStep } from './n-queens-bitwise-step-compiler';

export function renderNQueensCanvas(container: HTMLElement, step: NQueensStep): void {
  const cellSize = 38;

  container.innerHTML = `
    <div style="display: flex; gap: 20px; width: 100%; height: 100%; padding: 4px; box-sizing: border-box; align-items: flex-start; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow: auto;">
      <!-- N×N 棋盘 -->
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 18px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
        <div style="font-size: 13px; font-weight: 600; color: var(--text-color, #cbd5e1); display: flex; justify-content: space-between; width: 100%;">
          <span>${step.n}×${step.n} 棋盘实时状态</span>
          <span style="font-size: 11px; color: #38bdf8;">${step.row >= step.n ? '放置完成' : `当前试探第 ${step.row} 行`}</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(${step.n}, ${cellSize}px); border: 2px solid #475569; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.25);">
          ${Array.from({ length: step.n * step.n }, (_, idx) => {
            const r = Math.floor(idx / step.n);
            const c = idx % step.n;
            const isDark = (r + c) % 2 === 1;
            const hasQueen = step.board[r] === c;
            const isCurrentRow = r === step.row;

            return `
              <div style="
                width: ${cellSize}px;
                height: ${cellSize}px;
                background: ${hasQueen ? 'rgba(16, 185, 129, 0.4)' : isCurrentRow ? 'rgba(56, 189, 248, 0.18)' : isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(51, 65, 85, 0.5)'};
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                border: ${hasQueen ? '2px solid #34d399' : '1px solid rgba(255,255,255,0.04)'};
                transition: background 0.15s ease;
              ">
                ${hasQueen ? '👑' : ''}
              </div>
            `;
          }).join('')}
        </div>
        <div style="display: flex; gap: 12px; font-size: 11px; color: #94a3b8;">
          <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: rgba(56, 189, 248, 0.4); border-radius: 2px;"></span> 当前行</span>
          <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 10px; height: 10px; background: rgba(16, 185, 129, 0.6); border-radius: 2px;"></span> 已放置皇后</span>
        </div>
      </div>

      <!-- 位运算掩码控制台 -->
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 18px; display: flex; flex-direction: column; gap: 12px; flex: 1; max-width: 440px;">
        <div style="font-size: 13px; font-weight: 600; color: var(--text-color, #cbd5e1);">三向位掩码状态 (Bitwise Constraints)</div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: monospace; background: rgba(30, 41, 59, 0.4); padding: 8px 12px; border-radius: 6px;">
            <span style="color: #94a3b8;">colMask (列冲突):</span>
            <span style="color: #f43f5e; background: rgba(244,63,94,0.15); padding: 2px 8px; border-radius: 4px; font-weight: bold;">
              ${step.colMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: monospace; background: rgba(30, 41, 59, 0.4); padding: 8px 12px; border-radius: 6px;">
            <span style="color: #94a3b8;">leftDiag (左下对角线 &lt;&lt; 1):</span>
            <span style="color: #fbbf24; background: rgba(251,191,36,0.15); padding: 2px 8px; border-radius: 4px; font-weight: bold;">
              ${step.leftDiagMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: monospace; background: rgba(30, 41, 59, 0.4); padding: 8px 12px; border-radius: 6px;">
            <span style="color: #94a3b8;">rightDiag (右下对角线 &gt;&gt; 1):</span>
            <span style="color: #a855f7; background: rgba(168,85,247,0.15); padding: 2px 8px; border-radius: 4px; font-weight: bold;">
              ${step.rightDiagMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: monospace; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 8px 12px; border-radius: 6px;">
            <span style="color: #34d399; font-weight: 600;">candidates (可用候选位):</span>
            <span style="color: #34d399; background: rgba(16,185,129,0.2); padding: 2px 8px; border-radius: 4px; font-weight: bold;">
              ${step.candidatesMask.toString(2).padStart(step.n, '0')}
            </span>
          </div>
        </div>

        <div style="font-size: 11px; color: #94a3b8; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
          公式：<code style="color: #38bdf8;">limit &amp; ~(col | left | right)</code> 取反求交，值为 1 的位表示纵向及双斜向均无皇后射程攻击威胁。
        </div>
      </div>
    </div>
  `;
}
