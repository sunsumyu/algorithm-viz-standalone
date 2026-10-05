/**
 * 找树左下角的值视觉呈现深模块适配器 (BottomLeftCanvasAdapter)
 * 深度模块 (Deep Module): 封装 Card 1 树拓扑与左下角常驻高亮、
 * Card 2 四格指标、递归调用推演栈、以及 BFS 队列监视器
 * 遵循 Matt Pocock 深模块规范与 Zero-Subbox 表现层契约
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { RecursiveCallTraceAdapter, RecursiveCallTraceSnapshot } from './recursive-call-trace-adapter';

export interface BottomLeftStepPresentation {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  maxDepth: number;
  bottomLeft: number | null;
  message: string;
  decision: string;
  stageId?: string;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };
  visitedNodes?: number[];
  secondaryHighlightedNodes?: number[];
  queueState?: number[];
  callTrace?: RecursiveCallTraceSnapshot;
}

export class BottomLeftCanvasAdapter {
  /**
   * Card 1: 树拓扑画布呈现
   */
  public static renderCanvas(
    container: HTMLElement,
    step: BottomLeftStepPresentation
  ): void {
    if (step.tree) {
      const isDone = step.decision.includes('完成') || step.decision.includes('结束') || step.decision.includes('排空') || step.statusBadge?.type === 'success';
      let current = step.current;
      let visitedNodes = step.visitedNodes;
      const secondaryHighlightedNodes = step.secondaryHighlightedNodes || (step.bottomLeft != null ? [step.bottomLeft] : []);

      if (isDone && current === null) {
        current = step.tree.val;
      }

      TreeCanvasAdapter.renderTree(container, {
        tree: step.tree,
        current,
        visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
        secondaryHighlightedNodes: secondaryHighlightedNodes.length > 0 ? secondaryHighlightedNodes : [],
        primaryColor: '#fbbf24',
        secondaryColor: '#10b981',
        visitedColor: '#34d399',
      });
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树 (Null)</text>
          </svg>
          <span style="font-size: 11px; color: #64748b; margin-top: 8px;">空树无任何节点，左下角值为空</span>
        </div>
      `;
    }
  }

  /**
   * Card 2: 表现层自定义指标与推演栈渲染器
   */
  public static renderCustomMetrics(
    container: HTMLElement,
    step: BottomLeftStepPresentation
  ): void {
    if (!container) return;
    container.innerHTML = '';
    container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

    // 1. 顶部 4 格关键指标
    const statsRow = document.createElement('div');
    statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
    statsRow.innerHTML = `
      <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
        <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">考察节点</span>
        <span class="text-amber-300 font-mono font-bold text-sm mt-0.5 truncate">${step.current != null ? `Node(${step.current})` : '-'}</span>
      </div>
      <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
        <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">当前深度</span>
        <span class="text-blue-300 font-mono font-bold text-sm mt-0.5 truncate">${step.depth}</span>
      </div>
      <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
        <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">最深纪录</span>
        <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${step.maxDepth >= 0 ? step.maxDepth : '-'}</span>
      </div>
      <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
        <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">锁定左下角</span>
        <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.bottomLeft != null ? `Node(${step.bottomLeft})` : '-'}</span>
      </div>
    `;
    container.appendChild(statsRow);

    // 2. 核心状态展示区：Stage 1 为递归推演栈，Stage 2/3 为 BFS 队列监视器
    if (step.stageId === 'stage-1' && step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
        title: '🌲 先序先登 DFS 递归调用推演栈 (LC 513)',
        maxHeight: '100%',
      });
      container.appendChild(traceBox);
    } else if (step.queueState && step.queueState.length >= 0) {
      const queueBox = document.createElement('div');
      queueBox.className = 'flex-1 min-h-0 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';

      const queueHeader = document.createElement('div');
      queueHeader.className = 'flex items-center justify-between text-slate-400 text-[11px] font-semibold';
      queueHeader.innerHTML = `
        <span>📦 BFS 队列状态 (队首 ➔ 队尾)</span>
        <span class="text-slate-500 font-mono">Size: ${step.queueState.length}</span>
      `;
      queueBox.appendChild(queueHeader);

      const queueRow = document.createElement('div');
      queueRow.className = 'flex flex-wrap gap-2 items-center';

      if (step.queueState.length === 0) {
        queueRow.innerHTML = `<span class="text-slate-500 italic text-xs">(队列为空)</span>`;
      } else {
        step.queueState.forEach((v, idx) => {
          const isHead = idx === 0;
          const slot = document.createElement('div');
          slot.className = `px-2.5 py-1.5 rounded border font-mono text-xs font-bold transition-all ${
            isHead
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/10'
              : 'bg-slate-800/80 border-slate-700 text-slate-300'
          }`;
          slot.innerHTML = `<span>Node(${v})</span>${isHead ? '<span class="text-[9px] text-amber-300 ml-1 font-normal">(首)</span>' : ''}`;
          queueRow.appendChild(slot);
        });
      }
      queueBox.appendChild(queueRow);
      container.appendChild(queueBox);
    }

    // 3. 当前操作动作与决策总结
    const isDone = step.decision.includes('完成') || step.decision.includes('结束') || step.decision.includes('排空') || step.statusBadge?.type === 'success';
    const summaryBox = document.createElement('div');
    summaryBox.className = `p-2.5 rounded-lg border text-xs leading-relaxed ${
      isDone ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-slate-800/50 border-slate-700/40 text-slate-300'
    }`;
    summaryBox.innerHTML = `
      <div class="font-bold mb-1 ${isDone ? 'text-emerald-400' : 'text-cyan-400'}">⚡ 当前决策: ${step.decision}</div>
      <div class="text-slate-400">${step.message}</div>
    `;
    container.appendChild(summaryBox);
  }
}
