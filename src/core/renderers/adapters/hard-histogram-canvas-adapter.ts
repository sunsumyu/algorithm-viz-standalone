/**
 * 柱状图中最大的矩形 (LeetCode 84)
 * Canvas Adapter: SVG 直方图投影与单调栈结算矩形呈现
 */

import type { HistogramStep } from './hard-histogram-step-compiler';

export function renderHistogramCanvas(container: HTMLElement, step: HistogramStep): void {
  const maxH = Math.max(...step.heights, 7);
  const barWidth = 40;
  const gap = 10;
  const svgWidth = step.heights.length * (barWidth + gap) + 40;
  const svgHeight = 220;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%;">
      <!-- 柱状图主画布 -->
      <div style="
        background: rgba(15, 23, 42, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        padding: 20px 16px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow-x: auto;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--text-color, #f1f5f9);">
            📊 直方图沙盘与单调栈矩形最大扩展投影
          </span>
          <div style="display: flex; gap: 12px; font-size: 11px;">
            <span style="color: #fbbf24; font-weight: 600;">■ 栈内递增柱</span>
            <span style="color: #38bdf8; font-weight: 600;">■ 当前扫描柱</span>
            <span style="color: #ef4444; font-weight: 600;">■ 出栈结算柱</span>
            <span style="color: #34d399; font-weight: 600;">▢ 结算最大矩形</span>
          </div>
        </div>

        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="min-width: 100%; height: 210px;">
          <!-- 底部基线 -->
          <line x1="20" y1="170" x2="${svgWidth - 20}" y2="170" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2" />

          <!-- 高亮结算矩形半透明遮罩 -->
          ${
            step.rectHighlight
              ? `
              <rect
                x="${20 + step.rectHighlight.left * (barWidth + gap)}"
                y="${170 - (step.rectHighlight.height / maxH) * 140}"
                width="${(step.rectHighlight.right - step.rectHighlight.left + 1) * (barWidth + gap) - gap}"
                height="${(step.rectHighlight.height / maxH) * 140}"
                fill="rgba(52, 211, 153, 0.22)"
                stroke="#34d399"
                stroke-width="2.5"
                stroke-dasharray="6 3"
                rx="6"
              />
            `
              : ''
          }

          <!-- 各柱子绘制 -->
          ${step.heights.map((h, idx) => {
            const x = 20 + idx * (barWidth + gap);
            const barH = (h / maxH) * 140;
            const y = 170 - barH;
            const inStack = step.stack.includes(idx);
            const isCurrent = idx === step.currentIndex;
            const isPopped = idx === step.poppedIndex;

            let fillColor = 'rgba(51, 65, 85, 0.5)';
            let strokeColor = 'rgba(255, 255, 255, 0.1)';

            if (isPopped) {
              fillColor = 'rgba(239, 68, 68, 0.6)';
              strokeColor = '#ef4444';
            } else if (isCurrent) {
              fillColor = 'rgba(2, 132, 199, 0.6)';
              strokeColor = '#38bdf8';
            } else if (inStack) {
              fillColor = 'rgba(217, 119, 6, 0.6)';
              strokeColor = '#f59e0b';
            }

            return `
              <g>
                <rect
                  x="${x}"
                  y="${y}"
                  width="${barWidth}"
                  height="${barH}"
                  fill="${fillColor}"
                  stroke="${strokeColor}"
                  stroke-width="${isCurrent || isPopped ? '2' : '1'}"
                  rx="4"
                />
                <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" fill="#f8fafc" font-size="12" font-weight="bold">${h}</text>
                <text x="${x + barWidth / 2}" y="190" text-anchor="middle" fill="${isCurrent ? '#38bdf8' : 'var(--text-muted, #94a3b8)'}" font-size="11" font-weight="600">#${idx}</text>
              </g>
            `;
          }).join('')}
        </svg>

        <!-- 单调递增栈内索引序列带 -->
        <div style="
          margin-top: 12px;
          padding: 8px 14px;
          background: rgba(15, 23, 42, 0.6);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          gap: 10px;
        ">
          <span style="font-size: 11px; color: var(--text-muted, #94a3b8); font-weight: 600;">单调递增栈索引:</span>
          <span style="font-family: monospace; font-size: 13px; color: #fbbf24; font-weight: 700;">
            [ ${step.stack.map(idx => `${idx}(h=${step.heights[idx]})`).join(', ')} ]
          </span>
        </div>
      </div>
    </div>
  `;
}
