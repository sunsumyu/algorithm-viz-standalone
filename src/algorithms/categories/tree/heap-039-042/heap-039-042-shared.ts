/**
 * 左神算法通关课 039 ~ 042 比较器、堆结构与加强堆专题 共享沙盘与渲染助手
 * 提供：比较器优先级排序沙盘、堆排序与大根堆下沉沙盘、加强堆反向索引表沙盘、对顶堆数据流中位数沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Heap039Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 比较器与优先级队列沙盘 (Class 039)
// ----------------------------------------------------
export function renderComparatorBoard(
  tasks: { id: number; priority: number; desc: string }[],
  activeTask: number | null,
  ruleDesc: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⚖️ 复合优先级比较器与优先级队列沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          左神比较法则: 优先级降序 > ID 升序
        </span>
      </div>

      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px;">
        ${tasks.map((t, idx) => {
          const isActive = t.id === activeTask;
          return `
            <div style="min-width: 120px; padding: 8px 12px; border-radius: 8px; border: 2px solid ${isActive ? '#f59e0b' : '#cbd5e1'}; background: ${isActive ? '#fef3c7' : '#f8fafc'}; text-align: center;">
              <div style="font-size: 11px; color: #64748b;">排位 #${idx + 1}</div>
              <div style="font-size: 14px; font-weight: 800; color: #1e293b; margin: 2px 0;">Task ${t.id}</div>
              <div style="font-size: 11px; font-weight: 700; color: #d97706;">Priority: ${t.priority}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="font-size: 11px; color: #475569; background: #f1f5f9; padding: 6px 10px; border-radius: 6px;">
        💡 <strong>比较器判定说明</strong>: ${ruleDesc}
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 堆排序与大根堆下沉沙盘 (Class 040)
// ----------------------------------------------------
export function renderHeapSortBoard(
  heapArray: number[],
  sortedArray: number[],
  heapSize: number,
  highlightIndex: number | null,
  stage: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌲 完全二叉树大根堆与原地堆排序沙盘</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          当前阶段: ${stage} (堆规模 heapSize = ${heapSize})
        </span>
      </div>

      <!-- 堆数组层 -->
      <div style="margin-bottom: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #0284c7; margin-bottom: 6px;">
          🔺 活跃大根堆数组 (连续完全二叉树):
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${heapArray.slice(0, heapSize).map((v, i) => `
            <div style="padding: 6px 10px; border-radius: 6px; border: 2px solid ${i === highlightIndex ? '#ef4444' : '#3b82f6'}; background: ${i === highlightIndex ? '#fef2f2' : '#ffffff'}; text-align: center;">
              <div style="font-size: 9px; color: #64748b;">idx: ${i}</div>
              <div style="font-size: 13px; font-weight: 800; color: ${i === highlightIndex ? '#dc2626' : '#1d4ed8'};">${v}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 已沉淀有序数组层 -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px;">
        <div style="font-size: 11px; font-weight: 700; color: #16a34a; margin-bottom: 6px;">
          ✅ 已沉淀有序升序区间 (从后往前填充):
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${sortedArray.length > 0 ? sortedArray.map(v => `
            <div style="padding: 4px 8px; border-radius: 4px; background: #dcfce7; border: 1px solid #86efac; font-size: 12px; font-weight: 800; color: #15803d;">
              ${v}
            </div>
          `).join('') : '<span style="font-size:11px;color:#94a3b8;">暂未开始沉淀</span>'}
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 加强堆反向索引表沙盘 (Class 041)
// ----------------------------------------------------
export function renderHeapGreaterBoard(
  heapArray: { name: string; val: number }[],
  indexMap: Record<string, number>,
  modifiedObj: string | null,
  operation: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⚡ 加强堆核心：底层数组与反向索引表 (Index Map) 双向联动</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #faf5ff; color: #7e22ce; font-weight: 700;">
          操作: ${operation}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
        <!-- 底层堆数组 -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #2563eb; margin-bottom: 6px;">
            📦 堆物理数组 heap[]:
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${heapArray.map((item, idx) => `
              <div style="padding: 6px 8px; border-radius: 6px; border: 2px solid ${item.name === modifiedObj ? '#f59e0b' : '#cbd5e1'}; background: ${item.name === modifiedObj ? '#fef3c7' : '#ffffff'}; text-align: center;">
                <div style="font-size: 9px; color: #64748b;">[${idx}]</div>
                <div style="font-size: 12px; font-weight: 800; color: #1e293b;">${item.name} (${item.val})</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 反向索引表 -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #7e22ce; margin-bottom: 6px;">
            🗺️ 反向索引表 indexMap (T -> Index):
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${Object.entries(indexMap).map(([name, idx]) => `
              <div style="padding: 4px 8px; border-radius: 6px; background: ${name === modifiedObj ? '#f3e8ff' : '#ffffff'}; border: 1px solid #d8b4fe; font-size: 11px; color: #6b21a8; font-weight: 700;">
                ${name} ➔ index ${idx}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. 对顶堆数据流中位数沙盘 (Class 042)
// ----------------------------------------------------
export function renderMedianStreamBoard(
  maxHeap: number[],
  minHeap: number[],
  median: number,
  lastAdded: number | null
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 双堆对顶机制：大根堆与小根堆动态平衡沙盘</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #fef2f2; color: #dc2626; font-weight: 800;">
          当前即时中位数 = ${median}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
        <!-- 大根堆 (较小半区) -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #1d4ed8; margin-bottom: 6px; display: flex; justify-content: space-between;">
            <span>🔺 大根堆 (较小一半元素, size=${maxHeap.length})</span>
            <span style="font-weight:800; color:#dc2626;">堆顶: ${maxHeap[0] ?? '空'}</span>
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${maxHeap.map((v, i) => `
              <div style="padding: 4px 8px; border-radius: 4px; background: ${i === 0 ? '#fee2e2' : '#ffffff'}; border: 1px solid ${i === 0 ? '#ef4444' : '#93c5fd'}; font-size: 12px; font-weight: 800; color: ${i === 0 ? '#dc2626' : '#1e40af'};">
                ${v} ${i === 0 ? '(顶)' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 小根堆 (较大半区) -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; font-weight: 700; color: #166534; margin-bottom: 6px; display: flex; justify-content: space-between;">
            <span>🔻 小根堆 (较大一半元素, size=${minHeap.length})</span>
            <span style="font-weight:800; color:#dc2626;">堆顶: ${minHeap[0] ?? '空'}</span>
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            ${minHeap.map((v, i) => `
              <div style="padding: 4px 8px; border-radius: 4px; background: ${i === 0 ? '#fee2e2' : '#ffffff'}; border: 1px solid ${i === 0 ? '#ef4444' : '#86efac'}; font-size: 12px; font-weight: 800; color: ${i === 0 ? '#dc2626' : '#15803d'};">
                ${v} ${i === 0 ? '(顶)' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      ${lastAdded !== null ? `
        <div style="font-size: 11px; color: #64748b; background: #f8fafc; padding: 6px 10px; border-radius: 6px;">
          📥 最新流入元素: <strong>${lastAdded}</strong>，动态完成堆调整与大小再平衡。
        </div>
      ` : ''}
    </div>
  `;
}
