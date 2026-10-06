/**
 * BST 众数画布与指标呈现适配器 (LC 501 · Find Mode in Binary Search Tree)
 *
 * 遵循深模块架构规范：
 * - 纯净委托 TreeCanvasAdapter 渲染 SVG 树形拓扑
 * - 零内联套娃、零样式冲突、高内聚封装指标卡、中序单调序列卡与 RecursiveCallTrace 栈视图
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { BstModesStep } from './bst-modes-step-compiler';

export class BstModesCanvasAdapter {
  /**
   * Card 1: 纯粹的树形沙盘渲染 (Pure SVG Sandbox)
   */
  static renderCanvas(container: HTMLElement, step: BstModesStep): void {
    if (step.tree) {
      const highlights = step.highlightedNodes && step.highlightedNodes.length > 0
        ? step.highlightedNodes
        : (step.currNodeVal != null ? [step.currNodeVal] : []);

      TreeCanvasAdapter.renderTree(container, {
        tree: step.tree,
        current: step.currNodeVal,
        highlightedNodes: highlights,
        primaryColor: '#c026d3', // 紫红当前节点
        visitedColor: '#10b981', // 翡翠绿已访问节点
        secondaryColor: '#f59e0b', // 琥珀黄前驱节点
      });
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空二叉树</text>
          </svg>
          <span style="font-size: 11px; color: #64748b; margin-top: 8px;">无节点可计算众数</span>
        </div>
      `;
    }
  }

  /**
   * Card 2: 领域指标监控与递归调用栈沙盘 (Custom Metrics & Recursive Call Trace)
   */
  static renderCustomMetrics(container: HTMLElement, step: BstModesStep): void {
    const currValStr = step.currNodeVal !== null ? String(step.currNodeVal) : '-';
    const prevValStr = step.prevNodeVal !== null ? String(step.prevNodeVal) : 'null';

    const modesHtml = step.modes.length > 0
      ? step.modes
          .map((m) => `<span style="display:inline-block; padding:3px 8px; border-radius:5px; font-weight:800; font-size:13px; background:#ecfdf5; color:#047857; border:1.5px solid #10b981; margin-right:4px;">${m}</span>`)
          .join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">暂无众数</span>';

    const inorderSeqHtml = step.inorderSeq.length > 0
      ? step.inorderSeq
          .map((val, idx) => {
            const isLatest = idx === step.inorderSeq.length - 1;
            return `<span style="display:inline-block; padding:2px 6px; border-radius:4px; font-weight:700; font-size:11px; margin-right:4px; margin-bottom:4px; background:${isLatest ? '#fef3c7' : '#f1f5f9'}; color:${isLatest ? '#b45309' : '#475569'}; border:1px solid ${isLatest ? '#f59e0b' : '#cbd5e1'};">${val}</span>`;
          })
          .join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">尚无访问节点</span>';

    let extraMetricHtml = '';
    if (step.stageId === 'stage-2') {
      const stackStr = step.stackVals && step.stackVals.length > 0
        ? step.stackVals.map((v) => `<span style="display:inline-block; padding:1px 5px; border-radius:3px; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; font-size:10.5px; font-weight:700; margin-right:3px;">${v}</span>`).join(' ')
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
        ? `<span style="color:#16a34a; font-weight:700;">🟢 已连接 (${step.morrisThread.from} ➔ ${step.morrisThread.to})</span>`
        : `<span style="color:#dc2626; font-weight:700;">🔴 已拆除 (${step.morrisThread.from} ⇸ ${step.morrisThread.to})</span>`;
      extraMetricHtml = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px; margin-top:8px;">
          <div style="font-size:11px; font-weight:700; color:#4338ca; margin-bottom:4px;">
            <span>🧵 Morris 线索桥梁状态</span>
          </div>
          <div style="font-size:11.5px; font-family:monospace;">${threadStatus}</div>
        </div>
      `;
    }

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex; flex-direction:column; gap:10px; font-family:system-ui, -apple-system, sans-serif;';
    wrapper.innerHTML = `
      <!-- 核心指标网格 -->
      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px;">
        <!-- 当前节点 -->
        <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:8px 10px; text-align:center;">
          <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">当前节点 curr</div>
          <div style="font-size:18px; font-weight:800; color:#0284c7; font-family:monospace; margin-top:2px;">${currValStr}</div>
        </div>

        <!-- 前驱节点 -->
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:8px 10px; text-align:center;">
          <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">前驱 prev</div>
          <div style="font-size:18px; font-weight:800; color:#d97706; font-family:monospace; margin-top:2px;">${prevValStr}</div>
        </div>

        <!-- 当前连续频次 -->
        <div style="background:#fdf4ff; border:1px solid #f5d0fe; border-radius:8px; padding:8px 10px; text-align:center;">
          <div style="font-size:10px; color:#a21caf; font-weight:700; text-transform:uppercase;">当前计数 count</div>
          <div style="font-size:18px; font-weight:800; color:#c026d3; font-family:monospace; margin-top:2px;">${step.count}</div>
        </div>

        <!-- 历史最高频次 -->
        <div style="background:#fef2f2; border:1.5px solid #fecaca; border-radius:8px; padding:8px 10px; text-align:center;">
          <div style="font-size:10px; color:#b91c1c; font-weight:700; text-transform:uppercase;">最高频次 maxCount</div>
          <div style="font-size:18px; font-weight:900; color:#dc2626; font-family:monospace; margin-top:2px;">${step.maxCount}</div>
        </div>
      </div>

      <!-- 动态众数集合 -->
      <div style="background:#ffffff; border:1.5px solid #a7f3d0; border-radius:8px; padding:10px;">
        <div style="font-size:11px; font-weight:700; color:#047857; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
          <span>🎯 当前认定的众数集合 (modes)</span>
          <span style="font-size:10px; color:#059669; font-weight:bold;">出现频次: ${step.maxCount} 次</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:6px;">${modesHtml}</div>
      </div>

      <!-- 中序序列流 -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
        <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
          <span>📈 已访问中序单调序列</span>
          <span style="font-size:10px; color:#94a3b8; font-weight:normal;">元素个数: ${step.inorderSeq.length}</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; align-items:center;">${inorderSeqHtml}</div>
      </div>

      ${extraMetricHtml}
    `;
    container.appendChild(wrapper);

    // 递归生命周期追踪 (Stage 1)
    if (step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.style.cssText = 'flex:1; min-height:160px; max-height:260px; overflow:hidden; display:flex; flex-direction:column;';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
      container.appendChild(traceBox);
    }

    // 决策解说卡
    const decisionCard = document.createElement('div');
    decisionCard.style.cssText = 'background:#faf5ff; border:1px dashed #d8b4fe; border-radius:8px; padding:8px 12px; font-size:11.5px; color:#581c87; line-height:1.5;';
    decisionCard.innerHTML = `<span style="font-weight:700; color:#7e22ce;">💡 当前决策：</span>${step.decision}`;
    container.appendChild(decisionCard);
  }
}
