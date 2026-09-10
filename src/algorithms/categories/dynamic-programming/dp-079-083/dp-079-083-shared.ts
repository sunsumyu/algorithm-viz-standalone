/**
 * 左神算法通关课 Class 079 ~ 083 进阶动态规划专题 共享沙盘与渲染助手
 * 提供：数位DP决策树沙盘、换根DP树上贡献沙盘、期望DP马尔可夫扩散沙盘、斜率优化凸包切线沙盘、四边形不等式决策剪枝沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Dp079Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

// ----------------------------------------------------
// 1. 数位 DP 沙盘 (Class 079)
// ----------------------------------------------------
export function renderDigitDpBoard(
  digits: number[],
  curIdx: number,
  curDigit: number,
  isLimit: boolean,
  cnt1: number,
  memoSummary: string
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🔢 数位拆分与记忆化递归树 (上界 N = ${digits.join('')})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: ${isLimit ? '#fee2e2' : '#ecfdf5'}; color: ${isLimit ? '#b91c1c' : '#047857'}; font-weight: 700;">
          ${isLimit ? '🔒 贴紧上界 (isLimit = true)' : '🔓 自由填充 (isLimit = false)'}
        </span>
      </div>

      <!-- 数位序列 -->
      <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 12px;">
        ${digits.map((d, i) => {
          const isCurrent = i === curIdx;
          return `
            <div style="padding: 8px 14px; border-radius: 8px; border: 2px solid ${isCurrent ? '#3b82f6' : '#cbd5e1'}; background: ${isCurrent ? '#eff6ff' : '#f8fafc'}; text-align: center;">
              <div style="font-size: 16px; font-weight: 800; color: #1e293b;">${d}</div>
              <div style="font-size: 9px; color: ${isCurrent ? '#2563eb' : '#64748b'};">位 [${i}] ${isCurrent ? '👈' : ''}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #0284c7; margin-bottom: 2px;">当前位选择与数字 1 累计:</div>
          <div style="font-size: 12px; color: #0369a1;">
            当前位尝试填入: <b>${curDigit >= 0 ? curDigit : '待定'}</b>，路径累计数字 1: <b>${cnt1}</b> 个
          </div>
        </div>

        <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #7e22ce; margin-bottom: 2px;">记忆化缓存状态:</div>
          <div style="font-size: 11px; color: #6b21a8;">
            ${memoSummary}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. 换根 DP 树上贡献沙盘 (Class 080)
// ----------------------------------------------------
export function renderRerootingDpBoard(
  nodes: { id: number; size: number; ans: number }[],
  curRoot: number,
  phase: 'DFS1' | 'DFS2' | 'COMPLETE'
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🌳 树上换根 DP 节点贡献转移 (当前聚焦根节点: ${curRoot})</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 700;">
          阶段: ${phase === 'DFS1' ? '1. 自底向上初始统计' : phase === 'DFS2' ? '2. 自顶向下换根辐射' : '3. 全树求解完成'}
        </span>
      </div>

      <!-- 节点距离和列表 -->
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px;">
        ${nodes.map((n) => {
          const isRoot = n.id === curRoot;
          return `
            <div style="padding: 8px 12px; border-radius: 8px; border: 2px solid ${isRoot ? '#10b981' : '#cbd5e1'}; background: ${isRoot ? '#d1fae5' : '#f8fafc'}; text-align: center; min-width: 70px;">
              <div style="font-size: 13px; font-weight: 800; color: #1e293b;">节点 ${n.id} ${isRoot ? '👑' : ''}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">size: ${n.size}</div>
              <div style="font-size: 11px; font-weight: 800; color: #047857; margin-top: 2px;">距离和: ${n.ans}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px; color: #475569; text-align: center;">
        💡 核心换根微分关系：$ans[v] = ans[u] + (N - size[v]) - size[v] = ans[u] + N - 2 \\times size[v]$
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 3. 期望 DP 马尔可夫扩散沙盘 (Class 081)
// ----------------------------------------------------
export function renderExpectedValueDpBoard(
  grid: number[][],
  step: number,
  totalProb: number
): string {
  const n = grid.length;
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>♟️ 骑士棋盘走日 马尔可夫全概率扩散 (步数 K = ${step})</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #ecfdf5; color: #047857; font-weight: 800;">
          存活概率: ${(totalProb * 100).toFixed(2)}%
        </span>
      </div>

      <!-- 棋盘网格 -->
      <div style="display: grid; grid-template-columns: repeat(${n}, 1fr); gap: 4px; max-width: 280px; margin: 0 auto 12px auto;">
        ${grid.map((row) => row.map((prob) => {
          const bgAlpha = Math.min(1, prob * 2.5);
          return `
            <div style="aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 4px; border: 1px solid #cbd5e1; background: rgba(59, 130, 246, ${bgAlpha}); color: ${prob > 0.3 ? '#ffffff' : '#1e293b'}; font-size: 10px; font-weight: 700;">
              ${prob > 0 ? prob.toFixed(2) : '0'}
            </div>
          `;
        }).join('')).join('')}
      </div>

      <div style="font-size: 11px; color: #475569; background: #f8fafc; padding: 8px; border-radius: 6px; text-align: center;">
        每步按 8 个方向等权分流 ($1/8$)，越界概率直接吸收，盘内概率保持守恒。
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 4. 斜率优化下凸壳沙盘 (Class 082)
// ----------------------------------------------------
export function renderSlopeOptBoard(
  points: { idx: number; x: number; y: number }[],
  hullIndices: number[],
  curSlope: number,
  bestJ: number,
  curDp: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>📈 单调队列维护下凸壳与切线截距 (当前斜率 K = ${curSlope})</span>
        <span style="font-size: 12px; padding: 2px 10px; border-radius: 9999px; background: #eff6ff; color: #1d4ed8; font-weight: 800;">
          最优决策点: j = ${bestJ} (DP = ${curDp})
        </span>
      </div>

      <!-- 单调队列内点与下凸壳展示 -->
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px;">
        ${points.map((p) => {
          const inHull = hullIndices.includes(p.idx);
          const isBest = p.idx === bestJ;
          return `
            <div style="padding: 6px 12px; border-radius: 8px; border: 2px solid ${isBest ? '#10b981' : inHull ? '#3b82f6' : '#cbd5e1'}; background: ${isBest ? '#d1fae5' : inHull ? '#eff6ff' : '#f8fafc'}; text-align: center;">
              <div style="font-size: 11px; font-weight: 800; color: #1e293b;">点 P${p.idx} (${p.x}, ${p.y})</div>
              <div style="font-size: 9px; color: ${isBest ? '#047857' : inHull ? '#2563eb' : '#64748b'};">
                ${isBest ? '🎯 最佳切点' : inHull ? '📐 凸壳点' : '✖ 淘汰'}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="font-size: 11px; color: #475569; background: #f8fafc; padding: 8px; border-radius: 6px; text-align: center;">
        几何含义：将转移方程写为直线方程 $Y = K \\cdot X + B$，寻找斜率 $K$ 的切线下穿凸壳时的最小截距 $B$。
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 5. 四边形不等式决策单调性沙盘 (Class 083)
// ----------------------------------------------------
export function renderKnuthQuadrangleBoard(
  stones: number[],
  i: number,
  j: number,
  optL: number,
  optR: number,
  bestK: number,
  minCost: number
): string {
  return `
    <div style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px;">
      <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span>🪨 四边形不等式决策区间剪枝 (计算区间 [${i}, ${j}])</span>
        <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #faf5ff; color: #7e22ce; font-weight: 700;">
          最优分割点: k = ${bestK} (代价 = ${minCost})
        </span>
      </div>

      <!-- 石子与区间划分 -->
      <div style="display: flex; gap: 6px; justify-content: center; margin-bottom: 12px;">
        ${stones.map((s, idx) => {
          const inRange = idx >= i && idx <= j;
          const isCut = idx === bestK;
          return `
            <div style="padding: 6px 10px; border-radius: 6px; border: 2px solid ${inRange ? (isCut ? '#ef4444' : '#8b5cf6') : '#cbd5e1'}; background: ${inRange ? (isCut ? '#fef2f2' : '#f5f3ff') : '#ffffff'}; text-align: center;">
              <div style="font-size: 13px; font-weight: 800; color: #1e293b;">${s}</div>
              <div style="font-size: 9px; color: #64748b;">[${idx}] ${isCut ? '✂️' : ''}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; font-size: 11px; color: #475569; text-align: center;">
        ⚡ 决策单调性剪枝定理：$opt[i][j-1] \\le opt[i][j] \\le opt[i+1][j]$<br/>
        搜索范围由 $O(N)$ 暴力直接收紧至 $[${optL}, ${optR}]$，级数求和将总复杂度由 $O(N^3)$ 降至 $O(N^2)$！
      </div>
    </div>
  `;
}
