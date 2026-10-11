/**
 * Class 026: 手写加强堆结构与反向索引表 (HeapGreater / Indexed Heap) - 视觉适配器
 * 左程云算法通关课入门篇 Class 026
 */

import { HeapGreaterStep } from './heap-greater-026-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderHeapGreaterCanvas(container: HTMLElement, step: HeapGreaterStep) {
  const { heap, indexMap, activeId, operation } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前执行指令</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${operation}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">活动对象 ID</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${activeId ? activeId : '无'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">堆中元素总数</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${heap.length}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">反向索引项数</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${Object.keys(indexMap).length}
          </div>
        </div>
      </div>

      <!-- 堆数组展示条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px; text-align: center;">堆底层数组 (Heap Array)：</div>
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${heap.map((item, idx) => {
            const isAct = item.id === activeId;
            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isAct ? '#38bdf8' : '#64748b'}; font-weight: bold;">
                  ${isAct ? 'ACTIVE' : ''}
                </div>
                <div style="
                  width: 54px;
                  height: 54px;
                  background: ${isAct ? 'rgba(56, 189, 248, 0.35)' : 'rgba(51, 65, 85, 0.4)'};
                  border: 2px solid ${isAct ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'};
                  border-radius: 8px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isAct ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  <div>${item.id}</div>
                  <div style="font-size: 14px; color: #f59e0b;">${item.val}</div>
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 反向索引表视图 -->
      <div style="background: rgba(30, 41, 59, 0.4); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: bold;">反向索引哈希表 (indexMap):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${Object.entries(indexMap).map(([id, idx]) => `
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 8px; font-size: 12px; color: #f8fafc;">
              '${id}' ➔ 索引 [${idx}]
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 核心原理卡片 -->
      ${renderFormulaCard(
        '手写加强堆核心反向索引定理',
        '任何元素在堆中交换时，必须同步维护 indexMap.put(obj, newIndex)。使 resign(obj) 和 remove(obj) 无需 O(N) 线性查找，直接在 O(log N) 内完成任意元素的修改与剔除',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
