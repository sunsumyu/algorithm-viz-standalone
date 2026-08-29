/**
 * 逆波兰表达式求值可视化器 — 4-Card 标准现代架构
 * LeetCode 150：遇操作数入栈，遇运算符弹出右操作数 b 与左操作数 a，计算 a op b 并压回栈中
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  EVAL_RPN_PROBLEM_HTML,
  EVAL_RPN_ANALYSIS_HTML,
  EVAL_RPN_CODE_LANGUAGES,
} from './eval-rpn-problem-content';
import template from './eval-rpn.html?raw';

export interface RPNStep {
  tokens: string[];
  currentIndex: number;
  currentToken: string | null;
  stack: number[];
  operandA: number | null;
  operandB: number | null;
  operator: string | null;
  calcResult: number | null;
  action: 'init' | 'push_number' | 'compute' | 'done';
  message: string;
  codeLine: number;
}

export function buildEvalRPNSteps(rawTokens: string[]): RPNStep[] {
  const steps: RPNStep[] = [];
  const tokens = rawTokens.map((t) => t.trim()).filter(Boolean);
  const n = tokens.length;

  if (n === 0) {
    steps.push({
      tokens: [],
      currentIndex: -1,
      currentToken: null,
      stack: [],
      operandA: null,
      operandB: null,
      operator: null,
      calcResult: null,
      action: 'done',
      message: 'Token 列表为空，表达式值为 0',
      codeLine: 16,
    });
    return steps;
  }

  const stack: number[] = [];

  steps.push({
    tokens: [...tokens],
    currentIndex: -1,
    currentToken: null,
    stack: [],
    operandA: null,
    operandB: null,
    operator: null,
    calcResult: null,
    action: 'init',
    message: `初始化：共 ${n} 个 Token 待处理，使用操作数栈自左向右依次求值`,
    codeLine: 2,
  });

  for (let i = 0; i < n; i++) {
    const token = tokens[i];

    if (token === '+' || token === '-' || token === '*' || token === '/') {
      const b = stack.pop()!;
      const a = stack.pop()!;
      let res = 0;

      if (token === '+') {
        res = a + b;
      } else if (token === '-') {
        res = a - b;
      } else if (token === '*') {
        res = a * b;
      } else if (token === '/') {
        res = Math.trunc(a / b);
      }

      stack.push(res);

      steps.push({
        tokens: [...tokens],
        currentIndex: i,
        currentToken: token,
        stack: [...stack],
        operandA: a,
        operandB: b,
        operator: token,
        calcResult: res,
        action: 'compute',
        message: `⚡ 运算符 '${token}'：弹出右操作数 b=${b}，左操作数 a=${a} &rarr; 计算 ${a} ${token} ${b} = ${res}，结果压入栈顶`,
        codeLine: token === '+' ? 4 : token === '-' ? 7 : token === '*' ? 9 : 12,
      });
    } else {
      const num = parseInt(token, 10);
      stack.push(num);

      steps.push({
        tokens: [...tokens],
        currentIndex: i,
        currentToken: token,
        stack: [...stack],
        operandA: null,
        operandB: null,
        operator: null,
        calcResult: null,
        action: 'push_number',
        message: `📥 操作数 '${token}' (数值 ${num})，直接压入操作数栈`,
        codeLine: 14,
      });
    }
  }

  const finalVal = stack.length > 0 ? stack[stack.length - 1] : 0;

  steps.push({
    tokens: [...tokens],
    currentIndex: n - 1,
    currentToken: null,
    stack: [...stack],
    operandA: null,
    operandB: null,
    operator: null,
    calcResult: finalVal,
    action: 'done',
    message: `🎉 逆波兰表达式全部求值完成！最终计算结果为：${finalVal}`,
    codeLine: 16,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class EvalRPNVisualizer extends StepVisualizer<RPNStep> {
  protected codeLanguages = EVAL_RPN_CODE_LANGUAGES;
  protected codeLines = EVAL_RPN_CODE_LANGUAGES['java'];
  protected codePanelTitle = '逆波兰表达式求值 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private operandsContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#rpn-sandbox-container');
    this.operandsContainer = this.root.querySelector('#rpn-operands-container');
    this.decisionMonitorContainer = this.root.querySelector('#rpn-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#rpn-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.rpn-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const strEl = this.root?.querySelector('#input-tokens') as HTMLInputElement | null;
        if (strEl && btn.dataset.val) strEl.value = btn.dataset.val;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: EVAL_RPN_PROBLEM_HTML,
      analysisHtml: EVAL_RPN_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RPNStep[] {
    const strEl = this.root?.querySelector('#input-tokens') as HTMLInputElement | null;
    const rawTokens = (strEl?.value ?? '2,1,+,3,*').split(/[,，\s]+/);
    return buildEvalRPNSteps(rawTokens);
  }

  protected renderStep(step: RPNStep): void {
    const tokens = step.tokens;
    const stack = step.stack;
    const curIdx = step.currentIndex;
    const isDone = step.action === 'done';
    const isCompute = step.action === 'compute';

    // 1. 渲染 Token 流与求值栈沙盘 (Card 1)
    if (this.sandboxContainer) {
      const tokensHtml = tokens
        .map((tok, idx) => {
          const isCurrent = idx === curIdx && !isDone;
          const isProcessed = idx < curIdx || (isDone && idx <= curIdx);
          const isOp = tok === '+' || tok === '-' || tok === '*' || tok === '/';

          let bg = '#ffffff';
          let border = '#e2e8f0';
          let textColor = isOp ? '#ea580c' : '#0f172a';

          if (isCurrent) {
            if (isCompute) {
              bg = '#fff7ed';
              border = '#ea580c';
              textColor = '#c2410c';
            } else {
              bg = '#eff6ff';
              border = '#2563eb';
              textColor = '#2563eb';
            }
          } else if (isProcessed) {
            bg = '#f8fafc';
            border = '#cbd5e1';
            textColor = '#94a3b8';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="font-size: 8.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">
                [${idx}]
              </span>
              <div style="min-width: 36px; height: 36px; padding: 0 6px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 13.5px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                ${tok}
              </div>
            </div>
          `;
        })
        .join('');

      // 栈内展示 (从栈底到栈顶)
      const stackItemsHtml = stack
        .map((num) => {
          return `
            <div style="padding: 3px 12px; border-radius: 6px; background: #fff7ed; border: 1.5px solid #fed7aa; color: #c2410c; font-size: 13px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              ${num}
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- Token 序列 -->
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
            <span>🔤 逆波兰表达式 Tokens 流:</span>
            <span style="color: #ea580c;">栈大小: ${stack.length}</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
            ${tokensHtml}
          </div>

          <!-- 数值操作数栈 -->
          <div style="display: flex; align-items: center; gap: 8px; padding-top: 4px; border-top: 1px dashed #e2e8f0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 操作数数值栈 (栈底 &rarr; 栈顶):</span>
            <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
              ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染当前操作数 (Card 2 Left)
    if (this.operandsContainer) {
      const isPush = step.action === 'push_number';

      this.operandsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前 Token:</span>
            <span style="font-family: monospace; font-weight:800; color: #ea580c; font-size: 13.5px;">
              ${step.currentToken !== null ? `'${step.currentToken}'` : '（结束）'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>操作数 a & b:</span>
            <span style="font-family: monospace; font-weight:700; color: #0284c7; font-size: 12.5px;">
              ${step.operandA !== null ? `a=${step.operandA}, b=${step.operandB}` : isPush ? `入栈: ${step.currentToken}` : '无'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染算术求值决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isPush = step.action === 'push_number';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>求值决策:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isCompute ? '#fff7ed' : isPush ? '#eff6ff' : '#f8fafc'}; color: ${isCompute ? '#ea580c' : isPush ? '#2563eb' : '#64748b'}; border: 1px solid ${isCompute ? '#fed7aa' : isPush ? '#bfdbfe' : '#e2e8f0'};">
              ${isCompute ? `⚡ 执行运算 ${step.operandA} ${step.operator} ${step.operandB} = ${step.calcResult}` : isPush ? '📥 数值入栈' : '🔍 准备就绪'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#ea580c; font-family:monospace;">b = pop(), a = pop(), push(a op b)</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终求值结果看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      const topVal = stack.length > 0 ? stack[stack.length - 1] : 0;
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前栈顶值: <strong style="color: #ea580c; font-family: monospace; font-size: 13.5px;">${topVal}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">
              ${isDone ? `最终计算结果: ${topVal}` : `已处理 ${curIdx + 1} / ${tokens.length}`}
            </span>
          </div>
        </div>
      `;
    }

    const badgeStatus = this.root?.querySelector('#badge-eval-status');
    if (badgeStatus) {
      const topVal = stack.length > 0 ? stack[stack.length - 1] : 0;
      badgeStatus.textContent = isDone ? `最终答案: ${topVal}` : `当前计算值: ${topVal}`;
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.action === 'push_number') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '入栈';
        } else if (st.action === 'compute') {
          badgeColor = '#ea580c';
          badgeBg = '#fff7ed';
          badgeText = '求值';
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
  id: 'eval-rpn',
  name: '逆波兰表达式求值',
  viewId: 'algo-eval-rpn-view',
  category: 'stack',
  description: '后缀表达式无括号求值：遇操作数入栈，遇运算符弹出右数与左数计算并压回栈中',
  icon: '🧮',
  template,
  Visualizer: EvalRPNVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '理解逆波兰表达式与栈的天然契合性，掌握操作数先后出栈顺序对非交换律运算（减除法）的关键影响',
});
