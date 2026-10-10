/**
 * 状态压缩 BFS (State Compression BFS) — 领域视觉适配器
 * 遵循 Matt Pocock 深模块哲学：
 * Card 1 纯 SVG 网格地图与扩维路径探索沙盘
 * Card 2 承载二进制位掩码 (keyMask) 与扩维三元组监视舱
 */

import type { StateBFSItem } from '../../../algorithms/categories/graph/state-compression-bfs-step-compiler';

export function renderStateCompressionBfsCanvas(container: HTMLElement, step: StateBFSItem): void {
  const { grid, curR, curC, keyMask, stepCount, activePath } = step;
  const rows = grid.length;
  const cols = grid[0].length;

  const cellW = cols <= 4 ? 64 : 54;
  const cellH = 54;
  const gap = 8;
  const totalW = cols * cellW + (cols - 1) * gap;
  const totalH = rows * cellH + (rows - 1) * gap;
  const startX = (480 - totalW) / 2;
  const startY = (240 - totalH) / 2 + 10;

  // 1. 轨迹路径折线
  let pathSvg = '';
  if (activePath && activePath.length > 1) {
    const points = activePath
      .map(([r, c]) => {
        const cx = startX + c * (cellW + gap) + cellW / 2;
        const cy = startY + r * (cellH + gap) + cellH / 2;
        return `${cx},${cy}`;
      })
      .join(' ');

    pathSvg = `<polyline points="${points}" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.75" />`;
  }

  // 2. 网格单元格
  let cellsSvg = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = grid[r][c];
      const isCur = curR === r && curC === c;
      const onPath = activePath?.some(([pr, pc]) => pr === r && pc === c);
      const isWall = ch === '#';
      const isStart = ch === '@';
      const isKey = ch === 'a' || ch === 'b';

      const x = startX + c * (cellW + gap);
      const y = startY + r * (cellH + gap);

      let fill = isWall ? '#1e293b' : onPath ? '#064e3b' : '#0f172a';
      let stroke = isWall ? '#334155' : onPath ? '#10b981' : isKey ? '#f59e0b' : '#334155';

      let label = ch;
      if (isStart) label = '🚩';
      else if (ch === 'a') label = '🔑a';
      else if (ch === 'b') label = '🔑b';
      else if (isWall) label = '🧱';
      else if (ch === '.') label = '·';

      let ring = '';
      if (isCur) {
        ring = `<rect x="${x - 3}" y="${y - 3}" width="${cellW + 6}" height="${cellH + 6}" rx="10" fill="none" stroke="#facc15" stroke-width="2.5" stroke-dasharray="4 2" />`;
      }

      cellsSvg += `
        <g class="grid-cell" data-coord="${r},${c}">
          ${ring}
          <rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2" />
          <text x="${x + cellW / 2}" y="${y + cellH / 2 + 5}" text-anchor="middle" font-size="14" font-weight="800" fill="#f8fafc" font-family="system-ui, sans-serif">${label}</text>
          <text x="${x + cellW - 6}" y="${y + cellH - 6}" text-anchor="end" font-size="8" fill="#64748b" font-family="monospace">${r},${c}</text>
        </g>
      `;
    }
  }

  // 3. 状态标签
  const maskBinary = `0b${keyMask.toString(2).padStart(2, '0')}`;
  const badgeSvg = `
    <g transform="translate(14, 16)">
      <rect x="0" y="0" width="220" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" opacity="0.95" />
      <circle cx="12" cy="12" r="4" fill="#38bdf8" />
      <text x="24" y="16" font-size="11" font-weight="700" fill="#e2e8f0" font-family="system-ui, sans-serif">位置: (${curR}, ${curC}) | 步数: ${stepCount} | 掩码: ${maskBinary}</text>
    </g>
  `;

  // 4. 纯 SVG 注入 Card 1（严禁包装外层 div）
  container.innerHTML = `
    <svg viewBox="0 0 480 250" style="width:100%; height:100%; max-height:240px; display:block; background:#0b1120;">
      <defs>
        <pattern id="state-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#1e293b" opacity="0.6"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#state-grid)" />
      ${pathSvg}
      ${cellsSvg}
      ${badgeSvg}
    </svg>
  `.trim();
}

export function renderStateCompressionBfsCustomMetrics(container: HTMLElement, step: StateBFSItem): void {
  const maskBits = [0, 1]
    .map((bit) => {
      const has = (step.keyMask & (1 << bit)) !== 0;
      const char = String.fromCharCode(97 + bit);
      const bg = has ? '#78350f' : '#1e293b';
      const textCol = has ? '#fde047' : '#64748b';
      const border = has ? '2px solid #eab308' : '1px solid #475569';

      return `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:60px; height:34px; background:${bg}; border:${border}; border-radius:4px; color:${textCol}; font-family:monospace; font-size:11px; font-weight:700;">
          <span style="font-size:8px; color:#94a3b8; line-height:1;">位 ${bit} (钥匙 ${char})</span>
          <span style="line-height:1.1;">${has ? '1 (持有)' : '0 (未得)'}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; padding:10px; background:#0f172a; border-radius:8px; border:1px solid #1e293b;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-family:monospace; font-size:11px; font-weight:700; color:#f59e0b;">keyMask (位图):</span>
        <div style="display:flex; gap:6px;">${maskBits}</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #334155; padding-top:6px; font-size:11px;">
        <span style="color:#10b981; font-weight:700;">当前扩维三元组:</span>
        <strong style="color:#38bdf8; font-family:monospace;">(r:${step.curR}, c:${step.curC}, mask:0b${step.keyMask.toString(2).padStart(2, '0')}) | 累计 ${step.stepCount} 步</strong>
      </div>
    </div>
  `.trim();
}

export class StateCompressionBfsCanvasAdapter {
  mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  updateStep(container: HTMLElement, step: unknown): void {
    const sStep = step as StateBFSItem;
    if (!sStep) return;
    renderStateCompressionBfsCanvas(container, sStep);
  }

  dispose(container: HTMLElement): void {
    container.innerHTML = '';
  }
}
