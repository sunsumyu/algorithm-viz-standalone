import type { StockStep } from './best-time-stock-step-compiler';

export function renderBestTimeStockCanvas(container: HTMLElement, step: StockStep): void {
  const arr = step.prices;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const minVal = Math.min(...arr);
  const maxVal = Math.max(...arr);
  const valRange = maxVal - minVal || 1;

  const svgWidth = 420;
  const svgHeight = 160;
  const padX = 30;
  const padY = 25;

  const points = arr.map((val, idx) => {
    const x = padX + (idx / Math.max(1, n - 1)) * (svgWidth - padX * 2);
    const y = svgHeight - padY - ((val - minVal) / valRange) * (svgHeight - padY * 2);
    return { x, y, val, idx };
  });

  // 收益交易线段高亮 (绿色)
  const tradeSegmentsSvg = step.tradeRanges
    .map(([bIdx, sIdx]) => {
      const p1 = points[bIdx];
      const p2 = points[sIdx];
      return `
        <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="4" stroke-linecap="round" />
      `;
    })
    .join('');

  // 整体折线路径
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // 节点圆圈与标注
  const nodesSvg = points
    .map((p) => {
      const isCurrent = p.idx === step.currentIndex && step.phase !== 'done';
      const isNextCompare = p.idx === step.currentIndex + 1 && step.phase === 'compare';
      const isTrade = step.tradeRanges.some(([b, s]) => b === p.idx || s === p.idx);

      let stroke = '#cbd5e1';
      let fill = '#ffffff';
      let r = 5;

      if (isCurrent || isNextCompare) {
        stroke = '#059669';
        fill = '#34d399';
        r = 7.5;
      } else if (isTrade) {
        stroke = '#10b981';
        fill = '#ecfdf5';
        r = 6;
      }

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
          <text x="${p.x}" y="${p.y - 10}" fill="${isTrade ? '#059669' : '#64748b'}" font-size="10.5" font-family="JetBrains Mono" font-weight="${isTrade ? '800' : '600'}" text-anchor="middle">
            ${p.val}
          </text>
          <text x="${p.x}" y="${svgHeight - 6}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="middle">
            D${p.idx}
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
        <!-- 背景基准线 -->
        <line x1="${padX}" y1="${svgHeight - padY}" x2="${svgWidth - padX}" y2="${svgHeight - padY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />
        <line x1="${padX}" y1="${padY}" x2="${svgWidth - padX}" y2="${padY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />

        <!-- 背景底折线 -->
        <path d="${linePath}" fill="none" stroke="#e2e8f0" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />

        <!-- 正收益交易线段 -->
        ${tradeSegmentsSvg}

        <!-- 节点与标签 -->
        ${nodesSvg}
      </svg>
    </div>
  `;
}
