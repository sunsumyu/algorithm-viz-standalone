/**
 * 求根节点到叶节点数字之和 (Sum Root to Leaf Numbers · LeetCode 129) 视觉与监控适配器
 * Card 1: 树拓扑与已完成路径高亮
 * Card 2: 4 格 KPI 指标 + 路径清单 + BFS 双队列/显式栈监视器
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { collectTreeValues } from './sum-root-to-leaf-step-compiler';
import type { SumNumbersStep, TreeNodeData } from './sum-root-to-leaf-step-compiler';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';

export function renderSumNumbersCanvas(container: HTMLElement, step: SumNumbersStep): void {
  const { nodes, currentNodeId, activePathNodeIds, completedPaths, totalSum, tree, queueState, stackState } = step;

  if (tree) {
    const isDone = step.decision.includes('完成') || step.decision.includes('结束') || step.statusBadge?.type === 'success';
    const allTreeVals = collectTreeValues(tree);
    let current = currentNodeId;
    let visitedNodes = step.visitedNodes;
    let highlightedNodes = activePathNodeIds;

    if (isDone) {
      if (current === null && tree) current = tree.val;
      if (!visitedNodes || visitedNodes.length === 0) visitedNodes = allTreeVals;
      if (!highlightedNodes || highlightedNodes.length === 0) highlightedNodes = allTreeVals;
    }

    TreeCanvasAdapter.renderTree(container, {
      tree,
      current,
      visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
      highlightedNodes: highlightedNodes && highlightedNodes.length > 0 ? highlightedNodes : undefined,
      primaryColor: '#f59e0b',
      secondaryColor: '#38bdf8',
      visitedColor: '#34d399',
    });
  } else if (nodes && nodes.length > 0) {
    const linesSvg: string[] = [];
    const nodesSvg: string[] = [];
    const nodeMap = new Map<number, TreeNodeData>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    for (const node of nodes) {
      if (node.leftId !== null) {
        const left = nodeMap.get(node.leftId);
        if (left) {
          const isPathActive = activePathNodeIds.includes(node.id) && activePathNodeIds.includes(left.id);
          linesSvg.push(
            `<line x1="${node.x}" y1="${node.y}" x2="${left.x}" y2="${left.y}" ` +
              `stroke="${isPathActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}" ` +
              `stroke-width="${isPathActive ? 3.5 : 1.8}" stroke-linecap="round" />`
          );
        }
      }
      if (node.rightId !== null) {
        const right = nodeMap.get(node.rightId);
        if (right) {
          const isPathActive = activePathNodeIds.includes(node.id) && activePathNodeIds.includes(right.id);
          linesSvg.push(
            `<line x1="${node.x}" y1="${node.y}" x2="${right.x}" y2="${right.y}" ` +
              `stroke="${isPathActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}" ` +
              `stroke-width="${isPathActive ? 3.5 : 1.8}" stroke-linecap="round" />`
          );
        }
      }
    }

    for (const node of nodes) {
      const isCurrent = node.id === currentNodeId;
      const inActivePath = activePathNodeIds.includes(node.id);
      const isLeaf = node.leftId === null && node.rightId === null;

      let fillColor = 'rgba(30, 41, 59, 0.85)';
      let strokeColor = 'rgba(148, 163, 184, 0.4)';
      let strokeWidth = 1.5;

      if (isCurrent) {
        fillColor = 'rgba(245, 158, 11, 0.3)';
        strokeColor = '#f59e0b';
        strokeWidth = 3;
      } else if (inActivePath) {
        fillColor = 'rgba(56, 189, 248, 0.25)';
        strokeColor = '#38bdf8';
        strokeWidth = 2.5;
      } else if (isLeaf) {
        fillColor = 'rgba(16, 185, 129, 0.15)';
        strokeColor = 'rgba(52, 211, 153, 0.5)';
      }

      nodesSvg.push(`
        <g transform="translate(${node.x}, ${node.y})">
          <circle r="18" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
          <text y="5" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="700" font-family="monospace">${node.val}</text>
          ${isLeaf ? `<text y="28" text-anchor="middle" fill="#34d399" font-size="9" font-family="sans-serif">Leaf</text>` : ''}
        </g>
      `);
    }

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
        <svg width="400" height="230" viewBox="40 10 360 210" style="max-width: 100%; height: auto;">
          ${linesSvg.join('\n')}
          ${nodesSvg.join('\n')}
        </svg>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 240px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树或初始化</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">准备自顶向下计算根到叶路径数字之和...</span>
      </div>
    `;
  }
}

/**
 * 表现层 Card 2 深度监视器 (Custom Metrics & State Monitor)
 * 彻底消除跨容器 DOM 污染，遵循声明式算法契约
 */
