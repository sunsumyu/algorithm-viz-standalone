/**
 * Class 156: 可持久化线段树 / 主席树 (Persistent Segment Tree) 领域视觉适配器
 * 核心：多版本根节点与共享结构展板、当前版本卡、空间增量比率卡与前缀差分检索引擎公式卡
 */

import { PersistentSegStep } from './persistent-segment-tree-step-compiler';
import { renderPersistentSegTreeBoard } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderPersistentSegmentTreeCanvas(container: HTMLElement, step: PersistentSegStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderPersistentSegTreeBoard(step.versions, step.activeVersion, step.kthResult)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前操作版本</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
            ${step.activeVersion > 0 ? `Version ${step.activeVersion}` : '版本就绪'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">空间增量比率</div>
          <div style="font-size: 16px; font-weight: 700; color: #059669;">仅增加 O(log N) 节点</div>
        </div>
      </div>

      ${renderFormulaCard(
        '主席树前缀差分检索引擎',
        `区间差分公式: Count_{[L, R]} = Tree[R] - Tree[L - 1] | 若 count(左) &ge; k 往左搜，否则往右搜第 (k - count) 小`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
