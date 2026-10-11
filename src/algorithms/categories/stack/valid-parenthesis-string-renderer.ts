/**
 * 有效的括号字符串 (Valid Parenthesis String)
 * LeetCode 678 (Medium / 大厂高频贪心与双端界定)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ValidStringStep,
  VALID_PARENTHESIS_STRING_CODES,
  buildValidParenthesisStringSteps,
} from './valid-parenthesis-string-step-compiler';
import { renderValidStringCanvas } from './valid-parenthesis-string-canvas-adapter';

export type { ValidStringStep };
export { VALID_PARENTHESIS_STRING_CODES, buildValidParenthesisStringSteps, renderValidStringCanvas };

registerDeclarativeAlgorithm<ValidStringStep>({
  id: 'valid-parenthesis-string',
  name: '有效的括号字符串',
  category: 'stack',
  difficulty: 2,
  learningGoal: 'LeetCode 678: 带通配符 * 的有效括号判定。利用贪心区间维护未匹配左括号范围 [minOpen, maxOpen]，在 O(N) 极速完成判定。',
  codeLanguages: VALID_PARENTHESIS_STRING_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.s as string | undefined;
    const s = typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : '(*))';
    return buildValidParenthesisStringSteps(s);
  },
  renderCanvas: (container: HTMLElement, step: ValidStringStep) => {
    container.innerHTML = renderValidStringCanvas(step);
  },
  inputs: [
    {
      id: 's',
      label: '括号与通配符序列',
      type: 'text',
      defaultValue: '(*))',
      placeholder: '例如: (*)) 或 (*)',
    },
  ],
});
