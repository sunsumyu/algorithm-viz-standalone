/**
 * 区间动态规划拟物沙盘适配器 (IntervalDpSandboxAdapter)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构
 *
 * 覆盖 Class 076 & 077 区间 DP 全家族拟物沙盘：
 * 1. 多边形三角剖分的最低得分 (min-score-triangulation · LC 1039): 凸多边形几何剖分与三角形乘积沙盘
 * 2. 预测赢家 / 纸牌博弈 (predict-the-winner · LC 486): 桌面纸牌博弈与零和博弈极小化极大决策舱
 * 3. 戳气球 (burst-balloons · LC 312): 靶场气球陈列架与逆向最后戳气球金币收益演算舱
 * 4. 奇怪的打印机 (strange-printer · LC 664): 打印机色带与首尾贪心顺带覆盖监视器
 */

import type { UniversalStep } from '../../universal-stage-engine';
import type { StateSpacePresentationOptions } from '../state-space-presenter';

export class IntervalDpSandboxAdapter {
  private static readonly SUPPORTED_MODELS = new Set([
    'min-score-triangulation',
    'min-score-triangulation-1039',
    'class076-code01',
    'leetcode-1039',
    'predict-the-winner',
    'predict-the-winner-486',
    'class076-code02',
    'leetcode-486',
    'cards-in-line',
    'burst-balloons',
    'burst-balloons-312',
    'class076-code03',
    'leetcode-312',
    'strange-printer',
    'strange-printer-664',
    'class076-code04',
    'leetcode-664',
    'merge-stones',
    'merge-stones-1000',
    'class077-code01',
    'leetcode-1000',
  ]);

  public static isSupported(modelId?: string): boolean {
    if (!modelId) return false;
    return this.SUPPORTED_MODELS.has(modelId);
  }

  public static render(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions> = {}
  ): void {
    if (!container) return;
    const modelId = options.modelId || '';

    if (
      modelId === 'min-score-triangulation' ||
      modelId === 'min-score-triangulation-1039' ||
      modelId === 'class076-code01' ||
      modelId === 'leetcode-1039'
    ) {
      this.renderMinScoreTriangulation(container, step, options);
    } else if (
      modelId === 'predict-the-winner' ||
      modelId === 'predict-the-winner-486' ||
      modelId === 'class076-code02' ||
      modelId === 'leetcode-486' ||
      modelId === 'cards-in-line'
    ) {
      this.renderPredictTheWinner(container, step, options);
    } else if (
      modelId === 'burst-balloons' ||
      modelId === 'burst-balloons-312' ||
      modelId === 'class076-code03' ||
      modelId === 'leetcode-312'
    ) {
      this.renderBurstBalloons(container, step, options);
    } else if (
      modelId === 'strange-printer' ||
      modelId === 'strange-printer-664' ||
      modelId === 'class076-code04' ||
      modelId === 'leetcode-664'
    ) {
      this.renderStrangePrinter(container, step, options);
    } else {
      this.renderMinScoreTriangulation(container, step, options);
    }
  }

