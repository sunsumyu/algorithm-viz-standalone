/**
 * 根据身高重建队列可视化器（贪心算法）
 * LeetCode 406
 * 重做：玻璃感 stat 面板 + 排序高亮 + 计数扫描 + 弹性 pop-in 插入
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './reconstruct-queue.html?raw';

interface Person {
  height: number;
  k: number;
}

type Phase = 'init' | 'sort' | 'highlight' | 'count' | 'insert' | 'done';

interface RQStep {
  /** 排序后的人员序列（始终保持不变，作为待处理源） */
  sorted: Person[];
  /** 当前正在处理的人在 sorted 中的下标；-1 表示无 */
  processingIndex: number;
  /** 当前队列快照 */
  queue: Person[];
  /** 当前要插入的目标位置（count 阶段扫描终点 / insert 阶段插入点） */
  insertIndex: number;
  /** count 阶段：当前正在扫描的队列下标；-1 表示不在扫描 */
  scanIndex: number;
  /** count 阶段：到目前为止已数到的"前方更高或等高"的人数 */
  countedSoFar: number;
  /** 当前阶段 */
  phase: Phase;
  message: string;
  log: string;
  codeLine: number | number[];
}

/**
 * 生成可视化步骤：每个人员的处理拆为 highlight → count → insert 三个子步骤
 */
function reconstructQueueSteps(people: Person[]): RQStep[] {
  const steps: RQStep[] = [];

  if (people.length === 0) {
    steps.push({
      sorted: [], processingIndex: -1, queue: [], insertIndex: -1, scanIndex: -1,
      countedSoFar: 0, phase: 'init',
      message: '输入为空，返回 []', log: 'init: empty input', codeLine: 1,
    });
    return steps;
  }

  // 按身高降序排序，身高相同则按 k 升序
  const sorted = [...people].sort((a, b) => {
    if (a.height !== b.height) return b.height - a.height;
    return a.k - b.k;
  });

  steps.push({
    sorted: [...sorted], processingIndex: -1, queue: [], insertIndex: -1, scanIndex: -1,
    countedSoFar: 0, phase: 'sort',
    message: `按 [身高降序, k 升序] 排序：${sorted.map(p => `[${p.height},${p.k}]`).join(', ')}`,
    log: `sort → ${sorted.map(p => `[${p.height},${p.k}]`).join(',')}`,
    codeLine: [2, 3, 4, 5],
  });

  const queue: Person[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const person = sorted[i];
    const targetK = person.k;

    // 1) highlight：在 sorted 区高亮当前人员
    steps.push({
      sorted: [...sorted], processingIndex: i, queue: [...queue], insertIndex: targetK,
      scanIndex: -1, countedSoFar: 0, phase: 'highlight',
      message: `取出第 ${i + 1} 个人员 [${person.height}, ${person.k}]，准备插入到位置 ${targetK}。`,
      log: `pick #${i + 1} = [${person.height},${person.k}], target k=${targetK}`,
      codeLine: 7,
    });

    // 2) count：从左扫描队列，数到第 k 个位置
    //     扫描时逐位推进，每步 countedSoFar +1，直到 countedSoFar === k
    let counted = 0;
    let scanPos = 0;
    while (scanPos < queue.length && counted < targetK) {
      // 已在队列中的所有元素都 ≥ 当前 person.height（因为先插高的）
      counted++;
      steps.push({
        sorted: [...sorted], processingIndex: i, queue: [...queue], insertIndex: targetK,
        scanIndex: scanPos, countedSoFar: counted, phase: 'count',
        message: `扫描位置 ${scanPos}（队列中的人 [${queue[scanPos].height}, ${queue[scanPos].k}]），已计数 ${counted} / ${targetK}。`,
        log: `scan pos=${scanPos}, counted=${counted}/${targetK}`,
        codeLine: 8,
      });
      scanPos++;
    }
    // 到达目标位置
    if (targetK > 0) {
      steps.push({
        sorted: [...sorted], processingIndex: i, queue: [...queue], insertIndex: targetK,
        scanIndex: scanPos, countedSoFar: counted, phase: 'count',
        message: `计数完成：前方已有 ${counted} 人 ≥ ${person.height}，插入位置 = ${scanPos}。`,
        log: `count done: insert @ pos=${scanPos}`,
        codeLine: 8,
      });
    } else {
      steps.push({
        sorted: [...sorted], processingIndex: i, queue: [...queue], insertIndex: 0,
        scanIndex: 0, countedSoFar: 0, phase: 'count',
        message: `k=0，直接插入到队首。`,
        log: `k=0, insert @ head`,
        codeLine: 8,
      });
    }

    // 3) insert：真正插入
    queue.splice(targetK, 0, person);
    steps.push({
      sorted: [...sorted], processingIndex: i, queue: [...queue], insertIndex: targetK,
      scanIndex: -1, countedSoFar: targetK, phase: 'insert',
      message: `插入 [${person.height}, ${person.k}] 到位置 ${targetK}。当前队列：${queue.map(p => `[${p.height},${p.k}]`).join(', ')}`,
      log: `insert [${person.height},${person.k}] @ ${targetK} → [${queue.map(p => `[${p.height},${p.k}]`).join(',')}]`,
      codeLine: 9,
    });
  }

  // done
  steps.push({
    sorted: [...sorted], processingIndex: sorted.length, queue: [...queue], insertIndex: -1,
    scanIndex: -1, countedSoFar: 0, phase: 'done',
    message: `✅ 完成！最终队列：${queue.map(p => `[${p.height},${p.k}]`).join(', ')}`,
    log: `done → [${queue.map(p => `[${p.height},${p.k}]`).join(',')}]`,
    codeLine: 11,
  });

  return steps;
}

