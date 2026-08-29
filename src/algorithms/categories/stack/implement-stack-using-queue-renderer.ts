/**
 * 用队列实现栈可视化器 — 4-Card 标准现代架构
 * LeetCode 225：单队列循环旋转法，push 后将前面 size - 1 个元素出队再入队重新排到队尾，保持队头始终为栈顶
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  IMPLEMENT_STACK_USING_QUEUE_PROBLEM_HTML,
  IMPLEMENT_STACK_USING_QUEUE_ANALYSIS_HTML,
  IMPLEMENT_STACK_USING_QUEUE_CODE_LANGUAGES,
} from './implement-stack-using-queue-problem-content';
import template from './implement-stack-using-queue.html?raw';

export interface MSStep {
  queue: number[];
  outputs: Array<{ op: string; value: number | boolean }>;
  currentOp: string;
  rotatingItem: number | null;
  rotateStep: number;
  totalRotate: number;
  action: 'init' | 'push_offer' | 'rotate_step' | 'pop' | 'top' | 'empty' | 'done';
  message: string;
  codeLine: number;
}

export function buildImplementStackUsingQueueSteps(rawOpsInput: string): MSStep[] {
  const steps: MSStep[] = [];
  const queue: number[] = [];
  const outputs: Array<{ op: string; value: number | boolean }> = [];

  const rawOps = rawOpsInput
    .split(/[,，;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  steps.push({
    queue: [],
    outputs: [],
    currentOp: 'init',
    rotatingItem: null,
    rotateStep: 0,
    totalRotate: 0,
    action: 'init',
    message: '初始化：单队列为空，采用入队后循环旋转 (size - 1) 次策略',
    codeLine: 4,
  });

  for (let i = 0; i < rawOps.length; i++) {
    const opStr = rawOps[i];
    const parts = opStr.split(/\s+/);
    const op = parts[0].toLowerCase();
    const val = parts.length > 1 ? parseInt(parts[1], 10) : NaN;

    if (op === 'push') {
      const num = isNaN(val) ? 1 : val;
      const prevSize = queue.length;

      queue.push(num);

      steps.push({
        queue: [...queue],
        outputs: [...outputs],
        currentOp: `push(${num})`,
        rotatingItem: null,
        rotateStep: 0,
        totalRotate: prevSize,
        action: 'push_offer',
        message: `📥 执行 push(${num})：首先进入队尾，准备将前面的 ${prevSize} 个元素循环旋转排到其后`,
        codeLine: 7,
      });

      // 旋转前面 prevSize 个元素
      for (let r = 0; r < prevSize; r++) {
        const rot = queue.shift()!;
        queue.push(rot);

        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: `rotate(${r + 1}/${prevSize})`,
          rotatingItem: rot,
          rotateStep: r + 1,
          totalRotate: prevSize,
          action: 'rotate_step',
          message: `🔄 旋转中 (${r + 1}/${prevSize})：将队头元素 ${rot} 出队并重新推到队尾，使最新元素 ${num} 逐步移向队头`,
          codeLine: 10,
        });
      }
    } else if (op === 'pop') {
      if (queue.length > 0) {
        const popped = queue.shift()!;
        outputs.push({ op: 'pop', value: popped });

        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'pop()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'pop',
          message: `📤 执行 pop()：队头即为栈顶，直接 O(1) 出队元素 ${popped}`,
          codeLine: 14,
        });
      } else {
        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'pop()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'pop',
          message: '⚠️ 执行 pop()：栈为空，无法出栈',
          codeLine: 13,
        });
      }
    } else if (op === 'top') {
      if (queue.length > 0) {
        const topVal = queue[0];
        outputs.push({ op: 'top', value: topVal });

        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'top()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'top',
          message: `👀 执行 top()：查看队头元素为 ${topVal}（即栈顶）`,
          codeLine: 17,
        });
      }
    } else if (op === 'empty') {
      const isEmpty = queue.length === 0;
      outputs.push({ op: 'empty', value: isEmpty });

      steps.push({
        queue: [...queue],
        outputs: [...outputs],
        currentOp: 'empty()',
        rotatingItem: null,
        rotateStep: 0,
        totalRotate: 0,
        action: 'empty',
        message: `❓ 执行 empty()：queue.isEmpty() &rarr; ${isEmpty}`,
        codeLine: 20,
      });
    }
  }

  steps.push({
    queue: [...queue],
    outputs: [...outputs],
    currentOp: 'done',
    rotatingItem: null,
    rotateStep: 0,
    totalRotate: 0,
    action: 'done',
    message: `🎉 全部操作序列执行完成！栈内当前剩余 ${queue.length} 个元素`,
    codeLine: 21,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class ImplementStackUsingQueueVisualizer extends StepVisualizer<MSStep> {
  protected codeLanguages = IMPLEMENT_STACK_USING_QUEUE_CODE_LANGUAGES;
  protected codeLines = IMPLEMENT_STACK_USING_QUEUE_CODE_LANGUAGES['java'];
  protected codePanelTitle = '用队列实现栈 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private queueStatusContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#ms-sandbox-container');
    this.queueStatusContainer = this.root.querySelector('#ms-queue-status-container');
    this.decisionMonitorContainer = this.root.querySelector('#ms-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#ms-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.ms-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const strEl = this.root?.querySelector('#input-ops') as HTMLInputElement | null;
        if (strEl && btn.dataset.val) strEl.value = btn.dataset.val;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: IMPLEMENT_STACK_USING_QUEUE_PROBLEM_HTML,
      analysisHtml: IMPLEMENT_STACK_USING_QUEUE_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MSStep[] {
    const strEl = this.root?.querySelector('#input-ops') as HTMLInputElement | null;
    const rawOpsInput = strEl?.value ?? 'push 1, push 2, top, pop, empty';
    return buildImplementStackUsingQueueSteps(rawOpsInput);
  }

  protected renderStep(step: MSStep): void {
    const queue = step.queue;
    const outputs = step.outputs;

    // 1. 渲染队列旋转沙盘 (Card 1)
    if (this.sandboxContainer) {
      const queueHtml = queue
        .map((num, idx) => {
          const isTop = idx === 0;
          const isRear = idx === queue.length - 1;
          const isRotating = num === step.rotatingItem && isRear;

          let bg = '#ffffff';
          let border = '#e2e8f0';
          let textColor = '#0f172a';

          if (isTop) {
            bg = '#f0fdfa';
            border = '#0d9488';
            textColor = '#0f766e';
          } else if (isRotating) {
            bg = '#fffbeb';
            border = '#f59e0b';
            textColor = '#d97706';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="font-size: 8.5px; color: ${isTop ? '#0d9488' : '#94a3b8'}; font-weight: 700;">
                ${isTop ? '🥇栈顶' : isRear ? '队尾' : `[${idx}]`}
              </span>
              <div style="min-width: 38px; height: 38px; padding: 0 8px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                ${num}
              </div>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- 队列容器 -->
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
            <span>🥞 单队列存储流 (队头栈顶 &rarr; 队尾):</span>
            <span style="color: #0d9488;">容量: ${queue.length}</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0; min-height: 52px; align-items: center;">
            ${queue.length > 0 ? queueHtml : '<span style="font-size: 10.5px; color: #94a3b8;">队列为空（空栈）</span>'}
          </div>

          <!-- 循环旋转提示 -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 10.5px; font-weight: 700; color: ${step.rotatingItem !== null ? '#f59e0b' : '#64748b'}; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
            <span>${step.rotatingItem !== null ? `🔄 正在旋转元素 ${step.rotatingItem} (${step.rotateStep} / ${step.totalRotate})` : '✓ 队头元素始终等于栈顶元素 (O(1) Pop & Top)'}</span>
          </div>
        </div>
      `;
    }

    // 2. 渲染队列与栈顶状态 (Card 2 Left)
    if (this.queueStatusContainer) {
      this.queueStatusContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前指令:</span>
            <span style="font-family: monospace; font-weight:800; color: #0d9488; font-size: 13px;">
              ${step.currentOp}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>当前栈顶 (队头):</span>
            <span style="font-family: monospace; font-weight:700; color: #0f766e;">
              ${queue.length > 0 ? queue[0] : '（栈空）'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染出入栈决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>操作类型:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${step.rotatingItem !== null ? '#fffbeb' : '#f0fdfa'}; color: ${step.rotatingItem !== null ? '#d97706' : '#0d9488'}; border: 1px solid ${step.rotatingItem !== null ? '#fde68a' : '#99f6e4'};">
              ${step.rotatingItem !== null ? '🔄 循环旋转前驱' : `⚡ ${step.action}`}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#0d9488; font-family:monospace;">push(x) 后循环出队再入队 size-1 次，使 x 到达队头</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染出栈记录看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      const outputsStr = outputs.map((o) => `${o.op}: ${o.value}`).join(' | ');
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>输出历史: <strong style="color: #0d9488; font-family: monospace; font-size: 12px;">${outputsStr || '(暂无输出)'}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">已记录 ${outputs.length} 次</span>
          </div>
        </div>
      `;
    }

    const badgeSize = this.root?.querySelector('#badge-stack-size');
    if (badgeSize) {
      badgeSize.textContent = `栈内元素: ${queue.length} 个`;
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '指令';

        if (st.action === 'push_offer') {
          badgeColor = '#0d9488';
          badgeBg = '#f0fdfa';
          badgeText = '入队';
        } else if (st.action === 'rotate_step') {
          badgeColor = '#d97706';
          badgeBg = '#fffbeb';
          badgeText = '旋转';
        } else if (st.action === 'pop') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '出栈';
        } else if (st.action === 'top') {
          badgeColor = '#7c3aed';
          badgeBg = '#f5f3ff';
          badgeText = '栈顶';
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
  id: 'implement-stack-using-queue',
  name: '用队列实现栈',
  viewId: 'algo-implement-stack-using-queue-view',
  category: 'stack',
  description: '单队列循环旋转法：push 入队后将前面 size - 1 个元素出队再入队，保持队头为栈顶',
  icon: '🥞',
  template,
  Visualizer: ImplementStackUsingQueueVisualizer,
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握单队列通过自环旋转实现 LIFO 栈的精简思想，实现真正的 O(1) Pop 与 Top 查询',
});
