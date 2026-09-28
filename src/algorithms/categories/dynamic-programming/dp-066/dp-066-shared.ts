/**
 * 左程云 Class 066: 从递归入手一维动态规划通用视觉呈现组件与沙盘构建器
 */

export interface Dp066StepBase {
  message: string;
  explanation?: string;
  line: number;
  codeLine?: import('../../../../core/step-visualizer').HighlightTarget;
  highlightedIndices?: number[];
  metrics?: Record<string, string | number>;
}

/**
 * 渲染通用一维 DP 数组槽位条
 */
export function renderLinearDpArray(params: {
  dp: (number | string)[];
  activeIdx?: number;
  dependentIndices?: number[];
  labels?: string[];
  title: string;
  summaryText?: string;
}): string {
  const { dp, activeIdx, dependentIndices = [], labels, title, summaryText } = params;

  const slots = dp.map((val, idx) => {
    const isActive = idx === activeIdx;
    const isDep = dependentIndices.includes(idx);
    let bg = '#f8fafc';
    let border = '#cbd5e1';
    let color = '#334155';

    if (isActive) {
      bg = '#eff6ff';
      border = '#3b82f6';
      color = '#1d4ed8';
    } else if (isDep) {
      bg = '#fdf4ff';
      border = '#d946ef';
      color = '#a21caf';
    }

    const label = labels && labels[idx] ? labels[idx] : `i=${idx}`;

    return `
      <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
        <div style="
          min-width: 40px;
          height: 38px;
          padding: 0 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          font-family: monospace;
          font-size: 13px;
          font-weight: 700;
          background: ${bg};
          border: 1.5px solid ${border};
          color: ${color};
          box-shadow: ${isActive ? '0 0 8px rgba(59, 130, 246, 0.3)' : 'none'};
        ">${val !== undefined && val !== null ? val : '-'}</div>
        <span style="font-size:10px; color:${isActive ? '#3b82f6' : isDep ? '#d946ef' : '#64748b'}; font-weight:${isActive || isDep ? 700 : 500};">
          ${label}
        </span>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:10px; padding:12px; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; font-size:13px; color:#1e293b;">📊 ${title}</span>
        ${summaryText ? `<span style="font-size:11px; padding:2px 8px; border-radius:4px; background:#f1f5f9; color:#475569;">${summaryText}</span>` : ''}
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; overflow-x:auto; padding:6px 0;">
        ${slots}
      </div>
    </div>
  `;
}

/**
 * 渲染丑数 II 三指针步进沙盘
 */
export function renderThreePointerUglyBar(params: {
  dp: number[];
  i2: number;
  i3: number;
  i5: number;
  candA: number;
  candB: number;
  candC: number;
  currentUgly: number;
}): string {
  const { dp, i2, i3, i5, candA, candB, candC, currentUgly } = params;

  // 截取前 15 个已求出的丑数展示
  const listHtml = dp.slice(1).map((val, idx) => {
    const originalI = idx + 1;
    const isCur = val === currentUgly;
    return `
      <span style="
        display: inline-block;
        padding: 3px 8px;
        margin: 2px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 11.5px;
        font-weight: 700;
        background: ${isCur ? '#ecfdf5' : '#f8fafc'};
        border: 1px solid ${isCur ? '#10b981' : '#e2e8f0'};
        color: ${isCur ? '#059669' : '#334155'};
      ">#${originalI}: ${val}</span>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:10px; padding:12px; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; font-size:13px; color:#1e293b;">🔢 丑数序列与三指针动态推进沙盘</span>
        <span style="font-size:11.5px; font-weight:700; color:#059669;">最新生成: <strong>${currentUgly}</strong></span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
        <!-- 2 的倍数分支 -->
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:3px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:#1d4ed8;">
            <span>🔵 质因数 2 队列</span>
            <span>指针 i2 = ${i2}</span>
          </div>
          <div style="font-size:11px; color:#475569;">基础丑数 dp[${i2}] = ${dp[i2] ?? 1}</div>
          <div style="font-size:12px; font-weight:700; color:#2563eb; font-family:monospace;">
            候选值 = ${dp[i2] ?? 1} × 2 = ${candA}
          </div>
        </div>

        <!-- 3 的倍数分支 -->
        <div style="background:#fdf4ff; border:1px solid #f5d0fe; border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:3px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:#a21caf;">
            <span>🟣 质因数 3 队列</span>
            <span>指针 i3 = ${i3}</span>
          </div>
          <div style="font-size:11px; color:#475569;">基础丑数 dp[${i3}] = ${dp[i3] ?? 1}</div>
          <div style="font-size:12px; font-weight:700; color:#9333ea; font-family:monospace;">
            候选值 = ${dp[i3] ?? 1} × 3 = ${candB}
          </div>
        </div>

        <!-- 5 的倍数分支 -->
        <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:3px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:#c2410c;">
            <span>🟠 质因数 5 队列</span>
            <span>指针 i5 = ${i5}</span>
          </div>
          <div style="font-size:11px; color:#475569;">基础丑数 dp[${i5}] = ${dp[i5] ?? 1}</div>
          <div style="font-size:12px; font-weight:700; color:#ea580c; font-family:monospace;">
            候选值 = ${dp[i5] ?? 1} × 5 = ${candC}
          </div>
        </div>
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px;">
        <div style="font-size:11px; font-weight:700; color:#475569; margin-bottom:4px;">已收录的前 ${dp.length - 1} 个丑数：</div>
        <div style="display:flex; flex-wrap:wrap; max-height:80px; overflow-y:auto;">
          ${listHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染 26 个字母结尾最长子串长度槽位表 (LeetCode 467)
 */
export function renderAlphabetSlotGrid(params: {
  dp: number[];
  curChar: string;
  curLen: number;
  totalAns: number;
}): string {
  const { dp, curChar, curLen, totalAns } = params;

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const slots = alphabet.map((ch, idx) => {
    const isCur = ch === curChar;
    const len = dp[idx] ?? 0;
    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 4px;
        border-radius: 4px;
        background: ${isCur ? '#eff6ff' : len > 0 ? '#f8fafc' : '#ffffff'};
        border: 1px solid ${isCur ? '#3b82f6' : len > 0 ? '#cbd5e1' : '#e2e8f0'};
      ">
        <span style="font-size:11px; font-weight:700; color:${isCur ? '#1d4ed8' : '#334155'}; font-family:monospace;">${ch}</span>
        <span style="font-size:12px; font-weight:700; color:${len > 0 ? '#059669' : '#94a3b8'}; font-family:monospace;">${len}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:10px; padding:12px; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; font-size:13px; color:#1e293b;">🔡 26 字母结尾最长连续子串长度表</span>
        <span style="font-size:11px; padding:2px 8px; border-radius:4px; background:#ecfdf5; color:#047857; font-weight:700;">
          非空子串累计总和: ${totalAns}
        </span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(13, 1fr); gap:4px;">
        ${slots}
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px; display:flex; justify-content:space-between; font-size:11.5px;">
        <span>当前扫描字符: <strong style="color:#2563eb; font-family:monospace; font-size:13px;">${curChar || '-'}</strong></span>
        <span>当前连续递增长度: <strong style="color:#d946ef; font-family:monospace; font-size:13px;">${curLen}</strong></span>
      </div>
    </div>
  `;
}
