/**
 * Class 007: 循环双端队列设计 (Circular Deque Design) - 视觉适配器
 * 左程云算法通关课入门篇 Class 007 / LeetCode 641
 */

import { CircularDequeStep } from './circular-deque-007-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderCircularDequeCanvas(container: HTMLElement, step: CircularDequeStep) {
  const { buffer, head, tail, size, capacity, operation } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前执行操作</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${operation}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">容量状态 (Size / Cap)</div>
          <div style="font-size: 14px; font-weight: bold; color: ${size === capacity ? '#ef4444' : size === 0 ? '#64748b' : '#10b981'};">
            ${size} / ${capacity} (${size === capacity ? 'FULL' : size === 0 ? 'EMPTY' : 'NORMAL'})
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">头指针 Head</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            下标 ${head}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">尾指针 Tail</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            下标 ${tail}
          </div>
        </div>
      </div>

      <!-- 环形缓冲区槽位 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${buffer.map((val, idx) => {
            const isHead = size > 0 && idx === head;
            const isTail = size > 0 && idx === tail;
            const hasVal = val !== null;

            let bgColor = 'rgba(51, 65, 85, 0.3)';
            let borderColor = 'rgba(255, 255, 255, 0.1)';

            if (isHead && isTail) {
              bgColor = 'rgba(236, 72, 153, 0.35)';
              borderColor = '#ec4899';
            } else if (isHead) {
              bgColor = 'rgba(245, 158, 11, 0.35)';
              borderColor = '#f59e0b';
            } else if (isTail) {
              bgColor = 'rgba(16, 185, 129, 0.35)';
              borderColor = '#10b981';
            } else if (hasVal) {
              bgColor = 'rgba(56, 189, 248, 0.2)';
              borderColor = '#38bdf8';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isHead && isTail ? '#ec4899' : isHead ? '#f59e0b' : isTail ? '#10b981' : '#64748b'}; font-weight: bold;">
                  ${isHead && isTail ? 'HEAD=TAIL' : isHead ? 'HEAD' : isTail ? 'TAIL' : ''}
                </div>
                <div style="
                  width: 52px;
                  height: 52px;
                  background: ${bgColor};
                  border: 2px solid ${borderColor};
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  font-weight: bold;
                  color: ${hasVal ? '#f8fafc' : '#64748b'};
                  box-shadow: ${isHead || isTail ? '0 0 12px rgba(245, 158, 11, 0.3)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  ${hasVal ? val : 'ø'}
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 环形指针与空间利用核心卡片 -->
      ${renderFormulaCard(
        '环形双端指针移动与取模公理',
        'head 前移: (head == 0 ? cap - 1 : head - 1)；tail 后移: (tail == cap - 1 ? 0 : tail + 1)。完全避免数组数据整体搬移，双端所有操作严格 O(1)',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
