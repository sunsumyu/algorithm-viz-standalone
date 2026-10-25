/**
 * 状压动态规划拟物沙盘适配器 (BitmaskDpSandboxAdapter)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构
 *
 * 覆盖 Class 080 & 081 状态压缩 DP 全家族拟物沙盘：
 * 1. 我能赢吗 (can-i-win · LC 464 · Class 080 Code01): 数字池抽取芯片台 + 二进制掩码寄存器 + 博弈 Minimax 决策舱
 * 2. 火柴拼正方形 (matchsticks-to-square · LC 473 · Class 080 Code02): 四边边长物理框架装填槽与火柴选取沙盘
 * 3. 划分为k个相等的子集 (partition-k-equal-subsets · LC 698 · Class 080 Code03): K 个等容量物理桶装填进度沙盘
 * 4. 旅行商问题 (tsp-bitmask-dp · Class 080 Code04): 城市拓扑网络几何环图与巡回回路松弛演算舱
 */

import type { UniversalStep } from '../../universal-stage-engine';
import type { StateSpacePresentationOptions } from '../state-space-presenter';

export class BitmaskDpSandboxAdapter {
  private static readonly SUPPORTED_MODELS = new Set([
    // Class 080
    'can-i-win',
    'can-i-win-464',
    'class080-code01',
    'leetcode-464',
    'matchsticks-to-square',
    'matchsticks-to-square-473',
    'class080-code02',
    'class080-code02-ext',
    'leetcode-473',
    'partition-k-equal-subsets',
    'partition-k-equal-subsets-698',
    'class080-code03',
    'leetcode-698',
    'tsp-bitmask-dp',
    'tsp-bitmask',
    'class080-code04',
    'traveling-salesperson',
    // Class 081
    'number-of-ways-wear-hats',
    'number-of-ways-wear-hats-1434',
    'class081-code01',
    'leetcode-1434',
    'optimal-account-balancing',
    'optimal-account-balancing-465',
    'class081-code02',
    'leetcode-465',
    'good-subsets',
    'class081-code03',
    'the-number-of-good-subsets',
    'leetcode-1994',
    'distribute-repeating-integers',
    'distribute-repeating-integers-1655',
    'class081-code04',
    'leetcode-1655',
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
    container.className = 'bitmask-dp-sandbox-container';
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 0; background: transparent; overflow-y: auto; box-sizing: border-box; font-family: ui-sans-serif, system-ui, sans-serif;';
    const modelId = options.modelId || '';

    if (
      modelId === 'can-i-win' ||
      modelId === 'can-i-win-464' ||
      modelId === 'class080-code01' ||
      modelId === 'leetcode-464'
    ) {
      this.renderCanIWin(container, step, options);
    } else if (
      modelId === 'tsp-bitmask-dp' ||
      modelId === 'tsp-bitmask' ||
      modelId === 'class080-code04' ||
      modelId === 'traveling-salesperson'
    ) {
      this.renderTsp(container, step, options);
    } else if (
      modelId === 'matchsticks-to-square' ||
      modelId === 'matchsticks-to-square-473' ||
      modelId === 'class080-code02' ||
      modelId === 'class080-code02-ext' ||
      modelId === 'leetcode-473'
    ) {
      this.renderMatchsticksOrSubsets(container, step, options, true);
    } else if (
      modelId === 'partition-k-equal-subsets' ||
      modelId === 'partition-k-equal-subsets-698' ||
      modelId === 'class080-code03' ||
      modelId === 'leetcode-698'
    ) {
      this.renderMatchsticksOrSubsets(container, step, options, false);
    } else if (
      modelId === 'number-of-ways-wear-hats' ||
      modelId === 'number-of-ways-wear-hats-1434' ||
      modelId === 'class081-code01' ||
      modelId === 'leetcode-1434'
    ) {
      this.renderWearHats(container, step, options);
    } else if (
      modelId === 'optimal-account-balancing' ||
      modelId === 'optimal-account-balancing-465' ||
      modelId === 'class081-code02' ||
      modelId === 'leetcode-465'
    ) {
      this.renderOptimalAccount(container, step, options);
    } else if (
      modelId === 'good-subsets' ||
      modelId === 'class081-code03' ||
      modelId === 'the-number-of-good-subsets' ||
      modelId === 'leetcode-1994'
    ) {
      this.renderGoodSubsets(container, step, options);
    } else if (
      modelId === 'distribute-repeating-integers' ||
      modelId === 'distribute-repeating-integers-1655' ||
      modelId === 'class081-code04' ||
      modelId === 'leetcode-1655'
    ) {
      this.renderDistributeRepeating(container, step, options);
    } else {
      this.renderCanIWin(container, step, options);
    }
  }

  // ==========================================================================
  // 1. 我能赢吗 (can-i-win · LC 464 · Class 080 Code01)
  // ==========================================================================
  private static renderCanIWin(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const n = Math.max(1, Math.min(Number(options.params?.n ?? 4), 20));
    const m = Math.max(0, Number(options.params?.m ?? 6));

    // 解析当前二进制位掩码 status
    let status = 0;
    if (typeof (step as any).status === 'number') {
      status = (step as any).status;
    } else if (typeof step.tag === 'string') {
      const match = step.tag.match(/status\s*=\s*([01]+)/i) || step.tag.match(/状态\[([01]+)\]/i);
      if (match) status = parseInt(match[1], 2);
    }

    // 解析当前剩余目标 rest
    let rest = m;
    if (typeof (step as any).rest === 'number') {
      rest = (step as any).rest;
    } else if (Array.isArray(step.dp1d) && step.dp1d.length >= 2 && typeof step.dp1d[1] === 'number') {
      rest = step.dp1d[1];
    } else if (typeof step.tag === 'string') {
      const match = step.tag.match(/rest\s*=\s*(\d+)/i) || step.tag.match(/需凑齐\s*rest\s*=\s*(\d+)/i);
      if (match) rest = parseInt(match[1], 10);
    }

    // 解析当前正在尝试选取的数字 candidate
    let candidate = 0;
    if (typeof (step as any).candidate === 'number' && (step as any).candidate > 0) {
      candidate = (step as any).candidate;
    } else if (typeof step.i === 'number' && step.i > 0 && step.i <= n) {
      candidate = step.i;
    } else if (Array.isArray(step.dp1d) && step.dp1d.length >= 3 && typeof step.dp1d[2] === 'number') {
      candidate = step.dp1d[2];
    }

    // 解析当前局势胜负结论
    let hasWon = false;
    if (Array.isArray(step.dp1d) && step.dp1d[0] === 1) hasWon = true;
    if (typeof step.tag === 'string' && (step.tag.includes('获胜') || step.tag.includes('必胜') || step.tag.includes('胜 ✓'))) {
      hasWon = true;
    }

    const statusBin = status.toString(2).padStart(n + 1, '0');
    const currentSum = Math.max(0, m - rest);
    const progressPercent = m > 0 ? Math.min(100, Math.round((currentSum / m) * 100)) : 100;
    const candidateGhostPercent = m > 0 && candidate > 0
      ? Math.min(100, Math.round(((currentSum + candidate) / m) * 100))
      : progressPercent;

    // 构建数字池筹码卡片 (1 ~ n)
    const chipsHtml = Array.from({ length: n }, (_, idx) => {
      const num = idx + 1;
      const isUsed = (status & (1 << num)) !== 0;
      const isCurrentCandidate = candidate === num;

      let cardClass = 'border-slate-800 bg-slate-900/60 text-slate-300';
      let stateBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400">可用 (bit=0)</span>`;

      if (isUsed) {
        cardClass = 'border-slate-800/60 bg-slate-950/40 text-slate-600 line-through opacity-40';
        stateBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] bg-slate-900 text-slate-500">已抽取 (bit=1)</span>`;
      } else if (isCurrentCandidate) {
        cardClass = 'border-amber-400 bg-amber-950/60 text-amber-200 ring-2 ring-amber-400/50 shadow-lg shadow-amber-950/50 scale-105';
        stateBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 animate-pulse">🎯 试选中 (+${num})</span>`;
      }

      return `
        <div class="w-20 h-24 rounded-xl border ${cardClass} flex flex-col items-center justify-between p-2 transition-all duration-300 relative select-none">
          <div class="text-[9px] font-mono text-slate-400">#${num}</div>
          <div class="text-2xl font-black font-mono">${num}</div>
          ${stateBadge}
        </div>
      `;
    }).join('');

    // 构建硬件位寄存器指示条 (bit n ~ bit 1)
    const registerBitsHtml = Array.from({ length: n }, (_, idx) => {
      const bitPos = n - idx;
      const bitVal = (status & (1 << bitPos)) !== 0 ? 1 : 0;
      const isCandidateBit = candidate === bitPos;
      return `
        <div class="flex flex-col items-center px-1">
          <span class="text-[8px] font-mono text-slate-500">b${bitPos}</span>
          <div class="w-6 h-7 rounded border ${
            bitVal === 1
              ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 font-bold'
              : isCandidateBit
              ? 'border-amber-400 bg-amber-950/80 text-amber-300 font-bold animate-pulse'
              : 'border-slate-800 bg-slate-900 text-slate-600'
          } flex items-center justify-center font-mono text-xs">
            ${bitVal}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：数字池抽取台与二进制位掩码沙盘 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🎲</span> 数字池抽取台与状态机 (Number Pool & Bitmask Register)
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-700/50">
                目标累加和 ≥ ${m}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                status = ${status} (0b${statusBin.slice(-(n + 1))})
              </span>
            </div>
          </div>

          <!-- 数字池卡片阵列 -->
          <div class="w-full flex-1 flex flex-wrap items-center justify-center gap-2.5 my-2 px-2">
            ${chipsHtml}
          </div>

          <!-- 二进制硬件寄存器与累加水位仪表 -->
          <div class="w-full flex flex-col gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
            <!-- 位掩码指示灯排 -->
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span class="text-slate-400 text-[11px]">二进制状态寄存器 (位 1=已用, 0=可用)：</span>
              <div class="flex items-center gap-0.5">
                ${registerBitsHtml}
              </div>
            </div>

            <!-- 目标达成水位计 -->
            <div class="flex flex-col gap-1">
              <div class="flex justify-between items-center text-[11px]">
                <span class="text-slate-400">已累加总和：<strong class="text-sky-300 font-bold">${currentSum}</strong> / 目标 ${m}</span>
                <span class="${rest <= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400'}">尚缺 rest = ${rest}</span>
              </div>
              <div class="w-full h-3 rounded-full bg-slate-950 border border-slate-800 relative overflow-hidden">
                <!-- 幽灵试选预览条 -->
                <div class="h-full bg-amber-500/40 transition-all duration-300 absolute left-0 top-0" style="width: ${candidateGhostPercent}%;"></div>
                <!-- 实际当前进度条 -->
                <div class="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300 relative" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧 5 列：博弈论 Minimax 极小化极大决策舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>⚖️</span> 博弈论 Minimax 决策舱
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-700/50">
              dfs(status, rest)
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            <!-- 决策分支 A: 选数试探 -->
            <div class="p-3 rounded-lg ${candidate > 0 ? 'bg-amber-950/40 border-amber-500/50' : 'bg-slate-900/90 border-slate-800'} border flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-amber-300">🎯 当前试选数字：i = ${candidate > 0 ? candidate : '无'}</span>
                <span class="text-xs font-mono font-bold ${candidate >= rest ? 'text-emerald-400' : 'text-slate-400'}">
                  ${candidate > 0 ? (candidate >= rest ? '🌟 一击必杀' : '交替对手行动') : '等待试选'}
                </span>
              </div>
              <div class="text-[11px] text-slate-300 leading-relaxed font-mono">
                ${
                  candidate > 0
                    ? candidate >= rest
                      ? `当前选手选 ${candidate} >= rest(${rest})，累加和直接冲线达标，<strong>宣告直接获胜！</strong>`
                      : `选 ${candidate} 后剩余 rest' = ${rest - candidate}，对手接手局面：<br/>dfs(status | (1<<${candidate}), ${rest - candidate})`
                    : '遍历所有尚未使用的数字 i，若能迫使对手必败则我方必胜。'
                }
              </div>
            </div>

            <!-- 决策分支 B: 局势判定结论 -->
            <div class="p-3 rounded-lg ${hasWon ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-slate-900/90 border-slate-800'} border flex items-center justify-between">
              <div>
                <div class="text-[10px] uppercase tracking-wider ${hasWon ? 'text-emerald-400' : 'text-slate-400'} font-bold">当前局势推导判定</div>
                <div class="text-xs text-slate-300 font-mono mt-0.5">
                  ${hasWon ? '🟢 存在致胜选法 (当前选手必胜)' : '⏳ 正在探查致胜分支或已陷入必败'}
                </div>
              </div>
              <div class="text-lg font-black font-mono ${hasWon ? 'text-emerald-400' : 'text-slate-400'}">
                ${hasWon ? 'WIN (true)' : 'SEARCHING'}
              </div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>博弈论 Minimax 原则</strong>：博弈问题无需推演对手所有分支。只要存在某一个合法数字能让对手陷入必败态（<code>return false</code>），当前行动者就能将必败局强加给对手，从而锁定胜局。
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 2. 旅行商问题 (tsp-bitmask-dp · Class 080 Code04)
  // ==========================================================================
  private static renderTsp(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const n = Math.max(3, Math.min(Number(options.params?.n ?? 4), 6));
    const full = (1 << n) - 1;

    // 解析当前状态集合掩码 s 与当前停驻城市 curr
    let s = 1;
    if (typeof step.i === 'number') s = step.i;
    let curr = 0;
    if (typeof step.j === 'number') curr = step.j;

    let nextCity = -1;
    if (Array.isArray(step.dp1d) && step.dp1d.length >= 4 && typeof step.dp1d[3] === 'number') {
      nextCity = step.dp1d[3];
    }

    const sBin = s.toString(2).padStart(n, '0');

    // 默认示例距离矩阵 (4 城市)
    const distExamples: Record<number, number[][]> = {
      4: [
        [0, 10, 15, 20],
        [10, 0, 35, 25],
        [15, 35, 0, 30],
        [20, 25, 30, 0],
      ],
      5: [
        [0, 3, 4, 2, 7],
        [3, 0, 4, 6, 3],
        [4, 4, 0, 5, 8],
        [2, 6, 5, 0, 6],
        [7, 3, 8, 6, 0],
      ],
    };
    const dist = distExamples[n] || distExamples[4]!;

    // 计算几何坐标 (以 200x200 视口环状排布)
    const cx = 100;
    const cy = 100;
    const r = 70;
    const cityCoords = Array.from({ length: n }, (_, idx) => {
      const angle = (2 * Math.PI * idx) / n - Math.PI / 2;
      return {
        idx,
        x: Math.round(cx + r * Math.cos(angle)),
        y: Math.round(cy + r * Math.sin(angle)),
      };
    });

    // 构建网络边 SVG
    const edgesSvg = cityCoords
      .map((fromCity) =>
        cityCoords
          .filter((toCity) => toCity.idx > fromCity.idx)
          .map((toCity) => {
            const isConnectingActive =
              (curr === fromCity.idx && nextCity === toCity.idx) ||
              (curr === toCity.idx && nextCity === fromCity.idx);
            return `
              <line
                x1="${fromCity.x}" y1="${fromCity.y}"
                x2="${toCity.x}" y2="${toCity.y}"
                stroke="${isConnectingActive ? '#f59e0b' : '#334155'}"
                stroke-width="${isConnectingActive ? '2.5' : '1'}"
                stroke-dasharray="${isConnectingActive ? '4 2' : 'none'}"
                class="${isConnectingActive ? 'animate-pulse' : ''}"
              />
            `;
          })
          .join('')
      )
      .join('');

    // 构建城市节点 SVG
    const nodesSvg = cityCoords
      .map((city) => {
        const isVisited = (s & (1 << city.idx)) !== 0;
        const isCurrent = curr === city.idx;
        const isNext = nextCity === city.idx;

        let fill = '#1e293b';
        let stroke = '#475569';
        let strokeWidth = '1.5';

        if (isCurrent) {
          fill = '#f59e0b';
          stroke = '#fef08a';
          strokeWidth = '3';
        } else if (isNext) {
          fill = '#38bdf8';
          stroke = '#bae6fd';
          strokeWidth = '2.5';
        } else if (isVisited) {
          fill = '#10b981';
          stroke = '#6ee7b7';
          strokeWidth = '2';
        }

        return `
          <g transform="translate(${city.x}, ${city.y})">
            ${isCurrent ? `<circle r="16" fill="none" stroke="#f59e0b" stroke-width="1.5" class="animate-ping opacity-75" />` : ''}
            <circle r="12" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
            <text text-anchor="middle" dy="4" fill="#ffffff" font-size="10" font-weight="bold" font-family="monospace">
              ${city.idx}
            </text>
          </g>
        `;
      })
      .join('');

    const visitedCount = Array.from({ length: n }).filter((_, idx) => (s & (1 << idx)) !== 0).length;

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：城市拓扑网络与巡回回路沙盘 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🌐</span> 城市拓扑网络与回路沙盘 (City Network & Route Sandbox)
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                已探访 ${visitedCount}/${n} 城
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-950 text-sky-300 border border-sky-700/50">
                s = ${s} (0b${sBin})
              </span>
            </div>
          </div>

          <!-- SVG 环形城市几何图 -->
          <div class="w-full flex-1 flex items-center justify-center p-2">
            <svg viewBox="0 0 200 200" class="w-56 h-56">
              ${edgesSvg}
              ${nodesSvg}
            </svg>
          </div>

          <!-- 城市探访状态与路径指示 -->
          <div class="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div class="flex items-center gap-3">
              <span class="text-amber-400 font-bold">📍 停驻城市 #${curr}</span>
              ${nextCity >= 0 ? `<span class="text-sky-400 font-bold">➔ 试探飞往 #${nextCity} (花费 ${dist[curr]?.[nextCity] ?? '?'})</span>` : ''}
            </div>
            <div class="text-slate-400 text-[11px]">
              ${s === full ? '🎉 全集城市访问完毕，返回起点 0' : `已访问: {${cityCoords.filter(c => (s & (1 << c.idx)) !== 0).map(c => c.idx).join(', ')}}`}
            </div>
          </div>
        </div>

        <!-- 右侧 5 列：旅行商路径成本松弛演算舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🛣️</span> 状态压缩与松弛演算舱
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-700/50">
              dp[s][curr]
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-sky-300">✈️ 状态转移方程式</span>
                <span class="text-[11px] font-mono text-slate-400">Bellman-Held-Karp</span>
              </div>
              <div class="text-[11px] text-slate-300 font-mono leading-relaxed bg-slate-950 p-2 rounded border border-slate-800">
                dp[s | (1 &lt;&lt; j)][j] = min(dp[s | (1 &lt;&lt; j)][j], dp[s][i] + dist[i][j])
              </div>
            </div>

            <div class="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <div class="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">已访问集合掩码</div>
                <div class="text-xs text-slate-300 font-mono mt-0.5">
                  s = 0b${sBin} (${visitedCount} 个城市点亮)
                </div>
              </div>
              <div class="text-xl font-black text-emerald-400 font-mono">${s}/${full}</div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>TSP 状压 DP 核心</strong>：利用二进制掩码 <code>s</code> 记录所有已走过的城市集合，<code>dp[s][i]</code> 表示走过集合 <code>s</code> 且当前停驻在城市 <code>i</code> 的最小路程开销。避免了全排列 $O(N!)$ 的爆炸复杂度。
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 3. 火柴拼正方形 / 划分为 k 个相等的子集 (matchsticks-to-square / partition-k)
  // ==========================================================================
  private static renderMatchsticksOrSubsets(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>,
    isMatchsticks: boolean
  ): void {
    const rawNums = (options.params?.nums || [1, 1, 2, 2, 2]) as number[];
    const nums = Array.isArray(rawNums) ? rawNums : [1, 1, 2, 2, 2];
    const n = nums.length;
    const k = isMatchsticks ? 4 : Math.max(1, Number(options.params?.k ?? 4));

    const totalSum = nums.reduce((a, b) => a + b, 0);
    const target = totalSum % k === 0 ? totalSum / k : 0;

    let status = 0;
    if (typeof (step as any).status === 'number') {
      status = (step as any).status;
    } else if (typeof step.i === 'number') {
      status = step.i;
    }

    const statusBin = status.toString(2).padStart(n, '0');

    // 构建火柴/数字芯片
    const itemsHtml = nums
      .map((val, idx) => {
        const isUsed = (status & (1 << idx)) !== 0;
        return `
          <div class="w-16 h-20 rounded-xl border ${
            isUsed
              ? 'border-slate-800/60 bg-slate-950/40 text-slate-600 line-through opacity-40'
              : 'border-slate-800 bg-slate-900/60 text-slate-200'
          } flex flex-col items-center justify-between p-2 font-mono">
            <span class="text-[9px] text-slate-400">#${idx}</span>
            <span class="text-xl font-bold">${val}</span>
            <span class="text-[9px] ${isUsed ? 'text-slate-500' : 'text-emerald-400'}">${isUsed ? '已装填' : '待放入'}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：装填台与物理桶沙盘 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>${isMatchsticks ? '🪵' : '🪣'}</span> ${isMatchsticks ? '火柴拾取台与四边拼装沙盘' : '数字池与 K 个目标子集装填沙盘'}
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                ${isMatchsticks ? '单边长' : '每桶容量'}: ${target > 0 ? target : '无解(不可除)'}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-950 text-sky-300 border border-sky-700/50">
                status = ${status} (0b${statusBin})
              </span>
            </div>
          </div>

          <!-- 数字/火柴阵列 -->
          <div class="w-full flex-1 flex flex-wrap items-center justify-center gap-2 my-2 px-2">
            ${itemsHtml}
          </div>

          <div class="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">总长度/总和：${totalSum}</span>
            <span class="${target > 0 ? 'text-emerald-400' : 'text-rose-400'}">
              ${target > 0 ? `分为 ${k} 份，每份目标 = ${target}` : `总和 ${totalSum} 无法被 ${k} 整除！`}
            </span>
          </div>
        </div>

        <!-- 右侧 5 列：装填可行性与子集和演算舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🎯</span> 装填可行性与剪枝决策舱
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-700/50">
              k = ${k} 桶划分
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
              <span class="font-bold text-sky-300">✂️ 状态压缩剪枝法则</span>
              <div class="text-[11px] text-slate-400 leading-relaxed">
                利用二进制掩码 <code>status</code> 记录哪些元素已使用。当一个桶装满 <code>target</code> 时，立即切换到下一个桶继续从头搜寻，避免排列顺序的重复计算。
              </div>
            </div>

            <div class="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <div class="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">总和整除性校验</div>
                <div class="text-xs text-slate-300 font-mono mt-0.5">
                  ${totalSum} % ${k} === ${totalSum % k}
                </div>
              </div>
              <div class="text-lg font-black font-mono ${target > 0 ? 'text-emerald-400' : 'text-rose-400'}">
                ${target > 0 ? 'VALID' : 'INVALID'}
              </div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>状压子集划分的核心</strong>：采用二进制表示数字使用状态，配合降序贪心排序加速大数失败剪枝，是回溯与动态规划结合的黄金范式。
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 3. 每个人戴不同帽子的方案数 (number-of-ways-wear-hats · LC 1434 · Class 081 Code01)
  // ==========================================================================
  private static renderWearHats(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const hats: number[][] = (options.params?.hats as number[][]) || [
      [3, 4],
      [4, 5],
      [5],
    ];
    const n = Math.max(1, hats.length);
    const full = (1 << n) - 1;

    // 解析当前帽子编号 h (1 ~ 40)
    let h = 0;
    if (typeof step.i === 'number' && step.i > 0) {
      h = step.i;
    }

    // 解析当前戴帽人员集合掩码 s
    let s = 0;
    if (typeof step.j === 'number') {
      s = step.j;
    } else if (typeof (step as any).status === 'number') {
      s = (step as any).status;
    }

    // 解析当前被分配的人 p
    let p = -1;
    if (typeof step.activeSlot === 'number' && step.activeSlot >= 0 && step.activeSlot < n) {
      p = step.activeSlot;
    } else if (typeof step.tag === 'string') {
      const match = step.tag.match(/人\s*#?(\d+)/i) || step.tag.match(/人\s*(\d+)/i);
      if (match) p = parseInt(match[1], 10);
    }

    const nextS = p >= 0 ? s | (1 << p) : s;
    const sBin = s.toString(2).padStart(n, '0');
    const nextSBin = nextS.toString(2).padStart(n, '0');

    // 统计当前戴帽人数
    let assignedCount = 0;
    for (let i = 0; i < n; i++) {
      if ((s & (1 << i)) !== 0) assignedCount++;
    }
    const completionPercent = Math.round((assignedCount / n) * 100);

    // 喜欢帽子 h 的人员列表
    const interestedPersons = hats
      .map((prefs, idx) => (prefs.includes(h) ? idx : -1))
      .filter((idx) => idx >= 0);

    // 构建人员状态卡片 (0 ~ n-1)
    const personsHtml = Array.from({ length: n }, (_, idx) => {
      const hasHat = (s & (1 << idx)) !== 0;
      const isCandidate = p === idx;
      const likesCurrentHat = hats[idx]?.includes(h);

      let cardClass = 'border-slate-800 bg-slate-900/60 text-slate-300';
      let statusBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-400">待分配 (bit=0)</span>`;

      if (hasHat) {
        cardClass = 'border-emerald-500/70 bg-emerald-950/40 text-emerald-200 shadow-sm shadow-emerald-950';
        statusBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-slate-950">🎩 已戴帽 (bit=1)</span>`;
      } else if (isCandidate) {
        cardClass = 'border-amber-400 bg-amber-950/60 text-amber-200 ring-2 ring-amber-400/50 scale-105 shadow-md shadow-amber-950/60';
        statusBadge = `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 animate-pulse">🎯 试戴中</span>`;
      }

      return `
        <div class="w-28 h-32 rounded-xl border ${cardClass} flex flex-col justify-between p-2.5 transition-all duration-300 relative select-none">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-slate-300">人 #${idx}</span>
            <span class="text-base">${hasHat ? '🎩' : '👤'}</span>
          </div>
          <div class="text-[10px] text-slate-400 line-clamp-1">
            喜欢: <span class="font-mono text-slate-300">[${hats[idx]?.join(',') || ''}]</span>
          </div>
          <div class="text-[9px] font-mono ${likesCurrentHat ? 'text-sky-300' : 'text-slate-500'}">
            ${likesCurrentHat ? '★ 喜欢当前帽' : '· 不感冒'}
          </div>
          ${statusBadge}
        </div>
      `;
    }).join('');

    // 构建硬件位寄存器
    const registerBitsHtml = Array.from({ length: n }, (_, idx) => {
      const bitPos = n - 1 - idx;
      const bitVal = (s & (1 << bitPos)) !== 0 ? 1 : 0;
      const isCandidateBit = p === bitPos;
      return `
        <div class="flex flex-col items-center px-1">
          <span class="text-[8px] font-mono text-slate-500">p${bitPos}</span>
          <div class="w-6 h-7 rounded border ${
            bitVal === 1
              ? 'border-emerald-500 bg-emerald-950/80 text-emerald-300 font-bold'
              : isCandidateBit
              ? 'border-amber-400 bg-amber-950/80 text-amber-300 font-bold animate-pulse'
              : 'border-slate-800 bg-slate-900 text-slate-600'
          } flex items-center justify-center font-mono text-xs">
            ${bitVal}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：帽子陈列台与人员受体掩码沙盘 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🎩</span> 帽子陈列台与人员受体沙盘 (Dimension Inversion)
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-700/50">
                当前决策帽子 #${h > 0 ? h : '—'}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                s = ${s} (0b${sBin})
              </span>
            </div>
          </div>

          <!-- 当前帽子详情横幅 -->
          <div class="w-full p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <span class="text-xl">🎩</span>
              <div>
                <span class="font-bold text-sky-300">帽子 #${h > 0 ? h : '初始'}</span>
                <span class="text-[11px] text-slate-400 ml-2">
                  喜欢人员: [${interestedPersons.length > 0 ? interestedPersons.map((ip) => `人#${ip}`).join(', ') : '无'}]
                </span>
              </div>
            </div>
            <span class="text-[11px] font-mono text-slate-400">
              全满目标 full = ${full} (0b${(1 << n) - 1})
            </span>
          </div>

          <!-- 受体人员卡片阵列 -->
          <div class="w-full flex-1 flex flex-wrap items-center justify-center gap-2.5 my-2 px-1">
            ${personsHtml}
          </div>

          <!-- 二进制 LED 寄存器与达成率 -->
          <div class="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-1">
              <span class="text-[10px] text-slate-400 mr-1">受体寄存器:</span>
              ${registerBitsHtml}
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-slate-400">佩戴达成:</span>
              <div class="w-20 bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full transition-all duration-300" style="width: ${completionPercent}%"></div>
              </div>
              <span class="text-[11px] font-mono font-bold text-emerald-400">${assignedCount}/${n}</span>
            </div>
          </div>
        </div>

        <!-- 右侧 5 列：方案累计与维度反转决策舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>📊</span> 方案累计与 0-1 转移决策舱
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-950 text-purple-300 border border-purple-700/50">
              MOD = 10^9+7
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
              <span class="font-bold text-sky-300">🔄 0-1 背包式滚动转移方程</span>
              <div class="text-[11px] font-mono text-emerald-400 bg-slate-950/80 p-2 rounded border border-slate-800/80">
                dp[nextS] = (dp[nextS] + dp[s]) % MOD
              </div>
              <div class="text-[10px] text-slate-400 leading-relaxed mt-1">
                外层按帽子 <code>1..40</code> 推进；内层按满足状态 <code>s</code> 逆序枚举。当人 <code>p</code> 尚未戴帽时，戴上帽子转移至 <code>nextS = s | (1 &lt;&lt; p)</code>。
              </div>
            </div>

            <div class="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div class="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">新状态掩码</div>
                <div class="text-xs text-slate-200 font-mono mt-0.5">
                  nextS = ${nextS} (0b${nextSBin})
                </div>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-slate-400">当前试分配</div>
                <div class="text-sm font-bold font-mono text-amber-300">
                  ${p >= 0 ? `帽#${h} ➔ 人#${p}` : '未分配'}
                </div>
              </div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>维度反转核心洞察</strong>：若按“人选帽子”，分支度达 $40^n$；维度反转后按“帽子分配给人”，状态数收敛至 $2^n \le 1024$，外层仅需 40 轮 0-1 背包转移！
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 4. 最优账单平衡 (optimal-account-balancing · LC 465 · Class 081 Code02)
  // ==========================================================================
  private static renderOptimalAccount(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const transactions: number[][] = (options.params?.transactions as number[][]) || [
      [0, 1, 10],
      [2, 0, 5],
    ];

    // 计算各人员净收支结余
    const debtMap = new Map<number, number>();
    for (const [u, v, w] of transactions) {
      debtMap.set(u, (debtMap.get(u) || 0) - w);
      debtMap.set(v, (debtMap.get(v) || 0) + w);
    }
    const debts: Array<{ id: number; debt: number }> = [];
    for (const [id, debt] of debtMap.entries()) {
      if (debt !== 0) debts.push({ id, debt });
    }
    debts.sort((a, b) => a.id - b.id);
    const m = Math.max(1, debts.length);
    const full = (1 << m) - 1;

    // 解析当前子集掩码 s
    let s = 0;
    if (typeof step.j === 'number') {
      s = step.j;
    } else if (typeof step.i === 'number' && step.i > 0 && step.i <= full) {
      s = step.i;
    }

    const sBin = s.toString(2).padStart(m, '0');

    // 计算当前子集的净额累加和
    let subsetSum = 0;
    let subsetCount = 0;
    for (let k = 0; k < m; k++) {
      if ((s & (1 << k)) !== 0) {
        subsetSum += debts[k]?.debt || 0;
        subsetCount++;
      }
    }
    const isZeroSum = subsetCount > 0 && subsetSum === 0;

    // 解析已识别的最大和为 0 独立子集数 k
    let maxZeroSubsets = 0;
    const valAtS = Array.isArray(step.dp1d) && s < step.dp1d.length ? step.dp1d[s] : null;
    if (typeof valAtS === 'number') {
      maxZeroSubsets = valAtS;
    } else if (typeof step.tag === 'string') {
      const match = step.tag.match(/dp\[.*?\]\s*=\s*(\d+)/i) || step.tag.match(/子集数\s*(\d+)/i);
      if (match) maxZeroSubsets = parseInt(match[1], 10);
    }

    const minTransactions = m - maxZeroSubsets;

    // 构建净收支流水牌卡片
    const debtsHtml = debts.map((item, idx) => {
      const isInSubset = (s & (1 << idx)) !== 0;
      const isDebtor = item.debt < 0;

      let cardClass = 'border-slate-800 bg-slate-900/60 text-slate-300';
      if (isInSubset) {
        cardClass = isDebtor
          ? 'border-rose-500 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500/50'
          : 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/50';
      }

      return `
        <div class="w-24 h-28 rounded-xl border ${cardClass} flex flex-col justify-between p-2 font-mono transition-all duration-300 relative select-none">
          <div class="flex items-center justify-between text-[10px] text-slate-400">
            <span>人 #${item.id}</span>
            <span class="text-[9px] ${isInSubset ? 'text-amber-400 font-bold' : 'text-slate-600'}">b${idx}</span>
          </div>
          <div class="text-center">
            <span class="text-xl font-black ${isDebtor ? 'text-rose-400' : 'text-emerald-400'}">
              ${item.debt > 0 ? `+${item.debt}` : item.debt}
            </span>
          </div>
          <div class="text-[9px] text-center px-1 py-0.5 rounded ${
            isInSubset ? 'bg-amber-950 text-amber-300 font-bold' : 'bg-slate-950 text-slate-500'
          }">
            ${isInSubset ? '已选入子集' : '未包含'}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：净收支账户卡与零和天平沙盘 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>💳</span> 账户净收支结余与子集天平沙盘 (Bank Ledger Scale)
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-700/50">
                非零债务人数: ${m}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                s = ${s} (0b${sBin})
              </span>
            </div>
          </div>

          <!-- 债务人卡片阵列 -->
          <div class="w-full flex-1 flex flex-wrap items-center justify-center gap-2.5 my-2 px-1">
            ${debtsHtml}
          </div>

          <!-- 子集天平与零和指示器 -->
          <div class="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs">
              <span class="text-base">${isZeroSum ? '🟢' : '⚖️'}</span>
              <div>
                <span class="text-slate-400">子集累加净额：</span>
                <span class="font-mono font-bold ${isZeroSum ? 'text-emerald-400 text-sm' : 'text-slate-200'}">
                  ∑ debt = ${subsetSum}
                </span>
              </div>
            </div>
            <span class="px-2 py-1 rounded text-[10px] font-bold ${
              isZeroSum
                ? 'bg-emerald-500 text-slate-950 animate-pulse'
                : 'bg-slate-800 text-slate-400'
            }">
              ${isZeroSum ? '🎉 零和自平衡独立闭环成立！' : '子集净额未平账'}
            </span>
          </div>
        </div>

        <!-- 右侧 5 列：清算交易转化舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🔄</span> 债务清算与子集分解转化舱
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-700/50">
              最小交易 = m - k
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
              <span class="font-bold text-sky-300">💡 交易笔数与独立子集等价定理</span>
              <div class="text-[11px] text-slate-400 leading-relaxed">
                任意一个内部净额和为 0 的子集，仅需 <code>size - 1</code> 笔交易即可完全结清。划分出 <code>k</code> 个互不相交且和为 0 的子集，总交易笔数即为：
              </div>
              <div class="text-[11px] font-mono text-amber-300 bg-slate-950/80 p-2 rounded border border-slate-800/80 mt-1">
                ∑ (size_i - 1) = m - k
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div class="text-[10px] text-slate-400">最大零和子集数 k</div>
                <div class="text-xl font-black font-mono text-emerald-400 mt-0.5">${maxZeroSubsets}</div>
              </div>
              <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                <div class="text-[10px] text-slate-400">最少结算转账数</div>
                <div class="text-xl font-black font-mono text-sky-400 mt-0.5">${minTransactions}</div>
              </div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>状压转移法则</strong>：<code>dp[s] = max(dp[s ^ (1 &lt;&lt; i)]) + (sum[s] === 0 ? 1 : 0)</code>，化债务平账为最大和为 0 独立子集挖掘。
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 5. 好子集的数目 (good-subsets · LC 1994 · Class 081 Code03)
  // ==========================================================================
  private static renderGoodSubsets(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];

    // 解析当前数字 num (2 ~ 30)
    let num = 0;
    if (typeof step.i === 'number' && step.i > 0) {
      num = step.i;
    }

    // 解析当前质数掩码 s
    let s = 0;
    if (typeof step.j === 'number') {
      s = step.j;
    } else if (typeof step.activeSlot === 'number') {
      s = step.activeSlot;
    }

    const sBin = s.toString(2).padStart(10, '0');

    // 计算当前数字的质因数掩码及平方因子检测
    let numMask = 0;
    let hasSquare = false;
    const numPrimeFactors: number[] = [];

    if (num > 1) {
      let temp = num;
      for (let idx = 0; idx < primes.length; idx++) {
        const p = primes[idx];
        if (temp % p === 0) {
          let count = 0;
          while (temp % p === 0) {
            count++;
            temp /= p;
          }
          if (count > 1) {
            hasSquare = true;
          }
          numPrimeFactors.push(p);
          numMask |= 1 << idx;
        }
      }
      if (temp > 1) hasSquare = true;
    }

    const isDisjoint = !hasSquare && numMask > 0 && (s & numMask) === 0;

    // 10 质因数质谱仪光柱
    const primesHtml = primes.map((p, idx) => {
      const isInS = (s & (1 << idx)) !== 0;
      const isNumFactor = numPrimeFactors.includes(p);

      let barClass = 'border-slate-800 bg-slate-900 text-slate-500';
      if (isInS) {
        barClass = 'border-emerald-500 bg-emerald-950/80 text-emerald-300 font-bold';
      } else if (isNumFactor) {
        barClass = 'border-amber-400 bg-amber-950/80 text-amber-300 font-bold animate-pulse';
      }

      return `
        <div class="flex flex-col items-center gap-1">
          <span class="text-[9px] font-mono text-slate-400">${p}</span>
          <div class="w-7 h-16 rounded-lg border ${barClass} flex flex-col items-center justify-between py-1 font-mono text-[10px]">
            <span>${isInS ? '●' : '○'}</span>
            <span class="text-[8px] text-slate-500">p${idx}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：10 质数质谱仪与当前数字分子卡 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🧪</span> 10 质因数质谱仪与无平方分子沙盘 (Prime Spectrometer)
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-300 border border-sky-700/50">
                当前数字: ${num > 0 ? num : '—'}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                s = ${s} (0b${sBin})
              </span>
            </div>
          </div>

          <!-- 当前数字分子展开卡 -->
          <div class="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl font-black font-mono text-amber-300">
                ${num > 0 ? num : '—'}
              </div>
              <div>
                <div class="text-xs font-bold text-slate-200">质因数分解：${numPrimeFactors.length > 0 ? numPrimeFactors.join(' × ') : (num === 1 ? '1 (中性单位)' : '—')}</div>
                <div class="text-[10px] font-mono text-slate-400 mt-0.5">
                  掩码 mask = ${numMask} (0b${numMask.toString(2).padStart(10, '0')})
                </div>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded text-xs font-bold ${
              hasSquare
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }">
              ${hasSquare ? '🚫 含平方因子 (不可选)' : '✓ 无平方好数字'}
            </span>
          </div>

          <!-- 10 质因数质谱柱 -->
          <div class="w-full flex items-center justify-around my-2 p-2 bg-slate-950/40 rounded-xl border border-slate-800/80">
            ${primesHtml}
          </div>

          <div class="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span class="text-slate-400">质因子碰撞检验：(s &amp; mask) === ${(s & numMask)}</span>
            <span class="${isDisjoint ? 'text-emerald-400 font-bold' : 'text-rose-400'}">
              ${isDisjoint ? '🟢 互质无碰撞，可安全选入！' : '🛑 质因数重叠碰撞或含平方'}
            </span>
          </div>
        </div>

        <!-- 右侧 5 列：好子集 0-1 背包转移与 1 的倍乘舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🎯</span> 0-1 背包与乘数倍率舱
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-950 text-purple-300 border border-purple-700/50">
              MOD = 10^9+7
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
              <span class="font-bold text-sky-300">🎒 0-1 背包状压状态转移</span>
              <div class="text-[11px] font-mono text-emerald-400 bg-slate-950/80 p-2 rounded border border-slate-800/80">
                dp[s | mask] += dp[s] * cnt[num]
              </div>
              <div class="text-[10px] text-slate-400 leading-relaxed mt-1">
                逆序从 <code>1023</code> 遍历至 <code>0</code>。若 <code>(s &amp; mask) === 0</code>，当前数字可与集合 <code>s</code> 组合，方案数累加。
              </div>
            </div>

            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
              <span class="font-bold text-amber-300">🌟 特殊数字 1 的 2^cnt[1] 倍乘</span>
              <div class="text-[10px] text-slate-400 leading-relaxed">
                数字 1 不含任何质因数，任何好子集添加任意个 1 仍是好子集。每个 1 均有“选/不选” 2 种独立选择，最终总答案需乘以 <code>2^cnt[1]</code>！
              </div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>数论状压核心</strong>：30 以内质数仅 10 个，将“乘积为互不相同质数”规约为 10 位二进制集合并运算，计算量瞬间降至几百步内。
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 6. 分配重复整数 (distribute-repeating-integers · LC 1655 · Class 081 Code04)
  // ==========================================================================
  private static renderDistributeRepeating(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const quantity: number[] = (options.params?.quantity as number[]) || [2, 2];
    const m = Math.max(1, quantity.length);
    const full = (1 << m) - 1;

    // 解析当前频次 c
    let c = 0;
    if (typeof step.i === 'number') {
      c = step.i;
    }

    // 解析当前顾客掩码 s
    let s = 0;
    if (typeof step.j === 'number') {
      s = step.j;
    }

    // 解析当前子掩码 sub
    let sub = 0;
    if (typeof step.activeSlot === 'number' && step.activeSlot <= full) {
      sub = step.activeSlot;
    } else if (typeof step.tag === 'string') {
      const match = step.tag.match(/sub\s*=\s*([01]+)/i) || step.tag.match(/子集\s*#?([01]+)/i);
      if (match) sub = parseInt(match[1], 2);
    }

    const sBin = s.toString(2).padStart(m, '0');
    const subBin = sub.toString(2).padStart(m, '0');

    // 计算当前子掩码的总需求量
    let subDemand = 0;
    for (let k = 0; k < m; k++) {
      if ((sub & (1 << k)) !== 0) {
        subDemand += quantity[k] || 0;
      }
    }
    const isFeasible = subDemand <= c && subDemand > 0;

    // 构建顾客小推车卡片
    const cartsHtml = quantity.map((need, idx) => {
      const inSub = (sub & (1 << idx)) !== 0;
      const inS = (s & (1 << idx)) !== 0;

      let cardClass = 'border-slate-800 bg-slate-900/60 text-slate-300';
      if (inSub) {
        cardClass = 'border-amber-400 bg-amber-950/60 text-amber-200 ring-2 ring-amber-400/50 scale-105';
      } else if (inS) {
        cardClass = 'border-emerald-500/70 bg-emerald-950/40 text-emerald-300';
      }

      return `
        <div class="w-24 h-28 rounded-xl border ${cardClass} flex flex-col justify-between p-2 font-mono transition-all duration-300 relative select-none">
          <div class="flex items-center justify-between text-[10px] text-slate-400">
            <span>顾客 #${idx}</span>
            <span class="text-xs">🛒</span>
          </div>
          <div class="text-center">
            <span class="text-xs text-slate-400">需求量</span>
            <div class="text-xl font-black text-slate-100">${need}</div>
          </div>
          <div class="text-[9px] text-center px-1 py-0.5 rounded ${
            inSub
              ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
              : inS
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-slate-950 text-slate-500'
          }">
            ${inSub ? '🎯 当前分配子集' : inS ? '✓ 目标集合内' : '待满足'}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：库存仓库与顾客订单推车沙盘 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>📦</span> 库存频次仓库与顾客订单沙盘 (Order Dispatcher)
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                当前可用库存: ${c}
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-950 text-sky-300 border border-sky-700/50">
                s = ${s} (0b${sBin})
              </span>
            </div>
          </div>

          <!-- 顾客订单小推车阵列 -->
          <div class="w-full flex-1 flex flex-wrap items-center justify-center gap-2.5 my-2 px-1">
            ${cartsHtml}
          </div>

          <!-- 需求与库存比对 -->
          <div class="w-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span class="text-slate-400">子集 sub(0b${subBin}) 需求总计：</span>
              <span class="font-bold ${isFeasible ? 'text-emerald-400' : 'text-amber-400'}">${subDemand}</span>
            </div>
            <span class="px-2 py-1 rounded text-[10px] font-bold ${
              isFeasible
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-rose-950 text-rose-300 border border-rose-800/50'
            }">
              ${isFeasible ? `✓ 库存充盈 (${subDemand} ≤ ${c})` : `✗ 超出库存 (${subDemand} > ${c})`}
            </span>
          </div>
        </div>

        <!-- 右侧 5 列：子掩码调度决策舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="font-bold text-slate-200 text-xs flex items-center gap-1.5">
              <span>🎯</span> (sub-1)&amp;s 子掩码高效调度舱
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-950 text-purple-300 border border-purple-700/50">
              全满目标: ${full}
            </span>
          </div>

          <div class="flex-1 flex flex-col justify-around gap-2 text-xs">
            <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col gap-1.5">
              <span class="font-bold text-sky-300">⚡ 高效子掩码枚举技巧</span>
              <div class="text-[11px] font-mono text-emerald-400 bg-slate-950/80 p-2 rounded border border-slate-800/80">
                sub = (sub - 1) &amp; s
              </div>
              <div class="text-[10px] text-slate-400 leading-relaxed mt-1">
                直接从 <code>s</code> 降序遍历其所有非空子集，总时间复杂度严格收敛至 $3^m$，彻底规避暴力枚举 $4^m$ 的性能瓶颈。
              </div>
            </div>

            <div class="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div>
                <div class="text-[10px] text-emerald-400 font-bold uppercase">状态转移判定</div>
                <div class="text-xs text-slate-200 font-mono mt-0.5">
                  dp[s ^ sub] &amp;&amp; demand ≤ count
                </div>
              </div>
              <div class="text-sm font-bold font-mono ${isFeasible ? 'text-emerald-400' : 'text-slate-500'}">
                ${isFeasible ? 'FEASIBLE' : 'SKIPPED'}
              </div>
            </div>
          </div>

          <div class="text-[11px] text-slate-400 p-2 rounded bg-slate-900/60 border border-slate-800/80 leading-relaxed">
            💡 <strong>状态压缩调度本质</strong>：同一频次的数字只能分配给特定顾客子集，将顾客状态压缩为二进制掩码，实现了资源与订单的最优匹配。
          </div>
        </div>
      </div>
    `;
  }
}

