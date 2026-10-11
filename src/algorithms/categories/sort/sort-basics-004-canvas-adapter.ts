/**
 * Class 004: 选择、冒泡、插入三大简单排序对比 (Basic Sorting)
 * 画布渲染适配器
 */

import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';
import { Sort004Step } from './sort-basics-004-step-compiler';

export function renderSortBasics004Canvas(container: HTMLElement, step: Sort004Step): void {
  const maxVal = Math.max(...step.nums, 10);
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      <!-- 顶部指标卡 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前算法</div>
          <div style="font-size: 15px; font-weight: 700; color: #0284c7; margin-top: 4px;">
            ${step.algorithm === 'selection' ? '选择排序' : step.algorithm === 'bubble' ? '冒泡排序' : '插入排序'}
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">外层指针 i</div>
          <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.i >= 0 ? step.i : '-'}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">扫描指针 j</div>
          <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.j >= 0 ? step.j : '-'}</div>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 11px; color: #166534;">当前最小值/基准</div>
          <div style="font-size: 18px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.minIdx !== undefined ? `下标 [${step.minIdx}]` : '-'}</div>
        </div>
      </div>

      <!-- 柱状图阵列可视化 -->
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin-bottom: 16px;">
        <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 12px;">📊 数组序列柱状图状态</div>
        <div style="display: flex; gap: 12px; align-items: flex-end; height: 160px; justify-content: center; padding-bottom: 10px;">
          ${step.nums.map((val, idx) => {
            const height = Math.max(20, Math.floor((val / maxVal) * 130));
            const isActiveI = idx === step.i;
            const isActiveJ = idx === step.j;
            const isMin = idx === step.minIdx;
            let bg = '#3b82f6';
            if (isMin) bg = '#e11d48';
            else if (isActiveJ) bg = '#f59e0b';
            else if (isActiveI) bg = '#8b5cf6';

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <span style="font-size: 12px; font-weight: 700; color: #1e293b;">${val}</span>
                <div style="width: 36px; height: ${height}px; background: ${bg}; border-radius: 6px 6px 0 0; transition: all 0.3s ease;"></div>
                <span style="font-size: 10px; color: #64748b; font-family: monospace;">[${idx}]</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 决策卡片 -->
      ${renderFormulaCard(
        '排序状态与决策推导',
        `时间复杂度 O(N²) | 额外空间 O(1) | 当前操作: ${step.swapped ? '发生交换' : step.compared ? '数值比较' : '步进迭代'}`,
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
