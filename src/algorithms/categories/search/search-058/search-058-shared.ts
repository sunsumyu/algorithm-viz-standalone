/**
 * 左神算法通关课 Class 058 洪水填充高频扩展 共享沙盘与渲染助手
 * 提供：多色网格岛屿染色沙盘、0 点翻转连通桥接沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Search058Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

const ISLAND_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  0: { bg: '#ffffff', border: '#cbd5e1', text: '#64748b' }, // 海洋
  1: { bg: '#e0f2fe', border: '#38bdf8', text: '#0369a1' }, // 未染色陆地
  2: { bg: '#dcfce7', border: '#22c55e', text: '#15803d' }, // 岛屿 2 (绿)
  3: { bg: '#fef3c7', border: '#f59e0b', text: '#b45309' }, // 岛屿 3 (黄)
  4: { bg: '#f3e8ff', border: '#a855f7', text: '#7e22ce' }, // 岛屿 4 (紫)
};

export function renderLargeIslandBoard(
  grid: number[][],
  flipR: number,
  flipC: number,
  areaMap: Record<number, number>,
  maxArea: number,
  stage: string
): string {
  const n = grid.length;
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🏝️ 最大人工岛 两次遍历染色桥接沙盘 (${n}x${n} 网格)</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 800;">
          当前最大岛屿面积 = ${maxArea}
        </span>
      </div>

      <!-- 网格显示 -->
      <div style="display: grid; grid-template-columns: repeat(${n}, 1fr); gap: 6px; max-width: 220px; margin: 0 auto 12px auto;">
        ${grid.map((row, r) => row.map((val, c) => {
          const isFlip = r === flipR && c === flipC;
          const conf = ISLAND_COLORS[val] || { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c' };
          return `
            <div style="aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; border: 2px solid ${isFlip ? '#dc2626' : conf.border}; background: ${isFlip ? '#fef2f2' : conf.bg};">
              <div style="font-size: 13px; font-weight: 800; color: ${isFlip ? '#dc2626' : conf.text};">
                ${isFlip ? '★' : val === 0 ? '0' : `ID:${val}`}
              </div>
              <div style="font-size: 8px; color: #64748b;">(${r},${c})</div>
            </div>
          `;
        }).join('')).join('')}
      </div>

      <!-- 岛屿面积统计 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px;">
          <div style="font-weight: 700; color: #0284c7; margin-bottom: 2px;">阶段指示:</div>
          <div style="color: #0369a1;">${stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px;">
          <div style="font-weight: 700; color: #0284c7; margin-bottom: 2px;">各岛屿面积字典:</div>
          <div style="color: #334155;">
            ${Object.keys(areaMap).length > 0
              ? Object.entries(areaMap).map(([id, size]) => `ID ${id}: <b>${size}</b>格`).join(' | ')
              : '尚未开始染色'}
          </div>
        </div>
      </div>
    </div>
  `;
}
