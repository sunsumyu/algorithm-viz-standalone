/**
 * 数组理论基础可视化器 — 4-Card 标准现代架构
 * 演示连续内存布局、随机寻址与插入/删除移动元素
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  ARRAY_THEORY_PROBLEM_HTML,
  ARRAY_THEORY_ANALYSIS_HTML,
  ARRAY_THEORY_CODE_LANGUAGES,
} from './array-theory-problem-content';
import template from './array-theory.html?raw';

export interface ATStep {
  array: (number | null)[];
  action: 'access' | 'insert' | 'delete' | 'search';
  index: number;
  value: number | null;
  shiftCount: number;
  status:
    | 'init'
    | 'access'
    | 'insert-shift'
    | 'insert-place'
    | 'delete-shift'
    | 'delete-remove'
    | 'search-found'
    | 'search-not-found'
    | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildAccessSteps(idx: number): ATStep[] {
  const arr = [3, 5, 7, 11, 15];
  const i = Math.max(0, Math.min(idx, arr.length - 1));
  const hexAddr = `0x${(0x1000 + i * 4).toString(16).toUpperCase()}`;

  return [
    {
      array: [...arr],
      action: 'access',
      index: -1,
      value: null,
      shiftCount: 0,
      status: 'init',
      message: `初始化连续内存数组 arr = [${arr.join(', ')}]，基地址 Base = 0x1000。`,
      log: `初始化数组: Base = 0x1000`,
      codeLine: 1,
    },
    {
      array: [...arr],
      action: 'access',
      index: i,
      value: arr[i],
      shiftCount: 0,
      status: 'access',
      message: `O(1) 随机访问 arr[${i}] = ${arr[i]}：计算物理内存地址 Base + ${i} × 4B = ${hexAddr}，一次寻址直接获取！`,
      log: `访问 arr[${i}] = ${arr[i]}，地址 = ${hexAddr} (O(1))`,
      codeLine: [3, 4],
    },
    {
      array: [...arr],
      action: 'access',
      index: i,
      value: arr[i],
      shiftCount: 0,
      status: 'done',
      message: `🎉 访问完成，返回值 = ${arr[i]}。`,
      log: `完成访问: 返回 ${arr[i]}`,
      codeLine: 4,
    },
  ];
}

export function buildSearchSteps(arr: number[], target: number): ATStep[] {
  const steps: ATStep[] = [];
  let found = false;

  steps.push({
    array: [...arr],
    action: 'search',
    index: -1,
    value: target,
    shiftCount: 0,
    status: 'init',
    message: `在线性数组 [${arr.join(', ')}] 中搜索目标值 target = ${target}。`,
    log: `开始线性搜索 target = ${target}`,
    codeLine: 6,
  });

  for (let i = 0; i < arr.length; i++) {
    const isMatch = arr[i] === target;
    steps.push({
      array: [...arr],
      action: 'search',
      index: i,
      value: target,
      shiftCount: 0,
      status: isMatch ? 'search-found' : 'access',
      message: isMatch
        ? `检查 arr[${i}] = ${target} ✓ 匹配成功！找到目标值下标为 ${i}。`
        : `检查 arr[${i}] = ${arr[i]} ≠ ${target}，继续向后搜索。`,
      log: isMatch ? `找到目标: arr[${i}] == ${target}` : `比对 arr[${i}] != ${target}`,
      codeLine: isMatch ? [9, 10] : [8, 9],
    });
    if (isMatch) {
      found = true;
      break;
    }
  }

  if (!found) {
    steps.push({
      array: [...arr],
      action: 'search',
      index: -1,
      value: target,
      shiftCount: 0,
      status: 'search-not-found',
      message: `遍历完成，数组中不存在元素 ${target}，返回 -1。`,
      log: `未找到目标 ${target}，返回 -1`,
      codeLine: 12,
    });
  }

  return steps;
}

export function buildInsertSteps(arr: number[], insertIdx: number, value: number): ATStep[] {
  const steps: ATStep[] = [];
  const idx = Math.max(0, Math.min(insertIdx, arr.length));
  const work: (number | null)[] = [...arr, null];

  steps.push({
    array: [...work],
    action: 'insert',
    index: -1,
    value,
    shiftCount: 0,
    status: 'init',
    message: `准备在下标 ${idx} 插入元素 ${value}。需要将下标 ${idx} 及其之后的所有元素向后移动一位。`,
    log: `开始插入: 在下标 ${idx} 插入 ${value}`,
    codeLine: 14,
  });

  let shifts = 0;
  for (let j = work.length - 1; j > idx; j--) {
    work[j] = work[j - 1];
    shifts++;
    steps.push({
      array: [...work],
      action: 'insert',
      index: j,
      value,
      shiftCount: shifts,
      status: 'insert-shift',
      message: `后移元素：arr[${j}] = arr[${j - 1}] (${work[j - 1]})（累计移动 ${shifts} 个元素）。`,
      log: `后移: arr[${j}] = ${work[j]}`,
      codeLine: [15, 16],
    });
  }

  work[idx] = value;
  steps.push({
    array: [...work],
    action: 'insert',
    index: idx,
    value,
    shiftCount: shifts,
    status: 'insert-place',
    message: `将新元素 ${value} 放入腾出的空位 arr[${idx}]。`,
    log: `放置新值: arr[${idx}] = ${value}`,
    codeLine: 18,
  });

  steps.push({
    array: [...work],
    action: 'insert',
    index: idx,
    value,
    shiftCount: shifts,
    status: 'done',
    message: `🎉 插入完成！新数组为 [${work.join(', ')}]，总共移动了 ${shifts} 个元素（O(n)）。`,
    log: `插入完成: 移动次数 ${shifts}`,
    codeLine: 18,
  });

  return steps;
}

export function buildDeleteSteps(arr: number[], deleteIdx: number): ATStep[] {
  const steps: ATStep[] = [];
  const idx = Math.max(0, Math.min(deleteIdx, arr.length - 1));
  const work: (number | null)[] = [...arr];

  steps.push({
    array: [...work],
    action: 'delete',
    index: idx,
    value: work[idx],
    shiftCount: 0,
    status: 'init',
    message: `准备删除下标 ${idx} 的元素 ${work[idx]}。需要将下标 ${idx + 1} 之后的所有元素向前移动一位。`,
    log: `开始删除: 删除下标 ${idx} 处元素 ${work[idx]}`,
    codeLine: 14,
  });

  let shifts = 0;
  for (let j = idx; j < work.length - 1; j++) {
    work[j] = work[j + 1];
    shifts++;
    steps.push({
      array: [...work],
      action: 'delete',
      index: j,
      value: null,
      shiftCount: shifts,
      status: 'delete-shift',
      message: `前移覆盖：arr[${j}] = arr[${j + 1}] (${work[j + 1]})（累计移动 ${shifts} 个元素）。`,
      log: `前移: arr[${j}] = ${work[j]}`,
      codeLine: 16,
    });
  }

  work.pop();
  steps.push({
    array: [...work],
    action: 'delete',
    index: -1,
    value: null,
    shiftCount: shifts,
    status: 'done',
    message: `🎉 删除完成！新数组为 [${work.join(', ')}]，总共移动了 ${shifts} 个元素（O(n)）。`,
    log: `删除完成: 移动次数 ${shifts}`,
    codeLine: 18,
  });

  return steps;
}

export class ArrayTheoryVisualizer extends StepVisualizer<ATStep> {
  protected codeLanguages = ARRAY_THEORY_CODE_LANGUAGES;
  protected codeLines = ARRAY_THEORY_CODE_LANGUAGES['java'];
  protected codePanelTitle = '数组基础操作 代码实现';

  private currentOp: 'access' | 'search' | 'insert' | 'delete' = 'access';
  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private trackRowEl: HTMLElement | null = null;
  private metricOpEl: HTMLElement | null = null;
  private metricCompEl: HTMLElement | null = null;
  private metricAddrEl: HTMLElement | null = null;
  private metricShiftEl: HTMLElement | null = null;
  private formulaIdxEl: HTMLElement | null = null;
  private formulaAddrEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.trackRowEl = this.root.querySelector('#at-track-row');
    this.metricOpEl = this.root.querySelector('#metric-op');
    this.metricCompEl = this.root.querySelector('#metric-comp');
    this.metricAddrEl = this.root.querySelector('#metric-addr');
    this.metricShiftEl = this.root.querySelector('#metric-shift');
    this.formulaIdxEl = this.root.querySelector('#formula-idx');
    this.formulaAddrEl = this.root.querySelector('#formula-addr');
    this.liveTextEl = this.root.querySelector('#at-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 操作切换按钮
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.at-op-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.root?.querySelectorAll('.at-op-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentOp = (btn.dataset.op as any) || 'access';
        this.start();
      });
    });

    // 快捷演示 Chips
    this.root.querySelectorAll<HTMLButtonElement>.bind(this.root)('.at-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const demo = btn.dataset.demo;
        if (demo?.startsWith('access')) {
          this.currentOp = 'access';
        } else if (demo?.startsWith('search')) {
          this.currentOp = 'search';
        } else if (demo?.startsWith('insert')) {
          this.currentOp = 'insert';
        } else if (demo?.startsWith('delete')) {
          this.currentOp = 'delete';
        }
        this.root?.querySelectorAll('.at-op-btn').forEach((b) => {
          if ((b as HTMLElement).dataset.op === this.currentOp) b.classList.add('active');
          else b.classList.remove('active');
        });
        this.start();
      });
    });

    // 进度条 Scrubber
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 步进控制
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 速度选择
    const speedSelect = this.root.querySelector('#select-speed') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 600;
      });
    }

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: ARRAY_THEORY_PROBLEM_HTML,
      analysisHtml: ARRAY_THEORY_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): ATStep[] {
    switch (this.currentOp) {
      case 'access':
        return buildAccessSteps(2);
      case 'search':
        return buildSearchSteps([3, 5, 7, 11, 15], 11);
      case 'insert':
        return buildInsertSteps([3, 5, 7, 11, 15], 1, 99);
      case 'delete':
        return buildDeleteSteps([3, 5, 7, 11, 15], 2);
      default:
        return buildAccessSteps(2);
    }
  }

  protected renderStep(step: ATStep): void {
    const { array, action, index, shiftCount, status, message } = step;

    // 1. 渲染物理内存沙盘
    if (this.trackRowEl) {
      this.trackRowEl.innerHTML = array
        .map((num, idx) => {
          const isActive = index === idx && status !== 'done';
          const isShifting = status.includes('shift') && index === idx;
          const hexAddr = `0x${(0x1000 + idx * 4).toString(16).toUpperCase()}`;

          let boxClasses = 'at-cell-box';
          if (isActive) boxClasses += ' is-active';
          if (isShifting) boxClasses += ' is-shifting';

          return `
            <div class="at-cell-wrapper">
              <span class="at-addr" style="font-size: 8.5px; font-family: monospace; color: #2563eb; font-weight: 700;">${hexAddr}</span>
              <div class="${boxClasses}">
                <span class="val">${num !== null ? num : '—'}</span>
                <span class="idx">[${idx}]</span>
              </div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricOpEl) {
      const opNames: Record<string, string> = {
        access: '下标访问',
        search: '线性搜索',
        insert: '元素插入',
        delete: '元素删除',
      };
      this.metricOpEl.textContent = opNames[action] || action;
    }
    if (this.metricCompEl) {
      this.metricCompEl.textContent = action === 'access' ? 'O(1)' : 'O(n)';
      this.metricCompEl.style.color = action === 'access' ? '#10b981' : '#f59e0b';
    }
    if (this.metricAddrEl) {
      this.metricAddrEl.textContent =
        index >= 0 ? `0x${(0x1000 + index * 4).toString(16).toUpperCase()}` : '—';
    }
    if (this.metricShiftEl) {
      this.metricShiftEl.textContent = `${shiftCount} 次`;
    }

    if (this.formulaIdxEl) this.formulaIdxEl.textContent = index >= 0 ? String(index) : 'i';
    if (this.formulaAddrEl) {
      this.formulaAddrEl.textContent =
        index >= 0 ? `0x${(0x1000 + index * 4).toString(16).toUpperCase()}` : '0x1000 + i*4B';
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = status === 'done' ? '#f0fdf4' : '#eff6ff';
      logEntry.style.color = status === 'done' ? '#15803d' : '#1d4ed8';
      logEntry.style.border = '1px solid ' + (status === 'done' ? '#bbf7d0' : '#bfdbfe');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 4. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 5. 更新底部播放控制条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(this.steps.length - 1);
      slider.value = String(this.currentStepIndex);
    }
    const indicator = this.root?.querySelector('#step-indicator');
    if (indicator) {
      indicator.textContent = `步骤 ${this.currentStepIndex + 1} / ${this.steps.length}`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'array-theory',
  name: '数组理论基础',
  viewId: 'algo-array-theory-view',
  category: 'array',
  description: '数组的内存布局、基本操作和时间复杂度',
  icon: '📖',
  difficulty: 1,
  levelOrder: 0,
  learningGoal: '理解数组的连续内存特性和基本操作',
  template,
  Visualizer: ArrayTheoryVisualizer,
});
