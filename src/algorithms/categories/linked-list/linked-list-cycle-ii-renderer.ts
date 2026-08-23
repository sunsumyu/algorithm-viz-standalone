/**
 * 环形链表 II 可视化器（快慢指针）
 * LeetCode 142
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './linked-list-cycle-ii.html?raw';

interface CycleStep {
  values: number[];
  pos: number;           // 入环下标，-1 无环
  fast: number;          // fast 当前下标
  slow: number;          // slow 当前下标
  meetIndex: number;     // 相遇点下标，-1 未相遇
  entryIndex: number;    // 入环口下标，-1 未确定
  phase: 'init' | 'chase' | 'meet' | 'find-entry' | 'no-cycle' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildCycleSteps(values: number[], pos: number): CycleStep[] {
  const steps: CycleStep[] = [];
  const n = values.length;

  steps.push({
    values, pos, fast: n > 0 ? 0 : -1, slow: n > 0 ? 0 : -1, meetIndex: -1, entryIndex: -1, phase: 'init',
    message: pos === -1 ? '链表无环。fast、slow 都从 head 出发。' : `链表有环，入环下标 = ${pos}。fast 走2步、slow 走1步开始追逐。`,
    log: '初始化快慢指针。',
    codeLine: [1, 2],
  });

  if (pos === -1) {
    // 无环：模拟 fast 到达末尾
    let fast = 0;
    while (fast < n && fast + 1 < n) {
      fast += 2;
      steps.push({
        values, pos, fast: Math.min(fast, n), slow: 0, meetIndex: -1, entryIndex: -1, phase: 'chase',
        message: `fast 走2步到 ${fast >= n ? 'null' : values[fast]}，slow 在 ${values[0]}。`,
        log: `fast -> ${fast >= n ? 'null' : values[fast]}。`,
        codeLine: 4,
      });
    }
    steps.push({
      values, pos, fast: n, slow: 0, meetIndex: -1, entryIndex: -1, phase: 'no-cycle',
      message: `fast 到达 null，链表无环，返回 null。`,
      log: '无环，返回 null。',
      codeLine: 7,
    });
    return steps;
  }

  // 有环：模拟追逐
  let fast = 0;
  let slow = 0;
  // next: 若 i==n-1（环尾），指向 pos；否则 i+1。环尾 = pos-1（最后一个连回 pos 的节点）
  // 实际：链表节点 0..n-1，节点 n-1 的 next 指向 pos
  const next = (i: number): number => (i === n - 1 ? pos : i + 1);

  let safety = 0;
  while (safety < n * n + 10) {
    safety++;
    // fast 走2步
    fast = next(next(fast));
    slow = next(slow);
    steps.push({
      values, pos, fast, slow, meetIndex: -1, entryIndex: -1, phase: 'chase',
      message: `fast 走2步到节点 ${values[fast]}，slow 走1步到节点 ${values[slow]}。`,
      log: `fast -> ${values[fast]}, slow -> ${values[slow]}。`,
      codeLine: [3, 4, 5, 6],
    });
    if (fast === slow) {
      steps.push({
        values, pos, fast, slow, meetIndex: fast, entryIndex: -1, phase: 'meet',
        message: `相遇！fast 与 slow 在节点 ${values[fast]}（下标 ${fast}）相遇，确认有环。`,
        log: `相遇于 ${values[fast]}。`,
        codeLine: 7,
      });
      break;
    }
  }

  // 找入环口：ptr1 从 head，ptr2 从相遇点，同速前进
  let ptr1 = 0;
  let ptr2 = fast;
  steps.push({
    values, pos, fast: ptr2, slow: ptr1, meetIndex: ptr2, entryIndex: -1, phase: 'find-entry',
    message: `第二阶段：让 ptr1 从 head(${values[0]}) 出发，ptr2 从相遇点(${values[ptr2]}) 出发，各走1步。`,
    log: `ptr1=head, ptr2=meet，开始同速。`,
    codeLine: [9, 10, 11],
  });

  safety = 0;
  while (ptr1 !== ptr2 && safety < n * n + 10) {
    safety++;
    ptr1 = next(ptr1);
    ptr2 = next(ptr2);
    steps.push({
      values, pos, fast: ptr2, slow: ptr1, meetIndex: fast, entryIndex: -1, phase: 'find-entry',
      message: `ptr1 -> ${values[ptr1]}，ptr2 -> ${values[ptr2]}。`,
      log: `ptr1=${values[ptr1]}, ptr2=${values[ptr2]}。`,
      codeLine: [12, 13, 14],
    });
  }

  steps.push({
    values, pos, fast: ptr1, slow: ptr1, meetIndex: fast, entryIndex: ptr1, phase: 'done',
    message: `ptr1 与 ptr2 在节点 ${values[ptr1]}（下标 ${ptr1}）再次相遇，即为入环口。`,
    log: `入环口 = ${values[ptr1]}。`,
    codeLine: 15,
  });
  return steps;
}

export class LinkedListCycleIIVisualizer extends StepVisualizer<CycleStep> {
  protected codeLines = [
    'ListNode detectCycle(ListNode head) {',
    '    ListNode slow = head, fast = head;',
    '    while (fast != null && fast.next != null) {',
    '        fast = fast.next.next;',
    '        slow = slow.next;',
    '        if (fast == slow) {',
    '            // 相遇，有环',
    '            ListNode p1 = head, p2 = fast;',
    '            while (p1 != p2) {',
    '                p1 = p1.next;',
    '                p2 = p2.next;',
    '            }',
    '            return p1;  // 入环口',
    '        }',
    '    }',
    '    return null;  // 无环',
    '}',
  ];
  protected codePanelTitle = '环形链表II Java 代码';

  private inputEl: HTMLInputElement | null = null;
  private posInput: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private logEl: HTMLElement | null = null;
  private fastEl: HTMLElement | null = null;
  private slowEl: HTMLElement | null = null;
  private phaseEl: HTMLElement | null = null;
  private entryEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#lc-input');
    this.posInput = this.root.querySelector('#lc-pos-input');
    this.btnStart = this.root.querySelector('#lc-start');
    this.exampleButtons = this.root.querySelectorAll('.lc-example-btn');
    this.canvas = this.root.querySelector('#lc-canvas');
    this.ctx = this.canvas?.getContext('2d') || null;
    this.logEl = this.root.querySelector('#lc-log');
    this.fastEl = this.root.querySelector('#lc-fast');
    this.slowEl = this.root.querySelector('#lc-slow');
    this.phaseEl = this.root.querySelector('#lc-phase');
    this.entryEl = this.root.querySelector('#lc-entry');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        if (this.posInput) this.posInput.value = btn.dataset.pos || '1';
        this.start();
      };
    });
  }

  protected buildSteps(): CycleStep[] {
    const values = (this.inputEl?.value || '3,2,0,-4')
      .split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isFinite(n));
    if (values.length === 0) values.push(3, 2, 0, -4);
    let pos = parseInt(this.posInput?.value || '1', 10);
    if (!Number.isFinite(pos)) pos = 1;
    pos = Math.max(-1, Math.min(values.length - 1, pos));
    if (this.posInput) this.posInput.value = String(pos);
    return buildCycleSteps(values, pos);
  }

  protected renderStep(step: CycleStep): void {
    if (this.fastEl) this.fastEl.textContent = step.fast < step.values.length ? String(step.values[step.fast]) : 'null';
    if (this.slowEl) this.slowEl.textContent = step.slow < step.values.length ? String(step.values[step.slow]) : 'null';
    if (this.phaseEl) this.phaseEl.textContent = this.phaseText(step.phase);
    if (this.entryEl) this.entryEl.textContent = step.entryIndex >= 0 ? String(step.values[step.entryIndex]) : (step.phase === 'no-cycle' ? 'null' : '-');
    this.drawCanvas(step);
    this.renderLogLine(step);
  }

  private phaseText(p: CycleStep['phase']): string {
    return { init: '初始化', chase: '追逐', meet: '相遇', 'find-entry': '找入环口', 'no-cycle': '无环', done: '完成' }[p];
  }

  private drawCanvas(step: CycleStep): void {
    if (!this.canvas || !this.ctx) return;
    const parent = this.canvas.parentElement;
    this.canvas.width = parent?.clientWidth || 600;
    this.canvas.height = parent?.clientHeight || 240;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const n = step.values.length;
    if (n === 0) return;
    const pos = step.pos;
    const hasCycle = pos !== -1;

    // 布局：环外节点水平排列，环内节点排成圆形
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const radius = Math.min(90, this.canvas.height * 0.32);
    const tailX = cx - radius - 110;

    const positions: Array<{ x: number; y: number }> = [];
    // 环外节点 0..pos-1
    const outsideCount = hasCycle ? pos : n;
    for (let i = 0; i < outsideCount; i++) {
      positions.push({ x: tailX + i * 60, y: cy });
    }
    if (hasCycle) {
      const cycleLen = n - pos;
      for (let i = 0; i < cycleLen; i++) {
        const angle = (i / cycleLen) * Math.PI * 2 - Math.PI / 2;
        positions.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
      }
    }

    // 画连接线
    ctx.strokeStyle = '#45475a';
    ctx.lineWidth = 2;
    for (let i = 0; i < n; i++) {
      const from = positions[i];
      const toIndex = hasCycle ? (i === n - 1 ? pos : i + 1) : (i + 1 < n ? i + 1 : -1);
      if (toIndex === -1) continue;
      const to = positions[toIndex];
      this.drawArrow(ctx, from.x, from.y, to.x, to.y);
    }

    // 画节点
    for (let i = 0; i < n; i++) {
      const { x, y } = positions[i];
      let fill = '#11111b';
      let stroke = '#45475a';
      let textColor = '#cdd6f4';
      if (i === step.entryIndex) { fill = '#a6e3a1'; stroke = '#a6e3a1'; textColor = '#1e1e2e'; }
      else if (i === step.meetIndex) { fill = '#f9e2af'; stroke = '#f9e2af'; textColor = '#1e1e2e'; }
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.font = '13px Consolas';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(step.values[i]), x, y);
    }

    // 画 fast/slow 指针标记
    if (step.slow < n) this.drawPointer(ctx, positions[step.slow], '#94e2d5', 'slow', -28);
    if (step.fast < n && step.fast !== step.slow) this.drawPointer(ctx, positions[step.fast], '#89b4fa', 'fast', 28);
  }

  private drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;
    const ux = dx / len, uy = dy / len;
    const sx = x1 + ux * 20, sy = y1 + uy * 20;
    const ex = x2 - ux * 24, ey = y2 - uy * 24;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    // 箭头
    const ang = Math.atan2(dy, dx);
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - 7 * Math.cos(ang - 0.4), ey - 7 * Math.sin(ang - 0.4));
    ctx.lineTo(ex - 7 * Math.cos(ang + 0.4), ey - 7 * Math.sin(ang + 0.4));
    ctx.closePath();
    ctx.fillStyle = '#45475a';
    ctx.fill();
  }

  private drawPointer(ctx: CanvasRenderingContext2D, pos: { x: number; y: number }, color: string, label: string, offsetY: number): void {
    ctx.fillStyle = color;
    ctx.font = 'bold 11px Consolas';
    ctx.textAlign = 'center';
    ctx.fillText(label, pos.x + offsetY * 0.6, pos.y - 30);
    ctx.beginPath();
    ctx.moveTo(pos.x + offsetY * 0.6, pos.y - 24);
    ctx.lineTo(pos.x, pos.y - 20);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private renderLogLine(step: CycleStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'linked-list-cycle-ii',
  name: '环形链表 II（快慢指针）',
  viewId: 'algo-linked-list-cycle-ii-view',
  category: 'linked-list',
  description: '快慢指针相遇后找入环口',
  icon: '🔄',
  template,
  Visualizer: LinkedListCycleIIVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '理解快慢指针检测环 + 找入环点的数学原理',
});
