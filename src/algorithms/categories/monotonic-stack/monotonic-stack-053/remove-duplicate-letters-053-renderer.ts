import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  REMOVE_DUP_LETTERS_CODES,
} from './stack-053-stage-codes';
import {
  REMOVE_DUP_LETTERS_PROBLEM_HTML,
  REMOVE_DUP_LETTERS_EXPLANATION,
} from './stack-053-problem-content';
import { type Step053 } from './stack-053-shared';
import {
  buildRemoveDuplicateLettersSteps,
} from './remove-duplicate-letters-053-step-compiler';

export {
  buildRemoveDuplicateLettersSteps,
};

export const removeDuplicateLetters053Visualizer = registerDeclarativeAlgorithm<Step053>({
  id: 'remove-duplicate-letters-053',
  name: '去除重复字母 (Class 053 Code04)',
  category: 'monotonic-stack',
  difficulty: 'medium',
  aliases: ['remove-duplicate-letters', '316', '1081', '去除重复字母', 'class053-code04'],
  learningGoal:
    '掌握字符频次表与单调栈联动设计，理解栈内布尔去重集合与字典序贪心让位的双重约束。',
  problemContent: {
    title: '去除重复字母',
    source: 'LeetCode 316 / 1081 / 算法通关课 Class 053 Code04',
    description: '保证返回结果的字典序最小，且每个字符只出现一次。',
    problemHtml: REMOVE_DUP_LETTERS_PROBLEM_HTML,
    analysisHtml: REMOVE_DUP_LETTERS_EXPLANATION,
  },
  codeLanguages: REMOVE_DUP_LETTERS_CODES,
  inputs: [
    {
      id: 'text',
      label: '输入小写英文字符串',
      type: 'text',
      defaultValue: 'cbacdcbc',
      placeholder: '例如: cbacdcbc',
    },
  ],
  presets: [
    { label: '示例 1: 经典交替 (cbacdcbc ➔ acdb)', values: { text: 'cbacdcbc' } },
    { label: '示例 2: 经典回环 (bcabc ➔ abc)', values: { text: 'bcabc' } },
    { label: '示例 3: 单调升序无重 (abcde ➔ abcde)', values: { text: 'abcde' } },
    { label: '示例 4: 逆序重复 (edcbaedcba ➔ edcba)', values: { text: 'edcbaedcba' } },
  ],
  generateSteps: (inputs) => {
    const raw = typeof inputs?.text === 'string' ? inputs.text : 'cbacdcbc';
    return buildRemoveDuplicateLettersSteps(raw);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = step.sandboxes[0]?.customHtml ?? '';
  },
});
