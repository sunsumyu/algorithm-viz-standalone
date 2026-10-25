/**
 * 有序数组转二叉搜索树视觉适配器 (Convert Sorted Array to BST Canvas Adapter)
 * LeetCode 108
 * 负责纯净复合沙盘 (数组切片条 + 树拓扑) 与 Card 2 自包含分治调用栈沙盘
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import {
  SortedArrayToBstStep,
  collectTreeValues,
} from './sorted-array-to-bst-step-compiler';

function renderArrayStrip(nums: number[], left: number, right: number, mid: number | null): string {
  if (!nums || nums.length === 0) return '';
  const cells = nums
    .map((val, idx) => {
      const inRange = left >= 0 && right >= 0 && idx >= left && idx <= right;
      const isMid = mid !== null && idx === mid;
      const isLeft = inRange && mid !== null && idx < mid;
      const isRight = inRange && mid !== null && idx > mid;

      if (!inRange) {
        return `
          <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
            <span style="font-size:9px;color:#94a3b8;font-family:ui-monospace,monospace;line-height:1;margin-bottom:2px;">${idx}</span>
            <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;border:1px dashed #cbd5e1;background:#f8fafc;color:#94a3b8;font-family:ui-monospace,monospace;font-size:11px;">
              ${val}
            </div>
          </div>`;
      }
      if (isMid) {
        return `
          <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
            <span style="font-size:9px;color:#d97706;font-weight:700;font-family:ui-monospace,monospace;line-height:1;margin-bottom:2px;">mid(${idx})</span>
            <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:#fef3c7;color:#92400e;font-weight:700;font-family:ui-monospace,monospace;font-size:12px;border:2px solid #f59e0b;box-shadow:0 1px 3px rgba(245,158,11,0.3);" title="中点根节点 nums[${idx}]=${val}">
              ${val}
            </div>
          </div>`;
      }
      if (isLeft) {
        return `
          <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
            <span style="font-size:9px;color:#2563eb;font-weight:600;font-family:ui-monospace,monospace;line-height:1;margin-bottom:2px;">${idx}</span>
            <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:#eff6ff;border:1.5px solid #60a5fa;color:#1d4ed8;font-weight:600;font-family:ui-monospace,monospace;font-size:12px;" title="左子区间 [${left}..${mid! - 1}]">
              ${val}
            </div>
          </div>`;
      }
      if (isRight) {
        return `
          <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
            <span style="font-size:9px;color:#7c3aed;font-weight:600;font-family:ui-monospace,monospace;line-height:1;margin-bottom:2px;">${idx}</span>
            <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:#faf5ff;border:1.5px solid #c084fc;color:#7e22ce;font-weight:600;font-family:ui-monospace,monospace;font-size:12px;" title="右子区间 [${mid! + 1}..${right}]">
              ${val}
            </div>
          </div>`;
      }
      return `
        <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
          <span style="font-size:9px;color:#0284c7;font-weight:600;font-family:ui-monospace,monospace;line-height:1;margin-bottom:2px;">${idx}</span>
          <div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:#f0f9ff;border:1.5px solid #38bdf8;color:#0369a1;font-weight:600;font-family:ui-monospace,monospace;font-size:12px;" title="当前待分治区间 [${left}..${right}]">
            ${val}
          </div>
        </div>`;
    })
    .join('');

  return `
    <div style="display:flex;align-items:center;gap:8px;padding:4px 8px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:4px;flex-shrink:0;">
      <span style="font-size:11px;font-family:ui-monospace,monospace;font-weight:700;color:#475569;white-space:nowrap;">nums[ ]:</span>
      <div style="display:flex;align-items:center;gap:6px;overflow-x:auto;">
        ${cells}
      </div>
    </div>`;
}

/**
 * Card 1: 纯粹复合树形沙盘渲染 (Array Slicing Strip + Tree Topology)
 */
