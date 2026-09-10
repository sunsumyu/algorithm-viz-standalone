/**
 * 左神算法通关课 第 095 课 - 经典博弈论公共可视化组件与接口
 */

export interface Game095Step {
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string>;
  piles?: number[];
  activePileIdx?: number;
  xorSum?: number;
  isFirstWin?: boolean;
  explanation?: string;
}

/**
 * 渲染博弈状态指示条 (先手必胜 N 态 vs 先手必败 P 态)
 */
export function renderPlayerBanner(
  container: HTMLElement,
  isFirstWin: boolean,
  statusText: string,
  formulaText: string
) {
  const banner = document.createElement('div');
  const winBg = isFirstWin ? '#ecfdf5' : '#fef2f2';
  const winBorder = isFirstWin ? '#10b981' : '#ef4444';
  const winColor = isFirstWin ? '#047857' : '#b91c1c';
  const badgeText = isFirstWin ? '🏆 先手必胜 (N-position)' : '💀 先手必败 (P-position)';

  banner.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: ${winBg};
    border-radius: 8px;
    border: 1.5px solid ${winBorder};
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  `;

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 13px; font-weight: 800; color: ${winColor}; background: #ffffff; padding: 3px 10px; border-radius: 6px; border: 1px solid ${winBorder}60;">
        ${badgeText}
      </span>
      <span style="font-size: 13px; font-weight: 600; color: #1e293b;">${statusText}</span>
    </div>
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: #475569; background: #ffffffcc; padding: 3px 10px; border-radius: 6px;">
      ${formulaText}
    </div>
  `;

  container.appendChild(banner);
}

/**
 * 渲染石子堆物理堆叠展示
 */
export function renderStonePiles(
  container: HTMLElement,
  piles: number[],
  activePileIdx?: number,
  highlightStones?: number
) {
  const pilesBox = document.createElement('div');
  pilesBox.style.cssText = `
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: flex-end;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    min-height: 140px;
    overflow-x: auto;
  `;

  piles.forEach((count, idx) => {
    const isActive = activePileIdx === idx;
    const col = document.createElement('div');
    col.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      min-width: 68px;
    `;

    // 堆顶石子数量徽章
    const countBadge = document.createElement('div');
    countBadge.style.cssText = `
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 800;
      color: ${isActive ? '#2563eb' : '#334155'};
      background: ${isActive ? '#eff6ff' : '#ffffff'};
      border: 1.5px solid ${isActive ? '#3b82f6' : '#cbd5e1'};
      border-radius: 12px;
      padding: 2px 8px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    `;
    countBadge.textContent = `${count} 颗`;
    col.appendChild(countBadge);

    // 石子颗粒柱状图 (最多渲染 12 个小圆片，多于 12 则合并压缩展示)
    const stonesStack = document.createElement('div');
    stonesStack.style.cssText = `
      display: flex;
      flex-direction: column-reverse;
      gap: 3px;
      align-items: center;
      min-height: 50px;
      width: 100%;
    `;

    const visibleDots = Math.min(count, 12);
    for (let s = 0; s < visibleDots; s++) {
      const dot = document.createElement('div');
      const isTarget = isActive && highlightStones && s >= count - highlightStones;
      dot.style.cssText = `
        width: 36px;
        height: 7px;
        border-radius: 4px;
        background: ${isTarget ? '#f59e0b' : isActive ? '#3b82f6' : '#64748b'};
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 1px 2px rgba(0,0,0,0.15);
        transition: all 0.2s ease;
      `;
      stonesStack.appendChild(dot);
    }

    if (count > 12) {
      const moreText = document.createElement('div');
      moreText.style.cssText = 'font-size: 10px; color: #94a3b8; font-weight: 600;';
      moreText.textContent = `+${count - 12} 隐藏`;
      stonesStack.appendChild(moreText);
    }

    col.appendChild(stonesStack);

    // 底部堆标号
    const label = document.createElement('div');
    label.style.cssText = `
      font-size: 11px;
      font-weight: 700;
      color: ${isActive ? '#1d4ed8' : '#64748b'};
      font-family: 'JetBrains Mono', monospace;
    `;
    label.textContent = `第 ${idx + 1} 堆`;
    col.appendChild(label);

    pilesBox.appendChild(col);
  });

  container.appendChild(pilesBox);
}

/**
 * 渲染尼姆博弈二进制异或和看板
 */
export function renderBitwiseXorBoard(
  container: HTMLElement,
  piles: number[],
  xorSum: number
) {
  const board = document.createElement('div');
  board.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 16px;
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #334155;
    color: #f8fafc;
    font-family: 'JetBrains Mono', monospace;
  `;

  // 计算最大位宽 (至少 4 位)
  const maxVal = Math.max(...piles, xorSum, 1);
  const bitWidth = Math.max(4, Math.ceil(Math.log2(maxVal + 1)));

  const titleRow = document.createElement('div');
  titleRow.style.cssText = 'display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 4px;';
  titleRow.innerHTML = `
    <span>各堆石子二进制展开 (按位异或运算)</span>
    <span style="color: ${xorSum === 0 ? '#ef4444' : '#10b981'}; font-weight: 700;">
      XOR 结果 = ${xorSum} (${xorSum === 0 ? '平衡态 / 必败' : '非平衡态 / 必胜'})
    </span>
  `;
  board.appendChild(titleRow);

  // 渲染每堆的二进制表示
  piles.forEach((stones, idx) => {
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; font-size: 12px;';
    const binStr = stones.toString(2).padStart(bitWidth, '0');
    
    row.innerHTML = `
      <span style="color: #cbd5e1; width: 80px;">堆 #${idx + 1} (${stones}):</span>
      <div style="display: flex; gap: 4px;">
        ${binStr.split('').map(b => `
          <span style="display: inline-block; width: 18px; text-align: center; padding: 2px 0; border-radius: 3px; background: ${b === '1' ? '#1e293b' : '#090d16'}; color: ${b === '1' ? '#38bdf8' : '#475569'}; font-weight: ${b === '1' ? '700' : '400'}; border: 1px solid ${b === '1' ? '#38bdf840' : '#1e293b'};">
            ${b}
          </span>
        `).join('')}
      </div>
    `;
    board.appendChild(row);
  });

  // 分割线
  const divider = document.createElement('div');
  divider.style.cssText = 'height: 1px; background: #334155; margin: 4px 0;';
  board.appendChild(divider);

  // 异或和行
  const xorRow = document.createElement('div');
  xorRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700;';
  const xorBinStr = xorSum.toString(2).padStart(bitWidth, '0');
  xorRow.innerHTML = `
    <span style="color: #facc15; width: 80px;">XOR 异或和:</span>
    <div style="display: flex; gap: 4px;">
      ${xorBinStr.split('').map(b => `
        <span style="display: inline-block; width: 18px; text-align: center; padding: 2px 0; border-radius: 3px; background: ${b === '1' ? '#3b82f630' : '#090d16'}; color: ${b === '1' ? '#60a5fa' : '#64748b'}; font-weight: 800; border: 1px solid ${b === '1' ? '#60a5fa' : '#334155'};">
          ${b}
        </span>
      `).join('')}
    </div>
  `;
  board.appendChild(xorRow);

  container.appendChild(board);
}
