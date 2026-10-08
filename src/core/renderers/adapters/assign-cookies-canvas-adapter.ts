import type { AssignCookiesStep } from './assign-cookies-step-compiler';

export function renderAssignCookiesCanvas(container: HTMLElement, step: AssignCookiesStep): void {
  const isDone = step.phase === 'done';

  // 孩子数组条
  const childrenHtml = step.children
    .map((val, idx) => {
      const isSatisfied = step.satisfiedChildren.includes(idx);
      const isCurrent = !isDone && idx === step.childIndex;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isSatisfied) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      } else if (isCurrent) {
        bg = '#fff7ed';
        borderColor = '#ea580c';
        textColor = '#ea580c';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <span style="font-size: 9.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">${isCurrent ? '▼ child' : `g[${idx}]`}</span>
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); transition: all 0.15s;">
            ${val}
          </div>
          <span style="font-size: 9px; color: ${isSatisfied ? '#10b981' : '#94a3b8'}; font-weight: 600;">${isSatisfied ? '✓ 满足' : '待满足'}</span>
        </div>
      `;
    })
    .join('');

  // 饼干数组条
  const cookiesHtml = step.cookies
    .map((val, idx) => {
      const isMatched = step.matchedCookies.includes(idx);
      const isSkipped = step.skippedCookies.includes(idx);
      const isCurrent = !isDone && idx === step.cookieIndex;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isMatched) {
        bg = '#ecfdf5';
        borderColor = '#10b981';
        textColor = '#059669';
      } else if (isSkipped) {
        bg = '#f1f5f9';
        borderColor = '#cbd5e1';
        textColor = '#94a3b8';
      } else if (isCurrent) {
        bg = '#fff7ed';
        borderColor = '#ea580c';
        textColor = '#ea580c';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
          <span style="font-size: 9.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">${isCurrent ? '▼ cookie' : `s[${idx}]`}</span>
          <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); transition: all 0.15s;">
            ${val}
          </div>
          <span style="font-size: 9px; color: ${isMatched ? '#10b981' : isSkipped ? '#94a3b8' : '#64748b'}; font-weight: 600;">${isMatched ? '🍪 已发' : isSkipped ? '⏭️ 跳过' : '可用'}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 6px;">
      <div style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;">
        <span>👦 孩子胃口数组 (g, 已排序):</span>
      </div>
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
        ${childrenHtml}
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px dashed #e2e8f0; padding-top: 8px;">
      <div style="font-size: 11px; font-weight: 700; color: #475569; display: flex; align-items: center; gap: 6px;">
        <span>🍪 饼干尺寸数组 (s, 已排序):</span>
      </div>
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px;">
        ${cookiesHtml}
      </div>
    </div>
  `;
}
