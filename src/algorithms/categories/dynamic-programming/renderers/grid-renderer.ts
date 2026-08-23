/**
 * Grid Explorer Physical Stage Renderer (迷宫探险与网格物理实景渲染器)
 */

import { DpThematicMeta } from './types';
import { createStageSVG } from './svg-helpers';

/**
 * 创建可爱卡通探险家小人 SVG (Cartoon Adventurer Character)
 */
function createCartoonAdventurer(
  x: number,
  y: number,
  scale: number = 0.72,
  state: 'walking' | 'cheering' | 'blocked' | 'memo' = 'walking',
  recoilDir: 'down' | 'right' | 'none' = 'none'
): SVGGElement {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const recoilClass = recoilDir !== 'none' ? `is-recoil-${recoilDir}` : '';
  g.setAttribute('class', `dp-cartoon-explorer is-${state} ${recoilClass}`);
  g.setAttribute('transform', `translate(${x}, ${y}) scale(${scale})`);

  let extraHeadDeco = '';
  if (state === 'cheering') {
    extraHeadDeco = `
      <circle cx="0" cy="-22" r="18" fill="rgba(250, 204, 21, 0.2)" filter="url(#grid-glow)" />
      <text x="-16" y="-23" font-size="11">✨</text>
      <text x="10" y="-25" font-size="11">⭐</text>
      <!-- 欢呼小手 -->
      <circle cx="-13" cy="-14" r="3.2" fill="#fed7aa" stroke="#ea580c" stroke-width="1" />
      <circle cx="13" cy="-14" r="3.2" fill="#fed7aa" stroke="#ea580c" stroke-width="1" />
      <text x="10" y="-17" font-size="13">🏆</text>
    `;
  } else if (state === 'blocked') {
    extraHeadDeco = `
      <!-- 惊汗与警示 💧 -->
      <path d="M 12 -23 C 12 -23, 15 -19, 15 -17 C 15 -15, 13 -14, 12 -14 C 11 -14, 9 -15, 9 -17 C 9 -19, 12 -23, 12 -23 Z" fill="#38bdf8" />
      <text x="-15" y="-19" font-size="11">💫</text>
      <text x="13" y="-21" font-size="10">💧</text>
    `;
  } else if (state === 'memo') {
    extraHeadDeco = `
      <!-- 备忘录命中灵感灯泡 💡 -->
      <circle cx="0" cy="-28" r="9" fill="rgba(250, 204, 21, 0.3)" />
      <text x="0" y="-23" text-anchor="middle" font-size="13">💡</text>
    `;
  } else {
    extraHeadDeco = `
      <!-- 探险指南针 🧭 -->
      <circle cx="11" cy="4" r="4.5" fill="#0f172a" stroke="#38bdf8" stroke-width="1" />
      <circle cx="11" cy="4" r="1.8" fill="#ef4444" />
      <path d="M 11 1.5 L 11 6.5 M 8.5 4 L 13.5 4" stroke="#38bdf8" stroke-width="0.8" />
    `;
  }

  const eyeMarkup = state === 'cheering'
    ? `<path d="M -5 -13 Q -3.5 -16 -2 -13" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" />
       <path d="M 2 -13 Q 3.5 -16 5 -13" fill="none" stroke="#0f172a" stroke-width="1.8" stroke-linecap="round" />`
    : state === 'blocked'
    ? `<circle cx="-3.5" cy="-13" r="2.2" fill="#0f172a" />
       <circle cx="-3.5" cy="-0.8" fill="#ffffff" />
       <circle cx="3.5" cy="-13" r="2.2" fill="#0f172a" />
       <circle cx="3.5" cy="-0.8" fill="#ffffff" />
       <path d="M -3 -8 Q 0 -11 3 -8" fill="none" stroke="#9a3412" stroke-width="1.4" stroke-linecap="round" />`
    : `<ellipse cx="-3.5" cy="-13" rx="1.6" ry="2.2" fill="#0f172a" />
       <circle cx="-4.2" cy="-14.2" r="0.8" fill="#ffffff" />
       <ellipse cx="3.5" cy="-13" rx="1.6" ry="2.2" fill="#0f172a" />
       <circle cx="2.8" cy="-14.2" r="0.8" fill="#ffffff" />
       <path d="M -2.5 -8 Q 0 -6 2.5 -8" fill="none" stroke="#9a3412" stroke-width="1.4" stroke-linecap="round" />`;

  g.innerHTML = `
    <!-- 阴影 -->
    <ellipse cx="0" cy="18" rx="12" ry="3.5" fill="rgba(0, 0, 0, 0.45)" />

    <!-- 身体摇摆主容器 -->
    <g class="explorer-body">
      <!-- 背包 (Backpack) -->
      <rect x="-14" y="-4" width="7" height="14" rx="3" fill="#854d0e" stroke="#713f12" stroke-width="1" />
      <ellipse cx="-10.5" cy="-4" rx="3.5" ry="2.2" fill="#a16207" />
      
      <!-- 腿部与探险靴 (Legs & Boots) -->
      <rect x="-6" y="8" width="4" height="8" rx="2" fill="#1e293b" />
      <rect x="2" y="8" width="4" height="8" rx="2" fill="#1e293b" />
      <rect x="-8" y="13" width="7" height="4.5" rx="2" fill="#b45309" stroke="#78350f" stroke-width="0.8" />
      <rect x="2" y="13" width="7" height="4.5" rx="2" fill="#b45309" stroke="#78350f" stroke-width="0.8" />

      <!-- 躯干/冲锋衣 (Coat & Scarf) -->
      <rect x="-9" y="-6" width="18" height="16" rx="5" fill="#0284c7" stroke="#0369a1" stroke-width="1.2" />
      <!-- 红色领巾 -->
      <path d="M -6 -6 L 0 1 L 6 -6 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="0.8" />
      <!-- 腰带与金扣 -->
      <rect x="-8.5" y="4" width="17" height="3" fill="#334155" />
      <rect x="-2.5" y="3.5" width="5" height="4" rx="1" fill="#facc15" stroke="#ca8a04" stroke-width="0.5" />

      <!-- 手臂 (Arms) -->
      ${state !== 'cheering' ? `
        <rect x="-12" y="-4" width="4.5" height="11" rx="2.2" fill="#0284c7" stroke="#0369a1" stroke-width="0.8" transform="rotate(12 -12 -4)" />
        <circle cx="-11" cy="7" r="2.5" fill="#fed7aa" />
        <rect x="7.5" y="-4" width="4.5" height="11" rx="2.2" fill="#0284c7" stroke="#0369a1" stroke-width="0.8" transform="rotate(-12 7.5 -4)" />
        <circle cx="11" cy="7" r="2.5" fill="#fed7aa" />
      ` : ''}

      <!-- 头部与脸庞 (Head & Face) -->
      <circle cx="0" cy="-12" r="10.5" fill="#fed7aa" stroke="#ea580c" stroke-width="0.9" />
      <!-- 腮红 -->
      <ellipse cx="-6" cy="-10" rx="2.4" ry="1.4" fill="rgba(248, 113, 113, 0.45)" />
      <ellipse cx="6" cy="-10" rx="2.4" ry="1.4" fill="rgba(248, 113, 113, 0.45)" />
      
      <!-- 五官 -->
      ${eyeMarkup}

      <!-- 探险遮阳帽 (Safari Explorer Hat) -->
      <!-- 帽檐 -->
      <ellipse cx="0" cy="-17.5" rx="17" ry="5.2" fill="#d97706" stroke="#92400e" stroke-width="1.2" />
      <!-- 帽顶 -->
      <path d="M -10 -17.5 C -10 -27, 10 -27, 10 -17.5 Z" fill="#b45309" stroke="#78350f" stroke-width="1.2" />
      <!-- 红色帽带 -->
      <path d="M -10 -18.5 Q 0 -16 10 -18.5" stroke="#ef4444" stroke-width="2.2" fill="none" />
      <!-- 帽侧探险徽章 -->
      <circle cx="-5" cy="-21" r="2" fill="#facc15" stroke="#ca8a04" stroke-width="0.6" />

      <!-- 特殊头顶状态挂件 -->
      ${extraHeadDeco}
    </g>
  `;
  return g;
}

