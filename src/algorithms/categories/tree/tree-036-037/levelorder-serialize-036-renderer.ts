/**
 * 左程云算法通关课 Class 036: 二叉树按层序列化与反序列化 (Levelorder Serialize & Deserialize / LeetCode 297)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { Tree036Step } from './tree-036-037-shared';
import { LEVELORDER_SERIALIZE_036_CODES } from './tree-036-037-stage-codes';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  buildLevelorderSerialize036Steps,
} from '../../../../core/renderers/adapters/levelorder-serialize-036-step-compiler';
import {
  LevelorderSerialize036CanvasAdapter,
  renderLevelorderSerializeCanvas,
} from '../../../../core/renderers/adapters/levelorder-serialize-036-canvas-adapter';

export { buildLevelorderSerialize036Steps, renderLevelorderSerializeCanvas };

export const levelorderSerialize036Visualizer = registerDeclarativeAlgorithm<Tree036Step>({
  id: 'tree-036-levelorder-serialize',
  name: '二叉树按层序列化与反序列化 (Class 036)',
  category: 'tree',
  icon: '📦',
  difficulty: 2,
  levelOrder: 3606,
  learningGoal: '掌握基于队列的层序序列化与反序列化双指针重建机制，体会自顶向下逐层消费 token 恢复子树的过程',
  problemHtml: TREE_036_037_PROBLEMS.levelorderSerialize036.html,
  codeLanguages: LEVELORDER_SERIALIZE_036_CODES,
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
      description: '满节点按层展开',
    },
    {
      label: '偏斜树用例',
      values: { tree: '1, 2, null, 3' },
      description: '单侧连续 # 占位',
    },
  ],
  generateSteps: () => buildLevelorderSerialize036Steps(),
  renderCanvas: (container, step) => LevelorderSerialize036CanvasAdapter.renderCanvas(container, step),
});
