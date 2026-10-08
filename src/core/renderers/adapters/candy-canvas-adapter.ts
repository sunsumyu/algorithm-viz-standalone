import type { CandyStep } from './candy-step-compiler';

export function renderCandyCanvas(container: HTMLElement, step: CandyStep): void {
  const ratings = step.ratings;
  const candies = step.candies;
  const n = ratings.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const childrenHtml = ratings
    .map((r, idx) => {
      const c = candies[idx] ?? 1;
      const isCurrent = idx === curIdx && !isDone;

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = '#fef2f2';
        borderColor = '#ef4444';
        textColor = '#dc2626';
      }

      const candyDots = Array.from({ length: Math.min(c, 6) })
        .map(() => `<span style="font-size: 10px;">🍬</span>`)
        .join('');

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9px; color: ${isCurrent ? '#ef4444' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 当前' : `[${idx}]`}
          </span>
          <div style="width: 52px; min-height: 58px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); gap: 2px;">
            <span style="font-size: 10px; color: #64748b;">评分: ${r}</span>
            <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1px; max-width: 44px;">
              ${candyDots}
            </div>
            <span style="font-size: 11px; color: #ef4444; font-weight: 800;">${c} 颗</span>
          </div>
        </div>
      `;
    })
    .join('');

  const totalSoFar = candies.reduce((acc, v) => acc + v, 0);

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>遍历阶段: <strong style="color: #ef4444;">${step.direction === 'left-to-right' ? '➡️ 从左到右 (右 > 左 递增)' : step.direction === 'right-to-left' ? '⬅️ 从右到左 (左 > 右 取 max)' : step.direction === 'done' ? '✓ 完成' : '初始化'}</strong></span>
        <span>当前糖果总数: <strong style="color: #ef4444; font-family: monospace; font-size: 12.5px;">${totalSoFar} 颗</strong></span>
      </div>

      <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
        ${childrenHtml}
      </div>
    </div>
  `;
}
