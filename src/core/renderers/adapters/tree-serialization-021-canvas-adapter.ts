/**
 * Tree Serialization (Class 021) Canvas Adapter
 * 双二叉树同构对比沙盘与序列化流探针面板
 */

import {
  Tree021Node,
  Tree021Step,
  SAMPLE_TREE_NODES,
} from './tree-serialization-021-step-compiler';

// ============================================================
// 树绘制纯函数 (用于渲染 Source 树与 Reconstructed 树)
// ============================================================
export function renderTreeSvg(
  nodes: Tree021Node[],
  activeId: number | undefined,
  offsetX: number,
  baseColor: string,
  label: string
): string {
  const nodeMap = new Map<number, Tree021Node>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const lines: string[] = [];
  const circles: string[] = [];

  nodes.forEach((n) => {
    const layout = SAMPLE_TREE_NODES[n.id];
    if (!layout) return;
    const x = layout.x + offsetX;
    const y = layout.y;

    if (n.left && nodeMap.has(n.left)) {
      const leftLayout = SAMPLE_TREE_NODES[n.left];
      if (leftLayout) {
        lines.push(`
          <line
            x1="${x}" y1="${y}"
            x2="${leftLayout.x + offsetX}" y2="${leftLayout.y}"
            stroke="${baseColor}" stroke-width="1.8" opacity="0.6"
          />
        `);
      }
    }
    if (n.right && nodeMap.has(n.right)) {
      const rightLayout = SAMPLE_TREE_NODES[n.right];
      if (rightLayout) {
        lines.push(`
          <line
            x1="${x}" y1="${y}"
            x2="${rightLayout.x + offsetX}" y2="${rightLayout.y}"
            stroke="${baseColor}" stroke-width="1.8" opacity="0.6"
          />
        `);
      }
    }

    const isActive = activeId === n.id;
    circles.push(`
      <g transform="translate(${x}, ${y})">
        ${isActive ? `<circle r="24" fill="none" stroke="${baseColor}" stroke-width="3" opacity="0.6" class="animate-ping" />` : ''}
        <circle
          r="18"
          fill="${isActive ? baseColor : 'rgba(15, 23, 42, 0.85)'}"
          stroke="${baseColor}"
          stroke-width="${isActive ? 2.5 : 1.5}"
        />
        <text
          y="5"
          text-anchor="middle"
          fill="${isActive ? '#0f172a' : '#f8fafc'}"
          font-size="12"
          font-weight="bold"
          font-family="system-ui, sans-serif"
        >${n.val}</text>
      </g>
    `);
  });

  return `
    <g>
      <text x="${offsetX + 190}" y="20" text-anchor="middle" fill="${baseColor}" font-size="12" font-weight="bold" font-family="monospace">
        ${label} (${nodes.length} 节点)
      </text>
      ${lines.join('')}
      ${circles.join('')}
    </g>
  `;
}

