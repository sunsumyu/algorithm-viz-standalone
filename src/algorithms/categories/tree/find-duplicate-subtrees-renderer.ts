/**
 * 寻找重复的子树可视化器 (Find Duplicate Subtrees · LeetCode 652)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 * 遵循 Matt Pocock 深模块架构哲学：薄领域适配器 (Thin Domain Adapter, LOC < 150)
 *
 * Stage 1: 经典后序遍历字符串序列化哈希查重 (Postorder Serialization)
 * Stage 2: 唯一三元组 UID 编码极速哈希 (Triplet UID Compression, O(N))
 * Stage 3: 显式后序遍历与单调栈迭代 (Explicit Stack Iteration)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseTreeArray } from '../../../core/input-primitives';
import { buildTreeFromArr } from './tree-template';
import {
  FIND_DUPLICATE_SUBTREES_PROBLEM_HTML,
  FIND_DUPLICATE_SUBTREES_ANALYSIS_HTML,
} from './find-duplicate-subtrees-problem-content';
import {
  FIND_DUPLICATE_SUBTREES_CODES,
  FIND_DUPLICATE_SUBTREES_STAGE1_CODES,
  FIND_DUPLICATE_SUBTREES_STAGE2_CODES,
  FIND_DUPLICATE_SUBTREES_STAGE3_CODES,
} from './find-duplicate-subtrees-stage-codes';
import {
  type TreeNodeData,
  type DuplicateSubtreeStep,
  buildDuplicateSubtreesStage1Steps,
  buildDuplicateSubtreesSteps,
  buildDuplicateSubtreesStage2Steps,
  buildDuplicateSubtreesStage3Steps,
} from '../../../core/renderers/adapters/duplicate-subtrees-step-compiler';
import {
  renderDuplicateSubtreesCanvas,
  renderDuplicateSubtreesCard2,
} from '../../../core/renderers/adapters/duplicate-subtrees-canvas-adapter';

export type { TreeNodeData, DuplicateSubtreeStep };
export {
  buildDuplicateSubtreesStage1Steps,
  buildDuplicateSubtreesSteps,
  buildDuplicateSubtreesStage2Steps,
  buildDuplicateSubtreesStage3Steps,
  FIND_DUPLICATE_SUBTREES_CODES,
  renderDuplicateSubtreesCanvas,
  renderDuplicateSubtreesCard2,
};

const resolveTreeRoot = (rawInputs: Record<string, any>) => {
  if (!rawInputs || rawInputs.treePreset === 'default') return undefined;
  const treeArr = parseTreeArray(rawInputs.treeInput, [1, 2, 3, 4, null, 2, 4, null, null, 4]);
  return buildTreeFromArr(treeArr);
};

export const findDuplicateSubtreesVisualizer = registerDeclarativeAlgorithm<DuplicateSubtreeStep>({
  id: 'find-duplicate-subtrees',
  name: '寻找重复的子树',
  category: 'tree',
  learningGoal: '掌握二叉树自底向上后序遍历子树序列化判定图同构，深度理解三元组 (val, leftUID, rightUID) 的 O(N) 整数哈希压缩原理',
  aliases: ['leetcode-652', 'find-duplicate-subtrees'],
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 经典后序序列化',
      shortName: '后序序列化',
      card2Title: '序列签名频次表 (Hash Table)',
      card2Desc: '自底向上字符串哈希序列频次统计',
      codeLanguages: FIND_DUPLICATE_SUBTREES_STAGE1_CODES,
      generateSteps: (rawInputs) => buildDuplicateSubtreesStage1Steps(resolveTreeRoot(rawInputs)),
    },
    {
      id: 'stage2',
      name: 'Stage 2: 三元组 UID 压缩',
      shortName: '三元组UID',
      card2Title: '三元组 UID 编码表 (O(N))',
      card2Desc: '三元组 (val, leftUID, rightUID) 映射与频次统计',
      codeLanguages: FIND_DUPLICATE_SUBTREES_STAGE2_CODES,
      generateSteps: (rawInputs) => buildDuplicateSubtreesStage2Steps(resolveTreeRoot(rawInputs)),
    },
    {
      id: 'stage3',
      name: 'Stage 3: 显式单调栈迭代',
      shortName: '单调栈迭代',
      card2Title: '显式后序栈与频次统计',
      card2Desc: '模拟调用栈压栈出栈与后序状态记录',
      codeLanguages: FIND_DUPLICATE_SUBTREES_STAGE3_CODES,
      generateSteps: (rawInputs) => buildDuplicateSubtreesStage3Steps(resolveTreeRoot(rawInputs)),
    },
  ],
  inputs: [
    {
      id: 'treePreset',
      label: '预设案例',
      type: 'select',
      defaultValue: 'default',
      options: [
        { label: '经典重复: [1,2,3,4,null,2,4,null,null,4]', value: 'default' },
        { label: '对称重复: [2, 1, 1]', value: 'symmetric' },
        { label: '多层重复: [2, 2, 2, 3, null, 3, null]', value: 'multi-level' },
        { label: '无重复子树: [1, 2, 3]', value: 'unique' },
      ],
    },
    {
      id: 'treeInput',
      label: '自定义二叉树层序数组',
      type: 'text',
      defaultValue: '[1, 2, 3, 4, null, 2, 4, null, null, 4]',
      placeholder: '例如: [1,2,3,4,null,2,4,null,null,4]',
    },
  ],
  card2Title: '序列签名频次表 / UID 编码表',
  card2Desc: '子树形态哈希签名与重复根节点收集池',
  problemHtml: FIND_DUPLICATE_SUBTREES_PROBLEM_HTML,
  analysisHtml: FIND_DUPLICATE_SUBTREES_ANALYSIS_HTML,
  renderCanvas: renderDuplicateSubtreesCanvas,
  renderCustomMetrics: renderDuplicateSubtreesCard2,
});
