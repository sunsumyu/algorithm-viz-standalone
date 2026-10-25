import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  ReorderNode,
  ReorderListStep,
  REORDER_LIST_CODES,
  REORDER_CODE_LINES,
  buildReorderListSteps,
} from './reorder-list-step-compiler';
import { renderReorderListCanvas } from './reorder-list-canvas-adapter';

export type { ReorderNode, ReorderListStep };
export { REORDER_LIST_CODES, REORDER_CODE_LINES, buildReorderListSteps, renderReorderListCanvas };

registerDeclarativeAlgorithm({
  id: 'reorder-list',
  aliases: ['class034-code03', 'reorder-list', 'leetcode-143', '143', 'reorder-list-034'],
  name: '大厂高频真题: 重排链表 (Reorder List)',
  category: 'linked-list',
  hasDeductionTree: true,
  learningGoal: '经典综合题王：快慢指针寻中点 + 原地反转后半段 + 双指针交替穿针引线交叉合并',
  inputs: [
    {
      id: 'nodes',
      label: '链表节点值',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5',
      placeholder: '逗号分隔数字，如 1, 2, 3, 4, 5 或 1, 2, 3, 4',
    },
  ],
  codeLanguages: REORDER_LIST_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nodes || '1, 2, 3, 4, 5');
    const vals = raw
      .split(/[,，\s]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n));
    return buildReorderListSteps(vals.length ? vals : [1, 2, 3, 4, 5]);
  },
  renderCanvas: (container, step) => {
    renderReorderListCanvas(container, step as ReorderListStep);
  },
});
