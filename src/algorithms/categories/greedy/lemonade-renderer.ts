/**
 * 柠檬水找零可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 860：每杯柠檬水 $5，收 $10 找 $5，收 $20 贪心优先找 $10+$5 其次找 3张 $5
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  LEMONADE_PROBLEM_HTML,
  LEMONADE_ANALYSIS_HTML,
  LEMONADE_CODE_LANGUAGES,
} from './lemonade-problem-content';
import template from './lemonade.html?raw';

export interface LemonadeStep {
  bills: number[];
  currentIndex: number;
  fiveCount: number;
  tenCount: number;
  currentBill: number;
  changeGiven: number[];
  success: boolean;
  action: 'init' | 'receive_5' | 'change_10' | 'change_20_10_5' | 'change_20_5_5_5' | 'fail' | 'done';
  message: string;
  codeLine: number;
}

export function buildLemonadeSteps(rawBills: number[]): LemonadeStep[] {
  const steps: LemonadeStep[] = [];
  const n = rawBills.length;

  if (n === 0) {
    steps.push({
      bills: [],
      currentIndex: -1,
      fiveCount: 0,
      tenCount: 0,
      currentBill: 0,
      changeGiven: [],
      success: true,
      action: 'done',
      message: '没有顾客，返回 true',
      codeLine: 2,
    });
    return steps;
  }

  let five = 0;
  let ten = 0;

  steps.push({
    bills: [...rawBills],
    currentIndex: -1,
    fiveCount: 0,
    tenCount: 0,
    currentBill: 0,
    changeGiven: [],
    success: true,
    action: 'init',
    message: `初始化：共 ${n} 位顾客排队，收银台初始零钱：$5 数量 = 0, $10 数量 = 0`,
    codeLine: 2,
  });

  for (let i = 0; i < n; i++) {
    const bill = rawBills[i];

    if (bill === 5) {
      five++;
      steps.push({
        bills: [...rawBills],
        currentIndex: i,
        fiveCount: five,
        tenCount: ten,
        currentBill: 5,
        changeGiven: [],
        success: true,
        action: 'receive_5',
        message: `💵 顾客 [${i}] 支付 $5，无需找零，直接存入收银台 ($5 储备增加到 ${five} 张)`,
        codeLine: 5,
      });
    } else if (bill === 10) {
      if (five <= 0) {
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 10,
          changeGiven: [],
          success: false,
          action: 'fail',
          message: `❌ 顾客 [${i}] 支付 $10 需要找零 $5，但收银台没有 $5 纸币！找零失败，返回 false`,
          codeLine: 7,
        });
        return steps;
      }
      five--;
      ten++;
      steps.push({
        bills: [...rawBills],
        currentIndex: i,
        fiveCount: five,
        tenCount: ten,
        currentBill: 10,
        changeGiven: [5],
        success: true,
        action: 'change_10',
        message: `💶 顾客 [${i}] 支付 $10，找零 1 张 $5 (剩余 $5: ${five} 张, $10: ${ten} 张)`,
        codeLine: 8,
      });
    } else if (bill === 20) {
      if (ten > 0 && five > 0) {
        ten--;
        five--;
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 20,
          changeGiven: [10, 5],
          success: true,
          action: 'change_20_10_5',
          message: `💷 顾客 [${i}] 支付 $20！【贪心优先策略】找零 1 张 $10 + 1 张 $5，保留万能 $5 (剩余 $5: ${five} 张, $10: ${ten} 张)`,
          codeLine: 12,
        });
      } else if (five >= 3) {
        five -= 3;
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 20,
          changeGiven: [5, 5, 5],
          success: true,
          action: 'change_20_5_5_5',
          message: `💷 顾客 [${i}] 支付 $20！【备选策略】无 $10，找零 3 张 $5 (剩余 $5: ${five} 张, $10: ${ten} 张)`,
          codeLine: 14,
        });
      } else {
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 20,
          changeGiven: [],
          success: false,
          action: 'fail',
          message: `❌ 顾客 [${i}] 支付 $20 需要找零 $15，但收银台既无 ($10+$5) 也无 (3张$5)！找零失败，返回 false`,
          codeLine: 16,
        });
        return steps;
      }
    }
  }

  steps.push({
    bills: [...rawBills],
    currentIndex: n - 1,
    fiveCount: five,
    tenCount: ten,
    currentBill: 0,
    changeGiven: [],
    success: true,
    action: 'done',
    message: `🎉 全部 ${n} 位顾客找零成功！最终收银台结存：$5: ${five} 张, $10: ${ten} 张，返回 true`,
    codeLine: 20,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class LemonadeVisualizer extends StepVisualizer<LemonadeStep> {
  protected codeLanguages = LEMONADE_CODE_LANGUAGES;
  protected codeLines = LEMONADE_CODE_LANGUAGES['java'];
  protected codePanelTitle = '柠檬水找零 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private txContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#lm-sandbox-container');
    this.txContainer = this.root.querySelector('#lm-tx-container');
    this.decisionMonitorContainer = this.root.querySelector('#lm-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#lm-metrics-container');
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
    this.root.querySelectorAll<HTMLButtonElement>('.lm-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const billsEl = this.root?.querySelector('#input-bills') as HTMLInputElement | null;
        if (billsEl && btn.dataset.bills) billsEl.value = btn.dataset.bills;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: LEMONADE_PROBLEM_HTML,
      analysisHtml: LEMONADE_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): LemonadeStep[] {
    const billsEl = this.root?.querySelector('#input-bills') as HTMLInputElement | null;
    const rawBills = (billsEl?.value || '5,5,5,10,20')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    return buildLemonadeSteps(rawBills.length ? rawBills : [5, 5, 5, 10, 20]);
  }

  protected renderStep(step: LemonadeStep): void {
    const bills = step.bills;
    const n = bills.length;

    // 1. 渲染顾客队列与收银台沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const isDone = step.action === 'done';
      const isFail = step.action === 'fail';

      const customersHtml = bills
        .map((b, idx) => {
          const isCurrent = idx === curIdx && !isDone;
          const isProcessed = idx < curIdx || (idx === curIdx && isDone);

          let bg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#0f172a';

          if (isCurrent) {
            bg = isFail ? '#fef2f2' : '#fefce8';
            borderColor = isFail ? '#ef4444' : '#ca8a04';
            textColor = isFail ? '#dc2626' : '#a16207';
          } else if (isProcessed) {
            bg = '#f8fafc';
            borderColor = '#cbd5e1';
            textColor = '#64748b';
          }

          const billBadgeColor = b === 5 ? '#10b981' : b === 10 ? '#3b82f6' : '#ca8a04';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <span style="font-size: 9px; color: ${isCurrent ? '#ca8a04' : '#94a3b8'}; font-weight: 700;">
                ${isCurrent ? '📍 购买' : `[${idx}]`}
              </span>
              <div style="width: 48px; height: 50px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); gap: 1px;">
                <span style="font-size: 9.5px; color: ${billBadgeColor}; font-weight: 700;">支付</span>
                <span style="font-size: 13px; color: ${billBadgeColor}; font-weight: 800;">$${b}</span>
              </div>
              <span style="font-size: 8.5px; color: ${isProcessed ? '#059669' : '#94a3b8'}; font-weight: 700;">
                ${isProcessed ? '✓ 完成' : '等待'}
              </span>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 钱箱储备条 -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>💵 收银台现钞储备: <strong style="color: #10b981;">$5 &times; ${step.fiveCount}</strong> | <strong style="color: #3b82f6;">$10 &times; ${step.tenCount}</strong></span>
            <span>找零吐钞: <strong style="color: #ca8a04; font-family: monospace;">${step.changeGiven.length ? step.changeGiven.map((c) => `$${c}`).join(' + ') : '无'}</strong></span>
          </div>
        </div>

        <!-- 顾客水平流 -->
        <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
          ${customersHtml}
        </div>
      `;
    }

    // 2. 渲染当前交易 (Card 2 Left)
    if (this.txContainer) {
      const idx = step.currentIndex;
      const curBill = idx >= 0 && idx < bills.length ? bills[idx] : 0;
      const changeNeed = curBill > 5 ? curBill - 5 : 0;

      this.txContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前顾客支付:</span>
            <span style="font-family: monospace; font-weight:800; color: #ca8a04; font-size: 12.5px;">${curBill > 0 ? `$${curBill}` : '-'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>所需找零金额:</span>
            <span style="font-family: monospace; font-weight:700; color: ${changeNeed > 0 ? '#dc2626' : '#059669'};">
              ${curBill > 0 ? (changeNeed > 0 ? `$${changeNeed}` : '$0 (无需找零)') : '-'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染贪心找零决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isPay5 = step.action === 'receive_5';
      const isChg10 = step.action === 'change_10';
      const isChg20Opt = step.action === 'change_20_10_5';
      const isChg20Alt = step.action === 'change_20_5_5_5';
      const isFail = step.action === 'fail';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>找零决策:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isFail ? '#fef2f2' : isChg20Opt ? '#fefce8' : '#ecfdf5'}; color: ${isFail ? '#dc2626' : isChg20Opt ? '#a16207' : '#059669'}; border: 1px solid ${isFail ? '#fecaca' : isChg20Opt ? '#fef08a' : '#a7f3d0'};">
              ${isPay5 ? '💵 $5 直接收下' : isChg10 ? '💶 找零 1 张 $5' : isChg20Opt ? '💷 贪心优先找 $10+$5' : isChg20Alt ? '💷 备选方案找 3张 $5' : isFail ? '❌ 零钱不足 (失败)' : '✓ 交易完成'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#ca8a04; font-family:monospace;">$5万能不可滥用，遇$20必先消耗$10</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染钱箱钞票储备与找零判定看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>找零可行性判定: <strong style="color: ${step.success ? '#059669' : '#dc2626'}; font-family: monospace; font-size: 13.5px;">${step.success ? 'true (可以找零)' : 'false (找零失败)'}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #475569;">钱箱结余: $${step.fiveCount * 5 + step.tenCount * 10}</span>
          </div>
        </div>
      `;
    }

    const badgeTotal = this.root?.querySelector('#badge-cashier-total');
    if (badgeTotal) {
      badgeTotal.textContent = `钱箱储备: $${step.fiveCount * 5 + step.tenCount * 10}`;
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
        let badgeText = '交易';

        if (st.action === 'receive_5') {
          badgeColor = '#10b981';
          badgeBg = '#ecfdf5';
          badgeText = '收$5';
        } else if (st.action === 'change_10') {
          badgeColor = '#3b82f6';
          badgeBg = '#eff6ff';
          badgeText = '找$5';
        } else if (st.action === 'change_20_10_5') {
          badgeColor = '#ca8a04';
          badgeBg = '#fefce8';
          badgeText = '找$10+$5';
        } else if (st.action === 'change_20_5_5_5') {
          badgeColor = '#d97706';
          badgeBg = '#fffbeb';
          badgeText = '找3张$5';
        } else if (st.action === 'fail') {
          badgeColor = '#dc2626';
          badgeBg = '#fef2f2';
          badgeText = '失败';
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
  id: 'lemonade',
  name: '柠檬水找零',
  viewId: 'algo-lemonade-view',
  category: 'greedy',
  description: '贪心维护各面额纸币数量，找零 $20 优先消耗专用 $10 纸币，保留万能 $5',
  icon: '🍋',
  template,
  Visualizer: LemonadeVisualizer,
  difficulty: 1,
  levelOrder: 14,
  learningGoal: '理解贪心策略中通用资源与受限资源的优先级调度思想',
});
