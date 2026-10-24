/**
 * Balanced Binary Tree Canvas Adapter (LeetCode 110 / Class 037 Code01)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范。
 * Card 1: 委托 TreeCanvasAdapter 渲染二叉树拓扑沙盘 (支持右上角切至全景推演树)；
 * Card 2: 饱满丰富的「状态空间与指标监视器」：实时调用栈深、Info 二元组汇聚、-1 剪枝穿透指示器与高度映射表。
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { BalancedTree037Step, collectTreeValues } from './balanced-binary-tree-step-compiler';
import { renderTreeSvg } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';

function renderDecisionHeader(step: BalancedTree037Step): HTMLDivElement {
  const card = document.createElement('div');
  card.style.cssText =
    'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 7px 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); display: flex; flex-direction: column; gap: 3px; flex-shrink: 0;';

  const bType = step.statusBadge?.type || 'info';
  const badgeStyle =
    bType === 'success'
      ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;'
      : bType === 'danger'
      ? 'background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;'
      : bType === 'warning'
      ? 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;'
      : 'background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;';

  card.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <span style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 4px;">
        <span>🧭</span> <span>当前操作动作</span>
      </span>
      ${step.statusBadge ? `<span style="font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; ${badgeStyle}">${step.statusBadge.text}</span>` : ''}
    </div>
    <div style="font-size: 11.5px; font-weight: 600; color: #1e293b; line-height: 1.35;">${step.decision || '推演执行中...'}</div>
    ${step.message ? `<div style="font-size: 10.5px; color: #64748b; line-height: 1.3;">${step.message}</div>` : ''}
  `;
  return card;
}

export class BalancedBinaryTreeCanvasAdapter {
  /**
   * Card 1: 表现层画板渲染器 (Presentation Canvas Renderer)
   */
  static renderCanvas(container: HTMLElement, step: BalancedTree037Step): void {
    if (step.tree) {
      const isDone =
        step.decision.includes('完成') ||
        step.decision.includes('最终判定') ||
        step.decision.includes('完毕') ||
        step.statusBadge?.type === 'success' ||
        step.statusBadge?.type === 'danger';
      const allTreeVals = collectTreeValues(step.tree);
      let current = step.current;
      let visitedNodes = step.visitedNodes;
      const secondaryHighlightedNodes =
        step.secondaryCurrent != null ? [step.secondaryCurrent] : [];

      if (isDone) {
        if (current === null) current = step.tree.val;
        if (!visitedNodes || visitedNodes.length === 0) visitedNodes = allTreeVals;
      }

      TreeCanvasAdapter.renderTree(container, {
        tree: step.tree,
        current,
        visitedNodes: visitedNodes && visitedNodes.length > 0 ? visitedNodes : undefined,
        secondaryHighlightedNodes: secondaryHighlightedNodes.length > 0 ? secondaryHighlightedNodes : [],
        primaryColor: '#f59e0b',
        secondaryColor: '#38bdf8',
        visitedColor: '#34d399',
      });
    } else if ((step.extraData as any)?.treeNodes) {
      const treeNodes = (step.extraData as any).treeNodes;
      container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
          ${renderTreeSvg(treeNodes, step.activeNodeId ?? step.current, step.secondaryNodeId ?? step.secondaryCurrent)}
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%;">
          <svg width="240" height="120" viewBox="0 0 240 120">
            <circle cx="120" cy="50" r="24" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
            <text x="120" y="55" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">空树 (Null)</text>
          </svg>
        </div>
      `;
    }
  }

  /**
   * Card 2: 状态空间与指标监视器 (State Space & Metrics Monitor)
   * 饱满呈现：当前考察状态、左右子树高度差、-1 剪枝阻抗熔断器、活跃调用栈与节点高度记忆表
   */
  static renderCustomMetrics(container: HTMLElement, step: BalancedTree037Step): void {
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText =
      'display: flex; flex-direction: column; gap: 6px; width: 100%; height: 100%; box-sizing: border-box; overflow: hidden; padding: 4px;';

    // 1. 顶部当前推演决策状态条
    container.appendChild(renderDecisionHeader(step));

    const stageId = step.stageId || 'stage-1';
    const mainBox = document.createElement('div');
    mainBox.style.cssText =
      'flex: 1; min-height: 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 8px; font-size: 11px; overflow-y: auto;';

    // 2. 状态指标四宫格
    const curVal = step.current !== null && step.current !== undefined ? `Node(${step.current})` : 'null (空基底)';
    const diff = step.metrics?.diff ?? step.metrics?.['高度差'] ?? '0';
    const isPruned = step.pruned || step.pruneDetail?.isPruned;
    const isDone = step.decision.includes('判定') || step.statusBadge?.type === 'success' || step.statusBadge?.type === 'danger';
    const evalStatus = isPruned
      ? '<span style="color: #e11d48; font-weight: 700;">🔴 剪枝熔断 (-1)</span>'
      : isDone
      ? '<span style="color: #059669; font-weight: 700;">🟢 整树平衡 (TRUE)</span>'
      : '<span style="color: #2563eb; font-weight: 700;">🔵 局部平衡 (递归中)</span>';

    const metricsGrid = document.createElement('div');
    metricsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; flex-shrink: 0;';
    metricsGrid.innerHTML = `
      <div style="background: #ffffff; padding: 5px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div style="color: #64748b; font-size: 10px;">当前考察节点</div>
        <div style="font-weight: 700; color: #1e293b; font-size: 11.5px;">${curVal}</div>
      </div>
      <div style="background: #ffffff; padding: 5px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
        <div style="color: #64748b; font-size: 10px;">子树高度差 |diff|</div>
        <div style="font-weight: 700; color: ${Number(diff) > 1 ? '#e11d48' : '#0284c7'}; font-size: 11.5px;">|diff| = ${diff}</div>
      </div>
      <div style="background: #ffffff; padding: 5px 8px; border-radius: 6px; border: 1px solid #e2e8f0; grid-column: span 2;">
        <div style="color: #64748b; font-size: 10px;">当前推演状态</div>
        <div style="font-size: 11.5px;">${evalStatus}</div>
      </div>
    `;
    mainBox.appendChild(metricsGrid);

    // 3. Stage 1 & 2: 递归调用栈与状态字典流
    if (stageId === 'stage-3') {
      // Stage 3: 显式后序遍历栈与哈希表
      const stack = step.stackState || [];
      const heightMap = step.heightMap || {};
      const heightEntries = Object.entries(heightMap);

      const stackSection = document.createElement('div');
      stackSection.style.cssText = 'display: flex; flex-direction: column; gap: 6px; flex: 1;';
      stackSection.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; color: #475569;">🥞 后序显式栈 (Size: ${stack.length})</span>
          <span style="font-size: 10px; color: #64748b; font-family: monospace;">Deque&lt;TreeNode&gt;</span>
        </div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; min-height: 26px; align-items: center;">
          ${stack.length > 0 ? stack.map((val, idx) => `<span style="padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px; font-weight: 600; background: ${idx === stack.length - 1 ? '#dbeafe; color: #1d4ed8; border: 1px solid #93c5fd;' : '#ffffff; color: #334155; border: 1px solid #cbd5e1;'}">${idx === stack.length - 1 ? '🔝 ' : ''}Node(${val})</span>`).join('') : '<span style="color: #94a3b8; font-style: italic;">当前显式栈为空</span>'}
        </div>
        <div style="border-top: 1px dashed #e2e8f0; padding-top: 6px;">
          <div style="font-weight: 700; color: #475569; margin-bottom: 4px;">🗺️ 节点高度映射表 (Map&lt;Node, Integer&gt;, 共 ${heightEntries.length} 项)</div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${heightEntries.length > 0 ? heightEntries.map(([k, v]) => `<span style="background: #ffffff; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px; color: #334155;"><b style="color: #0284c7;">Node(${k})</b>: h=${v}</span>`).join('') : '<span style="color: #94a3b8; font-style: italic;">暂未结算任何节点高度</span>'}
          </div>
        </div>
      `;
      mainBox.appendChild(stackSection);
    } else {
      // Stage 1 & Stage 2: 活跃调用栈面包屑 + Info 汇聚/剪枝监视器
      const callStack = step.callStack || [];
      const heightMap = step.heightMap || {};
      const heightEntries = Object.entries(heightMap);

      const stackBreadcrumb = document.createElement('div');
      stackBreadcrumb.style.cssText = 'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; flex-shrink: 0;';
      stackBreadcrumb.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-weight: 700; color: #475569; font-size: 10.5px;">📞 递归活跃调用链 (Call Depth: ${callStack.length})</span>
          <span style="font-size: 10px; color: #0284c7; background: #e0f2fe; padding: 1px 5px; border-radius: 4px;">Frame Stack</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap; font-family: monospace; font-size: 11px;">
          ${callStack.length > 0 ? callStack.map((name, i) => `<span style="padding: 1px 5px; border-radius: 4px; background: ${i === callStack.length - 1 ? '#dbeafe; color: #1e40af; font-weight: 700;' : '#f1f5f9; color: #64748b;'}">${name}</span>${i < callStack.length - 1 ? '<span style="color: #94a3b8;">➔</span>' : ''}`).join('') : '<span style="color: #94a3b8; font-style: italic;">根调用入口</span>'}
        </div>
      `;
      mainBox.appendChild(stackBreadcrumb);

      // Stage 2 剪枝指示器 或 Stage 1 左右子树 Info 汇聚
      if (stageId === 'stage-2') {
        const pruneBox = document.createElement('div');
        pruneBox.style.cssText = `background: ${isPruned ? '#fff1f2' : '#ffffff'}; border: 1px solid ${isPruned ? '#fecdd3' : '#e2e8f0'}; border-radius: 6px; padding: 6px 8px; flex-shrink: 0;`;
        pruneBox.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-weight: 700; color: ${isPruned ? '#be123c' : '#475569'}; font-size: 10.5px;">⚡ -1 剪枝击穿熔断监控仪</span>
            <span style="font-size: 10px; font-weight: 700; color: ${isPruned ? '#be123c' : '#059669'};">${isPruned ? '🚨 触发剪枝熔断' : '🟢 正常自底向上传递'}</span>
          </div>
          <div style="font-size: 10.5px; color: ${isPruned ? '#9f1239' : '#64748b'}; margin-top: 2px;">
            ${isPruned ? '子树高度差绝对值 > 1，立即直接返回 -1。父节点探测到 -1 无需计算剩余子树，实现极速穿透熔断！' : '当前所有子树高度均正常返回，未触发 -1 熔断信号。'}
          </div>
        `;
        mainBox.appendChild(pruneBox);
      }

      // 子树高度映射字典
      const heightDictBox = document.createElement('div');
      heightDictBox.style.cssText = 'background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; flex: 1; min-height: 0; overflow-y: auto;';
      heightDictBox.innerHTML = `
        <div style="font-weight: 700; color: #475569; font-size: 10.5px; margin-bottom: 4px;">🗺️ 已结算子树高度字典表 (共 ${heightEntries.length} 项)</div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          ${heightEntries.length > 0 ? heightEntries.map(([k, v]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px; color: #334155;"><b style="color: #0284c7;">Node(${k})</b>: h=${v}</span>`).join('') : '<span style="color: #94a3b8; font-style: italic;">自底向上计算中...</span>'}
        </div>
      `;
      mainBox.appendChild(heightDictBox);
    }

    // 4. 底部通关点拨
    const footerTip = document.createElement('div');
    footerTip.style.cssText =
      'background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 5px 8px; font-size: 10px; color: #64748b; line-height: 1.35; flex-shrink: 0;';
    footerTip.innerHTML = `
      💡 <b style="color: #1e293b;">左神二叉树通关套路：</b>后序遍历向左右子树要信息。若发现失衡以 -1 快速贯穿，每个节点只访一次，将 O(N²) 暴力降维至 O(N) 线性最优解。
    `;
    mainBox.appendChild(footerTip);

    container.appendChild(mainBox);
  }
}

export const renderBalancedTreeCanvas = BalancedBinaryTreeCanvasAdapter.renderCanvas;
export const renderBalancedCustomMetrics = BalancedBinaryTreeCanvasAdapter.renderCustomMetrics;
