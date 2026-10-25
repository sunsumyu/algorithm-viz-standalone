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
    container.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; gap:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

    // 1. 顶部 4 格关键指标
    const statsRow = document.createElement('div');
    statsRow.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex-shrink:0;';
    statsRow.innerHTML = `
      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">考察节点</div>
        <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#d97706; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.current != null ? `Node(${step.current})` : '—'}</div>
      </div>
      <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">当前深度</div>
        <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:2px;">${step.depth}</div>
      </div>
      <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#7e22ce; font-weight:700; text-transform:uppercase;">最深纪录</div>
        <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#9333ea; margin-top:2px;">${step.maxDepth >= 0 ? step.maxDepth : '—'}</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#15803d; font-weight:700; text-transform:uppercase;">锁定左下角</div>
        <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#16a34a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.bottomLeft != null ? `Node(${step.bottomLeft})` : '—'}</div>
      </div>
    `;
    container.appendChild(statsRow);

    // 2. 核心状态展示区：Stage 1 为递归推演栈，Stage 2/3 为 BFS 队列监视器
    if (step.stageId === 'stage-1' && step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.style.cssText = 'flex:1; min-height:120px; overflow:hidden; display:flex; flex-direction:column; border-radius:6px; border:1px solid #e2e8f0;';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
        title: '🌲 先序先登 DFS 递归调用推演栈 (LC 513)',
        theme: 'light',
        maxHeight: '100%',
        showTerminalHeader: true,
      });
      container.appendChild(traceBox);
    } else if (step.queueState && step.queueState.length >= 0) {
      const queueBox = document.createElement('div');
      queueBox.style.cssText = 'flex:1; min-height:0; display:flex; flex-direction:column; gap:8px; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:10px; overflow-y:auto;';

      const queueHeader = document.createElement('div');
      queueHeader.style.cssText = 'display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#475569;';
      queueHeader.innerHTML = `
        <span>📦 BFS 队列状态 (队首 ➔ 队尾)</span>
        <span style="font-family:ui-monospace,monospace; color:#64748b; font-size:10.5px;">Size: ${step.queueState.length}</span>
      `;
      queueBox.appendChild(queueHeader);

      const queueRow = document.createElement('div');
      queueRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px; align-items:center; min-height:28px;';

      if (step.queueState.length === 0) {
        queueRow.innerHTML = `<span style="color:#94a3b8; font-style:italic; font-size:11px;">(队列为空)</span>`;
      } else {
        step.queueState.forEach((v, idx) => {
          const isHead = idx === 0;
          const slot = document.createElement('div');
          const bg = isHead ? '#fffbeb' : '#f8fafc';
          const border = isHead ? '#fde68a' : '#cbd5e1';
          const color = isHead ? '#b45309' : '#334155';
          slot.style.cssText = `padding:3px 8px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700; background:${bg}; border:1px solid ${border}; color:${color}; transition:all 0.15s;`;
          slot.innerHTML = `<span>Node(${v})</span>${isHead ? '<span style="font-size:9px; color:#d97706; margin-left:3px; font-weight:normal;">(首)</span>' : ''}`;
          queueRow.appendChild(slot);
        });
      }
      queueBox.appendChild(queueRow);
      container.appendChild(queueBox);
    }

    // 3. 当前操作动作与决策总结
    const isDone = step.decision.includes('完成') || step.decision.includes('结束') || step.decision.includes('排空') || step.statusBadge?.type === 'success';
    const summaryBox = document.createElement('div');
    summaryBox.style.cssText = `padding:8px 10px; border-radius:6px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${isDone ? '#f0fdf4' : '#f8fafc'}; border:1px solid ${isDone ? '#bbf7d0' : '#e2e8f0'};`;
    summaryBox.innerHTML = `
      <div style="font-weight:700; margin-bottom:2px; color:${isDone ? '#15803d' : '#0284c7'};">⚡ 当前决策: ${step.decision}</div>
      <div style="color:#64748b; font-size:11px;">${step.message}</div>
    `;
    container.appendChild(summaryBox);
  }
}
