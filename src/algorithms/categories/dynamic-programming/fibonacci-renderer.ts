/**
 * 斐波那契数（四阶段演化）— 声明式 4-Card 标准架构
 * 模式一：朴素递归 ➔ 模式二：记忆化搜索 ➔ 模式三：递推填表 ➔ 模式四：空间滚动压缩
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  EvolutionModeId,
  EVOLUTION_MODES,
  FIB_EVOLUTION_CODES,
  FibEvolutionStep,
  buildEvolutionSteps,
} from './fib-evolution-steps';
import { renderDpTreeSVG } from './dp-demo-visualizer';

/** 主视觉分发：按演化模式渲染调用树 / 填表 / 滚动变量 */
export function renderFibonacciCanvas(container: HTMLElement, step: FibEvolutionStep): void {
  if (step.evolutionMode === 'tabulation-bottomup') {
    renderTabulation(container, step);
  } else if (step.evolutionMode === 'space-optimized') {
    renderRollingVars(container, step);
  } else {
    // naive-recursive / memo-topdown：调用树深模块
    if (step.tree) {
      container.innerHTML = '';
      container.style.width = '100%';
      container.style.height = '100%';
      renderDpTreeSVG(container, step.tree);
    } else {
      container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">无调用树</div>';
    }
  }
}

/* ═══════════════════ 模式三：递推填表 ═══════════════════ */

