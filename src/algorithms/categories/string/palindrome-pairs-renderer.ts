/**
 * 大厂高频真题: 回文对 (Palindrome Pairs)
 * Renderer (Thin Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  PalindromePairsStep,
  PALINDROME_PAIRS_CODES,
  buildPalindromePairsSteps,
} from './palindrome-pairs-step-compiler';
import { renderPalindromePairsCanvas } from './palindrome-pairs-canvas-adapter';

export type { PalindromePairsStep };
export { PALINDROME_PAIRS_CODES, buildPalindromePairsSteps, renderPalindromePairsCanvas };

export const palindromePairsVisualizer = registerDeclarativeAlgorithm({
  id: 'palindrome-pairs',
  name: '大厂高频真题: 回文对 (Palindrome Pairs)',
  category: 'string',
  learningGoal: '掌握前缀后缀回文分解与哈希对偶检索技巧，将 O(N² * L) 暴力判定优化至 O(N * L²)',
  inputs: [
    {
      id: 'words',
      label: '单词数组',
      type: 'text',
      defaultValue: 'abcd, dcba, lls, s, sssll',
      placeholder: '逗号分隔单词，如 abcd, dcba, lls, s, sssll'
    }
  ],
  codeLanguages: PALINDROME_PAIRS_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.words || 'abcd, dcba, lls, s, sssll');
    const words = raw.split(/[,，\s]+/).map(s => s.trim()).filter(Boolean);
    return buildPalindromePairsSteps(words.length ? words : ['abcd', 'dcba', 'lls', 's', 'sssll']);
  },
  renderCanvas: (container, step) => {
    renderPalindromePairsCanvas(container, step as PalindromePairsStep);
  }
});
