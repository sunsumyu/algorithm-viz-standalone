/**
 * 二叉树的所有路径 (Binary Tree Paths · LeetCode 257) 拓扑画布与看板呈现适配器
 *
 * 遵循深模块架构：
 *   - 委托 TreeCanvasAdapter 进行二叉树拓扑绘制与焦点、路径高亮
 *   - 委托 RecursiveCallTraceAdapter 挂载 Stage 1 显式回溯调用栈
 *   - 为 Stage 2 纯函数参数流与 Stage 3 BFS 双队列提供暗色科技感看板呈现
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { AllPathsStep, collectTreeValues } from './all-paths-step-compiler';

export function renderAllPathsCanvas(container: HTMLElement, step: AllPathsStep): void {
  if (step.tree) {
    const isDone = step.decision.includes('完成') || step.decision.includes('结束') || (step.statusBadge?.type === 'success');
    const allTreeVals = collectTreeValues(step.tree);
    let current = step.current;
    let visitedNodes = step.visitedNodes;
    let highlightedNodes = step.secondaryHighlightedNodes || step.highlightedNodes || step.path;

    if (isDone) {
      if (current === null) {
        current = step.tree.val;
      }
      if (!visitedNodes || visitedNodes.length === 0) {
        visitedNodes = allTreeVals;
      }
      if (!highlightedNodes || highlightedNodes.length === 0) {
        highlightedNodes = allTreeVals;
      }
    }

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current,
      visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
      secondaryHighlightedNodes: highlightedNodes && highlightedNodes.length > 0 ? highlightedNodes : [],
      primaryColor: isDone ? '#fbbf24' : '#f59e0b',
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
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">空树无任何节点，路径集合为空</span>
      </div>
    `;
  }
}

export function renderAllPathsCustomMetrics(container: HTMLElement, step: AllPathsStep): void {
  if (!container) return;
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2.5 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 格关键指标
  const latestHarvested = step.metrics?.['最新收获路径'] as string | undefined;
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
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">已收集路径</span>
      <span class="text-emerald-300 font-mono font-bold text-sm mt-0.5 truncate">${step.allPaths.length} 条</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">最新收获路径</span>
      <span class="text-purple-300 font-mono font-bold text-sm mt-0.5 truncate">${latestHarvested || (step.allPaths.length > 0 ? step.allPaths[step.allPaths.length - 1] : '—')}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. 核心状态展示区：根据 Stage 差异化呈现
  if (step.stageId === 'stage-1') {
    // Stage 1: 路径栈槽位展示 + 递归调用推演栈
    const stage1Box = document.createElement('div');
    stage1Box.className = 'flex-1 min-h-0 flex flex-col gap-2 overflow-hidden';

    // 路径栈水平展示
    const pathStackCard = document.createElement('div');
    pathStackCard.className = 'flex-shrink-0 bg-slate-900/70 border border-slate-800 rounded-lg p-2 flex flex-col gap-1.5';
    pathStackCard.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
        <span>📚 动态路径栈 path (根 ➔ 当前节点)</span>
        <span class="text-slate-500 font-mono">栈深度: ${step.path.length}</span>
      </div>
    `;

    const pathSlots = document.createElement('div');
    pathSlots.className = 'flex flex-wrap items-center gap-1.5 min-h-[28px]';
    if (step.path.length === 0) {
      pathSlots.innerHTML = `<span class="text-slate-500 italic text-[11px]">(路径栈为空 [])</span>`;
    } else {
      step.path.forEach((val, idx) => {
        const isTop = idx === step.path.length - 1;
        const slot = document.createElement('div');
        slot.className = `flex items-center gap-1 px-2 py-1 rounded border font-mono text-xs font-bold transition-all ${
          isTop
            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/10'
            : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`;
        slot.innerHTML = `<span>${val}</span>${isTop ? '<span class="text-[9px] text-amber-400 font-normal ml-0.5">(栈顶)</span>' : ''}`;
        pathSlots.appendChild(slot);

        if (idx < step.path.length - 1) {
          const arrow = document.createElement('span');
          arrow.className = 'text-slate-600 font-bold text-[10px]';
          arrow.textContent = '➔';
          pathSlots.appendChild(arrow);
        }
      });
    }
    pathStackCard.appendChild(pathSlots);
    stage1Box.appendChild(pathStackCard);

    // 递归推演栈
    if (step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
        title: '🌲 显式回溯 DFS 递归推演栈 (LC 257)',
        maxHeight: '100%',
      });
      stage1Box.appendChild(traceBox);
    }
    container.appendChild(stage1Box);
  } else if (step.stageId === 'stage-2') {
    // Stage 2: 纯函数不可变字符串参数流监控
    const stage2Box = document.createElement('div');
    stage2Box.className = 'flex-1 min-h-0 flex flex-col gap-2 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';

    stage2Box.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
        <span>🧵 纯函数不可变字符串传递 (参数隔离机制)</span>
        <span class="text-blue-400 font-mono">天然隔离无回溯</span>
      </div>
      <div class="bg-slate-800/60 border border-slate-700/60 rounded p-2 flex flex-col gap-1">
        <span class="text-slate-400 text-[10px]">当前函数栈帧接收实参 path:</span>
        <span class="text-amber-300 font-mono text-xs font-bold break-all">${step.currentPathStr || '—'}</span>
      </div>
      <div class="flex flex-col gap-1 mt-1">
        <span class="text-slate-400 text-[10px] font-semibold">已收集完整路径集 paths:</span>
        <div class="flex flex-wrap gap-1.5">
          ${step.allPaths.length === 0 
            ? '<span class="text-slate-500 italic text-[11px]">(尚未到达叶子节点)</span>' 
            : step.allPaths.map((p, idx) => `<span class="bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded font-mono text-xs">#${idx + 1}: ${p}</span>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(stage2Box);
  } else if (step.stageId === 'stage-3') {
    // Stage 3: BFS 双队列 (节点队列 + 路径队列)
    const stage3Box = document.createElement('div');
    stage3Box.className = 'flex-1 min-h-0 flex flex-col gap-2.5 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 overflow-y-auto';

    const nodeQ = step.nodeQueueState || [];
    const pathQ = step.pathQueueState || [];

    stage3Box.innerHTML = `
      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
        <span>📦 BFS 节点队列 nodeQueue (队首 ➔ 队尾)</span>
        <span class="text-slate-500 font-mono">Size: ${nodeQ.length}</span>
      </div>
      <div class="flex flex-wrap gap-1.5 min-h-[26px]">
        ${nodeQ.length === 0 
          ? '<span class="text-slate-500 italic text-[11px]">(队列为空)</span>' 
          : nodeQ.map((v, i) => `<span class="px-2 py-1 rounded border font-mono text-xs font-bold ${i === 0 ? 'bg-amber-500/20 border-amber-400 text-amber-200' : 'bg-slate-800/80 border-slate-700 text-slate-300'}">Node(${v})${i === 0 ? ' (首)' : ''}</span>`).join('')}
      </div>

      <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold mt-1">
        <span>🛤️ BFS 路径队列 pathQueue (同步对应)</span>
        <span class="text-slate-500 font-mono">Size: ${pathQ.length}</span>
      </div>
      <div class="flex flex-wrap gap-1.5 min-h-[26px]">
        ${pathQ.length === 0 
          ? '<span class="text-slate-500 italic text-[11px]">(队列为空)</span>' 
          : pathQ.map((p, i) => `<span class="px-2 py-1 rounded border font-mono text-xs ${i === 0 ? 'bg-blue-500/20 border-blue-400 text-blue-200 font-bold' : 'bg-slate-800/80 border-slate-700 text-slate-300'}">"${p}"${i === 0 ? ' (首)' : ''}</span>`).join('')}
      </div>

      <div class="flex flex-col gap-1 mt-1 border-t border-slate-800/80 pt-2">
        <span class="text-slate-400 text-[10px] font-semibold">已收集路径集合 paths:</span>
        <div class="flex flex-wrap gap-1.5">
          ${step.allPaths.length === 0 
            ? '<span class="text-slate-500 italic text-[11px]">(尚未收获叶子路径)</span>' 
            : step.allPaths.map((p, idx) => `<span class="bg-emerald-950/40 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded font-mono text-xs">#${idx + 1}: ${p}</span>`).join('')}
        </div>
      </div>
    `;
    container.appendChild(stage3Box);
  }

  // 3. 当前操作动作与决策总结
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

export class AllPathsCanvasAdapter {
  public static renderCanvas = renderAllPathsCanvas;
  public static renderCustomMetrics = renderAllPathsCustomMetrics;
}
