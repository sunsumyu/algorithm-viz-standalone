/**
 * 用栈实现队列可视化器 — 4-Card 标准现代架构
 * LeetCode 232：输入栈 inStack 处理 push，输出栈 outStack 处理 pop/peek，outStack 为空时一次性倾倒转移
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  IMPLEMENT_QUEUE_USING_STACK_PROBLEM_HTML,
  IMPLEMENT_QUEUE_USING_STACK_ANALYSIS_HTML,
  IMPLEMENT_QUEUE_USING_STACK_CODE_LANGUAGES,
} from './implement-queue-using-stack-problem-content';
import template from './implement-queue-using-stack.html?raw';

export interface MQStep {
  inStack: number[];
  outStack: number[];
  outputs: Array<{ op: string; value: number | boolean }>;
  currentOp: string;
  transferHappened: boolean;
  action: 'init' | 'push' | 'transfer' | 'pop' | 'peek' | 'empty' | 'done';
  message: string;
  codeLine: number;
}

export function buildImplementQueueUsingStackSteps(rawOpsInput: string): MQStep[] {
  const steps: MQStep[] = [];
  const inStack: number[] = [];
  const outStack: number[] = [];
  const outputs: Array<{ op: string; value: number | boolean }> = [];

  const rawOps = rawOpsInput
    .split(/[,，;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  steps.push({
    inStack: [],
    outStack: [],
    outputs: [],
    currentOp: 'init',
    transferHappened: false,
    action: 'init',
    message: '初始化：inStack (输入栈) 与 outStack (输出栈) 均为空',
    codeLine: 4,
  });

  for (let i = 0; i < rawOps.length; i++) {
    const opStr = rawOps[i];
    const parts = opStr.split(/\s+/);
    const op = parts[0].toLowerCase();
    const val = parts.length > 1 ? parseInt(parts[1], 10) : NaN;

    if (op === 'push') {
      const num = isNaN(val) ? 1 : val;
      inStack.push(num);

      steps.push({
        inStack: [...inStack],
        outStack: [...outStack],
        outputs: [...outputs],
        currentOp: `push(${num})`,
        transferHappened: false,
        action: 'push',
        message: `📥 执行 push(${num})：直接压入 inStack 栈顶`,
        codeLine: 8,
      });
    } else if (op === 'pop') {
      let transfer = false;
      if (outStack.length === 0) {
        transfer = true;
        while (inStack.length > 0) {
          outStack.push(inStack.pop()!);
        }

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'dumpStackIn()',
          transferHappened: true,
          action: 'transfer',
          message: '🔀 outStack 为空！触发倾倒转移：将 inStack 全部元素依次弹出并压入 outStack，原顺序完全逆转为队头优先！',
          codeLine: 19,
        });
      }

      if (outStack.length > 0) {
        const popped = outStack.pop()!;
        outputs.push({ op: 'pop', value: popped });

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'pop()',
          transferHappened: transfer,
          action: 'pop',
          message: `📤 执行 pop()：从 outStack 弹出队头元素 ${popped}`,
          codeLine: 12,
        });
      } else {
        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'pop()',
          transferHappened: false,
          action: 'pop',
          message: '⚠️ 执行 pop()：队列为空，无法出队',
          codeLine: 11,
        });
      }
    } else if (op === 'peek') {
      let transfer = false;
      if (outStack.length === 0) {
        transfer = true;
        while (inStack.length > 0) {
          outStack.push(inStack.pop()!);
        }

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'dumpStackIn()',
          transferHappened: true,
          action: 'transfer',
          message: '🔀 outStack 为空！触发倾倒转移以便查看队头元素',
          codeLine: 19,
        });
      }

      if (outStack.length > 0) {
        const topVal = outStack[outStack.length - 1];
        outputs.push({ op: 'peek', value: topVal });

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'peek()',
          transferHappened: transfer,
          action: 'peek',
          message: `👀 执行 peek()：查看队头元素（outStack 栈顶）为 ${topVal}`,
          codeLine: 15,
        });
      }
    } else if (op === 'empty') {
      const isEmpty = inStack.length === 0 && outStack.length === 0;
      outputs.push({ op: 'empty', value: isEmpty });

      steps.push({
        inStack: [...inStack],
        outStack: [...outStack],
        outputs: [...outputs],
        currentOp: 'empty()',
        transferHappened: false,
        action: 'empty',
        message: `❓ 执行 empty()：inStack.empty && outStack.empty &rarr; ${isEmpty}`,
        codeLine: 17,
      });
    }
  }

  steps.push({
    inStack: [...inStack],
    outStack: [...outStack],
    outputs: [...outputs],
    currentOp: 'done',
    transferHappened: false,
    action: 'done',
    message: `🎉 全部操作序列执行完成！队列当前剩余 ${inStack.length + outStack.length} 个元素`,
    codeLine: 18,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class ImplementQueueUsingStackVisualizer extends StepVisualizer<MQStep> {
  protected codeLanguages = IMPLEMENT_QUEUE_USING_STACK_CODE_LANGUAGES;
  protected codeLines = IMPLEMENT_QUEUE_USING_STACK_CODE_LANGUAGES['java'];
  protected codePanelTitle = '用栈实现队列 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private stacksStatusContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#mq-sandbox-container');
    this.stacksStatusContainer = this.root.querySelector('#mq-stacks-status-container');
    this.decisionMonitorContainer = this.root.querySelector('#mq-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#mq-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 绑定运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

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

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.mq-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const strEl = this.root?.querySelector('#input-ops') as HTMLInputElement | null;
        if (strEl && btn.dataset.val) strEl.value = btn.dataset.val;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: IMPLEMENT_QUEUE_USING_STACK_PROBLEM_HTML,
      analysisHtml: IMPLEMENT_QUEUE_USING_STACK_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MQStep[] {
    const strEl = this.root?.querySelector('#input-ops') as HTMLInputElement | null;
    const rawOpsInput = strEl?.value ?? 'push 1, push 2, peek, pop, empty';
    return buildImplementQueueUsingStackSteps(rawOpsInput);
  }

  protected renderStep(step: MQStep): void {
    const inStack = step.inStack;
    const outStack = step.outStack;
    const outputs = step.outputs;
    const totalCount = inStack.length + outStack.length;

    // 1. 渲染双栈交互沙盘 (Card 1)
    if (this.sandboxContainer) {
      // inStack HTML (栈顶在右)
      const inStackHtml = inStack
        .map((num) => {
          return `
            <div style="padding: 3px 10px; border-radius: 6px; background: #eff6ff; border: 1.5px solid #bfdbfe; color: #1d4ed8; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              ${num}
            </div>
          `;
        })
        .join('');

      // outStack HTML (栈顶在左，即队头)
      const outStackHtml = [...outStack]
        .reverse()
        .map((num, idx) => {
          const isTop = idx === 0;
          return `
            <div style="padding: 3px 10px; border-radius: 6px; background: ${isTop ? '#ecfdf5' : '#f0fdf4'}; border: 1.5px solid ${isTop ? '#10b981' : '#bbf7d0'}; color: ${isTop ? '#047857' : '#15803d'}; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              ${num}${isTop ? ' (队头)' : ''}
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- inStack 容器 -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #2563eb;">
              <span>📥 输入栈 inStack (栈底 &rarr; 栈顶):</span>
              <span>容量: ${inStack.length}</span>
            </div>
            <div style="display: flex; gap: 5px; overflow-x: auto; min-height: 26px; align-items: center;">
              ${inStack.length > 0 ? inStackHtml : '<span style="font-size: 10px; color: #94a3b8;">空栈</span>'}
            </div>
          </div>

          <!-- 中间流向指示 -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 10.5px; font-weight: 700; color: ${step.transferHappened ? '#f59e0b' : '#94a3b8'};">
            <span>${step.transferHappened ? '⚡ 倾倒倒置流激活: inStack.pop() &rarr; outStack.push()' : '⬇️ outStack 为空时一次性转移全部元素 ⬇️'}</span>
          </div>

          <!-- outStack 容器 -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #059669;">
              <span>📤 输出栈 outStack (栈顶队头 &larr; 栈底):</span>
              <span>容量: ${outStack.length}</span>
            </div>
            <div style="display: flex; gap: 5px; overflow-x: auto; min-height: 26px; align-items: center;">
              ${outStack.length > 0 ? outStackHtml : '<span style="font-size: 10px; color: #94a3b8;">空栈</span>'}
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染栈状态 (Card 2 Left)
    if (this.stacksStatusContainer) {
      this.stacksStatusContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前执行指令:</span>
            <span style="font-family: monospace; font-weight:800; color: #2563eb; font-size: 13px;">
              ${step.currentOp}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>双栈总元素量:</span>
            <span style="font-family: monospace; font-weight:700; color: #059669;">
              ${totalCount} 个 (in: ${inStack.length}, out: ${outStack.length})
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染队列决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>操作类型:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${step.transferHappened ? '#fffbeb' : '#eff6ff'}; color: ${step.transferHappened ? '#d97706' : '#2563eb'}; border: 1px solid ${step.transferHappened ? '#fde68a' : '#bfdbfe'};">
              ${step.transferHappened ? '🔀 倾倒转移' : `⚡ ${step.action}`}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#2563eb; font-family:monospace;">push 入 inStack; pop/peek 从 outStack 出（空则先倒栈）</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染出队记录看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      const outputsStr = outputs.map((o) => `${o.op}: ${o.value}`).join(' | ');
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>输出历史: <strong style="color: #2563eb; font-family: monospace; font-size: 12px;">${outputsStr || '(暂无输出)'}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">已记录 ${outputs.length} 次</span>
          </div>
        </div>
      `;
    }

    const badgeSize = this.root?.querySelector('#badge-queue-size');
    if (badgeSize) {
      badgeSize.textContent = `队列元素: ${totalCount} 个`;
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
        let badgeText = '指令';

        if (st.action === 'push') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '入栈';
        } else if (st.action === 'transfer') {
          badgeColor = '#d97706';
          badgeBg = '#fffbeb';
          badgeText = '倒栈';
        } else if (st.action === 'pop') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '出队';
        } else if (st.action === 'peek') {
          badgeColor = '#7c3aed';
          badgeBg = '#f5f3ff';
          badgeText = '窥探';
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
  id: 'implement-queue-using-stack',
  name: '用栈实现队列',
  viewId: 'algo-implement-queue-using-stack-view',
  category: 'stack',
  description: '双栈架构：输入栈 inStack 处理 push，输出栈 outStack 为空时一次性倾倒反转实现 FIFO',
  icon: '🔄',
  template,
  Visualizer: ImplementQueueUsingStackVisualizer,
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握双栈组合出 FIFO 队列的精妙架构，理解均摊时间复杂度 O(1) 的倒栈触发准则',
});
