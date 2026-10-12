/**
 * 正则表达式匹配二维状态矩阵画布适配器 (LeetCode 10)
 * Canvas Adapter: 文本模式串双指示器与 DP 状态矩阵呈现
 */

import type { RegexStep } from './sequence-regex-step-compiler';

export function renderRegexSandbox(step: RegexStep): string {
  const dpTableHtml = `
    <table style="border-collapse:collapse; width:100%; font-family:monospace; font-size:12px; text-align:center;">
      <thead>
        <tr>
          <th style="padding:6px 10px; border:1px solid rgba(255,255,255,0.08); background:rgba(30,41,59,0.5); color:#94a3b8;">s \\ p</th>
          <th style="padding:6px 10px; border:1px solid rgba(255,255,255,0.08); background:rgba(30,41,59,0.5); color:#cbd5e1; font-weight:700;">ε</th>
          ${step.p.split('').map((c, j) => `
            <th style="padding:6px 10px; border:1px solid rgba(255,255,255,0.08); background:${j + 1 === step.j ? 'rgba(245,158,11,0.25)' : 'rgba(30,41,59,0.5)'}; color:${j + 1 === step.j ? '#fbbf24' : '#cbd5e1'}; font-weight:700;">
              ${c}
            </th>
          `).join('')}
        </tr>
      </thead>
      <tbody>
        ${step.dp.map((row, i) => `
          <tr>
            <td style="padding:6px 10px; border:1px solid rgba(255,255,255,0.08); background:${i === step.i ? 'rgba(56,189,248,0.25)' : 'rgba(30,41,59,0.4)'}; color:${i === step.i ? '#38bdf8' : '#cbd5e1'}; font-weight:700;">
              ${i === 0 ? 'ε' : step.s[i - 1]}
            </td>
            ${row.map((val, j) => {
              const isCur = i === step.i && j === step.j;
              let bg = val ? 'rgba(16,185,129,0.18)' : 'rgba(15,23,42,0.3)';
              let color = val ? '#34d399' : '#64748b';
              let border = '1px solid rgba(255,255,255,0.08)';

              if (isCur) {
                border = '2px solid #38bdf8';
                bg = val ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.3)';
                color = val ? '#ecfdf5' : '#fecdd3';
              }

              return `
                <td style="padding:6px 10px; border:${border}; background:${bg}; color:${color}; font-weight:${val || isCur ? 700 : 500}; box-shadow:${isCur ? '0 0 8px rgba(56,189,248,0.4)' : 'none'};">
                  ${val ? 'T' : 'F'}
                </td>
              `;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  return `
    <div style="display:flex; flex-direction:column; gap:14px; width:100%; height:100%; box-sizing:border-box; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 双串字符比对状态条 -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div style="background:rgba(15,23,42,0.4); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; color:#94a3b8;">待匹配文本串 (Text s)</div>
            <div style="font-size:16px; font-weight:700; color:#38bdf8; font-family:monospace; margin-top:2px;">
              "${step.s}"
            </div>
          </div>
          <div style="font-size:12px; color:#94a3b8; font-family:monospace;">
            i = <span style="color:#38bdf8; font-weight:bold;">${step.i}</span> / ${step.s.length}
          </div>
        </div>

        <div style="background:rgba(15,23,42,0.4); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:11px; color:#94a3b8;">正则表达式模式串 (Pattern p)</div>
            <div style="font-size:16px; font-weight:700; color:#fbbf24; font-family:monospace; margin-top:2px;">
              "${step.p}"
            </div>
          </div>
          <div style="font-size:12px; color:#94a3b8; font-family:monospace;">
            j = <span style="color:#fbbf24; font-weight:bold;">${step.j}</span> / ${step.p.length}
          </div>
        </div>
      </div>

      <!-- 二维 DP 状态热力网格 -->
      <div style="background:rgba(15,23,42,0.4); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:14px; flex:1; display:flex; flex-direction:column; overflow:auto;">
        <div style="font-weight:600; font-size:13px; color:var(--text-color, #cbd5e1); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
          <span>📊 正则匹配二维状态矩阵 (dp[i][j])</span>
          <span style="font-size:11px; color:#94a3b8;">T = 匹配(True), F = 不匹配(False)</span>
        </div>
        <div style="overflow-x:auto;">
          ${dpTableHtml}
        </div>
      </div>
    </div>
  `;
}
