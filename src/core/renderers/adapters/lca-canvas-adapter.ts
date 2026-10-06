/**
 * 二叉树最近公共祖先 (Lowest Common Ancestor · LeetCode 236) 拓扑画布与看板呈现适配器
 *
 * 遵循深模块架构：
 *   - 委托 TreeCanvasAdapter 进行二叉树拓扑绘制与焦点、路径高亮
 *   - 委托 RecursiveCallTraceAdapter 挂载 Stage 1 递归推演栈
 *   - 为 Stage 2 父指针哈希与 Stage 3 显式双路径提供高质感状态指标呈现
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import { RecursiveCallTraceAdapter } from './recursive-call-trace-adapter';
import type { LCAStep } from './lca-step-compiler';

export function renderLcaCanvas(
  container: HTMLElement,
  step: LCAStep,
  stageId: 'stage-1' | 'stage-2' | 'stage-3' = 'stage-1'
) {
  // 收集需要高亮的节点
  const targets = [step.p, step.q];
  let secondaryNodes = [...targets];

  if (stageId === 'stage-2' && step.visitedAncestors) {
    secondaryNodes = Array.from(new Set([...targets, ...step.visitedAncestors]));
  } else if (stageId === 'stage-3') {
    const pNodes = step.pathP || [];
    const qNodes = step.pathQ || [];
    secondaryNodes = Array.from(new Set([...targets, ...pNodes, ...qNodes]));
  }

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.lcaResult !== null ? step.lcaResult : step.current,
    secondaryHighlightedNodes: secondaryNodes,
    primaryColor: step.lcaResult !== null ? '#16a34a' : '#3b82f6',
    secondaryColor: '#fbbf24',
  });

  const root = container.closest('#algo-lca-view') || container.parentElement;
  if (root) {
    const curEl = root.querySelector('#metric-cur-node');
    const lEl = root.querySelector('#metric-left-ret');
    const rEl = root.querySelector('#metric-right-ret');
    const lcaEl = root.querySelector('#metric-lca-val') as HTMLElement | null;

    if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';

    if (stageId === 'stage-1') {
      if (lEl) lEl.textContent = step.leftReturn != null ? `${step.leftReturn}` : 'null';
      if (rEl) rEl.textContent = step.rightReturn != null ? `${step.rightReturn}` : 'null';
    } else if (stageId === 'stage-2') {
      if (lEl) lEl.textContent = step.visitedAncestors ? `${step.visitedAncestors.length} 个` : '0 个';
      if (rEl) rEl.textContent = step.parentMap ? `${Object.keys(step.parentMap).length} 个` : '0 个';
    } else if (stageId === 'stage-3') {
      if (lEl) lEl.textContent = step.pathP ? `${step.pathP.length} 步` : '0 步';
      if (rEl) rEl.textContent = step.pathQ ? `${step.pathQ.length} 步` : '0 步';
    }

    if (lcaEl) {
      lcaEl.textContent = step.lcaResult != null ? `${step.lcaResult}` : '未捕获';
      lcaEl.style.color = step.lcaResult != null ? '#16a34a' : '#64748b';
    }

    // 在 Card 2 中展示当前阶段的状态机与推演细节
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      let stageSpecificHtml = '';

      if (stageId === 'stage-1') {
        stageSpecificHtml = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span style="font-size: 10.5px; color: #64748b;">左子树 leftRet:</span>
              <div style="font-weight: 700; font-size: 12px; color: ${step.leftReturn != null ? '#2563eb' : '#94a3b8'};">
                ${step.leftReturn != null ? step.leftReturn : 'null'}
              </div>
            </div>
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span style="font-size: 10.5px; color: #64748b;">右子树 rightRet:</span>
              <div style="font-weight: 700; font-size: 12px; color: ${step.rightReturn != null ? '#0d9488' : '#94a3b8'};">
                ${step.rightReturn != null ? step.rightReturn : 'null'}
              </div>
            </div>
          </div>
        `;
      } else if (stageId === 'stage-2') {
        const visitedBadges = (step.visitedAncestors || []).map(
          (val) => `<span style="padding: 2px 7px; background: #dcfce7; border: 1px solid #86efac; border-radius: 4px; font-weight: 700; color: #166534;">${val}</span>`
        ).join(' → ') || '<span style="color: #94a3b8; font-style: italic;">暂无</span>';

        const parentPairs = Object.entries(step.parentMap || {}).map(
          ([child, parent]) => `<span style="padding: 2px 5px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 10.5px;">${child}→${parent ?? 'null'}</span>`
        ).join(' ');

        stageSpecificHtml = `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <div style="font-size: 10.5px; color: #64748b; margin-bottom: 3px;">🌿 p 的祖先回溯集合 visited:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center; font-size: 11px;">
                ${visitedBadges}
              </div>
            </div>
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <div style="font-size: 10.5px; color: #64748b; margin-bottom: 3px;">🗺️ 父指针哈希表 parentMap:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; max-height: 55px; overflow-y: auto;">
                ${parentPairs || '<span style="color: #94a3b8;">暂无映射</span>'}
              </div>
            </div>
          </div>
        `;
      } else if (stageId === 'stage-3') {
        const pathPBadges = (step.pathP || []).map((val, idx) => {
          const isLCA = step.lcaResult === val;
          const isCmp = step.comparingIndex === idx;
          const bg = isLCA ? '#dcfce7' : isCmp ? '#fef3c7' : '#f1f5f9';
          const border = isLCA ? '#16a34a' : isCmp ? '#f59e0b' : '#cbd5e1';
          const textCol = isLCA ? '#166534' : isCmp ? '#b45309' : '#334155';
          return `<span style="padding: 2px 6px; background: ${bg}; border: 1px solid ${border}; border-radius: 4px; font-weight: 700; color: ${textCol}; font-family: monospace;">${val}</span>`;
        }).join(' → ') || '<span style="color: #94a3b8; font-style: italic;">探测中...</span>';

        const pathQBadges = (step.pathQ || []).map((val, idx) => {
          const isLCA = step.lcaResult === val;
          const isCmp = step.comparingIndex === idx;
          const bg = isLCA ? '#dcfce7' : isCmp ? '#fef3c7' : '#f1f5f9';
          const border = isLCA ? '#16a34a' : isCmp ? '#f59e0b' : '#cbd5e1';
          const textCol = isLCA ? '#166534' : isCmp ? '#b45309' : '#334155';
          return `<span style="padding: 2px 6px; background: ${bg}; border: 1px solid ${border}; border-radius: 4px; font-weight: 700; color: ${textCol}; font-family: monospace;">${val}</span>`;
        }).join(' → ') || '<span style="color: #94a3b8; font-style: italic;">探测中...</span>';

        stageSpecificHtml = `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <div style="font-size: 10.5px; color: #2563eb; font-weight: 700; margin-bottom: 3px;">🛤️ 路径 P (Root → ${step.p}):</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center; font-size: 11px;">
                ${pathPBadges}
              </div>
            </div>
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <div style="font-size: 10.5px; color: #0d9488; font-weight: 700; margin-bottom: 3px;">🛤️ 路径 Q (Root → ${step.q}):</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center; font-size: 11px;">
                ${pathQBadges}
              </div>
            </div>
          </div>
        `;
      }

      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
            <span style="font-weight: 700; color: #92400e;">🎯 检索目标节点对:</span>
            <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #b45309;">p = ${step.p}，q = ${step.q}</span>
          </div>

          ${stageSpecificHtml}

          <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
            <div>${step.message}</div>
          </div>
        </div>
      `;
    }
  }
}

export function renderLcaStage1CustomMetrics(container: HTMLElement, step: LCAStep) {
  const curVal = step.current != null ? `Node(${step.current})` : '—';
  const leftVal = step.leftReturn != null ? `Node(${step.leftReturn})` : 'null';
  const rightVal = step.rightReturn != null ? `Node(${step.rightReturn})` : 'null';
  const lcaText = step.lcaResult != null ? `Node(${step.lcaResult})` : '未捕获';
  const lcaColor = step.lcaResult != null ? '#16a34a' : '#64748b';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 6px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">当前考察节点</div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 1px;">${curVal}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">left 返回值</div>
          <div style="font-size: 13px; font-weight: 800; color: #2563eb; margin-top: 1px;">${leftVal}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">right 返回值</div>
          <div style="font-size: 13px; font-weight: 800; color: #9333ea; margin-top: 1px;">${rightVal}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
          <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">当前捕获 LCA</div>
          <div style="font-size: 13px; font-weight: 800; color: ${lcaColor}; margin-top: 1px;">${lcaText}</div>
        </div>
      </div>

      <div class="lca-trace-host" style="flex: 1; min-height: 140px; overflow: hidden;"></div>
    </div>
  `;

  if (step.callTrace) {
    const traceHost = container.querySelector('.lca-trace-host') as HTMLElement | null;
    if (traceHost) {
      RecursiveCallTraceAdapter.render(traceHost, step.callTrace, {
        title: '📜 最近公共祖先 (LCA) 后序递归推演栈',
        theme: 'light',
        maxHeight: '100%',
        showTerminalHeader: true,
      });
    }
  }
}

export class LcaCanvasAdapter {
  public static renderCanvas = renderLcaCanvas;
  public static renderStage1CustomMetrics = renderLcaStage1CustomMetrics;
}
