/**
 * 深度优先搜索理论基础 (DFS Theory) — 领域视觉适配器
 * 遵循 Matt Pocock 深模块哲学：
 * Card 1: 100% 纯 SVG 图拓扑与遍历探针沙盘 (Zero Outer Div)
 * Card 2: 递归调用栈监视舱与序列诊断 (Recursion Stack & Order Monitor)
 */

import {
  type DFSStep,
  DFS_NODE_POSITIONS,
} from '../../../algorithms/categories/graph/dfs-theory-step-compiler';

export function renderDFSTheoryCanvas(container: HTMLElement, step: DFSStep): void {
  const { nodes, edges, visited, currentNode, currentEdge, stack } = step;
  const stackSet = new Set(stack);

  const width = 600;
  const height = 300;

  // 1. 边图元渲染
  let edgesSvg = '';
  for (const [u, v] of edges) {
    const p1 = DFS_NODE_POSITIONS[u];
    const p2 = DFS_NODE_POSITIONS[v];
    if (!p1 || !p2) continue;

    const isCurrentEdge =
      currentEdge !== null &&
      ((currentEdge[0] === u && currentEdge[1] === v) || (currentEdge[0] === v && currentEdge[1] === u));

    // 判断是否为递归栈上直接相邻的树边
    let isStackEdge = false;
    for (let i = 0; i < stack.length - 1; i++) {
      if (
        (stack[i] === u && stack[i + 1] === v) ||
        (stack[i] === v && stack[i + 1] === u)
      ) {
        isStackEdge = true;
        break;
      }
    }

    const stroke = isCurrentEdge
      ? '#f59e0b'
      : isStackEdge
      ? '#8b5cf6'
      : visited.has(u) && visited.has(v)
      ? '#10b981'
      : '#334155';

    const strokeWidth = isCurrentEdge ? 3.5 : isStackEdge ? 2.8 : 1.8;
    const strokeDash = isCurrentEdge ? 'stroke-dasharray="4 2"' : '';

    edgesSvg += `
      <line
        x1="${p1.x}" y1="${p1.y}"
        x2="${p2.x}" y2="${p2.y}"
        stroke="${stroke}"
        stroke-width="${strokeWidth}"
        ${strokeDash}
        stroke-linecap="round"
        opacity="${isCurrentEdge || isStackEdge ? '1' : '0.6'}"
      />
    `;
  }

  // 2. 节点图元渲染
  let nodesSvg = '';
  for (const u of nodes) {
    const pos = DFS_NODE_POSITIONS[u];
    if (!pos) continue;

    const isCurrent = currentNode === u;
    const isVisited = visited.has(u);
    const inStack = stackSet.has(u);

    const fillColor = isCurrent
      ? '#78350f'
      : inStack
      ? '#3b0764'
      : isVisited
      ? '#064e3b'
      : '#0f172a';

    const strokeColor = isCurrent
      ? '#f59e0b'
      : inStack
      ? '#a855f7'
      : isVisited
      ? '#10b981'
      : '#475569';

    const strokeWidth = isCurrent ? 3 : inStack ? 2.5 : 1.8;

    nodesSvg += `
      <g class="dfs-node-group">
        ${
          isCurrent
            ? `<circle cx="${pos.x}" cy="${pos.y}" r="28" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 3" opacity="0.8">
                 <animateTransform attributeName="transform" type="rotate" from="0 ${pos.x} ${pos.y}" to="360 ${pos.x} ${pos.y}" dur="8s" repeatCount="indefinite" />
               </circle>`
            : ''
        }
        <circle cx="${pos.x}" cy="${pos.y}" r="22" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
        <text x="${pos.x}" y="${pos.y + 6}" text-anchor="middle" fill="${isCurrent ? '#fef08a' : inStack ? '#e9d5ff' : '#f8fafc'}" font-size="15" font-weight="800" font-family="monospace">${u}</text>
        ${
          isCurrent
            ? `<text x="${pos.x}" y="${pos.y - 28}" text-anchor="middle" fill="#f59e0b" font-size="9" font-weight="800" font-family="sans-serif">● 当前光标</text>`
            : inStack
            ? `<text x="${pos.x}" y="${pos.y - 28}" text-anchor="middle" fill="#c084fc" font-size="8.5" font-weight="700" font-family="sans-serif">栈帧深度 ${stack.indexOf(u) + 1}</text>`
            : isVisited
            ? `<text x="${pos.x}" y="${pos.y - 28}" text-anchor="middle" fill="#34d399" font-size="8.5" font-weight="700" font-family="sans-serif">✓ 已访问</text>`
            : ''
        }
      </g>
    `;
  }

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-full select-none" style="max-height: 320px;" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="dfs-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <!-- 背景网格引导 -->
      <g opacity="0.1">
        <line x1="0" y1="135" x2="${width}" y2="135" stroke="#94a3b8" stroke-dasharray="2 4" />
        <line x1="0" y1="235" x2="${width}" y2="235" stroke="#94a3b8" stroke-dasharray="2 4" />
      </g>
      <!-- 边连线层 -->
      <g class="dfs-edges-layer">
        ${edgesSvg}
      </g>
      <!-- 顶点图元层 -->
      <g class="dfs-nodes-layer">
        ${nodesSvg}
      </g>
    </svg>
  `;
}

export function renderDFSTheoryCustomMetrics(container: HTMLElement, step: DFSStep): void {
  const { stack, traversalOrder, visited, action, depth } = step;

  // 递归调用栈块
  const stackItemsHtml =
    stack.length === 0
      ? '<span class="text-xs text-slate-500 italic">（递归栈当前为空）</span>'
      : stack
          .map((node, idx) => {
            const isTop = idx === stack.length - 1;
            return `
              <div class="px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 ${
                isTop
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-sm shadow-purple-900/40'
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
              }">
                <span class="text-[10px] text-slate-400">#${idx + 1}</span>
                <span>Node ${node}</span>
                ${isTop ? '<span class="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded">TOP</span>' : ''}
              </div>
            `;
          })
          .join('');

  // 访问顺序流水胶囊
  const orderItemsHtml =
    traversalOrder.length === 0
      ? '<span class="text-xs text-slate-500 italic">（尚未访问任何节点）</span>'
      : traversalOrder
          .map(
            (node, idx) => `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                <span class="text-[9px] opacity-60">${idx + 1}.</span>
                <span>${node}</span>
              </span>
            `
          )
          .join('');

  container.innerHTML = `
    <div class="w-full flex flex-col gap-3 p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl text-xs">
      <!-- 递归栈监视舱 -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-purple-400"></span>
            调用栈状态 (Recursion Stack)
          </span>
          <span class="text-[10px] font-mono text-purple-300">当前深度: ${depth}</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 min-h-[38px]">
          ${stackItemsHtml}
        </div>
      </div>

      <!-- 遍历顺序流水 -->
      <div class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            访问序列 (Traversal Order)
          </span>
          <span class="text-[10px] font-mono text-emerald-300">已访: ${visited.size} / 6</span>
        </div>
        <div class="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 min-h-[38px]">
          ${orderItemsHtml}
        </div>
      </div>

      <!-- 核心指标状态汇总 -->
      <div class="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
        <div class="p-1.5 rounded bg-slate-800/40 text-center">
          <div class="text-slate-400 text-[10px]">当前动作</div>
          <div class="font-mono font-bold text-amber-400 uppercase">${action}</div>
        </div>
        <div class="p-1.5 rounded bg-slate-800/40 text-center">
          <div class="text-slate-400 text-[10px]">递归栈深度</div>
          <div class="font-mono font-bold text-purple-400">${depth}</div>
        </div>
        <div class="p-1.5 rounded bg-slate-800/40 text-center">
          <div class="text-slate-400 text-[10px]">已覆盖顶点</div>
          <div class="font-mono font-bold text-emerald-400">${visited.size} / 6</div>
        </div>
      </div>
    </div>
  `;
}

export class DFSTheoryCanvasAdapter {
  mount(container: HTMLElement): void {
    container.innerHTML = '';
  }

  updateStep(container: HTMLElement, step: unknown): void {
    const dfsStep = step as DFSStep;
    if (!dfsStep) return;
    renderDFSTheoryCanvas(container, dfsStep);
  }

  dispose(container: HTMLElement): void {
    container.innerHTML = '';
  }
}

