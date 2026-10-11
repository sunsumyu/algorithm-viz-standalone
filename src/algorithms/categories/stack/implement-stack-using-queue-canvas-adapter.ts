/**
 * 用队列实现栈 (Implement Stack using Queues) - 视觉适配器
 */

import { DualStructureVisualAdapter } from '../../../core/renderers/adapters/dual-structure-visual-adapter';
import { MSStep } from './implement-stack-using-queue-step-compiler';

export function renderImplementStackUsingQueueCanvas(container: HTMLElement, step: MSStep): void {
  // 渲染扁平单队列沙盘（绝无任何嵌套白色 card 边框）
  DualStructureVisualAdapter.renderQueueRotation(container, step);

  // 更新指标卡片
  const root = container.closest('#algo-implement-stack-using-queue-view');
  if (root) {
    const sSizeEl = root.querySelector('#metric-stack-size');
    const topValEl = root.querySelector('#metric-top-val');
    const rotProgressEl = root.querySelector('#metric-rotate-progress');

    if (sSizeEl) sSizeEl.textContent = `${step.queue.length}`;
    if (topValEl) topValEl.textContent = step.queue.length > 0 ? `${step.queue[0]}` : '—';
    if (rotProgressEl) {
      rotProgressEl.textContent =
        step.totalRotate > 0 ? `${step.rotateStep} / ${step.totalRotate}` : '无需旋转';
    }

    // 在 Card 2 中展示出栈与 top 记录流
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      const outputsHtml =
        step.outputs.length === 0
          ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">暂无出栈记录</span>'
          : step.outputs
              .map(
                (out, idx) => `
                <span style="display: inline-flex; align-items: center; gap: 3px; background: #ffffff; border: 1px solid #cbd5e1; padding: 1px 6px; border-radius: 4px; font-size: 10.5px; font-family: monospace;">
                  <span style="color: #64748b;">#${idx + 1}</span>
                  <strong style="color: ${out.op === 'pop' ? '#dc2626' : '#0d9488'};">${out.op}</strong>: ${out.value}
                </span>
              `
              )
              .join(' ');

      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
          <span style="font-size: 10.5px; font-weight: 700; color: #475569;">出栈与栈顶查看记录:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">${outputsHtml}</div>
        </div>
      `;
    }
  }
}
