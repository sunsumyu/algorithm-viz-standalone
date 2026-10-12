import { CalculatorStep } from './basic-calculator-full-step-compiler';

export function renderCalculatorSandbox(step: CalculatorStep): string {
  const exprChars = step.expression.split('').map((ch, idx) => {
    const isCur = idx === step.cursor;
    const isPassed = idx < step.cursor;
    return `
      <span style="
        display: inline-block;
        padding: 4px 8px;
        margin: 2px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 14px;
        font-family: monospace;
        background: ${isCur ? 'rgba(245, 158, 11, 0.2)' : isPassed ? 'rgba(100, 116, 139, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
        color: ${isCur ? '#f59e0b' : isPassed ? 'var(--text-muted, #94a3b8)' : 'var(--text-color, #f1f5f9)'};
        border: 1px solid ${isCur ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'};
        box-shadow: ${isCur ? '0 0 10px rgba(245, 158, 11, 0.35)' : 'none'};
      ">${ch}</span>
    `;
  }).join('');

  const numStackItems = step.numStack.length === 0
    ? '<div style="color: var(--text-muted, #64748b); font-style: italic; padding: 20px; text-align: center;">操作数栈为空</div>'
    : step.numStack.map((n, idx) => {
        const isTop = idx === step.numStack.length - 1;
        return `
          <div style="
            background: ${isTop ? 'rgba(34, 197, 94, 0.18)' : 'rgba(255, 255, 255, 0.04)'};
            color: ${isTop ? '#4ade80' : 'var(--text-color, #e2e8f0)'};
            font-weight: 700;
            padding: 8px 14px;
            margin-bottom: 6px;
            border-radius: 6px;
            text-align: center;
            border: 1px solid ${isTop ? '#22c55e' : 'rgba(255, 255, 255, 0.08)'};
          ">
            ${n} ${isTop ? '<span style="font-size: 10px; background: #22c55e; color: #fff; padding: 1px 5px; border-radius: 3px; margin-left: 8px;">TOP</span>' : ''}
          </div>
        `;
      }).reverse().join('');

  const opsStackItems = step.opsStack.length === 0
    ? '<div style="color: var(--text-muted, #64748b); font-style: italic; padding: 20px; text-align: center;">操作符栈为空</div>'
    : step.opsStack.map((op, idx) => {
        const isTop = idx === step.opsStack.length - 1;
        return `
          <div style="
            background: ${isTop ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255, 255, 255, 0.04)'};
            color: ${isTop ? '#818cf8' : 'var(--text-color, #e2e8f0)'};
            font-weight: 800;
            padding: 8px 14px;
            margin-bottom: 6px;
            border-radius: 6px;
            text-align: center;
            border: 1px solid ${isTop ? '#6366f1' : 'rgba(255, 255, 255, 0.08)'};
          ">
            '${op}' ${isTop ? '<span style="font-size: 10px; background: #6366f1; color: #fff; padding: 1px 5px; border-radius: 3px; margin-left: 8px;">TOP</span>' : ''}
          </div>
        `;
      }).reverse().join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%;">
      <!-- 表达式扫描序列带 -->
      <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px;">
        <div style="font-size: 12px; color: var(--text-muted, #94a3b8); margin-bottom: 8px; font-weight: 600;">
          🔤 表达式扫描序列 (游标: ${step.cursor >= 0 ? step.cursor : '准备/结算'})
        </div>
        <div style="overflow-x: auto; white-space: nowrap; padding-bottom: 4px;">
          ${exprChars}
        </div>
      </div>

      <!-- 双栈视效容器 (操作数栈 + 操作符栈) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; flex: 1; min-height: 220px;">
        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-weight: 700; color: #4ade80; font-size: 13px;">🔢 操作数栈 (Nums)</span>
            <span style="font-size: 11px; color: var(--text-muted, #94a3b8);">深度: ${step.numStack.length}</span>
          </div>
          <div style="flex: 1; max-height: 280px; overflow-y: auto; display: flex; flex-direction: column;">
            ${numStackItems}
          </div>
        </div>

        <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-weight: 700; color: #818cf8; font-size: 13px;">➕ 操作符栈 (Ops)</span>
            <span style="font-size: 11px; color: var(--text-muted, #94a3b8);">深度: ${step.opsStack.length}</span>
          </div>
          <div style="flex: 1; max-height: 280px; overflow-y: auto; display: flex; flex-direction: column;">
            ${opsStackItems}
          </div>
        </div>
      </div>
    </div>
  `;
}
