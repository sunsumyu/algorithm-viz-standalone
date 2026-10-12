/**
 * 组合总和可视化器（回溯）
 * Canvas Adapter
 */

import { BacktrackStateSpacePresenter } from '../../../core/renderers/backtrack-state-space-presenter';
import {
  BacktrackTreeNode,
  renderBacktrackTree,
  resetContainerViewState,
} from './backtracking-tree-helper';
import { CombinationSumStep } from './combination-sum-step-compiler';

export function renderCombinationSumCanvas(container: HTMLElement, step: CombinationSumStep): void {
  // 骨架仅在切换运行（决策树变化）时重建，保证树视口缩放/平移状态跨步保留
  const skeletonKey = `${step.nodes.length}:${step.nodes[0]?.id ?? ''}`;
  if (container.dataset.combSumSkeletonKey !== skeletonKey) {
    const prevTree = container.querySelector<HTMLElement>('#combination-sum-tree-display');
    resetContainerViewState(prevTree);
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%; box-sizing: border-box; gap: 8px;">
        <div id="combination-sum-tree-display" style="flex: 1; min-height: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;"></div>
        <div style="display: flex; gap: 8px; height: 118px; flex-shrink: 0;">
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">📚 当前路径栈 path</div>
            <div id="cs-path-stack-container" style="min-height: 24px;"></div>
          </div>
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">∑ 累加和与剪枝监视器</div>
            <div id="cs-sum-monitor-container"></div>
          </div>
          <div style="flex: 1.4; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">✅ 解集箱（合法组合）</div>
            <div id="cs-result-collection-container" style="min-height: 24px;"></div>
          </div>
        </div>
      </div>
    `;
    container.dataset.combSumSkeletonKey = skeletonKey;
  }

  // 1. 渲染 SVG 决策树沙盘
  const treeDisplay = container.querySelector<HTMLElement>('#combination-sum-tree-display');
  if (treeDisplay) {
    renderBacktrackTree({
      container: treeDisplay,
      step,
      cssPrefix: 'cs',
      nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
    });
  }

  // 2. 渲染当前路径栈
  const pathStackContainer = container.querySelector<HTMLElement>('#cs-path-stack-container');
  if (pathStackContainer) {
    const isPush = step.message.includes('做选择');
    const isPop = step.message.includes('回溯撤销');
    const isCollect = step.message.includes('找到合法组合');
    BacktrackStateSpacePresenter.renderPathStack(pathStackContainer, step.path || [], {
      action: isPush ? 'push' : isPop ? 'pop' : isCollect ? 'collect' : 'idle',
    });
  }

  // 3. 渲染累加和与剪枝不等式监视器
  const sumMonitorContainer = container.querySelector<HTMLElement>('#cs-sum-monitor-container');
  const target = step.target;
  if (sumMonitorContainer) {
    const curSum = (step.path as number[]).reduce((a, b) => a + b, 0);
    const remaining = target - curSum;
    const isOver = curSum > target;
    const isMatch = curSum === target;

    let badgeHtml = '';
    if (isMatch) {
      badgeHtml = `<span style="color:#059669; font-weight:700; background:#ecfdf5; padding:2px 6px; border-radius:4px; border:1px solid #a7f3d0;">✓ sum == target (命中)</span>`;
    } else if (isOver) {
      badgeHtml = `<span style="color:#dc2626; font-weight:700; background:#fef2f2; padding:2px 6px; border-radius:4px; border:1px solid #fecaca;">✕ sum > target (超额)</span>`;
    } else {
      badgeHtml = `<span style="color:#2563eb; font-weight:700; background:#eff6ff; padding:2px 6px; border-radius:4px; border:1px solid #bfdbfe;">探索中: 尚需 ${remaining}</span>`;
    }

    sumMonitorContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>当前累加和: <strong style="color:#0f172a; font-family:monospace; font-size:12px;">${curSum}</strong> / ${target}</span>
          ${badgeHtml}
        </div>
        <div style="background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden; position: relative;">
          <div style="background: ${isMatch ? '#10b981' : isOver ? '#ef4444' : '#3b82f6'}; width: ${Math.min(100, (curSum / target) * 100)}%; height: 100%; transition: width 0.2s;"></div>
        </div>
        <div style="font-size: 10.5px; color: #64748b;">剪枝规则: <code style="color:#b45309; font-family:monospace;">sum + c[i] > target => break</code></div>
      </div>
    `;
  }

  // 4. 渲染实时解集箱
  const nodeMap = new Map<string, BacktrackTreeNode>();
  step.nodes.forEach((nd) => nodeMap.set(nd.id, nd));
  const solutionsUpToNow: Array<Array<number | string>> = (step.foundPathIds || [])
    .map((id) => [...(nodeMap.get(id)?.path ?? [])]);

  const resultCollectionContainer = container.querySelector<HTMLElement>(
    '#cs-result-collection-container'
  );
  if (resultCollectionContainer) {
    BacktrackStateSpacePresenter.renderResultCollection(
      resultCollectionContainer,
      solutionsUpToNow,
      -1
    );
  }
}
