/**
 * Class 037: 二叉树序列化与反序列化表现层适配器
 * 树画布沙盘与 Tokens 传送带/推演树呈现
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import {
  SerializeStep,
  collectTreeValues,
} from './tree-serialization-037-step-compiler';

// =========================================================================
// 表现层渲染器 (Card 1: 真实 SVG 二叉树沙盘)
// =========================================================================
export function renderSerializationCanvas(container: HTMLElement, step: SerializeStep): void {
  if (!container) return;

  if (step.tree) {
    const isDone =
      step.decision.includes('成功') ||
      step.decision.includes('完毕') ||
      step.decision.includes('定理得证');
    const allVals = collectTreeValues(step.tree);
    const currentVal =
      step.currentNode !== null && step.currentNode !== '#' ? Number(step.currentNode) : null;

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: currentVal !== null ? currentVal : (isDone ? step.tree.val : null),
      visitedNodes: isDone ? allVals : step.visitedNodes || step.constructedNodes,
      secondaryHighlightedNodes: step.secondaryHighlightedNodes || step.highlightedNodes || [],
      primaryColor: isDone ? '#fbbf24' : '#38bdf8',
      secondaryColor: '#34d399',
      visitedColor: '#10b981',
    });
  } else {
    // 反序列化初始未建树时的优雅占位
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; background: #ffffff; border-radius: 8px;">
        <svg width="220" height="120" viewBox="0 0 220 120">
          <circle cx="110" cy="50" r="26" fill="#eff6ff" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="110" y="55" text-anchor="middle" font-size="11" fill="#0284c7" font-weight="bold">等待反向建树...</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">自右向左消费 Tokens，先建根，再建右子树，再建左子树</span>
      </div>
    `;
  }
}

// =========================================================================
// 表现层自定义指标与推演树渲染器 (Card 2: Tokens 传送带与调用栈)
// =========================================================================
export function renderSerializationCard2(container: HTMLElement, step: SerializeStep): void {
  if (!container) return;
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 维指标看板
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">演进阶段</span>
      <span class="text-amber-300 font-mono font-bold text-xs mt-0.5 truncate">${step.stageId || 'Stage 1'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">消费 Token</span>
      <span class="text-blue-300 font-mono font-bold text-xs mt-0.5 truncate">${step.currentNode ?? '—'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">已建节点数</span>
      <span class="text-emerald-300 font-mono font-bold text-xs mt-0.5 truncate">${step.constructedNodes.length}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">流长度</span>
      <span class="text-purple-300 font-mono font-bold text-xs mt-0.5 truncate">${step.tokenStream.length}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. Tokens 传送带沙盘
  const conveyorCard = document.createElement('div');
  conveyorCard.className = 'bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1.5 flex-shrink-0';
  conveyorCard.innerHTML = `
    <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
      <span>📦 Token 字符串流传送带 (Tokens Pipeline)</span>
      <span class="text-[10px] text-slate-500 font-mono">active: #${step.activeTokenIndex}</span>
    </div>
  `;

  const pillsBox = document.createElement('div');
  pillsBox.className = 'flex gap-1.5 overflow-x-auto py-1 items-center';
  step.tokenStream.forEach((tok, idx) => {
    const isActive = idx === step.activeTokenIndex;
    const isConsumed = step.mode === 'deserialize' ? idx > step.activeTokenIndex : idx < step.activeTokenIndex;
    const pill = document.createElement('div');
    pill.className = `flex flex-col items-center justify-center px-2 py-1 min-w-[32px] rounded border font-mono text-xs font-bold transition-all ${
      isActive
        ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm shadow-sky-500/20'
        : isConsumed
        ? 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60'
        : tok === '#'
        ? 'bg-amber-500/10 border-amber-600/40 text-amber-300'
        : 'bg-slate-800/80 border-slate-700 text-slate-300'
    }`;
    pill.innerHTML = `<span>${tok}</span><span class="text-[8px] font-normal opacity-70">#${idx}</span>`;
    pillsBox.appendChild(pill);
  });
  conveyorCard.appendChild(pillsBox);
  container.appendChild(conveyorCard);

  // 3. 递归推演树 (Figure 1 拓扑规范适配器)
  if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
      title: '🌳 后序逆向建树推演跟踪树 (Call Trace)',
      maxHeight: '100%',
    });
    container.appendChild(traceBox);
  }
}
