/**
 * 逆波兰表达式求值 (Evaluate Reverse Polish Notation) - 视觉适配器
 */

import { RPNStep } from './eval-rpn-step-compiler';

export function renderEvalRPNCanvas(container: HTMLElement, step: RPNStep): void {
  const tokens = step.tokens;
  const stack = step.stack;
  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';
  const isCompute = step.action === 'compute';

  // Token 序列展示
  const tokensHtml = tokens
    .map((tok, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isProcessed = idx < curIdx || (isDone && idx <= curIdx);
      let bg = '#ffffff';
      let border = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = isCompute ? '#fff7ed' : '#eff6ff';
        border = isCompute ? '#ea580c' : '#2563eb';
        textColor = isCompute ? '#c2410c' : '#1d4ed8';
      } else if (isProcessed) {
        bg = '#f8fafc';
        border = '#cbd5e1';
        textColor = '#64748b';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">[${idx}]</span>
          <div style="width: 32px; height: 32px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            ${tok}
          </div>
        </div>
      `;
    })
    .join('');

  // 操作数栈展示 (扁平直排)
  const stackItemsHtml =
    stack.length === 0
      ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">栈空</span>'
      : stack
          .map(
            (num) => `
            <div style="padding: 2px 8px; border-radius: 4px; background: #ffffff; border: 1.5px solid #ea580c; color: #c2410c; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              ${num}
            </div>
          `
          )
          .join('<span style="color: #cbd5e1; font-size: 10px; margin: 0 2px;">→</span>');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; gap: 12px; box-sizing: border-box; padding: 4px;">
      <!-- Token 序列 -->
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
          <span>🔤 逆波兰表达式 Tokens 流 (自左至右):</span>
          <span style="color: #ea580c;">栈大小: ${stack.length}</span>
        </div>
        <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0;">
          ${tokensHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #e2e8f0; margin: 1px 0;"></div>

      <!-- 数值操作数栈 (扁平直排) -->
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">🥞 数值操作数栈 (栈底 → 栈顶):</span>
          <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #ea580c;">栈深: ${stack.length}</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: center; min-height: 28px; flex-wrap: wrap;">
          ${stackItemsHtml}
        </div>
      </div>
    </div>
  `;

  // 更新指标卡片
  const root = container.closest('#algo-eval-rpn-view');
  if (root) {
    const topVal = stack.length > 0 ? stack[stack.length - 1] : 0;
    const topValEl = root.querySelector('#metric-top-val');
    const countEl = root.querySelector('#metric-processed-count');
    const stackSizeEl = root.querySelector('#metric-stack-size');

    if (topValEl) topValEl.textContent = `${topVal}`;
    if (countEl) countEl.textContent = `${Math.min(curIdx + 1, tokens.length)} / ${tokens.length}`;
    if (stackSizeEl) stackSizeEl.textContent = `${step.stack.length}`;

    // 在 Card 2 中展示当前运算决策
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155; padding: 4px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前 Token:</span>
            <strong style="font-family: monospace; color: #ea580c; font-size: 12px;">${step.currentToken !== null ? `'${step.currentToken}'` : '（结束）'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>操作数 a & b:</span>
            <strong style="font-family: monospace; color: #0284c7; font-size: 12px;">${step.operandA !== null ? `a=${step.operandA}, b=${step.operandB}` : '无'}</strong>
          </div>
        </div>
      `;
    }
  }
}
