import { ReverseStackStep } from './reverse-stack-using-recursive-036-step-compiler';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export function renderReverseStackCanvas(container: HTMLElement, step: ReverseStackStep): void {
  const stackItems = step.stack.map((val, idx) => {
    const isTop = idx === step.stack.length - 1;
    const isBottom = idx === 0;
    return `
      <div style="background: ${isTop ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.8)'}; border: 1px solid ${isTop ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 6px; padding: 10px 16px; margin: 4px 0; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; color: ${isTop ? '#38bdf8' : '#e2e8f0'}; font-size: 16px;">${val}</span>
        <span style="font-size: 11px; color: ${isTop ? '#38bdf8' : isBottom ? '#a78bfa' : '#64748b'}; font-weight: 600;">
          ${isTop ? '🔝 TOP (栈顶)' : isBottom ? '⚓ BOTTOM (栈底)' : `Index ${idx}`}
        </span>
      </div>
    `;
  }).reverse().join('');

  container.innerHTML = `
    <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif; color: #e2e8f0; display: flex; flex-direction: column; gap: 14px;">
      <!-- 顶部状态指示栏 -->
      <div style="display: flex; gap: 12px; align-items: center; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 12px 16px;">
        <span style="font-size: 13px; font-weight: 700; color: #94a3b8;">🎯 当前执行阶段:</span>
        <span style="background: #0284c7; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">
          ${step.phase === 'bottomOut' ? '🔍 bottomOut (递归抽取栈底)' : step.phase === 'reverse' ? '🔄 reverse (主递归逆序)' : '🚀 入口就绪'}
        </span>
        ${step.bottomItem !== undefined ? `
          <span style="margin-left: auto; font-size: 13px; color: #fbbf24;">
            暂存/抽取值: <strong style="font-size: 16px; color: #f59e0b;">${step.bottomItem}</strong>
          </span>
        ` : ''}
      </div>

      <!-- 主视图：物理栈 vs 系统调用栈 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
        <!-- 物理栈可视化容器 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-weight: 700; color: #38bdf8; font-size: 13px;">📥 目标数据栈 (Stack)</span>
            <span style="font-size: 11px; color: #94a3b8;">容量: ${step.stack.length} 个元素</span>
          </div>
          <div style="border-left: 2px solid #475569; border-right: 2px solid #475569; border-bottom: 3px solid #38bdf8; border-radius: 0 0 8px 8px; padding: 8px; min-height: 200px; display: flex; flex-direction: column; justify-content: flex-end;">
            ${step.stack.length > 0 ? stackItems : '<div style="text-align: center; color: #64748b; font-size: 13px; margin: auto;">(栈目前为空，元素已全部暂存于系统递归栈帧中)</div>'}
          </div>
        </div>

        <!-- 系统调用栈可视化 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-weight: 700; color: #a78bfa; font-size: 13px;">🥞 系统调用栈追踪 (Call Stack)</span>
            <span style="font-size: 11px; background: #6d28d9; color: white; padding: 2px 6px; border-radius: 4px;">深度: ${step.currentDepth}</span>
          </div>
          <div style="font-family: monospace; font-size: 12px; color: #c4b5fd; line-height: 1.6; background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 6px; flex: 1; overflow-y: auto;">
            ${step.callStackList.map((entry, idx) => `
              <div style="padding: 2px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.04);">
                ${idx === step.callStackList.length - 1 ? '👉 ' : '   '}${entry}
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 核心教学公式卡 -->
      ${renderFormulaCard(
        '左程云栈逆序双层递归模型',
        '\\text{reverse}(st) \\iff \\text{bottom} = \\text{bottomOut}(st); \\quad \\text{reverse}(st); \\quad st.\\text{push}(\\text{bottom});',
        'bottomOut 过程将栈底抽离并将上面所有元素原封不动放回；主函数拿到栈底后，递归逆序规模为 N-1 的剩余栈；最后把拿到的原栈底压回栈顶，实现无额外数据结构下的栈逆序。'
      )}
    </div>
  `;
}
