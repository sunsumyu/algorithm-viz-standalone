import { EatOrangesStep } from './minimum-eat-oranges-step-compiler';
import { RecursionTreeAdapter } from '../../../../core/renderers/recursion-tree-adapter';

export function renderEatOrangesCanvas(container: HTMLElement, step: EatOrangesStep): void {
  if (step.treeRoot) {
    RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId, false);
  } else {
    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b; color: #64748b; font-size: 12px; font-style: italic;">
        🍊 正在构建橘子贪心记忆化递归决策树...
      </div>
    `;
  }
}

export function renderEatOrangesMetrics(container: HTMLElement, step: EatOrangesStep): void {
  const memo = step.memoTable || [];
  const rowsHtml = memo.length === 0
    ? '<span style="color: #64748b; font-size: 11px; font-style: italic; padding: 10px; text-align: center;">记忆表缓存为空 (暂无求解记录)</span>'
    : memo.map((item) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 10px; border-radius: 6px; background: #1e293b; border: 1px solid #334155; font-family: 'JetBrains Mono', monospace; font-size: 11px; transition: all 0.2s ease;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-weight: 800; color: #38bdf8;">f(${item.n})</span>
            <span style="font-size: 9px; color: #64748b;">(剩余 ${item.n} 橘子)</span>
          </div>
          <span style="font-weight: 800; color: #34d399; background: rgba(16,185,129,0.15); padding: 1px 7px; border-radius: 4px; border: 1px solid rgba(16,185,129,0.3);">${item.days} 天</span>
        </div>
      `).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #cbd5e1; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
        <span>🗄️ 记忆化哈希缓存仓 (Memo Vault)</span>
        <span style="font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-size: 11px;">已缓存: ${memo.length} 项</span>
      </div>
      <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 5px;">
        ${rowsHtml}
      </div>
      <div style="font-size: 10px; color: #64748b; line-height: 1.4; border-top: 1px solid #1e293b; padding-top: 4px;">
        ⚡ 逆向贪心跨步：min( n%2 + 1 + f(n/2), n%3 + 1 + f(n/3) ) 避免纯 -1 线性退化
      </div>
    </div>
  `;
}
