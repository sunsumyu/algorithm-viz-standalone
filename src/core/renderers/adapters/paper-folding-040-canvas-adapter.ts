/**
 * Paper Folding (Class 040) Canvas Adapter
 * 折纸沙盘与二叉树同构拓扑渲染器
 */

import {
  PaperFoldStep,
  TreeNodeLayout,
  buildTreeLayout,
} from './paper-folding-040-step-compiler';

// ============================================================
// Card 1: 纯净物理折纸与满二叉树同构沙盘 (Clean SVG Sandbox)
// 绝无内嵌标题、无子卡片套娃 (Anti-Traps 9 & 10)
// ============================================================
export function renderPaperFoldingCanvas(container: HTMLElement, step: PaperFoldStep): void {
  const n = step.maxLevels || 3;
  const treeNodes = step.treeNodes || buildTreeLayout(n);
  const creases = step.creaseList || [];
  const svgWidth = 800;
  const svgHeight = 240;

  // 生成树连接线 (SVG lines)
  const linesHtml: string[] = [];
  const nodeMap = new Map<string, TreeNodeLayout>();
  treeNodes.forEach((node) => nodeMap.set(node.id, node));

  treeNodes.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      const parent = nodeMap.get(node.parentId)!;
      const isHighlighted = step.activeNodeId === node.id || step.activeNodeId === parent.id;
      linesHtml.push(`
        <line
          x1="${parent.x}"
          y1="${parent.y}"
          x2="${node.x}"
          y2="${node.y}"
          stroke="${isHighlighted ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)'}"
          stroke-width="${isHighlighted ? 2.5 : 1.5}"
          stroke-dasharray="${node.type === 'down' ? 'none' : '4 3'}"
        />
      `);
    }
  });

  // 生成树节点 (SVG circles and texts)
  const nodesHtml = treeNodes.map((node) => {
    const isVisiting = step.activeNodeId === node.id;
    const isPrinted = node.status === 'printed';
    const isDown = node.type === 'down' || node.type === 'root';
    const baseColor = isDown ? '#38bdf8' : '#fb7185';
    const fillColor = isVisiting ? baseColor : isPrinted ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.8)';
    const strokeColor = isVisiting ? '#ffffff' : isPrinted ? baseColor : 'rgba(148, 163, 184, 0.4)';
    const textColor = isVisiting ? '#0f172a' : '#f1f5f9';

    return `
      <g transform="translate(${node.x}, ${node.y})">
        ${isVisiting ? `<circle r="22" fill="none" stroke="${baseColor}" stroke-width="3" opacity="0.6" class="animate-ping" />` : ''}
        <circle
          r="16"
          fill="${fillColor}"
          stroke="${strokeColor}"
          stroke-width="${isVisiting ? 3 : 2}"
        />
        <text
          y="4"
          text-anchor="middle"
          fill="${textColor}"
          font-size="11"
          font-weight="bold"
          font-family="system-ui, sans-serif"
        >${node.text.slice(0, 1)}</text>
        <text
          y="-22"
          text-anchor="middle"
          fill="${baseColor}"
          font-size="9"
          font-family="monospace"
        >${node.type === 'root' ? 'ROOT' : isDown ? '凹(L)' : '凸(R)'}</text>
      </g>
    `;
  }).join('');

  // 物理纸条折痕展开带展示 (Top -> Bottom 纵向纸条或横向展开带)
  const paperTapeHtml = creases.length === 0
    ? `<div style="color: #64748b; font-size: 0.82rem; font-style: italic; padding: 12px;">尚未产生折痕，启动中序遍历中...</div>`
    : creases.map((c, idx) => {
        const isDown = c.type === 'down';
        const isCurrent = idx === creases.length - 1 && (step.action === 'print' || step.action === 'enter');
        return `
          <div style="
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4px 10px;
            margin: 2px 4px;
            background: ${isDown ? 'rgba(14, 165, 233, 0.15)' : 'rgba(244, 63, 94, 0.15)'};
            border: 1px solid ${isCurrent ? '#ffffff' : isDown ? 'rgba(56, 189, 248, 0.4)' : 'rgba(251, 113, 133, 0.4)'};
            border-radius: 6px;
            box-shadow: ${isCurrent ? '0 0 10px rgba(56, 189, 248, 0.5)' : 'none'};
            transition: all 0.2s ease;
          ">
            <span style="font-size: 0.65rem; color: #94a3b8; font-family: monospace;">#${idx + 1}</span>
            <span style="font-size: 0.95rem; font-weight: bold; color: ${isDown ? '#38bdf8' : '#fb7185'};">${c.text}</span>
            <span style="font-size: 0.65rem; color: #64748b;">L${c.level}</span>
          </div>
        `;
      }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box;">
      
      <!-- 物理纸带空间展开展区 -->
      <div style="flex-shrink: 0; padding: 10px 14px; background: rgba(2, 6, 23, 0.55); border-radius: 8px; border: 1px dashed rgba(255, 255, 255, 0.12);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 0.78rem; font-weight: 600; color: #cbd5e1;">纸条物理展开折痕序列 (Top ➔ Bottom)</span>
          <span style="font-size: 0.72rem; color: #94a3b8; font-family: monospace;">已产出: <strong style="color: #38bdf8;">${creases.length}</strong> / ${Math.pow(2, n) - 1}</span>
        </div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; max-height: 90px; overflow-y: auto; align-items: center;">
          ${paperTapeHtml}
        </div>
      </div>

      <!-- 满二叉树中序遍历同构沙盘 -->
      <div style="flex: 1; min-height: 200px; display: flex; align-items: center; justify-content: center; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.06); position: relative; overflow: hidden;">
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width: 100%; height: 100%; max-height: 260px;" preserveAspectRatio="xMidYMid meet">
          ${linesHtml.join('')}
          ${nodesHtml}
        </svg>
      </div>
    </div>
  `;
}

// ============================================================
// Card 2: 折痕探针面板与中序数学同构规律 (Card 2 Custom Metrics)
// ============================================================
export function renderPaperFoldingCard2(container: HTMLElement, step: PaperFoldStep): void {
  const creases = step.creaseList || [];
  const downCount = creases.filter((c) => c.type === 'down').length;
  const upCount = creases.filter((c) => c.type === 'up').length;
  const totalTarget = Math.pow(2, step.maxLevels || 3) - 1;
  const stackFrames = step.stackFrames || [];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 14px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); box-sizing: border-box; height: 100%;">
      
      <!-- 三联核心数据看板 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        <div style="padding: 10px; background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #94a3b8;">折叠层数 / 目标</div>
          <div style="font-size: 1.15rem; font-weight: bold; color: #f8fafc; font-family: monospace; margin-top: 2px;">
            N = ${step.maxLevels} <span style="font-size: 0.75rem; color: #64748b;">(${totalTarget} 条)</span>
          </div>
        </div>
        <div style="padding: 10px; background: rgba(14, 165, 233, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #38bdf8;">凹折痕 (Down)</div>
          <div style="font-size: 1.15rem; font-weight: bold; color: #38bdf8; font-family: monospace; margin-top: 2px;">
            ${downCount} <span style="font-size: 0.72rem; color: #94a3b8;">(${totalTarget ? Math.round((downCount / totalTarget) * 100) : 0}%)</span>
          </div>
        </div>
        <div style="padding: 10px; background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(251, 113, 133, 0.3); border-radius: 8px;">
          <div style="font-size: 0.72rem; color: #fb7185;">凸折痕 (Up)</div>
          <div style="font-size: 1.15rem; font-weight: bold; color: #fb7185; font-family: monospace; margin-top: 2px;">
            ${upCount} <span style="font-size: 0.72rem; color: #94a3b8;">(${totalTarget ? Math.round((upCount / totalTarget) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      <!-- 显式调用栈或当前遍历状态 -->
      ${
        stackFrames.length > 0
          ? `
        <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="font-size: 0.75rem; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; display: flex; justify-content: space-between;">
            <span>显式调用栈帧 (Stack Frames)</span>
            <span style="font-size: 0.7rem; color: #94a3b8;">栈深: ${stackFrames.length}</span>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${stackFrames
              .map(
                (f, idx) => `
              <div style="padding: 3px 8px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 4px; font-size: 0.72rem; font-family: monospace;">
                #${idx + 1}: L${f.level} [${f.type === 'down' ? '凹' : '凸'}] <span style="color: #38bdf8;">${f.state}</span>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `
          : ''
      }

      <!-- 数学同构三大定则指示面板 -->
      <div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px;">
        <div style="padding: 8px 12px; background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; border-radius: 0 6px 6px 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
          <strong style="color: #38bdf8;">满二叉树同构：</strong> 根节点为凹，对折产生的新折痕中，左孩子必为凹，右孩子必为凸。
        </div>
        <div style="padding: 8px 12px; background: rgba(251, 113, 133, 0.08); border-left: 3px solid #fb7185; border-radius: 0 6px 6px 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
          <strong style="color: #fb7185;">中序遍历等价：</strong> 展开后从上至下的折痕出现顺序，严格对应二叉树左 ➔ 根 ➔ 右中序遍历。
        </div>
        <div style="padding: 8px 12px; background: rgba(52, 211, 153, 0.08); border-left: 3px solid #34d399; border-radius: 0 6px 6px 0; font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">
          <strong style="color: #34d399;">O(N) 空间优化：</strong> 无需物理构建 2^N - 1 节点树，直接借助单路递归栈打印，空间降至 O(N)。
        </div>
      </div>
    </div>
  `;
}
