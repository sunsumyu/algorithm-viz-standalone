/**
 * 爱吃香蕉的珂珂 (Koko Eating Bananas)
 * LeetCode 875 (Medium / 左程云通关课 Class 056 二分答案法母题)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type KokoStep,
  KOKO_BANANAS_CODES,
  KOKO_CODE_LINES,
  buildKokoSteps,
} from './koko-eating-bananas-step-compiler';
import { renderKokoCanvas } from './koko-eating-bananas-canvas-adapter';

export {
  type KokoStep,
  KOKO_BANANAS_CODES,
  KOKO_CODE_LINES,
  buildKokoSteps,
  renderKokoCanvas,
};

registerDeclarativeAlgorithm({
  id: 'koko-eating-bananas',
  name: '爱吃香蕉的珂珂',
  category: 'search',
  difficulty: 2,
  learningGoal: 'LeetCode 875: 二分答案法母题。利用耗时关于速度的单调不增性质，在 O(N log(max)) 时间内求解最小可行吃速。',
  codeLanguages: KOKO_BANANAS_CODES,
  generateSteps: (inputs) => {
    const rawPiles = inputs?.piles as string | number[] | undefined;
    const rawH = Number(inputs?.h ?? 8);
    let piles = [3, 6, 7, 11];
    if (typeof rawPiles === 'string') {
      try {
        piles = rawPiles.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        piles = [3, 6, 7, 11];
      }
    } else if (Array.isArray(rawPiles) && rawPiles.length > 0) {
      piles = rawPiles.map(Number);
    }
    return buildKokoSteps(piles, isNaN(rawH) ? 8 : rawH);
  },
  renderCanvas: (container: HTMLElement, step: KokoStep) => {
    container.innerHTML = renderKokoCanvas(step);
  },
  inputs: [
    {
      id: 'piles',
      label: '香蕉堆数组',
      type: 'text',
      defaultValue: '3, 6, 7, 11',
      placeholder: '用逗号分隔的每堆香蕉数',
    },
    {
      id: 'h',
      label: '允许最大耗时 (小时)',
      type: 'number',
      defaultValue: 8,
      placeholder: '最大小时数',
    },
  ],
});
