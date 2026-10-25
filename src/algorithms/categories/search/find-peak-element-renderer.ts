/**
 * 寻找峰值 (Find Peak Element)
 * LeetCode 162 (Medium / 左程云通关课 Class 005 进阶)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type PeakElementStep,
  PEAK_ELEMENT_CODES,
  PEAK_ELEMENT_CODE_LINES,
  buildPeakElementSteps,
} from './find-peak-element-step-compiler';
import { renderPeakElementCanvas } from './find-peak-element-canvas-adapter';

export {
  type PeakElementStep,
  PEAK_ELEMENT_CODES,
  PEAK_ELEMENT_CODE_LINES,
  buildPeakElementSteps,
  renderPeakElementCanvas,
};

registerDeclarativeAlgorithm({
  id: 'find-peak-element',
  aliases: ['162', 'leetcode-162'],
  hasDeductionTree: true,
  name: '寻找峰值',
  category: 'search',
  difficulty: 2,
  learningGoal: 'LeetCode 162: 在无序数组中寻找局部峰值元素。巧妙利用“往高处走必有峰值”的单调上坡性质，在 O(log N) 时间内锁定极值。',
  codeLanguages: PEAK_ELEMENT_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.nums as string | number[] | undefined;
    let arr = [1, 2, 1, 3, 5, 6, 4];
    if (typeof raw === 'string') {
      try {
        arr = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        arr = [1, 2, 1, 3, 5, 6, 4];
      }
    } else if (Array.isArray(raw) && raw.length > 0) {
      arr = raw.map(Number);
    }
    return buildPeakElementSteps(arr);
  },
  renderCanvas: (container: HTMLElement, step: PeakElementStep) => {
    container.innerHTML = renderPeakElementCanvas(step);
  },
  inputs: [
    {
      id: 'nums',
      label: '数组元素',
      type: 'text',
      defaultValue: '1, 2, 1, 3, 5, 6, 4',
      placeholder: '用逗号分隔的数字序列',
    },
  ],
});
