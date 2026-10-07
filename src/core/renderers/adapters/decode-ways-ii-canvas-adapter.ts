/**
 * 解码方法 II (Decode Ways II · LeetCode 639)
 * Canvas Adapter: 字符高亮卡片、线性 DP 数组与滚动变量仪表板
 */

import { renderLinearDpArray } from '../../../algorithms/categories/dynamic-programming/dp-066/dp-066-shared';
import { type DecodeWaysIIStep } from './decode-ways-ii-step-compiler';

export function renderDecodeWaysIICanvas(container: HTMLElement, step: DecodeWaysIIStep): void {
  const { s, currentI, singleCount, doubleCount, cur, next1, next2, dpSnapshot = [] } = step;

  const charBadges = s.split('').map((ch, idx) => {
    const isCur = idx === currentI;
    const isNext = currentI !== undefined && idx === currentI + 1;
    let bg = '#f8fafc';
    let border = '#cbd5e1';
    let color = '#334155';
    if (isCur) {
      bg = '#eff6ff';
      border = '#3b82f6';
      color = '#1d4ed8';
    } else if (isNext) {
      bg = '#fdf4ff';
      border = '#d946ef';
      color = '#a21caf';
    }
    return `
      <div style="
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        width:36px; height:46px; border-radius:6px;
        background:${bg}; border:1.5px solid ${border};
        font-family:monospace; font-weight:700;
      ">
        <span style="font-size:16px; color:${color};">${ch}</span>
        <span style="font-size:10px; color:#94a3b8;">#${idx}</span>
      </div>
    `;
  }).join('');

  const linearDpHtml = renderLinearDpArray({
    dp: dpSnapshot,
    activeIdx: currentI,
    title: '一维 DP 数组 dp[i] (从下标 i 开始到末尾的解码总数)',
    summaryText: currentI !== undefined ? `正在推导下标 i = ${currentI}` : '已完成推导',
  });

  const rollingVarsHtml = `
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-top:8px;">
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:8px; font-size:12px;">
        <div style="font-weight:700; color:#15803d;">当前本位 cur (dp[i])</div>
        <div style="font-size:14px; font-weight:700; color:#166534; font-family:monospace; margin-top:2px;">${cur ?? '-'}</div>
      </div>
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:8px; font-size:12px;">
        <div style="font-weight:700; color:#1d4ed8;">单步后继 next1 (dp[i+1])</div>
        <div style="font-size:14px; font-weight:700; color:#1e40af; font-family:monospace; margin-top:2px;">${next1 ?? '-'}</div>
      </div>
      <div style="background:#fdf4ff; border:1px solid #f5d0fe; border-radius:6px; padding:8px; font-size:12px;">
        <div style="font-weight:700; color:#a21caf;">双步后继 next2 (dp[i+2])</div>
        <div style="font-size:14px; font-weight:700; color:#86198f; font-family:monospace; margin-top:2px;">${next2 ?? '-'}</div>
      </div>
    </div>
  `;

  const branchDetailHtml = currentI !== undefined ? `
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px; font-size:12px; margin-top:8px; display:flex; justify-content:space-between;">
      <span>🔤 单字符方案贡献: <strong style="color:#2563eb;">${singleCount ?? '-'}</strong></span>
      <span>🔗 双字符结合方案贡献: <strong style="color:#9333ea;">${doubleCount ?? '0'}</strong></span>
    </div>
  ` : '';

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px; width:100%;">
      <div style="display:flex; flex-direction:column; gap:6px; padding:10px; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
        <div style="font-weight:700; font-size:13px; color:#1e293b;">🔡 待解码字符串 "${s}" 字符序列：</div>
        <div style="display:flex; gap:6px; overflow-x:auto;">${charBadges}</div>
      </div>
      ${linearDpHtml}
      ${rollingVarsHtml}
      ${branchDetailHtml}
    </div>
  `;
}