export class ReconstructQueueVisualizer extends StepVisualizer<RQStep> {
  protected codeLines = [
    'public int[][] reconstructQueue(int[][] people) {',
    '    // 按 [身高降序, k 升序] 排序',
    '    Arrays.sort(people, (a, b) -> {',
    '        if (a[0] != b[0]) return b[0] - a[0];',
    '        return a[1] - b[1];',
    '    });',
    '    List<int[]> queue = new ArrayList<>();',
    '    for (int[] person : people) {',
    '        queue.add(person[1], person);',
    '    }',
    '    return queue.toArray(new int[queue.size()][]);',
    '}',
  ];
  protected codePanelTitle = '贪心算法 · 重建队列 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private sourceEl: HTMLElement | null = null;
  private queueEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private statCurrent: HTMLElement | null = null;
  private statH: HTMLElement | null = null;
  private statK: HTMLElement | null = null;
  private statPos: HTMLElement | null = null;
  private statDone: HTMLElement | null = null;
  private exampleBtns: NodeListOf<HTMLButtonElement> | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#rq-input');
    this.sourceEl = this.root.querySelector('#rq-source');
    this.queueEl = this.root.querySelector('#rq-queue');
    this.logEl = this.root.querySelector('#rq-log');
    this.resultEl = this.root.querySelector('#rq-result');
    this.statCurrent = this.root.querySelector('#rq-stat-current');
    this.statH = this.root.querySelector('#rq-stat-h');
    this.statK = this.root.querySelector('#rq-stat-k');
    this.statPos = this.root.querySelector('#rq-stat-pos');
    this.statDone = this.root.querySelector('#rq-stat-done');
    this.exampleBtns = this.root.querySelectorAll('.rq-chip');
    this.clearLogBtn = this.root.querySelector('#rq-log-clear');

    this.bindPlaybackControls({ message: 'step-message' });

    const startBtn = this.root.querySelector('#rq-start');
    if (startBtn) startBtn.addEventListener('click', () => this.start());

