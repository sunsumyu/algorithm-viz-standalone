import type { DpDemoStep } from '../dp-demo-visualizer';

function headerCell(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'dp-table-header';
  el.textContent = text;
  return el;
}

/**
 * 1D 数组表格渲染与转移箭头覆盖层
 */
export function renderDp1d(container: HTMLElement | null, step: DpDemoStep): void {
  if (!container) return;
  const panel = container.closest('.dp-panel') as HTMLElement | null;
  if (!step.dp1d || step.dp1d.length === 0) {
    container.style.display = 'none';
    if (panel) panel.style.display = 'none';
    return;
  }
  container.style.display = 'flex';
  if (panel) panel.style.display = '';

  const existing = new Map<string, HTMLElement>();
  Array.from(container.querySelectorAll<HTMLElement>('[data-idx]')).forEach((el) => {
    existing.set(el.dataset.idx!, el);
  });
  const dep = new Set((step.dependencies || []).map((d) => d.index).filter((v): v is number => typeof v === 'number'));
  const seen = new Set<string>();
  step.dp1d.forEach((value, index) => {
    const key = String(index);
    seen.add(key);
    let wrap = existing.get(key);
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'dp-cell-wrap';
      wrap.dataset.idx = key;
      const cell = document.createElement('div');
      cell.className = 'dp-cell';
      const idx = document.createElement('div');
      idx.className = 'dp-index';
      idx.textContent = key;
      wrap.append(cell, idx);
      container.appendChild(wrap);
    }
    const cell = wrap.querySelector<HTMLElement>('.dp-cell')!;
    const isUnused = value === '-' || value === null;
    cell.textContent = value == null ? '-' : String(value);
    cell.classList.toggle('current', step.current?.index === index);
    cell.classList.toggle('dependency', dep.has(index));
    cell.classList.toggle('unused', isUnused);
  });

  existing.forEach((el, key) => {
    if (!seen.has(key)) el.remove();
  });

  drawTransitionArrows1d(container, step);
}

export function drawTransitionArrows1d(host: HTMLElement | null, step: DpDemoStep): void {
  if (!host) return;
  const prevPos = getComputedStyle(host).position;
  if (prevPos === 'static') host.style.position = 'relative';
  let svg = host.querySelector<SVGSVGElement>(':scope > .dp-transition-overlay');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'dp-transition-overlay');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'dp-arrow-1d');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto-start-reverse');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill', '#fbbf24');
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);
    host.appendChild(svg);
  }
  svg.innerHTML = svg.querySelector('defs')?.outerHTML || '';
  const target = step.current;
  const deps = step.dependencies || [];
  if (!target || typeof target.index !== 'number' || deps.length === 0) return;
  const toCell = host.querySelector<HTMLElement>(`.dp-cell-wrap[data-idx="${target.index}"] .dp-cell`);
  if (!toCell) return;
  const hostRect = host.getBoundingClientRect();
  const toRect = toCell.getBoundingClientRect();
  const toX = toRect.left - hostRect.left + toRect.width / 2;
  const toY = toRect.top - hostRect.top + toRect.height / 2;
  deps.forEach((d) => {
    if (typeof d.index !== 'number') return;
    const fromCell = host.querySelector<HTMLElement>(`.dp-cell-wrap[data-idx="${d.index}"] .dp-cell`);
    if (!fromCell) return;
    const fromRect = fromCell.getBoundingClientRect();
    const fromX = fromRect.left - hostRect.left + fromRect.width / 2;
    const fromY = fromRect.top - hostRect.top + fromRect.height / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy) || 1;
    const pad = 18;
    const x1 = fromX + (dx / dist) * pad;
    const y1 = fromY + (dy / dist) * pad;
    const x2 = toX - (dx / dist) * pad;
    const y2 = toY - (dy / dist) * pad;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    line.setAttribute('stroke', '#fbbf24');
    line.setAttribute('stroke-width', '2.2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('marker-end', 'url(#dp-arrow-1d)');
    const len = Math.hypot(x2 - x1, y2 - y1);
    line.style.strokeDasharray = String(len);
    line.style.strokeDashoffset = String(len);
    line.style.animation = 'dp-draw-arrow 0.45s cubic-bezier(.4,0,.2,1) forwards';
    svg!.appendChild(line);
  });
}

/**
 * 2D 矩阵表格渲染与转移箭头覆盖层
 */
