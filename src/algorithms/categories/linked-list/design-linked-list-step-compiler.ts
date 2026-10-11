/**
 * 设计链表 — 步进推演编译器
 * LeetCode 707：虚拟头节点单链表增删查改
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export type OpType = 'addAtHead' | 'addAtTail' | 'addAtIndex' | 'deleteAtIndex' | 'get' | 'init';

export const DLL_CODE_LINES: Record<OpType, HighlightTarget> = {
  init: { java: [5, 6, 7], cpp: [10, 11, 12], python: [7, 8, 9], javascript: [1, 2, 3] },
  get: { java: 11, cpp: 14, python: 11, javascript: 6 },
  addAtHead: { java: 18, cpp: 20, python: 20, javascript: 14 },
  addAtTail: { java: 22, cpp: 21, python: 23, javascript: 18 },
  addAtIndex: { java: 25, cpp: 22, python: 25, javascript: 21 },
  deleteAtIndex: { java: 36, cpp: 32, python: 38, javascript: 31 },
};

export interface DLLNode {
  val: number;
  next: DLLNode | null;
}

export interface DLLStep {
  values: number[];
  op: OpType;
  args: number[];
  highlightIndex: number; // -1 = 无高亮
  highlightKind: 'add' | 'del' | 'get' | '';
  ret: number | string;
  size: number;
  message: string;
  codeLine: HighlightTarget;
  log?: string;
  metrics?: Record<string, string>;
}

export class LinkedListModel {
  private head: DLLNode | null = null;
  private size = 0;

  public getSize(): number {
    return this.size;
  }

  public values(): number[] {
    const out: number[] = [];
    let cur = this.head;
    while (cur) {
      out.push(cur.val);
      cur = cur.next;
    }
    return out;
  }

  public reset(): void {
    this.head = null;
    this.size = 0;
  }

  public get(index: number): number {
    if (index < 0 || index >= this.size) return -1;
    let cur = this.head;
    for (let i = 0; i < index; i++) cur = cur!.next;
    return cur!.val;
  }

  public addAtHead(val: number): void {
    this.head = { val, next: this.head };
    this.size++;
  }

  public addAtTail(val: number): void {
    if (!this.head) {
      this.addAtHead(val);
      return;
    }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = { val, next: null };
    this.size++;
  }

  public addAtIndex(index: number, val: number): boolean {
    if (index > this.size) return false;
    if (index <= 0) {
      this.addAtHead(val);
      return true;
    }
    let cur = this.head;
    for (let i = 0; i < index - 1; i++) cur = cur!.next;
    cur!.next = { val, next: cur!.next };
    this.size++;
    return true;
  }

  public deleteAtIndex(index: number): boolean {
    if (index < 0 || index >= this.size) return false;
    if (index === 0) {
      this.head = this.head!.next;
      this.size--;
      return true;
    }
    let cur = this.head;
    for (let i = 0; i < index - 1; i++) cur = cur!.next;
    cur!.next = cur!.next ? cur!.next.next : null;
    this.size--;
    return true;
  }
}

export function buildPresetSteps(): DLLStep[] {
  const model = new LinkedListModel();
  const steps: DLLStep[] = [];

  steps.push({
    values: [],
    op: 'init',
    args: [],
    highlightIndex: -1,
    highlightKind: '',
    ret: 'void',
    size: 0,
    message: '初始化 MyLinkedList()：虚拟头节点 dummyHead 创建，size = 0',
    codeLine: DLL_CODE_LINES.init,
  });

  // 1. addAtHead(1)
  model.addAtHead(1);
  steps.push({
    values: model.values(),
    op: 'addAtHead',
    args: [1],
    highlightIndex: 0,
    highlightKind: 'add',
    ret: 'void',
    size: model.getSize(),
    message: 'addAtHead(1)：在头部插入节点 1，当前链表: [1]',
    codeLine: DLL_CODE_LINES.addAtHead,
  });

  // 2. addAtTail(3)
  model.addAtTail(3);
  steps.push({
    values: model.values(),
    op: 'addAtTail',
    args: [3],
    highlightIndex: model.getSize() - 1,
    highlightKind: 'add',
    ret: 'void',
    size: model.getSize(),
    message: 'addAtTail(3)：在尾部追加节点 3，当前链表: [1, 3]',
    codeLine: DLL_CODE_LINES.addAtTail,
  });

  // 3. addAtIndex(1, 2)
  model.addAtIndex(1, 2);
  steps.push({
    values: model.values(),
    op: 'addAtIndex',
    args: [1, 2],
    highlightIndex: 1,
    highlightKind: 'add',
    ret: 'void',
    size: model.getSize(),
    message: 'addAtIndex(1, 2)：在索引 1 处插入节点 2，当前链表: [1, 2, 3]',
    codeLine: DLL_CODE_LINES.addAtIndex,
  });

  // 4. get(1) -> 2
  const r1 = model.get(1);
  steps.push({
    values: model.values(),
    op: 'get',
    args: [1],
    highlightIndex: 1,
    highlightKind: 'get',
    ret: r1,
    size: model.getSize(),
    message: `get(1)：查询索引 1 处的值，返回 ${r1}`,
    codeLine: DLL_CODE_LINES.get,
  });

  // 5. deleteAtIndex(1)
  model.deleteAtIndex(1);
  steps.push({
    values: model.values(),
    op: 'deleteAtIndex',
    args: [1],
    highlightIndex: 1,
    highlightKind: 'del',
    ret: 'void',
    size: model.getSize(),
    message: 'deleteAtIndex(1)：删除索引 1 处的节点，当前链表: [1, 3]',
    codeLine: DLL_CODE_LINES.deleteAtIndex,
  });

  // 6. get(1) -> 3
  const r2 = model.get(1);
  steps.push({
    values: model.values(),
    op: 'get',
    args: [1],
    highlightIndex: 1,
    highlightKind: 'get',
    ret: r2,
    size: model.getSize(),
    message: `get(1)：再次查询索引 1 处的值，返回 ${r2}`,
    codeLine: DLL_CODE_LINES.get,
  });

  return steps;
}

/** 为每一步附加状态监视器指标与执行日志（键名与 spec.metrics 的 id 一一对应） */
export function withDesignLinkedListMetrics(steps: DLLStep[]): DLLStep[] {
  return steps.map((s) => ({
    ...s,
    log: s.log ?? s.message,
    metrics: {
      size: `${s.size}`,
      head: s.values.length > 0 ? `${s.values[0]}` : 'null',
      tail: s.values.length > 0 ? `${s.values[s.values.length - 1]}` : 'null',
      call: `${s.op}(${s.args.join(', ')})`,
      index: s.highlightIndex !== -1 ? `[${s.highlightIndex}]` : '无 / 全局',
      ret: `${s.ret}`,
    },
  }));
}
