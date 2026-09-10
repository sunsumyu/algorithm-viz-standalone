/**
 * 左神算法通关课 Class 134 ~ 140 共享沙盘组件
 * 提供：异或矩阵沙盘、线性基位权槽位沙盘、01 分数规划折半二分沙盘、ExGCD 递归回溯解沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Advanced134Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

/**
 * 渲染异或高斯消元 0/1 增广矩阵
 */
export function renderXorMatrix(
  matrix: number[][],
  n: number,
  curCol: number = -1,
  activeRow: number = -1,
  sol?: number[]
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔢 GF(2) 异或高斯消元增广矩阵 [A | B] (规模: ${n} x ${n + 1})</span>
        <span style="font-size: 11px; color: #64748b;">${sol ? `解向量: [${sol.join(', ')}]` : `当前主元列: ${curCol >= 0 ? curCol : '消元中'}`}</span>
      </div>

      <div style="overflow-x: auto; scrollbar-width: thin;">
        <table style="border-collapse: collapse; width: 100%; text-align: center; font-family: monospace; font-size: 12px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 6px; color: #64748b;">方程</th>
              ${Array.from({ length: n }).map((_, c) => `
                <th style="padding: 6px; color: ${c === curCol ? '#6366f1' : '#64748b'}; font-weight: 700;">x${c}</th>
              `).join('')}
              <th style="padding: 6px; color: #059669; border-left: 2px dashed #94a3b8; font-weight: 700;">常数 B</th>
            </tr>
          </thead>
          <tbody>
            ${matrix.map((row, r) => {
              const isRowAct = r === activeRow;
              return `
                <tr style="background: ${isRowAct ? '#eff6ff' : 'transparent'}; border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 5px; font-weight: 700; color: #64748b;">E${r}</td>
                  ${row.slice(0, n).map((val, c) => {
                    const isPivot = r === curCol && c === curCol;
                    return `
                      <td style="padding: 5px; color: ${val === 1 ? (isPivot ? '#ffffff' : '#4338ca') : '#94a3b8'}; background: ${isPivot ? '#6366f1' : 'transparent'}; border-radius: ${isPivot ? '4px' : '0'}; font-weight: ${val === 1 ? '700' : 'normal'};">
                        ${val}
                      </td>
                    `;
                  }).join('')}
                  <td style="padding: 5px; font-weight: 700; color: ${row[n] === 1 ? '#059669' : '#94a3b8'}; border-left: 2px dashed #94a3b8;">
                    ${row[n]}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 渲染线性基位权槽位沙盘
 */
export function renderLinearBasisVisual(
  basis: number[],
  activeBit: number = -1,
  currentVal: number = 0,
  maxXor: number = 0
): string {
  const maxBits = 8; // 展示低 8 位便于观察
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🧬 线性基位权槽位表 (Linear Basis)</span>
        <span style="font-size: 11px; color: #64748b;">当前最大异或和: ${maxXor} (0b${maxXor.toString(2)})</span>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px;">
        ${Array.from({ length: maxBits }).map((_, bitIdx) => {
          const bit = maxBits - 1 - bitIdx;
          const val = basis[bit] || 0;
          const isAct = bit === activeBit;
          return `
            <div style="width: 64px; background: ${isAct ? '#e0e7ff' : val > 0 ? '#f0fdf4' : '#f8fafc'}; border: 2px solid ${isAct ? '#6366f1' : val > 0 ? '#22c55e' : '#cbd5e1'}; border-radius: 8px; padding: 6px; text-align: center;">
              <div style="font-size: 9px; color: #64748b; font-weight: 700;">第 ${bit} 位 (2^${bit})</div>
              <div style="font-size: 13px; font-weight: 700; color: ${val > 0 ? '#15803d' : '#94a3b8'}; margin: 2px 0;">
                ${val > 0 ? val : '-'}
              </div>
              <div style="font-size: 8px; color: #64748b; font-family: monospace;">
                ${val > 0 ? `0b${val.toString(2)}` : '空'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * 渲染 01 分数规划二分标尺
 */
export function renderFractionalVisual(
  a: number[],
  b: number[],
  mid: number,
  transformed: { id: number; a: number; b: number; w: number }[],
  totalGain: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>⚖️ 01 分数规划 Dinkelbach 判定沙盘</span>
        <span style="font-size: 11px; color: #64748b;">测试目标比率 mid = ${mid.toFixed(4)} | 综合收益 sum(w) = ${totalGain.toFixed(4)}</span>
      </div>

      <div style="overflow-x: auto; scrollbar-width: thin; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
        <table style="border-collapse: collapse; width: 100%; text-align: center; font-size: 12px;">
          <thead>
            <tr style="border-bottom: 1px solid #cbd5e1; color: #64748b;">
              <th style="padding: 4px;">物品</th>
              <th style="padding: 4px;">收益 a[i]</th>
              <th style="padding: 4px;">代价 b[i]</th>
              <th style="padding: 4px; color: #6366f1; font-weight: 700;">转化权值 w = a - mid*b</th>
            </tr>
          </thead>
          <tbody>
            ${transformed.map(item => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 4px; font-weight: 700;">#${item.id}</td>
                <td style="padding: 4px;">${item.a}</td>
                <td style="padding: 4px;">${item.b}</td>
                <td style="padding: 4px; font-weight: 700; color: ${item.w >= 0 ? '#16a34a' : '#dc2626'};">
                  ${item.w.toFixed(3)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
