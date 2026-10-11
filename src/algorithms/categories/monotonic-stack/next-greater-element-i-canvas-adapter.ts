import { type NGE1Step } from './next-greater-element-i-step-compiler';

export function renderNextGreaterElementICanvas(container: HTMLElement, step: NGE1Step): void {
  const nums1 = step.nums1;
  const nums2 = step.nums2;
  const stack = step.stack;
  const map = step.nextGreaterMap;
  const answers = step.answers;

  const curIdx2 = step.currentIndex2;
  const curIdx1 = step.queryIndex1;

  const nums2Html = nums2
    .map((num, idx) => {
      const isCurrent = idx === curIdx2;
      const inStack = stack.includes(num);
      const mappedVal = map[num];

      let bg = '#ffffff';
      let border = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#eff6ff';
        border = '#2563eb';
        textColor = '#2563eb';
      } else if (inStack) {
        bg = '#fffbeb';
        border = '#fde68a';
        textColor = '#d97706';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <span style="font-size: 8.5px; color: ${isCurrent ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
            [${idx}]
          </span>
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <span>${num}</span>
            <span style="font-size: 8.5px; color: ${mappedVal !== undefined ? (mappedVal === -1 ? '#ef4444' : '#10b981') : '#94a3b8'}; font-weight: 700;">
              ${mappedVal !== undefined ? `&rarr;${mappedVal}` : ''}
            </span>
          </div>
        </div>
      `;
    })
    .join('');

  const nums1Html = nums1
    .map((num, idx) => {
      const isQuerying = idx === curIdx1;
      const ans = answers[idx];

      let bg = '#ffffff';
      let border = '#e2e8f0';

      if (isQuerying) {
        bg = '#ecfdf5';
        border = '#10b981';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <div style="padding: 3px 8px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${border}; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; color: #0f172a; display: flex; align-items: center; gap: 4px;">
            <span>${num}</span>
            <span style="color: ${ans !== undefined ? (ans === -1 ? '#ef4444' : '#10b981') : '#94a3b8'}; font-weight: 800;">
              ${ans !== undefined ? `&rarr; ${ans}` : ''}
            </span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
        <span>1️⃣ 母集 nums2 (单调栈建立映射):</span>
        <span style="color: #d97706;">栈内: [${stack.join(', ')}]</span>
      </div>
      <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
        ${nums2Html}
      </div>

      <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #059669; margin-top: 4px; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
        <span>2️⃣ 子集 nums1 (查表生成答案):</span>
        <span>已查: ${answers.length} / ${nums1.length}</span>
      </div>
      <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
        ${nums1Html}
      </div>
    </div>
  `;
}
