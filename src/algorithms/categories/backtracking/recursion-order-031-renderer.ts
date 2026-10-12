/**
 * Class 031: 经典递归过程与递归序深度解构 (Recursion Order)
 * 左程云算法通关课入门篇 Class 031
 * 核心真理：二叉树递归遍历中，任何节点都会被访问三次（先序/中序/后序的本质源头）
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  RecursionOrderStep,
  RECURSION_ORDER_031_CODES,
  generateRecursionOrderSteps,
} from './recursion-order-031-step-compiler';
import { renderRecursionOrderCanvas } from './recursion-order-031-canvas-adapter';

// 向后兼容导出
export type { RecursionOrderStep };
export {
  RECURSION_ORDER_031_CODES,
  generateRecursionOrderSteps,
  renderRecursionOrderCanvas,
};

export const recursionOrder031Visualizer = registerDeclarativeAlgorithm<RecursionOrderStep>({
  id: 'recursion-order-031',
  name: 'Class 031: 递归序与经典递归过程解构 (Recursion Order)',
  category: 'backtracking',
  icon: '🌳',
  difficulty: 2,
  levelOrder: 31,
  learningGoal: '深刻理解二叉树每个节点到达三次的递归序第一性原理，掌握先序、中序、后序遍历的统一底层本质',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 031)</h3>
      <p>理解经典递归过程，必须彻底理解递归序：</p>
      <ul>
        <li><strong>三次到达定理</strong>：对于任意节点 $X$，递归会首先进入 $X$（第 1 次）；遍历完左子树返回 $X$（第 2 次）；遍历完右子树再次返回 $X$ 并弹栈（第 3 次）。</li>
        <li><strong>先序遍历</strong>：在第 1 次到达 $X$ 时收集并打印结果。</li>
        <li><strong>中序遍历</strong>：在第 2 次到达 $X$ 时收集并打印结果。</li>
        <li><strong>后序遍历</strong>：在第 3 次到达 $X$ 时收集并打印结果。</li>
        <li><strong>教学价值</strong>：将抽象递归调用具象化为系统栈帧的压栈与弹栈，消除对递归的黑盒恐惧。</li>
      </ul>
    </div>
  `,
  codeLanguages: RECURSION_ORDER_031_CODES,
  inputs: [
    {
      id: 'depth',
      label: '树节点规模 (深度)',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '基础 3 节点 (根与左右孩子)', value: '2' },
        { label: '完整 5 节点 (深度为 3 的二叉树)', value: '3' },
      ],
    },
  ],
  generateSteps: (input) => {
    const depth = Number(input.depth) || 3;
    return generateRecursionOrderSteps(depth);
  },
  renderCanvas: (container, step) => {
    renderRecursionOrderCanvas(container, step);
  },
});
