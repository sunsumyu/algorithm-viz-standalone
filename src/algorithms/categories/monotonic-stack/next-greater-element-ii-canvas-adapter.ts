import { type NGE2Step } from './next-greater-element-ii-step-compiler';

export function renderNextGreaterElementIICanvas(container: HTMLElement, step: NGE2Step): void {
  const nums = step.nums;
  const stack = step.stack;
  const result = step.result;
  const n = nums.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const doubleArray = [...nums, ...nums];
  const ribbonsHtml = doubleArray
    .map((num, i) => {
      const isCurrent = i === curIdx && !isDone;
      const origIdx = i % n;
      const isRound2 = i >= n;
      const inStack = stack.includes(origIdx);
      const isPopped = origIdx === step.poppedIndex;
      const resVal = result[origIdx];

      let bg = '#ffffff';
      let border = isRound2 ? '#c7d2fe' : '#e2e8f0';
      let textColor = isRound2 ? '#4f46e5' : '#0f172a';

      if (isCurrent) {
        bg = '#eef2ff';
        border = '#4f46e5';
        textColor = '#4338ca';
      } else if (isPopped) {
        bg = '#ecfdf5';
        border = '#10b981';
        textColor = '#059669';
      } else if (inStack) {
        bg = '#fffbeb';
        border = '#fde68a';
        textColor = '#d97706';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8px; color: ${isCurrent ? '#4f46e5' : isRound2 ? '#818cf8' : '#94a3b8'}; font-weight: 700;">
            ${isRound2 ? `R2[${origIdx}]` : `[${origIdx}]`}
          </span>
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <span>${num}</span>
            <span style="font-size: 8.5px; color: ${resVal !== -1 ? '#10b981' : '#94a3b8'}; font-weight: 700;">
              ${resVal !== -1 ? `&rarr;${resVal}` : ''}
            </span>
          </div>
        </div>
      `;
    })
    .join('');

  const stackItemsHtml = stack
    .map((idx) => {
      return `
        <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 4px;">
          <span>[${idx}]</span>
          <span style="color: #4f46e5;">val: ${nums[idx]}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
        <span>🔄 循环 2 轮展开 (第 1 轮 [0..${n - 1}] + 第 2 轮 [${n}..${2 * n - 1}]):</span>
        <span style="color: #4f46e5;">当前轮次: 第 ${step.lap + 1} 轮 (i=${curIdx >= 0 ? curIdx : '-'})</span>
      </div>
      <div style="display: flex; gap: 5px; overflow-x: auto; padding: 2px 0;">
        ${ribbonsHtml}
      </div>

      <div style="display: flex; align-items: center; gap: 8px; padding-top: 2px; border-top: 1px dashed #e2e8f0;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调栈 (栈底 &rarr; 栈顶):</span>
        <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
          ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
        </div>
      </div>
    </div>
  `;
}
