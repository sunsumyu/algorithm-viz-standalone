/**
 * 划分字母区间可视化器（贪心算法）
 * LeetCode 763: 将字符串划分为尽可能多的片段
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './partition-labels.html?raw';

export type PlPhase = 'init' | 'scan' | 'contract' | 'mark' | 'cut' | 'done';

interface PartitionLabelsStep {
  phase: PlPhase;
  string: string;
  currentIndex: number;
  currentEnd: number;
  lastOccurrence: Record<string, number>;
  partitions: number[];
  message: string;
  codeLine: number;
}

/**
 * 划分字母区间算法（贪心），生成可视化步骤
 */
function partitionLabelsSteps(s: string): PartitionLabelsStep[] {
  const steps: PartitionLabelsStep[] = [];

  // 记录每个字符最后出现的位置
  const lastOccurrence: Record<string, number> = {};
  for (let i = 0; i < s.length; i++) {
    lastOccurrence[s[i]] = i;
  }

  let start = 0;
  let end = 0;
  const partitions: number[] = [];

  // 初始
  steps.push({
    phase: 'init',
    string: s,
    currentIndex: -1,
    currentEnd: 0,
    lastOccurrence,
    partitions,
    message: '计算每个字符的最后出现位置，更新起点与终点',
    codeLine: 8
  });

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    const lastPos = lastOccurrence[char];

    // 扫描阶段：高亮当前字符
    steps.push({
      phase: 'scan',
      string: s,
      currentIndex: i,
      currentEnd: end,
      lastOccurrence: { ...lastOccurrence },
      partitions: [...partitions],
      message: `位置 ${i}: 字符 '${char}' 最后出现位置=${lastPos}`,
      codeLine: 11
    });

    // 收缩阶段：更新区间终点
    end = Math.max(end, lastPos);

    steps.push({
      phase: 'contract',
      string: s,
      currentIndex: i,
      currentEnd: end,
      lastOccurrence: { ...lastOccurrence },
      partitions: [...partitions],
      message: `更新区间终点: max(${end === lastPos ? '原终点' : end}, ${lastPos}) = ${end}`,
      codeLine: 11
    });

    // 划分阶段：到达终点
    if (i === end) {
      partitions.push(end - start + 1);

      steps.push({
        phase: 'mark',
        string: s,
        currentIndex: i,
        currentEnd: end,
        lastOccurrence: { ...lastOccurrence },
        partitions: [...partitions],
        message: `到达区间终点 ${i}，标记最大长度=${end - start + 1}`,
        codeLine: 13
      });

      start = i + 1;
      end = i + 1;
    }
  }

  // 完成
  steps.push({
    phase: 'done',
    string: s,
    currentIndex: s.length,
    currentEnd: s.length - 1,
    lastOccurrence: { ...lastOccurrence },
    partitions: [...partitions],
    message: `完成！划分结果: [${partitions.join(', ')}]`,
    codeLine: 15
  });

  return steps;
}

export class PartitionLabelsVisualizer extends StepVisualizer<PartitionLabelsStep> {
  protected codeLines = [
    "public List<Integer> partitionLabels(String s) {",
    "    // 记录每个字符最后出现的位置",
    "    int[] lastOcc = new int[26];",
    "    for (int i = 0; i < s.length(); i++) {",
    "        lastOcc[s.charAt(i) - 'a'] = i;",
    "    }",
    "    ",
    "    List<Integer> result = new ArrayList<>();",
    "    int start = 0, end = 0;",
    "    ",
    "    for (int i = 0; i < s.length(); i++) {",
    "        end = Math.max(end, lastOcc[s.charAt(i) - 'a']);",
    "        if (i == end) {",
    "            result.add(i - start + 1);",
    "            start = i + 1;",
    "        }",
    "    }",
    "    return result;",
    "}"
  ];
  protected codePanelTitle = '贪心算法 (Java)';

  private inputField: HTMLInputElement | null = null;
  private canvasEl: HTMLElement | null = null;
  private currentIndexEl: HTMLElement | null = null;
  private currentEndEl: HTMLElement | null = null;
  private partitionSizeEl: HTMLElement | null = null;
  private partitionCountEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private stepMessageEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.inputField = this.root.querySelector('#partition-input');
    this.canvasEl = this.root.querySelector('#pl-canvas');
    this.currentIndexEl = this.root.querySelector('#current-index');
    this.currentEndEl = this.root.querySelector('#current-end');
    this.partitionSizeEl = this.root.querySelector('#partition-size');
    this.partitionCountEl = this.root.querySelector('#partition-count');
    this.resultEl = this.root.querySelector('#pl-result');
    this.stepMessageEl = this.root.querySelector('#step-message');
    this.logEl = this.root.querySelector('#pl-log');

    this.bindPlaybackControls({
      reset: 'step-reset',
      prev: 'step-prev',
      play: 'step-play',
      next: 'step-next',
      speed: 'pl-speed',
      speedLabel: 'pl-speed-label',
      message: 'partition-status'
    });

    this.root.querySelector('#partition-start')?.addEventListener('click', () => this.start());

