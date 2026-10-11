/**
 * Class 036: 用一个辅助栈或递归对栈进行排序 (Sort Stack) - 画布适配器
 * 左程云算法通关课【必备篇】Class 036 / 程序员代码面试指南
 */

import { SortStackStep } from './sort-stack-using-recursive-036-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderSortStackCanvas(container: HTMLElement, step: SortStackStep): void {
  const renderStackColumn = (items: number[], title: string, color: string, isHelper: boolean) => {
    const renderedItems = items.map((val, idx) => {
      const isTop = idx === items.length - 1;
      return `
        <div style="background: ${isTop ? `${color}33` : 'rgba(30, 41, 59, 0.8)'}; border: 1px solid ${isTop ? color : 'rgba(255, 255, 255, 0.08)'}; border-radius: 6px; padding: 8px 14px; margin: 4px 0; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: ${isTop ? color : '#e2e8f0'}; font-size: 15px;">${val}</span>
          <span style="font-size: 10px; color: ${isTop ? color : '#64748b'};">${isTop ? 'TOP' : `idx ${idx}`}</span>
        </div>
      `;
    }).reverse().join('');

    return `
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column; flex: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-weight: 700; color: ${color}; font-size: 13px;">${title}</span>
          <span style="font-size: 11px; color: #94a3b8;">${items.length} 元素</span>
        </div>
        <div style="border-left: 2px solid #475569; border-right: 2px solid #475569; border-bottom: 3px solid ${color}; border-radius: 0 0 8px 8px; padding: 8px; min-height: 220px; display: flex; flex-direction: column; justify-content: flex-end;">
          ${items.length > 0 ? renderedItems : `<div style="text-align: center; color: #64748b; font-size: 12px; margin: auto;">(${isHelper ? '辅助栈当前为空' : '原栈已清空'})</div>`}
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif; color: #e2e8f0; display: flex; flex-direction: column; gap: 14px;">
      <!-- 状态条 -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 16px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 13px; font-weight: 700; color: #94a3b8;">当前动作:</span>
          <span style="background: #0284c7; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">
            ${step.phase === 'popCur' ? '📤 弹出待排元素' : step.phase === 'backtrackHelp' ? '↩️ help 元素腾挪回栈' : step.phase === 'pushHelp' ? '📥 入辅助栈' : '📦 倒回原栈'}
          </span>
        </div>
        ${step.curVal !== undefined ? `
          <div style="font-size: 13px; color: #f59e0b;">
            当前待归位元素 cur: <strong style="font-size: 16px; color: #fbbf24;">${step.curVal}</strong>
          </div>
        ` : ''}
      </div>

      <!-- 双栈沙盘 -->
      <div style="display: flex; gap: 14px;">
        ${renderStackColumn(step.stack, '📥 待排序原栈 (Stack)', '#38bdf8', false)}
        ${renderStackColumn(step.helpStack, '🛡️ 单调辅助栈 (Help)', '#10b981', true)}
      </div>

      <!-- 公式说明卡 -->
      ${renderFormulaCard(
        '辅助栈单调腾挪不变量',
        '\\forall x \\in \\text{help}, \\quad \\text{bottom}(x) \\le \\text{top}(x) \\quad (\\text{若 } \\text{help.top}() > cur, \\text{ 弹出倒回 } stack)',
        '每次从原栈取出一个数 cur，将辅助栈中所有大于 cur 的元素暂时退回原栈，使 cur 能够沉降到属于它的升序位置；最终所有元素汇聚于 help 栈并一次性倒回原栈。'
      )}
    </div>
  `;
}
