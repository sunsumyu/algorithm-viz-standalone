/**
 * Class 102: AC 自动机多模式串匹配 (Aho-Corasick)
 * 洛谷 P3808 / P3796
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { AC_AUTOMATON_CODES } from './string-100-105-stage-codes';
import {
  ACTrieNode,
  ACAutomatonStep,
  buildACTrie,
  buildACAutomatonSteps,
} from './ac-automaton-step-compiler';
import { renderACAutomatonCanvas } from './ac-automaton-canvas-adapter';

export type { ACTrieNode, ACAutomatonStep };
export { buildACTrie, buildACAutomatonSteps, renderACAutomatonCanvas };

export const acAutomatonVisualizer = registerDeclarativeAlgorithm<ACAutomatonStep>({
  id: 'ac-automaton',
  name: 'AC 自动机多模式串匹配 (Class 102)',
  category: 'string',
  icon: '🤖',
  difficulty: 3,
  levelOrder: 102,
  aliases: ['class102-code01', 'ac-automaton', 'aho-corasick', 'luogu-p3808'],
  learningGoal: '深入理解 Trie 前缀树与 KMP fail 失败指针的融合，掌握单次线性扫描并发匹配多个模式串的高效原理',
  problemHtml: STRING_100_105_PROBLEMS.acAutomaton.html,
  analysisHtml: STRING_100_105_PROBLEMS.acAutomaton.html,
  inputs: [
    {
      id: 'text',
      label: '主文本串 (text)',
      type: 'text',
      defaultValue: 'abcefabcd',
      placeholder: '请输入文本串',
    },
    {
      id: 'patterns',
      label: '模式串集合 (逗号分隔)',
      type: 'text',
      defaultValue: 'ab,bc,abcd,ef',
      placeholder: '请输入逗号分隔的模式串',
    },
  ],
  codeLanguages: AC_AUTOMATON_CODES,
  generateSteps: (input) => {
    const text = String(input.text || 'abcefabcd');
    const patStr = String(input.patterns || 'ab,bc,abcd,ef');
    const patterns = patStr.split(',').map(s => s.trim()).filter(Boolean);
    return buildACAutomatonSteps(text, patterns);
  },
  renderCanvas: (container, step) => {
    renderACAutomatonCanvas(container, step);
  },
});
