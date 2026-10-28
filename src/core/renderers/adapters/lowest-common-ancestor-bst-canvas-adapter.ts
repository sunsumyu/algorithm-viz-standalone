/**
 * Lowest Common Ancestor in BST Canvas Adapter (LeetCode 235 / Class 037 Code02)
 *
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)。
 * Card 1: 委托 renderTreeSvg 渲染二叉搜索树分叉节点与 LCA 激活高亮；
 * Card 2: 统一接入全库标准顶层抽象 RecursiveCallTraceAdapter (Stage 1) 与迭代状态监视器 (Stage 2)。
 */

import { Tree036Step, renderTreeSvg } from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';
import { BST_LCA_NODES } from './lowest-common-ancestor-bst-step-compiler';
export function renderLcaBstCanvas(container: HTMLElement, step: Tree036Step): void {
  const treeNodes = (step.extraData as any)?.treeNodes || BST_LCA_NODES;
  const badges: Record<number, string> = {};

  const pVal = step.metrics?.['目标 p'];
  const qVal = step.metrics?.['目标 q'];
  for (const n of treeNodes) {
    if (n.val === Number(pVal)) badges[n.id] = '目标 p';
    if (n.val === Number(qVal)) badges[n.id] = '目标 q';
  }

  const isLcaHit = step.statusBadge?.type === 'success' && step.activeNodeId;
  if (isLcaHit) {
    badges[step.activeNodeId!] = '🎯 LCA';
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; min-height: 280px; box-sizing: border-box; padding: 8px;">
      ${renderTreeSvg(treeNodes, step.activeNodeId, step.secondaryNodeId, isLcaHit ? '#10b981' : '#3b82f6', badges)}
    </div>
  `;
}

export class LowestCommonAncestorBstCanvasAdapter {
  static renderCanvas = renderLcaBstCanvas;

  /** Stage 1: 递归分流状态与单调判定看板 (全景推演树由 Card 1 子视图接管) */
  static renderStage1Metrics(container: HTMLElement, step: Tree036Step): void {
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText =
      'width: 100%; height: 100%; box-sizing: border-box; overflow: hidden; padding: 4px; display: flex; flex-direction: column;';

    const recurBox = document.createElement('div');
    recurBox.style.cssText =
      'flex: 1; min-height: 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; font-size: 11px; overflow-y: auto;';

    const p = step.metrics?.['目标 p'] ?? '?';
    const q = step.metrics?.['目标 q'] ?? '?';
    const curVal = step.activeNodeId ? `Node(${step.activeNodeId})` : '-';
    const cmp = step.metrics?.['比较条件'] ?? step.metrics?.['数值比较'] ?? '单调性比较';
    const direction = step.metrics?.['走向'] ?? '下潜递归分支';
    const isLca = step.statusBadge?.type === 'success';

    recurBox.innerHTML = `
      <div style="font-weight: 700; color: #475569; display: flex; align-items: center; justify-content: space-between;">
        <span>🌲 BST 递归单调分流监视器</span>
        <span style="font-size: 10px; color: #2563eb; background: #eff6ff; padding: 1px 6px; border-radius: 4px; font-weight: 700;">分治定理</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
        <div style="background: #ffffff; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 10px;">目标节点 [p, q]</div>
          <div style="font-weight: 700; color: #d97706; font-size: 12px;">[${p}, ${q}]</div>
        </div>
        <div style="background: #ffffff; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 10px;">当前递归根节点</div>
          <div style="font-weight: 700; color: #2563eb; font-size: 12px;">${curVal}</div>
        </div>
      </div>
      <div style="background: #ffffff; padding: 7px 9px; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 3px;">
        <div style="color: #64748b; font-size: 10px;">单调分流判别</div>
        <div style="font-family: monospace; font-size: 11px; color: #0f172a; font-weight: 600;">${cmp}</div>
        <div style="font-size: 10.5px; color: ${isLca ? '#047857' : '#2563eb'}; font-weight: 700;">➔ ${direction}</div>
      </div>
    `;
    container.appendChild(recurBox);
  }

  /** Stage 2: 迭代常数空间指针移动状态看板 (扁平化呈现，消除文本复读) */
  static renderStage2Metrics(container: HTMLElement, step: Tree036Step): void {
    if (!container) return;
    container.innerHTML = '';
    container.style.cssText =
      'width: 100%; height: 100%; box-sizing: border-box; overflow: hidden; padding: 4px; display: flex; flex-direction: column;';

    const iterBox = document.createElement('div');
    iterBox.style.cssText =
      'flex: 1; min-height: 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; font-size: 11px; overflow-y: auto;';

    const p = step.metrics?.['目标 p'] ?? '?';
    const q = step.metrics?.['目标 q'] ?? '?';
    const curPtr = step.metrics?.['当前指针'] ?? '-';
    const cmp = step.metrics?.['比较条件'] ?? step.metrics?.['数值比较'] ?? '待比较';
    const direction = step.metrics?.['走向'] ?? '检查当前节点';
    const lcaAns = step.metrics?.['分叉节点 (LCA)'] ?? '查找中...';

    iterBox.innerHTML = `
      <div style="font-weight: 700; color: #475569; display: flex; align-items: center; justify-content: space-between;">
        <span>🔁 迭代指针状态流 (Space: O(1))</span>
        <span style="font-size: 10px; color: #0284c7; background: #e0f2fe; padding: 1px 6px; border-radius: 4px;">无函数栈开销</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px;">
        <div style="background: #ffffff; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 10px;">目标区间 [p, q]</div>
          <div style="font-weight: 700; color: #d97706; font-size: 12px;">[${p}, ${q}]</div>
        </div>
        <div style="background: #ffffff; padding: 6px 8px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <div style="color: #64748b; font-size: 10px;">当前 root 指针</div>
          <div style="font-weight: 700; color: #2563eb; font-size: 12px;">${curPtr}</div>
        </div>
      </div>
      <div style="background: #ffffff; padding: 7px 9px; border-radius: 6px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 3px;">
        <div style="color: #64748b; font-size: 10px;">单调条件判定</div>
        <div style="font-family: monospace; font-size: 11px; color: #0f172a; font-weight: 600;">${cmp}</div>
        <div style="font-size: 10.5px; color: #059669; font-weight: 600;">➔ ${direction}</div>
      </div>
      <div style="background: ${String(lcaAns).includes('节点') ? '#ecfdf5' : '#ffffff'}; padding: 7px 9px; border-radius: 6px; border: 1px solid ${String(lcaAns).includes('节点') ? '#a7f3d0' : '#e2e8f0'};">
        <div style="color: #64748b; font-size: 10px;">LCA 最终归宿</div>
        <div style="font-size: 12px; font-weight: 700; color: ${String(lcaAns).includes('节点') ? '#047857' : '#94a3b8'};">${lcaAns}</div>
      </div>
    `;
    container.appendChild(iterBox);
  }
}
