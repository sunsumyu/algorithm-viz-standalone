/**
 * 子集画布适配器
 * 负责渲染决策树沙盘与底部状态空间面板
 */

import { BacktrackStateSpacePresenter } from '../../../core/renderers/backtrack-state-space-presenter';
import { renderBacktrackTree, resetContainerViewState } from './backtracking-tree-helper';
import { SubsetStep } from './subset-step-compiler';

/* ── Card 1 主视觉：决策树沙盘 + 底部状态空间条 ─────────────── */
export function renderSubsetCanvas(container: HTMLElement, step: SubsetStep): void {
  // 骨架仅在切换运行（决策树变化）时重建，保证树视口缩放/平移状态跨步保留
  const skeletonKey = `${step.nodes.length}:${step.nodes[0]?.id ?? ''}`;
  if (container.dataset.subsetSkeletonKey !== skeletonKey) {
    const prevTree = container.querySelector<HTMLElement>('#subset-tree-display');
    resetContainerViewState(prevTree);
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%; box-sizing: border-box; gap: 8px;">
        <div id="subset-tree-display" style="flex: 1; min-height: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;"></div>
        <div style="display: flex; gap: 8px; height: 118px; flex-shrink: 0;">
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">📚 当前路径栈 path</div>
            <div id="sb-path-stack-container" style="min-height: 24px;"></div>
          </div>
          <div style="flex: 1; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">📦 幂集收集监视器</div>
            <div id="sb-collector-monitor-container"></div>
          </div>
          <div style="flex: 1.4; min-width: 0; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 6px 10px; box-sizing: border-box; overflow: auto;">
            <div style="font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 4px;">✅ 解集箱（已收集子集）</div>
            <div id="sb-result-collection-container" style="min-height: 24px;"></div>
          </div>
        </div>
      </div>
    `;
    container.dataset.subsetSkeletonKey = skeletonKey;
  }

  // 1. 渲染 SVG 决策树沙盘
  const treeDisplay = container.querySelector<HTMLElement>('#subset-tree-display');
  if (treeDisplay) {
    renderBacktrackTree({
      container: treeDisplay,
      step,
      cssPrefix: 'sb',
      nodeLabel: (nd) => (nd.id === 'root' ? '[]' : nd.value),
    });
  }

  // 2. 渲染当前路径栈
  const pathStackContainer = container.querySelector<HTMLElement>('#sb-path-stack-container');
  if (pathStackContainer) {
    const isPush = step.message.includes('做选择');
    const isPop = step.message.includes('回溯撤销');
    const isCollect = step.message.includes('收集子集');
    BacktrackStateSpacePresenter.renderPathStack(pathStackContainer, step.path || [], {
      action: isPush ? 'push' : isPop ? 'pop' : isCollect ? 'collect' : 'idle',
    });
  }

  // 3. 渲染全节点收集监视器
  const rootNode = step.nodes.find((n) => n.id === 'root');
  const nums = rootNode ? rootNode.children.map((c) => parseInt(c.value, 10)) : [];
  const totalPowerSet = Math.pow(2, nums.length);

  const nodeMap = new Map(step.nodes.map((n) => [n.id, n]));
  const solutionsUpToNow: number[][] = step.foundPathIds.map(
    (id) => [...((nodeMap.get(id)?.path as number[]) ?? [])]
  );

  const collectorMonitorContainer = container.querySelector<HTMLElement>(
    '#sb-collector-monitor-container'
  );
  if (collectorMonitorContainer) {
    const percent = Math.min(100, (solutionsUpToNow.length / totalPowerSet) * 100);
    collectorMonitorContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>幂集收集: <strong style="color: #0f172a; font-family: monospace; font-size: 12px;">${solutionsUpToNow.length}</strong> / 2^${nums.length} = ${totalPowerSet}</span>
          <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">
            ${percent.toFixed(0)}% 完成
          </span>
        </div>
        <div style="background: #f1f5f9; border-radius: 6px; height: 6px; overflow: hidden; position: relative;">
          <div style="background: #10b981; width: ${percent}%; height: 100%; transition: width 0.2s;"></div>
        </div>
        <div style="font-size: 10.5px; color: #64748b; line-height: 1.4;">
          <div>• 特征: 每一个节点进入即 <code style="color:#b45309; font-family:monospace;">res.add(path)</code></div>
          <div>• 无需剪枝，全树展开遍历所有路径</div>
        </div>
      </div>
    `;
  }

  // 4. 渲染实时解集箱
  const resultCollectionContainer = container.querySelector<HTMLElement>(
    '#sb-result-collection-container'
  );
  if (resultCollectionContainer) {
    BacktrackStateSpacePresenter.renderResultCollection(
      resultCollectionContainer,
      solutionsUpToNow,
      -1
    );
  }
}
