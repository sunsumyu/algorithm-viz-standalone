/**
 * Class 037: 二叉树序列化与反序列化深入 (Serialize and Deserialize Binary Tree)
 * 左程云算法通关课入门篇 Class 037 / LeetCode 297 高阶拓展
 * 4-Card 声明式标准化架构 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TREE_SERIALIZATION_037_PROBLEM_CONTENT } from './tree-serialization-037-problem-content';
import { TREE_SERIALIZATION_037_CODES } from './tree-serialization-037-stage-codes';
import {
  SerializeStep,
  collectTreeValues,
  buildStage1PostorderSteps,
  buildStage2LevelorderSteps,
  buildStage3AmbiguitySteps,
  generateSerializationSteps,
} from '../../../core/renderers/adapters/tree-serialization-037-step-compiler';
import {
  renderSerializationCanvas,
  renderSerializationCard2,
} from '../../../core/renderers/adapters/tree-serialization-037-canvas-adapter';

export const SERIALIZE_037_CODES = TREE_SERIALIZATION_037_CODES;
export type { SerializeStep };
export {
  TREE_SERIALIZATION_037_CODES,
  collectTreeValues,
  buildStage1PostorderSteps,
  buildStage2LevelorderSteps,
  buildStage3AmbiguitySteps,
  generateSerializationSteps,
  renderSerializationCanvas,
  renderSerializationCard2,
};

// =========================================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// =========================================================================
export const treeSerialization037Visualizer = registerDeclarativeAlgorithm<SerializeStep>({
  id: 'tree-serialization-037',
  name: 'Class 037: 二叉树后序与高级序列化深入',
  category: 'tree',
  icon: '📦',
  difficulty: 3,
  levelOrder: 37,
  aliases: ['class037-code01', 'tree-serialization-037', 'postorder-serialize', 'serialize-deserialize-postorder'],
  learningGoal: '掌握二叉树后序遍历左右中序列化与自右向左逆向建树公理，彻底理解中序不可反序列化歧义本质',
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 后序序列化与逆序建树 (Postorder DFS)',
      shortName: '后序逆向建树',
      card2Title: '后序 Tokens 流与逆向递归装配面板',
      card2Desc: '左右中输出序列；自右向左消费 Tokens：先构建根，再构建右子树，最后构建左子树',
      codeLanguages: TREE_SERIALIZATION_037_CODES,
      generateSteps: () => buildStage1PostorderSteps('deserialize'),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 广度优先层序序列化与队列装配 (Levelorder BFS)',
      shortName: '层序队列装配',
      card2Title: '层序队列流与挂载面板',
      card2Desc: '利用 FIFO 队列逐层拓扑输出与反向成对挂载子节点',
      codeLanguages: TREE_SERIALIZATION_037_CODES,
      generateSteps: () => buildStage2LevelorderSteps(),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 中序序列化歧义判定反例 (Inorder Ambiguity)',
      shortName: '中序歧义推导',
      card2Title: '中序不可反序列化反例证明',
      card2Desc: '严格举证两棵不同二叉树产生完全相同的中序字符串，论证单射崩溃定理',
      codeLanguages: TREE_SERIALIZATION_037_CODES,
      generateSteps: () => buildStage3AmbiguitySteps(),
    },
  ],
  codeLanguages: TREE_SERIALIZATION_037_CODES,
  problemHtml: TREE_SERIALIZATION_037_PROBLEM_CONTENT.description + TREE_SERIALIZATION_037_PROBLEM_CONTENT.mechanisms,
  inputs: [
    {
      id: 'mode',
      label: '演示流程模式',
      type: 'select',
      defaultValue: 'deserialize',
      options: [
        { label: '反序列化重构过程 (Stream ➔ Tree)', value: 'deserialize' },
        { label: '序列化编码过程 (Tree ➔ Stream)', value: 'serialize' },
      ],
    },
  ],
  generateSteps: (input) => buildStage1PostorderSteps((input?.mode || 'deserialize') as 'serialize' | 'deserialize'),
  renderCanvas: (container, step) => renderSerializationCanvas(container, step),
  renderCustomMetrics: (container, step) => renderSerializationCard2(container, step),
});
