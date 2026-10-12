/**
 * 自由之路环形 DP (LeetCode 514)
 * Canvas Adapter: 目标词拼写进度带与环形密码转盘沙盘呈现
 */

import type { FreedomTrailStep } from './freedom-trail-step-compiler';

export function renderFreedomTrailCanvas(container: HTMLElement, step: FreedomTrailStep): void {
  const { ring, key, keyIdx, ringPos, chosenTargetPos } = step;

  // 渲染 Key 拼写进度带
  const keyTokensHtml = key.split('').map((ch, idx) => {
    const isCompleted = idx < keyIdx;
    const isCurrent = idx === keyIdx;
    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 6px 12px;
        border-radius: 6px;
        background: ${isCurrent ? 'rgba(56, 189, 248, 0.25)' : isCompleted ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)'};
        border: 1px solid ${isCurrent ? '#38bdf8' : isCompleted ? '#22c55e' : 'rgba(255, 255, 255, 0.08)'};
        box-shadow: ${isCurrent ? '0 0 12px rgba(56, 189, 248, 0.35)' : 'none'};
      ">
        <span style="font-size: 11px; color: var(--text-muted, #94a3b8);">#${idx + 1}</span>
        <span style="font-size: 16px; font-weight: 800; font-family: monospace; color: ${isCurrent ? '#38bdf8' : isCompleted ? '#4ade80' : 'var(--text-color, #e2e8f0)'};">${ch}</span>
        <span style="font-size: 9px; color: ${isCompleted ? '#4ade80' : isCurrent ? '#38bdf8' : 'var(--text-muted, #64748b)'};">
          ${isCompleted ? '✓ 完成' : isCurrent ? '● 正在拼' : '待拼'}
        </span>
      </div>
    `;
  }).join('');

  // 渲染 Ring 环形缓冲区转盘
  const ringSlotsHtml = ring.split('').map((char, idx) => {
    const isCur = idx === ringPos;
    const isChosen = idx === chosenTargetPos;

    let bgColor = 'rgba(255, 255, 255, 0.04)';
    let borderColor = 'rgba(255, 255, 255, 0.1)';

    if (isCur) {
      bgColor = 'rgba(245, 158, 11, 0.3)';
      borderColor = '#f59e0b';
    } else if (isChosen) {
      bgColor = 'rgba(16, 185, 129, 0.3)';
      borderColor = '#10b981';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="font-size: 10px; height: 16px; color: ${isCur ? '#f59e0b' : isChosen ? '#4ade80' : 'transparent'}; font-weight: 800;">
          ${isCur ? '▲ 12点指针' : isChosen ? '★ 目标槽位' : ''}
        </div>
        <div style="
          width: 52px;
          height: 54px;
          background: ${bgColor};
          border: 2px solid ${borderColor};
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 800;
          font-family: monospace;
          color: var(--text-color, #f8fafc);
          box-shadow: ${isCur ? '0 0 16px rgba(245, 158, 11, 0.45)' : isChosen ? '0 0 16px rgba(16, 185, 129, 0.45)' : 'none'};
          transition: all 0.2s ease;
        ">
          ${char}
        </div>
        <div style="font-size: 11px; color: var(--text-muted, #94a3b8); font-weight: 600;">
          [${idx}]
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%;">
      <!-- Key 目标词拼写状态跟踪带 -->
      <div style="background: rgba(15, 23, 42, 0.4); padding: 14px 16px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 12px; font-weight: 700; color: var(--text-color, #f1f5f9);">
            🎯 目标词拼写进度 (Key: "${key}")
          </span>
          <span style="font-size: 11px; color: var(--text-muted, #94a3b8);">
            进度: ${Math.min(keyIdx, key.length)} / ${key.length}
          </span>
        </div>
        <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 4px;">
          ${keyTokensHtml}
        </div>
      </div>

      <!-- 环形转盘序列展示沙盘 -->
      <div style="
        background: rgba(15, 23, 42, 0.4);
        padding: 24px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        overflow-x: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      ">
        <div style="font-size: 12px; color: var(--text-muted, #94a3b8); margin-bottom: 12px; text-align: center; font-weight: 600;">
          🎡 环形密码转盘 (Ring Buffer - 首尾环形相通，双向最短距离 min(|i - j|, n - |i - j|))
        </div>
        <div style="display: flex; gap: 10px; justify-content: center; align-items: flex-end; min-width: 480px; padding: 10px 0;">
          ${ringSlotsHtml}
        </div>
      </div>
    </div>
  `;
}
