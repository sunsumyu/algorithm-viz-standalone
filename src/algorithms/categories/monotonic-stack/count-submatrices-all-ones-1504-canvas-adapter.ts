import { type SubmatrixStep } from './count-submatrices-all-ones-1504-step-compiler';

export function renderCountSubmatricesCanvas(container: HTMLElement, step: SubmatrixStep) {
  const matHtml = step.mat
    .map((row, r) => {
      const isCurRow = step.currentRow === r;
      const cells = row
        .map((cell) => {
          const isOne = cell === 1;
          const bg = isOne
            ? isCurRow
              ? 'background: rgba(16, 185, 129, 0.4); border: 1px solid #34d399;'
              : 'background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(52, 211, 153, 0.3);'
            : 'background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.1);';
          return `<div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; border-radius: 4px; ${bg} color: ${isOne ? '#34d399' : '#64748b'};">${cell}</div>`;
        })
        .join('');
      return `<div style="display: flex; gap: 4px; align-items: center;"><span style="font-size: 10px; color: #64748b; width: 40px;">Row ${r + 1}</span>${cells}</div>`;
    })
    .join('');

  const heightsHtml = step.heights
    .map((h, j) => `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div style="width: 32px; height: ${Math.max(12, h * 24)}px; background: rgba(56, 189, 248, 0.4); border: 1px solid #38bdf8; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #f8fafc;">
          ${h}
        </div>
        <div style="font-size: 10px; color: #64748b;">Col ${j + 1}</div>
      </div>
    `)
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">矩阵压缩高度与单调栈结算沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">
            当前底行: Row ${step.currentRow + 1}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
          <span style="color: #34d399; font-weight: bold; padding: 2px 8px; border-radius: 4px; background: rgba(52, 211, 153, 0.2); border: 1px solid rgba(52, 211, 153, 0.3);">全 1 子矩形总数: ${step.totalCount}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 14px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        <div>
          <div style="font-size: 11px; font-weight: 600; color: #94a3b8; margin-bottom: 8px;">原始 0-1 矩阵</div>
          <div style="display: flex; flex-direction: column; gap: 4px;">${matHtml}</div>
        </div>
        <div>
          <div style="font-size: 11px; font-weight: 600; color: #38bdf8; margin-bottom: 8px;">当前压缩柱状图高度</div>
          <div style="display: flex; gap: 8px; align-items: flex-end; min-height: 90px; padding-bottom: 4px;">${heightsHtml}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); background: rgba(14, 165, 233, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">1. 二维高度压缩</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">若 mat[i][j] == 0 则高度归零，否则 height[j]++，将二维问题降为 M 个一维直方图。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #fde047;">2. 单调栈边界结算</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">弹出柱子时左右边界确定宽度跨度 k，高度差 (h[cur] - down) 与组合数 k*(k+1)/2 相乘。</div>
        </div>
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(52, 211, 153, 0.3); background: rgba(16, 185, 129, 0.1);">
          <div style="font-size: 12px; font-weight: bold; color: #34d399;">3. 严格 O(M * N)</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">每根柱子进出单调栈仅一次，无冗余重叠枚举，达到理论最优时空极限。</div>
        </div>
      </div>
    </div>
  `;
}
