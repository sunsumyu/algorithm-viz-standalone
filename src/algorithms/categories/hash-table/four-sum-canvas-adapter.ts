/**
 * 四数之和 — 画布渲染适配器
 */

import { FourSumStep } from './four-sum-step-compiler';

export function renderFourSumCanvas(container: HTMLElement, step: FourSumStep): void {
  const { array, i, j, left, right, results } = step;

  // 1. 排序数组与四指针
  const trackHtml = array
    .map((num, idx) => {
      const isI = i === idx;
      const isJ = j === idx;
      const isLeft = left === idx;
      const isRight = right === idx;

      let border = '#cbd5e1';
      let bg = '#ffffff';
      let shadow = 'none';
      let transform = 'none';
      if (isI) {
        border = '#3b82f6';
        bg = '#eff6ff';
        shadow = '0 0 0 2px rgba(59, 130, 246, 0.25)';
        transform = 'translateY(-3px)';
      } else if (isJ) {
        border = '#8b5cf6';
        bg = '#f5f3ff';
        shadow = '0 0 0 2px rgba(139, 92, 246, 0.25)';
        transform = 'translateY(-3px)';
      } else if (isLeft) {
        border = '#10b981';
        bg = '#f0fdf4';
        shadow = '0 0 0 2px rgba(16, 185, 129, 0.25)';
        transform = 'translateY(-3px)';
      } else if (isRight) {
        border = '#f59e0b';
        bg = '#fffbeb';
        shadow = '0 0 0 2px rgba(245, 158, 11, 0.25)';
        transform = 'translateY(-3px)';
      }

      const badgeBase =
        'padding: 1px 4px; border-radius: 4px; font-size: 8.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; white-space: nowrap;';
      const badges: string[] = [];
      if (isI) badges.push(`<span style="${badgeBase} background: #3b82f6; color: #ffffff;">i</span>`);
      if (isJ) badges.push(`<span style="${badgeBase} background: #8b5cf6; color: #ffffff;">j</span>`);
      if (isLeft) badges.push(`<span style="${badgeBase} background: #10b981; color: #ffffff;">L</span>`);
      if (isRight) badges.push(`<span style="${badgeBase} background: #f59e0b; color: #ffffff;">R</span>`);

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; position: relative;">
          <div style="position: absolute; top: -18px; display: flex; align-items: center; gap: 2px;">${badges.join('')}</div>
          <div style="width: 38px; height: 42px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-shadow: ${shadow}; transform: ${transform};">
            <span style="font-size: 14px; font-weight: 800; color: #0f172a;">${num}</span>
            <span style="font-size: 8.5px; font-weight: 700; color: #94a3b8;">[${idx}]</span>
          </div>
        </div>
      `;
    })
    .join('');

  // 2. 已捕获解
  const resultsHtml =
    results.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px;">(暂无四元组解)</span>'
      : results
          .map(
            ([a, b, c, d]) => `
          <div style="padding: 2px 7px; border-radius: 6px; background: #f0fdf4; border: 1px solid #86efac; color: #15803d; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
            <span>[${a}, ${b}, ${c}, ${d}]</span>
          </div>
        `
          )
          .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; justify-content: center; gap: 18px; height: 100%; width: 100%; padding: 24px 12px 12px; box-sizing: border-box;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
        <span style="font-size: 10.5px; font-weight: 700; color: #64748b;">排序后数组</span>
        <div style="display: flex; align-items: flex-end; justify-content: center; gap: 6px; width: 100%; overflow-x: auto; padding: 4px;">
          ${trackHtml}
        </div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
        <span style="font-size: 10.5px; font-weight: 700; color: #64748b;">已找到的不重复四元组解</span>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; flex-wrap: wrap; padding: 4px; min-height: 32px; width: 100%;">
          ${resultsHtml}
        </div>
      </div>
    </div>
  `;
}
