/**
 * 二叉搜索树搜索表现层适配器 (BST Search Canvas & Metrics Adapter)
 * Matt Pocock 深模块设计：将二叉树拓扑沙盘、下潜路径与决策监控彻底解耦封装
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { BSTSStep } from './bst-search-step-compiler';

export class BstSearchCanvasAdapter {
  /**
   * Card 1: 纯净二叉树画布渲染器 (纯 View 逻辑，杜绝跨容器 DOM 穿透)
   */
  static renderCanvas(
    container: HTMLElement,
    step: BSTSStep,
    stageId: 'stage-1' | 'stage-2' | 'stage-3' = 'stage-1'
  ): void {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.insertedVal != null ? step.insertedVal : step.current,
      secondaryHighlightedNodes: step.path,
      primaryColor: step.insertedVal != null ? '#8b5cf6' : step.found ? '#16a34a' : '#3b82f6',
      secondaryColor: '#fbbf24',
    });
  }

  /**
   * Card 2: 自定义运行监控与推演面板 (4 格指标 + 下潜路径 + 递归推演树 / 槽位状态)
   */
  static renderCustomMetrics(container: HTMLElement, step: BSTSStep): void {
    container.innerHTML = '';
    container.style.cssText = 'display:flex; flex-direction:column; gap:8px; padding:8px; height:100%; overflow-y:auto; font-family:system-ui, -apple-system, sans-serif;';

    // 1. 顶部 4 格核心指标网格
    const metricsGrid = document.createElement('div');
    metricsGrid.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; flex-shrink:0;';
    const foundText = step.insertedVal != null
      ? '已挂载新节点'
      : step.found
      ? '已命中目标'
      : step.action === 'not-found'
      ? '未找到 (null)'
      : '检索中';
    const foundColor = step.insertedVal != null
      ? '#7c3aed'
      : step.found
      ? '#059669'
      : step.action === 'not-found'
      ? '#e11d48'
      : '#0284c7';

    metricsGrid.innerHTML = `
      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#b45309; font-weight:700;">检索目标数值</div>
        <div style="font-size:14px; font-weight:800; font-family:ui-monospace,monospace; color:#d97706; margin-top:2px;">val = ${step.val}</div>
      </div>
      <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#0369a1; font-weight:700;">当前考察节点</div>
        <div style="font-size:14px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:2px;">${step.current !== null ? `Node(${step.current})` : '—'}</div>
      </div>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#475569; font-weight:700;">分支转向决策</div>
        <div style="font-size:11px; font-weight:700; color:#334155; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${step.decision}</div>
      </div>
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 8px; text-align:center;">
        <div style="font-size:10px; color:#15803d; font-weight:700;">搜索命中状态</div>
        <div style="font-size:12px; font-weight:800; color:${foundColor}; margin-top:3px;">${foundText}</div>
      </div>
    `;
    container.appendChild(metricsGrid);

    // 2. 检索下潜路径展示区
    const pathBox = document.createElement('div');
    pathBox.style.cssText = 'padding:6px 10px; border-radius:6px; background:#ffffff; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; font-size:11px;';
    pathBox.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="color:#64748b; font-weight:600;">🛤️ 下潜路径:</span>
        <div style="display:flex; align-items:center; gap:4px;">
          ${step.path && step.path.length > 0 ? step.path.map((v, i) => {
            const isTarget = v === step.val;
            const bg = isTarget ? '#dcfce7' : '#f1f5f9';
            const border = isTarget ? '#86efac' : '#cbd5e1';
            const color = isTarget ? '#15803d' : '#334155';
            return `
              <span style="display:inline-flex; align-items:center; justify-content:center; padding:1px 6px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700; background:${bg}; border:1px solid ${border}; color:${color};">
                ${v}
              </span>
              ${i < step.path.length - 1 ? '<span style="color:#94a3b8; font-size:11px;">➔</span>' : ''}
            `;
          }).join('') : '<span style="color:#94a3b8; font-style:italic;">未开始</span>'}
        </div>
      </div>
      ${step.targetSubtree ? `<span style="font-family:ui-monospace,monospace; font-size:11px; font-weight:700; color:#059669;">Subtree(Root=${step.targetSubtree.val})</span>` : ''}
    `;
    container.appendChild(pathBox);

    // 3. 中间推演区：如果是 Stage 2 展示 Call Trace，其他 Stage 展示单向剪枝/槽位信息
    if (step.stageId === 'stage-2' && step.callTrace) {
      const traceBox = document.createElement('div');
      traceBox.style.cssText = 'flex:1; min-height:140px; max-height:240px; overflow:hidden; display:flex; flex-direction:column; border-radius:6px; border:1px solid #e2e8f0;';
      RecursiveCallTraceAdapter.render(traceBox, step.callTrace);
      container.appendChild(traceBox);
    } else if (step.stageId === 'stage-3') {
      const insertBox = document.createElement('div');
      insertBox.style.cssText = 'padding:8px 10px; border-radius:6px; background:#faf5ff; border:1px solid #e9d5ff; flex-shrink:0; font-size:11px;';
      insertBox.innerHTML = `
        <div style="font-weight:700; color:#7e22ce; margin-bottom:3px; display:flex; align-items:center; gap:4px;">
          <span>🌱 BST 读写闭环动态插入 (LC 701)</span>
        </div>
        <div style="color:#581c87; display:flex; align-items:center; gap:6px;">
          <span>当前槽位动作:</span>
          <span style="font-weight:700; color:${step.insertedVal != null ? '#7c3aed' : '#0284c7'};">${step.decision}</span>
        </div>
      `;
      container.appendChild(insertBox);
    }

    // 4. 当前推演决策总结
    const isDone = step.decision.includes('完成') || step.decision.includes('成功') || step.statusBadge?.type === 'success';
    const summaryBox = document.createElement('div');
    summaryBox.style.cssText = `padding:8px 10px; border-radius:6px; font-size:11.5px; line-height:1.5; flex-shrink:0; background:${isDone ? '#f0fdf4' : '#f8fafc'}; border:1px solid ${isDone ? '#bbf7d0' : '#e2e8f0'};`;
    summaryBox.innerHTML = `
      <div style="font-weight:700; margin-bottom:2px; color:${isDone ? '#15803d' : '#0284c7'};">⚡ 当前决策: ${step.decision}</div>
      <div style="color:#64748b; font-size:11px;">${step.message}</div>
    `;
    container.appendChild(summaryBox);
  }
}

export const renderBstSearchCanvas = BstSearchCanvasAdapter.renderCanvas;
export const renderBstSearchCustomMetrics = BstSearchCanvasAdapter.renderCustomMetrics;
