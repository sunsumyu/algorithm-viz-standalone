/**
 * 替换后的最长重复字符 (Longest Repeating Character Replacement)
 * LeetCode 424 (Medium / 大厂高频滑动窗口经典)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  CharacterReplacementStep,
  CHARACTER_REPLACEMENT_CODES,
  CHARACTER_REPLACEMENT_CODE_LINES,
  buildCharacterReplacementSteps,
} from './longest-repeating-character-replacement-step-compiler';
import { renderCharacterReplacementCanvas } from './longest-repeating-character-replacement-canvas-adapter';

export type { CharacterReplacementStep };
export {
  CHARACTER_REPLACEMENT_CODES,
  CHARACTER_REPLACEMENT_CODE_LINES,
  buildCharacterReplacementSteps,
  renderCharacterReplacementCanvas,
};

registerDeclarativeAlgorithm({
  id: 'longest-repeating-character-replacement',
  name: '替换后的最长重复字符',
  category: 'string',
  difficulty: 2,
  learningGoal: 'LeetCode 424: 至多替换 k 次后的最长重复字符子串长度。利用滑动窗口单调不减性质，在 O(N) 线性时间内求得极值。',
  codeLanguages: CHARACTER_REPLACEMENT_CODES,
  generateSteps: (inputs) => {
    const rawS = inputs?.s as string | undefined;
    const rawK = Number(inputs?.k ?? 1);
    const s = typeof rawS === 'string' && rawS.trim().length > 0 ? rawS.trim().toUpperCase() : 'AABABBA';
    const k = isNaN(rawK) || rawK < 0 ? 1 : rawK;
    return buildCharacterReplacementSteps(s, k);
  },
  renderCanvas: (container, step) => {
    renderCharacterReplacementCanvas(container, step);
  },
  inputs: [
    {
      id: 's',
      label: '大写字母字符串',
      type: 'text',
      defaultValue: 'AABABBA',
      placeholder: '例如: AABABBA',
    },
    {
      id: 'k',
      label: '最大替换次数 k',
      type: 'number',
      defaultValue: 1,
      placeholder: '允许替换次数',
    },
  ],
});
