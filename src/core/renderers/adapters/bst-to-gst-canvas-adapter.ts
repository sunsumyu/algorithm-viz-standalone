/**
 * 把二叉搜索树转换为累加树画布适配器 (Convert BST to Greater Tree Canvas Adapter)
 * LeetCode 538 / LC 1038
 * 负责纯净树沙盘与降序累加序列流/显式调用栈/Morris 反向线索监控看板
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { BstToGstStep } from './bst-to-gst-step-compiler';

/**
 * Card 1: 纯粹的树形沙盘渲染 (Pure SVG Sandbox)
 */
export function renderBstToGstCanvas(container: HTMLElement, step: BstToGstStep): void {
  if (step.tree) {
    const highlights =
      step.highlightedNodes && step.highlightedNodes.length > 0
        ? step.highlightedNodes
        : step.currNewVal != null
        ? [step.currNewVal]
        : [];

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.currNewVal ?? step.currOldVal,
      highlightedNodes: highlights,
      primaryColor: '#059669', // 翡翠绿当前累加节点
      visitedColor: '#10b981', // 翡翠绿完工节点
      secondaryColor: '#f59e0b', // 琥珀黄原值节点
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空二叉树</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">无节点可转换为累加树</span>
      </div>
    `;
  }
}

/**
 * Card 2: 领域指标监控看板 (Clean Custom Metrics DOM)
 */
export function renderBstToGstCustomMetrics(container: HTMLElement, step: BstToGstStep): void {
  const oldValStr = step.currOldVal !== null ? String(step.currOldVal) : '-';
  const newValStr = step.currNewVal !== null ? String(step.currNewVal) : '-';

  const reverseSeqHtml =
    step.reverseSeq.length > 0
      ? step.reverseSeq
          .map((item, idx) => {
            const isLatest = idx === step.reverseSeq.length - 1;
            return `<span style="display:inline-block; padding:2px 6px; border-radius:4px; font-weight:700; font-size:11px; margin-right:4px; margin-bottom:4px; background:${
              isLatest ? '#fef3c7' : '#ecfdf5'
            }; color:${isLatest ? '#b45309' : '#047857'}; border:1px solid ${
              isLatest ? '#f59e0b' : '#a7f3d0'
            };">${item.oldVal}➔<strong style="color:${isLatest ? '#d97706' : '#059669'};">${
              item.newVal
            }</strong></span>`;
          })
          .join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">尚无转换节点</span>';

  let extraMetricHtml = '';
  if (step.stageId === 'stage-2') {
    const stackStr =
      step.stackVals && step.stackVals.length > 0
        ? step.stackVals
            .map(
              (v) =>
                `<span style="display:inline-block; padding:1px 5px; border-radius:3px; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:10.5px; font-weight:700; margin-right:3px;">${v}</span>`
            )
            .join(' ')
        : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">栈为空</span>';
    extraMetricHtml = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-top:8px;">
        <div style="font-size:11px; font-weight:700; color:#0369a1; margin-bottom:4px;">
          <span>🥞 显式调用栈 (Stack Top 在右侧)</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:4px;">${stackStr}</div>
      </div>
    `;
  } else if (step.stageId === 'stage-3' && step.morrisThread) {
    const threadStatus = step.morrisThread.active
      ? `<span style="color:#16a34a; font-weight:700;">🟢 已建立反向线索 (${step.morrisThread.from} ➔ ${step.morrisThread.to})</span>`
      : `<span style="color:#dc2626; font-weight:700;">🔴 已拆除反向线索 (${step.morrisThread.from} ⇸ ${step.morrisThread.to})</span>`;
    extraMetricHtml = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-top:8px;">
        <div style="font-size:11px; font-weight:700; color:#4338ca; margin-bottom:4px;">
          <span>🧵 Morris 反向线索状态</span>
        </div>
        <div style="font-size:11.5px; font-family:monospace;">${threadStatus}</div>
      </div>
    `;
  }

  container.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'display:flex; flex-direction:column; gap:10px; font-family:system-ui, -apple-system, sans-serif;';
  wrapper.innerHTML = `
    <!-- 核心指标网格 -->
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px;">
      <!-- 原节点值 -->
      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:8px 10px; text-align:center;">
        <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">原值 oldVal</div>
        <div style="font-size:18px; font-weight:800; color:#d97706; font-family:monospace; margin-top:2px;">${oldValStr}</div>
      </div>

      <!-- 转换后新值 -->
      <div style="background:#ecfdf5; border:1.5px solid #a7f3d0; border-radius:8px; padding:8px 10px; text-align:center;">
        <div style="font-size:10px; color:#047857; font-weight:700; text-transform:uppercase;">新值 newVal</div>
        <div style="font-size:18px; font-weight:900; color:#059669; font-family:monospace; margin-top:2px;">${newValStr}</div>
      </div>

      <!-- 当前全局累加和 -->
      <div style="background:#f0f9ff; border:1.5px solid #bae6fd; border-radius:8px; padding:8px 10px; text-align:center;">
        <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">全局累加 sum</div>
        <div style="font-size:18px; font-weight:900; color:#0284c7; font-family:monospace; margin-top:2px;">${step.sum}</div>
      </div>
    </div>

    <!-- 反向中序转换流 -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
      <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
        <span>📈 降序累加序列流 (右 ➔ 根 ➔ 左)</span>
        <span style="font-size:10px; color:#94a3b8; font-weight:normal;">已处理: ${step.reverseSeq.length} 项</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; align-items:center;">${reverseSeqHtml}</div>
    </div>

    ${extraMetricHtml}
  `;
  container.appendChild(wrapper);

  // 递归生命周期追踪 (Stage 1)
  if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.style.cssText =
      'flex:1; min-height:160px; max-height:260px; overflow:hidden; display:flex; flex-direction:column;';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
    container.appendChild(traceBox);
  }

  // 决策解说卡
  const decisionCard = document.createElement('div');
  decisionCard.style.cssText =
    'background:#faf5ff; border:1px dashed #d8b4fe; border-radius:8px; padding:8px 12px; font-size:11.5px; color:#581c87; line-height:1.5;';
  decisionCard.innerHTML = `<span style="font-weight:700; color:#7e22ce;">💡 当前决策：</span>${step.decision}`;
  container.appendChild(decisionCard);
}

export const BstToGstCanvasAdapter = {
  renderCanvas: renderBstToGstCanvas,
  renderCustomMetrics: renderBstToGstCustomMetrics,
};