export function renderSortedArrayToBstCanvas(container: HTMLElement, step: SortedArrayToBstStep): void {
  container.innerHTML = '';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.padding = '8px';

  // 1. 顶部：有序数组切片条带
  if (step.nums && step.nums.length > 0) {
    const stripWrapper = document.createElement('div');
    stripWrapper.innerHTML = renderArrayStrip(step.nums, step.left, step.right, step.mid);
    container.appendChild(stripWrapper);
  }

  // 2. 主体：二叉树拓扑生长图
  const treeContainer = document.createElement('div');
  treeContainer.style.flex = '1';
  treeContainer.style.minHeight = '190px';
  treeContainer.style.display = 'flex';
  treeContainer.style.alignItems = 'center';
  treeContainer.style.justifyContent = 'center';

  if (step.tree) {
    const allVals = collectTreeValues(step.tree);
    const isDone = step.action === 'done';
    const visited = isDone ? allVals : (step.visitedNodes ?? []);
    const highlights =
      step.highlightedNodes && step.highlightedNodes.length > 0
        ? step.highlightedNodes
        : step.currentVal != null
        ? [step.currentVal]
        : [];

    TreeCanvasAdapter.renderTree(treeContainer, {
      tree: step.tree,
      current: step.currentVal,
      highlightedNodes: highlights,
      visitedNodes: visited,
      primaryColor: '#f59e0b',
      visitedColor: '#10b981',
      secondaryColor: '#3b82f6',
    });
  } else {
    treeContainer.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:180px;">
        <svg width="200" height="90" viewBox="0 0 200 90">
          <circle cx="100" cy="40" r="22" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="100" y="45" text-anchor="middle" font-size="11" fill="#3b82f6" font-weight="bold">分治准备中</text>
        </svg>
        <span style="font-size:11px;color:#64748b;margin-top:4px;">即将从区间中点选取根节点...</span>
      </div>
    `;
  }
  container.appendChild(treeContainer);
}

/**
 * Card 2: 领域指标监控与递归调用栈沙盘 (自包含无依赖样式)
 */
export function renderSortedArrayToBstCustomMetrics(container: HTMLElement, step: SortedArrayToBstStep): void {
  container.innerHTML = '';
  container.style.padding = '8px';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '8px';
  container.style.height = '100%';
  container.style.overflowY = 'auto';

  // Stage 3 显式三队列状态监控
  if (step.bfsQueues) {
    const queueBox = document.createElement('div');
    queueBox.style.cssText = 'padding:10px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;display:flex;flex-direction:column;gap:8px;font-size:12px;';
    queueBox.innerHTML = `
      <div style="font-weight:700;color:#334155;display:flex;justify-content:space-between;align-items:center;">
        <span>🥞 三队列显式 BFS 状态 (Explicit Queues)</span>
        <span style="font-size:10px;color:#059669;font-family:ui-monospace,monospace;background:#f0fdf4;padding:2px 6px;border-radius:4px;border:1px solid #bbf7d0;">O(N) 零递归栈层序构建</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;font-family:ui-monospace,monospace;font-size:11px;background:#ffffff;padding:8px;border-radius:6px;border:1px solid #e2e8f0;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="color:#64748b;width:90px;font-family:sans-serif;">nodeQueue:</span>
          <span style="color:#d97706;font-weight:700;">[${step.bfsQueues.nodeVals.join(', ')}]</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="color:#64748b;width:90px;font-family:sans-serif;">leftQueue:</span>
          <span style="color:#0284c7;">[${step.bfsQueues.leftRanges.join(', ')}]</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="color:#64748b;width:90px;font-family:sans-serif;">rightQueue:</span>
          <span style="color:#0d9488;">[${step.bfsQueues.rightRanges.join(', ')}]</span>
        </div>
      </div>
    `;
    container.appendChild(queueBox);
    return;
  }

  // Stage 1 / Stage 2 纯净单步分治与递归活跃帧沙盘
  const isOutOfBounds = step.left > step.right;
  const rangeLen = Math.max(0, step.right - step.left + 1);

  const monitorBox = document.createElement('div');
  monitorBox.style.cssText = 'padding:10px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;display:flex;flex-direction:column;gap:8px;font-size:12px;flex-shrink:0;';

  let badgeText = `区间元素: ${rangeLen}`;
  let badgeStyle = 'color:#0369a1;background:#f0f9ff;border:1px solid #bae6fd;';
  if (isOutOfBounds) {
    badgeText = '越界基底 · 返回 null';
    badgeStyle = 'color:#b45309;background:#fffbeb;border:1px solid #fde68a;';
  } else if (step.action === 'done') {
    badgeText = '整树构建完成';
    badgeStyle = 'color:#15803d;background:#f0fdf4;border:1px solid #bbf7d0;';
  }

  let bodyHtml = '';
  if (isOutOfBounds) {
    bodyHtml = `
      <div style="padding:8px 10px;border-radius:6px;background:#fffbeb;border:1px solid #fde68a;display:flex;flex-direction:column;gap:4px;font-size:11.5px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:700;color:#92400e;">🛑 命中递归越界基底 (Base Case)</span>
          <span style="font-family:ui-monospace,monospace;color:#b45309;">left(${step.left}) > right(${step.right})</span>
        </div>
        <div style="color:#78350f;line-height:1.5;">
          当前区间有效元素为空，直接执行 <code style="font-family:ui-monospace,monospace;font-weight:700;color:#047857;background:#ffffff;padding:1px 4px;border-radius:3px;border:1px solid #a7f3d0;">return null;</code> 返回空指针，挂载为叶子节点的子树。
        </div>
      </div>`;
  } else if (step.action === 'enter' || step.mid == null) {
    bodyHtml = `
      <div style="padding:8px 10px;border-radius:6px;background:#f0f9ff;border:1px solid #bae6fd;display:flex;flex-direction:column;gap:4px;font-size:11.5px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:700;color:#0369a1;">⚡ 算法启动 / 进入区间</span>
          <span style="font-family:ui-monospace,monospace;color:#0284c7;">build(${step.left}, ${step.right})</span>
        </div>
        <div style="color:#0c4a6e;line-height:1.5;">
          当前分治区间为 <strong style="font-family:ui-monospace,monospace;">[${step.left} .. ${step.right}]</strong>（共 ${rangeLen} 个元素），准备选取中间偏左元素创建平衡根节点。
        </div>
      </div>`;
  } else {
    bodyHtml = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;font-family:ui-monospace,monospace;">
        <div style="padding:6px 8px;border-radius:6px;background:#ffffff;border:1px solid #fed7aa;display:flex;flex-direction:column;gap:3px;">
          <span style="color:#9a3412;font-family:sans-serif;font-weight:700;">🎯 选定中点根节点:</span>
          <div style="color:#0369a1;font-weight:700;">build(${step.left}, ${step.right})</div>
          <div style="color:#c2410c;">mid=${step.mid} ➔ <strong style="color:#9a3412;font-size:12px;">nums[${step.mid}]=${step.currentVal}</strong></div>
        </div>
        <div style="padding:6px 8px;border-radius:6px;background:#ffffff;border:1px solid #e2e8f0;display:flex;flex-direction:column;gap:3px;">
          <span style="color:#475569;font-family:sans-serif;font-weight:700;">🌿 左右分治区间:</span>
          <div style="color:#2563eb;">左区间: [${step.left} .. ${step.mid - 1}]</div>
          <div style="color:#7c3aed;">右区间: [${step.mid + 1} .. ${step.right}]</div>
        </div>
      </div>`;
  }

  monitorBox.innerHTML = `
    <div style="font-weight:700;color:#334155;display:flex;justify-content:space-between;align-items:center;">
      <span>⚡ 当前递归分治活跃帧 (Active Call Frame)</span>
      <span style="font-size:10px;font-family:ui-monospace,monospace;padding:2px 6px;border-radius:4px;${badgeStyle}">
        ${badgeText}
      </span>
    </div>
    ${bodyHtml}
    <div style="font-size:11px;color:#334155;background:#ffffff;padding:5px 8px;border-radius:6px;border:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">
      <span style="color:#64748b;">🌲 AVL 平衡约束:</span>
      <span style="color:#059669;font-family:ui-monospace,monospace;font-weight:600;">|Height(L) - Height(R)| ≤ 1 (天然平衡)</span>
    </div>
  `;
  container.appendChild(monitorBox);

  // 渲染编译好的递归调用树跟踪沙盘
  if (step.callTrace && step.callTrace.lines && step.callTrace.lines.length > 0) {
    const traceWrap = document.createElement('div');
    traceWrap.style.cssText = 'flex:1;min-height:120px;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;background:#ffffff;';
    traceWrap.innerHTML = RecursiveCallTraceAdapter.renderHtml(step.callTrace, {
      maxHeight: '100%',
      showTerminalHeader: true,
      theme: 'light',
    });
    container.appendChild(traceWrap);
  }
}

export const SortedArrayToBstCanvasAdapter = {
  renderCanvas: renderSortedArrayToBstCanvas,
  renderCustomMetrics: renderSortedArrayToBstCustomMetrics,
};
