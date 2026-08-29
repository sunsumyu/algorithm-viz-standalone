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

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private canvasContainer: HTMLElement | null = null;
  private slowMonitorVal: HTMLElement | null = null;
  private fastMonitorVal: HTMLElement | null = null;
  private curValMonitorVal: HTMLElement | null = null;
  private stepActionDesc: HTMLElement | null = null;
  private stepPhaseBadge: HTMLElement | null = null;
  private execLogStream: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.canvasContainer = this.root.querySelector('#mz-canvas-container');
    this.slowMonitorVal = this.root.querySelector('#slow-monitor-val');
    this.fastMonitorVal = this.root.querySelector('#fast-monitor-val');
    this.curValMonitorVal = this.root.querySelector('#cur-val-monitor-val');
    this.stepActionDesc = this.root.querySelector('#step-action-desc');
    this.stepPhaseBadge = this.root.querySelector('#step-phase-badge');
    this.execLogStream = this.root.querySelector('#exec-log-stream');

    this.bindPlaybackControls();

    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: MOVE_ZEROES_PROBLEM_HTML,
      analysisHtml: MOVE_ZEROES_ANALYSIS_HTML,
      initialLang: 'java',
    });

    this.initProblemModal();
    this.initCustomControls();
  }

  private initProblemModal(): void {
    const openBtn = document.getElementById('open-problem-btn');
    const modal = document.getElementById('problem-modal');
    const closeBtn = document.getElementById('close-modal-btn');
    const tabProblem = document.getElementById('modal-tab-problem');
    const tabAnalysis = document.getElementById('modal-tab-analysis');
    const contentArea = document.getElementById('modal-content-area');

    if (!openBtn || !modal || !closeBtn || !tabProblem || !tabAnalysis || !contentArea) return;

    contentArea.innerHTML = MOVE_ZEROES_PROBLEM_HTML;

    openBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    tabProblem.addEventListener('click', () => {
      tabProblem.classList.add('active');
      tabAnalysis.classList.remove('active');
      contentArea.innerHTML = MOVE_ZEROES_PROBLEM_HTML;
    });

    tabAnalysis.addEventListener('click', () => {
      tabAnalysis.classList.add('active');
      tabProblem.classList.remove('active');
      contentArea.innerHTML = MOVE_ZEROES_ANALYSIS_HTML;
    });
  }

  private initCustomControls(): void {
    const applyBtn = document.getElementById('apply-btn');
    const randomBtn = document.getElementById('random-btn');
    const numsInput = document.getElementById('nums-input') as HTMLInputElement;
    const clearLogBtn = document.getElementById('clear-log-btn');

    if (applyBtn && numsInput) {
      applyBtn.addEventListener('click', () => {
        this.restartWithInputs();
      });
    }

    if (randomBtn && numsInput) {
      randomBtn.addEventListener('click', () => {
        const len = Math.floor(Math.random() * 4) + 5; // 5 to 8
        const arr: number[] = [];
        for (let i = 0; i < len; i++) {
          if (Math.random() > 0.45) {
            arr.push(0);
          } else {
            arr.push(Math.floor(Math.random() * 20) + 1);
          }
        }
        numsInput.value = arr.join(', ');
        this.restartWithInputs();
      });
    }

    if (clearLogBtn && this.execLogStream) {
      clearLogBtn.addEventListener('click', () => {
        if (this.execLogStream) this.execLogStream.innerHTML = '';
      });
    }
  }

  private restartWithInputs(): void {
    const numsInput = document.getElementById('nums-input') as HTMLInputElement;
    const vals = parseValues(numsInput ? numsInput.value : '', [0, 1, 0, 3, 12]);
    if (numsInput) numsInput.value = vals.join(', ');

    if (this.execLogStream) this.execLogStream.innerHTML = '';
    this.steps = buildMoveZeroesSteps(vals);
    this.goToStep(0);
  }

  protected buildSteps(): MoveZeroesStep[] {
    return this.generateSteps();
  }

  public generateSteps(): MoveZeroesStep[] {
    const numsInput = document.getElementById('nums-input') as HTMLInputElement;
    const vals = parseValues(numsInput ? numsInput.value : '', [0, 1, 0, 3, 12]);
    return buildMoveZeroesSteps(vals);
  }

  protected renderStep(step: MoveZeroesStep): void {
    if (!step) return;

    if (this.stepActionDesc) this.stepActionDesc.textContent = step.message;
    if (this.slowMonitorVal) this.slowMonitorVal.textContent = `索引 ${step.slow}`;
    if (this.fastMonitorVal) this.fastMonitorVal.textContent = step.fast < step.nums.length ? `索引 ${step.fast}` : '扫描结束';
    if (this.curValMonitorVal) {
      this.curValMonitorVal.textContent = step.fast < step.nums.length ? String(step.nums[step.fast]) : '-';
    }

    if (this.stepPhaseBadge) {
      if (step.action === 'init') {
        this.stepPhaseBadge.className = 'algo-badge info';
        this.stepPhaseBadge.textContent = '初始化';
      } else if (step.action === 'check_nonzero') {
        this.stepPhaseBadge.className = 'algo-badge primary';
        this.stepPhaseBadge.textContent = '命中非零';
      } else if (step.action === 'swap') {
        this.stepPhaseBadge.className = 'algo-badge warning';
        this.stepPhaseBadge.textContent = '原地交换';
      } else if (step.action === 'check_zero') {
        this.stepPhaseBadge.className = 'algo-badge secondary';
        this.stepPhaseBadge.textContent = '遇到 0 跳过';
      } else if (step.action === 'done') {
        this.stepPhaseBadge.className = 'algo-badge success';
        this.stepPhaseBadge.textContent = '移动完成';
      }
    }

    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    this.renderCanvas(step);
    this.appendLogEntry(step, this.currentStepIndex);
  }

  private renderCanvas(step: MoveZeroesStep): void {
    if (!this.canvasContainer) return;

    const n = step.nums.length;
    let html = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; padding: 24px 0; width: 100%;">
        <div style="font-size: 13px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px;">
          <span>数组内存结构 (长度 ${n})</span>
          <span style="font-size: 11px; font-weight: normal; color: #64748b;">[0..slow-1 为已整理非零区]</span>
        </div>
        <div style="display: flex; gap: 10px; position: relative;">
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
        <div style="display: flex; flex-direction: column; align-items: center; width: 48px; position: relative;">
          <!-- 顶部指针标签 (slow / fast) -->
          <div style="height: 24px; display: flex; align-items: center; justify-content: center; gap: 2px;">
            ${isSlow ? '<span style="background: #6366f1; color: white; font-size: 10px; font-weight: bold; padding: 1px 5px; border-radius: 4px;">slow</span>' : ''}
            ${isFast ? '<span style="background: #10b981; color: white; font-size: 10px; font-weight: bold; padding: 1px 5px; border-radius: 4px;">fast</span>' : ''}
          </div>
          <!-- 数值盒子 -->
          <div style="width: 48px; height: 48px; border-radius: 8px; background: ${bg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 700; color: ${textColor}; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s ease;">
            ${val}
          </div>
          <!-- 下标 -->
          <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace;">[${i}]</div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    this.canvasContainer.innerHTML = html;
  }

  private appendLogEntry(step: MoveZeroesStep, index: number): void {
    if (!this.execLogStream) return;

    if (index === 0) {
      this.execLogStream.innerHTML = '';
    }

    let badgeClass = 'primary';
    let actionName = 'INIT';
    if (step.action === 'check_nonzero') {
      badgeClass = 'info';
      actionName = 'NON_ZERO';
    } else if (step.action === 'swap') {
      badgeClass = 'warning';
      actionName = 'SWAP';
    } else if (step.action === 'check_zero') {
      badgeClass = 'secondary';
      actionName = 'ZERO';
    } else if (step.action === 'done') {
      badgeClass = 'success';
      actionName = 'DONE';
    }

    const item = document.createElement('div');
    item.className = 'exec-log-item';
    item.innerHTML = `
      <span class="log-step-badge">#${String(index + 1).padStart(2, '0')}</span>
      <span class="algo-badge ${badgeClass}" style="font-size: 10px; padding: 1px 5px;">${actionName}</span>
      <span class="log-msg" style="margin-left: 6px; color: #334155; font-size: 12px;">${step.message}</span>
    `;

    this.execLogStream.appendChild(item);
    this.execLogStream.scrollTop = this.execLogStream.scrollHeight;
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