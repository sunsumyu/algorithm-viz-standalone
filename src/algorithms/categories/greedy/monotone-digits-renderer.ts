/**
 * 单调递增的数字可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 738：从右向左逆序扫描，若 chars[i-1] > chars[i] 则 chars[i-1]-- 且记录 flag = i，后续位全置 9
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  MONOTONE_DIGITS_PROBLEM_HTML,
  MONOTONE_DIGITS_ANALYSIS_HTML,
  MONOTONE_DIGITS_CODE_LANGUAGES,
} from './monotone-digits-problem-content';
import template from './monotone-digits.html?raw';

export interface MonotoneStep {
  originalNum: number;
  digits: number[];
  checkIndex: number;
  flag: number;
  action: 'init' | 'check_ok' | 'borrow' | 'fill_9' | 'done';
  message: string;
  codeLine: number;
}

export function buildMonotoneDigitsSteps(num: number): MonotoneStep[] {
  const steps: MonotoneStep[] = [];
  const digits = String(num)
    .split('')
    .map(Number);
  const n = digits.length;

  if (n <= 1) {
    steps.push({
      originalNum: num,
      digits: [...digits],
      checkIndex: -1,
      flag: n,
      action: 'done',
      message: `数字 ${num} 仅有 1 位，天然满足单调递增，直接返回 ${num}`,
      codeLine: 1,
    });
    return steps;
  }

  let flag = n;

  steps.push({
    originalNum: num,
    digits: [...digits],
    checkIndex: -1,
    flag,
    action: 'init',
    message: `初始化：将数字 ${num} 拆解为 ${n} 位数数组 [${digits.join(', ')}]，初始变9标记 flag = ${flag}`,
    codeLine: 4,
  });

  // 1. 从右往左逆序扫描
  for (let i = n - 1; i > 0; i--) {
    if (digits[i - 1] > digits[i]) {
      digits[i - 1]--;
      flag = i;

      steps.push({
        originalNum: num,
        digits: [...digits],
        checkIndex: i,
        flag,
        action: 'borrow',
        message: `⚠️ 逆序比较 [${i - 1}] 位 (${digits[i - 1] + 1}) > [${i}] 位 (${digits[i]}) 违反单调递增！高位借位减 1 变为 ${digits[i - 1]}，更新变9起点 flag = ${flag}`,
        codeLine: 8,
      });
    } else {
      steps.push({
        originalNum: num,
        digits: [...digits],
        checkIndex: i,
        flag,
        action: 'check_ok',
        message: `✓ 逆序比较 [${i - 1}] 位 (${digits[i - 1]}) &le; [${i}] 位 (${digits[i]})，满足单调递增，继续向左扫描`,
        codeLine: 6,
      });
    }
  }

  // 2. 将 flag 之后的数字全部置为 9
  if (flag < n) {
    for (let i = flag; i < n; i++) {
      digits[i] = 9;
    }

    steps.push({
      originalNum: num,
      digits: [...digits],
      checkIndex: -1,
      flag,
      action: 'fill_9',
      message: `9️⃣ 统一将 flag=[${flag}] 及后续所有低位全部置为 9，使数值在满足单调递增前提下最大化！`,
      codeLine: 14,
    });
  }

  const resultNum = parseInt(digits.join(''), 10);

  steps.push({
    originalNum: num,
    digits: [...digits],
    checkIndex: -1,
    flag,
    action: 'done',
    message: `🎉 计算完成！小于或等于 ${num} 的最大单调递增整数为 ${resultNum}`,
    codeLine: 16,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class MonotoneDigitsVisualizer extends StepVisualizer<MonotoneStep> {
  protected codeLanguages = MONOTONE_DIGITS_CODE_LANGUAGES;
  protected codeLines = MONOTONE_DIGITS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '单调递增的数字 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private pairContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#md-sandbox-container');
    this.pairContainer = this.root.querySelector('#md-pair-container');
    this.decisionMonitorContainer = this.root.querySelector('#md-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#md-metrics-container');
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
    this.root.querySelectorAll<HTMLButtonElement>('.md-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;
        if (nEl && btn.dataset.n) nEl.value = btn.dataset.n;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: MONOTONE_DIGITS_PROBLEM_HTML,
      analysisHtml: MONOTONE_DIGITS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MonotoneStep[] {
    const nEl = this.root?.querySelector('#input-n') as HTMLInputElement | null;
    const num = parseInt(nEl?.value || '332', 10);
    return buildMonotoneDigitsSteps(!isNaN(num) && num >= 0 ? num : 332);
  }

  protected renderStep(step: MonotoneStep): void {
    const digits = step.digits;
    const n = digits.length;

    // 1. 渲染数字位数沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.checkIndex;
      const isDone = step.action === 'done';

      const digitsHtml = digits
        .map((d, idx) => {
          const isComparing = curIdx > 0 && (idx === curIdx || idx === curIdx - 1) && !isDone;
          const isFilled9 = idx >= step.flag && (step.action === 'fill_9' || isDone);

          let bg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#0f172a';

          if (isFilled9) {
            bg = '#ecfdf5';
            borderColor = '#10b981';
            textColor = '#059669';
          } else if (isComparing) {
            bg = '#fdf4ff';
            borderColor = '#c026d3';
            textColor = '#a21caf';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <span style="font-size: 9px; color: ${isComparing ? '#c026d3' : isFilled9 ? '#059669' : '#94a3b8'}; font-weight: 700;">
                ${isComparing ? (idx === curIdx - 1 ? '高位[i-1]' : '低位[i]') : `[${idx}]`}
              </span>
              <div style="width: 52px; height: 56px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                <span>${d}</span>
              </div>
              <span style="font-size: 8.5px; color: ${idx === step.flag ? '#c026d3' : '#94a3b8'}; font-weight: 700;">
                ${idx === step.flag ? '🚩 flag' : ''}
              </span>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 状态提示 -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>原输入数值: <strong style="color: #0f172a; font-family: monospace;">${step.originalNum}</strong></span>
            <span>置9起始位 flag: <strong style="color: #c026d3; font-family: monospace;">[${step.flag < n ? step.flag : '无'}]</strong></span>
          </div>
        </div>

        <!-- 数字位数水平流 -->
        <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
          ${digitsHtml}
        </div>
      `;
    }

    // 2. 渲染当前比较对 (Card 2 Left)
    if (this.pairContainer) {
      const idx = step.checkIndex;
      const hasPair = idx > 0 && idx < digits.length;

      this.pairContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>逆序比较对:</span>
            <span style="font-family: monospace; font-weight:800; color: #c026d3; font-size: 12.5px;">
              ${hasPair ? `digits[${idx - 1}](${digits[idx - 1]}) vs digits[${idx}](${digits[idx]})` : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>变9起始点 flag:</span>
            <span style="font-family: monospace; font-weight:700; color: #2563eb;">
              ${step.flag < n ? `下标 [${step.flag}]` : '未触发借位 (无需变9)'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染借位与置9决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isBorrow = step.action === 'borrow';
      const isFill9 = step.action === 'fill_9';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>贪心判定:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isBorrow ? '#fdf4ff' : isFill9 ? '#ecfdf5' : '#eff6ff'}; color: ${isBorrow ? '#c026d3' : isFill9 ? '#059669' : '#2563eb'}; border: 1px solid ${isBorrow ? '#f5d0fe' : isFill9 ? '#a7f3d0' : '#bfdbfe'};">
              ${isBorrow ? '⚠️ 高位 > 低位 (借位减1，更新flag)' : isFill9 ? '9️⃣ 后续低位全置 9 (最大化)' : '✓ 单调递增无违背'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#c026d3; font-family:monospace;">从右向左逆序扫描借位，低位全置9确保最大</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终最大单调递增数字看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      const currentVal = parseInt(digits.join(''), 10);
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前数值: <strong style="color: #c026d3; font-family: monospace; font-size: 13.5px;">${currentVal}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">[${digits.join('')}]</span>
          </div>
        </div>
      `;
    }

    const badgeFlag = this.root?.querySelector('#badge-flag-pos');
    if (badgeFlag) {
      badgeFlag.textContent = `置9起始: ${step.flag < n ? `[${step.flag}]` : '无'}`;
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
        let badgeText = '扫描';

        if (st.action === 'borrow') {
          badgeColor = '#c026d3';
          badgeBg = '#fdf4ff';
          badgeText = '借位-1';
        } else if (st.action === 'fill_9') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '置9';
        } else if (st.action === 'done') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
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
  id: 'monotone-digits',
  name: '单调递增的数字',
  viewId: 'algo-monotone-digits-view',
  category: 'greedy',
  description: '逆序扫描借位减 1 并标记起点，后续位数统一贪心置 9，求小于等于 N 的最大单调数',
  icon: '📈',
  template,
  Visualizer: MonotoneDigitsVisualizer,
  difficulty: 2,
  levelOrder: 16,
  learningGoal: '掌握逆序遍历利用前序状态的解题技巧，理解贪心置 9 对数值最大化的精妙运用',
});
