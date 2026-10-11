import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  buildVerifyPreorderBstSteps,
  type VerifyPreorderBstStep,
  VERIFY_PREORDER_BST_CODES,
  CODE_LINES
} from './verify-preorder-sequence-in-bst-step-compiler';
import { renderVerifyPreorderCanvas } from './verify-preorder-sequence-in-bst-canvas-adapter';

export {
  buildVerifyPreorderBstSteps,
  type VerifyPreorderBstStep,
  VERIFY_PREORDER_BST_CODES,
  CODE_LINES,
  renderVerifyPreorderCanvas,
};

registerDeclarativeAlgorithm({
  id: 'verify-preorder-sequence-in-bst',
  name: '验证二叉搜索树的前序遍历序列',
  category: 'monotonic-stack',
  learningGoal: '利用单调栈与下界跃升机制，以 O(N) 时间和空间验证前序遍历是否符合二叉搜索树特性',
  inputs: [
    {
      id: 'preorder',
      label: '前序序列',
      type: 'text',
      defaultValue: '5, 2, 1, 3, 6',
      placeholder: '逗号分隔，如 5, 2, 1, 3, 6 或 5, 2, 6, 1, 3'
    }
  ],
  codeLanguages: VERIFY_PREORDER_BST_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.preorder || '5, 2, 1, 3, 6');
    const nums = raw.split(/[,，\s]+/).filter(Boolean).map(Number).filter(n => !isNaN(n));
    return buildVerifyPreorderBstSteps(nums.length ? nums : [5, 2, 1, 3, 6]);
  },
  renderCanvas: (container, step) => {
    renderVerifyPreorderCanvas(container, step as VerifyPreorderBstStep);
  }
});
