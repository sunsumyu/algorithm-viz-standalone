/**
 * 左神算法通关课 Class 124 ~ 134 共享沙盘组件
 * 提供：Morris 线索二叉树渲染器、轮廓线 DP 棋盘状态插头沙盘、单调队列决策排除沙盘、高斯消元增广矩阵沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface AdvancedStep extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export interface MorrisNode {
  id: number;
  val: number;
  left?: number;
  right?: number;
  threadTo?: number; // 虚线线索指针
}

/**
 * 渲染 Morris 遍历二叉树与动态线索
 */
export function renderMorrisTreeVisual(
  nodes: MorrisNode[],
  curId?: number,
  mostRightId?: number,
  traversalList: number[] = []
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌳 Morris 线索二叉树 (O(1) 空间线索建立与拆除)</span>
        <span style="font-size: 11px; color: #64748b;">已输出: [${traversalList.join(', ')}]</span>
      </div>

      <div style="display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; padding: 10px 0;">
        ${nodes.map(n => {
          const isCur = n.id === curId;
          const isMr = n.id === mostRightId;
          const hasThread = n.threadTo !== undefined;

          let bg = '#ffffff';
          let border = '#cbd5e1';
          let color = '#1e293b';

          if (isCur) {
            bg = '#e0e7ff';
            border = '#6366f1';
            color = '#3730a3';
          } else if (isMr) {
            bg = '#fef3c7';
            border = '#d97706';
            color = '#92400e';
          } else if (hasThread) {
            bg = '#fdf4ff';
            border = '#c026d3';
            color = '#86198f';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; min-width: 72px;">
              <div style="width: 46px; height: 46px; border-radius: 50%; background: ${bg}; border: 2px solid ${border}; color: ${color}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; box-shadow: ${isCur ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'};">
                <span>${n.val}</span>
                <span style="font-size: 8px; color: #64748b;">#${n.id}</span>
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px; text-align: center;">
                ${isCur ? '<span style="color:#6366f1; font-weight:700;">[cur]</span>' : ''}
                ${isMr ? '<span style="color:#d97706; font-weight:700;">[mostRight]</span>' : ''}
                ${hasThread ? `<span style="color:#c026d3; font-weight:700;">🔗->#${n.threadTo}</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * 渲染轮廓线 DP 棋盘与插头状态
 */
export function renderProfileGrid(
  n: number,
  m: number,
  curR: number,
  curC: number,
  mask: number,
  dpCount: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🏁 轮廓线 DP 逐格决策网格 (${n} x ${m})</span>
        <span style="font-size: 11px; color: #64748b;">轮廓掩码二进制: ${(mask).toString(2).padStart(m, '0')} | 当前方案数: ${dpCount}</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; margin: 12px 0;">
        ${Array.from({ length: n }).map((_, r) => `
          <div style="display: flex; gap: 4px;">
            ${Array.from({ length: m }).map((_, c) => {
              const isCur = r === curR && c === curC;
              const isPast = r < curR || (r === curR && c < curC);
              const plugBit = (mask & (1 << c)) !== 0;

              let bg = '#f8fafc';
              let border = '#cbd5e1';
              if (isCur) {
                bg = '#6366f1';
                border = '#4f46e5';
              } else if (isPast) {
                bg = plugBit ? '#e0e7ff' : '#ecfdf5';
                border = plugBit ? '#a5b4fc' : '#a7f3d0';
              }

              return `
                <div style="width: 44px; height: 44px; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: ${isCur ? '#ffffff' : '#334155'};">
                  <span>(${r},${c})</span>
                  ${plugBit ? '<span style="font-size: 9px; color: #c026d3;">🔌</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * 渲染单调队列滑动窗口与最优决策沙盘
 */
export function renderMonotonicQueueVisual(
  val: number[],
  dp: number[],
  curI: number,
  q: number[],
  L: number,
  R: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🎯 单调队列决策维护池 (窗口: [i - ${R}, i - ${L}])</span>
        <span style="font-size: 11px; color: #64748b;">当前推进到目标下标 i = ${curI}</span>
      </div>

      <div style="display: flex; gap: 10px; align-items: center; justify-content: center; margin-bottom: 14px;">
        <div style="font-size: 11px; font-weight: 700; color: #059669;">[队头/最优值] ➔</div>
        ${q.length === 0 ? '<span style="font-size: 11px; color: #94a3b8;">(队列为空)</span>' : ''}
        ${q.map((idx, qPos) => `
          <div style="background: ${qPos === 0 ? '#dcfce7' : '#eff6ff'}; border: 2px solid ${qPos === 0 ? '#16a34a' : '#3b82f6'}; border-radius: 8px; padding: 6px 10px; text-align: center;">
            <div style="font-size: 10px; color: #64748b;">决策点 j=${idx}</div>
            <div style="font-size: 14px; font-weight: 700; color: #1e293b;">dp=${dp[idx]}</div>
          </div>
        `).join('')}
        <div style="font-size: 11px; font-weight: 700; color: #dc2626;">➔ [队尾/淘汰线]</div>
      </div>

      <div style="overflow-x: auto; scrollbar-width: thin; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
        <div style="display: flex; gap: 6px;">
          ${val.map((v, idx) => {
            const isCur = idx === curI;
            const inWindow = idx >= curI - R && idx <= curI - L;
            return `
              <div style="min-width: 46px; text-align: center; background: ${isCur ? '#e0e7ff' : inWindow ? '#fef3c7' : '#ffffff'}; border: 1px solid ${isCur ? '#6366f1' : inWindow ? '#f59e0b' : '#cbd5e1'}; border-radius: 6px; padding: 4px;">
                <div style="font-size: 9px; color: #64748b;">#${idx}</div>
                <div style="font-size: 11px; font-weight: 700; color: #1e293b;">${v}</div>
                <div style="font-size: 10px; color: #4338ca; font-weight: 700;">dp:${dp[idx]}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染高斯消元增广矩阵
 */
export function renderGaussianMatrix(
  matrix: number[][],
  n: number,
  curCol: number = -1,
  activeRow: number = -1,
  sol?: number[]
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔢 高斯消元增广矩阵 [A | B] (N = ${n})</span>
        <span style="font-size: 11px; color: #64748b;">${sol ? `解向量: [${sol.map(x => x.toFixed(2)).join(', ')}]` : `当前主元列: ${curCol >= 0 ? curCol : '初始/回代'}`}</span>
      </div>

      <div style="overflow-x: auto; scrollbar-width: thin;">
        <table style="border-collapse: collapse; width: 100%; text-align: center; font-family: monospace; font-size: 12px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 6px; color: #64748b;">行号</th>
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
                  <td style="padding: 5px; font-weight: 700; color: #64748b;">r${r}</td>
                  ${row.slice(0, n).map((val, c) => {
                    const isPivot = r === curCol && c === curCol;
                    return `
                      <td style="padding: 5px; color: ${isPivot ? '#ffffff' : '#1e293b'}; background: ${isPivot ? '#6366f1' : 'transparent'}; border-radius: ${isPivot ? '4px' : '0'}; font-weight: ${isPivot ? '700' : 'normal'};">
                        ${val.toFixed(2)}
                      </td>
                    `;
                  }).join('')}
                  <td style="padding: 5px; font-weight: 700; color: #059669; border-left: 2px dashed #94a3b8;">
                    ${row[n].toFixed(2)}
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
