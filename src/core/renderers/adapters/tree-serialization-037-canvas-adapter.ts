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
  container.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; gap:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

  // 1. 顶部 4 维指标看板
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex-shrink:0;';
  statsRow.innerHTML = `
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">演进阶段</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#d97706; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.stageId || 'Stage 1'}</div>
    </div>
    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">消费 Token</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.currentNode ?? '—'}</div>
    </div>
    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#15803d; font-weight:700; text-transform:uppercase;">已建节点数</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#16a34a; margin-top:2px;">${step.constructedNodes.length}</div>
    </div>
    <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#7e22ce; font-weight:700; text-transform:uppercase;">流长度</div>
      <div style="font-size:13px; font-weight:800; font-family:ui-monospace,monospace; color:#9333ea; margin-top:2px;">${step.tokenStream.length}</div>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. Tokens 传送带沙盘
  const conveyorCard = document.createElement('div');
  conveyorCard.style.cssText = 'background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; display:flex; flex-direction:column; gap:6px; flex-shrink:0;';
  conveyorCard.innerHTML = `
    <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; font-weight:700; color:#475569;">
      <span>📦 Token 字符串流传送带 (Tokens Pipeline)</span>
      <span style="font-family:ui-monospace,monospace; color:#64748b; font-size:10px;">active: #${step.activeTokenIndex}</span>
    </div>
  `;

  const pillsBox = document.createElement('div');
  pillsBox.style.cssText = 'display:flex; gap:6px; overflow-x:auto; padding:4px 0; align-items:center;';
  step.tokenStream.forEach((tok, idx) => {
    const isActive = idx === step.activeTokenIndex;
    const isConsumed = step.mode === 'deserialize' ? idx > step.activeTokenIndex : idx < step.activeTokenIndex;
    const pill = document.createElement('div');
    
    let bg = '#f8fafc';
    let border = '#cbd5e1';
    let color = '#334155';
    let opacity = '1';
    if (isActive) {
      bg = '#e0f2fe';
      border = '#38bdf8';
      color = '#0284c7';
    } else if (isConsumed) {
      bg = '#f1f5f9';
      border = '#e2e8f0';
      color = '#94a3b8';
      opacity = '0.6';
    } else if (tok === '#') {
      bg = '#fffbeb';
      border = '#fde68a';
      color = '#b45309';
    }

    pill.style.cssText = `display:flex; flex-direction:column; align-items:center; justify-content:center; padding:3px 8px; min-width:32px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700; background:${bg}; border:1px solid ${border}; color:${color}; opacity:${opacity}; transition:all 0.15s; flex-shrink:0;`;
    pill.innerHTML = `<span>${tok}</span><span style="font-size:8px; font-weight:normal; opacity:0.7;">#${idx}</span>`;
    pillsBox.appendChild(pill);
  });
  conveyorCard.appendChild(pillsBox);
  container.appendChild(conveyorCard);

  // 3. 递归推演树 (Figure 1 拓扑规范适配器)
  if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.style.cssText = 'flex:1; min-height:120px; overflow:hidden; display:flex; flex-direction:column; border-radius:6px; border:1px solid #e2e8f0;';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
      title: '🌳 后序逆向建树推演跟踪树 (Call Trace)',
      theme: 'light',
      maxHeight: '100%',
      showTerminalHeader: true,
    });
    container.appendChild(traceBox);
  }

  // 4. 当前推演决策总结
  const isDone = step.decision.includes('完成') || step.decision.includes('完毕') || step.statusBadge?.type === 'success';
  const summaryBox = document.createElement('div');
  summaryBox.style.cssText = `padding:8px 10px; border-radius:6px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${isDone ? '#f0fdf4' : '#f8fafc'}; border:1px solid ${isDone ? '#bbf7d0' : '#e2e8f0'};`;
  summaryBox.innerHTML = `
    <div style="font-weight:700; margin-bottom:2px; color:${isDone ? '#15803d' : '#0284c7'};">⚡ 当前决策: ${step.decision}</div>
    <div style="color:#64748b; font-size:11px;">${step.message}</div>
  `;
  container.appendChild(summaryBox);
}
