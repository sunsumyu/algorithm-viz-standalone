/**
 * Class 036: 用一个辅助栈或递归对栈进行排序 (Sort Stack)
 * 左程云算法通关课【必备篇】Class 036 / 程序员代码面试指南
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SortStackStep,
  SORT_STACK_CODES,
  generateSortStackSteps,
} from './sort-stack-using-recursive-036-step-compiler';
import { renderSortStackCanvas } from './sort-stack-using-recursive-036-canvas-adapter';

export type { SortStackStep };
export { generateSortStackSteps, SORT_STACK_CODES };

registerDeclarativeAlgorithm<SortStackStep>({
  id: 'sort-stack-using-recursive-036',
  aliases: ['class036-sort-stack', 'class036-code03', 'sort-stack', 'sort-stack-using-recursive', 'sort-stack-036'],
  name: '用一个辅助栈对栈进行排序',
  category: 'stack',
  hasDeductionTree: true,
  difficulty: 'medium',
  description: '仅允许使用一个辅助栈，不能使用额外数据结构，将一个无序栈从顶到底按升序/降序排好序。',
  problemHtml: `
    <div style="line-height: 1.6; color: #cbd5e1;">
      <h3 style="color: #38bdf8; margin-top: 0;">题目描述</h3>
      <p>一个栈中元素的类型为整型，现在想将该栈从顶到底按从大到小（或从小到大）的顺序排序，只许申请一个额外栈。除此之外，可以申请变量，但不能申请额外的数据结构。如何完成排序？</p>
      <h4 style="color: #38bdf8; margin-top: 14px;">算法思想</h4>
      <p>设待排栈为 <code>stack</code>，辅助栈为 <code>help</code>：</p>
      <ol style="padding-left: 20px; margin: 8px 0;">
        <li>从 <code>stack</code> 弹出一个元素记为 <code>cur</code>；</li>
        <li>如果 <code>help</code> 为空或 <code>help.peek() <= cur</code>，直接将 <code>cur</code> 压入 <code>help</code>；</li>
        <li>如果 <code>help.peek() > cur</code>，将 <code>help</code> 栈顶元素逐个弹出并压回 <code>stack</code>，直到满足 <code>help.peek() <= cur</code>，再将 <code>cur</code> 压入 <code>help</code>；</li>
        <li>不断重复上述过程，直到 <code>stack</code> 为空；此时 <code>help</code> 栈自顶向下递减（自底向顶递增）；</li>
        <li>最后将 <code>help</code> 栈元素全部倒回 <code>stack</code>，<code>stack</code> 栈顶即为最小/最大值。</li>
      </ol>
    </div>
  `,
  codeLanguages: SORT_STACK_CODES,
  inputs: [
    {
      id: 'stackElements',
      label: '栈初始元素 (自底向顶)',
      type: 'text',
      defaultValue: '3, 1, 4, 2',
      placeholder: '例如: 3, 1, 4, 2',
    },
  ],
  presets: [
    { label: '示例 1: [3, 1, 4, 2]', values: { stackElements: '3, 1, 4, 2' } },
    { label: '示例 2: 逆序 [5, 4, 3, 2, 1]', values: { stackElements: '5, 4, 3, 2, 1' } },
    { label: '示例 3: 已有序 [1, 2, 3, 4, 5]', values: { stackElements: '1, 2, 3, 4, 5' } },
    { label: '示例 4: 含重复元素 [3, 2, 3, 1, 2]', values: { stackElements: '3, 2, 3, 1, 2' } },
  ],
  generateSteps: (values: Record<string, any>) => {
    const raw = String(values.stackElements || '3, 1, 4, 2');
    const arr = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return generateSortStackSteps(arr.length > 0 ? arr : [3, 1, 4, 2]);
  },
  renderCanvas: (container, step) => {
    renderSortStackCanvas(container, step);
  },
});
