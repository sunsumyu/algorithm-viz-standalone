/**
 * K次取反后最大化的数组和可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 1005: 绝对值降序排序 + 负数优先翻转 + 剩余奇数次翻转最小绝对值
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  MAXIMIZE_SUM_K_PROBLEM_HTML,
  MAXIMIZE_SUM_K_ANALYSIS_HTML,
  MAXIMIZE_SUM_K_CODE_LANGUAGES,
} from './maximize-sum-k-problem-content';
import template from './maximize-sum-k.html?raw';

export interface MaxSumKStep {
  array: number[];
  currentIndex: number;
  remainingK: number;
  currentSum: number;
  flippedIndices: number[];
  action: 'init' | 'sort' | 'flip_negative' | 'skip_positive' | 'flip_smallest' | 'done';
  message: string;
  codeLine: number;
}

export function buildMaxSumKSteps(rawArr: number[], initialK: number): MaxSumKStep[] {
  const steps: MaxSumKStep[] = [];
  const n = rawArr.length;

  if (n === 0) {
    steps.push({
      array: [],
      currentIndex: -1,
      remainingK: initialK,
      currentSum: 0,
      flippedIndices: [],
      action: 'done',
      message: '数组为空，返回 0',
      codeLine: 2,
    });
    return steps;
  }

  // 1. 按照绝对值从大到小排序
  const arr = [...rawArr].sort((a, b) => Math.abs(b) - Math.abs(a));
  let k = initialK;
  let currentSum = arr.reduce((acc, v) => acc + v, 0);
  const flippedIndices: number[] = [];

  steps.push({
    array: [...arr],
    currentIndex: -1,
    remainingK: k,
    currentSum,
    flippedIndices: [],
    action: 'sort',
    message: `第 1 步：按绝对值降序排序完成：nums = [${arr.join(', ')}]，初始总和 = ${currentSum}，剩余 K = ${k}`,
    codeLine: 3,
  });

  // 2. 第一步贪心：遍历数组，遇到负数翻转为正数
  for (let i = 0; i < n; i++) {
    if (arr[i] < 0 && k > 0) {
      const oldVal = arr[i];
      arr[i] = -arr[i];
      k--;
      currentSum += 2 * arr[i]; // -oldVal 变为 +oldVal
      flippedIndices.push(i);

      steps.push({
        array: [...arr],
        currentIndex: i,
        remainingK: k,
        currentSum,
        flippedIndices: [...flippedIndices],
        action: 'flip_negative',
        message: `🔄 优先翻转绝对值大的负数：[${i}] 从 ${oldVal} &rarr; ${arr[i]}，和增加 ${2 * arr[i]}，剩余 K = ${k}`,
        codeLine: 8,
      });
    } else {
      steps.push({
        array: [...arr],
        currentIndex: i,
        remainingK: k,
        currentSum,
        flippedIndices: [...flippedIndices],
        action: 'skip_positive',
        message: `⏩ 下标 [${i}]=${arr[i]} 为非负数或 K 已耗尽，暂不翻转`,
        codeLine: 7,
      });
    }
  }

  // 3. 第二步贪心：如果 k 还有剩余且为奇数，翻转绝对值最小的元素 (arr[n - 1])
  if (k % 2 === 1) {
    const lastIdx = n - 1;
    const oldVal = arr[lastIdx];
    arr[lastIdx] = -arr[lastIdx];
    currentSum += 2 * arr[lastIdx];
    flippedIndices.push(lastIdx);

    steps.push({
      array: [...arr],
      currentIndex: lastIdx,
      remainingK: 0,
      currentSum,
      flippedIndices: [...flippedIndices],
      action: 'flip_smallest',
      message: `⚖️ 剩余 K=${k} 为奇数！翻转绝对值最小的尾部元素：[${lastIdx}] 从 ${oldVal} &rarr; ${arr[lastIdx]}，损失降至最低！`,
      codeLine: 13,
    });
  } else if (k > 0) {
    steps.push({
      array: [...arr],
      currentIndex: -1,
      remainingK: 0,
      currentSum,
      flippedIndices: [...flippedIndices],
      action: 'skip_positive',
      message: `⚖️ 剩余 K=${k} 为偶数！在同一元素上反复翻转两次即抵消，对总和无损害`,
      codeLine: 13,
    });
  }

  steps.push({
    array: [...arr],
    currentIndex: -1,
    remainingK: 0,
    currentSum,
    flippedIndices: [...flippedIndices],
    action: 'done',
    message: `🎉 贪心取反完成！修改后数组可能的最大和为 ${currentSum}`,
    codeLine: 15,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class MaximizeSumKVisualizer extends StepVisualizer<MaxSumKStep> {
  protected codeLanguages = MAXIMIZE_SUM_K_CODE_LANGUAGES;
  protected codeLines = MAXIMIZE_SUM_K_CODE_LANGUAGES['java'];
  protected codePanelTitle = 'K 次取反后最大化的数组和 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private kContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#mk-sandbox-container');
    this.kContainer = this.root.querySelector('#mk-k-container');
    this.decisionMonitorContainer = this.root.querySelector('#mk-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#mk-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 绑定运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 绑定 Scrubber 进度条
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 绑定前进后退按钮
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.mk-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;
        if (numsEl && btn.dataset.nums) numsEl.value = btn.dataset.nums;
        if (kEl && btn.dataset.k) kEl.value = btn.dataset.k;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: MAXIMIZE_SUM_K_PROBLEM_HTML,
      analysisHtml: MAXIMIZE_SUM_K_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MaxSumKStep[] {
    const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;

    const rawNums = (numsEl?.value || '2,-3,-1,5,-4')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const k = parseInt(kEl?.value || '2', 10);

    const nums = rawNums.length > 0 ? rawNums : [2, -3, -1, 5, -4];
    return buildMaxSumKSteps(nums, isNaN(k) ? 2 : k);
  }

  protected renderStep(step: MaxSumKStep): void {
    const arr = step.array;
    const n = arr.length;

    // 1. 渲染绝对值排序与取反沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const isDone = step.action === 'done';

      const cellsHtml = arr
        .map((val, idx) => {
          const isCurrent = idx === curIdx && !isDone;
          const isFlipped = step.flippedIndices.includes(idx);
          const isNegative = val < 0;

          let bg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#0f172a';

          if (isCurrent) {
            bg = '#fff1f2';
            borderColor = '#e11d48';
            textColor = '#e11d48';
          } else if (isFlipped) {
            bg = '#ecfdf5';
            borderColor = '#10b981';
            textColor = '#059669';
          } else if (isNegative) {
            bg = '#fef2f2';
            borderColor = '#fca5a5';
            textColor = '#dc2626';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <span style="font-size: 9.5px; color: ${isCurrent ? '#e11d48' : '#94a3b8'}; font-weight: 700;">
                ${isCurrent ? '📍 当前' : `|${Math.abs(val)}|`}
              </span>
              <div style="width: 48px; height: 48px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 5px rgba(0,0,0,0.04); transition: all 0.15s;">
                <span>${val > 0 ? `+${val}` : val}</span>
              </div>
              <span style="font-size: 9px; color: ${isFlipped ? '#059669' : isNegative ? '#dc2626' : '#64748b'}; font-weight: 700;">
                ${isFlipped ? '✓ 翻转' : isNegative ? '⚠️ 负数' : '正数'}
              </span>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 排序提示与当前和 -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>按绝对值降序排列: <code style="color:#e11d48;">|x| desc</code></span>
            <span>当前数组和: <strong style="color: #059669; font-family: monospace; font-size: 12.5px;">${step.currentSum}</strong></span>
          </div>
        </div>

        <!-- 单元格水平条 -->
        <div style="display: flex; gap: 10px; overflow-x: auto; justify-content: center; padding: 6px 0;">
          ${cellsHtml}
        </div>
      `;
    }

    // 2. 渲染剩余翻转次数与状态 (Card 2 Left)
    if (this.kContainer) {
      this.kContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>剩余可用 K:</span>
            <span style="font-family: monospace; font-weight:800; color: #e11d48; font-size: 13px;">${step.remainingK}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>已翻转次数:</span>
            <span style="font-family: monospace; font-weight:700;">${step.flippedIndices.length} 次</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染两次贪心决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isFlipNeg = step.action === 'flip_negative';
      const isFlipSmall = step.action === 'flip_smallest';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>贪心策略:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isFlipNeg || isFlipSmall ? '#fff1f2' : '#eff6ff'}; color: ${isFlipNeg || isFlipSmall ? '#e11d48' : '#2563eb'}; border: 1px solid ${isFlipNeg || isFlipSmall ? '#fecdd3' : '#bfdbfe'};">
              ${isFlipNeg ? '🔄 贪心1: 大负数优先转正' : isFlipSmall ? '⚖️ 贪心2: 奇数次翻转最小绝对值' : '🔍 遍历扫描中'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 规则: 大负数转正增益最大；尾部小正数转负损失最小</div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终数组最大和看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>最终数组最大和: <strong style="color: #059669; font-family: monospace; font-size: 13.5px;">${step.currentSum}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #475569;">[${arr.join(', ')}]</span>
          </div>
        </div>
      `;
    }

    const badgeK = this.root?.querySelector('#badge-remaining-k');
    if (badgeK) {
      badgeK.textContent = `剩余 K: ${step.remainingK}`;
    }

    // 5. 更新 Scrubber 进度条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    const stepCur = this.root?.querySelector('#step-cur') as HTMLElement | null;
    const stepTotal = this.root?.querySelector('#step-total') as HTMLElement | null;
    const playIcon = this.root?.querySelector('#play-icon') as HTMLElement | null;

    if (slider) {
      slider.max = String(Math.max(0, this.steps.length - 1));
      slider.value = String(this.currentIndex);
    }
    if (stepCur) stepCur.textContent = String(this.currentIndex + 1);
    if (stepTotal) stepTotal.textContent = String(this.steps.length);
    if (playIcon) {
      playIcon.className = this.isPlaying ? 'fa-solid fa-pause text-[12px]' : 'fa-solid fa-play text-[12px]';
    }

    // 6. 暗色终端代码行高亮
    this.terminalInstance?.highlightLine(step.codeLine);

    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '步骤';

        if (st.action === 'flip_negative') {
          badgeColor = '#e11d48';
          badgeBg = '#fff1f2';
          badgeText = '负翻正';
        } else if (st.action === 'flip_smallest') {
          badgeColor = '#d97706';
          badgeBg = '#fef3c7';
          badgeText = '最小翻转';
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
  id: 'maximize-sum-k',
  name: 'K 次取反后最大化的数组和',
  viewId: 'algo-maximize-sum-k-view',
  category: 'greedy',
  description: '绝对值降序排序，负数优先转正，剩余奇数次翻转最小绝对值',
  icon: '±',
  template,
  Visualizer: MaximizeSumKVisualizer,
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '掌握贪心算法中的绝对值排序策略与奇偶性分类讨论思维',
});