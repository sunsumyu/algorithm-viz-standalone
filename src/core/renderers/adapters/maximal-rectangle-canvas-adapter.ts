/**
 * 柱状图与矩阵最大矩形 (LeetCode 85)
 * Canvas Adapter: 二维 01 矩阵与逐行压缩直方图双沙盘呈现
 */

import type { MaximalRectStep } from './maximal-rectangle-step-compiler';

export function renderMaximalRectangleSandbox(step: MaximalRectStep): string {
  const maxH = Math.max(...step.heights, 1);
  const barsHtml = step.heights.map((h, j) => {
    const isCur = j === step.curCol;
    const inStack = step.stack.includes(j);
    const inRect = step.calculatedRect && j >= step.calculatedRect.left && j <= step.calculatedRect.right;

    let bg = 'rgba(255, 255, 255, 0.04)';
    let border = 'rgba(255, 255, 255, 0.1)';
    let textColor = 'var(--text-muted, #94a3b8)';

    if (inRect) {
      bg = 'rgba(34, 197, 94, 0.25)';
      border = '#22c55e';
      textColor = '#4ade80';
    } else if (inStack) {
      bg = 'rgba(99, 102, 241, 0.25)';
      border = '#6366f1';
      textColor = '#a5b4fc';
    }

    if (isCur) {
      border = '2px solid #f59e0b';
    }

    const heightPct = Math.max(10, (h / maxH) * 100);

    return `
      <div style="display:inline-flex; flex-direction:column; align-items:center; width:38px; margin:0 4px;">
        <div style="width:100%; height:130px; display:flex; align-items:flex-end; justify-content:center;">
          <div style="
            width:30px; height:${heightPct}%; background:${bg}; border:2px solid ${border};
            border-radius:6px 6px 0 0; display:flex; align-items:center; justify-content:center;
            font-weight:800; font-size:14px; color:${textColor}; transition:all 0.2s ease;
          ">
            ${h}
          </div>
        </div>
        <div style="font-size:11px; color:var(--text-muted, #94a3b8); margin-top:4px; font-weight:600;">列#${j}</div>
        <div style="font-size:10px; height:14px; margin-top:1px;">
          ${inStack ? '<span style="color:#818cf8; font-weight:700;">栈中</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display:flex; flex-direction:column; gap:16px; width:100%; height:100%;">
      <!-- 二维矩阵与压缩直方图双并排容器 -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; flex:1;">
        <!-- 矩阵图 -->
        <div style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(255, 255, 255, 0.08); border-radius:8px; padding:16px; display:flex; flex-direction:column;">
          <div style="font-weight:700; color:var(--text-color, #f1f5f9); font-size:13px; margin-bottom:12px;">
            🔲 二维 01 矩阵 (当前考察行: #${step.rowIdx >= 0 ? step.rowIdx : 0})
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; align-items:center; justify-content:center; flex:1;">
            ${step.matrix.map((row, r) => `
              <div style="display:flex; gap:6px;">
                ${row.map((val) => {
                  const isCurRow = r === step.rowIdx;
                  return `
                    <div style="
                      width:32px; height:32px; display:flex; align-items:center; justify-content:center;
                      border-radius:6px; font-weight:800; font-size:14px; font-family:monospace;
                      background:${isCurRow ? (val === '1' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.03)') : (val === '1' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)')};
                      border:1px solid ${isCurRow ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'};
                      color:${val === '1' ? '#38bdf8' : 'var(--text-muted, #64748b)'};
                      box-shadow:${isCurRow && val === '1' ? '0 0 8px rgba(56, 189, 248, 0.3)' : 'none'};
                    ">
                      ${val}
                    </div>
                  `;
                }).join('')}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 当前直方图柱状图 -->
        <div style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(255, 255, 255, 0.08); border-radius:8px; padding:16px; display:flex; flex-direction:column;">
          <div style="font-weight:700; color:var(--text-color, #f1f5f9); font-size:13px; margin-bottom:12px;">
            📊 逐行压缩直方图高度 (Heights)
          </div>
          <div style="display:flex; justify-content:center; align-items:flex-end; flex:1; padding-bottom:8px;">
            ${barsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}
