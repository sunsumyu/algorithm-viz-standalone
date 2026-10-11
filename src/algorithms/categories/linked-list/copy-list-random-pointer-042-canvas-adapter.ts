/**
 * 复杂链表的复制 — 画布渲染适配器
 */

import { CopyListStep } from './copy-list-random-pointer-042-step-compiler';

export function renderCopyListCanvas(container: HTMLElement, step: CopyListStep): void {
  const nodesHtml = step.nodes
    .map((n) => {
      const isClone = n.isClone;
      const border = isClone
        ? 'border: 2px solid #38bdf8; background: rgba(2, 132, 199, 0.25);'
        : 'border: 1px solid rgba(255, 255, 255, 0.15); background: rgba(30, 41, 59, 0.7);';

      return `
      <div style="
        position: relative;
        padding: 10px 14px;
        border-radius: 8px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 95px;
        transition: all 0.2s;
      ">
        <div style="font-size: 11px; color: ${isClone ? '#38bdf8' : '#94a3b8'}; font-weight: bold;">
          ${isClone ? `Clone #${n.id}` : `Origin #${n.id}`}
        </div>
        <div style="font-size: 18px; font-weight: bold; color: #f8fafc; margin: 4px 0;">${n.val}</div>
        <div style="font-size: 10px; color: #64748b; font-family: monospace;">next ➔ ${n.nextId ?? 'NULL'}</div>
        <div style="font-size: 10px; color: #f59e0b; font-family: monospace; margin-top: 2px;">random ➔ ${n.randomId ?? 'NULL'}</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">复杂链表节点与指针拓扑交互沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            阶段: ${step.phase}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #94a3b8;">节点数量: ${step.nodes.length}</span>
        </div>
      </div>

      <!-- 链表节点序列网格 -->
      <div style="display: flex; gap: 10px; align-items: center; overflow-x: auto; padding: 16px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${nodesHtml}
      </div>

      <!-- 原地三段式解剖卡片 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">1. 原地插入克隆</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">克隆每个节点并插入到对应原节点正后方，保持紧密相邻相对位置。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #f59e0b;">2. 跨步设置 Random</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">cur.next.random = cur.random ? cur.random.next : null，O(1) 精确映射。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">3. 链表无损拆解</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">原链表连回原后继，新链表独立抽出，保证原链表完好无损。</div>
        </div>
      </div>
    </div>
  `;
}
