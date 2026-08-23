/**
 * 反转链表可视化器（双指针）
 * 重做：玻璃感 stat 面板 + pre/cur 双色脉冲 + next 缓存展示 + 反转节点翻面动画 + SVG 画线 + 完整执行日志
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './reverse-linked-list.html?raw';

type Phase = 'init' | 'cache' | 'reverse' | 'advance' | 'done';

interface RLStep {
  values: number[];
  /** nextDir[i] = i.next 指向的下标（-1 表示 null） */
  nextDir: number[];
  preIndex: number;        // -1 = null
  curIndex: number;        // -1 = null
  cachedNext: number;      // 当前被缓存的 next（-1 表示 null 或无缓存）
  reversedCount: number;   // 已反转节点数
  phase: Phase;
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseValues(input: string): number[] {
  const arr = input.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [1, 2, 3, 4, 5];
}

function buildReverseSteps(values: number[]): RLStep[] {
  const steps: RLStep[] = [];
  const n = values.length;
  const nextDir = values.map((_, i) => (i + 1 < n ? i + 1 : -1));
  let pre = -1;
  let cur = n > 0 ? 0 : -1;
  let reversed = 0;

  steps.push({
    values, nextDir: [...nextDir], preIndex: pre, curIndex: cur,
    cachedNext: -1, reversedCount: reversed, phase: 'init',
    message: `初始化 pre=null，cur=head（节点 ${cur >= 0 ? values[cur] : 'null'}）。`,
    log: 'init pre=null, cur=head',
    codeLine: [1, 2],
  });

  while (cur !== -1) {
    const next = nextDir[cur];
    steps.push({
      values, nextDir: [...nextDir], preIndex: pre, curIndex: cur,
      cachedNext: next, reversedCount: reversed, phase: 'cache',
      message: `① 暂存 next = cur.next（节点 ${next === -1 ? 'null' : values[next]}），防止反转后丢失后继。`,
      log: `cache next = cur.next (${next === -1 ? 'null' : values[next]})`,
      codeLine: 4,
    });

    nextDir[cur] = pre;
    reversed++;
    steps.push({
      values, nextDir: [...nextDir], preIndex: pre, curIndex: cur,
      cachedNext: next, reversedCount: reversed, phase: 'reverse',
      message: `② 反转指针：cur.next → ${pre === -1 ? 'null' : `pre（节点 ${values[pre]}）`}。已反转 ${reversed} 个节点。`,
      log: `cur.next -> ${pre === -1 ? 'null' : values[pre]}`,
      codeLine: 5,
    });

    pre = cur;
    cur = next;
    steps.push({
      values, nextDir: [...nextDir], preIndex: pre, curIndex: cur,
      cachedNext: -1, reversedCount: reversed, phase: 'advance',
      message: `③ 整体后移：pre → 节点 ${values[pre]}，cur → ${cur === -1 ? 'null' : `节点 ${values[cur]}`}。`,
      log: `pre -> ${values[pre]}, cur -> ${cur === -1 ? 'null' : values[cur]}`,
      codeLine: [6, 7],
    });
  }

  steps.push({
    values, nextDir: [...nextDir], preIndex: pre, curIndex: -1,
    cachedNext: -1, reversedCount: reversed, phase: 'done',
    message: `✅ cur 为 null，结束。新链表头为 pre = 节点 ${values[pre]}（共反转 ${reversed} 个节点）。`,
    log: `return pre (${values[pre]})`,
    codeLine: 9,
  });

  return steps;
}

export class ReverseLinkedListVisualizer extends StepVisualizer<RLStep> {
  protected codeLines = [
    'ListNode reverseList(ListNode head) {',
    '    ListNode pre = null, cur = head;',
    '    while (cur != null) {',
    '        // ① 暂存下一个节点',
    '        ListNode next = cur.next;',
    '        // ② 反转：cur.next -> pre',
    '        cur.next = pre;',
    '        // ③ 整体后移',
    '        pre = cur;',
    '        cur = next;',
    '    }',
    '    return pre;',
    '}',
  ];
  protected codePanelTitle = '🔁 反转链表 Java 源码';

  private inputEl: HTMLInputElement | null = null;
  private statPre: HTMLElement | null = null;
  private statCur: HTMLElement | null = null;
  private statNext: HTMLElement | null = null;
  private statTotal: HTMLElement | null = null;
  private canvasEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#rl-input');
    this.statPre = this.root.querySelector('#rl-stat-pre');
    this.statCur = this.root.querySelector('#rl-stat-cur');
    this.statNext = this.root.querySelector('#rl-stat-next');
    this.statTotal = this.root.querySelector('#rl-stat-total');
    this.canvasEl = this.root.querySelector('#rl-canvas');
    this.resultEl = this.root.querySelector('#rl-result');
    this.logEl = this.root.querySelector('#rl-log');
    this.clearLogBtn = this.root.querySelector('#rl-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'rl-speed', speedLabel: 'rl-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#rl-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.rl-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => { if (this.logEl) this.logEl.innerHTML = ''; });
    this.inputEl?.addEventListener('change', () => this.start());
  }

  protected buildSteps(): RLStep[] {
    return buildReverseSteps(parseValues(this.inputEl?.value || '1,2,3,4,5'));
  }

