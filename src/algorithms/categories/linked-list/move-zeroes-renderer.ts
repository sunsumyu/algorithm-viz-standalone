/**
 * 移动零可视化器（快慢双指针原地交换）
 * LeetCode 283
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  MOVE_ZEROES_PROBLEM_HTML,
  MOVE_ZEROES_ANALYSIS_HTML,
  MOVE_ZEROES_CODE_LANGUAGES,
} from './move-zeroes-problem-content';
import template from './move-zeroes.html?raw';

export interface MoveZeroesStep {
  nums: number[];
  slow: number;
  fast: number;
  action: 'init' | 'check_zero' | 'check_nonzero' | 'swap' | 'done';
  message: string;
  codeLine: number;
}

export function parseValues(input: string, defaultVals: number[]): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : defaultVals;
}

export function buildMoveZeroesSteps(initialNums: number[]): MoveZeroesStep[] {
  const steps: MoveZeroesStep[] = [];
  const nums = [...initialNums];
  let slow = 0;

  steps.push({
    nums: [...nums],
    slow: 0,
    fast: 0,
    action: 'init',
    message: `初始化：slow=0, fast=0。慢指针 slow 指向待填槽位，快指针 fast 扫描非零元素。`,
    codeLine: 2,
  });

  for (let fast = 0; fast < nums.length; fast++) {
    const val = nums[fast];
    if (val !== 0) {
      steps.push({
        nums: [...nums],
        slow,
        fast,
        action: 'check_nonzero',
        message: `fast=${fast} 处 nums[${fast}]=${val} ≠ 0，命中非零值，准备与 slow=${slow} 处元素交换。`,
        codeLine: 5,
      });

      // 交换
      const temp = nums[slow];
      nums[slow] = nums[fast];
      nums[fast] = temp;

      steps.push({
        nums: [...nums],
        slow,
        fast,
        action: 'swap',
        message: `交换 nums[${slow}] (${temp}) 与 nums[${fast}] (${val})。slow++ 递增至 ${slow + 1}。`,
        codeLine: 6,
      });

      slow++;
    } else {
      steps.push({
        nums: [...nums],
        slow,
        fast,
        action: 'check_zero',
        message: `fast=${fast} 处 nums[${fast}]=0，跳过继续探测。`,
        codeLine: 4,
      });
    }
  }

  steps.push({
    nums: [...nums],
    slow,
    fast: nums.length,
    action: 'done',
    message: `🎉 扫描完毕！所有非零元素已按序排在前部，末尾全为 0。最终数组: [${nums.join(', ')}]。`,
    codeLine: 10,
  });

  return steps;
}

export class MoveZeroesVisualizer extends StepVisualizer<MoveZeroesStep> {
  protected codeLanguages = MOVE_ZEROES_CODE_LANGUAGES;
  protected codeLines = MOVE_ZEROES_CODE_LANGUAGES['java'];
  protected codePanelTitle = '移动零 代码调试';

  private canvasContainer: HTMLElement | null = null;
  private slowMonitorVal: HTMLElement | null = null;
  private fastMonitorVal: HTMLElement | null = null;
  private curValMonitorVal: HTMLElement | null = null;
  private stepActionDesc: HTMLElement | null = null;
  private stepPhaseBadge: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.canvasContainer = this.root.querySelector('#mz-canvas-container');
    this.slowMonitorVal = this.root.querySelector('#metric-slow');
    this.fastMonitorVal = this.root.querySelector('#metric-fast');
    this.curValMonitorVal = this.root.querySelector('#metric-val');
    this.stepActionDesc = this.root.querySelector('#step-action-desc');
    this.stepPhaseBadge = this.root.querySelector('#step-phase-badge');
    this.logContainer = this.root.querySelector('#exec-log-stream');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 预设 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.mz-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsInput && btn.dataset.nums !== undefined) numsInput.value = btn.dataset.nums;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: MOVE_ZEROES_PROBLEM_HTML,
      analysisHtml: MOVE_ZEROES_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MoveZeroesStep[] {
    const numsInput = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const vals = parseValues(numsInput ? numsInput.value : '', [0, 1, 0, 3, 12]);
    return buildMoveZeroesSteps(vals);
  }

  protected renderStep(step: MoveZeroesStep): void {
    if (!step) return;

    if (this.stepActionDesc) this.stepActionDesc.textContent = step.message;
    if (this.slowMonitorVal) this.slowMonitorVal.textContent = `[${step.slow}]`;
    if (this.fastMonitorVal) this.fastMonitorVal.textContent = step.fast < step.nums.length ? `[${step.fast}]` : '扫描结束';
    if (this.curValMonitorVal) {
      this.curValMonitorVal.textContent = step.fast < step.nums.length ? String(step.nums[step.fast]) : '—';
    }

    if (this.stepPhaseBadge) {
      if (step.action === 'init') {
        this.stepPhaseBadge.textContent = '初始化';
        this.stepPhaseBadge.style.color = '#3b82f6';
      } else if (step.action === 'check_nonzero') {
        this.stepPhaseBadge.textContent = '命中非零';
        this.stepPhaseBadge.style.color = '#2563eb';
      } else if (step.action === 'swap') {
        this.stepPhaseBadge.textContent = '原地交换';
        this.stepPhaseBadge.style.color = '#f59e0b';
      } else if (step.action === 'check_zero') {
        this.stepPhaseBadge.textContent = '遇到 0 跳过';
        this.stepPhaseBadge.style.color = '#64748b';
      } else if (step.action === 'done') {
        this.stepPhaseBadge.textContent = '移动完成';
        this.stepPhaseBadge.style.color = '#10b981';
      }
    }

    this.renderCanvas(step);

    // 日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg = st.action === 'done' ? '#f0fdf4' : st.action === 'swap' ? '#fffbeb' : '#eff6ff';
        let color = st.action === 'done' ? '#15803d' : st.action === 'swap' ? '#b45309' : '#1d4ed8';
        let border = st.action === 'done' ? '#bbf7d0' : st.action === 'swap' ? '#fde68a' : '#bfdbfe';
        return `<div style="padding: 4px 8px; border-radius: 6px; background: ${bg}; color: ${color}; border: 1px solid ${border}; margin-bottom: 4px;">
          <span style="color:#94a3b8;">[Step ${idx + 1}]</span> ${st.message}
        </div>`;
      });
      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.currentIndex + 1} 条记录`;
      }
    }
  }

  private renderCanvas(step: MoveZeroesStep): void {
    if (!this.canvasContainer) return;

    const n = step.nums.length;
    let html = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 12px 0; width: 100%;">
        <div style="font-size: 11.5px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
          <span>数组内存结构 (长度 ${n})</span>
          <span style="font-size: 10.5px; font-weight: normal; color: #64748b;">[0..slow-1 为已整理非零区]</span>
        </div>
        <div style="display: flex; gap: 6px; position: relative; flex-wrap: wrap; justify-content: center;">
    `;

    for (let i = 0; i < n; i++) {
      const val = step.nums[i];
      const isSlow = step.slow === i;
      const isFast = step.fast === i;
      const isSwapped = (isSlow || isFast) && step.action === 'swap';

      let bg = '#ffffff';
      let border = '2px solid #cbd5e1';
      let textColor = '#0f172a';

      if (val === 0) {
        textColor = '#94a3b8';
        bg = '#f8fafc';
      } else {
        textColor = '#2563eb';
        bg = '#eff6ff';
      }

      if (isSwapped) {
        border = '2px solid #f59e0b';
        bg = '#fef3c7';
      } else if (isFast) {
        border = '2px solid #10b981';
      } else if (isSlow) {
        border = '2px solid #6366f1';
      }

      html += `
        <div style="display: flex; flex-direction: column; align-items: center; width: 40px; position: relative;">
          <!-- 顶部指针标签 (slow / fast) -->
          <div style="height: 18px; display: flex; align-items: center; justify-content: center; gap: 2px;">
            ${isSlow ? '<span style="background: #6366f1; color: white; font-size: 8.5px; font-weight: bold; padding: 1px 3px; border-radius: 4px;">slow</span>' : ''}
            ${isFast ? '<span style="background: #10b981; color: white; font-size: 8.5px; font-weight: bold; padding: 1px 3px; border-radius: 4px;">fast</span>' : ''}
          </div>
          <!-- 数值盒子 -->
          <div style="width: 40px; height: 40px; border-radius: 8px; background: ${bg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease;">
            ${val}
          </div>
          <!-- 下标 -->
          <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">[${i}]</div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    this.canvasContainer.innerHTML = html;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'move-zeroes',
  name: '移动零（双指针原地操作）',
  viewId: 'algo-move-zeroes-view',
  category: 'linked-list',
  description: '快慢双指针原地把所有 0 移到末尾并保持非零元素相对次序',
  icon: '0️⃣',
  template,
  Visualizer: MoveZeroesVisualizer,
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '掌握快慢指针在数组原地覆盖和交换中的应用技巧',
});