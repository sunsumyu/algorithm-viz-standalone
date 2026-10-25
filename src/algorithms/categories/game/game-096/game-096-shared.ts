/**
 * 左神算法通关课 第 096 课 - SG 函数与综合博弈公共可视化组件与接口
 */

export interface Game096Step {
  line?: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string>;
  sgTable?: number[];
  curIdx?: number;
  transitions?: { from: number; to: number; toSg: number }[];
  appearSet?: number[];
  computedMex?: number;
  xorSum?: number;
  isFirstWin?: boolean;
}

/**
 * 渲染 1 维 SG 函数打表看板
 */
export function renderSgTable(
  container: HTMLElement,
  sgTable: number[],
  activeIdx?: number,
  label: string = 'SG 函数状态表'
) {
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #1e293b;
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  `;

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; color: #cbd5e1;';
  header.innerHTML = `
    <span style="display: flex; align-items: center; gap: 6px; color: #f8fafc;">📊 ${label}</span>
    <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">
      <span style="color: #34d399; font-weight: 700;">绿色: 必胜 (SG>0)</span> | <span style="color: #f87171; font-weight: 700;">红色: 必败 (SG=0)</span>
    </span>
  `;
  wrapper.appendChild(header);

  const grid = document.createElement('div');
  grid.style.cssText = `
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 4px;
  `;

  sgTable.forEach((val, idx) => {
    const isActive = idx === activeIdx;
    const isZero = val === 0;
    const col = document.createElement('div');
    const colGlow = isActive ? 'box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);' : '';
    col.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 36px;
      padding: 5px 3px;
      border-radius: 6px;
      background: ${isActive ? 'rgba(56, 189, 248, 0.15)' : '#1e293b'};
      border: 1.5px solid ${isActive ? '#38bdf8' : '#334155'};
      font-family: 'JetBrains Mono', monospace;
      ${colGlow}
      transition: all 0.2s ease;
    `;

    // 索引下标 x
    const idxLabel = document.createElement('div');
    idxLabel.style.cssText = `font-size: 10px; color: ${isActive ? '#38bdf8' : '#94a3b8'}; font-weight: 700;`;
    idxLabel.textContent = `${idx}`;
    col.appendChild(idxLabel);

    // SG(x) 数值
    const valBadge = document.createElement('div');
    valBadge.style.cssText = `
      margin-top: 3px;
      font-size: 12px;
      font-weight: 800;
      color: ${isZero ? '#f87171' : '#34d399'};
      background: ${isZero ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'};
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid ${isZero ? '#ef4444' : '#10b981'};
    `;
    valBadge.textContent = `${val}`;
    col.appendChild(valBadge);

    grid.appendChild(col);
  });

  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}

/**
 * 渲染 mex 算子计算图解卡片
 */
export function renderMexCard(
  container: HTMLElement,
  appearSet: number[] = [],
  computedMex: number = 0,
  title: string = 'mex (Minimum Excluded) 最小非负整数计算'
) {
  const card = document.createElement('div');
  card.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #334155;
    color: #f8fafc;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
  `;

  const sortedAppeared = Array.from(new Set(appearSet)).sort((a, b) => a - b);
  const appearHtml = sortedAppeared.length === 0
    ? '<span style="color: #64748b;">∅ (空集)</span>'
    : `{ ${sortedAppeared.map(v => `<span style="color: #38bdf8; font-weight: 700;">${v}</span>`).join(', ')} }`;

  card.innerHTML = `
    <div style="font-weight: 700; color: #cbd5e1; display: flex; justify-content: space-between;">
      <span>⚙️ ${title}</span>
      <span style="color: #facc15; font-weight: 800;">mex = ${computedMex}</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; color: #94a3b8;">
      <span>后继状态 SG 集合:</span>
      <div>${appearHtml}</div>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #64748b;">
      <span>从 0 开始搜索未出现的最小整数 ➔ </span>
      <span style="color: #4ade80; font-weight: 700; background: #064e3b; padding: 2px 8px; border-radius: 4px; border: 1px solid #059669;">
        命中首个缺失非负整数 ${computedMex}
      </span>
    </div>
  `;

  container.appendChild(card);
}

/**
 * 渲染胜负判定横幅
 */
export function renderPlayerBanner(
  container: HTMLElement,
  isFirstWin: boolean,
  reason: string = '',
  subtitle: string = ''
) {
  const banner = document.createElement('div');
  const bg = isFirstWin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  const border = isFirstWin ? '#10b981' : '#ef4444';
  const color = isFirstWin ? '#34d399' : '#f87171';
  const glow = isFirstWin ? '0 0 12px rgba(16, 185, 129, 0.25)' : '0 0 12px rgba(239, 68, 68, 0.25)';
  const text = isFirstWin ? '🏆 先手必胜 (First Player Wins)' : '🛡️ 后手必胜 (Second Player Wins)';

  banner.style.cssText = `
    padding: 10px 16px;
    background: ${bg};
    border: 1.5px solid ${border};
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: ${glow};
  `;
  banner.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 2px;">
      <span style="font-size: 14px; font-weight: 800; color: ${color};">${text}</span>
      ${subtitle ? `<span style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">${subtitle}</span>` : ''}
    </div>
    ${reason ? `<span style="font-size: 12px; font-weight: 700; color: ${color}; background: rgba(15, 23, 42, 0.6); padding: 4px 10px; border-radius: 6px; border: 1px solid ${border}80;">${reason}</span>` : ''}
  `;
  container.appendChild(banner);
}

/**
 * 渲染多子游戏 SG 异或和看板
 */
export function renderBitwiseXorBoard(
  container: HTMLElement,
  items: ({ label: string; val: number } | number)[],
  totalXor: number,
  title: string = '多子游戏 SG 异或和综合判定'
) {
  const card = document.createElement('div');
  card.style.cssText = `
    padding: 12px 16px;
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #1e293b;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  `;
  const normalizedItems = items.map((it, idx) =>
    typeof it === 'number' ? { label: `子游戏 #${idx + 1}`, val: it } : it
  );
  const itemsHtml = normalizedItems.map(it => `
    <div style="display: flex; align-items: center; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 3px 0;">
      <span style="color: #94a3b8; width: 140px;">${it.label}:</span>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: 800; color: #38bdf8; font-size: 13px;">SG = ${it.val}</span>
        <span style="font-size: 11px; color: #64748b; background: #020617; padding: 1px 6px; border-radius: 4px; border: 1px solid #1e293b;">(0b${(it.val >>> 0).toString(2).padStart(4, '0')})</span>
      </div>
    </div>
  `).join('');

  card.innerHTML = `
    <div style="font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 2px; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">⚡ ${title}</div>
    ${itemsHtml}
    <div style="height: 1px; background: #1e293b; margin: 4px 0;"></div>
    <div style="display: flex; align-items: center; justify-content: space-between; font-family: 'JetBrains Mono', monospace;">
      <span style="font-weight: 700; color: #f8fafc; font-size: 12px;">综合 SG 异或和:</span>
      <span style="font-size: 14px; font-weight: 900; color: ${totalXor !== 0 ? '#34d399' : '#f87171'}; background: ${totalXor !== 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; padding: 3px 10px; border-radius: 6px; border: 1px solid ${totalXor !== 0 ? '#10b981' : '#ef4444'};">
        XOR = ${totalXor} (0b${(totalXor >>> 0).toString(2)}) ➔ ${totalXor !== 0 ? '必胜态' : '必败态'}
      </span>
    </div>
  `;
  container.appendChild(card);
}

