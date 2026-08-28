/**
 * 相交链表可视化器（双指针）
 * 重做：玻璃感 stat 面板 + 双指针同步走线 + 交点 pulse 脉冲 + 完整执行日志
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './intersection-linked-list.html?raw';

export interface ILLStep {
  listA: number[];
  listB: number[];
  /** skipA / skipB：相交时公共区间的起点下标（-1 = 无） */
  skipA: number;
  skipB: number;
  pa: number;             // 在当前所在链表中的下标
  pb: number;
  paOnList: 'A' | 'B' | 'null';
  pbOnList: 'A' | 'B' | 'null';
  paJumped: boolean;      // 上一拍从 A→B 或 B→A（用于"切换链表"动画）
  pbJumped: boolean;
  stepsTaken: number;
  found: boolean;         // 命中交点
  missed: boolean;        // 双方都到 null
  message: string;
  log: string;
  codeLine: number | number[];
}

export const LIST_A_MEET = [4, 1, 8, 4, 5];   // 公共区间 8,4,5 (skipA = 2)
export const LIST_B_MEET = [5, 6, 1, 8, 4, 5]; // 公共区间 8,4,5 (skipB = 3)
export const LIST_A_MISS = [2, 6, 4];
export const LIST_B_MISS = [1, 5];

export function buildIntersectionSteps(intersect: boolean): ILLStep[] {
  const steps: ILLStep[] = [];
  const listA = intersect ? LIST_A_MEET : LIST_A_MISS;
  const listB = intersect ? LIST_B_MEET : LIST_B_MISS;
  const skipA = intersect ? 2 : -1;
  const skipB = intersect ? 3 : -1;

  let pa = 0, pb = 0;
  let paOnList: 'A' | 'B' | 'null' = 'A';
  let pbOnList: 'A' | 'B' | 'null' = 'B';
  let paJumped = false, pbJumped = false;
  let step = 0;

  const getNode = (onList: 'A' | 'B' | 'null', idx: number): number | null => {
    if (onList === 'null') return null;
    const arr = onList === 'A' ? listA : listB;
    return idx < arr.length ? arr[idx] : null;
  };

  steps.push({
    listA, listB, skipA, skipB, pa, pb,
    paOnList, pbOnList, paJumped, pbJumped, stepsTaken: 0,
    found: false, missed: false,
    message: `初始化：pA 指向 A 头（${listA[0]}），pB 指向 B 头（${listB[0]}）。`,
    log: `init pA=A[0](${listA[0]}), pB=B[0](${listB[0]})`,
    codeLine: [1, 2],
  });

  const maxSteps = listA.length + listB.length + 2;
  while (step < maxSteps) {
    step++;
    const va = getNode(paOnList, pa);
    const vb = getNode(pbOnList, pb);

    // 同时为 null
    if (va === null && vb === null) {
      steps.push({
        listA, listB, skipA, skipB, pa, pb,
        paOnList: 'null', pbOnList: 'null', paJumped, pbJumped, stepsTaken: step,
        found: false, missed: true,
        message: `pA 与 pB 同时到达 null，无交点。`,
        log: `both null after ${step} steps`,
        codeLine: 3,
      });
      break;
    }
    // 同一节点（值相同）即相遇
    if (va !== null && vb !== null && va === vb) {
      steps.push({
        listA, listB, skipA, skipB, pa, pb,
        paOnList, pbOnList, paJumped, pbJumped, stepsTaken: step,
        found: true, missed: false,
        message: `🎯 pA 与 pB 在节点 ${va} 相遇！交点 = ${va}，共 ${step} 步。`,
        log: `meet @ ${va} after ${step} steps`,
        codeLine: 3,
      });
      break;
    }

    // 步进 + 切换链表（用函数包一层避开 TS 流的窄化）
    const labelFor = (onList: 'A' | 'B' | 'null'): string => onList === 'null' ? '-' : onList;
    const whereA = `${labelFor(paOnList)}[${labelFor(paOnList) === '-' ? '-' : pa}]=${va}`;
    const whereB = `${labelFor(pbOnList)}[${labelFor(pbOnList) === '-' ? '-' : pb}]=${vb}`;
    steps.push({
      listA, listB, skipA, skipB, pa, pb,
      paOnList, pbOnList, paJumped, pbJumped, stepsTaken: step,
      found: false, missed: false,
      message: `比较：pA(${whereA}) ≠ pB(${whereB})，双方前移一步${paJumped || pbJumped ? '（pA/pB 切换到对方链表继续）' : ''}。`,
        log: `pA=${whereA}, pB=${whereB}`,
        codeLine: 2,
    });

    // 推进
    paJumped = false; pbJumped = false;
    if (paOnList === 'A') {
      if (pa + 1 < listA.length) {
        pa++;
      } else {
        pa = -1;
        paOnList = 'null';
      }
    } else if (paOnList === 'null') {
      pa = 0;
      paOnList = 'B';
      paJumped = true;
    } else if (paOnList === 'B') {
      if (pa + 1 < listB.length) {
        pa++;
      } else {
        pa = -1;
        paOnList = 'null';
      }
    }

    if (pbOnList === 'B') {
      if (pb + 1 < listB.length) {
        pb++;
      } else {
        pb = -1;
        pbOnList = 'null';
      }
    } else if (pbOnList === 'null') {
      pb = 0;
      pbOnList = 'A';
      pbJumped = true;
    } else if (pbOnList === 'A') {
      if (pb + 1 < listA.length) {
        pb++;
      } else {
        pb = -1;
        pbOnList = 'null';
      }
    }
  }

  return steps;
}