    this.root.querySelector('#pl-log-clear')?.addEventListener('click', () => {
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  protected buildSteps(): PartitionLabelsStep[] {
    let s = 'ababcbacadefegdehijhklij';

    if (this.inputField) {
      const input = this.inputField.value.trim();
      if (input) {
        s = input;
      }
    }

    return partitionLabelsSteps(s);
  }

  protected renderStep(step: PartitionLabelsStep): void {
    const canvasEl = this.canvasEl;
    if (!canvasEl || !this.currentIndexEl || !this.currentEndEl ||
        !this.partitionSizeEl || !this.partitionCountEl || !this.resultEl || !this.stepMessageEl) return;

    // 更新统计面板
    this.currentIndexEl.textContent = step.currentIndex < 0 ? '-' : step.currentIndex.toString();
    this.currentEndEl.textContent = step.currentEnd < 0 ? '-' : step.currentEnd.toString();

    const currentPartitionStart = step.partitions.reduce((a, b) => a + b, 0);
    const currentLength = step.currentIndex >= currentPartitionStart && step.currentIndex < step.string.length
      ? step.currentEnd - currentPartitionStart + 1
      : 0;
    this.partitionSizeEl.textContent = currentLength > 0 ? currentLength.toString() : '-';
    this.partitionCountEl.textContent = step.partitions.length.toString();

    // 更新结果横幅
    this.resultEl.className = 'pl-result';
    if (step.phase === 'done') {
      this.resultEl.classList.add('pl-result--done');
      this.stepMessageEl.textContent = `✅ ${step.message}`;
    } else if (step.phase === 'mark') {
      this.resultEl.classList.add('pl-result--cut');
      this.stepMessageEl.textContent = `✂ ${step.message}`;
    } else if (step.currentIndex >= 0) {
      this.stepMessageEl.textContent = step.message;
    } else {
      this.stepMessageEl.textContent = '点击「开始划分」观看扫描 + 追踪 + 切割动画';
    }

    // 渲染字符网格
    canvasEl.innerHTML = '';

    // 字符行
    const track = document.createElement('div');
    track.className = 'pl-track';

    // 计算每个已划分片段的覆盖区间
    const partitionRanges: Array<{ start: number; end: number }> = [];
    let acc = 0;
    for (const len of step.partitions) {
      partitionRanges.push({ start: acc, end: acc + len - 1 });
      acc += len;
    }

    step.string.split('').forEach((char: string, idx: number) => {
      const cell = document.createElement('div');
      cell.className = 'pl-char';
      cell.dataset.idx = idx.toString();

      // 是否在已划分片段中
      let inPartition = false;
      let isPartitionEnd = false;
      for (const r of partitionRanges) {
        if (idx >= r.start && idx <= r.end) {
          inPartition = true;
          if (idx === r.end) isPartitionEnd = true;
          break;
        }
      }

      // 当前正在构建的区间
      const inProgress = step.phase !== 'init' && step.phase !== 'done'
        && idx >= currentPartitionStart && idx <= step.currentEnd;

      if (step.currentIndex >= 0 && idx === step.currentIndex) {
        cell.classList.add('pl-char--current');
      } else if (inPartition) {
        cell.classList.add('pl-char--partitioned');
      } else if (inProgress) {
        cell.classList.add('pl-char--in-partition');
      }

      // 区间终点高亮
      if (idx === step.currentEnd && (step.phase === 'contract' || step.phase === 'mark')) {
        cell.classList.add('pl-char--end');
      }

      cell.innerHTML = `
        <span>${char}</span>
        <span class="pl-idx">${idx}</span>
      `;
      track.appendChild(cell);

      // 切割线
      if (isPartitionEnd && (step.phase === 'mark' || step.phase === 'cut' || step.phase === 'done')) {
        const cut = document.createElement('div');
        cut.className = 'pl-cut';
        cut.style.left = `${(idx + 1) * 36 - 4}px`;
        track.appendChild(cut);
      }
    });
    canvasEl.appendChild(track);

    // 最后出现位置行
    const occTrack = document.createElement('div');
    occTrack.className = 'pl-occ-track';
    const chars = Object.keys(step.lastOccurrence).sort();
    const currentChar = step.currentIndex >= 0 ? step.string[step.currentIndex] : '';

    chars.forEach((char: string) => {
      const item = document.createElement('div');
      item.className = 'pl-occ-item';
      item.innerHTML = `<span class="pl-occ-char">${char}</span><span class="pl-occ-pos">${step.lastOccurrence[char]}</span>`;
      if (char === currentChar) item.classList.add('pl-occ--highlight');
      occTrack.appendChild(item);
    });
    canvasEl.appendChild(occTrack);

    // 渲染日志
    this.renderLogPanel(step);
  }

  protected renderLogPanel(step: PartitionLabelsStep): void {
    const log = this.logEl;
    if (!log) return;

    const line = document.createElement('div');
    line.className = 'pl-log-line';
    if (step.phase === 'scan' || step.phase === 'contract' || step.phase === 'mark') {
      line.classList.add('pl-log-active');
    }

    const num = document.createElement('span');
    num.className = 'pl-log-num';
    num.textContent = step.codeLine.toString().padStart(2, '0') + ': ';
    line.appendChild(num);

    const msg = document.createElement('span');
    msg.textContent = step.message;
    line.appendChild(msg);

    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }
}

registerAlgorithm({
  id: 'partition-labels',
  name: '划分字母区间',
  viewId: 'algo-partition-labels-view',
  category: 'greedy',
  description: 'LeetCode 763：贪心算法，将字符串划分为尽可能多的片段',
  icon: '🔤',
  template,
  Visualizer: PartitionLabelsVisualizer,
  difficulty: 2,
  levelOrder: 15,
  learningGoal: '掌握字母区间分割的贪心思路',
});
