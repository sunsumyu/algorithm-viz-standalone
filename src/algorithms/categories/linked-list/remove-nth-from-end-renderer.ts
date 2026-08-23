/**
 * 删除链表的倒数第 N 个节点（快慢指针）可视化器
 * 重做：玻璃感 stat 面板 + fast 冲刺动画 + slow 锁步动画 + 目标节点 shake+vanish + 完整执行日志
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './remove-nth-from-end.html?raw';

type Phase = 'init' | 'fast-advance' | 'together' | 'remove' | 'done';

interface RNSstep {
  values: number[];
  fast: number;        // -1 = dummy, values.length = null
  slow: number;        // -1 = dummy
  removed: number;     // 被删除节点原始下标（-1 = 未删）
  stepsTaken: number;
  phase: Phase;
  sprint: boolean;     // 本步 fast 是否处于"冲刺"动画态
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseValues(input: string): number[] {
  return input.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
}

function buildRNSteps(values: number[], n: number): RNSstep[] {
  const steps: RNSstep[] = [];
  const len = values.length;

  if (len === 0 || n > len) {
    steps.push({
      values, fast: -1, slow: -1, removed: -1, stepsTaken: 0,
      phase: 'done', sprint: false,
      message: '输入不合法：链表为空或 n 超过长度。',
      log: 'invalid input',
      codeLine: 1,
    });
    return steps;
  }

  steps.push({
    values, fast: -1, slow: -1, removed: -1, stepsTaken: 0,
    phase: 'init', sprint: false,
    message: `创建 dummy 节点指向 head，fast = slow = dummy。准备让 fast 先走 n=${n} 步（建立间距）。`,
    log: 'init dummy, fast = slow = dummy',
    codeLine: [1, 2, 3],
  });

  let fast = -1; // dummy
  let slow = -1;

  // fast 先走 n 步（从 dummy 出发走 n 步到达下标 n-1）
  for (let i = 0; i < n; i++) {
    fast = fast === -1 ? 0 : fast + 1;
    steps.push({
      values, fast, slow, removed: -1, stepsTaken: i + 1,
      phase: 'fast-advance', sprint: true,
      message: `⚡ fast 冲刺第 ${i + 1} 步，到达节点 ${fast < len ? values[fast] : 'null'}（slow 仍在 dummy 等待）。`,
      log: `fast sprint -> ${fast < len ? values[fast] : 'null'}`,
      codeLine: 4,
    });
  }

  // fast、slow 一起走，直到 fast 走到末尾（fast === len - 1）
  while (fast < len - 1) {
    fast++;
    slow = slow === -1 ? 0 : slow + 1;
    steps.push({
      values, fast, slow, removed: -1, stepsTaken: n,
      phase: 'together', sprint: false,
      message: `🔗 锁步前进：fast → ${values[fast]}，slow → ${slow === -1 ? 'dummy' : values[slow]}。间距恒为 n=${n}。`,
      log: `sync fast=${values[fast]}, slow=${slow === -1 ? 'dummy' : values[slow]}`,
      codeLine: [5, 6, 7],
    });
  }

  // 删除 slow.next（即下标 slow + 1）
  const toRemove = slow + 1;
  const removedVal = values[toRemove];
  steps.push({
    values, fast, slow, removed: -1, stepsTaken: n,
    phase: 'remove', sprint: false,
    message: `fast 已到末尾，slow 恰在待删节点前驱。准备删除 slow.next = ${removedVal}。`,
    log: `mark slow.next = ${removedVal} for removal`,
    codeLine: 8,
  });

  // 结果链表
  const resultValues = values.filter((_, i) => i !== toRemove);
  steps.push({
    values: resultValues, fast: -1, slow: -1, removed: toRemove, stepsTaken: n,
    phase: 'done', sprint: false,
    message: `✅ 删除完成。结果链表：${resultValues.length ? resultValues.join(' → ') : '（空）'}，共 ${resultValues.length} 个节点。`,
    log: `done: removed ${removedVal}, size ${resultValues.length}`,
    codeLine: 9,
  });

  return steps;
}

export class RemoveNthFromEndVisualizer extends StepVisualizer<RNSstep> {
  protected codeLines = [
    'ListNode removeNthFromEnd(ListNode head, int n) {',
    '    ListNode dummy = new ListNode(0); dummy.next = head;',
    '    ListNode fast = dummy, slow = dummy;',
    '    // ① 让 fast 先走 n 步，建立间距',
    '    for (int i = 0; i < n; i++) fast = fast.next;',
    '    // ② fast、slow 锁步前进',
    '    while (fast.next != null) {',
    '        fast = fast.next; slow = slow.next;',
    '    }',
    '    // ③ fast 到末尾时，slow 恰在待删节点前驱',
    '    slow.next = slow.next.next;',
    '    return dummy.next;',
    '}',
  ];
  protected codePanelTitle = '🗑️ 删除倒数第 N 节点 Java 源码';

  private arrayInput: HTMLInputElement | null = null;
  private nInput: HTMLInputElement | null = null;
  private statFast: HTMLElement | null = null;
  private statSlow: HTMLElement | null = null;
  private statSteps: HTMLElement | null = null;
  private statTarget: HTMLElement | null = null;
  private statLen: HTMLElement | null = null;
  private canvasEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.arrayInput = this.root.querySelector('#rn-array');
    this.nInput = this.root.querySelector('#rn-n');
    this.statFast = this.root.querySelector('#rn-stat-fast');
    this.statSlow = this.root.querySelector('#rn-stat-slow');
    this.statSteps = this.root.querySelector('#rn-stat-steps');
    this.statTarget = this.root.querySelector('#rn-stat-target');
    this.statLen = this.root.querySelector('#rn-stat-len');
    this.canvasEl = this.root.querySelector('#rn-canvas');
    this.resultEl = this.root.querySelector('#rn-result');
    this.logEl = this.root.querySelector('#rn-log');
    this.clearLogBtn = this.root.querySelector('#rn-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'rn-speed', speedLabel: 'rn-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#rn-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.rn-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.arrayInput) this.arrayInput.value = btn.dataset.val || '';
        if (this.nInput) this.nInput.value = btn.dataset.n || '2';
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => { if (this.logEl) this.logEl.innerHTML = ''; });
    this.arrayInput?.addEventListener('change', () => this.start());
    this.nInput?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): RNSstep[] {
    const values = parseValues(this.arrayInput?.value || '1,2,3,4,5');
    let n = parseInt(this.nInput?.value || '2', 10);
    if (!Number.isFinite(n)) n = 2;
    n = Math.max(1, Math.min(values.length, n));
    if (this.nInput) this.nInput.value = String(n);
    return buildRNSteps(values, n);
  }

  protected renderStep(step: RNSstep): void {
    this.renderStats(step);
    this.renderCanvas(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: RNSstep): void {
    const valTxt = (idx: number) => {
      if (idx < 0) return 'dummy';
      if (idx >= step.values.length) return 'null';
      return String(step.values[idx]);
    };
    if (this.statFast) this.statFast.textContent = step.phase === 'init' ? 'dummy' : valTxt(step.fast);
    if (this.statSlow) this.statSlow.textContent = step.phase === 'init' ? 'dummy' : valTxt(step.slow);
    if (this.statSteps) this.statSteps.textContent = String(step.stepsTaken);
    if (this.statTarget) {
      this.statTarget.textContent = step.removed >= 0 ? valTxt(step.removed) : (step.phase === 'remove' ? valTxt(step.slow + 1) : '-');
    }
    if (this.statLen) this.statLen.textContent = String(step.values.length);
  }

  private renderCanvas(step: RNSstep): void {
    if (!this.canvasEl) return;
    this.canvasEl.innerHTML = '';
    if (step.values.length === 0) {
      const empty = document.createElement('div');
      empty.style.color = '#64748b'; empty.style.fontSize = '14px';
      empty.textContent = '（空链表）';
      this.canvasEl.appendChild(empty);
      return;
    }

    const list = document.createElement('div');
    list.className = 'rn-list';

    // dummy
    const dummyWrap = document.createElement('div');
    dummyWrap.className = 'rn-node-wrap';
    const dummy = document.createElement('div');
    dummy.className = 'rn-box rn-dummy';
    const dIdx = document.createElement('div'); dIdx.className = 'rn-box-idx'; dIdx.textContent = 'D';
    const dVal = document.createElement('div'); dVal.className = 'rn-box-val'; dVal.textContent = '·';
    dummy.appendChild(dIdx); dummy.appendChild(dVal);
    const dTag = document.createElement('span');
    dTag.className = 'rn-tag-dummy';
    dTag.textContent = 'dummy';
    dummy.appendChild(dTag);
    if (step.fast === -1 && step.phase !== 'init') {
      // dummy 不在 fast-advance/together 阶段
    } else if (step.fast === -1 && step.phase === 'init') {
      // init 阶段都指着 dummy
    }
    if (step.fast === -1) {
      const ptr = document.createElement('span');
      ptr.className = 'rn-pointer rn-pointer--fast';
      ptr.textContent = 'fast';
      dummy.appendChild(ptr);
    }
    if (step.slow === -1) {
      const ptr = document.createElement('span');
      ptr.className = 'rn-pointer rn-pointer--slow';
      ptr.textContent = 'slow';
      dummy.appendChild(ptr);
    }
    dummyWrap.appendChild(dummy);

    const arr = document.createElement('span');
    arr.className = 'rn-arrow'; arr.textContent = '→';
    dummyWrap.appendChild(arr);
    list.appendChild(dummyWrap);

    step.values.forEach((val, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'rn-node-wrap';

      const box = document.createElement('div');
      box.className = 'rn-box';
      if (idx === step.fast) {
        box.classList.add('rn-fast');
        if (step.sprint) box.classList.add('rn-sprint');
      }
      if (idx === step.slow) box.classList.add('rn-slow');
      if (step.phase === 'remove' && idx === step.slow + 1) box.classList.add('rn-target');
      if (step.phase === 'done' && idx === step.removed) box.classList.add('rn-removed');

      const idxLbl = document.createElement('div');
      idxLbl.className = 'rn-box-idx';
      idxLbl.textContent = String(idx);
      const valLbl = document.createElement('div');
      valLbl.className = 'rn-box-val';
      valLbl.textContent = String(val);
      box.appendChild(idxLbl);
      box.appendChild(valLbl);

      if (idx === step.fast && step.phase !== 'done') {
        const ptr = document.createElement('span');
        ptr.className = 'rn-pointer rn-pointer--fast';
        ptr.textContent = 'fast';
        box.appendChild(ptr);
      }
      if (idx === step.slow && step.phase !== 'done') {
        const ptr = document.createElement('span');
        ptr.className = 'rn-pointer rn-pointer--slow';
        ptr.textContent = 'slow';
        box.appendChild(ptr);
      }

      wrap.appendChild(box);

      // 箭头：在 remove/done 阶段，待删节点前后的箭头需要坍缩
      const arrow = document.createElement('span');
      arrow.className = 'rn-arrow';
      const isArrowToDeleted = step.phase === 'done' && idx === step.removed;
      const isArrowFromDeletedPredecessor = step.phase === 'remove' && idx === step.slow;
      if (isArrowToDeleted || isArrowFromDeletedPredecessor) {
        arrow.classList.add('rn-arrow-cancel');
      }
      arrow.textContent = '→';
      wrap.appendChild(arrow);

      list.appendChild(wrap);
    });

    const nullSpan = document.createElement('span');
    nullSpan.className = 'rn-null';
    nullSpan.textContent = 'null';
    list.appendChild(nullSpan);

    this.canvasEl.appendChild(list);
  }

  private renderResultBanner(step: RNSstep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('rn-result--done');
    const emoji = this.resultEl.querySelector('.rn-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('rn-result--done');
      if (emoji) emoji.textContent = '✅';
    } else if (step.phase === 'fast-advance') {
      if (emoji) emoji.textContent = '⚡';
    } else if (step.phase === 'together') {
      if (emoji) emoji.textContent = '🔗';
    } else if (step.phase === 'remove') {
      if (emoji) emoji.textContent = '🎯';
    } else {
      if (emoji) emoji.textContent = '🗑️';
    }
  }

  private renderLogPanel(step: RNSstep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'rn-log-line' + (i === this.currentIndex ? ' rn-log-active' : '');
      const num = document.createElement('span');
      num.className = 'rn-log-num';
      num.textContent = `${String(i + 1).padStart(2, '0')}.`;
      const text = document.createElement('span');
      text.textContent = s.log;
      row.appendChild(num);
      row.appendChild(text);
      this.logEl!.appendChild(row);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'remove-nth-from-end',
  name: '删除链表的倒数第 N 个节点（快慢指针）',
  viewId: 'algo-remove-nth-from-end-view',
  category: 'linked-list',
  description: '快慢指针一次遍历，fast 冲刺后锁步删除倒数第 n 个节点',
  icon: '🗑️',
  template,
  Visualizer: RemoveNthFromEndVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '学会快慢指针找倒数第 N 个节点',
});
