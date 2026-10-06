/**
 * Class 112: 权值线段树与单点更新 (Value Segment Tree)
 * 洛谷 P1138 / P3369
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import {
  ValueSegTreeStep,
  VALUE_SEG_TREE_CODES,
  VALUE_SEG_TREE_CODE_LINES,
  buildValueSegTreeSteps,
} from '../../../../core/renderers/adapters/value-segment-tree-112-step-compiler';
import { renderValueSegTreeCanvas } from '../../../../core/renderers/adapters/value-segment-tree-112-canvas-adapter';

// 向后兼容导出
export {
  type ValueSegTreeStep,
  VALUE_SEG_TREE_CODES,
  VALUE_SEG_TREE_CODE_LINES,
  buildValueSegTreeSteps,
};

export const valueSegTreeVisualizer = registerDeclarativeAlgorithm<ValueSegTreeStep>({
  id: 'value-segment-tree-112',
  name: '权值线段树与单点更新 (Class 112)',
  aliases: ['class112-code01', 'value-segment-tree', 'value-segment-tree-112', 'kth-smallest-seg-tree'],
  category: 'tree',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 112,
  learningGoal: '深入掌握权值线段树对值域进行二分建树与单点插入，实现 O(log V) 查找动态集合中第 K 小元素',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>给定一个动态正整数集合，支持插入数字与查询集合中全局第 <code>K</code> 小的数。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>样例：</strong>依次插入 [3, 1, 5, 2, 7, 3]，查询第 4 小的数。<br/>
        <strong>排序后：</strong>[1, 2, 3, 3, 5, 7]，第 4 小的数为 3。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'nums',
      label: '插入序列 (1~8 之间的正整数)',
      type: 'text',
      defaultValue: '3, 1, 5, 2, 7, 3',
      placeholder: '请输入正整数列表',
    },
    {
      id: 'k',
      label: '查询第 K 小 (K)',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 6,
    },
  ],
  codeLanguages: VALUE_SEG_TREE_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '3, 1, 5, 2, 7, 3');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const k = Math.max(1, parseInt(String(inputs.k || 4), 10));
    return buildValueSegTreeSteps(nums.length > 0 ? nums : [3, 1, 5, 2, 7, 3], k, 8);
  },
  renderCanvas: (container, step) => {
    renderValueSegTreeCanvas(container, step);
  },
});
