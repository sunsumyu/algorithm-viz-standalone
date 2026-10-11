/**
 * 爱吃香蕉的珂珂 (Koko Eating Bananas) - 视觉适配器
 */

import { KokoStep } from './koko-eating-bananas-step-compiler';

export function renderKokoCanvas(step: KokoStep): string {
  const { piles, h, left, right, mid, totalHours, phase, bestSpeed } = step;

  const maxPile = Math.max(...piles, 1);

  const pileBars = piles
    .map((p, idx) => {
      const hoursForPile = phase !== 'init' && phase !== 'finish' ? Math.ceil(p / mid) : 0;
      const height = Math.max(26, Math.round((p / maxPile) * 110));

      return `
      <div style="display: flex; flex-direction: column; align-items: center; width: 56px; margin: 0 6px;">
        <div style="font-size: 11px; height: 16px; margin-bottom: 4px; color: #fbbf24;">
          ${hoursForPile > 0 ? `${hoursForPile}h` : ''}
        </div>
        <div style="
          width: 100%;
          height: ${height}px;
          background: rgba(234, 179, 8, 0.22);
          border: 2px solid #eab308;
          border-radius: 6px 6px 0 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 4px;
          color: #fef08a;
          font-weight: 700;
          font-size: 13px;
        ">
          <div>🍌 ${p}</div>
        </div>
        <div style="
          width: 100%;
          text-align: center;
          background: rgba(15, 23, 42, 0.6);
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 11px;
          color: #64748b;
          padding: 2px 0;
        ">堆 [${idx}]</div>
      </div>`;
    })
    .join('');

  const isSuccess = totalHours > 0 && totalHours <= h;

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">各香蕉堆分布与单堆消化时间（限时 ${h} 小时）</div>
          <div style="font-size: 11px; color: ${isSuccess ? '#34d399' : '#f87171'}; font-weight: 700;">
            ${totalHours > 0 ? `当前总耗时: ${totalHours}h (${isSuccess ? '✓ 达标' : '✗ 超时'})` : ''}
          </div>
        </div>
        <div style="display: flex; align-items: flex-end; justify-content: center; min-height: 160px; padding-bottom: 8px;">
          ${pileBars}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最低吃速 Left</div>
          <div style="font-size: 16px; font-weight: 700; color: #60a5fa;">${left}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前探测吃速 Mid</div>
          <div style="font-size: 16px; font-weight: 700; color: #fbbf24;">${mid} 根/h</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最高吃速 Right</div>
          <div style="font-size: 16px; font-weight: 700; color: #a78bfa;">${right}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前记录最小解 Ans</div>
          <div style="font-size: 16px; font-weight: 700; color: #34d399;">
            ${bestSpeed !== null ? `${bestSpeed} 根/h` : '探索中...'}
          </div>
        </div>
      </div>
    </div>
  `;
}
