/**
 * 重排链表 — 画布渲染适配器
 */

import { ReorderListStep, ReorderNode } from './reorder-list-step-compiler';

export function renderReorderListCanvas(container: HTMLElement, step: ReorderListStep): void {
  const { phase, list1, list2, mergedList, slowIndex, l1Index, l2Index } = step;

  const renderChain = (nodes: ReorderNode[], activeIdx?: number, themeColor = '#38bdf8') => {
    return nodes
      .map((n, idx) => {
        const isActive = idx === activeIdx;
        return `
        <div style="display: flex; align-items: center;">
          <div style="
            width: 44px;
            height: 44px;
            border-radius: 8px;
            background: ${isActive ? `${themeColor}33` : 'rgba(30, 41, 59, 0.6)'};
            border: ${isActive ? `2px solid ${themeColor}` : '1px solid rgba(255, 255, 255, 0.15)'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.15rem;
            color: ${isActive ? themeColor : '#f8fafc'};
            box-shadow: ${isActive ? `0 0 12px ${themeColor}66` : 'none'};
          ">
            ${n.val}
          </div>
          ${idx < nodes.length - 1 ? `<span style="margin: 0 6px; color: rgba(255, 255, 255, 0.3); font-size: 1.1rem;">➔</span>` : ''}
        </div>
      `;
      })
      .join('');
  };

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 阶段指示器 -->
      <div style="display: flex; gap: 10px; align-items: center;">
        <span style="font-size: 0.85rem; font-weight: 600; color: #94a3b8;">执行阶段:</span>
        <span style="
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          background: ${phase === 'find_mid' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.4)'};
          color: ${phase === 'find_mid' ? '#38bdf8' : '#64748b'};
          border: 1px solid ${phase === 'find_mid' ? '#38bdf8' : 'transparent'};
        ">1. 快慢指针找中点</span>
        <span style="color: #64748b;">➔</span>
        <span style="
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          background: ${phase === 'reverse' ? 'rgba(244, 114, 182, 0.2)' : 'rgba(30, 41, 59, 0.4)'};
          color: ${phase === 'reverse' ? '#f472b6' : '#64748b'};
          border: 1px solid ${phase === 'reverse' ? '#f472b6' : 'transparent'};
        ">2. 反转后半段</span>
        <span style="color: #64748b;">➔</span>
        <span style="
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 700;
          background: ${phase === 'merge' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(30, 41, 59, 0.4)'};
          color: ${phase === 'merge' ? '#34d399' : '#64748b'};
          border: 1px solid ${phase === 'merge' ? '#34d399' : 'transparent'};
        ">3. 穿针引线交叉缝合</span>
      </div>

      <!-- 链表沙盘区 -->
      <div style="
        flex: 1;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 20px;
      ">
        ${
          phase !== 'done'
            ? `
          <!-- 前半段 L1 -->
          <div>
            <div style="font-size: 0.85rem; color: #38bdf8; font-weight: 600; margin-bottom: 8px;">前半段子链 (L1):</div>
            <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap; background: rgba(2, 6, 23, 0.4); padding: 12px; border-radius: 8px;">
              ${renderChain(list1, l1Index ?? slowIndex, '#38bdf8')}
            </div>
          </div>

          <!-- 后半段 L2 -->
          ${
            list2.length > 0
              ? `
            <div>
              <div style="font-size: 0.85rem; color: #f472b6; font-weight: 600; margin-bottom: 8px;">后半段子链 (L2 ${phase === 'reverse' ? '已反转' : '待反转'}):</div>
              <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap; background: rgba(2, 6, 23, 0.4); padding: 12px; border-radius: 8px;">
                ${renderChain(list2, l2Index, '#f472b6')}
              </div>
            </div>
          `
              : ''
          }
        `
            : ''
        }

        <!-- 交叉合并后的链表 -->
        <div>
          <div style="font-size: 0.85rem; color: #34d399; font-weight: 600; margin-bottom: 8px;">
            ${phase === 'done' ? '🎉 重排成型链表:' : '交叉缝合进展 (Merged List):'}
          </div>
          <div style="display: flex; gap: 4px; align-items: center; flex-wrap: wrap; background: rgba(2, 6, 23, 0.4); padding: 14px; border-radius: 8px; min-height: 50px;">
            ${mergedList.length > 0 ? renderChain(mergedList, undefined, '#34d399') : '<span style="color:#64748b; font-size:0.85rem;">等待合并阶段开始...</span>'}
          </div>
        </div>
      </div>
    </div>
  `;
}