  // ==========================================================================
  // 1. 多边形三角剖分的最低得分 (min-score-triangulation · LC 1039)
  // ==========================================================================
  private static renderMinScoreTriangulation(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const rawValues = (options.params?.values || (Array.isArray(step.dp1d) ? step.dp1d : [3, 7, 4, 5])) as number[];
    const values = Array.isArray(rawValues) && rawValues.length >= 3 ? rawValues : [3, 7, 4, 5];
    const n = values.length;
    const i = typeof step.i === 'number' ? step.i : 0;
    const j = typeof step.j === 'number' ? step.j : n - 1;
    const grid = step.grid as (number | null)[][] | undefined;

    // 解析当前选中的最佳/候选顶点 k
    let k = -1;
    if (step.deps && step.deps.length > 0) {
      const depK = step.deps.find((d) => d.r === i && d.c > i && d.c < j);
      if (depK) k = depK.c;
    }
    if (k === -1 && typeof step.tag === 'string') {
      const match = step.tag.match(/k\s*=\s*(\d+)/i);
      if (match) k = parseInt(match[1], 10);
    }
    if (k === -1 && j > i + 1) {
      k = i + 1;
    }

    const triScore = (k > i && k < j) ? values[i]! * values[k]! * values[j]! : 0;
    const leftScore = (k > i && grid?.[i]?.[k] != null) ? grid[i]![k]! : 0;
    const rightScore = (k < j && grid?.[k]?.[j] != null) ? grid[k]![j]! : 0;
    const currentTotal = leftScore + rightScore + triScore;
    const bestScore = grid?.[i]?.[j] != null ? grid[i]![j] : currentTotal;

    // SVG 多边形几何顶点计算
    const svgW = 340;
    const svgH = 260;
    const cx = svgW / 2;
    const cy = svgH / 2;
    const radius = 95;

    const coords = values.map((val, idx) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * idx) / n;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        val,
        idx,
      };
    });

    const polygonPoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');

    // 活跃三角形 (i, k, j) SVG 路径
    let triangleSvg = '';
    if (k > i && k < j) {
      const pi = coords[i]!;
      const pk = coords[k]!;
      const pj = coords[j]!;
      triangleSvg = `
        <polygon points="${pi.x},${pi.y} ${pk.x},${pk.y} ${pj.x},${pj.y}" fill="rgba(16, 185, 129, 0.22)" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,2" />
        <line x1="${pi.x}" y1="${pi.y}" x2="${pj.x}" y2="${pj.y}" stroke="#6366f1" stroke-width="3" stroke-linecap="round" />
        <line x1="${pi.x}" y1="${pi.y}" x2="${pk.x}" y2="${pk.y}" stroke="#0ea5e9" stroke-width="2" stroke-dasharray="3,2" />
        <line x1="${pk.x}" y1="${pk.y}" x2="${pj.x}" y2="${pj.y}" stroke="#10b981" stroke-width="2" stroke-dasharray="3,2" />
        <circle cx="${((pi.x + pk.x + pj.x) / 3).toFixed(1)}" cy="${((pi.y + pk.y + pj.y) / 3).toFixed(1)}" r="14" fill="#0f172a" stroke="#10b981" stroke-width="1.5" />
        <text x="${((pi.x + pk.x + pj.x) / 3).toFixed(1)}" y="${((pi.y + pk.y + pj.y) / 3 + 4).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="bold" fill="#34d399">▲</text>
      `;
    }

    const verticesSvg = coords
      .map((c) => {
        const isI = c.idx === i;
        const isJ = c.idx === j;
        const isK = c.idx === k;
        const inSub = c.idx >= i && c.idx <= j;

        let strokeColor = '#475569';
        let fillColor = '#1e293b';
        let textColor = '#cbd5e1';
        let ringR = 15;

        if (isI) {
          strokeColor = '#38bdf8';
          fillColor = '#0369a1';
          textColor = '#ffffff';
          ringR = 17;
        } else if (isJ) {
          strokeColor = '#818cf8';
          fillColor = '#4338ca';
          textColor = '#ffffff';
          ringR = 17;
        } else if (isK) {
          strokeColor = '#10b981';
          fillColor = '#047857';
          textColor = '#ffffff';
          ringR = 17;
        } else if (inSub) {
          strokeColor = '#94a3b8';
          fillColor = '#334155';
        }

        return `
          <g class="transition-transform hover:scale-110 cursor-pointer">
            <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${ringR}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isI || isJ || isK ? 3 : 1.5}" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />
            <text x="${c.x.toFixed(1)}" y="${(c.y + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="bold" fill="${textColor}">${c.val}</text>
            <text x="${c.x.toFixed(1)}" y="${(c.y + (c.y > cy ? 28 : -20)).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="600" fill="${isI ? '#38bdf8' : isJ ? '#818cf8' : isK ? '#34d399' : '#64748b'}">#${c.idx}${isI ? '(i底起)' : isJ ? '(j底止)' : isK ? '(k顶)' : ''}</text>
          </g>
        `;
      })
      .join('');

    container.className = 'w-full h-full flex flex-col justify-start p-3 bg-slate-900/90 text-slate-100 rounded-xl overflow-y-auto border border-slate-700/60 shadow-inner font-sans';
    container.innerHTML = `
      <div class="grid grid-cols-12 gap-3 w-full h-full items-stretch">
        <!-- 左侧 7 列：凸多边形几何剖分画布 -->
        <div class="col-span-12 lg:col-span-7 flex flex-col items-center justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800 relative">
          <div class="w-full flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 font-bold">📐</span>
              <span class="font-bold text-slate-200">凸多边形几何沙盘 (n=${n} 顶点)</span>
            </div>
            <div class="flex items-center gap-2 text-[11px] text-slate-400">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-sky-400"></span> i:${i}
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span> k:${k >= 0 ? k : '—'}
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-indigo-400"></span> j:${j}
            </div>
          </div>

          <div class="w-full flex-1 flex items-center justify-center my-1 relative">
            <svg viewBox="0 0 ${svgW} ${svgH}" class="w-full max-w-[340px] max-h-[260px] drop-shadow-md">
              <polygon points="${polygonPoints}" fill="#0f172a" stroke="#334155" stroke-width="2" />
              ${triangleSvg}
              ${verticesSvg}
            </svg>
          </div>

          <div class="w-full grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-center text-xs">
            <div class="p-1.5 rounded bg-slate-900/80 border border-sky-500/30">
              <div class="text-[10px] text-slate-400">底边起点 (i)</div>
              <div class="font-bold text-sky-400 text-sm">#${i} (值 ${values[i]})</div>
            </div>
            <div class="p-1.5 rounded bg-slate-900/80 border border-emerald-500/30">
              <div class="text-[10px] text-slate-400">剖分顶点 (k)</div>
              <div class="font-bold text-emerald-400 text-sm">${k >= 0 ? `#${k} (值 ${values[k]})` : '边界无分割'}</div>
            </div>
            <div class="p-1.5 rounded bg-slate-900/80 border border-indigo-500/30">
              <div class="text-[10px] text-slate-400">底边终点 (j)</div>
              <div class="font-bold text-indigo-400 text-sm">#${j} (值 ${values[j]})</div>
            </div>
          </div>
        </div>

        <!-- 右侧 5 列：三角剖分乘积与区间状态决策舱 -->
        <div class="col-span-12 lg:col-span-5 flex flex-col justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800 gap-2.5">
          <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>📊</span> 子多边形 [${i}..${j}] 剖分决策
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
              跨度 len=${j - i + 1}
            </span>
          </div>

          <!-- 三段式得分拆解卡片 -->
          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            <div class="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div class="flex justify-between items-center text-slate-400 mb-1">
                <span>1. 左子多边形 dp[${i}][${k}]</span>
                <span class="font-bold text-sky-300 text-sm">${leftScore}</span>
              </div>
              <div class="text-[11px] text-slate-500">子多边形 [${i}..${k}] 的最低三角剖分累加得分</div>
            </div>

            <div class="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div class="flex justify-between items-center text-slate-400 mb-1">
                <span>2. 右子多边形 dp[${k}][${j}]</span>
                <span class="font-bold text-emerald-300 text-sm">${rightScore}</span>
              </div>
              <div class="text-[11px] text-slate-500">子多边形 [${k}..${j}] 的最低三角剖分累加得分</div>
            </div>

            <div class="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div class="flex justify-between items-center text-slate-400 mb-1">
                <span>3. 中间三角形 (${i}, ${k}, ${j})</span>
                <span class="font-bold text-amber-300 text-sm">${values[i]} × ${k >= 0 ? values[k] : 0} × ${values[j]} = ${triScore}</span>
              </div>
              <div class="text-[11px] text-slate-500">固定底边与顶点 k 构成的三角形顶点权值乘积</div>
            </div>

            <!-- 当前合计与最优记录 -->
            <div class="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <div class="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">当前最优最低得分 dp[${i}][${j}]</div>
                <div class="text-[11px] text-slate-300">min { dp[i][k] + dp[k][j] + v[i]*v[k]*v[j] }</div>
              </div>
              <div class="text-xl font-black text-emerald-400 font-mono">${bestScore}</div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>区间 DP 核心建模</strong>：固定凸多边形任意底边 <code>(${i}, ${j})</code>，多边形内部任意剖分必定有且仅有一个三角形以此底边为一边，枚举内部第三个顶点 <code>k</code> 即可无后效性拆分子问题。
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 2. 预测赢家 / 纸牌博弈 (predict-the-winner · LC 486)
  // ==========================================================================
  private static renderPredictTheWinner(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const rawNums = (options.params?.nums || (Array.isArray(step.dp1d) ? step.dp1d : [1, 5, 2])) as number[];
    const nums = Array.isArray(rawNums) && rawNums.length > 0 ? rawNums : [1, 5, 2];
    const n = nums.length;
    const i = typeof step.i === 'number' ? Math.max(0, Math.min(step.i, n - 1)) : 0;
    const j = typeof step.j === 'number' ? Math.max(i, Math.min(step.j, n - 1)) : n - 1;
    const grid = step.grid as (number | null)[][] | undefined;

    const chooseLeftVal = nums[i]!;
    const chooseRightVal = nums[j]!;
    const nextLeftOpponent = (i + 1 < n && grid?.[i + 1]?.[j] != null) ? grid[i + 1]![j]! : 0;
    const nextRightOpponent = (j - 1 >= 0 && grid?.[i]?.[j - 1] != null) ? grid[i]![j - 1]! : 0;

    const gainLeft = chooseLeftVal - nextLeftOpponent;
    const gainRight = chooseRightVal - nextRightOpponent;
    const bestGain = Math.max(gainLeft, gainRight);
    const recordedDp = grid?.[i]?.[j] != null ? grid[i]![j] : bestGain;

    const suits = ['♠', '♥', '♣', '♦'];

    const cardsHtml = nums
      .map((num, idx) => {
        const isLeft = idx === i;
        const isRight = idx === j;
        const isTaken = idx < i || idx > j;
        const suit = suits[idx % suits.length];
        const isRedSuit = suit === '♥' || suit === '♦';

        let borderCls = 'border-slate-700 bg-slate-900/80 text-slate-400';
        let badgeHtml = '';

        if (isTaken) {
          borderCls = 'border-slate-800 bg-slate-950/60 opacity-30 grayscale';
        } else if (isLeft && isRight) {
          borderCls = 'border-purple-400 bg-purple-950/50 shadow-lg shadow-purple-500/20 scale-105';
          badgeHtml = '<div class="absolute -top-2.5 px-1.5 py-0.2 rounded-full bg-purple-500 text-white text-[9px] font-bold">最后单牌</div>';
        } else if (isLeft) {
          borderCls = 'border-sky-400 bg-sky-950/50 shadow-lg shadow-sky-500/20 scale-105';
          badgeHtml = '<div class="absolute -top-2.5 px-1.5 py-0.2 rounded-full bg-sky-500 text-white text-[9px] font-bold">👈 选左端</div>';
        } else if (isRight) {
          borderCls = 'border-amber-400 bg-amber-950/50 shadow-lg shadow-amber-500/20 scale-105';
          badgeHtml = '<div class="absolute -top-2.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold">👉 选右端</div>';
        } else {
          borderCls = 'border-slate-600 bg-slate-800/90 text-slate-200';
        }

        return `
          <div class="relative flex flex-col justify-between w-16 sm:w-20 h-28 sm:h-32 rounded-xl p-2.5 border-2 transition-all ${borderCls}">
            ${badgeHtml}
            <div class="flex justify-between items-center text-xs font-mono">
              <span class="${isRedSuit ? 'text-rose-400' : 'text-slate-300'} font-bold">${suit}</span>
              <span class="text-[10px] text-slate-500">#${idx}</span>
            </div>
            <div class="text-center font-black text-2xl sm:text-3xl font-mono text-slate-100">
              ${num}
            </div>
            <div class="flex justify-between items-center text-[10px] text-slate-400">
              <span>牌面</span>
              <span class="${isRedSuit ? 'text-rose-400' : 'text-slate-300'}">${suit}</span>
            </div>
          </div>
        `;
      })
      .join('');

    container.className = 'w-full h-full flex flex-col justify-start p-3 bg-slate-900/90 text-slate-100 rounded-xl overflow-y-auto border border-slate-700/60 shadow-inner font-sans';
    container.innerHTML = `
      <div class="grid grid-cols-12 gap-3 w-full h-full items-stretch">
        <!-- 左侧 7 列：桌面纸牌陈列排布 -->
        <div class="col-span-12 lg:col-span-7 flex flex-col items-center justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800">
          <div class="w-full flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-amber-400 font-bold text-base">🃏</span>
              <span class="font-bold text-slate-200">桌面连续纸牌博弈沙盘 (共 ${n} 张牌)</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">当前有效牌堆: [${i}..${j}]</span>
          </div>

          <div class="w-full flex-1 flex flex-wrap items-center justify-center gap-3 my-4 px-2">
            ${cardsHtml}
          </div>

          <div class="w-full p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
            <span class="text-slate-400">两端端点可抽纸牌：</span>
            <div class="flex gap-4 font-mono font-bold">
              <span class="text-sky-400">左端 nums[${i}] = ${chooseLeftVal}</span>
              <span class="text-amber-400">右端 nums[${j}] = ${chooseRightVal}</span>
            </div>
          </div>
        </div>

        <!-- 右侧 5 列：极小化极大决策与净胜分推导 -->
        <div class="col-span-12 lg:col-span-5 flex flex-col justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800 gap-2.5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>⚖️</span> 零和博弈极小化极大决策舱
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-700/50">
              dp[${i}][${j}]
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            <!-- 方案 A: 拿走左牌 -->
            <div class="p-2.5 rounded-lg ${gainLeft >= gainRight ? 'bg-sky-950/40 border-sky-500/50' : 'bg-slate-900/90 border-slate-800'} border">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-sky-400">👈 抉择 1: 拿走左端牌 nums[${i}]</span>
                <span class="font-mono font-bold text-sm text-sky-300">${gainLeft >= 0 ? '+' : ''}${gainLeft}</span>
              </div>
              <div class="text-[11px] text-slate-400 font-mono">
                自身得 ${chooseLeftVal} - 对手后手净胜 dp[${i + 1}][${j}](${nextLeftOpponent}) = ${gainLeft}
              </div>
            </div>

            <!-- 方案 B: 拿走右牌 -->
            <div class="p-2.5 rounded-lg ${gainRight >= gainLeft ? 'bg-amber-950/40 border-amber-500/50' : 'bg-slate-900/90 border-slate-800'} border">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-amber-400">👉 抉择 2: 拿走右端牌 nums[${j}]</span>
                <span class="font-mono font-bold text-sm text-amber-300">${gainRight >= 0 ? '+' : ''}${gainRight}</span>
              </div>
              <div class="text-[11px] text-slate-400 font-mono">
                自身得 ${chooseRightVal} - 对手后手净胜 dp[${i}][${j - 1}](${nextRightOpponent}) = ${gainRight}
              </div>
            </div>

            <!-- 最优决策与当前净胜分 -->
            <div class="p-3 rounded-lg ${(recordedDp as number) >= 0 ? 'bg-emerald-950/40 border-emerald-500/40' : 'bg-rose-950/40 border-rose-500/40'} border flex items-center justify-between">
              <div>
                <div class="text-[10px] uppercase tracking-wider ${(recordedDp as number) >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold">
                  当前最优行动净胜分 dp[${i}][${j}]
                </div>
                <div class="text-[11px] text-slate-300">
                  ${(recordedDp as number) >= 0 ? '🟢 先手优势 (必胜态)' : '🔴 先手劣势 (必败态)'}
                </div>
              </div>
              <div class="text-xl font-black ${(recordedDp as number) >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-mono">
                ${(recordedDp as number) >= 0 ? '+' : ''}${recordedDp}
              </div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>博弈论零和转化</strong>：<code>dp[i][j]</code> 定义为当前行动者相对于对手的<strong>净胜分数</strong>。无论选哪端，拿走后剩下的区间留给对手，故自身净胜分 = <code>本次得分 - 对手在剩余区间的净胜分</code>。
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 3. 戳气球 (burst-balloons · LC 312)
  // ==========================================================================
  private static renderBurstBalloons(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const rawNums = (options.params?.nums || (Array.isArray(step.dp1d) ? step.dp1d.slice(1, -1) : [3, 1, 5, 8])) as number[];
    const nums = Array.isArray(rawNums) && rawNums.length > 0 ? rawNums : [3, 1, 5, 8];
    const val = [1, ...nums, 1];
    const m = val.length;

    const i = typeof step.i === 'number' ? Math.max(0, Math.min(step.i, m - 1)) : 0;
    const j = typeof step.j === 'number' ? Math.max(i + 1, Math.min(step.j, m - 1)) : m - 1;
    const grid = step.grid as (number | null)[][] | undefined;

    // 解析当前最优最后戳破气球 k
    let k = -1;
    if (step.deps && step.deps.length > 0) {
      const depK = step.deps.find((d) => d.r === i && d.c > i && d.c < j);
      if (depK) k = depK.c;
    }
    if (k === -1 && typeof step.tag === 'string') {
      const match = step.tag.match(/气球[:\s]*#?(\d+)/i) || step.tag.match(/k\s*=\s*(\d+)/i);
      if (match) k = parseInt(match[1], 10);
    }
    if (k === -1 && j > i + 1) {
      k = i + 1;
    }

    const gain = (k > i && k < j) ? val[i]! * val[k]! * val[j]! : 0;
    const leftCoins = (k > i && grid?.[i]?.[k] != null) ? grid[i]![k]! : 0;
    const rightCoins = (k < j && grid?.[k]?.[j] != null) ? grid[k]![j]! : 0;
    const totalCoins = leftCoins + rightCoins + gain;
    const bestCoins = grid?.[i]?.[j] != null ? grid[i]![j] : totalCoins;

    const balloonColors = ['#f43f5e', '#0284c7', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

    const balloonsHtml = val
      .map((v, idx) => {
        const isLeftWall = idx === i;
        const isRightWall = idx === j;
        const isTarget = idx === k;
        const isVirtual = idx === 0 || idx === m - 1;
        const color = isVirtual ? '#64748b' : balloonColors[(idx - 1) % balloonColors.length];

        let stateBadge = '';
        let borderCls = 'border-slate-700 bg-slate-900/80';
        let scaleCls = 'scale-100';

        if (isVirtual) {
          borderCls = 'border-slate-600 bg-slate-800 text-slate-300';
          stateBadge = '<div class="text-[9px] text-slate-400 font-bold">虚拟边界</div>';
        } else if (isTarget) {
          borderCls = 'border-amber-400 bg-amber-950/60 shadow-xl shadow-amber-500/30';
          scaleCls = 'scale-110';
          stateBadge = '<div class="text-[9px] text-amber-400 font-bold">🎯 最后戳破</div>';
        } else if (idx > i && idx < j) {
          borderCls = 'border-slate-600 bg-slate-900 text-slate-200';
          stateBadge = '<div class="text-[9px] text-slate-500">区间待戳</div>';
        } else {
          borderCls = 'border-slate-800 bg-slate-950/40 opacity-40';
          stateBadge = '<div class="text-[9px] text-slate-600">已戳/界外</div>';
        }

        return `
          <div class="flex flex-col items-center gap-1.5 transition-all ${scaleCls}">
            ${stateBadge}
            <!-- 拟物气球球体 -->
            <div class="relative w-14 sm:w-16 h-18 sm:h-20 rounded-full flex flex-col items-center justify-center border-2 ${borderCls}"
                 style="${isTarget ? 'box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);' : ''}">
              <div class="text-[10px] text-slate-400 font-mono">#${idx}</div>
              <div class="text-xl sm:text-2xl font-black font-mono text-white" style="color: ${color}">
                ${v}
              </div>
              <!-- 气球气嘴与线绳 -->
              <div class="absolute -bottom-1.5 w-2 h-1.5 rounded-sm bg-slate-500"></div>
              <div class="absolute -bottom-4 w-0.5 h-3 bg-slate-600"></div>
            </div>
            <div class="text-[10px] font-mono ${isLeftWall ? 'text-sky-400 font-bold' : isRightWall ? 'text-indigo-400 font-bold' : 'text-slate-500'}">
              ${isLeftWall ? '← i (左壁)' : isRightWall ? 'j (右壁) →' : `#${idx}`}
            </div>
          </div>
        `;
      })
      .join('');

    container.className = 'w-full h-full flex flex-col justify-start p-3 bg-slate-900/90 text-slate-100 rounded-xl overflow-y-auto border border-slate-700/60 shadow-inner font-sans';
    container.innerHTML = `
      <div class="grid grid-cols-12 gap-3 w-full h-full items-stretch">
        <!-- 左侧 7 列：气球陈列与靶心沙盘 -->
        <div class="col-span-12 lg:col-span-7 flex flex-col items-center justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800">
          <div class="w-full flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-rose-400 font-bold text-base">🎈</span>
              <span class="font-bold text-slate-200">气球陈列架沙盘 (开区间 (${i}, ${j}))</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">开区间跨度 len=${j - i}</span>
          </div>

          <div class="w-full flex-1 flex flex-wrap items-center justify-center gap-3.5 my-4 px-2">
            ${balloonsHtml}
          </div>

          <div class="w-full p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <span class="text-slate-400">相邻紧贴边界计算：</span>
            <div class="font-mono font-bold text-amber-400">
              val[${i}](${val[i]}) × val[${k}](${k >= 0 ? val[k] : '?'}) × val[${j}](${val[j]}) = ${gain}
            </div>
          </div>
        </div>

        <!-- 右侧 5 列：逆向思维金币收益推导 -->
        <div class="col-span-12 lg:col-span-5 flex flex-col justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800 gap-2.5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🪙</span> 金币收益演算舱
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-700/50">
              dp[${i}][${j}]
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            <div class="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div class="flex justify-between items-center text-slate-400 mb-1">
                <span>左子开区间 dp[${i}][${k}]</span>
                <span class="font-bold text-sky-300 text-sm font-mono">${leftCoins}</span>
              </div>
              <div class="text-[11px] text-slate-500">区间 (${i}, ${k}) 内部所有气球全部戳破的金币收益</div>
            </div>

            <div class="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div class="flex justify-between items-center text-slate-400 mb-1">
                <span>右子开区间 dp[${k}][${j}]</span>
                <span class="font-bold text-emerald-300 text-sm font-mono">${rightCoins}</span>
              </div>
              <div class="text-[11px] text-slate-500">区间 (${k}, ${j}) 内部所有气球全部戳破的金币收益</div>
            </div>

            <div class="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
              <div class="flex justify-between items-center text-slate-400 mb-1">
                <span>最后戳破气球 #${k} 自身即时金币</span>
                <span class="font-bold text-amber-300 text-sm font-mono">${gain}</span>
              </div>
              <div class="text-[11px] text-slate-500">由于其左右气球已全破，此时其相邻气球必为边界 ${i} 与 ${j}</div>
            </div>

            <div class="p-3 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
              <div>
                <div class="text-[10px] uppercase tracking-wider text-amber-400 font-bold">开区间 (${i}, ${j}) 最大金币 dp[${i}][${j}]</div>
                <div class="text-[11px] text-slate-300">max { dp[i][k] + dp[k][j] + val[i]*val[k]*val[j] }</div>
              </div>
              <div class="text-xl font-black text-amber-400 font-mono">${bestCoins}</div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>逆向思维神来之笔</strong>：正向考虑“先戳哪个”会导致剩余气球不连续破坏子问题独立性；而<strong>逆向假设“k 是开区间中最后一个被戳破的”</strong>，无论中间怎么戳，气球 k 最终的相邻者必然就是外侧边界 <code>i</code> 和 <code>j</code>！
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 4. 奇怪的打印机 (strange-printer · LC 664)
  // ==========================================================================
  private static renderStrangePrinter(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const rawS = (options.params?.s || (typeof (step as any).s === 'string' ? (step as any).s : 'aaabbb')) as string;
    const s = typeof rawS === 'string' && rawS.length > 0 ? rawS : 'aaabbb';
    const n = s.length;

    const i = typeof step.i === 'number' ? Math.max(0, Math.min(step.i, n - 1)) : 0;
    const j = typeof step.j === 'number' ? Math.max(i, Math.min(step.j, n - 1)) : n - 1;
    const grid = step.grid as (number | null)[][] | undefined;

    const charI = s[i]!;
    const charJ = s[j]!;
    const isSameEnd = charI === charJ;

    const bestTurns = grid?.[i]?.[j] != null ? grid[i]![j] : (isSameEnd ? (grid?.[i]?.[j - 1] ?? 1) : 2);

    const charColors: Record<string, string> = {
      a: '#38bdf8',
      b: '#ec4899',
      c: '#10b981',
      d: '#f59e0b',
      e: '#8b5cf6',
      f: '#f97316',
    };

    const ribbonHtml = s
      .split('')
      .map((ch, idx) => {
        const inSub = idx >= i && idx <= j;
        const isI = idx === i;
        const isJ = idx === j;
        const color = charColors[ch] || '#a855f7';

        let borderCls = 'border-slate-700 bg-slate-900/70 text-slate-400';
        let badgeHtml = '';

        if (!inSub) {
          borderCls = 'border-slate-800 bg-slate-950/40 opacity-30';
        } else if (isI && isJ) {
          borderCls = 'border-emerald-400 bg-emerald-950/50 shadow-md shadow-emerald-500/20';
          badgeHtml = '<div class="absolute -top-3 text-[8px] font-bold text-emerald-400">单字符</div>';
        } else if (isI) {
          borderCls = 'border-sky-400 bg-sky-950/50 shadow-md shadow-sky-500/20';
          badgeHtml = '<div class="absolute -top-3 text-[8px] font-bold text-sky-400">首端 i</div>';
        } else if (isJ) {
          borderCls = isSameEnd ? 'border-sky-400 bg-sky-950/50 shadow-md shadow-sky-500/20' : 'border-amber-400 bg-amber-950/50';
          badgeHtml = `<div class="absolute -top-3 text-[8px] font-bold ${isSameEnd ? 'text-sky-400' : 'text-amber-400'}">尾端 j</div>`;
        } else {
          borderCls = 'border-slate-600 bg-slate-800/80 text-slate-200';
        }

        return `
          <div class="relative flex flex-col items-center justify-between w-11 sm:w-13 h-16 sm:h-18 rounded-lg p-1.5 border-2 transition-all ${borderCls}">
            ${badgeHtml}
            <div class="text-[9px] text-slate-400 font-mono">#${idx}</div>
            <div class="text-xl sm:text-2xl font-black font-mono" style="color: ${color}">
              ${ch}
            </div>
            <div class="w-full h-1 rounded-full" style="background-color: ${color}"></div>
          </div>
        `;
      })
      .join('');

    container.className = 'w-full h-full flex flex-col justify-start p-3 bg-slate-900/90 text-slate-100 rounded-xl overflow-y-auto border border-slate-700/60 shadow-inner font-sans';
    container.innerHTML = `
      <div class="grid grid-cols-12 gap-3 w-full h-full items-stretch">
        <!-- 左侧 7 列：打印机色带与喷头沙盘 -->
        <div class="col-span-12 lg:col-span-7 flex flex-col items-center justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800">
          <div class="w-full flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-sky-400 font-bold text-base">🖨️</span>
              <span class="font-bold text-slate-200">奇怪的打印机色带轨迹 (子串: "${s.slice(i, j + 1)}")</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">区间 [${i}..${j}] (长度 ${j - i + 1})</span>
          </div>

          <div class="w-full flex-1 flex flex-wrap items-center justify-center gap-2 my-4 px-2">
            ${ribbonHtml}
          </div>

          <div class="w-full p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div class="flex items-center gap-2">
              <span class="text-slate-400">两端字符比较：</span>
              <span class="text-sky-400 font-bold">s[${i}] = '${charI}'</span>
              <span class="text-slate-400">${isSameEnd ? '==' : '!='}</span>
              <span class="${isSameEnd ? 'text-sky-400' : 'text-amber-400'} font-bold">s[${j}] = '${charJ}'</span>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] ${isSameEnd ? 'bg-sky-950 text-sky-300 border border-sky-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'}">
              ${isSameEnd ? '✨ 首尾同色顺带覆盖' : '🔀 需切分点 k 分段刷漆'}
            </span>
          </div>
        </div>

        <!-- 右侧 5 列：涂色策略与贪心抵消监视器 -->
        <div class="col-span-12 lg:col-span-5 flex flex-col justify-between bg-slate-950/60 rounded-xl p-3 border border-slate-800 gap-2.5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🎨</span> 涂色策略与抵消决策舱
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
              dp[${i}][${j}]
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            ${
              isSameEnd
                ? `
              <div class="p-3 rounded-lg bg-sky-950/40 border border-sky-500/50 flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sky-300">✨ 首尾相同优化：dp[i][j] = dp[i][j - 1]</span>
                  <span class="text-base font-bold font-mono text-sky-400">${bestTurns} 次</span>
                </div>
                <div class="text-[11px] text-slate-300 leading-relaxed">
                  打印首字符 <code>'${charI}'</code> 时，可贪心顺带一口气刷到尾部 <code>j</code>，尾部字符自然成型，后续子串涂色只需覆盖中间杂色部分，<strong>操作次数完全无需增加</strong>！
                </div>
              </div>
            `
                : `
              <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-amber-300">🔀 枚举最优切分点 k ∈ [${i}..${j - 1}]</span>
                  <span class="text-base font-bold font-mono text-amber-400">${bestTurns} 次</span>
                </div>
                <div class="text-[11px] text-slate-400 leading-relaxed">
                  首尾字符不同无法顺带涂刷，必须在某个切分点 <code>k</code> 处换色：<br/>
                  <code>dp[i][j] = min { dp[i][k] + dp[k + 1][j] }</code>
                </div>
              </div>
            `
            }

            <div class="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <div class="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">子串 s[${i}..${j}] 最少打印次数</div>
                <div class="text-[11px] text-slate-300 font-mono">"${s.slice(i, j + 1)}" 完美成型</div>
              </div>
              <div class="text-xl font-black text-emerald-400 font-mono">${bestTurns}</div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>奇怪打印机的物理特质</strong>：打印机每次只能用同一种颜色打印连续的一整段字符，后打印的颜色会覆盖之前打印的颜色。首尾相同顺带覆盖是区间 DP 的关键剪枝点。
          </div>
        </div>
      </div>
    `;
  }
}
