/**
 * 旋转字符串 / 字符串迁移 (Rotate String · LeetCode 796) 领域视觉适配器
 * 遵循 Matt Pocock 深模块规范：
 * Card 1 输出 100% 纯净 SVG 字符串双倍拼接与滑动窗口匹配沙盘
 * Card 2 承载旋转移位指标监视器与子串等价性推导舱
 */

import type { SCStep } from '../../../algorithms/categories/graph/string-migration-step-compiler';

export function renderStringMigrationCanvas(container: HTMLElement, step: SCStep): void {
  const { str2, concat, windowStart, windowEnd, matched } = step;
  const n2 = str2.length;
  const nConcat = concat.length;

  const boxW = 32;
  const boxH = 34;
  const gap = 38;

  // 1. 目标串 goal 字符槽位 (y = 35)
  const startXGoal = Math.max(20, Math.round((520 - n2 * gap) / 2));
  let svgGoal = `
    <text x="${startXGoal - 12}" y="57" fill="#94a3b8" font-size="10.5" font-weight="700" text-anchor="end">goal:</text>
  `;

  for (let i = 0; i < n2; i++) {
    const x = startXGoal + i * gap;
    const y = 35;
    const ch = str2[i] ?? '';
    const border = matched ? '#10b981' : '#64748b';
    const bg = matched ? 'rgba(6, 95, 70, 0.4)' : '#1e293b';

    svgGoal += `
      <g>
        <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="6" fill="${bg}" stroke="${border}" stroke-width="${matched ? 2 : 1.2}" />
        <text x="${x + boxW / 2}" y="${y + 22}" fill="#f8fafc" font-size="13" font-weight="800" font-family="monospace" text-anchor="middle">${ch}</text>
      </g>
    `;
  }

  // 2. 双倍拼接串 s + s 字符槽位 (y = 120)
  const startXConcat = Math.max(15, Math.round((520 - nConcat * gap) / 2));
  let svgConcat = `
    <text x="${startXConcat - 12}" y="142" fill="#94a3b8" font-size="10.5" font-weight="700" text-anchor="end">s + s:</text>
  `;

  for (let j = 0; j < nConcat; j++) {
    const x = startXConcat + j * gap;
    const y = 120;
    const ch = concat[j] ?? '';
    const inWindow = j >= windowStart && j < windowEnd;

    let bg = '#0f172a';
    let border = '#334155';
    let strokeW = 1;

    if (inWindow && matched) {
      bg = '#065f46';
      border = '#22c55e';
      strokeW = 2.2;
    } else if (inWindow) {
      bg = '#1e3a8a';
      border = '#38bdf8';
      strokeW = 1.8;
    }

    svgConcat += `
      <g>
        <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="6" fill="${bg}" stroke="${border}" stroke-width="${strokeW}" />
        <text x="${x + boxW / 2}" y="${y - 4}" fill="#64748b" font-size="8.5" font-family="monospace" text-anchor="middle">${j}</text>
        <text x="${x + boxW / 2}" y="${y + 22}" fill="#f8fafc" font-size="13" font-weight="800" font-family="monospace" text-anchor="middle">${ch}</text>
      </g>
    `;
  }

  // 3. 滑动窗口指示外框与匹配连线
  let svgWindow = '';
  if (windowEnd > windowStart) {
    const winX = startXConcat + windowStart * gap - 4;
    const winW = (windowEnd - windowStart) * gap - 2;
    const winStroke = matched ? '#10b981' : '#38bdf8';

    svgWindow += `
      <rect x="${winX}" y="112" width="${winW}" height="48" rx="8" fill="none" stroke="${winStroke}" stroke-width="2" stroke-dasharray="4,4" />
      <text x="${winX + winW / 2}" y="176}" fill="${winStroke}" font-size="9" font-weight="700" text-anchor="middle">
        当前窗口 [${windowStart}, ${windowEnd}) ${matched ? '✓ 完全匹配' : '扫描中'}
      </text>
    `;

    // 匹配时的连线
    if (matched) {
      for (let i = 0; i < n2; i++) {
        const x1 = startXGoal + i * gap + boxW / 2;
        const y1 = 35 + boxH;
        const x2 = startXConcat + (windowStart + i) * gap + boxW / 2;
        const y2 = 120;
        svgWindow += `
          <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#22c55e" stroke-width="1.8" stroke-dasharray="3,3" />
        `;
      }
    }
  }

  container.innerHTML = `
    <svg style="width: 100%; height: 100%; min-height: 200px;" viewBox="0 0 520 200">
      ${svgGoal}
      ${svgConcat}
      ${svgWindow}
    </svg>
  `;
}

export function renderStringMigrationCustomMetrics(container: HTMLElement, step: SCStep): void {
  const { shift, matchPos, matched, phase, str1, str2 } = step;

  const currentWindowSubstr =
    phase === 'init' || phase === 'length-check'
      ? '—'
      : `"${step.concat.substring(step.windowStart, step.windowEnd)}"`;

  const resultStr =
    phase === 'done'
      ? matched
        ? 'True (旋转有效)'
        : 'False (非旋转串)'
      : '匹配推演中...';

  const resultColor =
    phase === 'done'
      ? matched
        ? '#10b981'
        : '#ef4444'
      : '#38bdf8';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; padding: 4px 6px; box-sizing: border-box;">
      <!-- 指标卡片 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">左旋偏移量 (shift)</div>
          <div style="font-size: 13px; font-weight: 700; color: #60a5fa;">${shift}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">当前窗口子串</div>
          <div style="font-size: 12px; font-weight: 700; color: #38bdf8; font-family: monospace;">${currentWindowSubstr}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">匹配起始位置</div>
          <div style="font-size: 13px; font-weight: 700; color: #c084fc;">${matchPos !== null ? matchPos : '—'}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 6px; text-align: center;">
          <div style="font-size: 9.5px; color: #64748b;">判定结果</div>
          <div style="font-size: 12px; font-weight: 700; color: ${resultColor};">${resultStr}</div>
        </div>
      </div>

      <!-- 双倍拼接定理舱 -->
      <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 8px 10px; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 10.5px; font-weight: 800; color: #38bdf8;">🔄 双倍拼接 (s + s) 定理验证</span>
          <span style="font-size: 9.5px; color: #94a3b8;">源串: "${str1}" ➔ 目标串: "${str2}"</span>
        </div>
        <div style="font-size: 10px; color: #cbd5e1; line-height: 1.5;">
          定理阐释：长度为 N 的字符串 s 在其自拼接串 (s + s) 中涵盖了所有可能的 N 种循环左旋子串。<br/>
          只要 goal 长度等于 N 且属于 (s + s) 的子串，则必可通过 ${shift} 步左旋转换得到！
        </div>
      </div>
    </div>
  `;
}
