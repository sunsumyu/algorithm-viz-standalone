/**
 * 完全二叉树检验视觉适配器 (Completeness of Binary Tree Canvas Adapter)
 * LeetCode 958 / Class 036 Code05
 * 负责纯净树沙盘与三大阶段定制状态机/静态内存/哨兵监视器
 */

import { TreeCanvasAdapter } from './tree-canvas-adapter';
import {
  Completeness036Step,
  Completeness036StaticQueueState,
} from './completeness-binary-tree-step-compiler';

export function renderCompletenessMetricsShell(step: Completeness036Step, bufferHtml: string): string {
  const isErr = step.isValid === false;
  const isOk = step.isValid === true;
  const bannerBg = isErr ? '#fef2f2' : isOk ? '#f0fdf4' : '#eff6ff';
  const bannerBorder = isErr ? '#fecaca' : isOk ? '#bbf7d0' : '#bfdbfe';
  const bannerColor = isErr ? '#b91c1c' : isOk ? '#15803d' : '#1d4ed8';

  const statusText = isErr
    ? `❌ 校验失败：${step.violationReason || '违反完全二叉树排布准则'}`
    : isOk
    ? '✅ 校验通过：整棵树满足左神两大铁律，判定为合法的完全二叉树 (CBT)！'
    : `🔍 正在校验节点 ${step.current ?? '—'} (leaf = ${step.leaf ? 'TRUE' : 'false'})`;

  return `
    <div style="display: flex; flex-direction: column; gap: 8px; padding: 6px 0;">
      <div style="padding: 8px 12px; background: ${bannerBg}; border: 1.5px solid ${bannerBorder}; border-radius: 8px; font-size: 11.5px; font-weight: 700; color: ${bannerColor}; display: flex; align-items: center; justify-content: space-between;">
        <span>${statusText}</span>
        <span style="font-family: monospace; font-size: 11px; padding: 2px 6px; background: rgba(255,255,255,0.7); border-radius: 4px;">
          ${isOk ? 'Accepted' : isErr ? 'Rejected' : 'Checking'}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
        <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px;">
          <strong style="color: #334155;">铁律 1 (有右无左):</strong>
          <span style="color: ${step.violationReason?.includes('有右无左') ? '#dc2626' : '#16a34a'}; font-weight: 600; margin-left: 4px;">
            ${step.violationReason?.includes('有右无左') ? '❌ 发生违规' : '✓ 严格合规'}
          </span>
        </div>
        <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px;">
          <strong style="color: #334155;">铁律 2 (断点全叶):</strong>
          <span style="color: ${step.violationReason?.includes('非叶子') ? '#dc2626' : step.leaf ? '#d97706' : '#64748b'}; font-weight: 600; margin-left: 4px;">
            ${step.violationReason?.includes('非叶子') ? '❌ 发生违规' : step.leaf ? '⚡ 警戒已开启' : '未触发'}
          </span>
        </div>
      </div>

      ${bufferHtml}
    </div>
  `;
}

/** 缓冲器 1：Stage 1 标准队列与左右孩子双全检查 */
export function renderStage1QueueBufferHtml(step: Completeness036Step): string {
  const chips =
    step.queue.length > 0
      ? step.queue
          .map(
            (v) =>
              `<span style="padding: 2px 7px; background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600;">Node ${v}</span>`
          )
          .join('')
      : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">队列为空</span>';

  const ch = step.childrenCheck;
  const lText = ch?.left !== null && ch?.left !== undefined ? `#${ch.left}` : '<span style="color:#94a3b8;">null</span>';
  const rText = ch?.right !== null && ch?.right !== undefined ? `#${ch.right}` : '<span style="color:#94a3b8;">null</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px;">
        <span style="color: #475569;">当前考察节点左右孩子:</span>
        <span style="font-family: monospace; font-weight: 700; color: #0f172a;">left: ${lText} | right: ${rText}</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">🥞 FIFO 节点队列:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 32px; align-items: center;">
          ${chips}
        </div>
      </div>
    </div>
  `;
}

/** 缓冲器 2：Stage 2 静态数组连续内存条 */
export function renderStage2StaticArrayBufferHtml(state?: Completeness036StaticQueueState): string {
  if (!state) return '';
  const { array, l, r, leaf } = state;
  const maxDisplay = Math.min(Math.max(r + 2, 8), 14);
  const cells: string[] = [];

  for (let i = 0; i < maxDisplay; i++) {
    const val = i < array.length && array[i] != null ? array[i] : '—';
    const isInside = i >= l && i < r;
    const isL = i === l;
    const isR = i === r;

    let bg = '#ffffff';
    let borderColor = '#e2e8f0';
    let textColor = '#64748b';

    if (isInside) {
      bg = '#e0f2fe';
      borderColor = '#7dd3fc';
      textColor = '#0369a1';
    }

    let ptrLabel = '&nbsp;';
    if (isL && isR) ptrLabel = '<span style="color:#ef4444; font-weight:800; font-size:9.5px;">l/r</span>';
    else if (isL) ptrLabel = '<span style="color:#0284c7; font-weight:800; font-size:9.5px;">l↓</span>';
    else if (isR) ptrLabel = '<span style="color:#10b981; font-weight:800; font-size:9.5px;">r↓</span>';

    cells.push(`
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
        <div style="height: 12px; line-height: 12px; font-size: 9px; font-family: monospace;">${ptrLabel}</div>
        <div style="width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1.5px solid ${borderColor}; border-radius: 6px; font-family: monospace; font-size: 11.5px; font-weight: 700; color: ${textColor};">
          ${val}
        </div>
        <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">[${i}]</span>
      </div>
    `);
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: #92400e;">左神静态连续数组 queue[MAXN]:</span>
        <span style="font-size: 12px; font-weight: 700; color: #b45309; font-family: monospace;">
          [l=${l}, r=${r}) | 待检: ${Math.max(0, r - l)} | leaf: ${leaf ? 'TRUE ⚡' : 'false'}
        </span>
      </div>
      <div style="display: flex; gap: 6px; padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow-x: auto;">
        ${cells.join('')}
      </div>
    </div>
  `;
}

