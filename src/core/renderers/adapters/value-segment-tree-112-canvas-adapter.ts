/**
 * Class 112: 权值线段树与单点更新 (Value Segment Tree) 领域视觉适配器
 * 负责状态空间沙盘与指标卡、树形层级、决策公式卡片的渲染挂载
 */

import { ValueSegTreeStep } from './value-segment-tree-112-step-compiler';
import { renderSegmentTreeVisual } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderValueSegTreeCanvas(container: HTMLElement, step: ValueSegTreeStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <!-- 顶部指标卡 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前操作类型</div>
          <div style="font-size: 16px; font-weight: 700; color: #0284c7; margin-top: 4px;">${step.curOp}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">目标排名 (K)</div>
          <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">第 ${step.queryK} 小</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前聚焦节点</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">节点 u=${step.activeNodeId}</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #166534;">第 K 小最终结果</div>
          <div style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.foundVal >= 0 ? step.foundVal : '计算中...'}</div>
        </div>
      </div>

      <!-- 树形结构可视化 -->
      ${renderSegmentTreeVisual(step.nodes, step.activeNodeId)}

      <!-- 决策与公式卡片 -->
      ${renderFormulaCard(
        '权值二分判定准则',
        'if (k <= leftCount) u = u * 2; else { k -= leftCount; u = u * 2 + 1; }',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