export class IntersectionLinkedListVisualizer extends StepVisualizer<ILLStep> {
  protected codeLines = [
    'ListNode getIntersectionNode(ListNode headA, ListNode headB) {',
    '    ListNode pA = headA, pB = headB;',
    '    while (pA != pB) {',
    '        pA = (pA != null) ? pA.next : headB;',
    '        pB = (pB != null) ? pB.next : headA;',
    '    }',
    '    return pA; // 相交节点或 null',
    '}',
  ];
  protected codePanelTitle = '✂️ 相交链表 Java 源码';

  private statPa: HTMLElement | null = null;
  private statPb: HTMLElement | null = null;
  private statLen: HTMLElement | null = null;
  private statStep: HTMLElement | null = null;
  private statMeet: HTMLElement | null = null;
  private canvasEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;
  private mode: 'meet' | 'miss' = 'meet';

  protected initDOMElements(): void {
    if (!this.root) return;
    this.statPa = this.root.querySelector('#ill-stat-pa');
    this.statPb = this.root.querySelector('#ill-stat-pb');
    this.statLen = this.root.querySelector('#ill-stat-len');
    this.statStep = this.root.querySelector('#ill-stat-step');
    this.statMeet = this.root.querySelector('#ill-stat-meet');
    this.canvasEl = this.root.querySelector('#ill-canvas');
    this.resultEl = this.root.querySelector('#ill-result');
    this.logEl = this.root.querySelector('#ill-log');
    this.clearLogBtn = this.root.querySelector('#ill-log-clear');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'ill-speed', speedLabel: 'ill-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#ill-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.ill-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.mode = (btn.dataset.mode === 'miss' ? 'miss' : 'meet');
        this.start();
      });
    });
    this.clearLogBtn?.addEventListener('click', () => { if (this.logEl) this.logEl.innerHTML = ''; });
  }

  protected buildSteps(): ILLStep[] {
    return buildIntersectionSteps(this.mode === 'miss' ? false : true);
  }

  protected renderStep(step: ILLStep): void {
    this.renderStats(step);
    this.renderCanvas(step);
    this.renderResultBanner(step);
    this.renderLogPanel(step);
  }

  private renderStats(step: ILLStep): void {
    const fmt = (onList: string, idx: number) => onList === 'null' ? 'null' : `${onList}[${idx}]`;
    if (this.statPa) this.statPa.textContent = fmt(step.paOnList, step.pa);
    if (this.statPb) this.statPb.textContent = fmt(step.pbOnList, step.pb);
    if (this.statLen) this.statLen.textContent = `${step.listA.length} + ${step.listB.length}`;
    if (this.statStep) this.statStep.textContent = String(step.stepsTaken);
    if (this.statMeet) {
      this.statMeet.textContent = step.found ? `${step.listA[step.pa]} ✓` : (step.missed ? 'null' : '-');
    }
  }

  private renderCanvas(step: ILLStep): void {
    if (!this.canvasEl) return;
    this.canvasEl.innerHTML = '';

    const rowA = document.createElement('div');
    rowA.className = 'ill-list-row';
    const lblA = document.createElement('span');
    lblA.className = 'ill-list-label ill-list-label--a';
    lblA.textContent = 'List A';
    rowA.appendChild(lblA);
    this.renderListInto(rowA, step, 'A');

    const track = document.createElement('div');
    track.className = 'ill-track';
    const trackLine = document.createElement('div');
    trackLine.className = 'ill-track-line';
    track.appendChild(trackLine);
    this.canvasEl.appendChild(rowA);
    this.canvasEl.appendChild(track);

    const rowB = document.createElement('div');
    rowB.className = 'ill-list-row';
    const lblB = document.createElement('span');
    lblB.className = 'ill-list-label ill-list-label--b';
    lblB.textContent = 'List B';
    rowB.appendChild(lblB);
    this.renderListInto(rowB, step, 'B');
    this.canvasEl.appendChild(rowB);
  }

  private renderListInto(row: HTMLElement, step: ILLStep, which: 'A' | 'B'): void {
    const values = which === 'A' ? step.listA : step.listB;
    const skip = which === 'A' ? step.skipA : step.skipB;
    values.forEach((val, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'ill-node-wrap';
      const node = document.createElement('div');
      node.className = 'ill-node ' + (which === 'A' ? 'ill-list-a' : 'ill-list-b');
      if (skip >= 0 && idx >= skip) node.classList.add('ill-list-shared');
      if (step.found && idx === (which === 'A' ? step.pa : step.paOnList === 'A' ? step.pa : step.pb) && (which === 'A' ? step.paOnList === 'A' : step.pbOnList === 'B')) {
        // 命中条件：当前指针在这条链表上，且下标 == 节点下标
        if (step.paOnList === which && step.pa === idx) node.classList.add('ill-meeting');
        if (step.pbOnList === which && step.pb === idx) node.classList.add('ill-meeting');
      }
      node.textContent = String(val);
      wrap.appendChild(node);

      // 指针
      if (which === 'A' && step.paOnList === 'A' && step.pa === idx) {
        const ptr = document.createElement('span');
        ptr.className = 'ill-pointer ill-pointer--a';
        ptr.textContent = 'pA';
        wrap.appendChild(ptr);
      }
      if (which === 'B' && step.pbOnList === 'B' && step.pb === idx) {
        const ptr = document.createElement('span');
        ptr.className = 'ill-pointer ill-pointer--b';
        ptr.textContent = 'pB';
        wrap.appendChild(ptr);
      }

      const arrow = document.createElement('span');
      arrow.className = 'ill-arrow';
      arrow.textContent = '→';
      wrap.appendChild(arrow);
      row.appendChild(wrap);
    });
    const nullSpan = document.createElement('span');
    nullSpan.className = 'ill-null';
    nullSpan.style.color = '#64748b';
    nullSpan.style.fontFamily = "'JetBrains Mono', monospace";
    nullSpan.style.fontSize = '13px';
    nullSpan.style.padding = '6px 12px';
    nullSpan.style.border = '1.5px dashed rgba(100, 116, 139, .35)';
    nullSpan.style.borderRadius = '999px';
    nullSpan.style.marginLeft = '8px';
    nullSpan.textContent = 'null';
    row.appendChild(nullSpan);
  }

  private renderResultBanner(step: ILLStep): void {
    if (!this.resultEl) return;
    this.resultEl.classList.remove('ill-result--meet', 'ill-result--miss');
    const emoji = this.resultEl.querySelector('.ill-emoji') as HTMLElement | null;
    if (step.found) {
      this.resultEl.classList.add('ill-result--meet');
      if (emoji) emoji.textContent = '🎯';
    } else if (step.missed) {
      this.resultEl.classList.add('ill-result--miss');
      if (emoji) emoji.textContent = '😶';
    } else if (step.paJumped || step.pbJumped) {
      if (emoji) emoji.textContent = '🔁';
    } else {
      if (emoji) emoji.textContent = '👣';
    }
  }

  private renderLogPanel(step: ILLStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'ill-log-line' + (i === this.currentIndex ? ' ill-log-active' : '');
      const num = document.createElement('span');
      num.className = 'ill-log-num';
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
  id: 'intersection-linked-list',
  name: '相交链表（双指针）',
  viewId: 'algo-intersection-linked-list-view',
  category: 'linked-list',
  description: '双指针遍历 A+B 与 B+A，相交时必在交点相遇',
  icon: '✂️',
  template,
  Visualizer: IntersectionLinkedListVisualizer,
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握双链表长度差对齐的交汇点检测',
});