/** 缓冲器 3：Stage 3 空节点哨兵单调队列监视器 */
export function renderStage3SentinelBufferHtml(step: Completeness036Step): string {
  const state = step.sentinelState;
  if (!state) return '';
  const { reachedNull, queue } = state;

  const chips =
    queue.length > 0
      ? queue
          .map((v) => {
            const isN = v === 'null';
            const bg = isN ? '#f1f5f9' : '#dbeafe';
            const border = isN ? '#cbd5e1' : '#bfdbfe';
            const text = isN ? '#94a3b8' : '#1e40af';
            return `<span style="padding: 2px 7px; background: ${bg}; color: ${text}; border: 1px solid ${border}; border-radius: 4px; font-size: 11px; font-family: monospace; font-weight: 600;">${v}</span>`;
          })
          .join('')
      : '<span style="color:#94a3b8; font-size:11px;">队列已清空</span>';

  return `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: ${
        reachedNull ? '#fffbeb' : '#f0fdf4'
      }; border: 1px solid ${reachedNull ? '#fde68a' : '#bbf7d0'}; border-radius: 6px;">
        <span style="font-size: 11px; font-weight: 700; color: ${reachedNull ? '#92400e' : '#166534'};">空哨兵触发状态 reachedNull:</span>
        <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: ${
          reachedNull ? '#b45309' : '#15803d'
        };">
          ${reachedNull ? '⚡ 已遇到首个 null (后方绝不能再有节点)' : '尚未遇到 null'}
        </span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <span style="font-size: 11px; font-weight: 700; color: #334155;">🧱 含 null 哨兵全量展开队列:</span>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 6px 10px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; min-height: 36px; align-items: center;">
          ${chips}
        </div>
      </div>
    </div>
  `;
}

/** 统一画布呈现 */
export function renderCompletenessCanvasForStep(
  container: HTMLElement,
  step: Completeness036Step,
  primaryColor: string = '#0284c7'
): void {
  const isErr = step.isValid === false;
  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.current,
    secondaryHighlightedNodes: step.queue.filter((q): q is number => typeof q === 'number'),
    visitedNodes: [],
    primaryColor: isErr ? '#ef4444' : primaryColor,
    secondaryColor: '#38bdf8',
    visitedColor: '#34d399',
  });
}

export const CompletenessBinaryTreeCanvasAdapter = {
  renderCanvas: renderCompletenessCanvasForStep,
  renderStage1Metrics: (container: HTMLElement, step: Completeness036Step) => {
    container.innerHTML = renderCompletenessMetricsShell(step, renderStage1QueueBufferHtml(step));
  },
  renderStage2Metrics: (container: HTMLElement, step: Completeness036Step) => {
    container.innerHTML = renderCompletenessMetricsShell(step, renderStage2StaticArrayBufferHtml(step.staticQueueState));
  },
  renderStage3Metrics: (container: HTMLElement, step: Completeness036Step) => {
    container.innerHTML = renderCompletenessMetricsShell(step, renderStage3SentinelBufferHtml(step));
  },
};
