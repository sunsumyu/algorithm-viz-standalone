/**
 * 除自身以外数组的乘积 (Product of Array Except Self)
 * LeetCode 238 (Medium / 高频算法面试基石题)
 * 核心机制:
 *  前缀积与后缀积双向扫描拆解数组乘积，利用返回数组复用空间的 O(1) 辅助空间优化
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ProductStep,
  PRODUCT_EXCEPT_SELF_CODES,
  PRODUCT_EXCEPT_SELF_CODE_LINES,
  buildProductSteps,
} from './product-except-self-238-step-compiler';
import {
  renderProductCanvas,
  renderProductAuxiliary,
} from './product-except-self-238-canvas-adapter';

export type { ProductStep };
export {
  PRODUCT_EXCEPT_SELF_CODES,
  PRODUCT_EXCEPT_SELF_CODE_LINES,
  buildProductSteps,
  renderProductCanvas,
};

export const productExceptSelf238Visualizer = registerDeclarativeAlgorithm<ProductStep>({
  id: 'product-except-self-238',
  aliases: ['product-except-self', '238', 'leetcode-238'],
  hasDeductionTree: true,
  name: '除自身以外数组的乘积 (LeetCode 238)',
  category: 'array',
  icon: '✖️',
  difficulty: 2,
  levelOrder: 238,
  learningGoal: '掌握前缀积与后缀积双向扫描拆解数组乘积的核心思想，体会利用返回结果复用空间的 O(1) 优化技巧',
  codeLanguages: PRODUCT_EXCEPT_SELF_CODES,
  metrics: [
    { id: '当前扫描索引 i', label: '当前扫描索引 i', color: '#0ea5e9' },
    { id: '右侧累乘积 R', label: '右侧累乘积 R', color: '#f59e0b' },
    { id: '当前推演阶段', label: '当前推演阶段', color: '#6366f1' },
    { id: '数组物理规模 N', label: '数组物理规模 N', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'case',
      label: '输入数组',
      type: 'select',
      defaultValue: 'case1',
      options: [
        { label: '[1, 2, 3, 4] (经典用例)', value: 'case1' },
        { label: '[-1, 1, 0, -3, 3] (包含 0 的边界用例)', value: 'case2' },
      ],
    },
  ],
  generateSteps: (input) => {
    const c = input?.case || 'case1';
    const nums = c === 'case2' ? [-1, 1, 0, -3, 3] : [1, 2, 3, 4];
    return buildProductSteps(nums);
  },
  renderCanvas: (container, step) => {
    renderProductCanvas(container, step);
  },
  auxiliaryVisual: {
    title: '算法核心公理与三步准则',
    render: (container, step) => {
      renderProductAuxiliary(container, step);
    },
  },
});