export function renderDp2d(container: HTMLElement | null, step: DpDemoStep): void {
  if (!container) return;
  const panel = container.closest('.dp-panel') as HTMLElement | null;
  if (!step.dp2d || step.dp2d.length === 0) {
    container.style.display = 'none';
    if (panel) panel.style.display = 'none';
    return;
  }
  container.style.display = 'flex';
  if (panel) panel.style.display = '';
  const rows = step.dp2d.length;
  const cols = step.dp2d[0]?.length || 0;
  const dep = new Set((step.dependencies || []).map((d) => `${d.i},${d.j}`));
  const backtrackSet = new Set((step.backtrackPath || []).map((n) => `${n.i},${n.j}`));

  let table = container.querySelector<HTMLElement>('.dp-table');
  if (!table) {
    table = document.createElement('div');
    table.className = 'dp-table';
    container.appendChild(table);
  }
  table.style.gridTemplateColumns = `minmax(42px, auto) repeat(${cols}, minmax(42px, auto))`;
  const wanted = 1 + cols + rows * (1 + cols);
  if (table.children.length !== wanted) {
    table.innerHTML = '';
    table.appendChild(headerCell(''));
    for (let j = 0; j < cols; j++) table.appendChild(headerCell(step.colLabels?.[j] ?? String(j)));
    for (let i = 0; i < rows; i++) {
      table.appendChild(headerCell(step.rowLabels?.[i] ?? String(i)));
      for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.className = 'dp-table-cell';
        cell.dataset.r = String(i);
        cell.dataset.c = String(j);
        table.appendChild(cell);
      }
    }
  } else {
    const headers = table.querySelectorAll<HTMLElement>('.dp-table-header');
    if (headers[0]) headers[0].textContent = '';
    for (let j = 0; j < cols; j++) headers[j + 1].textContent = step.colLabels?.[j] ?? String(j);
    for (let i = 0; i < rows; i++) {
      if (headers[1 + cols + i]) {
        headers[1 + cols + i].textContent = step.rowLabels?.[i] ?? String(i);
      }
    }
  }

  const colHeaders = table.querySelectorAll<HTMLElement>('.dp-table-header');
  for (let j = 0; j < cols; j++) {
    const h = colHeaders[j + 1];
    if (h) h.classList.toggle('is-active-header', step.current?.j === j);
  }
  for (let i = 0; i < rows; i++) {
    const h = colHeaders[1 + cols + i];
    if (h) h.classList.toggle('is-active-header', step.current?.i === i);
  }

  table.querySelectorAll<HTMLElement>('.dp-table-cell').forEach((cell) => {
    const i = Number(cell.dataset.r);
    const j = Number(cell.dataset.c);
    if (i < rows && j < cols) {
      const value = step.dp2d![i][j];
      cell.textContent = value == null ? '-' : String(value);
      const isCur = step.current?.i === i && step.current?.j === j;
      const isDep = dep.has(`${i},${j}`);
      const inPath = backtrackSet.has(`${i},${j}`);
      cell.classList.toggle('current', isCur);
      cell.classList.toggle('dependency', isDep);
      cell.classList.toggle('in-backtrack-path', inPath);

      const rL = step.rowLabels?.[i] ?? i;
      const cL = step.colLabels?.[j] ?? j;
      cell.title = `dp[${i}][${j}] = ${value ?? '-'}${rL !== i || cL !== j ? ` (${rL}, ${cL})` : ''}${inPath ? ' ⭐ 最优回溯路径节点' : ''}`;
    }
  });

  drawTransitionArrows2d(container, step);
}

export function drawTransitionArrows2d(host: HTMLElement | null, step: DpDemoStep): void {
  const table = host?.querySelector<HTMLElement>('.dp-table');
  if (!table || !host) return;
  const prevPos = getComputedStyle(host).position;
  if (prevPos === 'static') host.style.position = 'relative';
  let svg = host.querySelector<SVGSVGElement>(':scope > .dp-transition-overlay');
  if (!svg) {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'dp-transition-overlay');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'dp-arrow');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto-start-reverse');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill', '#fbbf24');
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);
    host.appendChild(svg);
  }
  svg.innerHTML = svg.querySelector('defs')?.outerHTML || '';
  const target = step.current;
  const deps = step.dependencies || [];
  if (!target || deps.length === 0 || !table) return;
  const hostRect = host.getBoundingClientRect();
  const ti = target.i;
  const tj = target.j;
  if (typeof ti !== 'number' || typeof tj !== 'number') return;
  const toCell = table.querySelector<HTMLElement>(`.dp-table-cell[data-r="${ti}"][data-c="${tj}"]`);
  if (!toCell) return;
  const toRect = toCell.getBoundingClientRect();
  const toX = toRect.left - hostRect.left + toRect.width / 2;
  const toY = toRect.top - hostRect.top + toRect.height / 2;
  deps.forEach((d) => {
    if (typeof d.i !== 'number' || typeof d.j !== 'number') return;
    const fromCell = table.querySelector<HTMLElement>(`.dp-table-cell[data-r="${d.i}"][data-c="${d.j}"]`);
    if (!fromCell) return;
    const fromRect = fromCell.getBoundingClientRect();
    const fromX = fromRect.left - hostRect.left + fromRect.width / 2;
    const fromY = fromRect.top - hostRect.top + fromRect.height / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const dist = Math.hypot(dx, dy) || 1;
    const pad = 16;
    const x1 = fromX + (dx / dist) * pad;
    const y1 = fromY + (dy / dist) * pad;
    const x2 = toX - (dx / dist) * pad;
    const y2 = toY - (dy / dist) * pad;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    line.setAttribute('stroke', '#fbbf24');
    line.setAttribute('stroke-width', '2.2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('marker-end', 'url(#dp-arrow)');
    const len = Math.hypot(x2 - x1, y2 - y1);
    line.style.strokeDasharray = String(len);
    line.style.strokeDashoffset = String(len);
    line.style.animation = 'dp-draw-arrow 0.45s cubic-bezier(.4,0,.2,1) forwards';
    svg!.appendChild(line);
  });
}
