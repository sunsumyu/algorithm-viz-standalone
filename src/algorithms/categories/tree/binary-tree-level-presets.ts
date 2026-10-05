import type { InputControlDef, PresetCaseDef } from '../../../core/renderers/declarative-stage-spec';

export const BINARY_TREE_LEVEL_INPUTS: InputControlDef[] = [
  {
    id: 'input-tree',
    label: '二叉树层序',
    type: 'text',
    defaultValue: '3, 9, 20, null, null, 15, 7',
    width: '180px',
    placeholder: '3, 9, 20, null...',
  },
];

export const BINARY_TREE_LEVEL_PRESETS: PresetCaseDef[] = [
  {
    label: 'LeetCode 示例 1 (标准平衡树)',
    values: { 'input-tree': '3, 9, 20, null, null, 15, 7' },
    description: '经典分层二叉树',
  },
  {
    label: '满二叉树 (3层完备)',
    values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7' },
    description: '每层节点全部饱满',
  },
  {
    label: '单链左倾斜树',
    values: { 'input-tree': '1, 2, null, 3, null, 4' },
    description: '退化为单链表，每层仅一个节点',
  },
  {
    label: '轴对称二叉树',
    values: { 'input-tree': '1, 2, 2, 3, 4, 4, 3' },
    description: '左右子树严格对称',
  },
  {
    label: '单节点二叉树',
    values: { 'input-tree': '1' },
    description: '仅包含根节点',
  },
];
