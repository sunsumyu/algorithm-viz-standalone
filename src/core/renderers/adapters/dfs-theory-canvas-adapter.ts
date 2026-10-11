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
            ? `<circle cx="${pos.x}" cy="${pos.y}" r="30" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 3" opacity="0.8">
                 <animateTransform attributeName="transform" type="rotate" from="0 ${pos.x} ${pos.y}" to="360 ${pos.x} ${pos.y}" dur="8s" repeatCount="indefinite" />
               </circle>`
            : ''
        }
        <circle cx="${pos.x}" cy="${pos.y}" r="24" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
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
  const { stack, traversalOrder, visited, depth } = step;

  // 递归调用栈块
  const stackItemsHtml =
    stack.length === 0
      ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">（递归栈当前为空）</span>'
      : stack
          .map((node, idx) => {
            const isTop = idx === stack.length - 1;
            return `
              <div style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-family: monospace; font-weight: 700; ${
                isTop
                  ? 'background: #f3e8ff; color: #6b21a8; border: 1.5px solid #a855f7; box-shadow: 0 1px 3px rgba(168, 85, 247, 0.15);'
                  : 'background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;'
              }">
                <span style="font-size: 9.5px; color: ${isTop ? '#9333ea' : '#64748b'};">#${idx + 1}</span>
                <span>Node ${node}</span>
                ${isTop ? '<span style="font-size: 8.5px; background: #eab308; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-weight: 800;">TOP</span>' : ''}
              </div>
            `;
          })
          .join('');

  // 访问顺序流水胶囊
  const orderItemsHtml =
    traversalOrder.length === 0
      ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">（尚未访问任何节点）</span>'
      : traversalOrder
          .map(
            (node, idx) => `
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 6px; font-size: 11px; font-family: monospace; font-weight: 700; background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7;">
                <span style="font-size: 9.5px; color: #059669; opacity: 0.8;">${idx + 1}.</span>
                <span>Node ${node}</span>
              </span>
            `
          )
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box;">
      <!-- 递归栈监视舱 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11.5px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #9333ea;"></span>
            调用栈状态 (Recursion Stack)
          </span>
          <span style="font-size: 11px; font-weight: 700; color: #7c3aed; font-family: monospace;">栈深度: ${depth}</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; items-center; gap: 5px; min-height: 32px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 6px; padding: 4px 8px; box-sizing: border-box;">
          ${stackItemsHtml}
        </div>
      </div>

      <!-- 遍历顺序流水 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11.5px; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #059669;"></span>
            访问序列 (Traversal Order)
          </span>
          <span style="font-size: 11px; font-weight: 700; color: #059669; font-family: monospace;">已访问: ${visited.size} / 6</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; items-center; gap: 5px; min-height: 32px; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 6px; padding: 4px 8px; box-sizing: border-box;">
          ${orderItemsHtml}
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

