/**
 * Class 025: 大根堆、小根堆与堆排序 (Heap & HeapSort) - 视觉适配器
 * 左程云算法通关课入门篇 Class 025
 */

import { HeapSortStep } from './heap-and-heapsort-025-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderHeapSortCanvas(container: HTMLElement, step: HeapSortStep) {
  const { arr, heapSize, currentIndex, targetIndex, operation } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前操作</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${operation === 'heapify' ? '堆化下沉 (Heapify)' : operation === 'swap-max' ? '堆顶与末尾交换' : '排序完成'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">有效堆容量 (heapSize)</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${heapSize} / ${arr.length}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">活动节点下标</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${currentIndex >= 0 ? `${currentIndex} (值:${arr[currentIndex]})` : '无'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">交换目标下标</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${targetIndex !== undefined && targetIndex >= 0 ? `${targetIndex} (值:${arr[targetIndex]})` : '无'}
          </div>
        </div>
      </div>

      <!-- 堆数组渲染条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${arr.map((val, idx) => {
            const isCur = idx === currentIndex;
            const isTarget = idx === targetIndex;
            const isLocked = idx >= heapSize;

            let bgColor = 'rgba(51, 65, 85, 0.4)';
            let borderColor = 'rgba(255, 255, 255, 0.1)';

            if (isCur) {
              bgColor = 'rgba(16, 185, 129, 0.35)';
              borderColor = '#10b981';
            } else if (isTarget) {
              bgColor = 'rgba(236, 72, 153, 0.35)';
              borderColor = '#ec4899';
            } else if (isLocked) {
              bgColor = 'rgba(168, 85, 247, 0.2)';
              borderColor = '#a855f7';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isLocked ? '#a855f7' : isCur ? '#10b981' : isTarget ? '#ec4899' : '#64748b'}; font-weight: bold;">
                  ${isLocked ? '已锁定' : isCur ? 'CUR' : isTarget ? 'SWAP' : ''}
                </div>
                <div style="
                  width: 44px;
                  height: 48px;
                  background: ${bgColor};
                  border: 2px solid ${borderColor};
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isCur ? '0 0 12px rgba(16, 185, 129, 0.4)' : isTarget ? '0 0 12px rgba(236, 72, 153, 0.4)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  ${val}
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 堆结构核心数学原理 -->
      ${renderFormulaCard(
        '堆完全二叉树父子索引关系与堆排序时空复杂度',
        '节点 i 的父节点: (i-1)/2；左孩子: 2*i+1；右孩子: 2*i+2。建堆 O(N)，下沉排序 O(N log N)，原地排序额外空间复杂度 O(1)',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