function renderTabulation(container: HTMLElement, step: FibEvolutionStep): void {
  const dpArr = step.dp1d ?? [];
  const n = Math.max(dpArr.length - 1, 0);
  const currentIdx = step.current?.index ?? -1;
  const depIndices = new Set((step.dependencies || []).map((d) => d.index));

  const CELL = 'width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', Consolas, monospace; box-sizing: border-box;';

  const indexRow = `
    <div style="display: flex; gap: 6px; align-items: center;">
      <div style="width: 56px; font-size: 10px; font-weight: 700; color: #94a3b8; text-align: right;">下标 i</div>
      ${Array.from({ length: n + 1 }, (_, i) => `<div style="${CELL} background: transparent; border: none;"><span style="color: #94a3b8; font-size: 0.8rem; font-weight: 700;">${i}</span></div>`).join('')}
    </div>
  `;

  const valueRow = `
    <div class="fib-dp-row" style="display: flex; gap: 6px; align-items: center;">
      <div style="width: 56px; font-size: 10px; font-weight: 700; color: #94a3b8; text-align: right;">dp[i]</div>
      ${Array.from({ length: n + 1 }, (_, i) => {
        const isCurrent = i === currentIdx;
        const isDep = depIndices.has(i);
        const isComputed = i < currentIdx && i < dpArr.length;

        let bg = 'rgba(0,0,0,0.35)';
        let border = '1.5px solid rgba(148,163,255,0.25)';
        let color = '#e2e8f0';
        let transform = 'none';
        let boxShadow = 'none';
        if (isDep) {
          border = '1.5px solid #fbbf24';
          bg = 'rgba(251,191,36,0.12)';
          color = '#fcd34d';
        }
        if (isComputed && !isDep) {
          bg = 'rgba(52,211,153,0.10)';
          border = '1.5px solid rgba(52,211,153,0.35)';
          color = '#6ee7b7';
        }
        if (isCurrent) {
          bg = 'rgba(96,165,250,0.18)';
          border = '2px solid #60a5fa';
          color = '#93c5fd';
          transform = 'translateY(-2px)';
          boxShadow = '0 4px 14px rgba(96,165,250,0.3)';
        }

        const val = i < dpArr.length ? dpArr[i] : '-';
        return `<div class="fib-dp-cell" data-idx="${i}" style="${CELL} background: ${bg}; border: ${border}; color: ${color}; transform: ${transform}; box-shadow: ${boxShadow}; font-size: 14px; font-weight: 800; transition: all 0.25s ease;">${val}</div>`;
      }).join('')}
    </div>
  `;

  // 公式拆解卡
  let formulaCard: string;
  if (currentIdx < 2) {
    formulaCard = `
      <div style="font-size: 13px; color: #60a5fa; font-weight: 700;">🎬 边界初始化 (Base Case)</div>
      <div style="font-size: 14px; color: #e2e8f0;">
        dp[0] = <span style="color: #6ee7b7; font-weight: 800;">0</span>，
        dp[1] = <span style="color: #6ee7b7; font-weight: 800;">1</span>
      </div>
      <div style="font-size: 11px; color: #94a3b8;">递推的基底，所有后续状态由此而来。</div>
    `;
  } else {
    const prev2 = currentIdx - 2 >= 0 ? dpArr[currentIdx - 2] : '?';
    const prev1 = currentIdx - 1 >= 0 ? dpArr[currentIdx - 1] : '?';
    const result = dpArr[currentIdx] ?? '?';
    formulaCard = `
      <div style="font-size: 13px; color: #fbbf24; font-weight: 700;">⚡ 状态转移方程</div>
      <div style="display: flex; align-items: center; gap: 6px; font-size: 15px; color: #e2e8f0;">
        <span>dp[<span style="color:#60a5fa; font-weight:800;">${currentIdx}</span>]</span>
        <span style="color:#94a3b8;">=</span>
        <span style="color: #fbbf24;">dp[${currentIdx - 2}]</span>
        <span style="color:#94a3b8;">+</span>
        <span style="color: #34d399;">dp[${currentIdx - 1}]</span>
        <span style="color:#94a3b8;">=</span>
        <span style="color: #fbbf24; font-weight:800;">${prev2}</span>
        <span style="color:#94a3b8;">+</span>
        <span style="color: #34d399; font-weight:800;">${prev1}</span>
        <span style="color:#94a3b8;">=</span>
        <span style="color: #60a5fa; font-weight: 900; font-size: 17px;">${result}</span>
      </div>
      <div style="font-size: 11px; color: #94a3b8;">
        读取 <span style="color:#fbbf24;">前两项 dp[${currentIdx - 2}]=${prev2}</span> 与
        <span style="color:#34d399;">前一项 dp[${currentIdx - 1}]=${prev1}</span>，求和填入当前格。
      </div>
    `;
  }

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 14px; box-sizing: border-box; position: relative;">
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 0;">
        <svg class="fib-arc-svg" style="width: 100%; height: 70px; overflow: visible; flex-shrink: 0;"></svg>
        ${indexRow}
        ${valueRow}
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; background: rgba(0,0,0,0.35); border: 1px solid rgba(251,191,36,0.25); border-radius: 12px; padding: 12px 20px; width: fit-content; font-family: 'JetBrains Mono', Consolas, monospace; transition: all 0.3s ease;">
        ${formulaCard}
      </div>
    </div>
  `;

  drawDependencyArcs(container, step, currentIdx);
}

/** 依赖格 -> 当前格 的弧线箭头（挂载后按实测位置绘制） */
function drawDependencyArcs(container: HTMLElement, step: FibEvolutionStep, currentIdx: number): void {
  const svg = container.querySelector<SVGSVGElement>('.fib-arc-svg');
  const row = container.querySelector<HTMLElement>('.fib-dp-row');
  if (!svg || !row) return;

  const deps = step.dependencies || [];
  if (currentIdx < 2 || deps.length === 0) {
    svg.style.height = '20px';
    return;
  }

  const cellMap = new Map<number, HTMLElement>();
  row.querySelectorAll<HTMLElement>('.fib-dp-cell[data-idx]').forEach((c) => {
    cellMap.set(Number(c.dataset.idx), c);
  });

  const currentCell = cellMap.get(currentIdx);
  if (!currentCell) return;

  const svgRect = svg.getBoundingClientRect();
  const getCellCenterX = (cell: HTMLElement): number => {
    const r = cell.getBoundingClientRect();
    return r.left + r.width / 2 - svgRect.left;
  };

  const targetX = getCellCenterX(currentCell);
  const svgH = 70;
  const arrowY = svgH - 4;

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const makeMarker = (id: string, color: string): void => {
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', id);
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('refX', '6');
    marker.setAttribute('refY', '4');
    marker.setAttribute('orient', 'auto');
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', '0 1, 7 4, 0 7');
    poly.setAttribute('fill', color);
    marker.appendChild(poly);
    defs.appendChild(marker);
  };
  makeMarker('fib-arc-arrow-amber', '#fbbf24');
  makeMarker('fib-arc-arrow-emerald', '#34d399');
  svg.appendChild(defs);

  const sortedDeps = [...deps].filter((d) => d.index != null).sort((a, b) => a.index! - b.index!);

  sortedDeps.forEach((dep, dIdx) => {
    const depCell = cellMap.get(dep.index!);
    if (!depCell) return;

    const sourceX = getCellCenterX(depCell);
    const distance = Math.abs(currentIdx - dep.index!);
    const arcPeak = arrowY - (distance === 2 ? 52 : 30);

    const color = distance === 2 ? '#fbbf24' : '#34d399';
    const markerId = distance === 2 ? 'fib-arc-arrow-amber' : 'fib-arc-arrow-emerald';

    const midX = (sourceX + targetX) / 2;
    const d = `M ${sourceX} ${arrowY} Q ${midX} ${arcPeak} ${targetX} ${arrowY}`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2.2');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', `url(#${markerId})`);
    path.setAttribute('opacity', '0.85');
    svg.appendChild(path);

    const labelX = midX + (distance === 2 ? -8 : 8);
    const labelY = arcPeak + 14;
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', String(labelX));
    label.setAttribute('y', String(labelY));
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('font-size', '11');
    label.setAttribute('font-weight', '700');
    label.setAttribute('font-family', 'JetBrains Mono, Consolas, monospace');
    label.setAttribute('fill', color);
    label.textContent = `dp[${dep.index}]`;
    svg.appendChild(label);
  });
}

