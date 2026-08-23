/**
 * 合并区间可视化器（排序 + 贪心）
 */

import { IVisualizer, VisualizerContext } from '../../../core/interfaces';
import { CodePanel, HighlightTarget } from '../../../core/code-panel';
import { registerAlgorithm } from '../../../core/registry';
import template from './merge-intervals.html?raw';

type Interval = [number, number];

interface MergeStep {
  intervals: Interval[];
  result: Interval[];
  currentIndex: number;
  status: 'ready' | 'sort' | 'check' | 'merge' | 'append' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
}

function cloneIntervals(intervals: Interval[]): Interval[] {
  return intervals.map(([start, end]) => [start, end]);
}

function buildMergeSteps(intervals: Interval[]): MergeStep[] {
  const steps: MergeStep[] = [];

  if (intervals.length === 0) {
    return [{
      intervals: [],
      result: [],
      currentIndex: -1,
      status: 'done',
      message: '输入为空，返回空数组。',
      log: '输入为空。',
      codeLine: 2,
    }];
  }

  const sorted = cloneIntervals(intervals).sort((a, b) => a[0] - b[0]);
  steps.push({
    intervals: cloneIntervals(sorted),
    result: [],
    currentIndex: -1,
    status: 'sort',
    message: `先按左端点排序：${sorted.map(([s, e]) => `[${s},${e}]`).join(', ')}`,
    log: '按左端点从小到大排序。',
    codeLine: 3,
  });

  const result: Interval[] = [];
  result.push([...sorted[0]] as Interval);
  steps.push({
    intervals: cloneIntervals(sorted),
    result: cloneIntervals(result),
    currentIndex: 0,
    status: 'ready',
    message: `把第一个区间 [${sorted[0][0]},${sorted[0][1]}] 放入结果数组。`,
    log: `初始化结果数组：merged = [[${sorted[0][0]},${sorted[0][1]}]]。`,
    codeLine: 4,
  });

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = result[result.length - 1];

    steps.push({
      intervals: cloneIntervals(sorted),
      result: cloneIntervals(result),
      currentIndex: i,
      status: 'check',
      message: `比较当前区间 [${current[0]},${current[1]}] 与结果末尾 [${last[0]},${last[1]}]。`,
      log: `检查 [${current[0]},${current[1]}] 是否与 [${last[0]},${last[1]}] 重叠。`,
      codeLine: { from: 6, to: 7 },
    });

    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
      steps.push({
        intervals: cloneIntervals(sorted),
        result: cloneIntervals(result),
        currentIndex: i,
        status: 'merge',
        message: `发生重叠：${current[0]} <= ${last[1]}，合并后末尾区间变为 [${last[0]},${last[1]}]。`,
        log: `重叠，更新右边界为 max(lastEnd, currentEnd) = ${last[1]}。`,
        codeLine: 8,
      });
    } else {
      result.push([...current] as Interval);
      steps.push({
        intervals: cloneIntervals(sorted),
        result: cloneIntervals(result),
        currentIndex: i,
        status: 'append',
        message: `不重叠：${current[0]} > ${last[1]}，把 [${current[0]},${current[1]}] 加入结果数组。`,
        log: `不重叠，追加新区间 [${current[0]},${current[1]}]。`,
        codeLine: 10,
      });
    }
  }

  steps.push({
    intervals: cloneIntervals(sorted),
    result: cloneIntervals(result),
    currentIndex: sorted.length,
    status: 'done',
    message: `合并完成，结果为 ${result.map(([s, e]) => `[${s},${e}]`).join(', ')}。`,
    log: '返回合并后的结果数组。',
    codeLine: 13,
  });

  return steps;
}

export class MergeIntervalsVisualizer implements IVisualizer {
  private root: HTMLElement | null = null;
  private codePanel: CodePanel | null = null;
  private steps: MergeStep[] = [];
  private currentIndex = 0;
  private isPlaying = false;
  private timer: number | null = null;
  private speed = 900;

