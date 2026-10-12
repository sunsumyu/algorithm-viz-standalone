/**
 * 地下城游戏反向 DP (LeetCode 174)
 * Canvas Adapter: 地下城房间网格与生命值自底向上逆推呈现
 */

import type { DungeonStep } from './dungeon-game-step-compiler';

export function renderDungeonCanvas(container: HTMLElement, step: DungeonStep): void {
  const { dungeon, dp, currentRow, currentCol } = step;
  const m = dungeon.length;
  const n = dungeon[0].length;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%;">
      <!-- 提示与状态导览 -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 6px;">
        <span style="font-weight: 700; font-size: 13px; color: var(--text-color, #f1f5f9);">
          🏰 地下城房间网格 (自右下角向左上角逆推生命值)
        </span>
        <div style="display: flex; gap: 14px; font-size: 11px;">
          <span style="color: #38bdf8; font-weight: 600;">🛡️ (0,0) 骑士起点</span>
          <span style="color: #f43f5e; font-weight: 600;">👑 (${m-1},${n-1}) 终点公主房</span>
        </div>
      </div>

      <!-- 地下城房间网格沙盘 -->
      <div style="
        background: rgba(15, 23, 42, 0.4);
        padding: 24px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        overflow-x: auto;
      ">
        <div style="display: grid; grid-template-columns: repeat(${n}, minmax(110px, 1fr)); gap: 14px; max-width: 600px; width: 100%;">
          ${Array.from({ length: m }).map((_, r) => {
            return Array.from({ length: n }).map((_, c) => {
              const isCur = r === currentRow && c === currentCol;
              const hpNeed = dp[r][c];
              const cost = dungeon[r][c];
              const isStart = r === 0 && c === 0;
              const isBoss = r === m - 1 && c === n - 1;

              let border = '1px solid rgba(255, 255, 255, 0.08)';
              let bg = 'rgba(30, 41, 59, 0.4)';

              if (isCur) {
                border = '2px solid #38bdf8';
                bg = 'rgba(56, 189, 248, 0.22)';
              } else if (hpNeed > 0) {
                bg = 'rgba(51, 65, 85, 0.35)';
              }

              return `
                <div style="
                  min-height: 95px;
                  background: ${bg};
                  border: ${border};
                  border-radius: 8px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  gap: 5px;
                  padding: 8px;
                  box-shadow: ${isCur ? '0 0 16px rgba(56, 189, 248, 0.45)' : 'none'};
                  transition: all 0.2s ease;
                  position: relative;
                ">
                  <div style="display: flex; justify-content: space-between; width: 100%; font-size: 11px; color: var(--text-muted, #94a3b8); padding: 0 4px;">
                    <span>(${r}, ${c})</span>
                    <span>${isStart ? '🛡️' : isBoss ? '👑' : ''}</span>
                  </div>
                  <div style="font-size: 15px; font-weight: 800; color: ${cost >= 0 ? '#10b981' : '#ef4444'};">
                    ${cost >= 0 ? `+${cost}` : cost}
                  </div>
                  <div style="
                    font-size: 11px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: ${hpNeed > 0 ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.04)'};
                    color: ${hpNeed > 0 ? '#fbbf24' : 'var(--text-muted, #64748b)'};
                    border: 1px solid ${hpNeed > 0 ? 'rgba(245, 158, 11, 0.4)' : 'transparent'};
                  ">
                    ${hpNeed > 0 ? `最低需 ≥ ${hpNeed}` : '未算'}
                  </div>
                </div>
              `;
            }).join('');
          }).join('')}
        </div>
      </div>
    </div>
  `;
}
