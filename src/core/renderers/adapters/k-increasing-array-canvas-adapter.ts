/**
 * 左程云 Class 072 Code02: 使数组 K 递增的最少操作次数 CanvasAdapter
 * 职责：纯粹的模 K 染色分组数组沙盘、ends 贪心数组沙盘与操作统计药丸条渲染
 */

import { KIncreasingStep } from './k-increasing-array-step-compiler';

export function renderKIncreasingCanvas(container: HTMLElement, step: KIncreasingStep): void {
  const groupColors = ['#38bdf8', '#fbbf24', '#c084fc', '#4ade80', '#f43f5e', '#a855f7'];

  // 原数组卡片 (按模 k 着色)
  const arrayCards = step.arr
    .map((val, idx) => {
      const g = idx % step.k;
      const isCurrentGroup = g === step.currentGroup;
      const color = groupColors[g % groupColors.length];

      return `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          background: ${isCurrentGroup ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.5)'};
          border: 1.5px solid ${isCurrentGroup ? color : '#334155'};
          border-radius: 6px;
          padding: 6px 8px;
          min-width: 48px;
          opacity: isCurrentGroup ? 1 : 0.65;
          box-shadow: ${isCurrentGroup ? `0 0 10px ${color}44` : 'none'};
        ">
          <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">i=${idx}</div>
          <div style="font-size: 16px; font-weight: 800; color: ${color}; margin: 2px 0;">${val}</div>
          <div style="font-size: 10px; color: #cbd5e1; font-family: monospace;">mod ${g}</div>
        </div>
      `;
    })
    .join('');

  // 当前组 ends 数组卡片
  const endsCards = step.ends.length > 0
    ? step.ends
        .map((val, idx) => `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            background: rgba(14, 165, 233, 0.15);
            border: 1px solid #38bdf8;
            border-radius: 6px;
            padding: 4px 8px;
            min-width: 42px;
          ">
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">ends[${idx}]</span>
            <span style="font-size: 15px; font-weight: 700; color: #38bdf8;">${val}</span>
          </div>
        `)
        .join('')
    : '<span style="color: #64748b; font-size: 13px;">当前尚未构建 ends 数组</span>';

  // 各组统计药丸条
  const groupStats = step.groupOps
    .map((ops, g) => {
      const color = groupColors[g % groupColors.length];
      const isCur = g === step.currentGroup;
      return `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid ${isCur ? color : '#334155'};
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 12px;
        ">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
          <span style="color: #94a3b8;">组 ${g}:</span>
          <strong style="color: #f8fafc; font-family: monospace;">修改 ${ops} 次</strong>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #0f172a; color: #f8fafc; padding: 12px; box-sizing: border-box; overflow-y: auto;">
      <!-- 原数组按模着色轨道 -->
      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">原数组元素 (按模 k 着色对应子序列):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 10px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px;">
          ${arrayCards}
        </div>
      </div>

      <!-- 当前组的 ends 贪心数组沙盘 -->
      <div style="margin-bottom: 12px;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">当前组最长不下降子序列 ends 贪心数组 (upper_bound 维护):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; padding: 10px; background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 8px; min-height: 48px;">
          ${endsCards}
        </div>
      </div>

      <!-- 各组修改统计 -->
      <div>
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">各组独立修改次数统计:</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${groupStats}
        </div>
      </div>
    </div>
  `;
}
