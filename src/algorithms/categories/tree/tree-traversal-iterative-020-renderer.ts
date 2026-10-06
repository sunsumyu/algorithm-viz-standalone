/**
 * 左程云算法通关课 Class 020: 二叉树非递归与双栈遍历 (Iterative Tree Traversals)
 * LeetCode 144 (先序) / 94 (中序) / 145 (后序)
 * 4-Card 声明式标准化架构 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TREE_TRAVERSAL_020_PROBLEM_CONTENT } from './tree-traversal-iterative-020-problem-content';
import {
  TREE_TRAVERSAL_020_CODES,
  TREE_TRAVERSAL_020_CODE_LINES,
} from './tree-traversal-iterative-020-stage-codes';
import {
  TraversalNode,
  Traversal020Step,
  TreeLayoutItem,
  SAMPLE_TREE_LAYOUT,
  buildTraversal020Steps,
} from '../../../core/renderers/adapters/tree-traversal-iterative-020-step-compiler';
import {
  renderTreeTraversalCanvas,
  renderTreeTraversalCard2,
} from '../../../core/renderers/adapters/tree-traversal-iterative-020-canvas-adapter';

export type { TraversalNode, Traversal020Step, TreeLayoutItem };
export {
  TREE_TRAVERSAL_020_CODES,
  TREE_TRAVERSAL_020_CODE_LINES,
  SAMPLE_TREE_LAYOUT,
  buildTraversal020Steps,
  renderTreeTraversalCanvas,
  renderTreeTraversalCard2,
};

// ============================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// ============================================================
export const treeTraversal020Visualizer = registerDeclarativeAlgorithm<Traversal020Step>({
  id: 'tree-traversal-iterative-020',
  name: '二叉树迭代遍历 (Class 020)',
  category: 'tree',
  icon: '🥞',
  difficulty: 2,
  levelOrder: 20,
  aliases: ['class020-code01', 'tree-traversal-iterative-020', 'iterative-traversal', 'tree-traversal-stack'],
  learningGoal: '掌握使用显式单栈/双栈模拟系统递归调用过程，深入理解先序、中序、后序在栈内的时序转换',
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 先序非递归 (Preorder: 根左右)',
      shortName: '先序迭代',
      card2Title: '先序显式单栈时序探针',
      card2Desc: '弹出一个打印一个，先压右孩子再压左孩子',
      codeLanguages: TREE_TRAVERSAL_020_CODES,
      generateSteps: () => buildTraversal020Steps('preorder'),
    },
    {
      id: 'stage2',
      name: 'Stage 2: 中序非递归 (Inorder: 左根右)',
      shortName: '中序迭代',
      card2Title: '中序左边界下潜栈探针',
      card2Desc: '整条左边界全压栈，无法下潜时出栈访问并转向右子树',
      codeLanguages: TREE_TRAVERSAL_020_CODES,
      generateSteps: () => buildTraversal020Steps('inorder'),
    },
    {
      id: 'stage3',
      name: 'Stage 3: 双栈后序非递归 (Postorder: 左右根)',
      shortName: '后序双栈',
      card2Title: '双栈逆向收集探针',
      card2Desc: '按中右左收集，二次弹出自动反转为左右根',
      codeLanguages: TREE_TRAVERSAL_020_CODES,
      generateSteps: () => buildTraversal020Steps('postorder'),
    },
  ],
  codeLanguages: TREE_TRAVERSAL_020_CODES,
  inputs: [
    {
      id: 'type',
      label: '遍历类型',
      type: 'select',
      defaultValue: 'preorder',
      options: [
        { label: '先序遍历 (Preorder: 根左右)', value: 'preorder' },
        { label: '中序遍历 (Inorder: 左根右)', value: 'inorder' },
        { label: '双栈后序遍历 (Postorder: 左右根)', value: 'postorder' },
      ],
    },
  ],
  card2Title: '显式堆栈状态与访问时序面板',
  card2Desc: '显式控制遍历顺序，支持先序、中序与双栈后序',
  problemHtml: TREE_TRAVERSAL_020_PROBLEM_CONTENT.description + TREE_TRAVERSAL_020_PROBLEM_CONTENT.mechanisms,
  generateSteps: (inputs) => {
    const type = (inputs?.type || 'preorder') as 'preorder' | 'inorder' | 'postorder';
    return buildTraversal020Steps(type);
  },
  renderCanvas: (container, step) => {
    renderTreeTraversalCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderTreeTraversalCard2(container, step);
  },
});
