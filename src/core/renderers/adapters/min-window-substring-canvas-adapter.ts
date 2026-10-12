import { MinWindowStep } from './min-window-substring-step-compiler';

export function renderMinWindowSandbox(step: MinWindowStep): string {
  const charsHtml = step.s.split('').map((c, idx) => {
    const inWindow = idx >= step.l && idx <= step.r;
    const isL = idx === step.l;
    const isR = idx === step.r;

    let cellBg = '#f8fafc';
    let cellBorder = '1px solid #e2e8f0';
    let cellColor = '#475569';
    let shadow = 'none';

    if (inWindow) {
      cellBg = '#f0f9ff';
      cellBorder = '1.5px solid #38bdf8';
      cellColor = '#0369a1';
      shadow = '0 1px 3px rgba(56, 189, 248, 0.15)';
    }
    if (isL) {
      cellBorder = '2px solid #f59e0b';
    } else if (isR) {
      cellBorder = '2px solid #22c55e';
    }

    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; margin:3px 4px; flex-shrink: 0;">
        <span style="font-size:10px; font-family:'JetBrains Mono', monospace; color:#94a3b8; margin-bottom:2px;">#${idx}</span>
        <div style="width:36px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:${cellBg}; border:${cellBorder}; box-shadow:${shadow}; font-weight:800; font-size:16px; font-family:'JetBrains Mono', monospace; color:${cellColor}; transition: all 0.2s ease;">
          ${c}
        </div>
        <span style="font-size:9px; height:14px; margin-top:2px;">
          ${isL && isR ? '<b style="color:#d97706; background:#fef3c7; padding:1px 3px; border-radius:3px;">L,R</b>' : isL ? '<b style="color:#d97706; background:#fef3c7; padding:1px 3px; border-radius:3px;">L</b>' : isR ? '<b style="color:#16a34a; background:#dcfce7; padding:1px 3px; border-radius:3px;">R</b>' : ''}
        </span>
      </div>
    `;
  }).join('');

  const debtTableHtml = step.debtMap.map(d => {
    let chipBg = '#f8fafc';
    let chipBorder = '#e2e8f0';
    let valColor = '#64748b';
    let valText = `${d.count}`;

    if (d.count > 0) {
      chipBg = '#fef2f2';
      chipBorder = '#fecaca';
      valColor = '#ef4444';
      valText = `欠 ${d.count}`;
    } else if (d.count === 0) {
      chipBg = '#f0fdf4';
      chipBorder = '#bbf7d0';
      valColor = '#16a34a';
      valText = '平账 ✓';
    } else {
      chipBg = '#eff6ff';
      chipBorder = '#bfdbfe';
      valColor = '#2563eb';
      valText = `富余 ${Math.abs(d.count)}`;
    }

    return `
      <div style="display:inline-flex; align-items:center; gap:6px; background:${chipBg}; border:1px solid ${chipBorder}; border-radius:8px; padding:4px 10px; margin:3px; font-family:'JetBrains Mono', monospace; font-size:12px;">
        <span style="font-weight:700; color:#0f172a;">'${d.char}':</span>
        <span style="font-weight:800; color:${valColor};">${valText}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:14px; width:100%; height:100%; justify-content:center; padding:12px 6px; box-sizing:border-box;">
      <!-- 欠账借贷与滑窗状态概览 -->
      <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; padding:0 4px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:12px; font-weight:700; color:#0f172a;">💳 欠账表实时账本 (目标串 t = "${step.t}"):</span>
          <div style="display:flex; flex-wrap:wrap;">
            ${debtTableHtml}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px; font-size:11px; padding:4px 10px; border-radius:6px; background:#f1f5f9; color:#475569;">
          <span>当前区间: <strong style="color:#2563eb; font-family:monospace;">[${step.l} .. ${step.r}]</strong></span>
          <span>·</span>
          <span style="font-weight:700; color:${step.allDebt === 0 ? '#16a34a' : '#dc2626'};">
            ${step.allDebt === 0 ? '✓ 全网欠账已清' : `尚欠: ${step.allDebt} 字符`}
          </span>
        </div>
      </div>

      <!-- 字符轨道滚动视口 (纯粹主画布，占据主导地位) -->
      <div style="display:flex; align-items:center; overflow-x:auto; padding:18px 12px; background:#ffffff; border:1px solid #f1f5f9; border-radius:12px; box-shadow:inset 0 2px 4px rgba(0,0,0,0.02);">
        ${charsHtml}
      </div>

      <!-- 底部图例说明 -->
      <div style="display:flex; align-items:center; justify-content:space-between; padding:0 8px; font-size:11px; color:#64748b;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="display:inline-flex; align-items:center; gap:4px;">
            <span style="width:10px; height:10px; border-radius:2px; background:#fef3c7; border:1.5px solid #f59e0b;"></span>
            L 左收缩指针
          </span>
          <span style="display:inline-flex; align-items:center; gap:4px;">
            <span style="width:10px; height:10px; border-radius:2px; background:#dcfce7; border:1.5px solid #22c55e;"></span>
            R 右扩张指针
          </span>
          <span style="display:inline-flex; align-items:center; gap:4px;">
            <span style="width:10px; height:10px; border-radius:2px; background:#f0f9ff; border:1.5px solid #38bdf8;"></span>
            滑动窗口覆盖区间
          </span>
        </div>
        <span style="font-family:'JetBrains Mono', monospace; font-size:11px; color:#94a3b8;">
          最优解: ${step.bestSubstr ? `"${step.bestSubstr}"` : '—'}
        </span>
      </div>
    </div>
  `;
}
