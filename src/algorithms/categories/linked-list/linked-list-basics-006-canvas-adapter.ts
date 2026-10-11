/**
 * 单双链表基本功与栈队列实现 — 画布渲染适配器
 */

import { LinkedList006Step } from './linked-list-basics-006-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderLinkedListSandbox(step: LinkedList006Step): string {
  const visibleNodes = step.nodes.filter((n) => !n.isDeleted);
  const nodesHtml = visibleNodes
    .map((n) => {
      const isCur = n.id === step.curId;
      const isHead = n.id === step.headId;
      const isPre = n.id === step.preId;

      let border = '1px solid #e2e8f0';
      let bg = '#ffffff';
      let badgeText = '';

      if (isHead) {
        border = '2px solid #22c55e';
        badgeText +=
          '<span style="background:#dcfce7; color:#15803d; font-size:10px; padding:1px 4px; border-radius:3px; margin-right:3px;">HEAD</span>';
      }
      if (isCur) {
        border = '2px solid #3b82f6';
        badgeText +=
          '<span style="background:#dbeafe; color:#1d4ed8; font-size:10px; padding:1px 4px; border-radius:3px;">CUR</span>';
      }
      if (isPre) {
        badgeText +=
          '<span style="background:#fef3c7; color:#b45309; font-size:10px; padding:1px 4px; border-radius:3px;">PRE</span>';
      }

      return `
      <div style="display:inline-flex; align-items:center;">
        <div style="background:${bg}; border:${border}; border-radius:8px; padding:8px 12px; min-width:60px; text-align:center; box-shadow:0 1px 2px rgba(0,0,0,0.04);">
          <div style="font-size:11px; color:#64748b; margin-bottom:2px;">#${n.id}</div>
          <div style="font-size:16px; font-weight:800; color:#0f172a;">${n.val}</div>
          <div style="margin-top:4px;">${badgeText}</div>
        </div>
        ${
          n.next !== -1
            ? '<span style="font-size:16px; color:#94a3b8; margin:0 8px; font-weight:700;">➔</span>'
            : '<span style="font-size:12px; color:#94a3b8; margin:0 8px;">➔ null</span>'
        }
      </div>
    `;
    })
    .join('');

  return `
    <div style="display:flex; flex-direction:column; gap:12px; font-family:inherit;">
      <!-- 链表物理拓扑看板 -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px;">
        <div style="font-size:12px; font-weight:700; color:#0f172a; margin-bottom:12px;">
          🔗 链表当前拓扑结构 (${step.mode === 'reverse' ? '单链表反转模式' : '删除指定值模式'})
        </div>
        <div style="display:flex; flex-wrap:wrap; align-items:center; gap:4px; padding:8px 0;">
          ${nodesHtml || '<div style="color:#94a3b8; font-style:italic;">链表已为空 (null)</div>'}
        </div>
      </div>

      <!-- 指针跟踪看板 -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px;">
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">前驱 Pre</div>
          <div style="font-size:15px; font-weight:800; color:#d97706;">${step.preId && step.preId >= 0 ? `#${step.preId}` : 'null'}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">当前游标 Cur</div>
          <div style="font-size:16px; font-weight:800; color:#2563eb;">${step.curId && step.curId >= 0 ? `#${step.curId}` : 'null'}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:11px; color:#64748b;">暂存 Next</div>
          <div style="font-size:15px; font-weight:800; color:#15803d;">${step.nextId && step.nextId >= 0 ? `#${step.nextId}` : 'null'}</div>
        </div>
      </div>

      ${renderFormulaCard(
        '链表指针操作铁律',
        '在修改 cur.next 前必须先抓取 next = cur.next，防止链表断开失联；反转时每步调头 cur.next = pre；双指针同步推进',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export function renderLinkedListBasicsCanvas(container: HTMLElement, step: LinkedList006Step): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderLinkedListSandbox(step)}
    </div>
  `;
}
