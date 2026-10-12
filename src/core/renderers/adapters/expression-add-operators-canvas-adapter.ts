import { ExpressionStep } from './expression-add-operators-step-compiler';

export function renderExpressionCanvas(container: HTMLElement, step: ExpressionStep): void {
  const { target, expr, solutions } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%;">
      <!-- 当前表达式分支探针 -->
      <div style="
        background: rgba(15, 23, 42, 0.4);
        padding: 24px 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      ">
        <div style="font-size: 12px; color: var(--text-muted, #94a3b8); font-weight: 600;">
          当前回溯探测表达式分支 (目标: ${target})：
        </div>
        <div style="
          padding: 14px 28px;
          background: rgba(30, 41, 59, 0.7);
          border: 2px solid #38bdf8;
          border-radius: 8px;
          font-size: 22px;
          font-weight: 800;
          font-family: monospace;
          color: var(--text-color, #f8fafc);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
          letter-spacing: 1px;
        ">
          ${expr ? expr : '就绪待命...'}
        </div>
      </div>

      <!-- 成功命中解列表卡片 -->
      <div style="
        background: rgba(15, 23, 42, 0.4);
        padding: 16px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        flex-direction: column;
        gap: 10px;
        flex: 1;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; color: #4ade80; font-weight: 700;">
            ✓ 成功解集 (Target = ${target}):
          </span>
          <span style="font-size: 11px; color: var(--text-muted, #94a3b8);">
            共命中 ${solutions.length} 个解
          </span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; overflow-y: auto; max-height: 180px;">
          ${solutions.length > 0 ? solutions.map(sol => `
            <div style="
              background: rgba(16, 185, 129, 0.2);
              border: 1px solid #10b981;
              border-radius: 6px;
              padding: 6px 12px;
              font-size: 13px;
              font-weight: 700;
              font-family: monospace;
              color: #ecfdf5;
            ">
              ${sol} = ${target}
            </div>
          `).join('') : '<div style="font-size: 12px; color: var(--text-muted, #64748b); font-style: italic; padding: 12px 0;">暂未发现解</div>'}
        </div>
      </div>
    </div>
  `;
}