  private inputEl: HTMLInputElement | null = null;
  private btnStart: HTMLButtonElement | null = null;
  private btnReset: HTMLButtonElement | null = null;
  private btnPrev: HTMLButtonElement | null = null;
  private btnPlay: HTMLButtonElement | null = null;
  private btnNext: HTMLButtonElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private lanesEl: HTMLElement | null = null;
  private messageEl: HTMLElement | null = null;
  private messageTextEl: HTMLElement | null = null;
  private messageEmojiEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private counterEl: HTMLElement | null = null;
  private speedSlider: HTMLInputElement | null = null;
  private speedLabel: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  private codeLines = [
    'public int[][] merge(int[][] intervals) {',
    '    if (intervals.length == 0) return new int[0][];',
    '    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);',
    '    List<int[]> merged = new ArrayList<>();',
    '    merged.add(intervals[0]);',
    '',
    '    for (int i = 1; i < intervals.length; i++) {',
    '        int[] last = merged.get(merged.size() - 1);',
    '        if (intervals[i][0] <= last[1]) {',
    '            last[1] = Math.max(last[1], intervals[i][1]);',
    '        } else {',
    '            merged.add(intervals[i]);',
    '        }',
    '    }',
    '    return merged.toArray(new int[merged.size()][]);',
    '}',
  ];

  public async init(context?: VisualizerContext): Promise<void> {
    this.root = context?.root || document.getElementById('algo-merge-intervals-view');
    this.initDOMElements();
    this.initCodePanel();
    this.setupEvents();
    if (this.speedLabel) this.speedLabel.textContent = (this.speed / 1000).toFixed(1) + 's';
    await this.start();
  }

