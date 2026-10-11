/**
 * 括号匹配 (Valid Parentheses) - 视觉适配器
 */

import { BracketStep } from './bracket-step-compiler';

export function renderBracketCanvas(container: HTMLElement, step: BracketStep): void {
  const s = step.rawString;
  const stack = step.stack;
  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';
  const isMismatch = step.action === 'mismatch';

  // 字符串序列展示
  const charsHtml = s
    .split('')
    .map((ch, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isProcessed = idx < curIdx || (isDone && idx <= curIdx);
      let bg = '#ffffff';
      let border = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = isMismatch ? '#fef2f2' : '#ecfdf5';
        border = isMismatch ? '#ef4444' : '#10b981';
        textColor = isMismatch ? '#ef4444' : '#047857';
      } else if (isProcessed) {
        bg = '#f8fafc';
        border = '#cbd5e1';
        textColor = '#64748b';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8.5px; color: ${isCurrent ? '#059669' : '#94a3b8'}; font-weight: 700;">[${idx}]</span>
          <div style="width: 32px; height: 32px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            ${ch}
          </div>
        </div>
      `;
    })
    .join('');

  // 期望栈内展示
  const stackItemsHtml =
    stack.length === 0
      ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">栈空（全部已闭合）</span>'
      : stack
          .map(
            (expCh) => `
            <div style="padding: 2px 8px; border-radius: 4px; background: #ffffff; border: 1.5px solid #f59e0b; color: #b45309; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              ${expCh}
            </div>
          `
          )
          .join('<span style="color: #cbd5e1; font-size: 10px; margin: 0 2px;">→</span>');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; gap: 12px; box-sizing: border-box; padding: 4px;">
      <!-- 待匹配字符串流 -->
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
          <span>🔤 待匹配括号序列 (字符串流):</span>
          <span style="color: #059669;">已闭合: ${step.matchedPairs} 对</span>
        </div>
        <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0;">
          ${charsHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #e2e8f0; margin: 1px 0;"></div>

      <!-- 期望右括号栈 (扁平直排) -->
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <div style="display: align-items: center; justify-content: space-between; display: flex;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">🥞 期望右括号栈 (栈底 → 栈顶):</span>
          <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #d97706;">栈深: ${stack.length}</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: center; min-height: 28px; flex-wrap: wrap;">
          ${stackItemsHtml}
        </div>
      </div>
    </div>
  `;

  // 更新指标卡片
  const root = container.closest('#algo-bracket-view');
  if (root) {
    const statusEl = root.querySelector('#metric-match-status') as HTMLElement | null;
    const pairsEl = root.querySelector('#metric-matched-pairs');
    const stackSizeEl = root.querySelector('#metric-stack-size');

    if (statusEl) {
      statusEl.textContent = step.isValid ? (isDone ? '有效 (True)' : '匹配正常') : '无效 (False)';
      statusEl.style.color = step.isValid ? '#059669' : '#ef4444';
    }
    if (pairsEl) pairsEl.textContent = `${step.matchedPairs} 对`;
    if (stackSizeEl) stackSizeEl.textContent = `${step.stack.length}`;

    // 在 Card 2 中展示当前扫描字符与期望
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      const topExpected = stack.length > 0 ? stack[stack.length - 1] : null;
      customMetricsContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; color: #334155; padding: 2px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px;">
            <span>当前扫描字符:</span>
            <strong style="font-family: monospace; color: #059669; font-size: 12px;">${step.currentChar !== null ? `'${step.currentChar}'` : '（无）'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px;">
            <span>栈顶期望闭合符:</span>
            <strong style="font-family: monospace; color: #d97706; font-size: 12px;">${topExpected !== null ? `'${topExpected}'` : '（空）'}</strong>
          </div>
        </div>
      `;
    }
  }
}
