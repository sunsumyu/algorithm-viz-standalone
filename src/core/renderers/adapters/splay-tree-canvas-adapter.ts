/**
 * Class 152: 伸展树与区间翻转 (Splay Tree) 领域视觉适配器
 * 核心：Splay 树拓扑展板、当前伸展目标键值指示卡、双旋操作阶段卡与提升准则卡
 */

import { SplayStep } from './splay-tree-step-compiler';
import { renderSplayBoard } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderSplayTreeCanvas(container: HTMLElement, step: SplayStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderSplayBoard(step.root, step.splayedVal, step.rotationName)}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前伸展目标节点</div>
          <div style="font-size: 18px; font-weight: 700; color: #6d28d9;">
            ${step.splayedVal >= 0 ? `Key = ${step.splayedVal}` : '初始化'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">双旋操作阶段</div>
          <div style="font-size: 16px; font-weight: 700; color: #4338ca;">${step.rotationName}</div>
        </div>
      </div>

      ${renderFormulaCard(
        'Splay 双旋提升引擎',
        `Zig-Zig 准则: 节点与父节点同侧时【先旋父节点再旋自身】 | Zig-Zag 准则: 异侧时连续两次自身旋转`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
