/**
 * Class 004: 二分搜索与对数器 (Binary Search & Logarithmic Verifier)
 * 左程云算法通关课入门篇 Class 004
 * 深入解析二分搜索三种核心模型（存在性、最左边界、最右边界、无序数组局部最小值）与对数器验证机制
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type BinarySearchStep,
  BINARY_SEARCH_004_CODES,
  generateBinarySearchSteps,
} from './binary-search-logarithmic-004-step-compiler';
import { renderBinarySearchCanvas } from './binary-search-logarithmic-004-canvas-adapter';

export {
  type BinarySearchStep,
  BINARY_SEARCH_004_CODES,
  generateBinarySearchSteps,
  renderBinarySearchCanvas,
};

export const binarySearch004Visualizer = registerDeclarativeAlgorithm<BinarySearchStep>({
  id: 'binary-search-logarithmic-004',
  name: 'Class 004: 二分搜索与对数器 (Binary Search)',
  category: 'binary-search',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 4,
  aliases: ['class004-code02', 'class005-code01', 'binary-search-logarithmic-004', 'binary-search-verifier', 'logarithmic-verifier'],
  learningGoal: '掌握有序数组二分边界查找、无序数组局部最小值二分，以及对数器大样本随机对比验证思想',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 004)</h3>
      <p>二分法不仅仅局限于有序数组的 <code>target</code> 查找，只要能构建<strong>二分排他性逻辑</strong>（一半必有解/无解），即可使用二分：</p>
      <ul>
        <li><strong>有序数组找 >= target 最左位置</strong>：贪心记录当前下标，不断向左压缩右界。</li>
        <li><strong>无序数组找局部极小值</strong>：通过相邻斜率变化（导数拐点思维），在无序数组中达成 $O(\\log N)$ 复杂度。</li>
        <li><strong>对数器验证理念</strong>：编写暴力但绝对正确的参照方法，生成海量随机数据自动比对测试。</li>
      </ul>
    </div>
  `,
  codeLanguages: BINARY_SEARCH_004_CODES,
  inputs: [
    {
      id: 'target',
      label: '目标值 (Target)',
      type: 'number',
      defaultValue: 4,
    },
  ],
  generateSteps: (input) => {
    const nums = [1, 2, 2, 4, 4, 4, 7, 8, 9];
    const target = Number(input.target) || 4;
    return generateBinarySearchSteps(nums, target, 'find-leftmost');
  },
  renderCanvas: (container, step) => {
    renderBinarySearchCanvas(container, step);
  },
});
