/**
 * 栈与队列理论基础可视化器 — 4-Card 标准现代架构
 * 演示栈 (LIFO) 和队列 (FIFO) 的核心受控访问操作
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  STACK_QUEUE_THEORY_PROBLEM_HTML,
  STACK_QUEUE_THEORY_ANALYSIS_HTML,
  STACK_QUEUE_THEORY_CODE_LANGUAGES,
} from './stack-queue-theory-problem-content';
import template from './stack-queue-theory.html?raw';

export interface SQStep {
  mode: 'stack' | 'queue';
  data: number[];
  action: 'init' | 'push' | 'pop' | 'enqueue' | 'dequeue' | 'peek' | 'done';
  value: number | null;
  message: string;
  codeLine: number;
}

export function buildStackSteps(): SQStep[] {
  const steps: SQStep[] = [];
  const data: number[] = [];

  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'init',
    value: null,
    message: '初始化空栈：栈为空，仅允许在栈顶一端进行 push 和 pop',
    codeLine: 2,
  });

  // push 1
  data.push(1);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 1,
    message: 'push(1)：将元素 1 压入栈顶。栈内容: [1]',
    codeLine: 3,
  });

  // push 2
  data.push(2);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 2,
    message: 'push(2)：将元素 2 压入栈顶。栈内容: [1, 2]',
    codeLine: 4,
  });

  // push 3
  data.push(3);
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'push',
    value: 3,
    message: 'push(3)：将元素 3 压入栈顶。栈内容: [1, 2, 3]',
    codeLine: 4,
  });

  // peek
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'peek',
    value: 3,
    message: 'peek()：查看栈顶元素为 3（不改变栈状态）',
    codeLine: 5,
  });

  // pop 3
  data.pop();
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'pop',
    value: 3,
    message: 'pop()：弹出栈顶元素 3。后进先出 (LIFO)，栈剩余: [1, 2]',
    codeLine: 6,
  });

  // pop 2
  data.pop();
  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'pop',
    value: 2,
    message: 'pop()：弹出栈顶元素 2。栈剩余: [1]',
    codeLine: 6,
  });

  steps.push({
    mode: 'stack',
    data: [...data],
    action: 'done',
    value: null,
    message: '🎉 栈操作演示完成！完美展示 LIFO (后入先出) 行为',
    codeLine: 6,
  });

  return steps;
}

export function buildQueueSteps(): SQStep[] {
  const steps: SQStep[] = [];
  const data: number[] = [];

  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'init',
    value: null,
    message: '初始化空队列：队列为空，在一端（队尾）入队，另一端（队头）出队',
    codeLine: 9,
  });

  // offer 10
  data.push(10);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 10,
    message: 'offer(10)：元素 10 进入队尾。队列: [10]',
    codeLine: 10,
  });

  // offer 20
  data.push(20);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 20,
    message: 'offer(20)：元素 20 进入队尾。队列: [10, 20]',
    codeLine: 11,
  });

  // offer 30
  data.push(30);
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'enqueue',
    value: 30,
    message: 'offer(30)：元素 30 进入队尾。队列: [10, 20, 30]',
    codeLine: 11,
  });

  // peek
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'peek',
    value: 10,
    message: 'peek()：查看队头元素为 10（最早进入的元素）',
    codeLine: 12,
  });

  // poll 10
  data.shift();
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'dequeue',
    value: 10,
    message: 'poll()：队头元素 10 出队。先进先出 (FIFO)，队列剩余: [20, 30]',
    codeLine: 13,
  });

  // poll 20
  data.shift();
  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'dequeue',
    value: 20,
    message: 'poll()：队头元素 20 出队。队列剩余: [30]',
    codeLine: 13,
  });

  steps.push({
    mode: 'queue',
    data: [...data],
    action: 'done',
    value: null,
    message: '🎉 队列操作演示完成！完美展示 FIFO (先入先出) 行为',
    codeLine: 13,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class StackQueueTheoryVisualizer extends StepVisualizer<SQStep> {
  protected codeLanguages = STACK_QUEUE_THEORY_CODE_LANGUAGES;
  protected codeLines = STACK_QUEUE_THEORY_CODE_LANGUAGES['java'];
  protected codePanelTitle = '栈与队列理论 代码调试';

  private currentMode: 'stack' | 'queue' = 'stack';
  private sandboxContainer: HTMLElement | null = null;
  private endpointStatusContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#sqt-sandbox-container');
    this.endpointStatusContainer = this.root.querySelector('#sqt-endpoint-status-container');
    this.decisionMonitorContainer = this.root.querySelector('#sqt-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#sqt-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定模式切换
    const btnStack = this.root.querySelector('#btn-mode-stack') as HTMLButtonElement | null;
    const btnQueue = this.root.querySelector('#btn-mode-queue') as HTMLButtonElement | null;

    btnStack?.addEventListener('click', () => {
      this.currentMode = 'stack';
      btnStack.classList.add('active');
      btnQueue?.classList.remove('active');
      const title = this.root?.querySelector('#sqt-sandbox-title');
      if (title) title.textContent = '🥞 栈 (Stack - LIFO) 容器沙盘';
      this.start();
    });

    btnQueue?.addEventListener('click', () => {
      this.currentMode = 'queue';
      btnQueue.classList.add('active');
      btnStack?.classList.remove('active');
      const title = this.root?.querySelector('#sqt-sandbox-title');
      if (title) title.textContent = '🔄 队列 (Queue - FIFO) 容器沙盘';
      this.start();
    });

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: STACK_QUEUE_THEORY_PROBLEM_HTML,
      analysisHtml: STACK_QUEUE_THEORY_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SQStep[] {
    return this.currentMode === 'stack' ? buildStackSteps() : buildQueueSteps();
  }

  protected renderStep(step: SQStep): void {
    const isStack = step.mode === 'stack';
    const data = step.data;

    // 1. 渲染沙盘 (Card 1)
    if (this.sandboxContainer) {
      const itemsHtml = data
        .map((num, idx) => {
          const isTopOrFront = isStack ? idx === data.length - 1 : idx === 0;
          const isRear = !isStack && idx === data.length - 1;

          let badge = '';
          if (isStack && isTopOrFront) badge = '🥇栈顶Top';
          else if (!isStack && isTopOrFront) badge = '🥇队头Front';
          else if (!isStack && isRear) badge = '队尾Rear';
          else badge = `[${idx}]`;

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="font-size: 8.5px; color: ${isTopOrFront ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
                ${badge}
              </span>
              <div style="min-width: 42px; height: 42px; padding: 0 8px; border-radius: 8px; background: ${isTopOrFront ? '#eff6ff' : '#ffffff'}; border: 2px solid ${isTopOrFront ? '#2563eb' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${isTopOrFront ? '#1d4ed8' : '#0f172a'}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                ${num}
              </div>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
            <span>${isStack ? '🥞 栈容器 (栈底 &rarr; 栈顶Top)' : '🔄 队列容器 (队头Front &rarr; 队尾Rear)'}:</span>
          </div>
          <div style="display: flex; gap: 8px; overflow-x: auto; padding: 4px 0; min-height: 56px; align-items: center;">
            ${data.length > 0 ? itemsHtml : `<span style="font-size: 10.5px; color: #94a3b8;">${isStack ? '空栈 (Empty Stack)' : '空队列 (Empty Queue)'}</span>`}
          </div>
        </div>
      `;
    }

    // 2. 渲染端点状态 (Card 2 Left)
    if (this.endpointStatusContainer) {
      const topOrFront = data.length > 0 ? (isStack ? data[data.length - 1] : data[0]) : null;

      this.endpointStatusContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前模式:</span>
            <span style="font-family: monospace; font-weight:800; color: #2563eb;">
              ${isStack ? '栈 (Stack - LIFO)' : '队列 (Queue - FIFO)'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>${isStack ? '当前栈顶元素:' : '当前队头元素:'}</span>
            <span style="font-family: monospace; font-weight:700; color: #059669; font-size: 13px;">
              ${topOrFront !== null ? topOrFront : '（空）'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染操作决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #64748b;">当前操作动作:</span>
            <span style="font-weight: 800; color: #2563eb; font-family: monospace; font-size: 12px; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">
              ${step.action.toUpperCase()}
            </span>
          </div>
          <div style="color: #334155; line-height: 1.4; margin-top: 2px;">
            ${step.message}
          </div>
        </div>
      `;
    }

    // 4. 渲染核心指标 (Card 2 Right)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 6px; text-align: center;">
            <div style="font-size: 9.5px; color: #64748b;">当前容量</div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; font-family: monospace;">${data.length}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 4px 6px; text-align: center;">
            <div style="font-size: 9.5px; color: #64748b;">时间复杂度</div>
            <div style="font-size: 13px; font-weight: 800; color: #059669; font-family: monospace;">O(1)</div>
          </div>
        </div>
      `;
    }

    // 6. 暗色终端代码行高亮
    this.terminalInstance?.highlightLine(step.codeLine);

    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '状态';

        if (st.action === 'push' || st.action === 'enqueue') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '入端';
        } else if (st.action === 'pop' || st.action === 'dequeue') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '出端';
        } else if (st.action === 'peek') {
          badgeColor = '#d97706';
          badgeBg = '#fffbeb';
          badgeText = '查看';
        } else if (st.action === 'done') {
          badgeColor = '#10b981';
          badgeBg = '#ecfdf5';
          badgeText = '完成';
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
  id: 'stack-queue-theory',
  name: '栈与队列理论基础',
  viewId: 'algo-stack-queue-theory-view',
  category: 'stack',
  description: '栈 (LIFO) 与队列 (FIFO) 的核心受控访问语义、操作复杂度及 C++/Java 底层实现机制',
  icon: '🥞',
  template,
  Visualizer: StackQueueTheoryVisualizer,
  difficulty: 1,
  levelOrder: 0,
  learningGoal: '透彻理解栈 (后入先出) 与队列 (先入先出) 的核心区别与容器适配器本质',
});
