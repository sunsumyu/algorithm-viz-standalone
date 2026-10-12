/**
 * Class 158: 树上启发式合并 (DSU on Tree) 领域视觉适配器
 * 核心：轻重儿子树拓扑与颜色桶沙盘、当前核心节点卡、答案求出统计卡与启发式调度引擎公式卡
 */

import { DSUStep } from './dsu-on-tree-158-step-compiler';
import { renderDSUOnTreeBoard } from '../../../algorithms/categories/advanced-topics/advanced-155-160/advanced-155-160-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderDSUOnTree158Canvas(container: HTMLElement, step: DSUStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderDSUOnTreeBoard(step.curNode, step.heavySon, step.buckets, step.ansMap)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前统计核心节点</div>
          <div style="font-size: 18px; font-weight: 700; color: #4338ca;">Node ${step.curNode}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">已求出答案节点数</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669;">${Object.keys(step.ansMap).length} 个节点</div>
        </div>
      </div>

      ${renderFormulaCard(
        'DSU on Tree 启发式调度引擎',
        `轻儿子策略: 递归并清空桶 (keep=false) | 重儿子策略: 递归并直接保留桶 (keep=true) | 均摊时间: O(N log N)`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
