/**
 * Class 151: 跳表 (SkipList) 领域视觉适配器
 * 核心：跳表多层拓扑网格、当前操作值指示卡、总节点数指标卡与概率索引引擎卡
 */

import { SkipListStep } from './skiplist-step-compiler';
import { renderSkipListBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderSkipListCanvas(container: HTMLElement, step: SkipListStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderSkipListBoard(step.nodes, step.maxLevel, step.activeVal)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前操作节点值</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">
            ${step.activeVal >= 0 ? `Val = ${step.activeVal}` : '构建完成'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">跳表总节点数</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.nodes.length} 个</div>
        </div>
      </div>

      ${renderFormulaCard(
        '跳表多层概率索引引擎',
        `期望指针数: 1 / (1 - p) | 查找策略: 右侧更小则右跃，否则下降一层 | 期望复杂度: O(log N)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
