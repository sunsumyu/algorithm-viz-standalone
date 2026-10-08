import type { MergeStep } from './merge-intervals-step-compiler';

export function renderMergeIntervalsCanvas(container: HTMLElement, step: MergeStep): void {
  const intervals = step.intervals;
  const result = step.result;
  const n = intervals.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const allNums = [...intervals.flat(), ...(result.length ? result.flat() : [])];
  const minX = Math.min(...allNums);
  const maxX = Math.max(...allNums);
  const xRange = maxX - minX || 1;

  const svgWidth = 420;
  const svgHeight = 160;
  const padX = 35;

  // 上轨道：原始区间
  const origHeight = Math.min(18, 55 / n);
  const origSvgs = intervals
    .map(([s, e], idx) => {
      const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
      const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
      const width = Math.max(10, x2 - x1);
      const y = 20 + idx * origHeight;

      const isCurrent = idx === step.currentIndex && step.action !== 'done';
      const fill = isCurrent ? '#dbeafe' : '#f1f5f9';
      const stroke = isCurrent ? '#2563eb' : '#cbd5e1';
      const textColor = isCurrent ? '#1d4ed8' : '#64748b';

      return `
        <g>
          <rect x="${x1}" y="${y}" width="${width}" height="${origHeight - 4}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
          <text x="${x1 + width / 2}" y="${y + origHeight / 2 - 1}" fill="${textColor}" font-size="8.5" font-family="JetBrains Mono" font-weight="700" text-anchor="middle" dominant-baseline="middle">
            [${s}, ${e}]
          </text>
        </g>
      `;
    })
    .join('');

  // 下轨道：合并后结果
  const resSvgs = result
    .map(([s, e], idx) => {
      const x1 = padX + ((s - minX) / xRange) * (svgWidth - padX * 2);
      const x2 = padX + ((e - minX) / xRange) * (svgWidth - padX * 2);
      const width = Math.max(12, x2 - x1);
      const y = 100;

      const isLast = idx === result.length - 1;
      const fill = isLast ? '#d1fae5' : '#ecfdf5';
      const stroke = isLast ? '#059669' : '#10b981';

      return `
        <g>
          <rect x="${x1}" y="${y}" width="${width}" height="24" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="2" />
          <text x="${x1 + width / 2}" y="${y + 12}" fill="#065f46" font-size="10" font-family="JetBrains Mono" font-weight="800" text-anchor="middle" dominant-baseline="middle">
            [${s}, ${e}]
          </text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="xMidYMid meet">
        <!-- 上下分界提示 -->
        <text x="${padX}" y="12" fill="#64748b" font-size="8.5" font-weight="700">原始输入区间 (待扫描)</text>
        <text x="${padX}" y="92" fill="#059669" font-size="8.5" font-weight="800">已合并区间集合 (merged)</text>

        <!-- 坐标轴 -->
        <line x1="${padX}" y1="${svgHeight - 12}" x2="${svgWidth - padX}" y2="${svgHeight - 12}" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="${padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono">x=${minX}</text>
        <text x="${svgWidth - padX}" y="${svgHeight - 2}" fill="#94a3b8" font-size="8.5" font-family="JetBrains Mono" text-anchor="end">x=${maxX}</text>

        <!-- 区间条 -->
        ${origSvgs}
        ${resSvgs}
      </svg>
    </div>
  `;
}
