/**
 * 用栈实现队列 (Implement Queue using Stacks) - 视觉适配器
 */

import { DualStructureVisualAdapter } from '../../../core/renderers/adapters/dual-structure-visual-adapter';
import { MQStep } from './implement-queue-using-stack-step-compiler';

export function renderImplementQueueUsingStackCanvas(container: HTMLElement, step: MQStep): void {
  // 渲染扁平双栈沙盘（绝无任何嵌套白色 card 边框）
  DualStructureVisualAdapter.renderDualStack(container, step);

  // 更新指标卡片
  const root = container.closest('#algo-implement-queue-using-stack-view');
  if (root) {
    const qSizeEl = root.querySelector('#metric-queue-size');
    const inSizeEl = root.querySelector('#metric-in-size');
    const outSizeEl = root.querySelector('#metric-out-size');
    const totalSize = step.inStack.length + step.outStack.length;

    if (qSizeEl) qSizeEl.textContent = `${totalSize}`;
    if (inSizeEl) inSizeEl.textContent = `${step.inStack.length}`;
    if (outSizeEl) outSizeEl.textContent = `${step.outStack.length}`;

    // 在 Card 2 中展示出队与窥探记录流
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      const outputsHtml =
        step.outputs.length === 0
          ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">暂无出队记录</span>'
          : step.outputs
              .map(
                (out, idx) => `
                <span style="display: inline-flex; align-items: center; gap: 3px; background: #ffffff; border: 1px solid #cbd5e1; padding: 1px 6px; border-radius: 4px; font-size: 10.5px; font-family: monospace;">
                  <span style="color: #64748b;">#${idx + 1}</span>
                  <strong style="color: ${out.op === 'pop' ? '#dc2626' : '#2563eb'};">${out.op}</strong>: ${out.value}
                </span>
              `
              )
              .join(' ');

      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
          <span style="font-size: 10.5px; font-weight: 700; color: #475569;">出队与窥探输出记录:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">${outputsHtml}</div>
        </div>
      `;
    }
  }
}
