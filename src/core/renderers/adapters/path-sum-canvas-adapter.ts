/**
 * 路径总和表现层适配器 (Path Sum Canvas & Metrics Adapter)
 * Matt Pocock 深模块设计：将二叉树拓扑沙盘、调用栈推演与状态指标渲染彻底解耦
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import { PSStep, collectTreeValues } from './path-sum-step-compiler';

export class PathSumCanvasAdapter {
  /**
   * Card 1: 渲染二叉树拓扑与当前回溯路径沙盘
   */
  static renderCanvas(container: HTMLElement, step: PSStep): void {
    const isDone = step.action === 'done';
    const allTreeVals = collectTreeValues(step.tree);
    const matchedNodes = step.highlightedNodes && step.highlightedNodes.length > 0
      ? step.highlightedNodes
      : step.path;

    let current = step.current;
    let visitedNodes = step.visitedNodes;

    if (isDone && step.tree) {
      if (current === null) {
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
      secondaryHighlightedNodes: matchedNodes && matchedNodes.length > 0 ? matchedNodes : undefined,
      primaryColor: step.found ? '#10b981' : '#fbbf24',
      secondaryColor: '#93c5fd',
      visitedColor: '#34d399',
    });
  }

  /**
   * Card 2: Stage 1 递归减法回溯与推演栈监视器
   */
  static renderStage1CustomMetrics(container: HTMLElement, step: PSStep): void {
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; gap: 6px; font-size: 11px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; flex-shrink: 0;">
          <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; color: #64748b;">当前节点:</span>
            <span style="font-weight: 700; font-size: 12px; color: #2563eb;">${step.current != null ? `Node(${step.current})` : '空'}</span>
          </div>
          <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; color: #64748b;">剩余需求 (remain):</span>
            <span style="font-weight: 700; font-size: 12px; color: #f59e0b;">${step.remain}</span>
          </div>
        </div>
        <div class="ps-trace-host" style="flex: 1; min-height: 120px; overflow: hidden;"></div>
      </div>
    `;
    if (step.callTrace) {
      const traceHost = container.querySelector('.ps-trace-host') as HTMLElement | null;
      if (traceHost) {
        RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
          title: '📜 路径总和减法回溯推演栈',
          theme: 'light',
          maxHeight: '100%',
          showTerminalHeader: true,
        });
      }
    }
  }

  /**
   * Card 2: Stage 2 回溯现场恢复与全解收集监视器
   */
  static renderStage2CustomMetrics(container: HTMLElement, step: PSStep): void {
    const pathChips =
      step.path.length > 0
        ? step.path
            .map(
              (v, idx) => `
            <div style="display: flex; align-items: center;">
              <span style="padding: 2px 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>
              ${idx < step.path.length - 1 ? '<span style="color: #94a3b8; font-size: 10px; margin: 0 4px;">➔</span>' : ''}
            </div>`
            )
            .join('')
        : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">路径为空 (初始或已回溯至根外)</span>';

    const allPathsHtml =
      step.allPaths.length > 0
        ? step.allPaths
            .map(
              (p, idx) => `
            <div style="display: flex; align-items: center; gap: 6px; padding: 2px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
              <span style="font-size: 10.5px; font-weight: 700; color: #166534;">解 ${idx + 1}:</span>
              <span style="font-size: 11px; font-family: monospace; color: #15803d; font-weight: 600;">[${p.join(' ➔ ')}]</span>
            </div>`
            )
            .join('')
        : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">等待首条匹配路径...</span>';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; color: #64748b;">目标和:</span>
            <span style="font-weight: 700; font-size: 13px; color: #0f172a;">${step.targetSum}</span>
          </div>
          <div style="padding: 4px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; color: #64748b;">已收录解数:</span>
            <span style="font-weight: 700; font-size: 13px; color: #166534;">${step.allPaths.length} 条</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155;">当前路径栈 (DFS 现场):</span>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            ${pathChips}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155;">已收集有效路径总集 (LC 113):</span>
          <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            ${allPathsHtml}
          </div>
        </div>
        <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
          <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
          <div>${step.message}</div>
        </div>
      </div>
    `;
  }

  /**
   * Card 2: Stage 3 迭代 BFS 双队列管道监视器
   */
  static renderStage3CustomMetrics(container: HTMLElement, step: PSStep): void {
    const pathChips =
      step.path.length > 0
        ? step.path
            .map(
              (v, idx) => `
            <div style="display: flex; align-items: center;">
              <span style="padding: 2px 8px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace;">${v}</span>
              ${idx < step.path.length - 1 ? '<span style="color: #94a3b8; font-size: 10px; margin: 0 4px;">➔</span>' : ''}
            </div>`
            )
            .join('')
        : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">路径为空</span>';

    const qChips = (step.nodeQueue || [])
      .map(
        (v) =>
          `<span style="padding: 2px 7px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 4px; font-weight: 700; color: #166534; font-size: 11px; font-family: monospace;">${v}</span>`
      )
      .join('');
    const sumChips = (step.sumQueue || [])
      .map(
        (v) =>
          `<span style="padding: 2px 7px; background: #fefce8; border: 1px solid #fde047; border-radius: 4px; font-weight: 700; color: #854d0e; font-size: 11px; font-family: monospace;">${v}</span>`
      )
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
        <div style="display: flex; flex-direction: column; gap: 6px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: #166534; min-width: 70px;">nodeQueue:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">${qChips || '<span style="color:#94a3b8; font-style:italic;">空</span>'}</div>
          </div>
          <div style="display: align-items: center; gap: 8px; display: flex;">
            <span style="font-size: 11px; font-weight: 700; color: #854d0e; min-width: 70px;">sumQueue:</span>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">${sumChips || '<span style="color:#94a3b8; font-style:italic;">空</span>'}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: #334155;">当前考察路径:</span>
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            ${pathChips}
          </div>
        </div>
        <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
          <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
          <div>${step.message}</div>
        </div>
      </div>
    `;
  }
}

export const renderPathSumCanvas = PathSumCanvasAdapter.renderCanvas;
export const renderStage1CustomMetrics = PathSumCanvasAdapter.renderStage1CustomMetrics;
export const renderStage2CustomMetrics = PathSumCanvasAdapter.renderStage2CustomMetrics;
export const renderStage3CustomMetrics = PathSumCanvasAdapter.renderStage3CustomMetrics;
