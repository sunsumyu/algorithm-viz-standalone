/**
 * 左程云 Class 071 Code02: 最长递增子序列的个数 CanvasAdapter
 * 职责：纯粹的 DOM 沙盘渲染，委托给双轨视图
 */

import { renderLisDualTracks } from '../../../algorithms/categories/dynamic-programming/dp-071-072/dp-071-072-shared';
import { NumberOfLisStep } from './number-of-lis-step-compiler';

export function renderNumberOfLisCanvas(container: HTMLElement, step: NumberOfLisStep): void {
  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; background: #0f172a; color: #f8fafc; padding: 12px; box-sizing: border-box; overflow-y: auto;">
      ${renderLisDualTracks({
        nums: step.nums,
        dp: step.dp,
        count: step.count,
        currentIdx: step.currentIdx,
        compareIdx: step.compareIdx,
        maxLen: step.maxLen,
        totalWays: step.totalWays,
      })}
    </div>
  `;
}
