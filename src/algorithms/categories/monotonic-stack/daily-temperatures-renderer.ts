/**
 * 每日温度可视化器（单调栈）— 4-Card 标准现代架构
 * LeetCode 739：单调递增栈（栈头到栈底），遇到更高温度持续出栈并计算跨度 i - st.top()
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  DAILY_TEMPERATURES_PROBLEM_HTML,
  DAILY_TEMPERATURES_ANALYSIS_HTML,
  DAILY_TEMPERATURES_CODE_LANGUAGES,
} from './daily-temperatures-problem-content';
import template from './daily-temperatures.html?raw';

export interface DailyTempStep {
  temperatures: number[];
  currentIndex: number;
  stack: number[]; // 存储下标
  result: number[];
  poppedIndex: number | null;
  action: 'init' | 'compare' | 'pop_resolve' | 'push' | 'done';
  message: string;
  codeLine: number;
}

export function buildDailyTemperaturesSteps(rawTemps: number[]): DailyTempStep[] {
  const steps: DailyTempStep[] = [];
  const n = rawTemps.length;

  if (n === 0) {
    steps.push({
      temperatures: [],
      currentIndex: -1,
      stack: [],
      result: [],
      poppedIndex: null,
      action: 'done',
      message: '输入为空，返回空数组',
      codeLine: 2,
    });
    return steps;
  }

  const result = new Array(n).fill(0);
  const stack: number[] = [];

  steps.push({
    temperatures: [...rawTemps],
    currentIndex: -1,
    stack: [],
    result: [...result],
    poppedIndex: null,
    action: 'init',
    message: `初始化：共 ${n} 天温度数据，结果数组初始化为全 0，单调栈为空`,
    codeLine: 3,
  });

  for (let i = 0; i < n; i++) {
    const curTemp = rawTemps[i];

    steps.push({
      temperatures: [...rawTemps],
      currentIndex: i,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'compare',
      message: `📅 第 [${i}] 天 (温度 ${curTemp}°C)：与单调栈顶 ${stack.length > 0 ? `第 [${stack[stack.length - 1]}] 天 (${rawTemps[stack[stack.length - 1]]}°C)` : '（栈空）'} 进行比对`,
      codeLine: 6,
    });

    while (stack.length > 0 && curTemp > rawTemps[stack[stack.length - 1]]) {
      const prevIdx = stack.pop()!;
      result[prevIdx] = i - prevIdx;

      steps.push({
        temperatures: [...rawTemps],
        currentIndex: i,
        stack: [...stack],
        result: [...result],
        poppedIndex: prevIdx,
        action: 'pop_resolve',
        message: `🔥 升温触发结算！第 [${i}] 天 (${curTemp}°C) > 栈顶第 [${prevIdx}] 天 (${rawTemps[prevIdx]}°C)！等待跨度 = ${i} - ${prevIdx} = ${result[prevIdx]} 天，出栈！`,
        codeLine: 8,
      });
    }

    stack.push(i);

    steps.push({
      temperatures: [...rawTemps],
      currentIndex: i,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'push',
      message: `📥 将第 [${i}] 天 (${curTemp}°C) 入栈，维护栈底到栈顶单调递减性质`,
      codeLine: 10,
    });
  }

  steps.push({
    temperatures: [...rawTemps],
    currentIndex: n - 1,
    stack: [...stack],
    result: [...result],
    poppedIndex: null,
    action: 'done',
    message: `🎉 全遍历结算完成！单调栈内剩余未被打破的天数保持 0 天，最终等待数组：[${result.join(', ')}]`,
    codeLine: 12,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class DailyTemperaturesVisualizer extends StepVisualizer<DailyTempStep> {
  protected codeLanguages = DAILY_TEMPERATURES_CODE_LANGUAGES;
  protected codeLines = DAILY_TEMPERATURES_CODE_LANGUAGES['java'];
  protected codePanelTitle = '每日温度 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private dayContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#dt-sandbox-container');
    this.dayContainer = this.root.querySelector('#dt-day-container');
    this.decisionMonitorContainer = this.root.querySelector('#dt-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#dt-metrics-container');
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
    this.root.querySelectorAll<HTMLButtonElement>('.dt-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tEl = this.root?.querySelector('#input-temperatures') as HTMLInputElement | null;
        if (tEl && btn.dataset.temperatures) tEl.value = btn.dataset.temperatures;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: DAILY_TEMPERATURES_PROBLEM_HTML,
      analysisHtml: DAILY_TEMPERATURES_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): DailyTempStep[] {
    const tEl = this.root?.querySelector('#input-temperatures') as HTMLInputElement | null;
    const rawTemps = (tEl?.value || '73,74,75,71,69,72,76,73')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    return buildDailyTemperaturesSteps(rawTemps.length ? rawTemps : [73, 74, 75, 71, 69, 72, 76, 73]);
  }

  protected renderStep(step: DailyTempStep): void {
    const temps = step.temperatures;
    const stack = step.stack;
    const result = step.result;
    const n = temps.length;

    // 1. 渲染温度柱状图与单调栈沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const isDone = step.action === 'done';

      const maxT = Math.max(...temps, 100);
      const minT = Math.min(...temps, 30);
      const range = Math.max(1, maxT - minT);

      // 上方：温度柱状图
      const barsHtml = temps
        .map((t, idx) => {
          const isCurrent = idx === curIdx && !isDone;
          const inStack = stack.includes(idx);
          const isPopped = idx === step.poppedIndex;
          const waitDays = result[idx];

          const heightPercent = Math.max(18, Math.min(100, Math.round(((t - minT) / range) * 70 + 20)));

          let barBg = '#e2e8f0';
          let textColor = '#64748b';
          let borderColor = 'transparent';

          if (isCurrent) {
            barBg = '#ea580c';
            textColor = '#ea580c';
            borderColor = '#ea580c';
          } else if (isPopped) {
            barBg = '#10b981';
            textColor = '#059669';
            borderColor = '#10b981';
          } else if (inStack) {
            barBg = '#fbbf24';
            textColor = '#d97706';
            borderColor = '#f59e0b';
          } else if (waitDays > 0) {
            barBg = '#d1fae5';
            textColor = '#059669';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 28px; max-width: 48px;">
              <span style="font-size: 9px; font-weight: 700; color: ${textColor}; font-family: monospace;">${t}°</span>
              <div style="width: 100%; height: 75px; display: flex; align-items: flex-end; justify-content: center;">
                <div style="width: 22px; height: ${heightPercent}%; background: ${barBg}; border-radius: 6px 6px 2px 2px; border: 1.5px solid ${borderColor}; transition: all 0.2s; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 8.5px; font-weight: 800;">
                  ${waitDays > 0 ? waitDays : ''}
                </div>
              </div>
              <span style="font-size: 8.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">
                [${idx}]
              </span>
            </div>
          `;
        })
        .join('');

      // 下方：单调栈视觉展示
      const stackItemsHtml = stack
        .map((idx) => {
          return `
            <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 4px;">
              <span>[${idx}]</span>
              <span style="color: #ea580c;">${temps[idx]}°C</span>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 柱状图水平流 -->
          <div style="display: flex; justify-content: space-around; align-items: flex-end; padding: 2px 0; border-bottom: 1px solid #e2e8f0;">
            ${barsHtml}
          </div>

          <!-- 单调栈容器 -->
          <div style="display: flex; align-items: center; gap: 8px; padding-top: 2px;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调栈 (栈底 &rarr; 栈顶):</span>
            <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
              ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染当前日与栈顶温度 (Card 2 Left)
    if (this.dayContainer) {
      const curIdx = step.currentIndex;
      const topIdx = stack.length > 0 ? stack[stack.length - 1] : null;

      this.dayContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前扫描日 [i]:</span>
            <span style="font-family: monospace; font-weight:800; color: #ea580c; font-size: 12.5px;">
              ${curIdx >= 0 ? `第 [${curIdx}] 天 (${temps[curIdx]}°C)` : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>当前栈顶日 [top]:</span>
            <span style="font-family: monospace; font-weight:700; color: #d97706;">
              ${topIdx !== null ? `第 [${topIdx}] 天 (${temps[topIdx]}°C)` : '（栈空）'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染单调栈出入栈决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isPop = step.action === 'pop_resolve';
      const isPush = step.action === 'push';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>操作决策:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isPop ? '#ecfdf5' : isPush ? '#fff7ed' : '#eff6ff'}; color: ${isPop ? '#059669' : isPush ? '#c2410c' : '#2563eb'}; border: 1px solid ${isPop ? '#a7f3d0' : isPush ? '#fed7aa' : '#bfdbfe'};">
              ${isPop ? `🔥 结算出栈 (等待跨度 ${result[step.poppedIndex ?? 0]} 天)` : isPush ? '📥 压入栈顶 (维持递增)' : '🔍 比对栈顶温度'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#ea580c; font-family:monospace;">遇到更高温度持续 pop 结算差值，再将当前下标 push</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染各天等待天数数组看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      const resolvedCount = result.filter((r) => r > 0).length;
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>已算出升温等待天数: <strong style="color: #ea580c; font-family: monospace; font-size: 13.5px;">${resolvedCount}</strong> / ${n} 天</span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">[${result.join(', ')}]</span>
          </div>
        </div>
      `;
    }

    const badgeResolved = this.root?.querySelector('#badge-resolved-count');
    if (badgeResolved) {
      const resolvedCount = result.filter((r) => r > 0).length;
      badgeResolved.textContent = `已结算: ${resolvedCount} 天`;
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
        let badgeText = '比对';

        if (st.action === 'pop_resolve') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '结算出栈';
        } else if (st.action === 'push') {
          badgeColor = '#ea580c';
          badgeBg = '#fff7ed';
          badgeText = '入栈';
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
  id: 'daily-temperatures',
  name: '每日温度',
  viewId: 'algo-daily-temperatures-view',
  category: 'monotonic-stack',
  description: '单调递增栈（栈头到栈底），遇到更高温度持续出栈计算右侧首个更大元素的跨度',
  icon: '🌡️',
  template,
  Visualizer: DailyTemperaturesVisualizer,
  difficulty: 2,
  levelOrder: 1,
  learningGoal: '掌握单调栈核心原理，理解栈内维护下标以及遇大元素循环出栈结算天数差的经典模式',
});
