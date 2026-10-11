import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  REMOVE_K_DIGITS_CODES,
} from './stack-053-stage-codes';
import {
  REMOVE_K_DIGITS_PROBLEM_HTML,
  REMOVE_K_DIGITS_EXPLANATION,
} from './stack-053-problem-content';
import { type Step053 } from './stack-053-shared';
import {
  parseRemoveKDigitsInput,
  buildRemoveKDigits053Steps,
} from './remove-k-digits-053-step-compiler';

export {
  parseRemoveKDigitsInput,
  buildRemoveKDigits053Steps,
};

export const removeKDigits053Visualizer = registerDeclarativeAlgorithm<Step053>({
  id: 'remove-k-digits-053',
  name: '移掉 K 位数字 (Class 053 Code03)',
  category: 'monotonic-stack',
  difficulty: 'medium',
  aliases: ['remove-k-digits-402', '402', '移掉K位数字', 'class053-code03'],
  learningGoal:
    '掌握高位贪心结合单调递增栈的剔除算法，深刻理解高位逆序削减与前导零剥离精髓。',
  problemContent: {
    title: '移掉 K 位数字',
    source: 'LeetCode 402 / 算法通关课 Class 053 Code03',
    description: '移除非负整数字符串中的 k 位数字使剩余最小。',
    problemHtml: REMOVE_K_DIGITS_PROBLEM_HTML,
    analysisHtml: REMOVE_K_DIGITS_EXPLANATION,
  },
  codeLanguages: REMOVE_K_DIGITS_CODES,
  inputs: [
    {
      id: 'input',
      label: '输入数字与k (格式: num, k)',
      type: 'text',
      defaultValue: '1432219, 3',
      placeholder: '例如: 1432219, 3',
    },
  ],
  presets: [
    { label: '示例 1: 典型高位剔除 (1432219, 3)', values: { input: '1432219, 3' } },
    { label: '示例 2: 前导零剥离 (10200, 1)', values: { input: '10200, 1' } },
    { label: '示例 3: 单调递增尾部削减 (123456, 2)', values: { input: '123456, 2' } },
    { label: '示例 4: 全部删完 (10, 2)', values: { input: '10, 2' } },
  ],
  generateSteps: (inputs) => {
    const raw = typeof inputs?.input === 'string' ? inputs.input : '1432219, 3';
    return buildRemoveKDigits053Steps(raw);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = step.sandboxes[0]?.customHtml ?? '';
  },
});
