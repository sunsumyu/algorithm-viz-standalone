/**
 * Class 113: 区间合并线段树 (Interval Merge Segment Tree) 画布渲染适配器
 * 负责四元组 (sum, lmax, rmax, maxSum) 网格拓扑与核心公式看板渲染
 */

import { IntervalMergeStep } from './interval-merge-step-compiler';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';

export function renderIntervalMergeCanvas(container: HTMLElement, step: IntervalMergeStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px;">
        🌲 区间合并节点四元组展板 (当前激活: #${step.activeNodeId})
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px;">
        ${step.nodes.map((node) => {
          const isCur = node.id === step.activeNodeId;
          return `
            <div style="background: ${isCur ? '#e0e7ff' : '#ffffff'}; border: 2px solid ${isCur ? '#6366f1' : '#cbd5e1'}; border-radius: 10px; padding: 10px; box-shadow: ${isCur ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'};">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 6px;">
                <span>#${node.id}</span>
                <span style="color: #4338ca;">[${node.l}..${node.r}]</span>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-family: monospace; font-size: 11px;">
                <div style="background: #f8fafc; padding: 2px 4px; border-radius: 4px;">sum: ${node.sum}</div>
                <div style="background: #f8fafc; padding: 2px 4px; border-radius: 4px;">lmax: ${node.lmax}</div>
                <div style="background: #f8fafc; padding: 2px 4px; border-radius: 4px;">rmax: ${node.rmax}</div>
                <div style="background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 4px; border-radius: 4px;">max: ${node.maxSum}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      ${renderFormulaCard(
        '区间合并核心公式',
        `maxSum = max(left.maxSum, right.maxSum, left.rmax + right.lmax) | 全局最大连续和: ${step.bestMaxSum}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
