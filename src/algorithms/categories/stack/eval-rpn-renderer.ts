/**
 * 逆波兰表达式求值可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 150：遇操作数入栈，遇运算符弹出右操作数 b 与左操作数 a，计算 a op b 并压回栈中
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  EVAL_RPN_PROBLEM_HTML,
  EVAL_RPN_ANALYSIS_HTML,
  EVAL_RPN_CODE_LANGUAGES,
} from './eval-rpn-problem-content';

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
        message: `⚡ 遇运算符 '${token}'：弹出右操作数 ${b} 与左操作数 ${a}，计算 ${a} ${token} ${b} = ${res}，将 ${res} 压入栈顶`,
        codeLine: 9,
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
        message: `📥 遇数字操作数 ${num}：直接压入数值栈顶。当前栈: [${stack.join(', ')}]`,
        codeLine: 14,
      });
    }
  }

  const finalVal = stack.length > 0 ? stack[0] : 0;
  steps.push({
    tokens: [...tokens],
    currentIndex: n,
    currentToken: null,
    stack: [...stack],
    operandA: null,
    operandB: null,
    operator: null,
    calcResult: finalVal,
    action: 'done',
    message: `🎉 逆波兰表达式求值完毕！栈顶剩余唯一最终结果为: ${finalVal}`,
    codeLine: 16,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<RPNStep>({
  id: 'eval-rpn',
  name: '逆波兰表达式求值',
  category: 'stack',
  icon: '🧮',
  badge: {
    mode: '后缀表达式·操作数栈',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '🔤 Token 扫描与操作数栈沙盘',
  card2Title: '🧭 算术求值与栈顶状态监视器',
  card2Desc: '当前 Token、操作数 a/b 与计算结果',
  legend: [
    { label: '数字入栈', color: '#2563eb' },
    { label: '算术求值', color: '#ea580c' },
    { label: '已处理 Token', color: '#94a3b8' },
  ],
  inputs: [
    {
      id: 'input-tokens',
      label: 'RPN 序列',
      type: 'text',
      defaultValue: '2, 1, +, 3, *',
      width: '140px',
      placeholder: '以逗号或空格分隔',
    },
  ],
  presets: [
    { label: '标准乘加', values: { 'input-tokens': '2, 1, +, 3, *' } },
    { label: '带除法表达式', values: { 'input-tokens': '4, 13, 5, /, +' } },
    { label: '复杂四则运算', values: { 'input-tokens': '10, 6, 9, 3, +, -11, *, /, *, 17, +, 5, +' } },
  ],
  metrics: [
    { id: 'top-val', label: '当前栈顶值', color: '#ea580c' },
    { id: 'processed-count', label: '已处理 Token', color: '#2563eb' },
    { id: 'stack-size', label: '操作数栈深', color: '#059669' },
  ],
  codeLanguages: EVAL_RPN_CODE_LANGUAGES,
  problemHtml: EVAL_RPN_PROBLEM_HTML,
  analysisHtml: EVAL_RPN_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const raw = inputs['input-tokens'] || '2, 1, +, 3, *';
    const tokens = raw.split(/[,，\s]+/).filter(Boolean);
    return buildEvalRPNSteps(tokens);
  },
  renderCanvas: (container, step) => {
    const tokens = step.tokens;
    const stack = step.stack;
    const curIdx = step.currentIndex;
    const isDone = step.action === 'done';
    const isCompute = step.action === 'compute';

    // Token 序列展示
    const tokensHtml = tokens
      .map((tok, idx) => {
        const isCurrent = idx === curIdx && !isDone;
        const isProcessed = idx < curIdx || (isDone && idx <= curIdx);
        let bg = '#ffffff';
        let border = '#e2e8f0';
        let textColor = '#0f172a';

        if (isCurrent) {
          bg = isCompute ? '#fff7ed' : '#eff6ff';
          border = isCompute ? '#ea580c' : '#2563eb';
          textColor = isCompute ? '#c2410c' : '#1d4ed8';
        } else if (isProcessed) {
          bg = '#f8fafc';
          border = '#cbd5e1';
          textColor = '#64748b';
        }

        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <span style="font-size: 8.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">[${idx}]</span>
            <div style="width: 32px; height: 32px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              ${tok}
            </div>
          </div>
        `;
      })
      .join('');

    // 操作数栈展示 (扁平直排)
    const stackItemsHtml =
      stack.length === 0
        ? '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">栈空</span>'
        : stack
            .map(
              (num) => `
              <div style="padding: 2px 8px; border-radius: 4px; background: #ffffff; border: 1.5px solid #ea580c; color: #c2410c; font-size: 12px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
                ${num}
              </div>
            `
            )
            .join('<span style="color: #cbd5e1; font-size: 10px; margin: 0 2px;">→</span>');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: space-around; gap: 8px; box-sizing: border-box;">
        <!-- Token 序列 -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>🔤 逆波兰表达式 Tokens 流 (自左至右):</span>
            <span style="color: #ea580c;">栈大小: ${stack.length}</span>
          </div>
          <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0;">
            ${tokensHtml}
          </div>
        </div>

        <div style="border-top: 1px dashed #e2e8f0; margin: 2px 0;"></div>

        <!-- 数值操作数栈 (扁平直排) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #475569;">🥞 数值操作数栈 (栈底 → 栈顶):</span>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #ea580c;">栈深: ${stack.length}</span>
          </div>
          <div style="display: flex; gap: 4px; align-items: center; min-height: 28px; flex-wrap: wrap;">
            ${stackItemsHtml}
          </div>
        </div>
      </div>
    `;

    // 更新指标卡片
    const root = container.closest('#algo-eval-rpn-view');
    if (root) {
      const topVal = stack.length > 0 ? stack[stack.length - 1] : 0;
      const topValEl = root.querySelector('#metric-top-val');
      const countEl = root.querySelector('#metric-processed-count');
      const stackSizeEl = root.querySelector('#metric-stack-size');

      if (topValEl) topValEl.textContent = `${topVal}`;
      if (countEl) countEl.textContent = `${Math.min(curIdx + 1, tokens.length)} / ${tokens.length}`;
      if (stackSizeEl) stackSizeEl.textContent = `${step.stack.length}`;

      // 在 Card 2 中展示当前运算决策
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155; padding: 4px 0;">
            <div style="display: flex; justify-content: space-between;">
              <span>当前 Token:</span>
              <strong style="font-family: monospace; color: #ea580c; font-size: 12px;">${step.currentToken !== null ? `'${step.currentToken}'` : '（结束）'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>操作数 a & b:</span>
              <strong style="font-family: monospace; color: #0284c7; font-size: 12px;">${step.operandA !== null ? `a=${step.operandA}, b=${step.operandB}` : '无'}</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'eval-rpn',
  name: '逆波兰表达式求值',
  viewId: 'algo-eval-rpn-view',
  category: 'stack',
  description: '遇操作数入栈，遇运算符弹出右操作数 b 与左操作数 a，计算 a op b 并压回栈中',
  icon: '🧮',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握后缀表达式在编译器与计算器中的天然无括号优先级求值算法，理解操作数栈的设计模式',
});
