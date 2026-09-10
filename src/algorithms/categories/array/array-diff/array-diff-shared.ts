/**
 * 一维与二维差分公共可视化呈现组件与接口
 */

export interface ArrayDiffStep {
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string>;
  diffArray?: number[];
  ansArray?: number[];
  activeRange?: { l: number; r: number; val: number };
  diffMatrix?: number[][];
  ansMatrix?: number[][];
  curCoord?: { r: number; c: number };
}

/**
 * 渲染一维差分与前缀和还原数组
 */
export function renderDiff1DView(
  container: HTMLElement,
  diff: number[],
  ans: number[],
  activeRange?: { l: number; r: number; val: number }
) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%;';

  // 1. 差分数组 diff
  const diffCard = document.createElement('div');
  diffCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';
  
  const diffCells = diff.map((val, idx) => {
    const isL = activeRange && idx === activeRange.l;
    const isR1 = activeRange && idx === activeRange.r + 1;
    let bg = '#f8fafc';
    let border = '#cbd5e1';
    let color = '#334155';

    if (isL) {
      bg = '#ecfdf5';
      border = '#10b981';
      color = '#047857';
    } else if (isR1) {
      bg = '#fef2f2';
      border = '#ef4444';
      color = '#b91c1c';
    }

    return `
      <div style="min-width: 42px; padding: 4px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; text-align: center; font-family: monospace;">
        <div style="font-size: 10px; color: #64748b;">[${idx}]</div>
        <div style="font-size: 13px; font-weight: 800; color: ${color};">${val > 0 ? `+${val}` : val}</div>
      </div>
    `;
  }).join('');

  diffCard.innerHTML = `
    <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 6px; display: flex; justify-content: space-between;">
      <span>🎚️ 差分数组 diff[1..n+1]:</span>
      ${activeRange ? `<span style="color: #2563eb;">当前操作: [${activeRange.l}, ${activeRange.r}] 加 ${activeRange.val}</span>` : ''}
    </div>
    <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">${diffCells}</div>
  `;
  wrapper.appendChild(diffCard);

  // 2. 前缀和还原数组 ans
  if (ans && ans.length > 0) {
    const ansCard = document.createElement('div');
    ansCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

    const ansCells = ans.map((val, idx) => `
      <div style="min-width: 42px; padding: 4px; border-radius: 6px; background: #eff6ff; border: 1.5px solid #3b82f6; text-align: center; font-family: monospace;">
        <div style="font-size: 10px; color: #64748b;">#${idx + 1}</div>
        <div style="font-size: 14px; font-weight: 800; color: #1d4ed8;">${val}</div>
      </div>
    `).join('');

    ansCard.innerHTML = `
      <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
        ✨ 前缀和还原数组 ans[0..n-1]:
      </div>
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">${ansCells}</div>
    `;
    wrapper.appendChild(ansCard);
  }

  container.appendChild(wrapper);
}
