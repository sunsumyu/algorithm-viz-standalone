/**
 * 乘积小于 K 的子数组 (Subarray Product Less Than K)
 * LeetCode 713 (Medium / 大厂高频双指针滑动窗口)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ProductLessThanKStep,
  PRODUCT_LESS_THAN_K_CODES,
  PRODUCT_LESS_THAN_K_CODE_LINES,
  buildProductLessThanKSteps,
} from './subarray-product-less-than-k-step-compiler';
import { renderProductLessThanKCanvas } from './subarray-product-less-than-k-canvas-adapter';

export type { ProductLessThanKStep };
export {
  PRODUCT_LESS_THAN_K_CODES,
  PRODUCT_LESS_THAN_K_CODE_LINES,
  buildProductLessThanKSteps,
  renderProductLessThanKCanvas,
};

registerDeclarativeAlgorithm({
  id: 'subarray-product-less-than-k',
  name: '乘积小于 K 的子数组',
  category: 'array',
  difficulty: 2,
  learningGoal:
    'LeetCode 713: 统计乘积严格小于 k 的连续子数组数。利用正整数单调性双指针窗口与每次 right - left + 1 的贡献累加，O(N) 极速完成。',
  codeLanguages: PRODUCT_LESS_THAN_K_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.nums as string | number[] | undefined;
    const rawK = Number(inputs?.k ?? 100);
    let arr = [10, 5, 2, 6];
    if (typeof raw === 'string') {
      try {
        arr = raw.split(/[,，\s]+/).filter(Boolean).map(Number);
      } catch {
        arr = [10, 5, 2, 6];
      }
    } else if (Array.isArray(raw) && raw.length > 0) {
      arr = raw.map(Number);
    }
    return buildProductLessThanKSteps(arr, isNaN(rawK) ? 100 : rawK);
  },
  renderCanvas: (container: HTMLElement, step: ProductLessThanKStep) => {
    renderProductLessThanKCanvas(container, step);
  },
  inputs: [
    {
      id: 'nums',
      label: '正整数序列',
      type: 'text',
      defaultValue: '10, 5, 2, 6',
      placeholder: '逗号分隔正整数',
    },
    {
      id: 'k',
      label: '乘积阈值 k',
      type: 'number',
      defaultValue: 100,
      placeholder: '阈值 k',
    },
  ],
});
