/**
 * 删除相邻重复项 (Remove All Adjacent Duplicates In String) - 视觉适配器
 */

import { RADStep } from './remove-adjacent-duplicates-step-compiler';

export function renderRemoveAdjacentDuplicatesCanvas(container: HTMLElement, step: RADStep): void {
  const s = step.rawString;
  const stack = step.stack;
  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';
  const isEliminate = step.action === 'eliminate';

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
        bg = isEliminate ? '#fef2f2' : '#faf5ff';
        border = isEliminate ? '#ef4444' : '#9333ea';
        textColor = isEliminate ? '#ef4444' : '#7e22ce';
      } else if (isProcessed) {
        bg = '#f8fafc';
        border = '#cbd5e1';
        textColor = '#64748b';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8.5px; color: ${isCurrent ? '#9333ea' : '#94a3b8'}; font-weight: 700;">[${idx}]</span>
          <div style="width: 32px; height: 32px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            ${ch}
          </div>
        </div>
      `;
    })
    .join('');

  // 栈内展示 (扁平排布)
  const stackItemsHtml =
    stack.length === 0
      ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">栈空</span>'
      : stack
          .map(
            (ch) => `
            <div style="padding: 2px 8px; border-radius: 4px; background: #ffffff; border: 1.5px solid #9333ea; color: #7e22ce; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              ${ch}
            </div>
          `
          )
          .join('<span style="color: #cbd5e1; font-size: 10px; margin: 0 2px;">→</span>');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; gap: 12px; box-sizing: border-box; padding: 4px;">
      <!-- 待处理字符串序列 -->
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
          <span>🔤 待处理字符串序列 (从左至右扫描):</span>
          <span style="color: #ef4444;">已对消: ${step.eliminatedPairs} 对</span>
        </div>
        <div style="display: gap: 4px; overflow-x: auto; padding: 2px 0; display: flex;">
          ${charsHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #e2e8f0; margin: 1px 0;"></div>

      <!-- 栈内保留字符 (扁平直排) -->
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">🥞 栈内保留字符 (栈底 → 栈顶):</span>
          <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #9333ea;">当前长度: ${stack.length}</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: center; min-height: 28px; flex-wrap: wrap;">
          ${stackItemsHtml}
        </div>
      </div>
    </div>
  `;

  // 更新指标卡片
  const root = container.closest('#algo-remove-adjacent-duplicates-view');
  if (root) {
    const resultEl = root.querySelector('#metric-cur-result');
    const pairsEl = root.querySelector('#metric-eliminated-pairs');
    const stackSizeEl = root.querySelector('#metric-stack-size');

    if (resultEl) resultEl.textContent = step.currentString ? `"${step.currentString}"` : '(空)';
    if (pairsEl) pairsEl.textContent = `${step.eliminatedPairs} 对`;
    if (stackSizeEl) stackSizeEl.textContent = `${step.stack.length}`;

    // 在 Card 2 中展示当前扫描与栈顶前驱
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      const topCh = stack.length > 0 ? stack[stack.length - 1] : null;
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155; padding: 4px 0;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前扫描字符:</span>
            <strong style="font-family: monospace; color: #9333ea; font-size: 12px;">${step.currentChar !== null ? `'${step.currentChar}'` : '（结束）'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>当前栈顶前驱:</span>
            <strong style="font-family: monospace; color: #d97706; font-size: 12px;">${topCh !== null ? `'${topCh}'` : '（栈空）'}</strong>
          </div>
        </div>
      `;
    }
  }
}
