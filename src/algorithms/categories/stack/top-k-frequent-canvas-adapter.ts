import { TKFStep } from './top-k-frequent-step-compiler';

export function renderTopKFrequentCanvas(container: HTMLElement, step: TKFStep): void {
  const freqMap = step.freqMap;
  const heap = step.heap;
  const curEntry = step.currentEntry;

  // 1. 哈希频次项展示 (扁平直排)
  const freqHtml = Array.from(freqMap.entries())
    .map(([num, freq]) => {
      const isCurrent = curEntry !== null && curEntry.num === num;
      let bg = '#ffffff';
      let border = '#e2e8f0';
      let textColor = '#334155';

      if (isCurrent) {
        bg = '#fffbeb';
        border = '#f59e0b';
        textColor = '#b45309';
      }

      return `
        <div style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; background: ${bg}; border: 1.5px solid ${border}; font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 700;">
          <span style="color: ${textColor};">${num}</span>
          <span style="color: #64748b; font-size: 9.5px;">×${freq}</span>
        </div>
      `;
    })
    .join('');

  // 2. 小顶堆展示 (扁平直排)
  const heapHtml =
    heap.length === 0
      ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">小顶堆为空</span>'
      : heap
          .map((item, idx) => {
            const isRoot = idx === 0;
            const bg = isRoot ? '#fef2f2' : '#ecfdf5';
            const border = isRoot ? '#ef4444' : '#10b981';
            const textColor = isRoot ? '#b91c1c' : '#047857';

            return `
            <div style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; background: ${bg}; border: 1.5px solid ${border}; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 12px; color: ${textColor};">
              <span>${item.num}</span>
              <span style="font-size: 9.5px; opacity: 0.85;">(频:${item.freq})${isRoot ? ' [堆顶最小]' : ''}</span>
            </div>
          `;
          })
          .join('<span style="color: #cbd5e1; font-size: 10px; margin: 0 2px;">→</span>');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: space-around; gap: 8px; box-sizing: border-box;">
      <!-- 哈希频次统计表 (扁平排布) -->
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #d97706;">
          <span>📊 哈希频次统计表 (Map):</span>
          <span>不同元素: ${freqMap.size} 项</span>
        </div>
        <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0; align-items: center; min-height: 28px;">
          ${freqHtml}
        </div>
      </div>

      <div style="border-top: 1px dashed #e2e8f0; margin: 2px 0;"></div>

      <!-- 小顶堆 (扁平直排) -->
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 11px; font-weight: 700; color: #059669;">🥞 容量为 k=${step.k} 的小顶堆 (堆顶频次最小 → 堆底):</span>
          <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #10b981;">容量: ${heap.length} / ${step.k}</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: center; min-height: 28px; flex-wrap: wrap;">
          ${heapHtml}
        </div>
      </div>
    </div>
  `;

  // 更新指标卡片
  const root = container.closest('#algo-top-k-frequent-view');
  if (root) {
    const heapSizeEl = root.querySelector('#metric-heap-size');
    const uniqueEl = root.querySelector('#metric-unique-count');
    const topFreqEl = root.querySelector('#metric-top-freq-val');

    if (heapSizeEl) heapSizeEl.textContent = `${heap.length} / ${step.k}`;
    if (uniqueEl) uniqueEl.textContent = `${freqMap.size}`;
    if (topFreqEl) topFreqEl.textContent = heap.length > 0 ? `值:${heap[0].num} (频:${heap[0].freq})` : '—';

    // 在 Card 2 中展示当前收集的 Top-K 结果
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
          <span style="font-size: 10.5px; font-weight: 700; color: #475569;">当前 Top-${step.k} 结果列表:</span>
          <div style="padding: 4px 8px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: #d97706;">
            [ ${step.result.join(', ')} ]
          </div>
        </div>
      `;
    }
  }
}
