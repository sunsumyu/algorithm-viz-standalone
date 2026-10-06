/**
 * 完全二叉树节点个数表现层适配器 (Count Complete Tree Nodes Canvas & Metrics Adapter)
 * Matt Pocock 深模块设计：将二叉树沙盘渲染、DFS 调用栈序列、左神 2^k 公式定界与二分寻路监控彻底解耦
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { CountNodes036Step } from './count-complete-tree-nodes-step-compiler';

export class CountCompleteTreeNodesCanvasAdapter {
  /**
   * Card 1: 树画布渲染
   */
  static renderCanvas(
    container: HTMLElement,
    step: CountNodes036Step,
    primaryColor: string = '#0284c7'
  ): void {
    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: step.current,
      secondaryHighlightedNodes: step.secondaryNodeId != null ? [step.secondaryNodeId] : [],
      highlightedNodes: step.highlightedNodes || [],
      primaryColor,
      secondaryColor: '#f59e0b',
    });
  }

  /**
   * Card 2 全景指标诊断看板外壳
   */
  private static renderMetricsShell(
    step: CountNodes036Step,
    bufferHtml: string,
    tipHtml: string
  ): string {
    const curVal = step.current != null ? `节点 ${step.current}` : '—';
    const finalVal =
      step.metrics?.['最终结果'] != null
        ? String(step.metrics['最终结果'])
        : (step.statusBadge?.text ?? '计算中...');
    const badgeColor =
      step.statusBadge?.type === 'success'
        ? '#16a34a'
        : step.statusBadge?.type === 'warning'
        ? '#d97706'
        : '#2563eb';

    return `
      <div style="display: flex; flex-direction: column; gap: 10px; padding: 12px 14px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">当前考察节点</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${curVal}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">核验状态</div>
            <div style="font-size: 13px; font-weight: 800; color: ${badgeColor}; margin-top: 2px;">${step.decision.slice(0, 16)}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">当前累计节点数</div>
            <div style="font-size: 14px; font-weight: 800; color: #2563eb; margin-top: 2px;">${finalVal}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">时间复杂度</div>
            <div style="font-size: 13px; font-weight: 800; color: #0d9488; margin-top: 2px;">${step.metrics?.['算法时间复杂度'] ?? 'O((log N)^2)'}</div>
          </div>
        </div>

        <div style="padding: 10px; background: #fafafa; border: 1px solid #e5e7eb; border-radius: 8px;">
          ${bufferHtml}
        </div>

        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 0 6px 6px 0; font-size: 12px; color: #334155;">
          <span>💡</span>
          <span>${tipHtml}</span>
        </div>
      </div>
    `;
  }

  /**
   * Stage 1: 朴素递归 DFS 调用栈监控
   */
  static renderStage1Metrics(container: HTMLElement, step: CountNodes036Step): void {
    const s = step.dfsState;
    const visitedChips = s?.visitedSet
      ? s.visitedSet
          .map(
            (v) =>
              `<span style="padding: 2px 7px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>`
          )
          .join('')
      : '<span style="color:#94a3b8; font-size:11px;">无</span>';

    const bufferHtml = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #166534;">当前递归子树合并公式:</span>
          <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #15803d;">
            ${
              s?.leftCount != null
                ? `左(${s.leftCount}) + 右(${s.rightCount ?? 0}) + 自身(1) = ${s.subTotal ?? '?'}`
                : '递归探测中...'
            }
          </span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">已遍历访问节点序列 (逐一遍历):</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 36px; align-items: center;">
            ${visitedChips}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = this.renderMetricsShell(
      step,
      bufferHtml,
      '基准对照：朴素 DFS 遍历每一个节点，时间复杂度 O(N)。完全二叉树的几何性质可以彻底颠覆这一复杂度！'
    );
  }

  /**
   * Stage 2: 左神满树 2^k 公式剪枝监控
   */
  static renderStage2Metrics(container: HTMLElement, step: CountNodes036Step): void {
    const s = step.zuoshenState;
    const pathChips = s?.pathNodes?.length
      ? s.pathNodes
          .map(
            (v) =>
              `<span style="padding: 2px 7px; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>`
          )
          .join('<span style="color:#d97706; font-size:10px;">→</span>')
      : '<span style="color:#94a3b8; font-size:11px;">无</span>';

    const bufferHtml = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #92400e;">左神 2^k 满树公式剪枝计算:</span>
          <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #b45309;">
            ${s?.formula ?? '探测右子树最左深度...'}
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 600; color: #475569;">右子树最左探测分支路径:</span>
          <div style="display: flex; align-items: center; gap: 4px;">
            ${pathChips}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = this.renderMetricsShell(
      step,
      bufferHtml,
      '左神 Class 036 绝技：每层只需测一次右子树最左深度，两侧必有一侧为满树，直接 2^k 计入！总复杂度严格 O((logN)²)。'
    );
  }

  /**
   * Stage 3: 二分叶子编号与二进制寻路监控
   */
  static renderStage3Metrics(container: HTMLElement, step: CountNodes036Step): void {
    const s = step.binarySearchState;
    const navChips = s?.currentNavPath?.length
      ? s.currentNavPath
          .map(
            (p) => `
        <span style="padding: 2px 7px; background: ${
          p.direction === 'R' ? '#fef3c7' : '#e0f2fe'
        }; color: ${p.direction === 'R' ? '#92400e' : '#0369a1'}; border: 1px solid ${
              p.direction === 'R' ? '#fde68a' : '#bae6fd'
            }; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: monospace;">
          ${p.nodeVal} [${p.direction === 'R' ? '右' : '左'}]
        </span>
      `
          )
          .join('<span style="color:#94a3b8; font-size:10px;">→</span>')
      : '<span style="color:#94a3b8; font-size:11px;">起点根节点</span>';

    const bufferHtml = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 700; color: #1e40af;">二分底层编号区间:</span>
          <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: #1d4ed8;">
            [low = ${s?.low ?? '?'}, high = ${s?.high ?? '?'}] | 探测 mid = ${s?.mid ?? '?'} (0b${
      s?.mid ? s.mid.toString(2) : '?'
    })
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
          <span style="font-size: 11px; font-weight: 600; color: #475569;">二进制寻路下潜路径:</span>
          <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
            ${navChips}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = this.renderMetricsShell(
      step,
      bufferHtml,
      'LeetCode 进阶：底层叶子编号 [2^(h-1), 2^h-1] 二分查找，每次利用二进制位 (mid & bits) 从根节点 O(logN) 寻路！'
    );
  }
}

export const renderCountNodesCanvasForStep = CountCompleteTreeNodesCanvasAdapter.renderCanvas;
