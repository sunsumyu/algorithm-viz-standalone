/**
 * 滑动窗口最大值可视化器 — 4-Card 标准现代架构
 * LeetCode 239：单调队列（队头到队尾单调递减），队头恒为当前窗口最大值，O(1) 读取
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  SLIDING_WINDOW_MAX_PROBLEM_HTML,
  SLIDING_WINDOW_MAX_ANALYSIS_HTML,
  SLIDING_WINDOW_MAX_CODE_LANGUAGES,
} from './sliding-window-max-problem-content';
import template from './sliding-window-max.html?raw';

export interface SWMStep {
  nums: number[];
  k: number;
  currentIndex: number;
  windowLeft: number;
  windowRight: number;
  deque: number[]; // 存储数值
  result: number[];
  outVal: number | null;
  inVal: number | null;
  poppedBackVals: number[];
  action: 'init' | 'init_window' | 'slide_out' | 'slide_in' | 'record_max' | 'done';
  message: string;
  codeLine: number;
}

export function buildSlidingWindowMaxSteps(rawNums: number[], k: number): SWMStep[] {
  const steps: SWMStep[] = [];
  const nums = [...rawNums];
  const n = nums.length;

  if (n === 0 || k <= 0 || k > n) {
    steps.push({
      nums: [],
      k,
      currentIndex: -1,
      windowLeft: 0,
      windowRight: -1,
      deque: [],
      result: [],
      outVal: null,
      inVal: null,
      poppedBackVals: [],
      action: 'done',
      message: '输入无效或窗口大小超出数组长度',
      codeLine: 18,
    });
    return steps;
  }

  const deque: number[] = [];
  const result: number[] = [];

  const dequeAdd = (val: number): number[] => {
    const popped: number[] = [];
    while (deque.length > 0 && val > deque[deque.length - 1]) {
      popped.push(deque.pop()!);
    }
    deque.push(val);
    return popped;
  };

  const dequePoll = (val: number): boolean => {
    if (deque.length > 0 && val === deque[0]) {
      deque.shift();
      return true;
    }
    return false;
  };

  steps.push({
    nums: [...nums],
    k,
    currentIndex: -1,
    windowLeft: 0,
    windowRight: -1,
    deque: [],
    result: [],
    outVal: null,
    inVal: null,
    poppedBackVals: [],
    action: 'init',
    message: `初始化：数组包含 ${n} 个元素，滑动窗口大小 k=${k}，使用单调递减队列`,
    codeLine: 19,
  });

  // 1. 初始化前 k 个元素构成的首个窗口
  for (let i = 0; i < k; i++) {
    const val = nums[i];
    const popped = dequeAdd(val);

    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: 0,
      windowRight: i,
      deque: [...deque],
      result: [...result],
      outVal: null,
      inVal: val,
      poppedBackVals: popped,
      action: 'init_window',
      message: `📥 填充初始窗口 [${i}] (值 ${val})：${popped.length > 0 ? `弹出队尾较小值 [${popped.join(', ')}]，` : ''}压入单调队列，当前队列: [${deque.join(', ')}]`,
      codeLine: 21,
    });
  }

  result.push(deque[0]);

  steps.push({
    nums: [...nums],
    k,
    currentIndex: k - 1,
    windowLeft: 0,
    windowRight: k - 1,
    deque: [...deque],
    result: [...result],
    outVal: null,
    inVal: null,
    poppedBackVals: [],
    action: 'record_max',
    message: `🥇 首个窗口 [0..${k - 1}] 就绪！单调队列头为最大值 ${deque[0]}，记录结果: [${result.join(', ')}]`,
    codeLine: 22,
  });

  // 2. 开始滑动窗口
  for (let i = k; i < n; i++) {
    const outNum = nums[i - k];
    const inNum = nums[i];
    const left = i - k + 1;
    const right = i;

    // 滑出旧值
    const wasPolled = dequePoll(outNum);

    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: left,
      windowRight: right,
      deque: [...deque],
      result: [...result],
      outVal: outNum,
      inVal: null,
      poppedBackVals: [],
      action: 'slide_out',
      message: `🚪 窗口右移：移出元素 [${i - k}] (值 ${outNum}) &rarr; ${wasPolled ? `与单调队列头一致，成功移出队头！` : '该元素此前已被单调淘汰，无需操作'}`,
      codeLine: 24,
    });

    // 移入新值
    const popped = dequeAdd(inNum);

    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: left,
      windowRight: right,
      deque: [...deque],
      result: [...result],
      outVal: outNum,
      inVal: inNum,
      poppedBackVals: popped,
      action: 'slide_in',
      message: `📥 移入新元素 [${i}] (值 ${inNum})：${popped.length > 0 ? `弹出队尾较小值 [${popped.join(', ')}]，` : ''}维持单调递减，队列: [${deque.join(', ')}]`,
      codeLine: 25,
    });

    // 记录最大值
    result.push(deque[0]);

    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: left,
      windowRight: right,
      deque: [...deque],
      result: [...result],
      outVal: null,
      inVal: null,
      poppedBackVals: [],
      action: 'record_max',
      message: `🥇 窗口 [${left}..${right}] 最大值为队头 ${deque[0]}，记录结果: [${result.join(', ')}]`,
      codeLine: 26,
    });
  }

  steps.push({
    nums: [...nums],
    k,
    currentIndex: n - 1,
    windowLeft: n - k,
    windowRight: n - 1,
    deque: [...deque],
    result: [...result],
    outVal: null,
    inVal: null,
    poppedBackVals: [],
    action: 'done',
    message: `🎉 滑动窗口最大值计算完成！所有窗口的最大值序列为：[${result.join(', ')}]`,
    codeLine: 28,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class SlidingWindowMaxVisualizer extends StepVisualizer<SWMStep> {
  protected codeLanguages = SLIDING_WINDOW_MAX_CODE_LANGUAGES;
  protected codeLines = SLIDING_WINDOW_MAX_CODE_LANGUAGES['java'];
  protected codePanelTitle = '滑动窗口最大值 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private windowStatusContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#swm-sandbox-container');
    this.windowStatusContainer = this.root.querySelector('#swm-window-status-container');
    this.decisionMonitorContainer = this.root.querySelector('#swm-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#swm-metrics-container');
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
    this.root.querySelectorAll<HTMLButtonElement>('.swm-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;
        if (nEl && btn.dataset.nums) nEl.value = btn.dataset.nums;
        if (kEl && btn.dataset.k) kEl.value = btn.dataset.k;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: SLIDING_WINDOW_MAX_PROBLEM_HTML,
      analysisHtml: SLIDING_WINDOW_MAX_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SWMStep[] {
    const nEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;

    const rawNums = (nEl?.value || '1,3,-1,-3,5,3,6,7')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const k = parseInt(kEl?.value || '3', 10);

    return buildSlidingWindowMaxSteps(rawNums.length ? rawNums : [1, 3, -1, -3, 5, 3, 6, 7], isNaN(k) ? 3 : k);
  }

  protected renderStep(step: SWMStep): void {
    const nums = step.nums;
    const deque = step.deque;
    const result = step.result;
    const n = nums.length;
    const isDone = step.action === 'done';

    // 1. 渲染滑动窗口与单调队列沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const wL = step.windowLeft;
      const wR = step.windowRight;

      const numsHtml = nums
        .map((num, idx) => {
          const inWindow = idx >= wL && idx <= wR && !isDone;
          const isMax = inWindow && deque.length > 0 && num === deque[0];
          const inDeque = deque.includes(num);

          let bg = '#ffffff';
          let border = '#e2e8f0';
          let textColor = '#0f172a';

          if (inWindow) {
            if (isMax) {
              bg = '#ecfdf5';
              border = '#10b981';
              textColor = '#047857';
            } else {
              bg = '#fef2f2';
              border = '#f87171';
              textColor = '#ef4444';
            }
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="font-size: 8.5px; color: ${inWindow ? '#ef4444' : '#94a3b8'}; font-weight: 700;">
                [${idx}]
              </span>
              <div style="min-width: 38px; height: 38px; padding: 0 6px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                ${num}
              </div>
            </div>
          `;
        })
        .join('');

      // 队列展示 (队头在左，即最大值)
      const dequeHtml = deque
        .map((val, idx) => {
          const isFront = idx === 0;
          return `
            <div style="padding: 2px 10px; border-radius: 6px; background: ${isFront ? '#ecfdf5' : '#fffbeb'}; border: 1.5px solid ${isFront ? '#a7f3d0' : '#fde68a'}; color: ${isFront ? '#047857' : '#b45309'}; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              ${val}${isFront ? ' (窗内最大)' : ''}
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 数组与窗口 -->
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
            <span>🪟 数组条带 (窗口范围 [${wL}..${wR}]):</span>
            <span style="color: #ef4444;">k = ${step.k}</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0; min-height: 48px; align-items: center;">
            ${numsHtml}
          </div>

          <!-- 单调队列容器 -->
          <div style="display: flex; align-items: center; gap: 8px; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调队列 (队头最大 &rarr; 队尾):</span>
            <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
              ${deque.length > 0 ? dequeHtml : '<span style="font-size: 10px; color: #94a3b8;">空队列</span>'}
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染窗口状态 (Card 2 Left)
    if (this.windowStatusContainer) {
      this.windowStatusContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>活动窗口范围:</span>
            <span style="font-family: monospace; font-weight:800; color: #ef4444; font-size: 13px;">
              ${step.windowRight >= 0 ? `[${step.windowLeft} .. ${step.windowRight}]` : '未开始'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>当前窗口最大值:</span>
            <span style="font-family: monospace; font-weight:700; color: #059669; font-size: 13px;">
              ${deque.length > 0 ? deque[0] : '无'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染单调队列决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isRecord = step.action === 'record_max';
      const isSlideOut = step.action === 'slide_out';
      const isSlideIn = step.action === 'slide_in';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>队列决策:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isRecord ? '#ecfdf5' : isSlideOut ? '#fff7ed' : isSlideIn ? '#eff6ff' : '#f8fafc'}; color: ${isRecord ? '#059669' : isSlideOut ? '#ea580c' : isSlideIn ? '#2563eb' : '#64748b'}; border: 1px solid ${isRecord ? '#a7f3d0' : isSlideOut ? '#fed7aa' : isSlideIn ? '#bfdbfe' : '#e2e8f0'};">
              ${isRecord ? `🥇 收集最大值 ${deque[0]}` : isSlideOut ? `🚪 移出旧元素` : isSlideIn ? `📥 压入新元素` : '🔍 初始窗口'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#ef4444; font-family:monospace;">push 时淘汰较小队尾; pop 时仅移出匹配队头</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最大值收集看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>答案数组: <strong style="color: #ef4444; font-family: monospace; font-size: 13px;">[${result.join(', ')}]</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">已产生 ${result.length} / ${Math.max(0, n - step.k + 1)} 个</span>
          </div>
        </div>
      `;
    }

    const badgeCount = this.root?.querySelector('#badge-collected-count');
    if (badgeCount) {
      badgeCount.textContent = `已收集: ${result.length} 个`;
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

        if (st.action === 'init_window' || st.action === 'slide_in') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '入队';
        } else if (st.action === 'slide_out') {
          badgeColor = '#ea580c';
          badgeBg = '#fff7ed';
          badgeText = '移出';
        } else if (st.action === 'record_max') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '结算';
        } else if (st.action === 'done') {
          badgeColor = '#10b981';
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
  id: 'sliding-window-max',
  name: '滑动窗口最大值',
  viewId: 'algo-sliding-window-max-view',
  category: 'stack',
  description: '单调递减双端队列：队头恒为当前窗口最大值，O(1) 获取每个窗口的最值',
  icon: '🪟',
  template,
  Visualizer: SlidingWindowMaxVisualizer,
  difficulty: 3,
  levelOrder: 6,
  learningGoal: '掌握单调队列（Monotonic Deque）的设计与维护，理解移出与移入时保持单调性的精妙算法',
});
