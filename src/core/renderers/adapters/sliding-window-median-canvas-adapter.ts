import { MedianStep } from './sliding-window-median-step-compiler';

export function renderMedianSandbox(step: MedianStep): string {
  const arrayElementsHtml = step.nums.map((val, idx) => {
    const inWindow = idx >= step.windowLeft && idx <= step.windowRight;
    const isEnter = idx === step.windowRight;
    const isLeftEdge = idx === step.windowLeft;

    let border = '1px solid #e2e8f0';
    let bg = '#ffffff';
    let color = '#64748b';
    let shadow = 'none';

    if (inWindow) {
      bg = '#e0f2fe';
      border = '1.5px solid #38bdf8';
      color = '#0369a1';
      shadow = '0 1px 3px rgba(56, 189, 248, 0.15)';
    }
    if (isEnter) {
      border = '2px solid #10b981';
    } else if (isLeftEdge) {
      border = '2px solid #f59e0b';
    }

    return `
      <div style="display: inline-flex; flex-direction: column; align-items: center; margin: 3px 4px; flex-shrink: 0;">
        <span style="font-size: 10px; font-family: monospace; color: #94a3b8; margin-bottom: 2px;">#${idx}</span>
        <div style="width: 38px; height: 42px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; font-family: 'JetBrains Mono', monospace; background: ${bg}; border: ${border}; color: ${color}; box-shadow: ${shadow}; transition: all 0.2s ease;">
          ${val}
        </div>
        <span style="font-size: 9px; height: 14px; margin-top: 2px;">
          ${isLeftEdge ? '<b style="color: #d97706; background: #fef3c7; padding: 1px 3px; border-radius: 3px;">L</b>' : ''}
          ${isEnter ? '<b style="color: #16a34a; background: #dcfce7; padding: 1px 3px; border-radius: 3px;">R</b>' : ''}
        </span>
      </div>
    `;
  }).join('');

  const mediansHistoryHtml = step.mediansResult.length === 0
    ? '<span style="font-size: 11px; color: #94a3b8;">暂未输出</span>'
    : step.mediansResult.map((m, idx) => {
        const isLatest = idx === step.mediansResult.length - 1;
        return `
          <span style="display: inline-block; padding: 2px 8px; margin: 2px; border-radius: 6px; font-weight: 700; font-size: 12px; font-family: 'JetBrains Mono', monospace; background: ${isLatest ? '#ecfdf5' : '#f1f5f9'}; border: 1px solid ${isLatest ? '#a7f3d0' : '#e2e8f0'}; color: ${isLatest ? '#065f46' : '#64748b'};">
            ${m}
          </span>
        `;
      }).join(' ');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; justify-content: center; padding: 12px 6px; box-sizing: border-box;">
      <!-- 顶部滑动窗口物理全景 -->
      <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 14px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 700; font-size: 12px; color: #0f172a;">
            🪟 数组滑窗物理全景 (窗口大小 K = ${step.k})
          </span>
          <span style="font-size: 11px; color: #64748b;">当前滑窗区间: <strong style="color: #2563eb; font-family: monospace;">[${step.windowLeft} .. ${step.windowRight}]</strong></span>
        </div>
        <div style="display: flex; align-items: center; overflow-x: auto; padding: 6px 0;">
          ${arrayElementsHtml}
        </div>
      </div>

      <!-- 对顶堆天平平衡视效 (主画布视觉核心) -->
      <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center;">
        <div style="background: #ffffff; border: 1.5px solid #7dd3fc; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 700; font-size: 12px; color: #0284c7;">🔻 Small Heap (大根堆: 存放 ≤ 中位数)</span>
            <span style="font-size: 11px; color: #64748b;">堆顶: <b style="color: #0284c7; font-family: monospace;">${step.smallTop ?? '-'}</b></span>
          </div>
          <div style="font-size: 12px; color: #334155; font-family: 'JetBrains Mono', monospace; word-break: break-all;">
            堆元素: [${step.smallHeap.join(', ')}]
          </div>
        </div>

        <div style="font-size: 24px; text-align: center; color: #f59e0b; padding: 0 4px;">⚖️</div>

        <div style="background: #ffffff; border: 1.5px solid #86efac; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-weight: 700; font-size: 12px; color: #15803d;">🔺 Large Heap (小根堆: 存放 ≥ 中位数)</span>
            <span style="font-size: 11px; color: #64748b;">堆顶: <b style="color: #15803d; font-family: monospace;">${step.largeTop ?? '-'}</b></span>
          </div>
          <div style="font-size: 12px; color: #334155; font-family: 'JetBrains Mono', monospace; word-break: break-all;">
            堆元素: [${step.largeHeap.join(', ')}]
          </div>
        </div>
      </div>

      <!-- 结果历史记录列表 -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; font-weight: 700; color: #475569;">🎯 累计中位数输出:</span>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${mediansHistoryHtml}
          </div>
        </div>
        <span style="font-size: 11px; color: #64748b;">
          当前中位数: <strong style="color: #16a34a; font-size: 13px; font-family: monospace;">${step.currentMedian}</strong>
        </span>
      </div>
    </div>
  `;
}
