/**
 * 设计链表可视化器（MyLinkedList）
 * 重做：玻璃感 stat 面板 + addAt 节点 scale-pop-in / delete shake-and-shrink / get 脉冲 + 完整执行日志
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './design-linked-list.html?raw';

type Op = 'addAtHead' | 'addAtTail' | 'addAtIndex' | 'deleteAtIndex' | 'get' | 'reset';

interface DLLNode {
  val: number;
  next: DLLNode | null;
}

interface DLLStep {
  /** 当前链表快照（按 head→tail 顺序） */
  values: number[];
  op: Op;
  args: number[];
  highlight: number;          // -1 = 无高亮
  highlightKind: 'add' | 'del' | 'get' | '';
  ret: number | string;
  size: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

class MyLinkedList {
  private head: DLLNode | null = null;
  private size = 0;

  getSize(): number { return this.size; }
  getHead(): DLLNode | null { return this.head; }

  values(): number[] {
    const out: number[] = [];
    let cur = this.head;
    while (cur) { out.push(cur.val); cur = cur.next; }
    return out;
  }

  get(index: number): number {
    if (index < 0 || index >= this.size) return -1;
    let cur = this.head;
    for (let i = 0; i < index; i++) cur = cur!.next;
    return cur!.val;
  }

  addAtHead(val: number): void {
    this.head = { val, next: this.head };
    this.size++;
  }

  addAtTail(val: number): void {
    if (!this.head) { this.addAtHead(val); return; }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = { val, next: null };
    this.size++;
  }

  addAtIndex(index: number, val: number): void {
    if (index < 0 || index > this.size) return;
    if (index === 0) { this.addAtHead(val); return; }
    let cur = this.head!;
    for (let i = 0; i < index - 1; i++) cur = cur.next!;
    cur.next = { val, next: cur.next };
    this.size++;
  }

  deleteAtIndex(index: number): void {
    if (index < 0 || index >= this.size) return;
    if (index === 0) { this.head = this.head!.next; this.size--; return; }
    let cur = this.head!;
    for (let i = 0; i < index - 1; i++) cur = cur.next!;
    cur.next = cur.next!.next;
    this.size--;
  }

  reset(): void {
    this.head = null; this.size = 0;
  }
}

export class DesignLinkedListVisualizer extends StepVisualizer<DLLStep> {
  protected codeLines = [
    'class MyLinkedList {',
    '    private ListNode head; private int size;',
    '    public MyLinkedList() { head = null; size = 0; }',
    '',
    '    public int get(int index) {',
    '        if (index < 0 || index >= size) return -1;',
    '        ListNode cur = head; for (int i = 0; i < index; i++) cur = cur.next;',
    '        return cur.val;',
    '    }',
    '',
    '    public void addAtHead(int val) {',
    '        head = new ListNode(val, head); size++;',
    '    }',
    '',
    '    public void addAtTail(int val) {',
    '        if (head == null) { addAtHead(val); return; }',
    '        ListNode cur = head; while (cur.next != null) cur = cur.next;',
    '        cur.next = new ListNode(val); size++;',
    '    }',
    '',
    '    public void addAtIndex(int index, int val) {',
    '        if (index < 0 || index > size) return;',
    '        if (index == 0) { addAtHead(val); return; }',
    '        ListNode cur = head; for (int i = 0; i < index - 1; i++) cur = cur.next;',
    '        cur.next = new ListNode(val, cur.next); size++;',
    '    }',
    '',
    '    public void deleteAtIndex(int index) {',
    '        if (index < 0 || index >= size) return;',
    '        if (index == 0) { head = head.next; size--; return; }',
    '        ListNode cur = head; for (int i = 0; i < index - 1; i++) cur = cur.next;',
    '        cur.next = cur.next.next; size--;',
    '    }',
    '}',
  ];
  protected codePanelTitle = '🔗 MyLinkedList Java 源码';

  private list: MyLinkedList = new MyLinkedList();
  private opCount = 0;

