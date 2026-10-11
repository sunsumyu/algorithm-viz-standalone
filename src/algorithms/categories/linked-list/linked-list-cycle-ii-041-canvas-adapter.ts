/**
 * 左程云算法通关课 Class 041: 寻找单链表中的入环节点 — 画布渲染适配器
 */

import { LinkedListCycleStep } from './linked-list-cycle-ii-041-step-compiler';

export function renderLinkedListCycleCanvas(container: HTMLElement, step: LinkedListCycleStep): void {
  const nodesHtml = step.nodes
    .map((n) => {
      const isSlow = step.slowId === n.id;
      const isFast = step.fastId === n.id;
      const isEntry = step.entryNodeId === n.id;
      const isMeeting = step.meetingNodeId === n.id && step.phase === 'met';

      let border = 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.7);';
      let badges: string[] = [];

      if (isEntry) {
        border = 'border: 2px solid #34d399; background: rgba(6, 78, 59, 0.6); box-shadow: 0 0 12px rgba(52, 211, 153, 0.4);';
        badges.push('<span style="color: #34d399; font-weight: bold;">🎯 入环节点</span>');
      }
      if (isMeeting) {
        border = 'border: 2px solid #fbbf24; background: rgba(120, 53, 15, 0.6); box-shadow: 0 0 12px rgba(251, 191, 36, 0.4);';
        badges.push('<span style="color: #fde047; font-weight: bold;">⚡ 首次相遇点</span>');
      }
      if (isSlow) {
        badges.push('<span style="color: #38bdf8; font-weight: bold;">🐢 slow</span>');
      }
      if (isFast) {
        badges.push('<span style="color: #f43f5e; font-weight: bold;">🐇 fast</span>');
      }

      return `
      <div style="
        position: relative;
        padding: 12px;
        border-radius: 8px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 100px;
        transition: all 0.2s;
      ">
        <div style="font-size: 11px; color: #94a3b8; margin-bottom: 4px;">Node #${n.id} ${n.isInCycle ? '🔄(环内)' : ''}</div>
        <div style="font-size: 20px; font-weight: bold; color: #f8fafc; margin: 4px 0;">${n.val}</div>
        <div style="font-size: 11px; color: #64748b; font-family: monospace;">next ➔ ${n.nextId ? '#' + n.nextId : 'NULL'}</div>
        <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 2px; font-size: 10px; align-items: center;">
          ${badges.join('')}
        </div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">单链表拓扑与双指针物理运动沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">Floyd's Tortoise and Hare</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #38bdf8;">🐢 slow: #${step.slowId ?? 'NULL'}</span>
          <span style="color: #f43f5e;">🐇 fast: #${step.fastId ?? 'NULL'}</span>
        </div>
      </div>

      <!-- 链表节点序列网格 -->
      <div style="display: flex; gap: 12px; align-items: center; overflow-x: auto; padding: 16px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${nodesHtml}
      </div>

      <!-- 数学推导与状态卡片 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">阶段一：Floyd 判圈</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">slow 步长 1，fast 步长 2。若 fast 与 slow 相遇，必在环内某点重合。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fde047;">数学恒等式推导</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">设起点到入口 a，相遇点离入口 b，环长 L。2(a+b) = a+b+kL ➔ a = kL - b。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">阶段二：同速直击入口</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">fast 重置到 head 且步长变 1，两指针同速走 a 步，恰好在入口相遇！</div>
        </div>
      </div>
    </div>
  `;
}
