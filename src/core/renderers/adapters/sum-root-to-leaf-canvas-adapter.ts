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
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 格关键指标
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">考察节点</span>
      <span class="text-amber-300 font-mono font-bold text-sm mt-0.5 truncate">${step.currentNodeId != null ? `Node(${step.currentNodeId})` : '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">当前路径数值</span>
      <span class="text-blue-300 font-mono font-bold text-sm mt-0.5 truncate">${step.metrics?.['当前路径值'] ?? '-'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">叶子路径数</span>
      <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${step.completedPaths ? step.completedPaths.length : 0}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">累计总和</span>
      <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.totalSum}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 核心状态展示区：Stage 1 为递归推演栈，Stage 2 为 BFS 队列，Stage 3 为显式双栈
  if (step.stageId === 'stage-1' && step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
      title: '🌿 递归自顶向下累加推演栈 (LC 129)',
      maxHeight: '100%',
    });
    container.appendChild(traceBox);
  } else if (step.stageId === 'stage-2') {
    const queueBox = document.createElement('div');
    queueBox.className = 'flex-1 min-h-0 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';
    const queueState = step.queueState || [];
    queueBox.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
        <span>📦 BFS 节点与数值队列 (队首 ➔ 队尾)</span>
        <span class="text-slate-500 font-mono">Size: ${queueState.length}</span>
      </div>
      <div class="flex flex-wrap gap-1.5 min-h-[26px]">
        ${queueState.length === 0 
          ? '<span class="text-slate-500 italic text-[11px]">(队列为空)</span>' 
          : queueState.map((q, i) => `<span class="px-2 py-1 rounded border font-mono text-xs ${i === 0 ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300'}">[Node(${q.node}), sum=${q.sum}]${i === 0 ? ' (首)' : ''}</span>`).join('')}
      </div>
    `;
    container.appendChild(queueBox);
  } else if (step.stageId === 'stage-3') {
    const stackBox = document.createElement('div');
    stackBox.className = 'flex-1 min-h-0 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';
    const stackState = step.stackState || [];
    stackBox.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
        <span>🧱 显式迭代双栈 (栈顶 ➔ 栈底)</span>
        <span class="text-slate-500 font-mono">Depth: ${stackState.length}</span>
      </div>
      <div class="flex flex-wrap gap-1.5 min-h-[26px]">
        ${stackState.length === 0 
          ? '<span class="text-slate-500 italic text-[11px]">(栈为空)</span>' 
          : stackState.map((s, i) => `<span class="px-2 py-1 rounded border font-mono text-xs ${i === stackState.length - 1 ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300'}">[Node(${s.node}), sum=${s.sum}]${i === stackState.length - 1 ? ' (顶)' : ''}</span>`).join('')}
      </div>
    `;
    container.appendChild(stackBox);
  }

  // 3. 已达成完整叶子路径列表
  if (step.completedPaths && step.completedPaths.length > 0) {
    const pathsBox = document.createElement('div');
    pathsBox.className = 'flex flex-col gap-1.5 bg-slate-900/40 border border-slate-800/80 rounded-lg p-2 flex-shrink-0';
    pathsBox.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[10px] font-semibold uppercase">
        <span>已达成完整叶子路径</span>
        <span class="text-emerald-400 font-mono font-bold">${step.completedPaths.length} 条</span>
      </div>
      <div class="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
        ${step.completedPaths.map((p) => `
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-700/60 font-mono text-xs text-emerald-300">
            <span>${p.pathStr}:</span>
            <span class="font-bold text-amber-300">+${p.value}</span>
          </span>
        `).join('')}
      </div>
    `;
    container.appendChild(pathsBox);
  }

  // 4. 当前推演决策总结
  const isDone = step.decision.includes('完成') || step.decision.includes('结束') || (step.statusBadge?.type === 'success');
  const summaryBox = document.createElement('div');
  summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed flex-shrink-0 ${
    isDone ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-slate-800/50 border-slate-700/40 text-slate-300'
  }`;
  summaryBox.innerHTML = `
    <div class="font-bold mb-1 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}">⚡ 当前决策: ${step.decision}</div>
    <div class="text-slate-400">${step.message}</div>
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
