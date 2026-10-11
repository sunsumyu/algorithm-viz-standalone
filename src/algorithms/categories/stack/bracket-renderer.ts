/**
 * 括号匹配可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 20：遇左括号压入对应右括号，遇右括号只需 O(1) 比对并弹出栈顶
 * 遵循 Zero-Subbox 规范，扁平纯净沙盘
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BRACKET_PROBLEM_HTML,
  BRACKET_ANALYSIS_HTML,
  BRACKET_CODE_LANGUAGES,
} from './bracket-problem-content';
import {
  type BracketStep,
  buildBracketSteps,
} from './bracket-step-compiler';
import { renderBracketCanvas } from './bracket-canvas-adapter';

export {
  type BracketStep,
  buildBracketSteps,
  renderBracketCanvas,
};

const { template, Visualizer } = createDeclarativeVisualizer<BracketStep>({
  id: 'bracket',
  name: '有效的括号',
  category: 'stack',
  icon: '🎯',
  badge: {
    mode: '遇左压右·栈匹配',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '🔤 字符串扫描与期望括号栈沙盘',
  card2Title: '🧭 括号匹配状态与决策监视器',
  card2Desc: '当前扫描字符、栈顶期望闭合符与匹配有效性判定',
  legend: [
    { label: '正在比对', color: '#10b981' },
    { label: '期望压栈', color: '#f59e0b' },
    { label: '失配报警', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-brackets',
      label: '括号序列',
      type: 'text',
      defaultValue: '()[]{}',
      width: '130px',
      placeholder: '如 ()[]{}',
    },
  ],
  presets: [
    { label: '简单成对', values: { 'input-brackets': '()[]{}' } },
    { label: '嵌套闭合', values: { 'input-brackets': '{[()]}' } },
    { label: '交叉失配', values: { 'input-brackets': '([)]' } },
    { label: '左多右少', values: { 'input-brackets': '((()' } },
  ],
  metrics: [
    { id: 'match-status', label: '有效性判定', color: '#10b981' },
    { id: 'matched-pairs', label: '已匹配对数', color: '#2563eb' },
    { id: 'stack-size', label: '栈内期望数', color: '#f59e0b' },
  ],
  codeLanguages: BRACKET_CODE_LANGUAGES,
  problemHtml: BRACKET_PROBLEM_HTML,
  analysisHtml: BRACKET_ANALYSIS_HTML,
  buildSteps: (inputs) => buildBracketSteps(inputs['input-brackets']),
  renderCanvas: (container, step) => {
    renderBracketCanvas(container, step);
  },
});

registerAlgorithm({
  id: 'bracket',
  name: '有效的括号',
  viewId: 'algo-bracket-view',
  category: 'stack',
  description: '遇左括号压入对应右括号，遇右括号只需 O(1) 比对并弹出栈顶元素',
  icon: '🎯',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握经典栈匹配思想与“遇左压右”简化比对逻辑的巧妙设计技巧',
});
