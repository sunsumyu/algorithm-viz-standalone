/**
 * 分发糖果可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 135：双向两次贪心（左向右 + 右向左取 max），求最少分发糖果数
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  CANDY_PROBLEM_HTML,
  CANDY_ANALYSIS_HTML,
  CANDY_CODE_LANGUAGES,
} from './candy-problem-content';
import template from './candy.html?raw';

export interface CandyStep {
  ratings: number[];
  candies: number[];
  currentIndex: number;
  direction: 'left-to-right' | 'right-to-left' | 'init' | 'done';
  action: 'init' | 'inc_right' | 'keep_right' | 'inc_left' | 'keep_left' | 'done';
  message: string;
  codeLine: number;
}

export function buildCandySteps(rawRatings: number[]): CandyStep[] {
  const steps: CandyStep[] = [];
  const n = rawRatings.length;

  if (n === 0) {
    steps.push({
      ratings: [],
      candies: [],
      currentIndex: -1,
      direction: 'done',
      action: 'done',
      message: '输入为空，最少糖果数为 0',
      codeLine: 2,
    });
    return steps;
  }

  const candies = new Array(n).fill(1);

  steps.push({
    ratings: [...rawRatings],
    candies: [...candies],
    currentIndex: -1,
    direction: 'init',
    action: 'init',
    message: `第 1 步：初始化全部 ${n} 个孩子糖果数为 1 (每人至少 1 颗)`,
    codeLine: 3,
  });

  // 1. 从左向右遍历（右孩子评分 > 左孩子评分）
  for (let i = 1; i < n; i++) {
    const prev = rawRatings[i - 1];
    const cur = rawRatings[i];

    if (cur > prev) {
      candies[i] = candies[i - 1] + 1;
      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'left-to-right',
        action: 'inc_right',
        message: `📈 [左 &rarr; 右] 孩子 [${i}] 评分 ${cur} > 左边 [${i - 1}] 评分 ${prev}，糖果递增为 ${candies[i]} (= ${candies[i - 1]} + 1)`,
        codeLine: 7,
      });
    } else {
      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'left-to-right',
        action: 'keep_right',
        message: `⏩ [左 &rarr; 右] 孩子 [${i}] 评分 ${cur} &le; 左边 ${prev}，保持糖果数 ${candies[i]}`,
        codeLine: 6,
      });
    }
  }

  // 2. 从右向左遍历（左孩子评分 > 右孩子评分，取 max）
  for (let i = n - 2; i >= 0; i--) {
    const cur = rawRatings[i];
    const next = rawRatings[i + 1];

    if (cur > next) {
      const oldVal = candies[i];
      candies[i] = Math.max(candies[i], candies[i + 1] + 1);

      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'right-to-left',
        action: candies[i] > oldVal ? 'inc_left' : 'keep_left',
        message: `📉 [右 &rarr; 左] 孩子 [${i}] 评分 ${cur} > 右边 [${i + 1}] 评分 ${next}，糖果取 max(${oldVal}, ${candies[i + 1] + 1}) = ${candies[i]}`,
        codeLine: 13,
      });
    } else {
      steps.push({
        ratings: [...rawRatings],
        candies: [...candies],
        currentIndex: i,
        direction: 'right-to-left',
        action: 'keep_left',
        message: `⏩ [右 &rarr; 左] 孩子 [${i}] 评分 ${cur} &le; 右边 ${next}，保持糖果数 ${candies[i]}`,
        codeLine: 12,
      });
    }
  }

  const total = candies.reduce((acc, v) => acc + v, 0);

  steps.push({
    ratings: [...rawRatings],
    candies: [...candies],
    currentIndex: -1,
    direction: 'done',
    action: 'done',
    message: `🎉 分发完成！双向贪心满足所有相邻约束，所需最少糖果总数为 ${total} 颗：[${candies.join(', ')}]`,
    codeLine: 17,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class CandyVisualizer extends StepVisualizer<CandyStep> {
  protected codeLanguages = CANDY_CODE_LANGUAGES;
  protected codeLines = CANDY_CODE_LANGUAGES['java'];
  protected codePanelTitle = '分发糖果 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private childContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#cd-sandbox-container');
    this.childContainer = this.root.querySelector('#cd-child-container');
    this.decisionMonitorContainer = this.root.querySelector('#cd-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#cd-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.cd-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ratingsEl = this.root?.querySelector('#input-ratings') as HTMLInputElement | null;
        if (ratingsEl && btn.dataset.ratings) ratingsEl.value = btn.dataset.ratings;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: CANDY_PROBLEM_HTML,
      analysisHtml: CANDY_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): CandyStep[] {
    const ratingsEl = this.root?.querySelector('#input-ratings') as HTMLInputElement | null;
    const rawRatings = (ratingsEl?.value || '1,0,2')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    return buildCandySteps(rawRatings.length ? rawRatings : [1, 0, 2]);
  }

  protected renderStep(step: CandyStep): void {
    const ratings = step.ratings;
    const candies = step.candies;
    const n = ratings.length;

    // 1. 渲染评分与糖果堆叠沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const isDone = step.action === 'done';

      const childrenHtml = ratings
        .map((r, idx) => {
          const c = candies[idx] ?? 1;
          const isCurrent = idx === curIdx && !isDone;

          let bg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#0f172a';

          if (isCurrent) {
            bg = '#fef2f2';
            borderColor = '#ef4444';
            textColor = '#dc2626';
          }

          // 糖果堆叠小圆点
          const candyDots = Array.from({ length: Math.min(c, 6) })
            .map(() => `<span style="font-size: 10px;">🍬</span>`)
            .join('');

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <span style="font-size: 9px; color: ${isCurrent ? '#ef4444' : '#94a3b8'}; font-weight: 700;">
                ${isCurrent ? '📍 当前' : `[${idx}]`}
              </span>
              <div style="width: 52px; min-height: 58px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); gap: 2px;">
                <span style="font-size: 10px; color: #64748b;">评分: ${r}</span>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1px; max-width: 44px;">
                  ${candyDots}
                </div>
                <span style="font-size: 11px; color: #ef4444; font-weight: 800;">${c} 颗</span>
              </div>
            </div>
          `;
        })
        .join('');

      const totalSoFar = candies.reduce((acc, v) => acc + v, 0);

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 阶段提示与当前总糖果 -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>遍历阶段: <strong style="color: #ef4444;">${step.direction === 'left-to-right' ? '➡️ 从左到右 (右 > 左 递增)' : step.direction === 'right-to-left' ? '⬅️ 从右到左 (左 > 右 取 max)' : step.direction === 'done' ? '✓ 完成' : '初始化'}</strong></span>
            <span>当前糖果总数: <strong style="color: #ef4444; font-family: monospace; font-size: 12.5px;">${totalSoFar} 颗</strong></span>
          </div>
        </div>

        <!-- 孩子水平流 -->
        <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
          ${childrenHtml}
        </div>
      `;
    }

    // 2. 渲染当前孩子与相邻评分 (Card 2 Left)
    if (this.childContainer) {
      const idx = step.currentIndex;
      const curRating = idx >= 0 && idx < ratings.length ? ratings[idx] : null;

      this.childContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前扫描孩子:</span>
            <span style="font-family: monospace; font-weight:700; color: #ef4444;">
              ${idx >= 0 ? `[${idx}] (评分: ${curRating})` : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>该孩子当前糖果:</span>
            <span style="font-family: monospace; font-weight:700; color: #059669;">
              ${idx >= 0 ? `${candies[idx]} 颗` : '-'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染两次贪心判定监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isIncR = step.action === 'inc_right';
      const isIncL = step.action === 'inc_left';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>贪心判定:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isIncR || isIncL ? '#fef2f2' : '#eff6ff'}; color: ${isIncR || isIncL ? '#dc2626' : '#2563eb'}; border: 1px solid ${isIncR || isIncL ? '#fecaca' : '#bfdbfe'};">
              ${isIncR ? '📈 右孩子评分高 (+1 奖励)' : isIncL ? '📉 左孩子评分高 (取 max 奖励)' : '⏩ 评分不高于相邻 (保持)'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#ef4444; font-family:monospace;">左右两侧分开独立贪心，右向左取 max 兼顾两端</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最少糖果分配方案看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      const total = candies.reduce((acc, v) => acc + v, 0);
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>最少糖果总数: <strong style="color: #ef4444; font-family: monospace; font-size: 13.5px;">${total}</strong> 颗</span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">[${candies.join(', ')}]</span>
          </div>
        </div>
      `;
    }

    const badgeCandies = this.root?.querySelector('#badge-total-candies');
    if (badgeCandies) {
      const total = candies.reduce((acc, v) => acc + v, 0);
      badgeCandies.textContent = `总糖果: ${total} 颗`;
    }


    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '步骤';

        if (st.action === 'inc_right') {
          badgeColor = '#ef4444';
          badgeBg = '#fef2f2';
          badgeText = '左→右+1';
        } else if (st.action === 'inc_left') {
          badgeColor = '#d97706';
          badgeBg = '#fffbeb';
          badgeText = '右→左max';
        } else if (st.action === 'done') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '完成';
        }

        return `
          <div style="display: flex; align-items: flex-start; gap: 6px; padding: 3px 0; border-bottom: 1px solid #f8fafc; font-size: 11px;">
            <span style="color: #94a3b8; font-family: monospace; font-size: 10px; min-width: 24px;">#${idx + 1}</span>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 10px;">${badgeText}</span>
            <span style="color: #334155; flex: 1;">${st.message}</span>
          </div>
        `;
      });

      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.sandboxContainer) this.sandboxContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'candy',
  name: '分发糖果',
  viewId: 'algo-candy-view',
  category: 'greedy',
  description: '双向两次贪心遍历，左向右递增与右向左取 max 结合，求最少糖果数',
  icon: '🍬',
  template,
  Visualizer: CandyVisualizer,
  difficulty: 3,
  levelOrder: 13,
  learningGoal: '掌握双向两次贪心解题范式，学会将双边相邻约束拆解为单向独立推导',
});