    this.exampleBtns?.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        this.start();
      });
    });

    if (this.clearLogBtn) {
      this.clearLogBtn.addEventListener('click', () => {
        if (this.logEl) this.logEl.innerHTML = '';
      });
    }
  }

  protected buildSteps(): RQStep[] {
    const defaultPeople: Person[] = [
      { height: 7, k: 0 }, { height: 4, k: 4 }, { height: 7, k: 1 },
      { height: 5, k: 0 }, { height: 6, k: 1 }, { height: 5, k: 2 },
    ];
    let people = defaultPeople;
    if (this.inputEl) {
      const input = this.inputEl.value.trim();
      if (input) {
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed) && parsed.length > 0) {
            people = parsed.map((p: number[]) => ({ height: p[0], k: p[1] }));
          }
        } catch {
          // 尝试逗号分隔解析
          const nums = input.split(/[,，\s]+/).map((n) => parseInt(n.trim(), 10)).filter(Number.isFinite);
          if (nums.length > 0 && nums.length % 2 === 0) {
            people = [];
            for (let i = 0; i < nums.length; i += 2) {
              people.push({ height: nums[i], k: nums[i + 1] });
            }
          }
        }
      }
    }
    return reconstructQueueSteps(people);
  }

  protected renderStep(step: RQStep): void {
    this.renderStats(step);
    this.renderSource(step);
    this.renderQueue(step);
    this.renderResultBanner(step);
    this.renderLogPanel();
  }

  private renderStats(step: RQStep): void {
    if (this.statCurrent) {
      if (step.processingIndex >= 0 && step.processingIndex < step.sorted.length) {
        const p = step.sorted[step.processingIndex];
        this.statCurrent.textContent = `[${p.height},${p.k}]`;
      } else if (step.phase === 'done') {
        this.statCurrent.textContent = '完成';
      } else {
        this.statCurrent.textContent = '-';
      }
    }
    if (this.statH) {
      if (step.processingIndex >= 0 && step.processingIndex < step.sorted.length) {
        this.statH.textContent = String(step.sorted[step.processingIndex].height);
      } else this.statH.textContent = '-';
    }
    if (this.statK) {
      if (step.processingIndex >= 0 && step.processingIndex < step.sorted.length) {
        this.statK.textContent = String(step.sorted[step.processingIndex].k);
      } else this.statK.textContent = '-';
    }
    if (this.statPos) {
      if (step.phase === 'count' && step.scanIndex >= 0) {
        this.statPos.textContent = `${step.scanIndex} (扫描中)`;
      } else if (step.insertIndex >= 0) {
        this.statPos.textContent = String(step.insertIndex);
      } else {
        this.statPos.textContent = '-';
      }
    }
    if (this.statDone) this.statDone.textContent = String(step.queue.length);
  }

  private renderSource(step: RQStep): void {
    const sourceEl = this.sourceEl;
    if (!sourceEl) return;
    sourceEl.innerHTML = '';
    if (step.sorted.length === 0) {
      sourceEl.innerHTML = '<div class="rq-source-empty">（空输入）</div>';
      return;
    }
    step.sorted.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'rq-person';
      if (idx === step.processingIndex) {
        card.classList.add('rq-person--current');
      } else if (step.phase === 'done' || (step.processingIndex >= 0 && idx < step.processingIndex)) {
        card.classList.add('rq-person--done');
      }
      card.innerHTML = `<div class="rq-person-h">${p.height}</div><div class="rq-person-k">k=${p.k}</div>`;
      sourceEl.appendChild(card);
    });
  }

  private renderQueue(step: RQStep): void {
    const queueEl = this.queueEl;
    if (!queueEl) return;
    queueEl.innerHTML = '';

    if (step.queue.length === 0) {
      queueEl.innerHTML = '<div class="rq-empty-queue">（空队列，等待插入）</div>';
      return;
    }

    step.queue.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'rq-person';
      card.style.position = 'relative';

      // 状态判定
      const isFresh = step.phase === 'insert' && idx === step.insertIndex;
      const isCounting = step.phase === 'count' && idx === step.scanIndex;
      const isTargetSlot = step.phase === 'count' && step.countedSoFar >= (step.sorted[step.processingIndex]?.k ?? 0)
        && idx === step.insertIndex && step.scanIndex === idx;

      if (isFresh) {
        card.classList.add('rq-person--fresh');
      } else if (isCounting) {
        card.classList.add('rq-person--counting');
        const pin = document.createElement('div');
        pin.className = 'rq-counter-pin';
        pin.textContent = `数 ${step.countedSoFar}`;
        card.appendChild(pin);
      } else if (isTargetSlot) {
        card.classList.add('rq-person--target-slot');
        const arrow = document.createElement('div');
        arrow.className = 'rq-insert-arrow';
        arrow.textContent = '↓';
        card.appendChild(arrow);
      } else {
        card.classList.add('rq-person--sorted');
      }

      card.innerHTML += `<div class="rq-person-h">${p.height}</div><div class="rq-person-k">k=${p.k}</div>`;
      queueEl.appendChild(card);
    });
  }

  private renderResultBanner(step: RQStep): void {
    const resultEl = this.resultEl;
    if (!resultEl) return;
    resultEl.classList.toggle('rq-result--done', step.phase === 'done');
    const emoji = resultEl.querySelector('.rq-emoji') as HTMLElement | null;
    if (emoji) {
      if (step.phase === 'done') emoji.textContent = '✅';
      else if (step.phase === 'insert') emoji.textContent = '➕';
      else if (step.phase === 'count') emoji.textContent = '🔍';
      else if (step.phase === 'highlight') emoji.textContent = '👆';
      else if (step.phase === 'sort') emoji.textContent = '↕️';
      else emoji.textContent = '👥';
    }
  }

  private renderLogPanel(): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      line.className = 'rq-log-line' + (i === this.currentIndex ? ' rq-log-active' : '');
      line.innerHTML = `<span class="rq-log-num">${String(i + 1).padStart(2, '0')}</span><span>${s.log}</span>`;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'reconstruct-queue',
  name: '根据身高重建队列',
  viewId: 'algo-reconstruct-queue-view',
  category: 'greedy',
  description: 'LeetCode 406：贪心算法，根据身高和k值构建队列',
  icon: '👥',
  template,
  Visualizer: ReconstructQueueVisualizer,
  difficulty: 3,
  levelOrder: 11,
  learningGoal: '理解排序加按身高位置插入的贪心策略',
});
