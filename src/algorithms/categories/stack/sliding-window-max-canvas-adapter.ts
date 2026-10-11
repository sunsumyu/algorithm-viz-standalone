import { SWMStep } from './sliding-window-max-step-compiler';

export function renderSlidingWindowMaxCanvas(container: HTMLElement, step: SWMStep): void {
  const nums = step.nums;
  const deque = step.deque;
  const isDone = step.action === 'done';
  const wL = step.windowLeft;
  const wR = step.windowRight;

  // 数组与窗口元素展示
  const numsHtml = nums
    .map((num, idx) => {
      const inWindow = idx >= wL && idx <= wR && !isDone;
      const isMax = inWindow && deque.length > 0 && num === deque[0];
      let bg = '#ffffff';
      let border = '#e2e8f0';
      let textColor = '#0f172a';

      if (inWindow) {
        if (isMax) {
          bg = '#ecfdf5';
          border = '#10b981';
          textColor = '#047857';
        } else {
          bg = '#fef2f2';
          border = '#f87171';
          textColor = '#ef4444';
        }
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8.5px; color: ${inWindow ? '#ef4444' : '#94a3b8'}; font-weight: 700;">[${idx}]</span>
          <div style="min-width: 34px; height: 34px; padding: 0 4px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            ${num}
          </div>
        </div>
      `;
    })
    .join('');

  // 单调队列元素展示 (扁平直排)
  const dequeHtml =
    deque.length === 0
      ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">空队列</span>'
      : deque
          .map((val, idx) => {
            const isFront = idx === 0;
            return `
            <div style="padding: 2px 8px; border-radius: 4px; background: ${isFront ? '#ecfdf5' : '#ffffff'}; border: 1.5px solid ${isFront ? '#10b981' : '#f59e0b'}; color: ${isFront ? '#047857' : '#b45309'}; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              ${val}${isFront ? ' (最大)' : ''}
            </div>
          `;
          })
          .join('<span style="color: #cbd5e1; font-size: 10px; margin: 0 2px;">→</span>');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; gap: 12px; box-sizing: border-box; padding: 4px;">
      <!-- 数组与滑动窗口条带 -->
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
          <span>🪟 数组条带 (当前活动窗口 [${wL}..${wR}]):</span>
          <span style="color: #ef4444;">k = ${step.k}</span>
        </div>
        <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0;">
          ${numsHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #e2e8f0; margin: 1px 0;"></div>

      <!-- 单调队列容器 (扁平直排) -->
      <div style="display: flex; flex-direction: column; gap: 3px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #475569;">🥞 单调队列 (队头最大 → 队尾):</span>
          <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #059669;">队列长度: ${deque.length}</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: center; min-height: 28px; flex-wrap: wrap;">
          ${dequeHtml}
        </div>
      </div>
    </div>
  `;

  // 更新指标卡片
  const root = container.closest('#algo-sliding-window-max-view');
  if (root) {
    const maxEl = root.querySelector('#metric-window-max');
    const rangeEl = root.querySelector('#metric-window-range');
    const dequeSizeEl = root.querySelector('#metric-deque-size');

    if (maxEl) maxEl.textContent = deque.length > 0 ? `${deque[0]}` : '—';
    if (rangeEl) rangeEl.textContent = step.windowRight >= 0 ? `[${step.windowLeft}..${step.windowRight}]` : '—';
    if (dequeSizeEl) dequeSizeEl.textContent = `${step.deque.length}`;

    // 在 Card 2 中展示收集的最大值答案
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
          <span style="font-size: 10.5px; font-weight: 700; color: #475569;">收集的最大值答案数组:</span>
          <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #059669;">
            [ ${step.result.join(', ')} ]
          </div>
        </div>
      `;
    }
  }
}
