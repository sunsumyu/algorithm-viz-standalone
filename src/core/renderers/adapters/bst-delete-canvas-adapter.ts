/**
 * BST 节点删除画布与指标呈现适配器 (LC 450 · Delete Node in a BST)
 *
 * 遵循深模块架构规范：
 * - 纯净委托 TreeCanvasAdapter 渲染 SVG 树形拓扑
 * - 零内联套娃、零样式冲突、高内聚封装指标卡与 RecursiveCallTrace 栈视图
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { BSTDeleteStep, collectTreeValues } from './bst-delete-step-compiler';

export class BstDeleteCanvasAdapter {
  /**
   * Card 1: 纯粹的树形沙盘渲染 (Pure SVG Sandbox)
   */
  static renderCanvas(container: HTMLElement, step: BSTDeleteStep): void {
    if (step.tree) {
      const allVals = collectTreeValues(step.tree);
      const isDone = step.action === 'done';
      const visited = isDone ? allVals : (step.visitedNodes ?? []);
      const highlights = step.highlightedNodes && step.highlightedNodes.length > 0
        ? step.highlightedNodes
        : (step.currentVal != null ? [step.currentVal] : []);

      TreeCanvasAdapter.renderTree(container, {
        tree: step.tree,
        current: step.currentVal,
        highlightedNodes: highlights,
        visitedNodes: visited,
        primaryColor: '#ef4444', // 鲜红目标
        visitedColor: '#3b82f6', // 天蓝访问路径
        secondaryColor: '#10b981', // 翡翠绿后继
      });
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#fef2f2" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#ef4444" font-weight="bold">空二叉树 (null)</text>
          </svg>
          <span style="font-size: 11px; color: #94a3b8; margin-top: 8px;">二叉搜索树为空，无节点可被删除</span>
        </div>
      `;
    }
  }

  /**
   * Card 2: 领域指标监控与递归调用栈沙盘 (Custom Metrics & Recursive Call Trace)
   */
  static renderCustomMetrics(container: HTMLElement, step: BSTDeleteStep): void {
    container.innerHTML = '';
    container.style.cssText = 'display:flex; flex-direction:column; gap:8px; padding:8px; height:100%; overflow-y:auto; font-family:system-ui, -apple-system, sans-serif;';

    // 1. 顶部 4 维核心指标卡片网格
    const metricGrid = document.createElement('div');
    metricGrid.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; flex-shrink:0;';
    metricGrid.innerHTML = `
      <div style="background:#fff1f2; border:1px solid #fecdd3; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#be123c; font-weight:700;">待删目标键</div>
        <div style="font-size:14px; font-weight:800; font-family:ui-monospace,monospace; color:#e11d48; margin-top:2px;">key = ${step.targetKey}</div>
      </div>
      <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#0369a1; font-weight:700;">当前探查节点</div>
        <div style="font-size:14px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:2px;">${step.currentVal != null ? `Node(${step.currentVal})` : '—'}</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#15803d; font-weight:700;">极小后继节点</div>
        <div style="font-size:14px; font-weight:800; font-family:ui-monospace,monospace; color:#059669; margin-top:2px;">${step.successorVal != null ? `Node(${step.successorVal})` : '—'}</div>
      </div>
      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#b45309; font-weight:700;">当前动作</div>
        <div style="font-size:12px; font-weight:800; font-family:ui-monospace,monospace; color:#d97706; margin-top:3px;">${step.action.toUpperCase()}</div>
      </div>
    `;
    container.appendChild(metricGrid);

    // 2. 中部：结构化调用栈踪迹沙盘 (Stage 1 & 2) 或迭代状态沙盘 (Stage 3)
    if (step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.style.cssText = 'flex:1; min-height:140px; max-height:240px; overflow:hidden; display:flex; flex-direction:column; border-radius:6px; border:1px solid #e2e8f0;';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
      container.appendChild(traceBox);
    } else {
      const iterBox = document.createElement('div');
      iterBox.style.cssText = 'padding:8px 10px; border-radius:6px; background:#f8fafc; border:1px solid #e2e8f0; font-size:11px; display:flex; flex-direction:column; gap:4px;';
      iterBox.innerHTML = `
        <div style="font-weight:700; color:#334155;">⚡ 双指针迭代状态监视器 (O(1) 空间)</div>
        <div style="display:flex; align-items:center; gap:16px; font-family:ui-monospace,monospace; color:#475569;">
          <div><span>父节点 pre:</span> <span style="font-weight:700; color:#d97706;">${step.parentVal != null ? step.parentVal : 'null (根)'}</span></div>
          <div><span>当前游标 cur:</span> <span style="font-weight:700; color:#0284c7;">${step.currentVal != null ? step.currentVal : 'null'}</span></div>
        </div>
      `;
      container.appendChild(iterBox);
    }

    // 3. 底部推演决策卡片
    const isDone = step.action === 'done';
    const summaryBox = document.createElement('div');
    summaryBox.style.cssText = `padding:8px 10px; border-radius:6px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${isDone ? '#f0fdf4' : '#f8fafc'}; border:1px solid ${isDone ? '#bbf7d0' : '#e2e8f0'};`;
    summaryBox.innerHTML = `
      <div style="font-weight:700; margin-bottom:2px; color:${isDone ? '#15803d' : '#0284c7'};">⚡ 决策推演: ${step.decision}</div>
      <div style="color:#64748b; font-size:11px;">${step.message}</div>
    `;
    container.appendChild(summaryBox);
  }
}
