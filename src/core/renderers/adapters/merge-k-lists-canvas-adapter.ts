/**
 * 合并 K 个升序链表 (LeetCode 23)
 * Canvas Adapter: 链表候选池与小根堆优先队列沙盘呈现
 */

import type { MergeKListsStep } from './merge-k-lists-step-compiler';

export function renderMergeKListsCanvas(container: HTMLElement, step: MergeKListsStep): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; padding: 4px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 主视图：各链表当前待选区 + 小根堆 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; flex: 1; min-height: 0;">
        <!-- 各链表当前候选题板 -->
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; overflow-y: auto;">
          <div style="font-size: 13px; font-weight: 600; color: var(--text-color, #cbd5e1); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>待处理链表轨道 (Remaining Lists)</span>
            <span style="font-size: 11px; color: #94a3b8;">共 ${step.lists.length} 条</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${step.lists.map((nodes, idx) => `
              <div style="display: flex; align-items: center; gap: 8px; background: rgba(30, 41, 59, 0.3); padding: 6px 10px; border-radius: 6px;">
                <span style="font-size: 11px; color: #94a3b8; width: 50px; font-weight: 600;">L${idx}:</span>
                <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
                  ${nodes.length === 0 ? '<span style="color: #64748b; font-size: 11px;">(全部节点已并入)</span>' : ''}
                  ${nodes.map((v, i) => `
                    <div style="
                      width: 28px;
                      height: 28px;
                      background: ${i === 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.6)'};
                      border: ${i === 0 ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)'};
                      color: ${i === 0 ? '#38bdf8' : '#e2e8f0'};
                      border-radius: 4px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 12px;
                      font-weight: 700;
                    ">${v}</div>
                    ${i < nodes.length - 1 ? '<span style="color: #64748b; font-size: 10px;">➔</span>' : ''}
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 小根堆状态展示 -->
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column;">
          <div style="font-size: 13px; font-weight: 600; color: var(--text-color, #cbd5e1); margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>小根堆优先队列 (Min-Heap)</span>
            <span style="font-size: 11px; color: #10b981; font-weight: 600;">堆顶最小优先</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; min-height: 48px; background: rgba(30, 41, 59, 0.25); padding: 12px; border-radius: 6px;">
            ${step.heap.length === 0 ? '<span style="color: #64748b; font-size: 12px;">堆已空</span>' : ''}
            ${step.heap.map((item, idx) => `
              <div style="
                padding: 6px 12px;
                background: ${idx === 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(2, 132, 199, 0.25)'};
                color: ${idx === 0 ? '#34d399' : '#38bdf8'};
                border-radius: 6px;
                font-size: 13px;
                font-weight: bold;
                border: ${idx === 0 ? '1.5px solid #34d399' : '1px solid rgba(56, 189, 248, 0.4)'};
                box-shadow: ${idx === 0 ? '0 0 10px rgba(52,211,153,0.35)' : 'none'};
                display: flex;
                align-items: center;
                gap: 4px;
              ">
                ${idx === 0 ? '👑' : ''}<span>${item.val}</span> <span style="font-size: 10px; opacity: 0.75;">[L${item.listId}]</span>
              </div>
            `).join('')}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 10px; line-height: 1.5;">
            👑 高亮项为堆顶最小元，下一步 <code style="color: #38bdf8;">poll()</code> 出堆挂载至合并链表尾部。
          </div>
        </div>
      </div>

      <!-- 已合并链表展示栏 -->
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 14px; overflow-x: auto;">
        <div style="font-size: 12px; font-weight: 600; color: #34d399; margin-bottom: 8px;">已生成的升序合并链表 (Merged Result List)</div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <div style="padding: 4px 8px; background: rgba(51, 65, 85, 0.6); color: #94a3b8; border-radius: 4px; font-size: 11px; font-weight: bold;">dummy</div>
          <span style="color: #64748b;">➔</span>
          ${step.merged.length === 0 ? '<span style="color: #64748b; font-size: 11px;">(待合并首元)</span>' : ''}
          ${step.merged.map((val, idx) => `
            <div style="
              width: 32px;
              height: 32px;
              background: rgba(16, 185, 129, 0.2);
              border: 1px solid #34d399;
              color: #ecfdf5;
              border-radius: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              font-weight: bold;
            ">${val}</div>
            ${idx < step.merged.length - 1 ? '<span style="color: #34d399; font-size: 12px;">➔</span>' : ''}
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