export function renderSumNumbersCustomMetrics(container: HTMLElement, step: SumNumbersStep): void {
  if (!container) return;
  container.innerHTML = '';
  container.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; gap:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex-shrink:0;';
  statsRow.innerHTML = `
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">考察节点</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#d97706; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.currentNodeId != null ? `Node(${step.currentNodeId})` : '—'}</div>
    </div>
    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">当前路径数值</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.metrics?.['当前路径值'] ?? '—'}</div>
    </div>
    <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#7e22ce; font-weight:700; text-transform:uppercase;">叶子路径数</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#9333ea; margin-top:2px;">${step.completedPaths ? step.completedPaths.length : 0}</div>
    </div>
    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#15803d; font-weight:700; text-transform:uppercase;">累计总和</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#16a34a; margin-top:2px;">${step.totalSum}</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 核心状态展示区：Stage 1 为递归推演栈，Stage 2 为 BFS 队列，Stage 3 为显式双栈
  if (step.stageId === 'stage-1' && step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.style.cssText = 'flex:1; min-height:120px; overflow:hidden; display:flex; flex-direction:column; border-radius:6px; border:1px solid #e2e8f0;';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
      title: '🌿 递归自顶向下累加推演栈 (LC 129)',
      theme: 'light',
      maxHeight: '100%',
      showTerminalHeader: true,
    });
    container.appendChild(traceBox);
  } else if (step.stageId === 'stage-2') {
    const queueBox = document.createElement('div');
    queueBox.style.cssText = 'flex:1; min-height:0; display:flex; flex-direction:column; gap:8px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:10px; overflow-y:auto;';
    const queueState = step.queueState || [];
    queueBox.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#475569;">
        <span>📦 BFS 节点与数值队列 (队首 ➔ 队尾)</span>
        <span style="font-family:ui-monospace,monospace; color:#64748b; font-size:10.5px;">Size: ${queueState.length}</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; min-height:26px; align-items:center;">
        ${queueState.length === 0 
          ? '<span style="color:#94a3b8; font-style:italic; font-size:11px;">(队列为空)</span>' 
          : queueState.map((q, i) => {
              const bg = i === 0 ? '#fffbeb' : '#f8fafc';
              const border = i === 0 ? '#fde68a' : '#cbd5e1';
              const color = i === 0 ? '#b45309' : '#334155';
              return `<span style="padding:3px 8px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700; background:${bg}; border:1px solid ${border}; color:${color};">[Node(${q.node}), sum=${q.sum}]${i === 0 ? ' (首)' : ''}</span>`;
            }).join('')}
      </div>
    `;
    container.appendChild(queueBox);
  } else if (step.stageId === 'stage-3') {
    const stackBox = document.createElement('div');
    stackBox.style.cssText = 'flex:1; min-height:0; display:flex; flex-direction:column; gap:8px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:10px; overflow-y:auto;';
    const stackState = step.stackState || [];
    stackBox.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#475569;">
        <span>🧱 显式迭代双栈 (栈顶 ➔ 栈底)</span>
        <span style="font-family:ui-monospace,monospace; color:#64748b; font-size:10.5px;">Depth: ${stackState.length}</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; min-height:26px; align-items:center;">
        ${stackState.length === 0 
          ? '<span style="color:#94a3b8; font-style:italic; font-size:11px;">(栈为空)</span>' 
          : stackState.map((s, i) => {
              const isTop = i === stackState.length - 1;
              const bg = isTop ? '#f0f9ff' : '#f8fafc';
              const border = isTop ? '#bae6fd' : '#cbd5e1';
              const color = isTop ? '#0284c7' : '#334155';
              return `<span style="padding:3px 8px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700; background:${bg}; border:1px solid ${border}; color:${color};">[Node(${s.node}), sum=${s.sum}]${isTop ? ' (顶)' : ''}</span>`;
            }).join('')}
      </div>
    `;
    container.appendChild(stackBox);
  }

  // 3. 已达成完整叶子路径列表
  if (step.completedPaths && step.completedPaths.length > 0) {
    const pathsBox = document.createElement('div');
    pathsBox.style.cssText = 'display:flex; flex-direction:column; gap:6px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; flex-shrink:0;';
    pathsBox.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; font-size:10.5px; font-weight:700; color:#475569; text-transform:uppercase;">
        <span>已达成完整叶子路径</span>
        <span style="font-family:ui-monospace,monospace; color:#15803d; font-weight:800;">${step.completedPaths.length} 条</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; max-height:64px; overflow-y:auto;">
        ${step.completedPaths.map((p) => `
          <span style="display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:4px; background:#f0fdf4; border:1px solid #bbf7d0; font-family:ui-monospace,monospace; font-size:11px; color:#15803d;">
            <span>${p.pathStr}:</span>
            <span style="font-weight:800; color:#d97706;">+${p.value}</span>
          </span>
        `).join('')}
      </div>
    `;
    container.appendChild(pathsBox);
  }

  // 4. 当前推演决策总结
  const isDone = step.decision.includes('完成') || step.decision.includes('结束') || (step.statusBadge?.type === 'success');
  const summaryBox = document.createElement('div');
  summaryBox.style.cssText = `padding:8px 10px; border-radius:6px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${isDone ? '#f0fdf4' : '#f8fafc'}; border:1px solid ${isDone ? '#bbf7d0' : '#e2e8f0'};`;
  summaryBox.innerHTML = `
    <div style="font-weight:700; margin-bottom:2px; color:${isDone ? '#15803d' : '#0284c7'};">⚡ 当前决策: ${step.decision}</div>
    <div style="color:#64748b; font-size:11px;">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================

export class SumRootToLeafCanvasAdapter {
  public static renderCanvas = renderSumNumbersCanvas;
  public static renderCustomMetrics = renderSumNumbersCustomMetrics;
}
