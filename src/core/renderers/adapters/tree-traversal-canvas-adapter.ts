/**
 * Tree Traversal Canvas Adapter
 * 二叉树遍历画布呈现与指标监视器
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { TTStep } from './tree-traversal-step-compiler';

// ============================================================
// Canvas renderers
// ============================================================

/** 通用二叉树画布渲染 */
export function renderTraversalCanvas(container: HTMLElement, step: TTStep): void {
  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.current,
    secondaryHighlightedNodes: step.result,
    primaryColor: '#fbbf24',
    secondaryColor: '#34d399',
  });
}

// ============================================================
// Custom metrics renderers
// ============================================================

/** Stage 1 递归指标 — 调用栈深度 + 输出序列 */
export function renderRecursiveMetrics(container: HTMLElement, step: TTStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 4px 0;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="padding: 4px 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
          <span style="font-size: 10px; color: #64748b;">递归栈深度</span>
          <span style="font-size: 14px; font-weight: 700; color: #1d4ed8; margin-left: 6px;">${step.depth}</span>
        </div>
        <div style="padding: 4px 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px;">
          <span style="font-size: 10px; color: #64748b;">已访问</span>
          <span style="font-size: 14px; font-weight: 700; color: #15803d; margin-left: 6px;">${step.visited}</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569;">已输出序列:</span>
        <div style="padding: 4px 8px; background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 700; color: #16a34a;">
          [ ${step.result.join(', ')} ]
        </div>
      </div>
      <div style="padding: 6px 8px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
        ${step.message}
      </div>
    </div>
  `;
}

/** Stage 2 迭代指标 — 显式栈内容 + 输出序列 */
export function renderIterativeMetrics(container: HTMLElement, step: TTStep): void {
  const stackChips =
    step.stack && step.stack.length > 0
      ? step.stack
          .map(
            (v, i) => `
        <span style="padding: 3px 8px; background: ${
          i === step.stack!.length - 1 ? '#fef3c7' : '#f1f5f9'
        }; border: 1px solid ${
              i === step.stack!.length - 1 ? '#f59e0b' : '#e2e8f0'
            }; border-radius: 6px; font-size: 11px; font-weight: 700; font-family: monospace; color: ${
              i === step.stack!.length - 1 ? '#92400e' : '#475569'
            };">${v}${i === step.stack!.length - 1 ? ' ⬆' : ''}</span>
      `
          )
          .join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">栈为空</span>';

  const collectHtml = step.collectStack
    ? `<div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569;">📥 收集栈 s2:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 8px; background: #fef2f2; border: 1px dashed #fca5a5; border-radius: 6px;">
          ${
            step.collectStack.length > 0
              ? step.collectStack
                  .map(
                    (v) =>
                      `<span style="padding: 2px 6px; background: #fff; border: 1px solid #fca5a5; border-radius: 4px; font-size: 11px; font-weight: 600; font-family: monospace; color: #dc2626;">${v}</span>`
                  )
                  .join('')
              : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">空</span>'
          }
        </div>
      </div>`
    : '';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 4px 0;">
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569;">🥞 工作栈 (底→顶):</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 4px 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">
          ${stackChips}
        </div>
      </div>
      ${collectHtml}
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569;">📜 输出序列:</span>
        <div style="padding: 4px 8px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: 700; color: #15803d;">
          [ ${step.result.join(', ')} ]
        </div>
      </div>
      <div style="padding: 6px 8px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
        ${step.message}
      </div>
    </div>
  `;
}
