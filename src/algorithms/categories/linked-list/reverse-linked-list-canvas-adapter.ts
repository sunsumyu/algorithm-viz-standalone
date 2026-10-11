/**
 * 反转链表 — 画布渲染适配器
 */

import { RLStep } from './reverse-linked-list-step-compiler';

export function renderReverseLinkedListCanvas(container: HTMLElement, step: RLStep): void {
  const { values, nextDir, preIndex: pre, curIndex: cur, cachedNext } = step;

  const nodesHtml = values
    .map((val, idx) => {
      const isCur = cur === idx;
      const isPre = pre === idx;
      const isNext = cachedNext === idx;
      const targetNext = nextDir[idx];
      const isReversed = targetNext === -1 ? pre === idx : targetNext < idx;

      // 指针徽标
      const pointerBadges: string[] = [];
      if (isPre) pointerBadges.push('<span style="background: #fbbf24; color: #78350f; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">pre</span>');
      if (isCur) pointerBadges.push('<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">cur</span>');
      if (isNext) pointerBadges.push('<span style="background: #9333ea; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">next</span>');

      return `
        <div style="display: flex; align-items: center; gap: 6px;">
          <!-- 节点盒 -->
          <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
            <!-- 指针标识栏 -->
            <div style="min-height: 14px; display: flex; gap: 2px;">
              ${pointerBadges.join('')}
            </div>

            <!-- 节点主体 -->
            <div style="min-width: 44px; height: 44px; padding: 0 10px; border-radius: 10px; background: ${isCur ? '#eff6ff' : isPre ? '#fffbeb' : '#ffffff'}; border: 2px solid ${isCur ? '#2563eb' : isPre ? '#f59e0b' : '#e2e8f0'}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.04); position: relative;">
              <span style="font-size: 13.5px; font-weight: 800; color: ${isCur ? '#1d4ed8' : isPre ? '#b45309' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">
                ${val}
              </span>
              <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">idx:${idx}</span>
            </div>

            <!-- 指针目标 -->
            <div style="font-size: 9px; color: ${isReversed ? '#10b981' : '#64748b'}; font-weight: 700; font-family: monospace;">
              &rarr; ${targetNext === -1 ? 'null' : values[targetNext]}
            </div>
          </div>

          <!-- 连接箭头 -->
          ${
            idx < values.length - 1
              ? `<div style="font-size: 14px; font-weight: 800; color: ${nextDir[idx] === idx - 1 ? '#10b981' : '#cbd5e1'}; display: flex; align-items: center;">
                  ${nextDir[idx] === idx - 1 ? '◀' : '▶'}
                </div>`
              : ''
          }
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <!-- 链表主视图 -->
      <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 6px 2px; min-height: 80px;">
        <!-- null 虚拟起点 -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <div style="min-height: 14px;">
            ${pre === -1 ? '<span style="background: #fbbf24; color: #78350f; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">pre</span>' : ''}
          </div>
          <div style="min-width: 40px; height: 44px; border-radius: 10px; background: #f1f5f9; border: 1.5px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace;">
            null
          </div>
          <div style="font-size: 9px; color: #94a3b8;">前驱起点</div>
        </div>

        <div style="font-size: 14px; color: #cbd5e1;">|</div>

        ${nodesHtml}

        <div style="font-size: 14px; color: #cbd5e1;">|</div>

        <!-- null 尾端 -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <div style="min-height: 14px;">
            ${cur === -1 ? '<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">cur</span>' : ''}
          </div>
          <div style="min-width: 40px; height: 44px; border-radius: 10px; background: #f1f5f9; border: 1.5px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace;">
            null
          </div>
          <div style="font-size: 9px; color: #94a3b8;">尾端终点</div>
        </div>
      </div>
    </div>
  `;
}