  private statLen: HTMLElement | null = null;
  private statOp: HTMLElement | null = null;
  private statRet: HTMLElement | null = null;
  private statCnt: HTMLElement | null = null;
  private canvasEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;
  private currentLogLines: string[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    this.statLen = this.root.querySelector('#dll-stat-len');
    this.statOp = this.root.querySelector('#dll-stat-op');
    this.statRet = this.root.querySelector('#dll-stat-ret');
    this.statCnt = this.root.querySelector('#dll-stat-cnt');
    this.canvasEl = this.root.querySelector('#dll-canvas');
    this.resultEl = this.root.querySelector('#dll-result');
    this.logEl = this.root.querySelector('#dll-log');
    this.clearLogBtn = this.root.querySelector('#dll-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'dll-speed', speedLabel: 'dll-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#dll-add-head')?.addEventListener('click', () => this.execOp('addAtHead', [this.num('dll-val-head', 10)]));
    this.root.querySelector('#dll-add-tail')?.addEventListener('click', () => this.execOp('addAtTail', [this.num('dll-val-tail', 20)]));
    this.root.querySelector('#dll-add-index')?.addEventListener('click', () => this.execOp('addAtIndex', [this.num('dll-idx-add', 1), this.num('dll-val-add', 15)]));
    this.root.querySelector('#dll-delete')?.addEventListener('click', () => this.execOp('deleteAtIndex', [this.num('dll-idx-del', 0)]));
    this.root.querySelector('#dll-get')?.addEventListener('click', () => this.execOp('get', [this.num('dll-idx-get', 0)]));
    this.root.querySelector('#dll-reset')?.addEventListener('click', () => this.execOp('reset', []));
    this.clearLogBtn?.addEventListener('click', () => {
      this.currentLogLines = [];
      if (this.logEl) this.logEl.innerHTML = '';
    });
  }

  private num(id: string, fallback: number): number {
    const el = this.root?.querySelector(`#${id}`) as HTMLInputElement | null;
    const v = parseInt(el?.value || String(fallback), 10);
    return Number.isFinite(v) ? v : fallback;
  }

  private execOp(op: Op, args: number[]): void {
    let highlight = -1;
    let highlightKind: DLLStep['highlightKind'] = '';
    let ret: number | string = '-';
    let message = '';
    let log = '';
    let codeLine: number | number[] = 1;
    const sizeBefore = this.list.getSize();

    switch (op) {
      case 'addAtHead':
        this.list.addAtHead(args[0]);
        highlight = 0;
        highlightKind = 'add';
        ret = 'void';
        message = `addAtHead(${args[0]})：新节点 ${args[0]} 飞入到头部成为新 head（size ${sizeBefore} → ${sizeBefore + 1}）。`;
        log = `addAtHead(${args[0]}) → head`;
        codeLine = [9, 10];
        break;
      case 'addAtTail':
        this.list.addAtTail(args[0]);
        highlight = this.list.getSize() - 1;
        highlightKind = 'add';
        ret = 'void';
        message = `addAtTail(${args[0]})：遍历到尾后插入新节点 ${args[0]}（size ${sizeBefore} → ${sizeBefore + 1}）。`;
        log = `addAtTail(${args[0]}) → tail`;
        codeLine = [13, 14, 15];
        break;
      case 'addAtIndex': {
        const idx = args[0];
        if (idx < 0 || idx > this.list.getSize()) {
          message = `addAtIndex(${idx}, ${args[1]})：index 越界（合法 0..${this.list.getSize()}），操作被拒绝。`;
          log = `addAtIndex(${idx}, ${args[1]}) 越界`;
          codeLine = 17;
        } else {
          this.list.addAtIndex(idx, args[1]);
          highlight = idx;
          highlightKind = 'add';
          ret = 'void';
          message = `addAtIndex(${idx}, ${args[1]})：遍历到 index=${idx - 1}，插入新节点 ${args[1]}。`;
          log = `addAtIndex(${idx}, ${args[1]})`;
          codeLine = [17, 18, 19, 20];
        }
        break;
      }
      case 'deleteAtIndex': {
        const idx = args[0];
        if (idx < 0 || idx >= this.list.getSize()) {
          message = `deleteAtIndex(${idx})：index 越界（合法 0..${this.list.getSize() - 1}），操作被拒绝。`;
          log = `deleteAtIndex(${idx}) 越界`;
          codeLine = 23;
        } else {
          this.list.deleteAtIndex(idx);
          highlight = idx;
          highlightKind = 'del';
          ret = 'void';
          message = `deleteAtIndex(${idx})：节点 ${this.list.values()[idx] ?? '?'} 被删除（size ${sizeBefore} → ${this.list.getSize()}）。`;
          log = `deleteAtIndex(${idx})`;
          codeLine = [23, 24, 25];
        }
        break;
      }
      case 'get': {
        const idx = args[0];
        if (idx < 0 || idx >= this.list.getSize()) {
          ret = -1;
          message = `get(${idx})：index 越界（合法 0..${this.list.getSize() - 1}），返回 -1。`;
          log = `get(${idx}) → -1 (越界)`;
          codeLine = 5;
        } else {
          const v = this.list.get(idx);
          highlight = idx;
          highlightKind = 'get';
          ret = v;
          message = `get(${idx})：遍历 ${idx + 1} 步到达节点，取到值 = ${v}。`;
          log = `get(${idx}) → ${v}`;
          codeLine = [3, 4, 5, 6, 7];
        }
        break;
      }
      case 'reset':
        this.list.reset();
        highlight = -1;
        message = '重置链表为空。';
        log = 'reset list';
        codeLine = 2;
        break;
    }

    const step: DLLStep = {
      values: this.list.values(),
      op, args, highlight, highlightKind, ret, size: this.list.getSize(),
      message, log, codeLine,
    };

    this.steps = [step];
    this.currentIndex = 0;
    this.opCount++;
    this.currentLogLines.push(`${String(this.opCount).padStart(2, '0')}. ${log}`);
    this.render();
    this.updateButtons();
    this.renderStatFromStep(step);
  }

  protected buildSteps(): DLLStep[] {
    return this.steps;
  }

  protected renderStep(step: DLLStep): void {
    this.renderCanvas(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStatFromStep(step: DLLStep): void {
    if (this.statLen) this.statLen.textContent = String(step.size);
    if (this.statOp) this.statOp.textContent = step.op;
    if (this.statRet) this.statRet.textContent = String(step.ret);
    if (this.statCnt) this.statCnt.textContent = String(this.opCount);
  }

  private renderCanvas(step: DLLStep): void {
    if (!this.canvasEl) return;
    this.canvasEl.innerHTML = '';
    if (step.values.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'dll-list-empty';
      empty.textContent = '（空链表）';
      this.canvasEl.appendChild(empty);
      return;
    }
    const list = document.createElement('div');
    list.className = 'dll-list';

    step.values.forEach((val, idx) => {
      const nodeWrap = document.createElement('div');
      nodeWrap.className = 'dll-node';

      const box = document.createElement('div');
      box.className = 'dll-box';
      if (idx === 0) box.classList.add('dll-head');
      if (idx === step.highlight && step.highlightKind === 'add') box.classList.add('dll-target-add');
      if (idx === step.highlight && step.highlightKind === 'del') box.classList.add('dll-target-del');
      if (idx === step.highlight && step.highlightKind === 'get') box.classList.add('dll-target-get');

      const idxLabel = document.createElement('div');
      idxLabel.className = 'dll-box-idx';
      idxLabel.textContent = `[${idx}]`;
      const valLabel = document.createElement('div');
      valLabel.className = 'dll-box-val';
      valLabel.textContent = String(val);
      box.appendChild(idxLabel);
      box.appendChild(valLabel);

      if (idx === 0) {
        const tag = document.createElement('span');
        tag.className = 'dll-tag-head';
        tag.textContent = 'HEAD';
        box.appendChild(tag);
      }

      nodeWrap.appendChild(box);
      const arrow = document.createElement('span');
      arrow.className = 'dll-arrow';
      if (idx === step.highlight && step.highlightKind === 'add' && idx > 0) {
        arrow.classList.add('dll-arrow-new');
      }
      arrow.textContent = '→';
      nodeWrap.appendChild(arrow);

      list.appendChild(nodeWrap);
    });

    const nullSpan = document.createElement('span');
    nullSpan.className = 'dll-null';
    nullSpan.textContent = 'null';
    list.appendChild(nullSpan);

    this.canvasEl.appendChild(list);
  }

  private renderResultBanner(step: DLLStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('dll-result--add', 'dll-result--del');
    const emoji = this.resultEl.querySelector('.dll-emoji') as HTMLElement | null;
    if (step.highlightKind === 'add' && step.op !== 'reset') {
      this.resultEl.classList.add('dll-result--add');
      if (emoji) emoji.textContent = '➕';
    } else if (step.highlightKind === 'del') {
      this.resultEl.classList.add('dll-result--del');
      if (emoji) emoji.textContent = '🗑️';
    } else if (step.highlightKind === 'get') {
      if (emoji) emoji.textContent = '🔎';
    } else if (step.op === 'reset') {
      if (emoji) emoji.textContent = '🧹';
    } else {
      if (emoji) emoji.textContent = '🔗';
    }
  }

  private renderLogPanel(step: DLLStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.currentLogLines.forEach((line, i) => {
      const row = document.createElement('div');
      row.className = 'dll-log-line' + (i === this.currentLogLines.length - 1 ? ' dll-log-active' : '');
      const num = document.createElement('span');
      num.className = 'dll-log-num';
      num.textContent = line.split('. ')[0] + '.';
      const text = document.createElement('span');
      text.textContent = line.split('. ').slice(1).join('. ');
      row.appendChild(num);
      row.appendChild(text);
      this.logEl!.appendChild(row);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'design-linked-list',
  name: '设计链表（MyLinkedList）',
  viewId: 'algo-design-linked-list-view',
  category: 'linked-list',
  description: '亲手实现单链表五种操作 + 节点飞入/抖动/脉冲动画',
  icon: '🔗',
  template,
  Visualizer: DesignLinkedListVisualizer,
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '从零实现链表，深入理解节点与指针操作',
});