/* ═══════════════════ 模式四：空间滚动压缩 ═══════════════════ */

function renderRollingVars(container: HTMLElement, step: FibEvolutionStep): void {
  const vars = step.rollingVars;
  if (!vars) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">暂无滚动变量</div>';
    return;
  }

  const highlight = step.codeLine === 6 || (Array.isArray(step.codeLine) && step.codeLine.includes(6));

  const card = (label: string, value: number | string, color: string, glow: boolean): string => `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 96px; padding: 14px 10px; border-radius: 14px; background: ${glow ? 'rgba(251,191,36,0.12)' : 'rgba(0,0,0,0.35)'}; border: 2px solid ${glow ? '#fbbf24' : 'rgba(148,163,255,0.25)'}; box-shadow: ${glow ? '0 0 18px rgba(251,191,36,0.3)' : 'none'}; transition: all 0.3s ease; box-sizing: border-box;">
      <div style="font-size: 11px; font-weight: 800; color: ${color};">${label}</div>
      <div style="font-size: 22px; font-weight: 900; color: #e2e8f0; font-family: 'JetBrains Mono', Consolas, monospace;">${value}</div>
    </div>
  `;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 14px; box-sizing: border-box;">
      <div style="font-size: 11px; font-weight: 700; color: #94a3b8;">滚动窗口（常数空间 O(1)，只保留最近两项）</div>
      <div style="display: flex; gap: 14px; align-items: center;">
        ${card('prev2 (i-2)', vars.prev2, '#fbbf24', highlight)}
        <span style="color: #64748b; font-size: 18px; font-weight: 800;">＋</span>
        ${card('prev1 (i-1)', vars.prev1, '#34d399', highlight)}
        <span style="color: #64748b; font-size: 18px; font-weight: 800;">➔</span>
        ${card('curr (i)', vars.curr, '#60a5fa', true)}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm<FibEvolutionStep>({
  id: 'fibonacci',
  name: '斐波那契数',
  category: 'dynamic-programming',
  description: '自顶向下到自底向上 4 阶段演化：1. 朴素递归 ➔ 2. 记忆化搜索 ➔ 3. 递推填表 ➔ 4. 空间滚动压缩',
  icon: '🔢',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解从自顶向下递归分治一步步演化到常数空间滚动动态规划的全部思维脉络',
  modes: EVOLUTION_MODES.map((m) => ({ id: m.id, label: m.label })),
  stages: [
    {
      id: 'main',
      name: '斐波那契演化',
      shortName: '演化',
      codeLanguages: FIB_EVOLUTION_CODES['naive-recursive'].languages,
      modeCodeLanguages: Object.fromEntries(
        EVOLUTION_MODES.map((m) => [m.id, FIB_EVOLUTION_CODES[m.id].languages])
      ) as Record<string, Record<string, string[]>>,
    },
  ],
  inputs: [
    {
      id: 'n',
      label: '计算的项 n',
      type: 'number',
      defaultValue: '6',
      placeholder: '1 - 12',
    },
  ],
  presets: [
    { label: 'n = 6', values: { n: '6' } },
    { label: 'n = 8', values: { n: '8' } },
    { label: 'n = 10', values: { n: '10' } },
    { label: 'n = 12', values: { n: '12' } },
  ],
  metrics: [
    { id: 'i', label: '当前项 i', color: '#60a5fa' },
    { id: 'answer', label: '当前答案', color: '#6ee7b7' },
    { id: 'calls', label: '递归调用数', color: '#fbbf24' },
    { id: 'hits', label: '记忆化命中', color: '#a855f7' },
    { id: 'prev2', label: 'prev2 (i-2)', color: '#fbbf24' },
    { id: 'prev1', label: 'prev1 (i-1)', color: '#34d399' },
    { id: 'status', label: '阶段状态', color: '#2563eb' },
  ],
  legend: [
    { label: '当前计算格', color: '#60a5fa' },
    { label: '依赖项', color: '#fbbf24' },
    { label: '已计算', color: '#34d399' },
  ],
  generateSteps: (inputs, mode) => {
    let n = parseInt(String(inputs.n ?? '6'), 10);
    if (!Number.isFinite(n)) n = 6;
    n = Math.max(1, Math.min(12, n));
    return buildEvolutionSteps(n, (mode as EvolutionModeId) || 'naive-recursive');
  },
  renderCanvas: (container, step) => renderFibonacciCanvas(container, step as FibEvolutionStep),
});
