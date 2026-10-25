/**
 * 二叉树中的最大路径和 (Binary Tree Maximum Path Sum · LeetCode 124) 视觉呈现与监控适配器
 * Card 1: 纯净二叉树拓扑与最优路径高亮
 * Card 2: 4 格 KPI 指标 + 最优路径 + 推演栈 / Info 二元组 / 显式栈
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { collectTreeValues } from './max-path-sum-step-compiler';
import type { PathSumStep } from './max-path-sum-step-compiler';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';

export function renderMaxPathSumCanvas(container: HTMLElement, step: PathSumStep): void {
  if (step.tree) {
    const isDone = step.decision.includes('完毕') || step.decision.includes('完成') || step.statusBadge?.type === 'success';
    const allTreeVals = collectTreeValues(step.tree);
    let current = step.currentNode;
    let visitedNodes = step.visitedNodes;

    if (isDone) {
      if (current === null && step.tree) {
        current = step.tree.val;
      }
      if (!visitedNodes || visitedNodes.length === 0) {
        visitedNodes = allTreeVals;
      }
    }

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current,
      visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
      secondaryHighlightedNodes: step.bestArchPath && step.bestArchPath.length > 0 ? step.bestArchPath : [],
      primaryColor: '#fbbf24',
      secondaryColor: '#34d399',
      visitedColor: '#38bdf8',
    });
  } else {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
        <svg width="240" height="120" viewBox="0 0 240 120">
          <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树或初始化</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">准备自底向上后序遍历计算最大路径和...</span>
      </div>
    `;
  }
}

/**
 * Card 2: 自定义运行监控与推演面板 (4 格指标 + 最优路径 + 推演栈 / Info 二元组 / 显式栈)
 */
