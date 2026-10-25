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

      let cardStyle = 'border: 1px solid #1e293b; background: rgba(15, 23, 42, 0.6); color: #cbd5e1;';
      let stateBadge = `<span style="padding: 2px 6px; border-radius: 4px; font-size: 9px; background: #1e293b; color: #94a3b8;">可用 (bit=0)</span>`;

      if (isUsed) {
        cardStyle = 'border: 1px solid rgba(30, 41, 59, 0.6); background: rgba(2, 6, 23, 0.4); color: #475569; text-decoration: line-through; opacity: 0.4;';
        stateBadge = `<span style="padding: 2px 6px; border-radius: 4px; font-size: 9px; background: #0f172a; color: #64748b;">已抽取 (bit=1)</span>`;
      } else if (isCurrentCandidate) {
        cardStyle = 'border: 1px solid #fbbf24; background: rgba(69, 26, 3, 0.6); color: #fef08a; box-shadow: 0 0 12px rgba(245, 158, 11, 0.4); transform: scale(1.05);';
        stateBadge = `<span style="padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; background: #f59e0b; color: #020617;">🎯 试选中 (+${num})</span>`;
      }

      return `
        <div style="width: 80px; height: 96px; border-radius: 12px; ${cardStyle} display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 8px; transition: all 0.3s; position: relative; user-select: none; box-sizing: border-box;">
          <div style="font-size: 9px; font-family: monospace; color: #94a3b8;">#${num}</div>
          <div style="font-size: 24px; font-weight: 900; font-family: monospace;">${num}</div>
          ${stateBadge}
        </div>
      `;
    }).join('');

    // 构建硬件位寄存器指示条 (bit n ~ bit 1)
    const registerBitsHtml = Array.from({ length: n }, (_, idx) => {
      const bitPos = n - idx;
      const bitVal = (status & (1 << bitPos)) !== 0 ? 1 : 0;
      const isCandidateBit = candidate === bitPos;
      const bitBorder =
        bitVal === 1
          ? 'border: 1px solid #10b981; background: rgba(6, 78, 59, 0.8); color: #6ee7b7; font-weight: bold;'
          : isCandidateBit
          ? 'border: 1px solid #fbbf24; background: rgba(69, 26, 3, 0.8); color: #fde047; font-weight: bold;'
          : 'border: 1px solid #1e293b; background: #0f172a; color: #475569;';

      return `
        <div style="display: flex; flex-direction: column; align-items: center; padding: 0 4px;">
          <span style="font-size: 8px; font-family: monospace; color: #64748b;">b${bitPos}</span>
          <div style="width: 24px; height: 28px; border-radius: 4px; ${bitBorder} display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 12px; box-sizing: border-box;">
            ${bitVal}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：数字池抽取台与二进制位掩码沙盘 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🎲</span> 数字池抽取台与状态机 (Number Pool & Bitmask Register)
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #172554; color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.5);">
                目标累加和 ≥ ${m}
              </span>
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #022c22; color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5);">
                status = ${status} (0b${statusBin.slice(-(n + 1))})
              </span>
            </div>
          </div>

          <!-- 数字池卡片阵列 -->
          <div style="width: 100%; flex: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; margin: 8px 0; padding: 0 8px; box-sizing: border-box;">
            ${chipsHtml}
          </div>

          <!-- 二进制硬件寄存器与累加水位仪表 -->
          <div style="width: 100%; display: flex; flex-direction: column; gap: 8px; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            <!-- 位掩码指示灯排 -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(30, 41, 59, 0.8); padding-bottom: 6px;">
              <span style="color: #94a3b8; font-size: 11px;">二进制状态寄存器 (位 1=已用, 0=可用)：</span>
              <div style="display: flex; align-items: center; gap: 2px;">
                ${registerBitsHtml}
              </div>
            </div>

            <!-- 目标达成水位计 -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                <span style="color: #94a3b8;">已累加总和：<strong style="color: #7dd3fc; font-weight: 700;">${currentSum}</strong> / 目标 ${m}</span>
                <span style="color: ${rest <= 0 ? '#34d399; font-weight: 700;' : '#fbbf24;'}">尚缺 rest = ${rest}</span>
              </div>
              <div style="width: 100%; height: 12px; border-radius: 9999px; background: #020617; border: 1px solid #1e293b; position: relative; overflow: hidden;">
                <!-- 幽灵试选预览条 -->
                <div style="height: 100%; background: rgba(245, 158, 11, 0.4); transition: all 0.3s; position: absolute; left: 0; top: 0; width: ${candidateGhostPercent}%;"></div>
                <!-- 实际当前进度条 -->
                <div style="height: 100%; background: linear-gradient(to right, #0ea5e9, #10b981); transition: all 0.3s; position: relative; width: ${progressPercent}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧 5 列：博弈论 Minimax 极小化极大决策舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>⚖️</span> 博弈论 Minimax 决策舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #3b0764; color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.5);">
              dfs(status, rest)
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            <!-- 决策分支 A: 选数试探 -->
            <div style="padding: 12px; border-radius: 8px; ${candidate > 0 ? 'background: rgba(69, 26, 3, 0.4); border: 1px solid rgba(245, 158, 11, 0.5);' : 'background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b;'} display: flex; flex-direction: column; gap: 6px; box-sizing: border-box;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-weight: 700; color: #fde047;">🎯 当前试选数字：i = ${candidate > 0 ? candidate : '无'}</span>
                <span style="font-size: 12px; font-family: monospace; font-weight: 700; color: ${candidate >= rest ? '#34d399' : '#94a3b8'};">
                  ${candidate > 0 ? (candidate >= rest ? '🌟 一击必杀' : '交替对手行动') : '等待试选'}
                </span>
              </div>
              <div style="font-size: 11px; color: #cbd5e1; line-height: 1.6; font-family: monospace;">
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
            <div style="padding: 12px; border-radius: 8px; ${hasWon ? 'background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(16, 185, 129, 0.5);' : 'background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b;'} display: flex; align-items: center; justify-content: space-between; box-sizing: border-box;">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${hasWon ? '#34d399' : '#94a3b8'}; font-weight: 700;">当前局势推导判定</div>
                <div style="font-size: 12px; color: #cbd5e1; font-family: monospace; margin-top: 2px;">
                  ${hasWon ? '🟢 存在致胜选法 (当前选手必胜)' : '⏳ 正在探查致胜分支或已陷入必败'}
                </div>
              </div>
              <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: ${hasWon ? '#34d399' : '#94a3b8'};">
                ${hasWon ? 'WIN (true)' : 'SEARCHING'}
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 4px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.6;">
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
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🌐</span> 城市拓扑网络与回路沙盘 (City Network & Route Sandbox)
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #022c22; color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5);">
                已探访 ${visitedCount}/${n} 城
              </span>
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #082f49; color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.5);">
                s = ${s} (0b${sBin})
              </span>
            </div>
          </div>

          <!-- SVG 环形城市几何图 -->
          <div style="width: 100%; flex: 1; display: flex; align-items: center; justify-content: center; padding: 8px; box-sizing: border-box;">
            <svg viewBox="0 0 200 200" style="width: 224px; height: 224px; display: block;">
              ${edgesSvg}
              ${nodesSvg}
            </svg>
          </div>

          <!-- 城市探访状态与路径指示 -->
          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: #fbbf24; font-weight: 700;">📍 停驻城市 #${curr}</span>
              ${nextCity >= 0 ? `<span style="color: #38bdf8; font-weight: 700;">➔ 试探飞往 #${nextCity} (花费 ${dist[curr]?.[nextCity] ?? '?'})</span>` : ''}
            </div>
            <div style="color: #94a3b8; font-size: 11px;">
              ${s === full ? '🎉 全集城市访问完毕，返回起点 0' : `已访问: {${cityCoords.filter(c => (s & (1 << c.idx)) !== 0).map(c => c.idx).join(', ')}}`}
            </div>
          </div>
        </div>

        <!-- 右侧 5 列：旅行商路径成本松弛演算舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🛣️</span> 状态压缩与松弛演算舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #082f49; color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.5);">
              dp[s][curr]
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            <div style="padding: 12px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-weight: 700; color: #7dd3fc;">✈️ 状态转移方程式</span>
                <span style="font-size: 11px; font-family: monospace; color: #94a3b8;">Bellman-Held-Karp</span>
              </div>
              <div style="font-size: 11px; color: #cbd5e1; font-family: monospace; line-height: 1.6; background: #020617; padding: 8px; border-radius: 4px; border: 1px solid #1e293b;">
                dp[s | (1 &lt;&lt; j)][j] = min(dp[s | (1 &lt;&lt; j)][j], dp[s][i] + dist[i][j])
              </div>
            </div>

            <div style="padding: 12px; border-radius: 8px; background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: space-between; box-sizing: border-box;">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #34d399; font-weight: 700;">已访问集合掩码</div>
                <div style="font-size: 12px; color: #cbd5e1; font-family: monospace; margin-top: 2px;">
                  s = 0b${sBin} (${visitedCount} 个城市点亮)
                </div>
              </div>
              <div style="font-size: 20px; font-weight: 900; color: #34d399; font-family: monospace;">${s}/${full}</div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 4px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.6;">
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
        const itemStyle = isUsed
          ? 'border: 1px solid rgba(30, 41, 59, 0.6); background: rgba(2, 6, 23, 0.4); color: #475569; text-decoration: line-through; opacity: 0.4;'
          : 'border: 1px solid #1e293b; background: rgba(15, 23, 42, 0.6); color: #e2e8f0;';
        return `
          <div style="width: 64px; height: 80px; border-radius: 12px; ${itemStyle} display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 8px; font-family: monospace; box-sizing: border-box; user-select: none;">
            <span style="font-size: 9px; color: #94a3b8;">#${idx}</span>
            <span style="font-size: 20px; font-weight: 700;">${val}</span>
            <span style="font-size: 9px; color: ${isUsed ? '#64748b' : '#34d399'};">${isUsed ? '已装填' : '待放入'}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：装填台与物理桶沙盘 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>${isMatchsticks ? '🪵' : '🪣'}</span> ${isMatchsticks ? '火柴拾取台与四边拼装沙盘' : '数字池与 K 个目标子集装填沙盘'}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #022c22; color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5);">
                ${isMatchsticks ? '单边长' : '每桶容量'}: ${target > 0 ? target : '无解(不可除)'}
              </span>
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #082f49; color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.5);">
                status = ${status} (0b${statusBin})
              </span>
            </div>
          </div>

          <!-- 数字/火柴阵列 -->
          <div style="width: 100%; flex: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; margin: 8px 0; padding: 0 8px; box-sizing: border-box;">
            ${itemsHtml}
          </div>

          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            <span style="color: #94a3b8;">总长度/总和：${totalSum}</span>
            <span style="color: ${target > 0 ? '#34d399' : '#fb7185'};">
              ${target > 0 ? `分为 ${k} 份，每份目标 = ${target}` : `总和 ${totalSum} 无法被 ${k} 整除！`}
            </span>
          </div>
        </div>

        <!-- 右侧 5 列：装填可行性与子集和演算舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🎯</span> 装填可行性与剪枝决策舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #3b0764; color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.5);">
              k = ${k} 桶划分
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            <div style="padding: 12px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box;">
              <span style="font-weight: 700; color: #7dd3fc;">✂️ 状态压缩剪枝法则</span>
              <div style="font-size: 11px; color: #94a3b8; line-height: 1.6;">
                利用二进制掩码 <code>status</code> 记录哪些元素已使用。当一个桶装满 <code>target</code> 时，立即切换到下一个桶继续从头搜寻，避免排列顺序的重复计算。
              </div>
            </div>

            <div style="padding: 12px; border-radius: 8px; background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: space-between; box-sizing: border-box;">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #34d399; font-weight: 700;">总和整除性校验</div>
                <div style="font-size: 12px; color: #cbd5e1; font-family: monospace; margin-top: 2px;">
                  ${totalSum} % ${k} === ${totalSum % k}
                </div>
              </div>
              <div style="font-size: 18px; font-weight: 900; font-family: monospace; color: ${target > 0 ? '#34d399' : '#fb7185'};">
                ${target > 0 ? 'VALID' : 'INVALID'}
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 4px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.6;">
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

      let cardStyle = 'border: 1px solid #1e293b; background: rgba(15, 23, 42, 0.6); color: #cbd5e1;';
      let statusBadge = `<span style="padding: 2px 6px; border-radius: 4px; font-size: 9px; background: #1e293b; color: #94a3b8;">待分配 (bit=0)</span>`;

      if (hasHat) {
        cardStyle = 'border: 1px solid rgba(16, 185, 129, 0.7); background: rgba(6, 78, 59, 0.4); color: #a7f3d0; box-shadow: 0 1px 3px rgba(6, 78, 59, 0.4);';
        statusBadge = `<span style="padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; background: #10b981; color: #020617;">🎩 已戴帽 (bit=1)</span>`;
      } else if (isCandidate) {
        cardStyle = 'border: 1px solid #fbbf24; background: rgba(69, 26, 3, 0.6); color: #fef08a; transform: scale(1.05); box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);';
        statusBadge = `<span style="padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 700; background: #f59e0b; color: #020617;">🎯 试戴中</span>`;
      }

      return `
        <div style="width: 112px; height: 128px; border-radius: 12px; ${cardStyle} display: flex; flex-direction: column; justify-content: space-between; padding: 10px; transition: all 0.3s; position: relative; user-select: none; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12px; font-family: monospace; font-weight: 700; color: #cbd5e1;">人 #${idx}</span>
            <span style="font-size: 16px;">${hasHat ? '🎩' : '👤'}</span>
          </div>
          <div style="font-size: 10px; color: #94a3b8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            喜欢: <span style="font-family: monospace; color: #cbd5e1;">[${hats[idx]?.join(',') || ''}]</span>
          </div>
          <div style="font-size: 9px; font-family: monospace; color: ${likesCurrentHat ? '#7dd3fc' : '#64748b'};">
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
      const bitBorder =
        bitVal === 1
          ? 'border: 1px solid #10b981; background: rgba(6, 78, 59, 0.8); color: #6ee7b7; font-weight: bold;'
          : isCandidateBit
          ? 'border: 1px solid #fbbf24; background: rgba(69, 26, 3, 0.8); color: #fde047; font-weight: bold;'
          : 'border: 1px solid #1e293b; background: #0f172a; color: #475569;';

      return `
        <div style="display: flex; flex-direction: column; align-items: center; padding: 0 4px;">
          <span style="font-size: 8px; font-family: monospace; color: #64748b;">p${bitPos}</span>
          <div style="width: 24px; height: 28px; border-radius: 4px; ${bitBorder} display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 12px; box-sizing: border-box;">
            ${bitVal}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：帽子陈列台与人员受体掩码沙盘 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🎩</span> 帽子陈列台与人员受体沙盘 (Dimension Inversion)
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #082f49; color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.5);">
                当前决策帽子 #${h > 0 ? h : '—'}
              </span>
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #022c22; color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5);">
                s = ${s} (0b${sBin})
              </span>
            </div>
          </div>

          <!-- 当前帽子详情横幅 -->
          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(2, 6, 23, 0.7); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 20px;">🎩</span>
              <div>
                <span style="font-weight: 700; color: #7dd3fc;">帽子 #${h > 0 ? h : '初始'}</span>
                <span style="font-size: 11px; color: #94a3b8; margin-left: 8px;">
                  喜欢人员: [${interestedPersons.length > 0 ? interestedPersons.map((ip) => `人#${ip}`).join(', ') : '无'}]
                </span>
              </div>
            </div>
            <span style="font-size: 11px; font-family: monospace; color: #94a3b8;">
              全满目标 full = ${full} (0b${(1 << n) - 1})
            </span>
          </div>

          <!-- 受体人员卡片阵列 -->
          <div style="width: 100%; flex: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; margin: 8px 0; padding: 0 4px; box-sizing: border-box;">
            ${personsHtml}
          </div>

          <!-- 二进制 LED 寄存器与达成率 -->
          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 10px; color: #94a3b8; margin-right: 4px;">受体寄存器:</span>
              ${registerBitsHtml}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 10px; color: #94a3b8;">佩戴达成:</span>
              <div style="width: 80px; background: #020617; border-radius: 9999px; height: 8px; border: 1px solid #1e293b; overflow: hidden;">
                <div style="background: #10b981; height: 100%; border-radius: 9999px; transition: all 0.3s; width: ${completionPercent}%;"></div>
              </div>
              <span style="font-size: 11px; font-family: monospace; font-weight: 700; color: #34d399;">${assignedCount}/${n}</span>
            </div>
          </div>
        </div>

        <!-- 右侧 5 列：方案累计与维度反转决策舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>📊</span> 方案累计与 0-1 转移决策舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #3b0764; color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.5);">
              MOD = 10^9+7
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            <div style="padding: 12px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box;">
              <span style="font-weight: 700; color: #7dd3fc;">🔄 0-1 背包式滚动转移方程</span>
              <div style="font-size: 11px; font-family: monospace; color: #34d399; background: rgba(2, 6, 23, 0.8); padding: 8px; border-radius: 4px; border: 1px solid rgba(30, 41, 59, 0.8);">
                dp[nextS] = (dp[nextS] + dp[s]) % MOD
              </div>
              <div style="font-size: 10px; color: #94a3b8; line-height: 1.6; margin-top: 4px;">
                外层按帽子 <code>1..40</code> 推进；内层按满足状态 <code>s</code> 逆序枚举。当人 <code>p</code> 尚未戴帽时，戴上帽子转移至 <code>nextS = s | (1 &lt;&lt; p)</code>。
              </div>
            </div>

            <div style="padding: 12px; border-radius: 8px; background: rgba(6, 78, 59, 0.3); border: 1px solid rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: space-between; box-sizing: border-box;">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #34d399; font-weight: 700;">新状态掩码</div>
                <div style="font-size: 12px; color: #e2e8f0; font-family: monospace; margin-top: 2px;">
                  nextS = ${nextS} (0b${nextSBin})
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 10px; color: #94a3b8;">当前试分配</div>
                <div style="font-size: 14px; font-weight: 700; font-family: monospace; color: #fde047;">
                  ${p >= 0 ? `帽#${h} ➔ 人#${p}` : '未分配'}
                </div>
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 4px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.6;">
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

      let cardStyle = 'border: 1px solid #1e293b; background: rgba(15, 23, 42, 0.6); color: #cbd5e1;';
      if (isInSubset) {
        cardStyle = isDebtor
          ? 'border: 1px solid #f43f5e; background: rgba(76, 5, 25, 0.4); color: #fecdd3; box-shadow: 0 0 8px rgba(244, 63, 94, 0.3);'
          : 'border: 1px solid #10b981; background: rgba(6, 78, 59, 0.4); color: #a7f3d0; box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);';
      }

      return `
        <div style="width: 96px; height: 112px; border-radius: 12px; ${cardStyle} display: flex; flex-direction: column; justify-content: space-between; padding: 8px; font-family: monospace; transition: all 0.3s; position: relative; user-select: none; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #94a3b8;">
            <span>人 #${item.id}</span>
            <span style="font-size: 9px; color: ${isInSubset ? '#fbbf24; font-weight: 700;' : '#475569;'}">b${idx}</span>
          </div>
          <div style="text-align: center;">
            <span style="font-size: 20px; font-weight: 900; color: ${isDebtor ? '#fb7185' : '#34d399'};">
              ${item.debt > 0 ? `+${item.debt}` : item.debt}
            </span>
          </div>
          <div style="font-size: 9px; text-align: center; padding: 2px 4px; border-radius: 4px; ${
            isInSubset ? 'background: #451a03; color: #fde047; font-weight: 700;' : 'background: #020617; color: #64748b;'
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
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>💳</span> 账户净收支结余与子集天平沙盘 (Bank Ledger Scale)
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #4c0519; color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.5);">
                非零债务人数: ${m}
              </span>
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #022c22; color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5);">
                s = ${s} (0b${sBin})
              </span>
            </div>
          </div>

          <!-- 债务人卡片阵列 -->
          <div style="width: 100%; flex: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; margin: 8px 0; padding: 0 4px; box-sizing: border-box;">
            ${debtsHtml}
          </div>

          <!-- 子集天平与零和指示器 -->
          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
              <span style="font-size: 16px;">${isZeroSum ? '🟢' : '⚖️'}</span>
              <div>
                <span style="color: #94a3b8;">子集累加净额：</span>
                <span style="font-family: monospace; font-weight: 700; color: ${isZeroSum ? '#34d399; font-size: 14px;' : '#e2e8f0;'}">
                  ∑ debt = ${subsetSum}
                </span>
              </div>
            </div>
            <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; ${
              isZeroSum
                ? 'background: #10b981; color: #020617;'
                : 'background: #1e293b; color: #94a3b8;'
            }">
              ${isZeroSum ? '🎉 零和自平衡独立闭环成立！' : '子集净额未平账'}
            </span>
          </div>
        </div>

        <!-- 右侧 5 列：清算交易转化舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🔄</span> 债务清算与子集分解转化舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #451a03; color: #fde047; border: 1px solid rgba(245, 158, 11, 0.5);">
              最小交易 = m - k
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            <div style="padding: 12px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box;">
              <span style="font-weight: 700; color: #7dd3fc;">💡 交易笔数与独立子集等价定理</span>
              <div style="font-size: 11px; color: #94a3b8; line-height: 1.6;">
                任意一个内部净额和为 0 的子集，仅需 <code>size - 1</code> 笔交易即可完全结清。划分出 <code>k</code> 个互不相交且和为 0 的子集，总交易笔数即为：
              </div>
              <div style="font-size: 11px; font-family: monospace; color: #fde047; background: rgba(2, 6, 23, 0.8); padding: 8px; border-radius: 4px; border: 1px solid rgba(30, 41, 59, 0.8); margin-top: 4px;">
                ∑ (size_i - 1) = m - k
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
              <div style="padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; text-align: center; box-sizing: border-box;">
                <div style="font-size: 10px; color: #94a3b8;">最大零和子集数 k</div>
                <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #34d399; margin-top: 2px;">${maxZeroSubsets}</div>
              </div>
              <div style="padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; text-align: center; box-sizing: border-box;">
                <div style="font-size: 10px; color: #94a3b8;">最少结算转账数</div>
                <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #38bdf8; margin-top: 2px;">${minTransactions}</div>
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 4px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.6;">
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

      let barStyle = 'border: 1px solid #1e293b; background: #0f172a; color: #64748b;';
      if (isInS) {
        barStyle = 'border: 1px solid #10b981; background: rgba(6, 78, 59, 0.8); color: #6ee7b7; font-weight: bold;';
      } else if (isNumFactor) {
        barStyle = 'border: 1px solid #fbbf24; background: rgba(69, 26, 3, 0.8); color: #fde047; font-weight: bold;';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9px; font-family: monospace; color: #94a3b8;">${p}</span>
          <div style="width: 28px; height: 64px; border-radius: 8px; ${barStyle} display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 4px 0; font-family: monospace; font-size: 10px; box-sizing: border-box;">
            <span>${isInS ? '●' : '○'}</span>
            <span style="font-size: 8px; color: #64748b;">p${idx}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="bitmask-dp-sandbox-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-sizing: border-box;">
        <!-- 左侧 7 列：10 质数质谱仪与当前数字分子卡 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🧪</span> 10 质因数质谱仪与无平方分子沙盘 (Prime Spectrometer)
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #082f49; color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.5);">
                当前数字: ${num > 0 ? num : '—'}
              </span>
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #022c22; color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5);">
                s = ${s} (0b${sBin})
              </span>
            </div>
          </div>

          <!-- 当前数字分子展开卡 -->
          <div style="width: 100%; padding: 12px; border-radius: 12px; background: rgba(2, 6, 23, 0.8); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 48px; height: 48px; border-radius: 8px; background: #0f172a; border: 1px solid #334155; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; font-family: monospace; color: #fde047;">
                ${num > 0 ? num : '—'}
              </div>
              <div>
                <div style="font-size: 12px; font-weight: 700; color: #e2e8f0;">质因数分解：${numPrimeFactors.length > 0 ? numPrimeFactors.join(' × ') : (num === 1 ? '1 (中性单位)' : '—')}</div>
                <div style="font-size: 10px; font-family: monospace; color: #94a3b8; margin-top: 2px;">
                  掩码 mask = ${numMask} (0b${numMask.toString(2).padStart(10, '0')})
                </div>
              </div>
            </div>
            <span style="padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 700; ${
              hasSquare
                ? 'background: rgba(244, 63, 94, 0.2); color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.4);'
                : 'background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4);'
            }">
              ${hasSquare ? '🚫 含平方因子 (不可选)' : '✓ 无平方好数字'}
            </span>
          </div>

          <!-- 10 质因数质谱柱 -->
          <div style="width: 100%; display: flex; align-items: center; justify-content: space-around; margin: 8px 0; padding: 8px; background: rgba(2, 6, 23, 0.4); border-radius: 12px; border: 1px solid rgba(30, 41, 59, 0.8); box-sizing: border-box;">
            ${primesHtml}
          </div>

          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            <span style="color: #94a3b8;">质因子碰撞检验：(s &amp; mask) === ${(s & numMask)}</span>
            <span style="color: ${isDisjoint ? '#34d399; font-weight: 700;' : '#fb7185;'}">
              ${isDisjoint ? '🟢 互质无碰撞，可安全选入！' : '🛑 质因数重叠碰撞或含平方'}
            </span>
          </div>
        </div>

        <!-- 右侧 5 列：好子集 0-1 背包转移与 1 的倍乘舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🎯</span> 0-1 背包与乘数倍率舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #3b0764; color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.5);">
              MOD = 10^9+7
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            <div style="padding: 12px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box;">
              <span style="font-weight: 700; color: #7dd3fc;">🎒 0-1 背包状压状态转移</span>
              <div style="font-size: 11px; font-family: monospace; color: #34d399; background: rgba(2, 6, 23, 0.8); padding: 8px; border-radius: 4px; border: 1px solid rgba(30, 41, 59, 0.8);">
                dp[s | mask] += dp[s] * cnt[num]
              </div>
              <div style="font-size: 10px; color: #94a3b8; line-height: 1.6; margin-top: 4px;">
                逆序从 <code>1023</code> 遍历至 <code>0</code>。若 <code>(s &amp; mask) === 0</code>，当前数字可与集合 <code>s</code> 组合，方案数累加。
              </div>
            </div>

            <div style="padding: 12px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box;">
              <span style="font-weight: 700; color: #fde047;">🌟 特殊数字 1 的 2^cnt[1] 倍乘</span>
              <div style="font-size: 10px; color: #94a3b8; line-height: 1.6;">
                数字 1 不含任何质因数，任何好子集添加任意个 1 仍是好子集。每个 1 均有“选/不选” 2 种独立选择，最终总答案需乘以 <code>2^cnt[1]</code>！
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 4px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.6;">
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

      let cardStyle = 'border: 1px solid #1e293b; background: rgba(15, 23, 42, 0.6); color: #cbd5e1;';
      if (inSub) {
        cardStyle = 'border: 1px solid #fbbf24; background: rgba(69, 26, 3, 0.6); color: #fef08a; transform: scale(1.05); box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);';
      } else if (inS) {
        cardStyle = 'border: 1px solid rgba(16, 185, 129, 0.7); background: rgba(6, 78, 59, 0.4); color: #6ee7b7;';
      }

      return `
        <div style="width: 96px; height: 112px; border-radius: 12px; ${cardStyle} display: flex; flex-direction: column; justify-content: space-between; padding: 8px; font-family: monospace; transition: all 0.3s; position: relative; user-select: none; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #94a3b8;">
            <span>顾客 #${idx}</span>
            <span style="font-size: 12px;">🛒</span>
          </div>
          <div style="text-align: center;">
            <span style="font-size: 10px; color: #94a3b8;">需求量</span>
            <div style="font-size: 20px; font-weight: 900; color: #f8fafc;">${need}</div>
          </div>
          <div style="font-size: 9px; text-align: center; padding: 2px 4px; border-radius: 4px; ${
            inSub
              ? 'background: #f59e0b; color: #020617; font-weight: 700;'
              : inS
              ? 'background: rgba(16, 185, 129, 0.2); color: #6ee7b7;'
              : 'background: #020617; color: #64748b;'
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
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>📦</span> 库存频次仓库与顾客订单沙盘 (Order Dispatcher)
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #022c22; color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5);">
                当前可用库存: ${c}
              </span>
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #082f49; color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.5);">
                s = ${s} (0b${sBin})
              </span>
            </div>
          </div>

          <!-- 顾客订单小推车阵列 -->
          <div style="width: 100%; flex: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px; margin: 8px 0; padding: 0 4px; box-sizing: border-box;">
            ${cartsHtml}
          </div>

          <!-- 需求与库存比对 -->
          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-family: monospace; box-sizing: border-box;">
            <div>
              <span style="color: #94a3b8;">子集 sub(0b${subBin}) 需求总计：</span>
              <span style="font-weight: 700; color: ${isFeasible ? '#34d399' : '#fbbf24'};">${subDemand}</span>
            </div>
            <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; ${
              isFeasible
                ? 'background: #10b981; color: #020617;'
                : 'background: #4c0519; color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.5);'
            }">
              ${isFeasible ? `✓ 库存充盈 (${subDemand} ≤ ${c})` : `✗ 超出库存 (${subDemand} > ${c})`}
            </span>
          </div>
        </div>

        <!-- 右侧 5 列：子掩码调度决策舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🎯</span> (sub-1)&amp;s 子掩码高效调度舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-family: monospace; font-weight: 600; background: #3b0764; color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.5);">
              全满目标: ${full}
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            <div style="padding: 12px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; box-sizing: border-box;">
              <span style="font-weight: 700; color: #7dd3fc;">⚡ 高效子掩码枚举技巧</span>
              <div style="font-size: 11px; font-family: monospace; color: #34d399; background: rgba(2, 6, 23, 0.8); padding: 8px; border-radius: 4px; border: 1px solid rgba(30, 41, 59, 0.8);">
                sub = (sub - 1) &amp; s
              </div>
              <div style="font-size: 10px; color: #94a3b8; line-height: 1.6; margin-top: 4px;">
                直接从 <code>s</code> 降序遍历其所有非空子集，总时间复杂度严格收敛至 $3^m$，彻底规避暴力枚举 $4^m$ 的性能瓶颈。
              </div>
            </div>

            <div style="padding: 12px; border-radius: 8px; background: rgba(6, 78, 59, 0.3); border: 1px solid rgba(16, 185, 129, 0.3); display: flex; align-items: center; justify-content: space-between; box-sizing: border-box;">
              <div>
                <div style="font-size: 10px; color: #34d399; font-weight: 700; text-transform: uppercase;">状态转移判定</div>
                <div style="font-size: 12px; color: #e2e8f0; font-family: monospace; margin-top: 2px;">
                  dp[s ^ sub] &amp;&amp; demand ≤ count
                </div>
              </div>
              <div style="font-size: 14px; font-weight: 700; font-family: monospace; color: ${isFeasible ? '#34d399' : '#64748b'};">
                ${isFeasible ? 'FEASIBLE' : 'SKIPPED'}
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 4px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.6;">
            💡 <strong>状态压缩调度本质</strong>：同一频次的数字只能分配给特定顾客子集，将顾客状态压缩为二进制掩码，实现了资源与订单的最优匹配。
          </div>
        </div>
      </div>
    `;
  }
}