  protected renderStep(step: RLStep): void {
    this.renderStats(step);
    this.renderCanvas(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: RLStep): void {
    const valTxt = (idx: number) => idx < 0 ? 'null' : String(step.values[idx]);
    if (this.statPre) this.statPre.textContent = valTxt(step.preIndex);
    if (this.statCur) this.statCur.textContent = valTxt(step.curIndex);
    if (this.statNext) this.statNext.textContent = step.cachedNext < 0 ? '-' : valTxt(step.cachedNext);
    if (this.statTotal) this.statTotal.textContent = String(step.values.length);
  }

  private renderCanvas(step: RLStep): void {
    if (!this.canvasEl) return;
    this.canvasEl.innerHTML = '';

    // 原始链表
    const origTitle = document.createElement('div');
    origTitle.className = 'rl-row-title rl-row-title--orig';
    origTitle.textContent = '原始链表（参考）';
    this.canvasEl.appendChild(origTitle);
    this.canvasEl.appendChild(this.renderList(step.values, step.values.map((_, i) => (i + 1 < step.values.length ? i + 1 : -1)), step, true, 'orig'));

    // 当前状态
    const curTitle = document.createElement('div');
    curTitle.className = 'rl-row-title rl-row-title--cur';
    curTitle.textContent = '当前指针状态（反转中）';
    this.canvasEl.appendChild(curTitle);
    this.canvasEl.appendChild(this.renderList(step.values, step.nextDir, step, false, 'cur'));
  }

  private renderList(values: number[], nextDir: number[], step: RLStep, isReference: boolean, kind: 'orig' | 'cur'): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'rl-list';
    if (values.length === 0) {
      wrap.innerHTML = '<span class="rl-null">空链表</span>';
      return wrap;
    }

    // 跟随 nextDir 排出顺序
    const visited = new Set<number>();
    const order: number[] = [];
    let node = 0;
    while (node !== -1 && !visited.has(node)) {
      visited.add(node);
      order.push(node);
      node = nextDir[node];
    }
    // 反转状态 + null 出现在顺序里时，停
    if (order.length === 0) {
      const n = document.createElement('span');
      n.className = 'rl-null';
      n.textContent = 'head → null';
      wrap.appendChild(n);
      return wrap;
    }

    order.forEach((idx, i) => {
      const nodeWrap = document.createElement('div');
      nodeWrap.className = 'rl-node';
      const box = document.createElement('div');
      box.className = 'rl-box';
      if (!isReference) {
        if (idx === step.curIndex) box.classList.add('rl-cur');
        if (idx === step.preIndex) box.classList.add('rl-pre');
        if (step.phase === 'reverse' && idx === step.curIndex) box.classList.add('rl-flipped');
      }
      const valSpan = document.createElement('span');
      valSpan.textContent = String(values[idx]);
      box.appendChild(valSpan);
      const idxLabel = document.createElement('span');
      idxLabel.className = 'rl-idx';
      idxLabel.textContent = String(idx);
      box.appendChild(idxLabel);
      nodeWrap.appendChild(box);

      const arrow = document.createElement('span');
      arrow.className = 'rl-arrow';
      const target = nextDir[idx];
      const isLast = i === order.length - 1;
      if (isLast) {
        const nullSpan = document.createElement('span');
        nullSpan.className = 'rl-null';
        if (!isReference && step.phase !== 'done' && (target !== -1 || step.phase === 'init')) {
          // 原始链表中最后一根箭头仍指向 null
          nullSpan.textContent = '→ null';
        } else if (!isReference && step.phase === 'done' && target !== -1) {
          nullSpan.textContent = `→ ${values[target]}`;
        } else {
          nullSpan.textContent = target === -1 ? '→ null' : `→ ${values[target]}`;
        }
        arrow.appendChild(nullSpan);
      } else {
        const line = document.createElement('span');
        line.className = 'rl-arrow-line';
        if (!isReference && step.phase === 'reverse' && idx === step.curIndex) {
          arrow.classList.add('rl-arrow-flipped');
        }
        arrow.appendChild(line);
        if (!isReference && step.phase === 'cache' && idx === step.curIndex) {
          arrow.classList.add('rl-arrow-active');
        }
      }
      nodeWrap.appendChild(arrow);
      wrap.appendChild(nodeWrap);
    });

    return wrap;
  }

  private renderResultBanner(step: RLStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('rl-result--done');
    const emoji = this.resultEl.querySelector('.rl-emoji') as HTMLElement | null;
    if (step.phase === 'done') {
      this.resultEl.classList.add('rl-result--done');
      if (emoji) emoji.textContent = '🎉';
    } else if (step.phase === 'cache') {
      if (emoji) emoji.textContent = '📌';
    } else if (step.phase === 'reverse') {
      if (emoji) emoji.textContent = '↩️';
    } else if (step.phase === 'advance') {
      if (emoji) emoji.textContent = '👣';
    } else if (step.phase === 'init') {
      if (emoji) emoji.textContent = '🔁';
    }
  }

  private renderLogPanel(step: RLStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'rl-log-line' + (i === this.currentIndex ? ' rl-log-active' : '');
      const num = document.createElement('span');
      num.className = 'rl-log-num';
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
  id: 'reverse-linked-list',
  name: '反转链表（双指针）',
  viewId: 'algo-reverse-linked-list-view',
  category: 'linked-list',
  description: 'pre/cur 双指针逐个反转链表指针，含 next 缓存动画',
  icon: '🔁',
  template,
  Visualizer: ReverseLinkedListVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握链表反转的经典三指针法',
});
