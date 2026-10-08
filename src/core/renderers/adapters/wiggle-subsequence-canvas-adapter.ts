import type { WiggleStep } from './wiggle-subsequence-step-compiler';

export function renderWiggleSubsequenceCanvas(container: HTMLElement, step: WiggleStep): void {
  const arr = step.array;
  const n = arr.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
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

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const nodesSvg = points
    .map((p) => {
      const isWiggle = step.wiggleIndices.includes(p.idx);
      const isSkipped = step.skippedIndices.includes(p.idx);
      const isCurrent = p.idx === step.currentIndex && step.action !== 'done';

      let stroke = '#cbd5e1';
      let fill = '#ffffff';
      let r = 5;

      if (isCurrent) {
        stroke = '#2563eb';
        fill = '#3b82f6';
        r = 8;
      } else if (isWiggle) {
        stroke = '#059669';
        fill = '#10b981';
        r = 6.5;
      } else if (isSkipped) {
        stroke = '#94a3b8';
        fill = '#e2e8f0';
        r = 4;
      }

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />
          <text x="${p.x}" y="${p.y - 10}" fill="${isWiggle ? '#059669' : '#64748b'}" font-size="10.5" font-family="JetBrains Mono" font-weight="${isWiggle ? '800' : '600'}" text-anchor="middle">
            ${p.val}
          </text>
          <text x="${p.x}" y="${svgHeight - 6}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="middle">
            [${p.idx}]
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
        <line x1="${padX}" y1="${svgHeight - padY}" x2="${svgWidth - padX}" y2="${svgHeight - padY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />
        <line x1="${padX}" y1="${padY}" x2="${svgWidth - padX}" y2="${padY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3 3" />
        <path d="${linePath}" fill="none" stroke="#93c5fd" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        ${nodesSvg}
      </svg>
    </div>
  `;
}