// ============================================================
// Card 1: 双二叉树同构对比沙盘 (Clean SVG Dual Sandbox)
// 零内嵌公式卡片、零多余标题 (Anti-Traps 9 & 10)
// ============================================================
export function renderTreeSerializationCanvas(container: HTMLElement, step: Tree021Step): void {
  const { treeStructure, reconstructedTree, activeNodeId } = step;

  const leftTreeHtml = renderTreeSvg(treeStructure, activeNodeId, 0, '#38bdf8', '🌲 原始二叉树 (Source)');
  const rightTreeHtml = renderTreeSvg(reconstructedTree, activeNodeId, 390, '#34d399', '🌱 重建二叉树 (Reconstructed)');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; box-sizing: border-box;">
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); overflow: hidden;">
        <svg viewBox="0 0 780 230" style="width: 100%; height: 100%; max-height: 270px;" preserveAspectRatio="xMidYMid meet">
          <!-- 中轴分隔虚线 -->
          <line x1="390" y1="10" x2="390" y2="220" stroke="rgba(255, 255, 255, 0.12)" stroke-dasharray="4 4" stroke-width="1.5" />
          ${leftTreeHtml}
          ${rightTreeHtml}
        </svg>
      </div>
    </div>
  `;
}

// ============================================================
// Card 2: 序列化字符串流与反序列化队列探针 (Custom Metrics)
// ============================================================
export function renderTreeSerializationCard2(container: HTMLElement, step: Tree021Step): void {
  const { tokensStream, currentToken, reconstructedTree, mode, decision } = step;

  const streamPills = tokensStream.map((t, idx) => {
    const isCurrent = idx === tokensStream.length - 1;
    const isNull = t === '#';
    return `
      <span style="
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 3px 8px;
        margin: 2px 4px;
        border-radius: 6px;
        font-family: monospace;
        font-size: 0.85rem;
        font-weight: bold;
        background: ${isCurrent ? '#38bdf8' : isNull ? 'rgba(148, 163, 184, 0.15)' : 'rgba(56, 189, 248, 0.15)'};
        color: ${isCurrent ? '#0f172a' : isNull ? '#94a3b8' : '#38bdf8'};
        border: 1px solid ${isCurrent ? '#ffffff' : isNull ? 'rgba(148, 163, 184, 0.3)' : 'rgba(56, 189, 248, 0.4)'};
        box-shadow: ${isCurrent ? '0 0 8px rgba(56, 189, 248, 0.6)' : 'none'};
      ">
        ${t}
      </span>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; padding: 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box; height: 100%;">
      
      <!-- 顶部四联仪表盘 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">序列化协议</div>
          <div style="font-size: 0.85rem; font-weight: bold; color: #38bdf8; margin-top: 2px;">
            ${mode.toUpperCase()}
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">当前 Token</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: ${currentToken === '#' ? '#94a3b8' : '#34d399'}; font-family: monospace; margin-top: 2px;">
            ${currentToken ?? '就绪'}
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">生成 Tokens 长度</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #a78bfa; font-family: monospace; margin-top: 2px;">
            ${tokensStream.length}
          </div>
        </div>
        <div style="padding: 8px; background: rgba(30, 41, 59, 0.6); border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="font-size: 0.7rem; color: #94a3b8;">已重建节点数</div>
          <div style="font-size: 0.95rem; font-weight: bold; color: #facc15; font-family: monospace; margin-top: 2px;">
            ${reconstructedTree.length} / 5
          </div>
        </div>
      </div>

      <!-- 序列化 Tokens 字符串流水线展板 -->
      <div style="padding: 10px 14px; background: rgba(2, 6, 23, 0.5); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; flex: 1; display: flex; flex-direction: column;">
        <div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; display: flex; justify-content: space-between;">
          <span>📦 序列化字符串流水线 (Tokens Stream)</span>
          <span style="font-size: 0.7rem; color: #94a3b8;">'#' 代表空节点 null</span>
        </div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center; overflow-y: auto; max-height: 80px;">
          ${streamPills || `<span style="font-size: 0.75rem; color: #64748b; font-style: italic;">等待序列化启动...</span>`}
        </div>
      </div>

      <!-- 唯一性数学准则与当前决策 -->
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <div style="padding: 8px 12px; background: rgba(56, 189, 248, 0.06); border-left: 3px solid #38bdf8; border-radius: 0 6px 6px 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
          <strong style="color: #38bdf8;">当前动作：</strong> ${decision}
        </div>
        <div style="padding: 6px 12px; background: rgba(52, 211, 153, 0.06); border-left: 3px solid #34d399; border-radius: 0 6px 6px 0; font-size: 0.72rem; color: #94a3b8; line-height: 1.4;">
          <strong style="color: #34d399;">唯一性定理：</strong> 补足空节点 '#' 标记后，先序序列具备与二叉树拓扑严格单射一一对应关系。
        </div>
      </div>
    </div>
  `;
}