export function renderGridExplorerStageSVG(container: HTMLElement, meta?: DpThematicMeta['grid']): void {
  container.innerHTML = '';
  if (!meta) return;

  const rows = Math.min(6, Math.max(2, meta.rows || 3));
  const cols = Math.min(8, Math.max(2, meta.cols || 4));
  const curR = meta.curRow ?? 0;
  const curC = meta.curCol ?? 0;
  const obstacles = meta.obstacles || [];
  const pathCount = meta.pathCount ?? 1;

  const isOutOfBounds = curR >= rows || curC >= cols || curR < 0 || curC < 0;
  const parentR = meta.parentRow !== undefined ? meta.parentRow : (curR >= rows ? rows - 1 : curR < 0 ? 0 : curR);
  const parentC = meta.parentCol !== undefined ? meta.parentCol : (curC >= cols ? cols - 1 : curC < 0 ? 0 : curC);
  
  const activeR = isOutOfBounds ? Math.min(rows - 1, Math.max(0, parentR)) : curR;
  const activeC = isOutOfBounds ? Math.min(cols - 1, Math.max(0, parentC)) : curC;

  const stepStatus = meta.status || 'enter';
  const isBlockedStep = stepStatus === 'out-of-bounds';
  const isCurrentObstacle = !isOutOfBounds && obstacles.some(([or, oc]) => or === curR && oc === curC);

  const pathStack = meta.pathStack && meta.pathStack.length > 0
    ? meta.pathStack
    : (!isOutOfBounds ? [[curR, curC]] as Array<[number, number]> : [[activeR, activeC]] as Array<[number, number]>);

  const pathStackMap = new Map<string, number>();
  pathStack.forEach(([r, c], idx) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      pathStackMap.set(`${r},${c}`, idx + 1);
    }
  });

  const visitedSet = new Set<string>((meta.visitedCells || []).map(([r, c]) => `${r},${c}`));
  pathStack.forEach(([r, c]) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      visitedSet.add(`${r},${c}`);
    }
  });

  const dp2d = meta.dp2d;

  const svg = createStageSVG('0 0 840 230');

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <filter id="grid-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="trophy-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <linearGradient id="grid-cur-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(56, 189, 248, 0.45)" />
      <stop offset="100%" stop-color="rgba(37, 99, 235, 0.25)" />
    </linearGradient>
    <linearGradient id="grid-trail-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(56, 189, 248, 0.28)" />
      <stop offset="100%" stop-color="rgba(14, 165, 233, 0.15)" />
    </linearGradient>
    <linearGradient id="grid-start-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(16, 185, 129, 0.4)" />
      <stop offset="100%" stop-color="rgba(5, 150, 105, 0.2)" />
    </linearGradient>
    <linearGradient id="grid-goal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(245, 158, 11, 0.45)" />
      <stop offset="100%" stop-color="rgba(217, 119, 6, 0.25)" />
    </linearGradient>
    <linearGradient id="river-water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" stop-opacity="0.85" />
      <stop offset="50%" stop-color="#0369a1" stop-opacity="0.95" />
      <stop offset="100%" stop-color="#082f49" stop-opacity="1" />
    </linearGradient>
    <linearGradient id="river-bank-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <marker id="arrow-trail" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
    </marker>
  `;
  svg.appendChild(defs);

  const availW = 520;
  const availH = 138;
  const cellW = Math.min(96, Math.max(52, availW / cols));
  const cellH = Math.min(42, Math.max(28, availH / rows));
  const totalW = cols * cellW;
  const totalH = rows * cellH;
  const startX = 35 + (availW - totalW) / 2;
  const startY = 12 + (availH - totalH) / 2;

  const boardBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  boardBg.setAttribute('x', String(startX - 8));
  boardBg.setAttribute('y', String(startY - 8));
  boardBg.setAttribute('width', String(totalW + 16));
  boardBg.setAttribute('height', String(totalH + 16));
  boardBg.setAttribute('rx', '12');
  boardBg.setAttribute('fill', 'rgba(10, 15, 30, 0.65)');
  boardBg.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
  boardBg.setAttribute('stroke-width', '1.5');
  svg.appendChild(boardBg);

  const riverY = startY + totalH + 4;
  const riverH = 26;
  const riverW = totalW + 24;
  const riverX = startX - 12;

  const riverG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const riverRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  riverRect.setAttribute('x', String(riverX));
  riverRect.setAttribute('y', String(riverY));
  riverRect.setAttribute('width', String(riverW));
  riverRect.setAttribute('height', String(riverH));
  riverRect.setAttribute('rx', '7');
  riverRect.setAttribute('fill', 'url(#river-water-grad)');
  riverRect.setAttribute('stroke', '#38bdf8');
  riverRect.setAttribute('stroke-width', '1.2');
  riverG.appendChild(riverRect);

  const wave1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  wave1.setAttribute('class', 'dp-river-waves-1');
  let wavePath1 = `M ${riverX} ${riverY + 11} `;
  for (let wx = riverX; wx <= riverX + riverW + 48; wx += 24) wavePath1 += `Q ${wx + 6} ${riverY + 8}, ${wx + 12} ${riverY + 11} T ${wx + 24} ${riverY + 11} `;
  wave1.setAttribute('d', wavePath1);
  wave1.setAttribute('fill', 'none');
  wave1.setAttribute('stroke', 'rgba(255, 255, 255, 0.38)');
  wave1.setAttribute('stroke-width', '1.2');
  riverG.appendChild(wave1);

  const wave2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  wave2.setAttribute('class', 'dp-river-waves-2');
  let wavePath2 = `M ${riverX} ${riverY + 18} `;
  for (let wx = riverX; wx <= riverX + riverW + 48; wx += 20) wavePath2 += `Q ${wx + 5} ${riverY + 15}, ${wx + 10} ${riverY + 18} T ${wx + 20} ${riverY + 18} `;
  wave2.setAttribute('d', wavePath2);
  wave2.setAttribute('fill', 'none');
  wave2.setAttribute('stroke', 'rgba(56, 189, 248, 0.5)');
  wave2.setAttribute('stroke-width', '1.5');
  wave2.setAttribute('stroke-dasharray', '8 6');
  riverG.appendChild(wave2);

  const riverLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  riverLabel.setAttribute('x', String(riverX + riverW / 2));
  riverLabel.setAttribute('y', String(riverY + 17.5));
  riverLabel.setAttribute('text-anchor', 'middle');
  riverLabel.setAttribute('font-size', '9.5');
  riverLabel.setAttribute('font-weight', '800');
  riverLabel.setAttribute('fill', '#bae6fd');
  riverLabel.textContent = '🌊 边界深水河流 · 越界落水反弹 🚫';
  riverG.appendChild(riverLabel);
  svg.appendChild(riverG);

  if (pathStack.length > 1) {
    const trailG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (let i = 0; i < pathStack.length - 1; i++) {
      const [r1, c1] = pathStack[i];
      const [r2, c2] = pathStack[i + 1];
      if (r1 < rows && c1 < cols && r2 < rows && c2 < cols && r1 >= 0 && c1 >= 0 && r2 >= 0 && c2 >= 0) {
        const x1 = startX + c1 * cellW + cellW / 2;
        const y1 = startY + r1 * cellH + cellH / 2;
        const x2 = startX + c2 * cellW + cellW / 2;
        const y2 = startY + r2 * cellH + cellH / 2;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x1)); line.setAttribute('y1', String(y1));
        line.setAttribute('x2', String(x2)); line.setAttribute('y2', String(y2));
        line.setAttribute('stroke', '#38bdf8'); line.setAttribute('stroke-width', '2.8');
        line.setAttribute('stroke-dasharray', '5 3'); line.setAttribute('class', 'dp-trail-dash');
        line.setAttribute('marker-end', 'url(#arrow-trail)'); line.setAttribute('opacity', '0.85');
        trailG.appendChild(line);
      }
    }
    svg.appendChild(trailG);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * cellW;
      const y = startY + r * cellH;
      const key = `${r},${c}`;
      const isStart = r === 0 && c === 0;
      const isEnd = r === rows - 1 && c === cols - 1;
      const isStanding = r === activeR && c === activeC;
      const stepIndex = pathStackMap.get(key);
      const isPathTrail = stepIndex !== undefined;
      const isVisited = visitedSet.has(key);
      const isBlockedTile = isBlockedStep && isStanding;
      const isObs = obstacles.some(([or, oc]) => or === r && oc === c);
      const cellG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const cellRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      cellRect.setAttribute('x', String(x + 2)); cellRect.setAttribute('y', String(y + 2));
      cellRect.setAttribute('width', String(cellW - 4)); cellRect.setAttribute('height', String(cellH - 4)); cellRect.setAttribute('rx', '8');
      if (isObs) {
        cellRect.setAttribute('fill', 'rgba(239, 68, 68, 0.32)');
        cellRect.setAttribute('stroke', '#ef4444');
        cellRect.setAttribute('stroke-width', '2');
        cellRect.setAttribute('stroke-dasharray', '4 2');
      } 
      else if (isBlockedTile) { cellRect.setAttribute('fill', 'rgba(239, 68, 68, 0.25)'); cellRect.setAttribute('stroke', '#f87171'); cellRect.setAttribute('stroke-width', '2.5'); }
      else if (isStanding) { cellRect.setAttribute('fill', 'url(#grid-cur-grad)'); cellRect.setAttribute('stroke', '#38bdf8'); cellRect.setAttribute('stroke-width', '2.5'); cellRect.setAttribute('filter', 'url(#grid-glow)'); }
      else if (isPathTrail) { cellRect.setAttribute('fill', 'url(#grid-trail-grad)'); cellRect.setAttribute('stroke', '#38bdf8'); cellRect.setAttribute('stroke-width', '2'); }
      else if (isEnd) { cellRect.setAttribute('fill', 'url(#grid-goal-grad)'); cellRect.setAttribute('stroke', '#f59e0b'); cellRect.setAttribute('stroke-width', '2'); cellRect.setAttribute('filter', 'url(#trophy-glow)'); }
      else if (isStart) { cellRect.setAttribute('fill', 'url(#grid-start-grad)'); cellRect.setAttribute('stroke', '#10b981'); cellRect.setAttribute('stroke-width', '1.8'); }
      else if (isVisited) { cellRect.setAttribute('fill', 'rgba(16, 185, 129, 0.12)'); cellRect.setAttribute('stroke', 'rgba(52, 211, 153, 0.4)'); cellRect.setAttribute('stroke-width', '1.2'); }
      else { cellRect.setAttribute('fill', 'rgba(20, 28, 48, 0.5)'); cellRect.setAttribute('stroke', 'rgba(255, 255, 255, 0.09)'); }
      cellG.appendChild(cellRect);

      if (isObs) {
        const obsIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        obsIcon.setAttribute('x', String(x + cellW / 2));
        obsIcon.setAttribute('y', String(y + cellH / 2 - 2));
        obsIcon.setAttribute('text-anchor', 'middle');
        obsIcon.setAttribute('font-size', '14');
        obsIcon.textContent = '🚧';
        cellG.appendChild(obsIcon);
      }

      const coordText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      coordText.setAttribute('x', String(x + cellW / 2)); coordText.setAttribute('y', String(y + cellH - 4));
      coordText.setAttribute('text-anchor', 'middle'); coordText.setAttribute('font-size', '9');
      coordText.setAttribute('font-family', 'ui-monospace, monospace'); coordText.setAttribute('font-weight', '700');
      coordText.setAttribute('fill', isBlockedTile ? '#f87171' : isStanding ? '#93c5fd' : isPathTrail ? '#38bdf8' : isObs ? '#fca5a5' : '#64748b');
      coordText.textContent = isObs ? `(${r},${c}) 障碍` : isBlockedTile ? `(${r},${c}) 越界拦截` : isStanding ? (isOutOfBounds ? `(${r},${c}) 探测` : `(${r},${c}) 探险`) : `(${r},${c})`;
      cellG.appendChild(coordText);
      svg.appendChild(cellG);
    }
  }

  if (isBlockedStep) {
    const splashG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (curR >= rows) {
      const splashX = startX + activeC * cellW + cellW / 2;
      const splashY = riverY + 8;

      const ring1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring1.setAttribute('class', 'dp-splash-ring');
      ring1.setAttribute('cx', String(splashX));
      ring1.setAttribute('cy', String(splashY));
      ring1.setAttribute('fill', 'none');
      ring1.setAttribute('stroke', '#38bdf8');
      splashG.appendChild(ring1);

      const dropsWrap = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      dropsWrap.setAttribute('transform', `translate(${splashX}, ${splashY})`);
      dropsWrap.innerHTML = `
        <g class="dp-splash-drops">
          <circle cx="-10" cy="-6" r="2.4" fill="#38bdf8" />
          <circle cx="10" cy="-6" r="2.4" fill="#38bdf8" />
          <circle cx="-4" cy="-12" r="2.8" fill="#67e8f9" />
          <circle cx="5" cy="-13" r="2.8" fill="#67e8f9" />
          <circle cx="0" cy="-16" r="3.2" fill="#bae6fd" />
          <text x="-10" y="-18" font-size="12">💦</text>
        </g>
      `;
      splashG.appendChild(dropsWrap);

      const boingWrap = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      boingWrap.setAttribute('transform', `translate(${splashX}, ${riverY + 13})`);
      boingWrap.innerHTML = `
        <g class="dp-boing-badge">
          <rect x="-44" y="-8" width="88" height="16" rx="4" fill="rgba(239, 68, 68, 0.95)" stroke="#fca5a5" stroke-width="0.8" />
          <text x="0" y="3.2" text-anchor="middle" font-size="9" font-weight="900" fill="#ffffff">💥 触水弹回! i=${curR}</text>
        </g>
      `;
      splashG.appendChild(boingWrap);
    } else if (curC >= cols) {
      const splashX = startX + cols * cellW + 6;
      const splashY = startY + activeR * cellH + cellH / 2;

      const ring1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring1.setAttribute('class', 'dp-splash-ring');
      ring1.setAttribute('cx', String(splashX));
      ring1.setAttribute('cy', String(splashY));
      ring1.setAttribute('fill', 'none');
      ring1.setAttribute('stroke', '#ef4444');
      splashG.appendChild(ring1);

      const dropsWrap = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      dropsWrap.setAttribute('transform', `translate(${splashX}, ${splashY})`);
      dropsWrap.innerHTML = `
        <g class="dp-splash-drops">
          <circle cx="6" cy="-8" r="2.5" fill="#f87171" />
          <circle cx="10" cy="0" r="2.8" fill="#f87171" />
          <circle cx="6" cy="8" r="2.5" fill="#f87171" />
          <text x="6" y="4" font-size="12">💥</text>
        </g>
      `;
      splashG.appendChild(dropsWrap);

      const boingWrap = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      boingWrap.setAttribute('transform', `translate(${splashX + 38}, ${splashY})`);
      boingWrap.innerHTML = `
        <g class="dp-boing-badge">
          <rect x="-38" y="-8" width="76" height="16" rx="4" fill="rgba(239, 68, 68, 0.95)" stroke="#fca5a5" stroke-width="0.8" />
          <text x="0" y="3.2" text-anchor="middle" font-size="9" font-weight="900" fill="#ffffff">💥 弹回! j=${curC}</text>
        </g>
      `;
      splashG.appendChild(boingWrap);
    }
    svg.appendChild(splashG);
  }

  const charX = startX + activeC * cellW + cellW / 2;
  const charY = startY + activeR * cellH + cellH / 2 - 4;
  const charScale = Math.min(0.82, Math.max(0.62, cellH / 54));
  const charState = (stepStatus === 'eval-goal' || (activeR === rows - 1 && activeC === cols - 1 && stepStatus === 'completed')) ? 'cheering' : isBlockedStep ? 'blocked' : stepStatus === 'memo-hit' ? 'memo' : 'walking';
  const recoilDir = isBlockedStep ? (curR >= rows ? 'down' : curC >= cols ? 'right' : 'none') : 'none';
  const adventurerChar = createCartoonAdventurer(charX, charY, charScale, charState, recoilDir);
  svg.appendChild(adventurerChar);

  const cardX = 570; const cardY = 14; const cardW = 240; const cardH = 160;
  const cardG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const cardBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  cardBg.setAttribute('x', String(cardX)); cardBg.setAttribute('y', String(cardY));
  cardBg.setAttribute('width', String(cardW)); cardBg.setAttribute('height', String(cardH));
  cardBg.setAttribute('rx', '12'); cardBg.setAttribute('fill', 'rgba(15, 23, 42, 0.85)');
  cardBg.setAttribute('stroke', isBlockedStep || isCurrentObstacle ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.25)');
  cardG.appendChild(cardBg);

  const validPathCount = pathCount != null && !isNaN(Number(pathCount)) ? Number(pathCount) : 0;
  const actionLabel = isBlockedStep ? '🚧 触河弹回' : isCurrentObstacle || stepStatus === 'eval-obstacle' ? '🚧 遇障阻断' : stepStatus === 'memo-hit' ? '⚡ 备忘录命中' : stepStatus === 'eval-border' ? '🎬 触达边界' : stepStatus === 'eval-goal' ? '🏆 抵达终点' : stepStatus === 'init' ? '🚀 边界初始化' : stepStatus === 'update' ? '⚡ 状态转移' : stepStatus === 'completed' ? '🏁 计算完成' : stepStatus;

  cardG.innerHTML += `
    <text x="${cardX + cardW / 2}" y="${cardY + 28}" text-anchor="middle" font-size="11.5" font-weight="800" fill="${isBlockedStep || isCurrentObstacle ? '#f87171' : '#38bdf8'}">🧭 探险家寻路罗盘 (Grid Telemetry)</text>
    <text x="${cardX + 16}" y="${cardY + 56}" font-size="11" font-weight="700" fill="#94a3b8">📍 当前格坐标: (${curR}, ${curC}) ${isCurrentObstacle ? '🚧 障碍' : ''}</text>
    <text x="${cardX + 16}" y="${cardY + 80}" font-size="11" font-weight="700" fill="#94a3b8">🚶 步进动作: ${actionLabel}</text>
    <text x="${cardX + 16}" y="${cardY + 104}" font-size="11" font-weight="700" fill="#94a3b8">✨ 当前有效路径: ${validPathCount} 条</text>
  `;
  svg.appendChild(cardG);

  const hudG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const hudBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  hudBg.setAttribute('x', '35');
  hudBg.setAttribute('y', '194');
  hudBg.setAttribute('width', '775');
  hudBg.setAttribute('height', '26');
  hudBg.setAttribute('rx', '6');
  hudBg.setAttribute('fill', 'rgba(15, 23, 42, 0.8)');
  hudBg.setAttribute('stroke', isBlockedStep || isCurrentObstacle ? 'rgba(239, 68, 68, 0.3)' : stepStatus === 'memo-hit' ? 'rgba(192, 132, 252, 0.4)' : 'rgba(255, 255, 255, 0.08)');
  hudG.appendChild(hudBg);

  const hudText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  hudText.setAttribute('x', '48');
  hudText.setAttribute('y', '211');
  hudText.setAttribute('font-size', '11.5');
  hudText.setAttribute('font-weight', '700');

  if (isBlockedStep) {
    hudText.setAttribute('fill', '#f87171');
    hudText.textContent = `🌊 探险家尝试向 (${curR}, ${curC}) 探索但落入深水河流 💦，第 8 行越界条件成立，触水弹回原位并 return 0。`;
  } else if (stepStatus === 'eval-obstacle' || isCurrentObstacle) {
    hudText.setAttribute('fill', '#f87171');
    hudText.textContent = `🚧 探险家在 (${curR}, ${curC}) 遇到施工障碍物 🚧，该格不可通行，到达该位置的路径数 dp[${curR}][${curC}] 强制置为 0。`;
  } else if (stepStatus === 'init') {
    hudText.setAttribute('fill', '#93c5fd');
    hudText.textContent = `🚀 【初始化边界】单向推进，若首行或首列遇到障碍物 🚧 则该方向后续位置均不可达（保持为 0）。`;
  } else if (stepStatus === 'update') {
    hudText.setAttribute('fill', '#38bdf8');
    hudText.textContent = `⚡ 【状态更新】计算坐标 (${curR}, ${curC}) 的路径数：来自上方 + 来自左方 = ${validPathCount} 条。`;
  } else if (stepStatus === 'completed') {
    hudText.setAttribute('fill', '#fde047');
    hudText.textContent = `🏆 全局推演完成！从起点 (0, 0) 避开障碍到达终点 (${rows - 1}, ${cols - 1}) 的不同路径总数为 ${validPathCount} 条！`;
  } else if (stepStatus === 'enter') {
    hudText.setAttribute('fill', '#93c5fd');
    hudText.textContent = `📥 【函数入口】准备求解网格路径问题，初始规模 ${rows} × ${cols}，红色虚线框为障碍物。`;
  } else if (stepStatus === 'memo-hit') {
    hudText.setAttribute('fill', '#c084fc');
    hudText.textContent = `⚡ 坐标 (${curR}, ${curC}) 命中备忘录缓存 memo[${curR}][${curC}] = ${validPathCount}！直接 O(1) 查表返回，剪除整颗重复子树！`;
  } else if (stepStatus === 'eval-border') {
    hudText.setAttribute('fill', '#38bdf8');
    const borderName = curR === 0 && curC === 0 ? '起点 (0, 0)' : curR === 0 ? `第 0 行上方边界 (${curR}, ${curC})` : `第 0 列左侧边界 (${curR}, ${curC})`;
    hudText.textContent = `🎬 探险家触达${borderName}！从起点 (0, 0) 单向直行仅 1 种路径，命中 Base Case 返回 1！`;
  } else if (stepStatus === 'eval-goal') {
    hudText.setAttribute('fill', '#fde047');
    hudText.textContent = `🏆 探险家成功抵达终点 (${curR}, ${curC})！命中 Base Case 条件，返回 1！`;
  } else {
    hudText.setAttribute('fill', '#6ee7b7');
    hudText.textContent = `🧭 探险家推进至坐标 (${curR}, ${curC})，继续向下与向右分治探索。`;
  }
  hudG.appendChild(hudText);
  svg.appendChild(hudG);

  container.appendChild(svg);
}
