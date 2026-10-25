/**
 * 区间动态规划拟物沙盘适配器 (IntervalDpSandboxAdapter)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构
 *
 * 覆盖 Class 076 & 077 区间 DP 全家族拟物沙盘：
 * 1. 多边形三角剖分的最低得分 (min-score-triangulation · LC 1039): 凸多边形几何剖分与三角形乘积沙盘
 * 2. 预测赢家 / 纸牌博弈 (predict-the-winner · LC 486): 桌面纸牌博弈与零和博弈极小化极大决策舱
 * 3. 戳气球 (burst-balloons · LC 312): 靶场气球陈列架与逆向最后戳气球金币收益演算舱
 * 4. 奇怪的打印机 (strange-printer · LC 664): 打印机色带与首尾贪心顺带覆盖监视器
 * 5. 合并石头的最低成本 (merge-stones · LC 1000 / Class 077 Code 01): 石子堆拟物立面与区间归约大合并演算舱
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
    } else if (
      modelId === 'merge-stones' ||
      modelId === 'merge-stones-1000' ||
      modelId === 'class077-code01' ||
      modelId === 'leetcode-1000'
    ) {
      this.renderMergeStones(container, step, options);
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
          <g style="cursor: pointer;">
            <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${ringR}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isI || isJ || isK ? 3 : 1.5}" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))" />
            <text x="${c.x.toFixed(1)}" y="${(c.y + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="bold" fill="${textColor}">${c.val}</text>
            <text x="${c.x.toFixed(1)}" y="${(c.y + (c.y > cy ? 28 : -20)).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="600" fill="${isI ? '#38bdf8' : isJ ? '#818cf8' : isK ? '#34d399' : '#64748b'}">#${c.idx}${isI ? '(i底起)' : isJ ? '(j底止)' : isK ? '(k顶)' : ''}</text>
          </g>
        `;
      })
      .join('');

    container.className = 'interval-dp-sandbox-container';
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 12px; background: rgba(15, 23, 42, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); font-family: ui-sans-serif, system-ui, sans-serif; box-sizing: border-box;';
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; width: 100%; height: 100%; align-items: stretch; box-sizing: border-box;">
        <!-- 左侧：凸多边形几何剖分画布 -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; position: relative; box-sizing: border-box;">
          <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid rgba(30, 41, 59, 0.8); font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 50%; background: rgba(99, 102, 241, 0.2); color: #818cf8; font-weight: bold;">📐</span>
              <span style="font-weight: bold; color: #e2e8f0;">凸多边形几何沙盘 (n=${n} 顶点)</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #94a3b8;">
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #38bdf8;"></span> i:${i}
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #34d399;"></span> k:${k >= 0 ? k : '—'}
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #818cf8;"></span> j:${j}
            </div>
          </div>

          <div style="width: 100%; flex: 1; display: flex; align-items: center; justify-content: center; margin: 4px 0; position: relative;">
            <svg viewBox="0 0 ${svgW} ${svgH}" style="width: 100%; max-width: 340px; max-height: 260px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
              <polygon points="${polygonPoints}" fill="#0f172a" stroke="#334155" stroke-width="2" />
              ${triangleSvg}
              ${verticesSvg}
            </svg>
          </div>

          <div style="width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding-top: 8px; border-top: 1px solid rgba(30, 41, 59, 0.6); text-align: center; font-size: 12px;">
            <div style="padding: 6px; border-radius: 6px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(14, 165, 233, 0.3);">
              <div style="font-size: 10px; color: #94a3b8;">底边起点 (i)</div>
              <div style="font-weight: bold; color: #38bdf8; font-size: 14px;">#${i} (值 ${values[i]})</div>
            </div>
            <div style="padding: 6px; border-radius: 6px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(16, 185, 129, 0.3);">
              <div style="font-size: 10px; color: #94a3b8;">剖分顶点 (k)</div>
              <div style="font-weight: bold; color: #34d399; font-size: 14px;">${k >= 0 ? `#${k} (值 ${values[k]})` : '边界无分割'}</div>
            </div>
            <div style="padding: 6px; border-radius: 6px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(99, 102, 241, 0.3);">
              <div style="font-size: 10px; color: #94a3b8;">底边终点 (j)</div>
              <div style="font-weight: bold; color: #818cf8; font-size: 14px;">#${j} (值 ${values[j]})</div>
            </div>
          </div>
        </div>

        <!-- 右侧：三角剖分乘积与区间状态决策舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(30, 41, 59, 0.8); padding-bottom: 8px;">
            <div style="font-weight: bold; color: #e2e8f0; font-size: 12px; display: flex; align-items: gap: 6px;">
              <span>📊</span> 子多边形 [${i}..${j}] 剖分决策
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #1e1b4b; color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.5);">
              跨度 len=${j - i + 1}
            </span>
          </div>

          <!-- 三段式得分拆解卡片 -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            <div style="padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b;">
              <div style="display: flex; justify-content: space-between; align-items: center; color: #94a3b8; margin-bottom: 4px;">
                <span>1. 左子多边形 dp[${i}][${k}]</span>
                <span style="font-weight: bold; color: #7dd3fc; font-size: 14px;">${leftScore}</span>
              </div>
              <div style="font-size: 11px; color: #64748b;">子多边形 [${i}..${k}] 的最低三角剖分累加得分</div>
            </div>

            <div style="padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b;">
              <div style="display: flex; justify-content: space-between; align-items: center; color: #94a3b8; margin-bottom: 4px;">
                <span>2. 右子多边形 dp[${k}][${j}]</span>
                <span style="font-weight: bold; color: #6ee7b7; font-size: 14px;">${rightScore}</span>
              </div>
              <div style="font-size: 11px; color: #64748b;">子多边形 [${k}..${j}] 的最低三角剖分累加得分</div>
            </div>

            <div style="padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b;">
              <div style="display: flex; justify-content: space-between; align-items: center; color: #94a3b8; margin-bottom: 4px;">
                <span>3. 中间三角形 (${i}, ${k}, ${j})</span>
                <span style="font-weight: bold; color: #fcd34d; font-size: 14px;">${values[i]} × ${k >= 0 ? values[k] : 0} × ${values[j]} = ${triScore}</span>
              </div>
              <div style="font-size: 11px; color: #64748b;">固定底边与顶点 k 构成的三角形顶点权值乘积</div>
            </div>

            <!-- 当前合计与最优记录 -->
            <div style="padding: 12px; border-radius: 8px; background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #34d399; font-weight: bold;">当前最优最低得分 dp[${i}][${j}]</div>
                <div style="font-size: 11px; color: #cbd5e1;">min { dp[i][k] + dp[k][j] + v[i]*v[k]*v[j] }</div>
              </div>
              <div style="font-size: 20px; font-weight: 900; color: #34d399; font-family: ui-monospace, monospace;">${bestScore}</div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 6px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.5;">
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

        let cardStyle = 'border: 2px solid #475569; background: rgba(30, 41, 59, 0.9); color: #e2e8f0;';
        let badgeHtml = '';

        if (isTaken) {
          cardStyle = 'border: 2px solid #1e293b; background: rgba(2, 6, 23, 0.6); opacity: 0.3; filter: grayscale(1);';
        } else if (isLeft && isRight) {
          cardStyle = 'border: 2px solid #c084fc; background: rgba(59, 7, 100, 0.5); box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.2); transform: scale(1.05);';
          badgeHtml = '<div style="position: absolute; top: -10px; padding: 2px 6px; border-radius: 9999px; background: #a855f7; color: #ffffff; font-size: 9px; font-weight: bold; white-space: nowrap;">最后单牌</div>';
        } else if (isLeft) {
          cardStyle = 'border: 2px solid #38bdf8; background: rgba(8, 47, 73, 0.5); box-shadow: 0 10px 15px -3px rgba(56, 189, 248, 0.2); transform: scale(1.05);';
          badgeHtml = '<div style="position: absolute; top: -10px; padding: 2px 6px; border-radius: 9999px; background: #0284c7; color: #ffffff; font-size: 9px; font-weight: bold; white-space: nowrap;">👈 选左端</div>';
        } else if (isRight) {
          cardStyle = 'border: 2px solid #fbbf24; background: rgba(69, 26, 3, 0.5); box-shadow: 0 10px 15px -3px rgba(251, 191, 36, 0.2); transform: scale(1.05);';
          badgeHtml = '<div style="position: absolute; top: -10px; padding: 2px 6px; border-radius: 9999px; background: #d97706; color: #ffffff; font-size: 9px; font-weight: bold; white-space: nowrap;">👉 选右端</div>';
        }

        return `
          <div style="position: relative; display: flex; flex-direction: column; justify-content: space-between; width: 72px; height: 116px; border-radius: 12px; padding: 10px; box-sizing: border-box; transition: all 0.2s; ${cardStyle}">
            ${badgeHtml}
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-family: monospace;">
              <span style="color: ${isRedSuit ? '#fb7185' : '#cbd5e1'}; font-weight: bold;">${suit}</span>
              <span style="font-size: 10px; color: #64748b;">#${idx}</span>
            </div>
            <div style="text-align: center; font-weight: 900; font-size: 28px; font-family: monospace; color: #f8fafc;">
              ${num}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8;">
              <span>牌面</span>
              <span style="color: ${isRedSuit ? '#fb7185' : '#cbd5e1'};">${suit}</span>
            </div>
          </div>
        `;
      })
      .join('');

    container.className = 'interval-dp-sandbox-container';
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 12px; background: rgba(15, 23, 42, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); font-family: ui-sans-serif, system-ui, sans-serif; box-sizing: border-box;';
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; width: 100%; height: 100%; align-items: stretch; box-sizing: border-box;">
        <!-- 左侧：桌面纸牌陈列排布 -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; box-sizing: border-box;">
          <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid #1e293b; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #fbbf24; font-weight: bold; font-size: 16px;">🃏</span>
              <span style="font-weight: bold; color: #e2e8f0;">桌面连续纸牌博弈沙盘 (共 ${n} 张牌)</span>
            </div>
            <span style="font-size: 11px; color: #94a3b8; font-family: monospace;">当前有效牌堆: [${i}..${j}]</span>
          </div>

          <div style="width: 100%; flex: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; margin: 16px 0; padding: 0 8px;">
            ${cardsHtml}
          </div>

          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(30, 41, 59, 0.8); display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
            <span style="color: #94a3b8;">两端端点可抽纸牌：</span>
            <div style="display: flex; gap: 16px; font-family: monospace; font-weight: bold;">
              <span style="color: #38bdf8;">左端 nums[${i}] = ${chooseLeftVal}</span>
              <span style="color: #fbbf24;">右端 nums[${j}] = ${chooseRightVal}</span>
            </div>
          </div>
        </div>

        <!-- 右侧：极小化极大决策与净胜分推导 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: bold; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>⚖️</span> 零和博弈极小化极大决策舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #172554; color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.5);">
              dp[${i}][${j}]
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            <!-- 方案 A: 拿走左牌 -->
            <div style="padding: 10px; border-radius: 8px; ${gainLeft >= gainRight ? 'background: rgba(8, 47, 73, 0.4); border: 1px solid rgba(56, 189, 248, 0.5);' : 'background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b;'}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: bold; color: #38bdf8;">👈 抉择 1: 拿走左端牌 nums[${i}]</span>
                <span style="font-family: monospace; font-weight: bold; font-size: 14px; color: #7dd3fc;">${gainLeft >= 0 ? '+' : ''}${gainLeft}</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">
                自身得 ${chooseLeftVal} - 对手后手净胜 dp[${i + 1}][${j}](${nextLeftOpponent}) = ${gainLeft}
              </div>
            </div>

            <!-- 方案 B: 拿走右牌 -->
            <div style="padding: 10px; border-radius: 8px; ${gainRight >= gainLeft ? 'background: rgba(69, 26, 3, 0.4); border: 1px solid rgba(245, 158, 11, 0.5);' : 'background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b;'}">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: bold; color: #fbbf24;">👉 抉择 2: 拿走右端牌 nums[${j}]</span>
                <span style="font-family: monospace; font-weight: bold; font-size: 14px; color: #fcd34d;">${gainRight >= 0 ? '+' : ''}${gainRight}</span>
              </div>
              <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">
                自身得 ${chooseRightVal} - 对手后手净胜 dp[${i}][${j - 1}](${nextRightOpponent}) = ${gainRight}
              </div>
            </div>

            <!-- 最优决策与当前净胜分 -->
            <div style="padding: 12px; border-radius: 8px; ${(recordedDp as number) >= 0 ? 'background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(16, 185, 129, 0.4);' : 'background: rgba(76, 5, 25, 0.4); border: 1px solid rgba(244, 63, 94, 0.4);'} display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: ${(recordedDp as number) >= 0 ? '#34d399' : '#fb7185'}; font-weight: bold;">
                  当前最优行动净胜分 dp[${i}][${j}]
                </div>
                <div style="font-size: 11px; color: #cbd5e1;">
                  ${(recordedDp as number) >= 0 ? '🟢 先手优势 (必胜态)' : '🔴 先手劣势 (必败态)'}
                </div>
              </div>
              <div style="font-size: 20px; font-weight: 900; color: ${(recordedDp as number) >= 0 ? '#34d399' : '#fb7185'}; font-family: monospace;">
                ${(recordedDp as number) >= 0 ? '+' : ''}${recordedDp}
              </div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 6px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.5;">
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
        let balloonBoxStyle = 'border: 2px solid #475569; background: rgba(15, 23, 42, 0.8);';

        if (isVirtual) {
          balloonBoxStyle = 'border: 2px solid #475569; background: #1e293b; color: #cbd5e1;';
          stateBadge = '<div style="font-size: 9px; color: #94a3b8; font-weight: bold;">虚拟边界</div>';
        } else if (isTarget) {
          balloonBoxStyle = 'border: 2px solid #fbbf24; background: rgba(69, 26, 3, 0.6); box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);';
          stateBadge = '<div style="font-size: 9px; color: #fbbf24; font-weight: bold;">🎯 最后戳破</div>';
        } else if (idx > i && idx < j) {
          balloonBoxStyle = 'border: 2px solid #475569; background: #0f172a; color: #e2e8f0;';
          stateBadge = '<div style="font-size: 9px; color: #64748b;">区间待戳</div>';
        } else {
          balloonBoxStyle = 'border: 2px solid #1e293b; background: rgba(2, 6, 23, 0.4); opacity: 0.4;';
          stateBadge = '<div style="font-size: 9px; color: #475569;">已戳/界外</div>';
        }

        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; ${isTarget ? 'transform: scale(1.1);' : ''} transition: all 0.2s;">
            ${stateBadge}
            <!-- 拟物气球球体 -->
            <div style="position: relative; width: 56px; height: 72px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; ${balloonBoxStyle}">
              <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">#${idx}</div>
              <div style="font-size: 22px; font-weight: 900; font-family: monospace; color: ${color};">
                ${v}
              </div>
              <!-- 气球气嘴与线绳 -->
              <div style="position: absolute; bottom: -6px; width: 8px; height: 6px; border-radius: 2px; background: #64748b;"></div>
              <div style="position: absolute; bottom: -18px; width: 2px; height: 12px; background: #475569;"></div>
            </div>
            <div style="font-size: 10px; font-family: monospace; ${isLeftWall ? 'color: #38bdf8; font-weight: bold;' : isRightWall ? 'color: #818cf8; font-weight: bold;' : 'color: #64748b;'}">
              ${isLeftWall ? '← i (左壁)' : isRightWall ? 'j (右壁) →' : `#${idx}`}
            </div>
          </div>
        `;
      })
      .join('');

    container.className = 'interval-dp-sandbox-container';
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 12px; background: rgba(15, 23, 42, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); font-family: ui-sans-serif, system-ui, sans-serif; box-sizing: border-box;';
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; width: 100%; height: 100%; align-items: stretch; box-sizing: border-box;">
        <!-- 左侧：气球陈列与靶心沙盘 -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; box-sizing: border-box;">
          <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid #1e293b; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #f43f5e; font-weight: bold; font-size: 16px;">🎈</span>
              <span style="font-weight: bold; color: #e2e8f0;">气球陈列架沙盘 (开区间 (${i}, ${j}))</span>
            </div>
            <span style="font-size: 11px; color: #94a3b8; font-family: monospace;">开区间跨度 len=${j - i}</span>
          </div>

          <div style="width: 100%; flex: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 14px; margin: 16px 0; padding: 0 8px;">
            ${balloonsHtml}
          </div>

          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
            <span style="color: #94a3b8;">相邻紧贴边界计算：</span>
            <div style="font-family: monospace; font-weight: bold; color: #fbbf24;">
              val[${i}](${val[i]}) × val[${k}](${k >= 0 ? val[k] : '?'}) × val[${j}](${val[j]}) = ${gain}
            </div>
          </div>
        </div>

        <!-- 右侧：逆向思维金币收益推导 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: bold; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🪙</span> 金币收益演算舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #451a03; color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.5);">
              dp[${i}][${j}]
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            <div style="padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b;">
              <div style="display: flex; justify-content: space-between; align-items: center; color: #94a3b8; margin-bottom: 4px;">
                <span>左子开区间 dp[${i}][${k}]</span>
                <span style="font-weight: bold; color: #7dd3fc; font-size: 14px; font-family: monospace;">${leftCoins}</span>
              </div>
              <div style="font-size: 11px; color: #64748b;">区间 (${i}, ${k}) 内部所有气球全部戳破的金币收益</div>
            </div>

            <div style="padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b;">
              <div style="display: flex; justify-content: space-between; align-items: center; color: #94a3b8; margin-bottom: 4px;">
                <span>右子开区间 dp[${k}][${j}]</span>
                <span style="font-weight: bold; color: #6ee7b7; font-size: 14px; font-family: monospace;">${rightCoins}</span>
              </div>
              <div style="font-size: 11px; color: #64748b;">区间 (${k}, ${j}) 内部所有气球全部戳破的金币收益</div>
            </div>

            <div style="padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b;">
              <div style="display: flex; justify-content: space-between; align-items: center; color: #94a3b8; margin-bottom: 4px;">
                <span>最后戳破气球 #${k} 自身即时金币</span>
                <span style="font-weight: bold; color: #fcd34d; font-size: 14px; font-family: monospace;">${gain}</span>
              </div>
              <div style="font-size: 11px; color: #64748b;">由于其左右气球已全破，此时其相邻气球必为边界 ${i} 与 ${j}</div>
            </div>

            <div style="padding: 12px; border-radius: 8px; background: rgba(69, 26, 3, 0.4); border: 1px solid rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #fbbf24; font-weight: bold;">开区间 (${i}, ${j}) 最大金币 dp[${i}][${j}]</div>
                <div style="font-size: 11px; color: #cbd5e1;">max { dp[i][k] + dp[k][j] + val[i]*val[k]*val[j] }</div>
              </div>
              <div style="font-size: 20px; font-weight: 900; color: #fbbf24; font-family: monospace;">${bestCoins}</div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 6px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.5;">
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

        let ribbonBoxStyle = 'border: 2px solid #475569; background: rgba(15, 23, 42, 0.7); color: #94a3b8;';
        let badgeHtml = '';

        if (!inSub) {
          ribbonBoxStyle = 'border: 2px solid #1e293b; background: rgba(2, 6, 23, 0.4); opacity: 0.3;';
        } else if (isI && isJ) {
          ribbonBoxStyle = 'border: 2px solid #10b981; background: rgba(6, 78, 59, 0.5); box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);';
          badgeHtml = '<div style="position: absolute; top: -12px; font-size: 8px; font-weight: bold; color: #34d399; white-space: nowrap;">单字符</div>';
        } else if (isI) {
          ribbonBoxStyle = 'border: 2px solid #38bdf8; background: rgba(8, 47, 73, 0.5); box-shadow: 0 4px 6px -1px rgba(56, 189, 248, 0.2);';
          badgeHtml = '<div style="position: absolute; top: -12px; font-size: 8px; font-weight: bold; color: #38bdf8; white-space: nowrap;">首端 i</div>';
        } else if (isJ) {
          ribbonBoxStyle = isSameEnd ? 'border: 2px solid #38bdf8; background: rgba(8, 47, 73, 0.5); box-shadow: 0 4px 6px -1px rgba(56, 189, 248, 0.2);' : 'border: 2px solid #fbbf24; background: rgba(69, 26, 3, 0.5);';
          badgeHtml = `<div style="position: absolute; top: -12px; font-size: 8px; font-weight: bold; color: ${isSameEnd ? '#38bdf8' : '#fbbf24'}; white-space: nowrap;">尾端 j</div>`;
        } else {
          ribbonBoxStyle = 'border: 2px solid #475569; background: rgba(30, 41, 59, 0.8); color: #e2e8f0;';
        }

        return `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between; width: 48px; height: 68px; border-radius: 8px; padding: 6px; box-sizing: border-box; ${ribbonBoxStyle}">
            ${badgeHtml}
            <div style="font-size: 9px; color: #94a3b8; font-family: monospace;">#${idx}</div>
            <div style="font-size: 22px; font-weight: 900; font-family: monospace; color: ${color};">
              ${ch}
            </div>
            <div style="width: 100%; height: 4px; border-radius: 9999px; background-color: ${color};"></div>
          </div>
        `;
      })
      .join('');

    container.className = 'interval-dp-sandbox-container';
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 12px; background: rgba(15, 23, 42, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); font-family: ui-sans-serif, system-ui, sans-serif; box-sizing: border-box;';
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; width: 100%; height: 100%; align-items: stretch; box-sizing: border-box;">
        <!-- 左侧：打印机色带与喷头沙盘 -->
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; box-sizing: border-box;">
          <div style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid #1e293b; font-size: 12px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #38bdf8; font-weight: bold; font-size: 16px;">🖨️</span>
              <span style="font-weight: bold; color: #e2e8f0;">奇怪的打印机色带轨迹 (子串: "${s.slice(i, j + 1)}")</span>
            </div>
            <span style="font-size: 11px; color: #94a3b8; font-family: monospace;">区间 [${i}..${j}] (长度 ${j - i + 1})</span>
          </div>

          <div style="width: 100%; flex: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; margin: 16px 0; padding: 0 8px;">
            ${ribbonHtml}
          </div>

          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-family: monospace;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8;">两端字符比较：</span>
              <span style="color: #38bdf8; font-weight: bold;">s[${i}] = '${charI}'</span>
              <span style="color: #94a3b8;">${isSameEnd ? '==' : '!='}</span>
              <span style="color: ${isSameEnd ? '#38bdf8' : '#fbbf24'}; font-weight: bold;">s[${j}] = '${charJ}'</span>
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; ${isSameEnd ? 'background: #082f49; color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.4);' : 'background: #451a03; color: #fcd34d; border: 1px solid rgba(245, 158, 11, 0.4);'}">
              ${isSameEnd ? '✨ 首尾同色顺带覆盖' : '🔀 需切分点 k 分段刷漆'}
            </span>
          </div>
        </div>

        <!-- 右侧：涂色策略与贪心抵消监视器 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: bold; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🎨</span> 涂色策略与抵消决策舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #064e3b; color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5);">
              dp[${i}][${j}]
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            ${
              isSameEnd
                ? `
              <div style="padding: 12px; border-radius: 8px; background: rgba(8, 47, 73, 0.4); border: 1px solid rgba(56, 189, 248, 0.5); display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-weight: bold; color: #7dd3fc;">✨ 首尾相同优化：dp[i][j] = dp[i][j - 1]</span>
                  <span style="font-size: 16px; font-weight: bold; font-family: monospace; color: #38bdf8;">${bestTurns} 次</span>
                </div>
                <div style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
                  打印首字符 <code>'${charI}'</code> 时，可贪心顺带一口气刷到尾部 <code>j</code>，尾部字符自然成型，后续子串涂色只需覆盖中间杂色部分，<strong>操作次数完全无需增加</strong>！
                </div>
              </div>
            `
                : `
              <div style="padding: 12px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-weight: bold; color: #fcd34d;">🔀 枚举最优切分点 k ∈ [${i}..${j - 1}]</span>
                  <span style="font-size: 16px; font-weight: bold; font-family: monospace; color: #fbbf24;">${bestTurns} 次</span>
                </div>
                <div style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
                  首尾字符不同无法顺带涂刷，必须在某个切分点 <code>k</code> 处换色：<br/>
                  <code>dp[i][j] = min { dp[i][k] + dp[k + 1][j] }</code>
                </div>
              </div>
            `
            }

            <div style="padding: 12px; border-radius: 8px; background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #34d399; font-weight: bold;">子串 s[${i}..${j}] 最少打印次数</div>
                <div style="font-size: 11px; color: #cbd5e1; font-family: monospace;">"${s.slice(i, j + 1)}" 完美成型</div>
              </div>
              <div style="font-size: 20px; font-weight: 900; color: #34d399; font-family: monospace;">${bestTurns}</div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 6px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.5;">
            💡 <strong>奇怪打印机的物理特质</strong>：打印机每次只能用同一种颜色打印连续的一整段字符，后打印的颜色会覆盖之前打印的颜色。首尾相同顺带覆盖是区间 DP 的关键剪枝点。
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // 5. 合并石头的最低成本 (merge-stones · LC 1000 / Class 077 Code 01)
  // ==========================================================================
  private static renderMergeStones(
    container: HTMLElement,
    step: UniversalStep,
    options: Partial<StateSpacePresentationOptions>
  ): void {
    const rawStones = (options.params?.stones || (Array.isArray(step.dp1d) ? step.dp1d : [3, 2, 4, 1])) as number[];
    const stones = Array.isArray(rawStones) && rawStones.length >= 2 ? rawStones : [3, 2, 4, 1];
    const n = stones.length;

    const i = typeof step.i === 'number' ? Math.max(0, Math.min(step.i, n - 1)) : 0;
    const j = typeof step.j === 'number' ? Math.max(i, Math.min(step.j, n - 1)) : n - 1;
    const grid = step.grid as (number | null)[][] | undefined;

    // 前缀和数组
    const sum = new Array(n + 1).fill(0);
    for (let idx = 0; idx < n; idx++) sum[idx + 1] = sum[idx] + stones[idx];

    // 解析当前切分点 k
    let k = -1;
    if (step.deps && step.deps.length > 0) {
      const depK = step.deps.find((d) => d.r === i && d.c >= i && d.c < j);
      if (depK) k = depK.c;
    }
    if (k === -1 && typeof step.decision === 'string') {
      const match = step.decision.match(/k\s*=\s*(\d+)/i);
      if (match) k = parseInt(match[1], 10);
    }
    if (k === -1 && typeof step.tag === 'string') {
      const match = step.tag.match(/k\s*=\s*(\d+)/i);
      if (match) k = parseInt(match[1], 10);
    }
    if (k === -1 && j > i) {
      k = i;
    }

    const leftCost = k >= i && grid ? (grid[i]?.[k] ?? 0) : 0;
    const rightCost = k >= i && k < j && grid ? (grid[k + 1]?.[j] ?? 0) : 0;
    const subCost = leftCost + rightCost;
    const totalWeight = sum[j + 1] - sum[i];

    let recordedDp = grid ? grid[i]?.[j] : null;
    if (recordedDp === null && i === j) recordedDp = 0;
    const finalCost = recordedDp !== null ? recordedDp : (j > i ? subCost + totalWeight : 0);

    const maxStoneWeight = Math.max(...stones, 1);

    // 构建石子堆陈列
    const pilesHtml = stones
      .map((val, idx) => {
        const isOutOfInterval = idx < i || idx > j;
        const isLeftPart = idx >= i && idx <= k;
        const isRightPart = idx > k && idx <= j;
        const isSinglePebble = i === j && idx === i;

        // 根据重量计算柱高/堆高 (40px ~ 85px)
        const heightPx = Math.max(45, Math.round((val / maxStoneWeight) * 85));

        let cardStyle = 'border: 1px solid #1e293b; background: rgba(15, 23, 42, 0.4); color: #64748b; opacity: 0.3;';
        let pebbleBg = 'linear-gradient(to top, #1e293b, #334155)';

        if (isSinglePebble) {
          cardStyle = 'border: 2px solid #10b981; background: rgba(6, 78, 59, 0.6); color: #a7f3d0; box-shadow: 0 10px 15px -3px rgba(6, 78, 59, 0.5);';
          pebbleBg = 'linear-gradient(to top, #065f46, #059669)';
        } else if (isLeftPart) {
          cardStyle = 'border: 2px solid #0284c7; background: rgba(8, 47, 73, 0.5); color: #bae6fd; box-shadow: 0 4px 6px -1px rgba(8, 47, 73, 0.4);';
          pebbleBg = 'linear-gradient(to top, #0369a1, #0284c7)';
        } else if (isRightPart) {
          cardStyle = 'border: 2px solid #d97706; background: rgba(69, 26, 3, 0.5); color: #fde68a; box-shadow: 0 4px 6px -1px rgba(69, 26, 3, 0.4);';
          pebbleBg = 'linear-gradient(to top, #b45309, #d97706)';
        }

        const dividerHtml =
          idx === k && k < j
            ? `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 4px; color: #fb7185; z-index: 10;">
            <span style="font-size: 12px;">🪓</span>
            <div style="width: 2px; height: 64px; background: linear-gradient(to bottom, #f43f5e, #fb7185, transparent);"></div>
            <span style="font-size: 9px; font-family: monospace; font-weight: bold; color: #fda4af; margin-top: 2px;">k=${k}</span>
          </div>
        `
            : '';

        return `
          <div style="display: flex; align-items: center;">
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="width: 56px; height: 110px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding: 8px; box-sizing: border-box; transition: all 0.3s; position: relative; ${cardStyle}">
                <!-- 顶部重量标识 -->
                <div style="font-size: 12px; font-weight: 900; font-family: monospace; margin-bottom: 6px; display: flex; align-items: center; gap: 2px;">
                  <span>${val}</span>
                  <span style="font-size: 9px; font-weight: normal; opacity: 0.7;">kg</span>
                </div>
                <!-- 拟物石子堆立面 -->
                <div style="width: 100%; height: ${heightPx}px; border-radius: 8px; background: ${pebbleBg}; border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">
                  <span style="font-size: 12px; opacity: 0.75;">🪨</span>
                </div>
              </div>
              <span style="font-size: 10px; font-family: monospace; margin-top: 4px; font-weight: bold; color: ${isOutOfInterval ? '#475569' : '#cbd5e1'};">
                #${idx}
              </span>
            </div>
            ${dividerHtml}
          </div>
        `;
      })
      .join('');

    container.className = 'interval-dp-sandbox-container';
    container.style.cssText = 'width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: flex-start; padding: 12px; background: rgba(2, 6, 23, 0.95); color: #f1f5f9; border-radius: 12px; overflow-y: auto; border: 1px solid rgba(51, 65, 85, 0.6); box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); font-family: ui-sans-serif, system-ui, sans-serif; box-sizing: border-box;';
    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; align-items: stretch; box-sizing: border-box;">
        <!-- 左侧：石子堆序列陈列沙盘 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(15, 23, 42, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 12px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: bold; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>🪨</span> 石子堆序列陈列沙盘 (Stone Piles & Interval Slice)
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #082f49; color: #7dd3fc; border: 1px solid rgba(14, 165, 233, 0.5);">
                区间 [${i}..${j}]
              </span>
              ${
                j > i && k >= i
                  ? `<span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #4c0519; color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.5);">切分点 k=${k}</span>`
                  : ''
              }
            </div>
          </div>

          <!-- 石子堆陈列舞台 -->
          <div style="width: 100%; flex: 1; display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px; margin: 8px 0; padding: 0 8px;">
            ${pilesHtml}
          </div>

          <!-- 区间重量指示条 -->
          <div style="width: 100%; padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-family: monospace;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #94a3b8;">区间石子总重：</span>
              <span style="color: #34d399; font-weight: bold;">sum[${j + 1}] - sum[${i}] = ${totalWeight} kg</span>
            </div>
            ${
              j > i && k >= i
                ? `
              <div style="display: flex; gap: 12px; font-size: 11px;">
                <span style="color: #38bdf8; font-weight: bold;">左段 [${i}..${k}]</span>
                <span style="color: #64748b;">|</span>
                <span style="color: #fbbf24; font-weight: bold;">右段 [${k + 1}..${j}]</span>
              </div>
            `
                : '<span style="color: #34d399; font-size: 11px;">单堆基底无需合并 (成本 0)</span>'
            }
          </div>
        </div>

        <!-- 右侧：合并成本与前缀和演算舱 -->
        <div style="display: flex; flex-direction: column; justify-content: space-between; background: rgba(2, 6, 23, 0.6); border-radius: 12px; padding: 12px; border: 1px solid #1e293b; gap: 10px; box-sizing: border-box;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
            <div style="font-weight: bold; color: #e2e8f0; font-size: 12px; display: flex; align-items: center; gap: 6px;">
              <span>⚡</span> 合并成本与前缀和演算舱
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; background: #064e3b; color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.5);">
              dp[${i}][${j}]
            </span>
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 8px; font-size: 12px;">
            ${
              j === i
                ? `
              <div style="padding: 12px; border-radius: 8px; background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(16, 185, 129, 0.5); display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <span style="font-weight: bold; color: #6ee7b7;">🏁 单堆基底状态：dp[${i}][${i}] = 0</span>
                  <span style="font-size: 16px; font-weight: bold; font-family: monospace; color: #34d399;">0 成本</span>
                </div>
                <div style="font-size: 11px; color: #cbd5e1; line-height: 1.5;">
                  单堆石子已经属于同一堆，完全不需要执行任何合并操作，合并基础开销为 <strong>0</strong>。
                </div>
              </div>
            `
                : `
              <!-- 左子区间成本 -->
              <div style="padding: 10px; border-radius: 8px; background: rgba(8, 47, 73, 0.4); border: 1px solid rgba(56, 189, 248, 0.4); display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; font-weight: bold;">👈 左子段合并成本 dp[${i}][${k}]</div>
                  <div style="font-size: 11px; color: #cbd5e1; font-family: monospace;">石子 #${i} 到 #${k} 先行合并</div>
                </div>
                <div style="font-size: 18px; font-weight: bold; color: #7dd3fc; font-family: monospace;">${leftCost}</div>
              </div>

              <!-- 右子区间成本 -->
              <div style="padding: 10px; border-radius: 8px; background: rgba(69, 26, 3, 0.4); border: 1px solid rgba(245, 158, 11, 0.4); display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #fbbf24; font-weight: bold;">👉 右子段合并成本 dp[${k + 1}][${j}]</div>
                  <div style="font-size: 11px; color: #cbd5e1; font-family: monospace;">石子 #${k + 1} 到 #${j} 先行合并</div>
                </div>
                <div style="font-size: 18px; font-weight: bold; color: #fcd34d; font-family: monospace;">${rightCost}</div>
              </div>

              <!-- 物理质量守恒与本次合并代价 -->
              <div style="padding: 10px; border-radius: 8px; background: rgba(15, 23, 42, 0.9); border: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-weight: bold;">🧮 最终大合并代价 (总重量)</div>
                  <div style="font-size: 11px; color: #94a3b8; font-family: monospace;">sum[${j + 1}] - sum[${i}]</div>
                </div>
                <div style="font-size: 18px; font-weight: bold; color: #e2e8f0; font-family: monospace;">+${totalWeight}</div>
              </div>
            `
            }

            <!-- 最终合并总成本 -->
            <div style="padding: 12px; border-radius: 8px; background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: space-between;">
              <div>
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #34d399; font-weight: bold;">区间 [${i}..${j}] 归约合并总成本</div>
                <div style="font-size: 11px; color: #cbd5e1; font-family: monospace;">
                  ${j === i ? '无需合并' : `子成本(${leftCost} + ${rightCost}) + 重量(${totalWeight})`}
                </div>
              </div>
              <div style="font-size: 20px; font-weight: 900; color: #34d399; font-family: monospace;">${finalCost}</div>
            </div>
          </div>

          <div style="font-size: 11px; color: #94a3b8; padding: 8px; border-radius: 6px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(30, 41, 59, 0.8); line-height: 1.5;">
            💡 <strong>物理质量守恒与区间 DP</strong>：无论以何种顺序将区间内的石子最终合为一堆，最后一次两堆大合并所付出的成本必为整个区间石子重量的总和 <code>sum[i..j]</code>。因此问题精确归约为枚举最后一次合并的切分点 <code>k</code>。
          </div>
        </div>
      </div>
    `;
  }
}
