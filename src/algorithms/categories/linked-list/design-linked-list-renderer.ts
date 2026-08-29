/**
 * 设计链表可视化器（MyLinkedList）— 4-Card 标准现代架构
 * LeetCode 707：虚拟头节点单链表增删查改
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  DESIGN_LINKED_LIST_PROBLEM_HTML,
  DESIGN_LINKED_LIST_ANALYSIS_HTML,
  DESIGN_LINKED_LIST_CODE_LANGUAGES,
} from './design-linked-list-problem-content';
import template from './design-linked-list.html?raw';

export type OpType = 'addAtHead' | 'addAtTail' | 'addAtIndex' | 'deleteAtIndex' | 'get' | 'init';

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
  codeLine: number;
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
    codeLine: 6,
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
    codeLine: 18,
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
    codeLine: 22,
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
    codeLine: 25,
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
    codeLine: 11,
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
    codeLine: 36,
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
    codeLine: 11,
  });

  return steps;
}

export class DesignLinkedListVisualizer extends StepVisualizer<DLLStep> {
  protected codeLanguages = DESIGN_LINKED_LIST_CODE_LANGUAGES;
  protected codeLines = DESIGN_LINKED_LIST_CODE_LANGUAGES['java'];
  protected codePanelTitle = '设计链表代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private pointersContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  private currentModel = new LinkedListModel();

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#dll-sandbox-container');
    this.pointersContainer = this.root.querySelector('#dll-pointers-container');
    this.decisionMonitorContainer = this.root.querySelector('#dll-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#dll-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 绑定预设用例流
    this.root.querySelector('#btn-preset-suite')?.addEventListener('click', () => {
      this.steps = buildPresetSteps();
      this.currentIndex = 0;
      this.render();
    });

    // 绑定单独单步操作按钮
    this.root.querySelector('#btn-add-head')?.addEventListener('click', () => this.handleOp('addAtHead'));
    this.root.querySelector('#btn-add-tail')?.addEventListener('click', () => this.handleOp('addAtTail'));
    this.root.querySelector('#btn-add-idx')?.addEventListener('click', () => this.handleOp('addAtIndex'));
    this.root.querySelector('#btn-del-idx')?.addEventListener('click', () => this.handleOp('deleteAtIndex'));
    this.root.querySelector('#btn-get-idx')?.addEventListener('click', () => this.handleOp('get'));

    // 重置
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => {
      this.currentModel.reset();
      this.steps = [
        {
          values: [],
          op: 'init',
          args: [],
          highlightIndex: -1,
          highlightKind: '',
          ret: 'void',
          size: 0,
          message: '重置链表为空状态',
          codeLine: 6,
        },
      ];
      this.currentIndex = 0;
      this.render();
    });

    // 绑定 Scrubber 进度条
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 绑定前进后退按钮
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: DESIGN_LINKED_LIST_PROBLEM_HTML,
      analysisHtml: DESIGN_LINKED_LIST_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  private handleOp(op: OpType): void {
    const valInput = this.root?.querySelector('#input-val') as HTMLInputElement | null;
    const idxInput = this.root?.querySelector('#input-idx') as HTMLInputElement | null;

    const val = parseInt(valInput?.value || '0', 10);
    const idx = parseInt(idxInput?.value || '0', 10);

    let msg = '';
    let ret: number | string = 'void';
    let hlIdx = -1;
    let hlKind: 'add' | 'del' | 'get' | '' = '';
    let codeLine = 1;

    if (op === 'addAtHead') {
      this.currentModel.addAtHead(val);
      msg = `addAtHead(${val})：头部插入节点 ${val}`;
      hlIdx = 0;
      hlKind = 'add';
      codeLine = 18;
    } else if (op === 'addAtTail') {
      this.currentModel.addAtTail(val);
      msg = `addAtTail(${val})：尾部追加节点 ${val}`;
      hlIdx = this.currentModel.getSize() - 1;
      hlKind = 'add';
      codeLine = 22;
    } else if (op === 'addAtIndex') {
      const ok = this.currentModel.addAtIndex(idx, val);
      msg = ok ? `addAtIndex(${idx}, ${val})：索引 ${idx} 插入节点 ${val}` : `addAtIndex(${idx}, ${val})：索引越界忽略`;
      hlIdx = ok ? idx : -1;
      hlKind = ok ? 'add' : '';
      codeLine = 25;
    } else if (op === 'deleteAtIndex') {
      const ok = this.currentModel.deleteAtIndex(idx);
      msg = ok ? `deleteAtIndex(${idx})：成功删除索引 ${idx} 处节点` : `deleteAtIndex(${idx})：索引无效无法删除`;
      hlIdx = ok ? idx : -1;
      hlKind = ok ? 'del' : '';
      codeLine = 36;
    } else if (op === 'get') {
      ret = this.currentModel.get(idx);
      msg = `get(${idx})：获取索引 ${idx} 的值，结果为 ${ret}`;
      hlIdx = idx >= 0 && idx < this.currentModel.getSize() ? idx : -1;
      hlKind = 'get';
      codeLine = 11;
    }

    const step: DLLStep = {
      values: this.currentModel.values(),
      op,
      args: op === 'addAtIndex' ? [idx, val] : op === 'addAtHead' || op === 'addAtTail' ? [val] : [idx],
      highlightIndex: hlIdx,
      highlightKind: hlKind,
      ret,
      size: this.currentModel.getSize(),
      message: msg,
      codeLine,
    };

    this.steps.push(step);
    this.currentIndex = this.steps.length - 1;
    this.render();
  }

  protected buildSteps(): DLLStep[] {
    return buildPresetSteps();
  }

  protected renderStep(step: DLLStep): void {
    const values = step.values;

    // 1. 渲染拓扑沙盘 (Card 1)
    if (this.sandboxContainer) {
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

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px; width: 100%; min-height: 100%;">
          ${dummyHtml}
          ${nodesHtml.join('')}
          ${nullHtml}
        </div>
      `;
    }

    // 2. 渲染链表属性 (Card 2 Left)
    if (this.pointersContainer) {
      this.pointersContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>链表长度 (size):</span>
            <span style="font-family: monospace; font-weight: 800; color: #2563eb;">${step.size}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>头节点值 (head):</span>
            <span style="font-family: monospace; font-weight: 800; color: #059669;">${values.length > 0 ? values[0] : 'null'}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>尾节点值 (tail):</span>
            <span style="font-family: monospace; font-weight: 800; color: #059669;">${values.length > 0 ? values[values.length - 1] : 'null'}</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染指令监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前调用方法:</span>
            <span style="font-family: monospace; font-weight: 800; color: #0f172a;">${step.op}(${step.args.join(', ')})</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>影响节点索引:</span>
            <span style="font-family: monospace; font-weight: 800; color: ${step.highlightIndex !== -1 ? '#2563eb' : '#64748b'};">
              ${step.highlightIndex !== -1 ? `[${step.highlightIndex}]` : '无 / 全局'}
            </span>
          </div>
        </div>
      `;
    }

    // 4. 渲染返回值 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>操作返回值: <strong style="color: #2563eb; font-family: monospace; font-size: 13px;">${step.ret}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">单链表结构合法</span>
          </div>
        </div>
      `;
    }

    // 5. 更新 Scrubber 进度条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    const stepCur = this.root?.querySelector('#step-cur') as HTMLElement | null;
    const stepTotal = this.root?.querySelector('#step-total') as HTMLElement | null;
    const playIcon = this.root?.querySelector('#play-icon') as HTMLElement | null;

    if (slider) {
      slider.max = String(Math.max(0, this.steps.length - 1));
      slider.value = String(this.currentIndex);
    }
    if (stepCur) stepCur.textContent = String(this.currentIndex + 1);
    if (stepTotal) stepTotal.textContent = String(this.steps.length);
    if (playIcon) {
      playIcon.className = this.isPlaying ? 'fa-solid fa-pause text-[12px]' : 'fa-solid fa-play text-[12px]';
    }

    // 6. 暗色终端代码行高亮
    this.terminalInstance?.highlightLine(step.codeLine);

    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '执行';

        if (st.op === 'addAtHead' || st.op === 'addAtTail' || st.op === 'addAtIndex') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '插入';
        } else if (st.op === 'deleteAtIndex') {
          badgeColor = '#ef4444';
          badgeBg = '#fef2f2';
          badgeText = '删除';
        } else if (st.op === 'get') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '查询';
        }

        return `
          <div style="display: flex; align-items: flex-start; gap: 6px; padding: 3px 0; border-bottom: 1px solid #f8fafc; font-size: 11px;">
            <span style="color: #94a3b8; font-family: monospace; font-size: 10px; min-width: 24px;">#${idx + 1}</span>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 10px;">${badgeText}</span>
            <span style="color: #334155; flex: 1;">${st.message}</span>
          </div>
        `;
      });

      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.sandboxContainer) this.sandboxContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'design-linked-list',
  name: '设计链表',
  viewId: 'algo-design-linked-list-view',
  category: 'linked-list',
  description: 'LeetCode 707 · 使用虚拟头节点 (dummyHead) 实现单链表增删查改 (CRUD)',
  icon: '🛠️',
  template,
  Visualizer: DesignLinkedListVisualizer,
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '深入掌握虚拟头节点 (dummyHead) 统一链表头与中间操作的标准编程范式',
});
