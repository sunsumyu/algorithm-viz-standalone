/**
 * 设计链表可视化器（MyLinkedList）— 声明式 4-Card 标准架构
 * LeetCode 707：虚拟头节点单链表增删查改
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  DESIGN_LINKED_LIST_PROBLEM_HTML,
  DESIGN_LINKED_LIST_ANALYSIS_HTML,
  DESIGN_LINKED_LIST_CODE_LANGUAGES,
} from './design-linked-list-problem-content';

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
function withMetrics(steps: DLLStep[]): DLLStep[] {
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

export function renderDesignLinkedListCanvas(container: HTMLElement, step: DLLStep): void {
  const values = step.values;

  // 虚拟头节点
  const dummyHtml = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
      <div style="min-height: 14px; display: flex; gap: 2px;">
        <span style="background:#f59e0b; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">dummyHead</span>
      </div>
      <div style="min-width: 44px; height: 44px; padding: 0 8px; border-radius: 10px; background: #fffbeb; border: 2px dashed #f59e0b; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <span style="font-size: 13px; font-weight: 800; color: #b45309; font-family: 'JetBrains Mono', monospace;">0</span>
        <span style="font-size: 8.5px; color: #d97706; font-family: monospace;">[dummy]</span>
      </div>
    </div>
  `;

  const nodesHtml = values.map((val, idx) => {
    let borderColor = '#e2e8f0';
    let bgColor = '#ffffff';
    let badgeHtml = '';

    if (step.highlightIndex === idx) {
      if (step.highlightKind === 'add') {
        borderColor = '#10b981';
        bgColor = '#ecfdf5';
        badgeHtml = '<span style="background:#059669; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">+插入</span>';
      } else if (step.highlightKind === 'del') {
        borderColor = '#ef4444';
        bgColor = '#fef2f2';
        badgeHtml = '<span style="background:#ef4444; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">-删除</span>';
      } else if (step.highlightKind === 'get') {
        borderColor = '#2563eb';
        bgColor = '#eff6ff';
        badgeHtml = '<span style="background:#2563eb; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">?查询</span>';
      }
    }

    return `
      <div style="display: flex; align-items: center; color: #94a3b8; font-size: 14px; margin-top: 14px;">▶</div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; position: relative;">
        <div style="min-height: 14px; display: flex; gap: 2px;">
          ${badgeHtml}
        </div>
        <div style="min-width: 44px; height: 44px; padding: 0 8px; border-radius: 10px; background: ${bgColor}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
          <span style="font-size: 13px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${val}</span>
          <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">[${idx}]</span>
        </div>
      </div>
    `;
  });

  const nullHtml = `
    <div style="display: flex; align-items: center; color: #94a3b8; font-size: 14px; margin-top: 14px;">▶</div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
      <div style="min-height: 14px;"></div>
      <div style="min-width: 40px; height: 44px; padding: 0 8px; border-radius: 10px; background: #f1f5f9; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 11px; font-weight: 700; color: #64748b; font-family: monospace;">null</span>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div style="display: flex; align-items: center; gap: 6px; width: 100%; min-height: 100%;">
      ${dummyHtml}
      ${nodesHtml.join('')}
      ${nullHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'design-linked-list',
  name: '设计链表',
  category: 'linked-list',
  description: 'LeetCode 707 · 使用虚拟头节点 (dummyHead) 实现单链表增删查改 (CRUD)',
  icon: '🛠️',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '深入掌握虚拟头节点 (dummyHead) 统一链表头与中间操作的标准编程范式',
  inputs: [],
  metrics: [
    { id: 'size', label: '链表长度 (size)', color: '#2563eb' },
    { id: 'head', label: '头节点值 (head)', color: '#059669' },
    { id: 'tail', label: '尾节点值 (tail)', color: '#059669' },
    { id: 'call', label: '当前调用方法', color: '#0f172a' },
    { id: 'index', label: '影响节点索引', color: '#2563eb' },
    { id: 'ret', label: '操作返回值', color: '#2563eb' },
  ],
  legend: [
    { label: 'dummyHead', color: '#f59e0b' },
    { label: '新增节点', color: '#059669' },
    { label: '删除目标', color: '#ef4444' },
    { label: '查询高亮', color: '#2563eb' },
  ],
  codeLanguages: DESIGN_LINKED_LIST_CODE_LANGUAGES,
  problemHtml: DESIGN_LINKED_LIST_PROBLEM_HTML,
  analysisHtml: DESIGN_LINKED_LIST_ANALYSIS_HTML,
  generateSteps: () => withMetrics(buildPresetSteps()),
  renderCanvas: (container, step) => renderDesignLinkedListCanvas(container, step as DLLStep),
});
