/**
 * 组合问题可视化器（回溯算法）
 * Canvas Adapter
 */

import {
  BacktrackStateSpacePresenter,
} from '../../../core/renderers/backtrack-state-space-presenter';
import {
  BacktrackTreeNode,
  renderBacktrackTree,
  resetContainerViewState,
} from './backtracking-tree-helper';
import { CombinationStep } from './combination-step-compiler';

export function renderCombinationCanvas(container: HTMLElement, step: CombinationStep): void {
  // 骨架仅在切换运行（决策树变化）时重建，保证树视口缩放/平移状态跨步保留
  const skeletonKey = `${step.nodes.length}:${step.nodes[0]?.id ?? ''}`;
  if (container.dataset.combinationSkeletonKey !== skeletonKey) {
    const prevTree = container.querySelector<HTMLElement>('#combination-tree-display');
    resetContainerViewState(prevTree);
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%; box-sizing: border-box; gap: 8px;">
        <div id="combination-tree-display" style="flex: 1; min-height: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;"></div>
        <div style="display: flex; gap: 8px; height: 112px; flex-shrink: 0;">
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">📚 当前路径栈 path</div>
            <div id="cs-path-stack-container" style="min-height: 24px;"></div>
          </div>
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">🔍 搜索状态</div>
            <div id="cs-search-state-container"></div>
          </div>
          <div style="flex: 1.4; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">✅ 解集箱（合法组合）</div>
            <div id="cs-result-collection-container" style="min-height: 24px;"></div>
          </div>
        </div>
      </div>
    `;
    container.dataset.combinationSkeletonKey = skeletonKey;
  }

  // 1. 渲染 SVG 决策树沙盘
  const treeDisplay = container.querySelector<HTMLElement>('#combination-tree-display');
  if (treeDisplay) {
    renderBacktrackTree({
      container: treeDisplay,
      step,
      cssPrefix: 'cs',
    });
  }

  // 2. 渲染当前路径栈
  const pathStackContainer = container.querySelector<HTMLElement>('#cs-path-stack-container');
  if (pathStackContainer) {
    BacktrackStateSpacePresenter.renderPathStack(pathStackContainer, step.path, {
      highlightLast: true,
      action: step.action === 'push' ? 'push' : step.action === 'pop' ? 'pop' : step.action === 'found' ? 'collect' : 'idle',
    });
  }

  // 3. 渲染搜索状态
  const searchStateContainer = container.querySelector<HTMLElement>('#cs-search-state-container');
  if (searchStateContainer) {
    BacktrackStateSpacePresenter.renderVariableWatch(searchStateContainer, [
      { label: 'startIndex', value: step.startIndex, highlight: true },
      { label: '当前 i', value: step.i ?? '-' },
      { label: '目标 k', value: step.k },
      { label: '还需元素', value: Math.max(0, step.k - step.path.length), highlight: step.path.length === step.k },
    ]);
  }

  // 4. 渲染实时解集箱
  const results: Array<number[]> = [];
  const foundIds = step.foundPathIds || [];
  const nodeMap = new Map<string, BacktrackTreeNode>();
  step.nodes.forEach((nd) => nodeMap.set(nd.id, nd));

  foundIds.forEach((id) => {
    const nd = nodeMap.get(id);
    if (nd && nd.path.length === step.k) {
      results.push([...nd.path] as number[]);
    }
  });

  const resultCollectionContainer = container.querySelector<HTMLElement>(
    '#cs-result-collection-container'
  );
  if (resultCollectionContainer) {
    BacktrackStateSpacePresenter.renderResultCollection(
      resultCollectionContainer,
      results,
      results.length - 1
    );
  }
}
