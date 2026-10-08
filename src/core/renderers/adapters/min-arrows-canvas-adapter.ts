import type { MAStep } from './min-arrows-step-compiler';

export function renderMinArrowsCanvas(container: HTMLElement, step: MAStep): void {
  const balloons = step.balloons;
  const n = balloons.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const minX = Math.min(...balloons.map((b) => b[0]));
  const maxX = Math.max(...balloons.map((b) => b[1]));
  const xRange = maxX - minX || 1;

  const svgWidth = 420;
  const svgHeight = 160;
  const padX = 35;
  const rowHeight = Math.min(22, (svgHeight - 40) / n);

  const balloonSvgs = balloons
    .map(([s, e], idx) => {
      const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
      const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
      const width = Math.max(12, x2 - x1);
      const y = 20 + idx * rowHeight;

      const isCurrent = idx === step.currentIndex && step.action !== 'done';
      const fill = isCurrent ? '#f472b6' : '#fbcfe8';
      const stroke = isCurrent ? '#db2777' : '#ec4899';

      return `
        <g>
          <rect x="${x1}" y="${y}" width="${width}" height="${rowHeight - 6}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
          <text x="${x1 + width / 2}" y="${y + rowHeight / 2 - 1}" fill="#831843" font-size="9" font-family="JetBrains Mono" font-weight="700" text-anchor="middle" dominant-baseline="middle">
            [${s}, ${e}]
          </text>
        </g>
      `;
    })
    .join('');

  const arrowsSvg = step.arrowPositions
    .map((arrowX, aIdx) => {
      const x = padX + ((arrowX - minX) / xRange) * (svgWidth - padX * 2);
      return `
        <g>
          <line x1="${x}" y1="8" x2="${x}" y2="${svgHeight - 12}" stroke="#10b981" stroke-width="2" stroke-dasharray="4 2" />
          <circle cx="${x}" cy="${svgHeight - 8}" r="4" fill="#10b981" />
          <text x="${x}" y="12" fill="#059669" font-size="9" font-family="JetBrains Mono" font-weight="800" text-anchor="middle">
            🏹#${aIdx + 1}
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 10px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
        <line x1="${padX}" y1="${svgHeight - 15}" x2="${svgWidth - padX}" y2="${svgHeight - 15}" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="${padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">x=${minX}</text>
        <text x="${svgWidth - padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="end">x=${maxX}</text>
        ${balloonSvgs}
        ${arrowsSvg}
      </svg>
    </div>
  `;
}
