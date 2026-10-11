import { SQStep } from './stack-queue-theory-step-compiler';

/** 主视觉：栈 / 队列容器沙盘 */
export function renderStackQueueTheoryCanvas(container: HTMLElement, step: SQStep): void {
  const isStack = step.mode === 'stack';
  const data = step.data;

  const itemsHtml = data
    .map((num, idx) => {
      const isTopOrFront = isStack ? idx === data.length - 1 : idx === 0;
      const isRear = !isStack && idx === data.length - 1;

      let badge = '';
      if (isStack && isTopOrFront) badge = '🥇栈顶Top';
      else if (!isStack && isTopOrFront) badge = '🥇队头Front';
      else if (!isStack && isRear) badge = '队尾Rear';
      else badge = `[${idx}]`;

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8.5px; color: ${isTopOrFront ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
            ${badge}
          </span>
          <div style="min-width: 42px; height: 42px; padding: 0 8px; border-radius: 8px; background: ${isTopOrFront ? '#eff6ff' : '#ffffff'}; border: 2px solid ${isTopOrFront ? '#2563eb' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${isTopOrFront ? '#1d4ed8' : '#0f172a'}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            ${num}
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 14px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569; width: 100%;">
        <span>${isStack ? '🥞 栈容器 (栈底 &rarr; 栈顶Top)' : '🔄 队列容器 (队头Front &rarr; 队尾Rear)'}:</span>
        <span style="color: #059669;">容量: ${data.length} · 操作 O(1)</span>
      </div>
      <div style="display: flex; gap: 8px; overflow-x: auto; padding: 4px 0; min-height: 56px; align-items: center; max-width: 100%;">
        ${data.length > 0 ? itemsHtml : `<span style="font-size: 10.5px; color: #94a3b8;">${isStack ? '空栈 (Empty Stack)' : '空队列 (Empty Queue)'}</span>`}
      </div>
    </div>
  `;
}
