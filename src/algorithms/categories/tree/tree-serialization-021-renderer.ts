/**
 * 左程云算法通关课 Class 021: 二叉树序列化与反序列化 (Tree Serialization)
 * 先序序列化/反序列化与层序序列化/反序列化
 * 4-Card 声明式标准化架构 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TREE_SERIALIZATION_021_PROBLEM_CONTENT } from './tree-serialization-021-problem-content';
import {
  TREE_SERIALIZATION_021_CODES,
  TREE_SERIALIZATION_021_CODE_LINES,
} from './tree-serialization-021-stage-codes';
import {
  Tree021Node,
  Tree021Step,
  NodeLayout,
  SAMPLE_TREE_NODES,
  buildSerialization021Steps,
} from '../../../core/renderers/adapters/tree-serialization-021-step-compiler';
import {
  renderTreeSvg,
  renderTreeSerializationCanvas,
  renderTreeSerializationCard2,
} from '../../../core/renderers/adapters/tree-serialization-021-canvas-adapter';

export type { Tree021Node, Tree021Step, NodeLayout };
export {
  TREE_SERIALIZATION_021_CODES,
  TREE_SERIALIZATION_021_CODE_LINES,
  SAMPLE_TREE_NODES,
  buildSerialization021Steps,
  renderTreeSvg,
  renderTreeSerializationCanvas,
  renderTreeSerializationCard2,
};

// ============================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// ============================================================
export const treeSerializationVisualizer = registerDeclarativeAlgorithm<Tree021Step>({
  id: 'tree-serialization-021',
  name: '二叉树序列化与反序列化 (Class 021)',
  category: 'tree',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 21,
  aliases: ['class021-code01', 'tree-serialization-021', 'serialize-and-deserialize-binary-tree', 'leetcode-297'],
  learningGoal: '掌握二叉树空节点标记设计，实现先序与层序序列化字符串与二叉树拓扑结构互转',
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 先序序列化与反序列化 (Preorder)',
      shortName: '先序序列化',
      card2Title: '先序 Tokens 流与递归装配面板',
      card2Desc: '中左右遍历打桩空节点 "#"，单路自顶向下反序列化复原',
      codeLanguages: TREE_SERIALIZATION_021_CODES,
      generateSteps: () => buildSerialization021Steps('preorder'),
    },
    {
      id: 'stage2',
      name: 'Stage 2: 层序序列化与反序列化 (Levelorder)',
      shortName: '层序序列化',
      card2Title: '层序队列流与挂载面板',
      card2Desc: '利用 FIFO 队列按层拓扑输出与反向成对挂载子节点',
      codeLanguages: TREE_SERIALIZATION_021_CODES,
      generateSteps: () => buildSerialization021Steps('levelorder'),
    },
  ],
  codeLanguages: TREE_SERIALIZATION_021_CODES,
  inputs: [
    {
      id: 'mode',
      label: '遍历模式',
      type: 'select',
      defaultValue: 'preorder',
      options: [
        { label: '先序遍历序列化 (Preorder)', value: 'preorder' },
        { label: '层序遍历序列化 (Levelorder)', value: 'levelorder' },
      ],
    },
  ],
  card2Title: '序列化字符串流与反序列化队列探针',
  card2Desc: '展示 Tokens 流生成与双树 1:1 同构复原',
  problemHtml: TREE_SERIALIZATION_021_PROBLEM_CONTENT.description + TREE_SERIALIZATION_021_PROBLEM_CONTENT.mechanisms,
  generateSteps: (input) => {
    const mode = input.mode === 'levelorder' ? 'levelorder' : 'preorder';
    return buildSerialization021Steps(mode);
  },
  renderCanvas: (container, step) => {
    renderTreeSerializationCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderTreeSerializationCard2(container, step);
  },
});
