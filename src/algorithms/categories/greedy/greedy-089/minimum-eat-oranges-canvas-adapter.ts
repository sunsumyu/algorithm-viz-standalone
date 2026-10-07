import { EatOrangesStep } from './minimum-eat-oranges-step-compiler';
import { RecursionTreeAdapter } from '../../../../core/renderers/recursion-tree-adapter';

export function renderEatOrangesCanvas(container: HTMLElement, step: EatOrangesStep): void {
  if (step.treeRoot) {
    RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId, false);
  } else {
    container.innerHTML = `<div style="color: #94a3b8; font-size: 12px; font-style: italic;">等待树生成...</div>`;
  }
}

export function renderEatOrangesMetrics(container: HTMLElement, step: EatOrangesStep): void {
  const memo = step.memoTable || [];
  const rowsHtml = memo.length === 0
    ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">记忆表为空</span>'
    : memo.map((item) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 6px; background: #ffffff; border: 1px solid #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
          <span style="font-weight: 700; color: #334155;">f(${item.n})</span>
          <span style="font-weight: 800; color: #10b981;">${item.days} 天</span>
        </div>
      `).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #475569; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
        <span>🗄️ 记忆化缓存表 (memo)</span>
        <span style="font-family: 'JetBrains Mono', monospace; color: #3b82f6;">已缓存: ${memo.length} 项</span>
      </div>
      <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;">
        ${rowsHtml}
      </div>
    </div>
  `;
}
