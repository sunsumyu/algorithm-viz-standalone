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
import {
  type RPNStep,
  buildEvalRPNSteps,
} from './eval-rpn-step-compiler';
import { renderEvalRPNCanvas } from './eval-rpn-canvas-adapter';

export {
  type RPNStep,
  buildEvalRPNSteps,
  renderEvalRPNCanvas,
};

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
    renderEvalRPNCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'eval-rpn',
  aliases: ['evaluate-reverse-polish-notation', 'eval-rpn-150', 'leetcode-150', '150'],
  name: '逆波兰表达式求值',
  viewId: 'algo-eval-rpn-view',
  category: 'stack',
  hasDeductionTree: true,
  description: '遇操作数入栈，遇运算符弹出右操作数 b 与左操作数 a，计算 a op b 并压回栈中',
  icon: '🧮',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握后缀表达式在编译器与计算器中的天然无括号优先级求值算法，理解操作数栈的设计模式',
});
