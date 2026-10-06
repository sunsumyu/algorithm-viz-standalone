/**
 * 左程云算法通关课 Class 036: 二叉树先序序列化与反序列化 (Preorder Serialize & Deserialize / LeetCode 297)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { Tree036Step } from './tree-036-037-shared';
import { PREORDER_SERIALIZE_036_CODES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  buildPreorderSerialize036Steps,
} from '../../../../core/renderers/adapters/preorder-serialize-036-step-compiler';
import {
  PreorderSerialize036CanvasAdapter,
  renderPreorderSerializeCanvas,
} from '../../../../core/renderers/adapters/preorder-serialize-036-canvas-adapter';

export { buildPreorderSerialize036Steps, renderPreorderSerializeCanvas };

export const preorderSerialize036Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-036-preorder-serialize',
  name: '二叉树先序序列化与反序列化 (Class 036)',
  category: 'tree',
  icon: '📦',
  difficulty: 3,
  levelOrder: 3605,
  learningGoal: '掌握先序遍历占位符 (#) 序列化协议，深入理解基于 Token 递归队列无损重建二叉树的机制',
  problemHtml: TREE_036_037_PROBLEMS.preorderSerialize036.html,
  codeLanguages: PREORDER_SERIALIZE_036_CODES,
  inputs: [
    {
      id: 'tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '1, 2, 3, null, null, 4, 5',
      width: '160px',
    },
  ],
  presets: [
    {
      label: '标准序列化示例',
      values: { tree: '1, 2, 3, null, null, 4, 5' },
      description: '包含占位符 #',
    },
    {
      label: '空树用例',
      values: { tree: 'null' },
      description: '序列化输出 "#,"',
    },
    {
      label: '单分支二叉树',
      values: { tree: '1, 2, null, 3' },
      description: '连续 null 占位还原',
    },
  ],
  generateSteps: () => buildPreorderSerialize036Steps(),
  renderCanvas: (container, step) => PreorderSerialize036CanvasAdapter.renderCanvas(container, step),
});