  private initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#merge-intervals-input') as HTMLInputElement;
    this.btnStart = this.root.querySelector('#merge-start') as HTMLButtonElement;
    this.btnReset = this.root.querySelector('#merge-reset') as HTMLButtonElement;
    this.btnPrev = this.root.querySelector('#merge-prev') as HTMLButtonElement;
    this.btnPlay = this.root.querySelector('#merge-play') as HTMLButtonElement;
    this.btnNext = this.root.querySelector('#merge-next') as HTMLButtonElement;
    this.exampleButtons = this.root.querySelectorAll('.merge-example-btn') as NodeListOf<HTMLButtonElement>;
    this.lanesEl = this.root.querySelector('#merge-lanes') as HTMLElement;
    this.messageEl = this.root.querySelector('#merge-message') as HTMLElement;
    this.logEl = this.root.querySelector('#merge-log') as HTMLElement;
    this.currentEl = this.root.querySelector('#merge-current') as HTMLElement;
    this.countEl = this.root.querySelector('#merge-count') as HTMLElement;
    this.statusEl = this.root.querySelector('#merge-status') as HTMLElement;
    this.counterEl = this.root.querySelector('#merge-counter') as HTMLElement;
    this.speedSlider = this.root.querySelector('#merge-speed') as HTMLInputElement;
    this.speedLabel = this.root.querySelector('#merge-speed-label') as HTMLElement;
    this.clearLogBtn = this.root.querySelector('#merge-log-clear') as HTMLButtonElement;
    if (this.messageEl) {
      this.messageTextEl = this.messageEl.querySelector('div');
      this.messageEmojiEl = this.messageEl.querySelector('.merge-emoji');
    }
  }

  private initCodePanel(): void {
    const container = this.root?.querySelector('[data-code-panel]') as HTMLElement | null;
    if (container) {
      this.codePanel = new CodePanel(container, { lines: this.codeLines, title: '合并区间代码 (Java)' });
    }
  }

  private setupEvents(): void {
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    if (this.btnReset) this.btnReset.onclick = () => this.reset();
    if (this.btnPrev) this.btnPrev.onclick = () => this.prevStep();
    if (this.btnNext) this.btnNext.onclick = () => this.nextStep();
    if (this.btnPlay) this.btnPlay.onclick = () => this.togglePlay();
    if (this.speedSlider && this.speedLabel) {
      this.speedSlider.oninput = () => {
        this.speed = parseInt(this.speedSlider?.value || '900');
        if (this.speedLabel) this.speedLabel.textContent = (this.speed / 1000).toFixed(1) + 's';
      };
    }
    if (this.clearLogBtn) {
      this.clearLogBtn.onclick = () => {
        if (this.logEl) this.logEl.innerHTML = '';
      };
    }
    this.exampleButtons?.forEach((button) => {
      button.onclick = () => {
        if (this.inputEl) this.inputEl.value = button.dataset.value || '';
        this.start();
      };
    });
  }

  private async start(): Promise<void> {
    this.pause();
    const intervals = this.parseIntervals(this.inputEl?.value || '');
    const valid = intervals.length > 0 ? intervals : [[1, 3], [2, 6], [8, 10], [15, 18]] as Interval[];
    if (this.inputEl && intervals.length === 0) this.inputEl.value = '[1,3],[2,6],[8,10],[15,18]';
    this.steps = buildMergeSteps(valid);
    this.currentIndex = 0;
    this.render();
    this.updateButtons();
  }

  private parseIntervals(input: string): Interval[] {
    const matches = input.match(/\[\s*-?\d+\s*,\s*-?\d+\s*\]/g) || [];
    return matches.map((match) => {
      const nums = match.match(/-?\d+/g)?.map(Number) || [0, 0];
      return nums[0] <= nums[1] ? [nums[0], nums[1]] : [nums[1], nums[0]];
    });
  }

  private render(): void {
    if (this.steps.length === 0) return;
    const step = this.steps[this.currentIndex];
    if (this.messageTextEl) this.messageTextEl.textContent = step.message;
    if (this.messageEl) {
      this.messageEl.classList.remove('merge-result--done', 'merge-result--merge');
      if (step.status === 'done') this.messageEl.classList.add('merge-result--done');
      else if (step.status === 'merge') this.messageEl.classList.add('merge-result--merge');
    }
    if (this.messageEmojiEl) {
      const emojiMap: Record<MergeStep['status'], string> = {
        ready: '🧩', sort: '↕️', check: '🔍', merge: '🔀', append: '➕', done: '✅',
      };
      this.messageEmojiEl.textContent = emojiMap[step.status];
    }
    if (this.currentEl) this.currentEl.textContent = step.currentIndex >= 0 && step.currentIndex < step.intervals.length ? `[${step.intervals[step.currentIndex].join(',')}]` : '-';
    if (this.countEl) this.countEl.textContent = String(step.result.length);
    if (this.statusEl) this.statusEl.textContent = this.statusText(step.status);
    if (this.counterEl) this.counterEl.textContent = `${this.currentIndex + 1} / ${this.steps.length}`;
    this.renderLanes(step);
    this.renderLog();
    this.codePanel?.highlight(step.codeLine);
  }

  private renderLanes(step: MergeStep): void {
    if (!this.lanesEl) return;
    this.lanesEl.innerHTML = '';
    const all = [...step.intervals, ...step.result];
    const min = Math.min(...all.map(([s]) => s), 0);
    const max = Math.max(...all.map(([, e]) => e), min + 1);
    this.lanesEl.appendChild(this.createLane('排序后的区间', step.intervals, step.currentIndex, min, max, false, step.status));
    this.lanesEl.appendChild(this.createLane('当前合并结果', step.result, -1, min, max, true, step.status));
  }

  private createLane(title: string, intervals: Interval[], currentIndex: number, min: number, max: number, merged: boolean, stepStatus: MergeStep['status']): HTMLElement {
    const wrapper = document.createElement('div');
    const titleEl = document.createElement('div');
    titleEl.className = 'merge-lane-title';
    titleEl.textContent = title;
    const axis = document.createElement('div');
    axis.className = 'merge-axis';
    const axisLine = document.createElement('div');
    axisLine.className = 'merge-axis-line';
    axis.appendChild(axisLine);

    const span = Math.max(1, max - min);
    intervals.forEach(([start, end], index) => {
      const segment = document.createElement('div');
      segment.className = 'merge-segment';
      if (index === currentIndex) segment.classList.add('current');
      if (merged) {
        segment.classList.add('merged');
        // 最新追加的那一段（最后一项，且 status 为 append）触发 pop-in
        if (stepStatus === 'append' && index === intervals.length - 1) {
          segment.classList.add('merge-seg--appended');
        }
        // 合并发生时，结果末尾段触发 merge-shake
        if (stepStatus === 'merge' && index === intervals.length - 1) {
          segment.classList.add('merge-seg--merged');
        }
      }
      segment.style.left = `${18 + ((start - min) / span) * 86}%`;
      segment.style.width = `${Math.max(8, ((end - start) / span) * 86)}%`;
      segment.style.top = `${22 + (index % 2) * 34}px`;
      segment.textContent = `[${start},${end}]`;
      axis.appendChild(segment);
    });

    wrapper.appendChild(titleEl);
    wrapper.appendChild(axis);
    return wrapper;
  }

  private renderLog(): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((step, index) => {
      const line = document.createElement('div');
      line.className = 'merge-log-line' + (index === this.currentIndex ? ' active' : '');
      line.innerHTML = `<span class="merge-log-num">${String(index + 1).padStart(2, '0')}</span><span>${step.log}</span>`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  private statusText(status: MergeStep['status']): string {
    const map: Record<MergeStep['status'], string> = {
      ready: '初始化',
      sort: '排序',
      check: '比较',
      merge: '合并',
      append: '新增',
      done: '完成',
    };
    return map[status];
  }

  private togglePlay(): void {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  private play(): void {
    if (this.currentIndex >= this.steps.length - 1) return;
    this.isPlaying = true;
    this.tick();
    this.updateButtons();
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updateButtons();
  }

  private tick(): void {
    if (!this.isPlaying) return;
    this.timer = window.setTimeout(() => {
      if (this.currentIndex < this.steps.length - 1) {
        this.nextStep();
        this.tick();
      } else {
        this.pause();
      }
    }, this.speed);
  }

  private nextStep(): void {
    if (this.currentIndex >= this.steps.length - 1) return;
    this.currentIndex++;
    this.render();
    this.updateButtons();
  }

  private prevStep(): void {
    if (this.currentIndex <= 0) return;
    this.currentIndex--;
    this.render();
    this.updateButtons();
  }

  private reset(): void {
    this.pause();
    this.currentIndex = 0;
    this.render();
    this.updateButtons();
  }

  private updateButtons(): void {
    if (!this.btnPrev || !this.btnNext || !this.btnPlay) return;
    const finished = this.currentIndex >= this.steps.length - 1;
    this.btnPrev.disabled = this.currentIndex === 0;
    this.btnNext.disabled = finished;
    this.btnPlay.disabled = finished;
    this.btnPlay.textContent = this.isPlaying ? '暂停' : finished ? '完成' : '播放';
  }

  public destroy(): void {
    this.pause();
    this.steps = [];
    this.currentIndex = 0;
  }
}

registerAlgorithm({
  id: 'merge-intervals',
  name: '合并区间',
  viewId: 'algo-merge-intervals-view',
  category: 'greedy',
  description: 'LeetCode 56：贪心算法，排序后逐个合并重叠区间',
  icon: '🧩',
  template,
  Visualizer: MergeIntervalsVisualizer,
  difficulty: 2,
  levelOrder: 16,
  learningGoal: '理解区间合并的排序加贪心策略',
});
