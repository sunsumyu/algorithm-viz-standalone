/**
 * 找到字符串中所有字母异位词 (Find All Anagrams in a String)
 * LeetCode 438 (Medium / 大厂高频定长滑动窗口与哈希差值)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  AnagramsStep,
  FIND_ALL_ANAGRAMS_CODES,
  FIND_ALL_ANAGRAMS_CODE_LINES,
  buildFindAllAnagramsSteps,
} from './find-all-anagrams-in-a-string-step-compiler';
import { renderFindAllAnagramsCanvas } from './find-all-anagrams-in-a-string-canvas-adapter';

export type { AnagramsStep };
export {
  FIND_ALL_ANAGRAMS_CODES,
  FIND_ALL_ANAGRAMS_CODE_LINES,
  buildFindAllAnagramsSteps,
  renderFindAllAnagramsCanvas,
};

registerDeclarativeAlgorithm({
  id: 'find-all-anagrams-in-a-string',
  name: '找到字符串中所有字母异位词',
  category: 'string',
  difficulty: 2,
  learningGoal: 'LeetCode 438: 寻找模式串的所有异位词子串起始位置。基于固定长度滑动窗口与 26 字母频次数组差值，O(N) 线性收集所有匹配点。',
  codeLanguages: FIND_ALL_ANAGRAMS_CODES,
  generateSteps: (inputs) => {
    const rawS = inputs?.s as string | undefined;
    const rawP = inputs?.p as string | undefined;
    const s = typeof rawS === 'string' && rawS.trim().length > 0 ? rawS.trim() : 'cbaebabacd';
    const p = typeof rawP === 'string' && rawP.trim().length > 0 ? rawP.trim() : 'abc';
    return buildFindAllAnagramsSteps(s, p);
  },
  renderCanvas: (container: HTMLElement, step: AnagramsStep) => {
    renderFindAllAnagramsCanvas(container, step);
  },
  inputs: [
    {
      id: 's',
      label: '输入源字符串',
      type: 'text',
      defaultValue: 'cbaebabacd',
      placeholder: '例如: cbaebabacd',
    },
    {
      id: 'p',
      label: '目标异位模式串',
      type: 'text',
      defaultValue: 'abc',
      placeholder: '例如: abc',
    },
  ],
});
