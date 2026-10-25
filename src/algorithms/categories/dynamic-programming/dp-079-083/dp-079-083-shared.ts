/**
 * 左神算法通关课 Class 079 ~ 083 进阶动态规划专题 共享沙盘与渲染助手
 * 提供：数位DP决策树沙盘、换根DP树上贡献沙盘、期望DP马尔可夫扩散沙盘、斜率优化凸包切线沙盘、四边形不等式决策剪枝沙盘
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Dp079Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  line?: number;
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
  // SVG 坐标映射与自适应极值计算
  const maxX = Math.max(12, ...points.map((p) => p.x)) * 1.15;
  const maxY = Math.max(30, ...points.map((p) => p.y)) * 1.15;
  const svgW = 540;
  const svgH = 240;
  const padL = 45;
  const padR = 25;
  const padT = 25;
  const padB = 30;

  const mapX = (x: number) => padL + (x / maxX) * (svgW - padL - padR);
  const mapY = (y: number) => svgH - padB - (Math.max(0, y) / maxY) * (svgH - padT - padB);

  // 提取下凸壳上的点序列
  const hullPointsList = hullIndices
    .map((idx) => points.find((p) => p.idx === idx))
    .filter((p): p is { idx: number; x: number; y: number } => p !== undefined);

  const hullPolylineStr = hullPointsList
    .map((p) => `${mapX(p.x).toFixed(1)},${mapY(p.y).toFixed(1)}`)
    .join(' ');

  // 最佳切点与其对应切线方程
  const bestPoint = points.find((p) => p.idx === bestJ) || points[0]!;
  const interceptB = bestPoint.y - curSlope * bestPoint.x;

  const x0 = 0;
  const y0 = interceptB;
  const x1 = maxX;
  const y1 = interceptB + curSlope * maxX;

  const lineX0 = mapX(x0);
  const lineY0 = mapY(y0);
  const lineX1 = mapX(x1);
  const lineY1 = mapY(y1);

  // 网格横向辅助线 (4 等分)
  const gridLinesHtml = [0.25, 0.5, 0.75, 1.0]
    .map((ratio) => {
      const yVal = maxY * ratio;
      const yPos = mapY(yVal);
      return `
        <line x1="${padL}" y1="${yPos}" x2="${svgW - padR}" y2="${yPos}" stroke="#334155" stroke-dasharray="3 3" stroke-width="1" opacity="0.4" />
        <text x="${padL - 6}" y="${yPos + 3}" fill="#64748b" font-size="9" text-anchor="end" font-family="monospace">${Math.round(yVal)}</text>
      `;
    })
    .join('');

  // 散点与圆环渲染
  const pointsSvgHtml = points
    .map((p) => {
      const inHull = hullIndices.includes(p.idx);
      const isBest = p.idx === bestJ;
      const cx = mapX(p.x);
      const cy = mapY(p.y);

      if (isBest) {
        return `
          <g>
            <circle cx="${cx}" cy="${cy}" r="11" fill="none" stroke="#f59e0b" stroke-width="2" opacity="0.4">
              <animate attributeName="r" values="7;14;7" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="${cx}" cy="${cy}" r="6" fill="#f59e0b" stroke="#ffffff" stroke-width="2" />
            <text x="${cx}" y="${cy - 12}" fill="#fcd34d" font-size="10" font-weight="bold" font-family="monospace" text-anchor="middle">
              P${p.idx}(${p.x},${p.y}) 🎯
            </text>
          </g>
        `;
      } else if (inHull) {
        return `
          <g>
            <circle cx="${cx}" cy="${cy}" r="5" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
            <text x="${cx}" y="${cy - 9}" fill="#6ee7b7" font-size="9" font-family="monospace" text-anchor="middle">
              P${p.idx}
            </text>
          </g>
        `;
      } else {
        return `
          <g opacity="0.5">
            <circle cx="${cx}" cy="${cy}" r="4" fill="#64748b" stroke="#334155" stroke-width="1" />
            <text x="${cx}" y="${cy - 7}" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle">
              P${p.idx}
            </text>
          </g>
        `;
      }
    })
    .join('');

  return `
    <div style="margin-bottom: 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; color: #f8fafc;">
      <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span class="flex items-center gap-1.5">
          <span>📈</span> 几何下凸壳与动切线笛卡尔沙盘 (Convex Hull &amp; Tangent Line)
        </span>
        <div style="display: flex; gap: 6px; align-items: center;">
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #1e1b4b; color: #a5b4fc; border: 1px solid #3730a3; font-family: monospace;">
            切线斜率 K = ${curSlope}
          </span>
          <span style="font-size: 11px; padding: 2px 10px; border-radius: 9999px; background: #064e3b; color: #34d399; font-weight: 800; border: 1px solid #059669;">
            最优切点: j = ${bestJ} (dp[i] = ${curDp})
          </span>
        </div>
      </div>

      <!-- 2D 笛卡尔 SVG 几何凸包画布 -->
      <div style="width: 100%; overflow-x: auto; background: #020617; border-radius: 10px; border: 1px solid #1e293b; padding: 6px 0; margin-bottom: 12px;">
        <svg viewBox="0 0 ${svgW} ${svgH}" style="width: 100%; height: auto; display: block; font-family: ui-monospace, monospace;">
          <defs>
            <linearGradient id="hullAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.02" />
            </linearGradient>
          </defs>

          <!-- 坐标轴辅助网格 -->
          ${gridLinesHtml}

          <!-- X 轴与 Y 轴 -->
          <line x1="${padL}" y1="${svgH - padB}" x2="${svgW - padR + 10}" y2="${svgH - padB}" stroke="#475569" stroke-width="1.5" />
          <line x1="${padL}" y1="${svgH - padB}" x2="${padL}" y2="${padT - 10}" stroke="#475569" stroke-width="1.5" />

          <!-- 坐标轴标签 -->
          <text x="${svgW - padR}" y="${svgH - padB + 18}" fill="#94a3b8" font-size="10" text-anchor="end">X = sumF[j]</text>
          <text x="${padL - 8}" y="${padT - 2}" fill="#94a3b8" font-size="10" text-anchor="end">Y = dp[j]</text>

          <!-- 下凸壳连线 (Convex Hull Polyline) -->
          ${hullPolylineStr ? `<polyline points="${hullPolylineStr}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />` : ''}

          <!-- 动切线 (Dynamic Tangent Line of Slope K) -->
          <line x1="${lineX0.toFixed(1)}" y1="${lineY0.toFixed(1)}" x2="${lineX1.toFixed(1)}" y2="${lineY1.toFixed(1)}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 3" />

          <!-- 切线截距 Y-intercept 指示器 -->
          <circle cx="${lineX0.toFixed(1)}" cy="${lineY0.toFixed(1)}" r="3.5" fill="#f59e0b" />
          <text x="${lineX0 + 6}" y="${lineY0 - 3}" fill="#fbbf24" font-size="9" font-family="monospace">
            截距 B = ${Math.round(interceptB)}
          </text>

          <!-- 决策散点 -->
          ${pointsSvgHtml}
        </svg>
      </div>

      <!-- 单调队列内点与下凸壳展示卡片 -->
      <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px;">
        ${points.map((p) => {
          const inHull = hullIndices.includes(p.idx);
          const isBest = p.idx === bestJ;
          return `
            <div style="padding: 6px 12px; border-radius: 8px; border: 1.5px solid ${isBest ? '#f59e0b' : inHull ? '#10b981' : '#334155'}; background: ${isBest ? '#78350f40' : inHull ? '#064e3b40' : '#1e293b60'}; text-align: center;">
              <div style="font-size: 11px; font-weight: 800; color: #f1f5f9;">P${p.idx} (${p.x}, ${p.y})</div>
              <div style="font-size: 9px; font-weight: 700; color: ${isBest ? '#fbbf24' : inHull ? '#34d399' : '#94a3b8'};">
                ${isBest ? '🎯 最优切点' : inHull ? '📐 凸壳活跃点' : '✖ 队列外/淘汰'}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="font-size: 11px; color: #94a3b8; background: #020617; border: 1px solid #1e293b; padding: 8px 12px; border-radius: 8px; text-align: center; line-height: 1.6;">
        💡 <strong>点斜式几何本质</strong>：转移方程改写为 $Y = K \\cdot X + B$，寻找斜率 $K$ 的切线下穿凸壳时的最小截距 $B$。单调队列维护凸包斜率单调递增，将 $O(N^2)$ 降维至 $O(N)$！
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
  const maxWeight = Math.max(1, ...stones);

  return `
    <div style="margin-bottom: 16px; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 14px; color: #f8fafc;">
      <div style="font-size: 13px; font-weight: 700; color: #f1f5f9; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
        <span class="flex items-center gap-1.5">
          <span>🪨</span> 四边形不等式决策区间剪枝沙盘 (计算区间 [${i}, ${j}])
        </span>
        <div style="display: flex; gap: 6px; align-items: center;">
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 9999px; background: #3b0764; color: #d8b4fe; border: 1px solid #7e22ce; font-family: monospace;">
            剪枝范围: [${optL}, ${optR}]
          </span>
          <span style="font-size: 11px; padding: 2px 10px; border-radius: 9999px; background: #064e3b; color: #34d399; font-weight: 800; border: 1px solid #059669;">
            最优分割点: k = ${bestK} (合并代价 = ${minCost})
          </span>
        </div>
      </div>

      <!-- 拟物石子堆重量高度柱与分割割线 -->
      <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; margin-bottom: 14px; padding: 10px 0; background: #020617; border-radius: 10px; border: 1px solid #1e293b; min-height: 110px;">
        ${stones.map((s, idx) => {
          const inRange = idx >= i && idx <= j;
          const isCut = idx === bestK;
          const inOptScope = idx >= optL && idx <= optR;
          const heightPx = Math.max(30, Math.round((s / maxWeight) * 70));

          let borderClass = 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-40';
          if (inRange) {
            if (isCut) {
              borderClass = 'border-amber-400 bg-amber-950/60 text-amber-200 ring-2 ring-amber-400/50';
            } else if (inOptScope) {
              borderClass = 'border-purple-500 bg-purple-950/50 text-purple-200';
            } else {
              borderClass = 'border-slate-700 bg-slate-800/60 text-slate-300';
            }
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <div class="rounded-lg border ${borderClass} flex flex-col items-center justify-between p-1.5 transition-all duration-300" style="width: 54px; height: ${heightPx}px;">
                <span style="font-size: 9px; font-family: monospace;">#${idx}</span>
                <span style="font-size: 13px; font-weight: 900; font-family: monospace;">${s}</span>
                <span style="font-size: 8px;">${isCut ? '✂️最佳割' : inOptScope ? '🎯候选' : inRange ? '区间' : '—'}</span>
              </div>
              <span style="font-size: 9px; font-family: monospace; color: ${isCut ? '#fbbf24' : inOptScope ? '#c084fc' : '#64748b'}; font-weight: ${isCut || inOptScope ? 'bold' : 'normal'};">
                [${idx}]
              </span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- 决策单调性夹逼卡片 -->
      <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #cbd5e1; text-align: center; line-height: 1.6;">
        ⚡ <strong>Knuth 决策单调性剪枝定理</strong>：$opt[i][j-1] \\le opt[i][j] \\le opt[i+1][j]$<br/>
        当前区间 $[${i}, ${j}]$ 最优分割点 $k$ 无需暴力遍历区间全长，被左右相邻子区间的最优决策点紧紧夹在 $[${optL}, ${optR}]$ 之内！<br/>
        由四边形不等式凸性保证，跨度级数求和相消，将原本 $O(N^3)$ 的石子合并严格优化至 <strong>$O(N^2)$</strong>。
      </div>
    </div>
  `;
}