export function renderMaxPathSumCustomMetrics(container: HTMLElement, step: PathSumStep): void {
  if (!container) return;
  container.innerHTML = '';
  container.style.cssText = 'width:100%; height:100%; display:flex; flex-direction:column; gap:10px; padding:12px; font-family:system-ui,-apple-system,sans-serif; font-size:12px; box-sizing:border-box; overflow:hidden;';

  // 1. 顶部 4 格 KPI 卡片
  const metricsGrid = document.createElement('div');
  metricsGrid.style.cssText = 'display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; flex-shrink:0;';
  metricsGrid.innerHTML = `
    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#15803d; font-weight:700; text-transform:uppercase;">全局最大路径和</div>
      <div style="font-size:14px; font-weight:800; font-family:ui-monospace,monospace; color:#16a34a; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ${step.maxGlobalSum === -Infinity ? '—' : step.maxGlobalSum}
      </div>
    </div>
    <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#0369a1; font-weight:700; text-transform:uppercase;">当前拱形和</div>
      <div style="font-size:14px; font-weight:800; font-family:ui-monospace,monospace; color:#0284c7; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ${step.currentArchSum !== 0 ? step.currentArchSum : '—'}
      </div>
    </div>
    <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#b45309; font-weight:700; text-transform:uppercase;">左单侧有效增益</div>
      <div style="font-size:14px; font-weight:800; font-family:ui-monospace,monospace; color:#d97706; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ${step.leftGain !== undefined ? step.leftGain : '—'}
      </div>
    </div>
    <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:6px; padding:6px 8px; text-align:center;">
      <div style="font-size:10px; color:#7e22ce; font-weight:700; text-transform:uppercase;">右单侧有效增益</div>
      <div style="font-size:14px; font-weight:800; font-family:ui-monospace,monospace; color:#9333ea; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
        ${step.rightGain !== undefined ? step.rightGain : '—'}
      </div>
    </div>
  `;
  container.appendChild(metricsGrid);

  // 2. 最优全路径展示区
  if (step.bestArchPath && step.bestArchPath.length > 0) {
    const pathBox = document.createElement('div');
    pathBox.style.cssText = 'padding:6px 10px; border-radius:6px; background:#ffffff; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; font-size:11px;';
    pathBox.innerHTML = `
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="color:#64748b; font-weight:600;">🏔️ 当前最优全路径:</span>
        <div style="display:flex; align-items:center; gap:4px;">
          ${step.bestArchPath.map((v, i) => `
            <span style="display:inline-flex; align-items:center; justify-content:center; padding:1px 6px; border-radius:4px; font-family:ui-monospace,monospace; font-size:11px; font-weight:700; background:#dcfce7; border:1px solid #86efac; color:#15803d;">
              ${v}
            </span>
            ${i < step.bestArchPath.length - 1 ? '<span style="color:#94a3b8; font-size:11px;">➔</span>' : ''}
          `).join('')}
        </div>
      </div>
      <span style="font-family:ui-monospace,monospace; font-size:12px; font-weight:800; color:#15803d;">Sum = ${step.maxGlobalSum}</span>
    `;
    container.appendChild(pathBox);
  }

  // 3. 中间推演区：根据 stageId 呈现推演树、二元组或显式栈
  if (step.stageId === 'stage-2') {
    const infoBox = document.createElement('div');
    infoBox.style.cssText = 'padding:8px 10px; border-radius:6px; background:#ffffff; border:1px solid #e2e8f0; flex-shrink:0; font-size:11px;';
    infoBox.innerHTML = `
      <div style="font-weight:700; color:#334155; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
        <span>📦 树形 DP 二元组 Info 数据流</span>
        <span style="font-size:10px; color:#64748b; font-weight:normal;">(Zuoshen Class 077 套路)</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-family:ui-monospace,monospace; font-size:11px;">
        <div style="padding:6px 8px; border-radius:4px; background:#f0fdf4; border:1px solid #bbf7d0; display:flex; flex-direction:column; gap:2px;">
          <span style="font-size:10px; color:#15803d;">子树内部最大全路径和 (maxPathSum):</span>
          <span style="font-size:13px; font-weight:800; color:#16a34a;">${step.infoResult ? step.infoResult.maxPathSum : (step.maxGlobalSum === -Infinity ? '—' : step.maxGlobalSum)}</span>
        </div>
        <div style="padding:6px 8px; border-radius:4px; background:#f0f9ff; border:1px solid #bae6fd; display:flex; flex-direction:column; gap:2px;">
          <span style="font-size:10px; color:#0369a1;">从根向下延伸单边最大收益 (maxGainFromRoot):</span>
          <span style="font-size:13px; font-weight:800; color:#0284c7;">${step.infoResult ? step.infoResult.maxGainFromRoot : (step.currentNode !== null ? (step.currentNode + Math.max(step.leftGain, step.rightGain)) : '—')}</span>
        </div>
      </div>
    `;
    container.appendChild(infoBox);
  } else if (step.stageId === 'stage-3') {
    const stackBox = document.createElement('div');
    stackBox.style.cssText = 'padding:8px 10px; border-radius:6px; background:#ffffff; border:1px solid #e2e8f0; flex-shrink:0; font-size:11px;';
    stackBox.innerHTML = `
      <div style="font-weight:700; color:#334155; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
        <span>🥞 显式栈与增益映射表 (Gain Map)</span>
        <span style="font-size:10px; color:#64748b; font-weight:normal;">(零系统栈后序遍历)</span>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px; font-family:ui-monospace,monospace; font-size:11px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="color:#64748b;">显式遍历栈:</span>
          <div style="display:flex; align-items:center; gap:4px;">
            ${(step.stackState && step.stackState.length > 0)
              ? step.stackState.map(v => `<span style="padding:2px 7px; border-radius:4px; background:#eff6ff; border:1px solid #bfdbfe; color:#1d4ed8; font-weight:700;">${v}</span>`).join('')
              : '<span style="color:#94a3b8; font-style:italic;">空栈 []</span>'}
          </div>
        </div>
        ${step.gainMapState && step.gainMapState.length > 0 ? `
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="color:#64748b;">已结算单边增益:</span>
            <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
              ${step.gainMapState.map(item => `
                <span style="padding:2px 6px; border-radius:4px; background:#f8fafc; border:1px solid #e2e8f0; color:#334155;">
                  Node(${item.val}) ➔ <strong style="color:#d97706;">${item.gain}</strong>
                </span>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    container.appendChild(stackBox);
  } else if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.style.cssText = 'flex:1; min-height:120px; overflow:hidden; display:flex; flex-direction:column; border-radius:6px; border:1px solid #e2e8f0;';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
      title: '📜 递归调用推演与归约栈 (LC 124)',
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

// =========================================================================
// 顶层声明式算法注册 (Register Declarative Algorithm)
// =========================================================================

export class MaxPathSumCanvasAdapter {
  public static renderCanvas = renderMaxPathSumCanvas;
  public static renderCustomMetrics = renderMaxPathSumCustomMetrics;
}
