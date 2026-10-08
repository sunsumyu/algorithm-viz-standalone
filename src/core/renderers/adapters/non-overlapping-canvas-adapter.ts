import type { NonOverlappingStep } from './non-overlapping-step-compiler';

export function renderNonOverlappingCanvas(container: HTMLElement, step: NonOverlappingStep): void {
  const intervals = step.intervals;
  const n = intervals.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const minX = Math.min(...intervals.map((b) => b[0]));
  const maxX = Math.max(...intervals.map((b) => b[1]));
  const xRange = maxX - minX || 1;

  const svgWidth = 420;
  const svgHeight = 160;
  const padX = 35;
  const rowHeight = Math.min(24, (svgHeight - 40) / n);

  const intervalSvgs = intervals
    .map(([s, e], idx) => {
      const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
      const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
      const width = Math.max(12, x2 - x1);
      const y = 20 + idx * rowHeight;

      const isCurrent = idx === step.currentIndex && step.action !== 'done';
      const isRemoved = step.removedIndices.includes(idx);
      const isKept = step.keptIndices.includes(idx);

      let fill = '#f1f5f9';
      let stroke = '#cbd5e1';
      let textColor = '#64748b';
      let dash = '';

      if (isCurrent) {
        fill = '#dbeafe';
        stroke = '#2563eb';
        textColor = '#1d4ed8';
      } else if (isRemoved) {
        fill = '#fee2e2';
        stroke = '#ef4444';
        textColor = '#dc2626';
        dash = 'stroke-dasharray="3 2"';
      } else if (isKept) {
        fill = '#ecfdf5';
        stroke = '#10b981';
        textColor = '#059669';
      }

      return `
        <g>
          <rect x="${x1}" y="${y}" width="${width}" height="${rowHeight - 6}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="1.5" ${dash} />
          <text x="${x1 + width / 2}" y="${y + rowHeight / 2 - 1}" fill="${textColor}" font-size="9.5" font-family="JetBrains Mono" font-weight="700" text-anchor="middle" dominant-baseline="middle">
            ${isRemoved ? '❌ ' : isKept ? '✓ ' : ''}[${s}, ${e}]
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
        <!-- 底部坐标标尺 -->
        <line x1="${padX}" y1="${svgHeight - 15}" x2="${svgWidth - padX}" y2="${svgHeight - 15}" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="${padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">x=${minX}</text>
        <text x="${svgWidth - padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="end">x=${maxX}</text>

        <!-- 区间块 -->
        ${intervalSvgs}
      </svg>
    </div>
  `;
}
