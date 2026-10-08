import type { PartitionStep } from './partition-labels-step-compiler';

export function renderPartitionLabelsCanvas(container: HTMLElement, step: PartitionStep): void {
  const s = step.str;
  const n = s.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">字符串为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const cellsHtml = s
    .split('')
    .map((char, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isEnd = idx === step.currentEnd;
      const isCut = step.cutIndices.includes(idx);
      const isWithinCurrentPartition = idx >= step.partitionStart && idx <= step.currentEnd;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#eef2ff';
        borderColor = '#4f46e5';
        textColor = '#4f46e5';
      } else if (isEnd) {
        bg = '#fef3c7';
        borderColor = '#f59e0b';
        textColor = '#b45309';
      } else if (isWithinCurrentPartition) {
        bg = '#f8fafc';
        borderColor = '#c7d2fe';
        textColor = '#4338ca';
      }

      return `
        <div style="display: flex; align-items: center; gap: 4px;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
            <span style="font-size: 8.5px; color: ${isCurrent ? '#4f46e5' : isEnd ? '#b45309' : '#94a3b8'}; font-weight: 700;">
              ${isCurrent ? '📍' : isEnd ? '🏁' : `[${idx}]`}
            </span>
            <div style="width: 32px; height: 36px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              ${char}
            </div>
          </div>
          ${isCut ? `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 36px; color: #10b981; font-weight: 800; font-size: 13px;">✂️</div>` : ''}
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 边界信息 -->
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>📍 当前扫描: [${curIdx}]='${step.currentChar || '-'}'</span>
        <span>当前最远边界: <strong style="color: #b45309; font-family: monospace;">[${step.currentEnd}]</strong></span>
      </div>

      <!-- 字符流水平条 -->
      <div style="display: flex; gap: 4px; overflow-x: auto; align-items: center; padding: 6px 0;">
        ${cellsHtml}
      </div>
    </div>
  `;
}
