/**
 * 左程云 Class 065: A* 启发式搜索通用棋盘与波前队列渲染器
 */

export interface Graph065StepBase {
  message: string;
  explanation?: string;
  line: number;
  metrics?: Record<string, string | number>;
  status?: 'init' | 'check' | 'search' | 'expand' | 'reach' | 'unsolvable' | 'done';
}

/**
 * 渲染 2x3 滑动谜题棋盘
 */
export function renderSlidingGrid(params: {
  boardStr: string;
  targetStr?: string;
  curG: number;
  curH: number;
  curF: number;
  swappedIndices?: [number, number];
}): string {
  const { boardStr, targetStr = '123450', curG, curH, curF, swappedIndices } = params;

  const cells = boardStr.split('').map((ch, idx) => {
    const isZero = ch === '0';
    const isSwapped = swappedIndices && (idx === swappedIndices[0] || idx === swappedIndices[1]);
    const targetCh = targetStr[idx];
    const isMatch = ch === targetCh;

    let bg = '#ffffff';
    let border = '#cbd5e1';
    let color = '#1e293b';

    if (isZero) {
      bg = '#f1f5f9';
      border = '#94a3b8';
      color = '#64748b';
    } else if (isSwapped) {
      bg = '#eff6ff';
      border = '#3b82f6';
      color = '#1d4ed8';
    } else if (isMatch) {
      bg = '#f0fdf4';
      border = '#86efac';
      color = '#166534';
    }

    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 68px;
        height: 60px;
        background: ${bg};
        border: 2px solid ${border};
        border-radius: 8px;
        font-family: monospace;
        font-size: 22px;
        font-weight: 800;
        color: ${color};
        box-shadow: ${isSwapped ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none'};
      ">
        <span>${isZero ? '␣' : ch}</span>
        <span style="font-size: 9px; font-weight: 500; color: #94a3b8;">#${idx}</span>
      </div>
    `;
  });

  return `
    <div style="display:flex; flex-direction:column; gap:12px; padding:14px; background:#ffffff; border-radius:10px; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; font-size:14px; color:#0f172a;">🧩 2×3 滑动谜题实时棋盘状态</span>
        <div style="display:flex; gap:6px; font-size:11.5px; font-family:monospace;">
          <span style="padding:2px 8px; border-radius:4px; background:#eff6ff; color:#1d4ed8; font-weight:700;">g=${curG}</span>
          <span style="padding:2px 8px; border-radius:4px; background:#fdf4ff; color:#a21caf; font-weight:700;">h=${curH}</span>
          <span style="padding:2px 8px; border-radius:4px; background:#ecfdf5; color:#059669; font-weight:700;">f=g+h=${curF}</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 68px); gap:8px; justify-content:center; padding:10px 0;">
        ${cells.join('')}
      </div>

      <div style="display:flex; justify-content:space-between; font-size:11.5px; color:#64748b; border-top:1px dashed #e2e8f0; padding-top:8px;">
        <span>目标状态: <code style="font-weight:700; color:#059669;">${targetStr}</code></span>
        <span>当前序列: <code style="font-weight:700; color:#2563eb;">${boardStr}</code></span>
      </div>
    </div>
  `;
}

/**
 * 渲染 3x3 八数码棋盘
 */
export function renderEightPuzzleGrid(params: {
  boardStr: string;
  targetStr?: string;
  curG: number;
  curH: number;
  curF: number;
  invCount?: number;
  isSolvable?: boolean;
}): string {
  const { boardStr, targetStr = '123804765', curG, curH, curF, invCount, isSolvable } = params;

  const cells = boardStr.split('').map((ch, idx) => {
    const isZero = ch === '0';
    const targetCh = targetStr[idx];
    const isMatch = ch === targetCh;

    let bg = '#ffffff';
    let border = '#cbd5e1';
    let color = '#1e293b';

    if (isZero) {
      bg = '#f8fafc';
      border = '#94a3b8';
      color = '#64748b';
    } else if (isMatch) {
      bg = '#f0fdf4';
      border = '#86efac';
      color = '#166534';
    }

    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 58px;
        height: 52px;
        background: ${bg};
        border: 2px solid ${border};
        border-radius: 6px;
        font-family: monospace;
        font-size: 20px;
        font-weight: 800;
        color: ${color};
      ">
        <span>${isZero ? '␣' : ch}</span>
        <span style="font-size: 9px; font-weight: 500; color: #94a3b8;">(${Math.floor(idx / 3)},${idx % 3})</span>
      </div>
    `;
  });

  return `
    <div style="display:flex; flex-direction:column; gap:10px; padding:14px; background:#ffffff; border-radius:10px; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; font-size:14px; color:#0f172a;">🎲 3×3 八数码矩阵沙盘 (洛谷 P1379)</span>
        <div style="display:flex; gap:6px; font-size:11.5px; font-family:monospace;">
          <span style="padding:2px 8px; border-radius:4px; background:#eff6ff; color:#1d4ed8; font-weight:700;">g=${curG}</span>
          <span style="padding:2px 8px; border-radius:4px; background:#fdf4ff; color:#a21caf; font-weight:700;">h=${curH}</span>
          <span style="padding:2px 8px; border-radius:4px; background:#ecfdf5; color:#059669; font-weight:700;">f=${curF}</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 58px); gap:6px; justify-content:center; padding:8px 0;">
        ${cells.join('')}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; border-top:1px dashed #e2e8f0; padding-top:8px;">
        <span>逆序对数: <strong style="font-family:monospace; color:#475569;">${invCount ?? '-'}</strong></span>
        ${isSolvable !== undefined ? `
          <span style="padding:2px 8px; border-radius:4px; font-weight:700; background:${isSolvable ? '#ecfdf5' : '#fef2f2'}; color:${isSolvable ? '#059669' : '#dc2626'};">
            ${isSolvable ? '✓ 奇偶同性 (有解)' : '✗ 奇偶异性 (无解剪枝)'}
          </span>
        ` : ''}
        <span>目标状态: <code style="font-weight:700; color:#059669;">${targetStr}</code></span>
      </div>
    </div>
  `;
}
