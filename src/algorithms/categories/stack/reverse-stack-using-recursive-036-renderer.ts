/**
 * Class 036: 不申请额外数据结构逆序一个栈 (Reverse Stack Using Recursive)
 * 左程云算法通关课【必备篇】Class 036 / 程序员代码面试指南
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type ReverseStackStep,
  REVERSE_STACK_CODES,
  REVERSE_STACK_CODE_LINES,
  generateReverseStackSteps,
} from './reverse-stack-using-recursive-036-step-compiler';
import { renderReverseStackCanvas } from './reverse-stack-using-recursive-036-canvas-adapter';

export type { ReverseStackStep };
export {
  REVERSE_STACK_CODES,
  REVERSE_STACK_CODE_LINES,
  generateReverseStackSteps,
  renderReverseStackCanvas,
};

export const reverseStackVisualizer = registerDeclarativeAlgorithm<ReverseStackStep>({
  id: 'reverse-stack-using-recursive-036',
  aliases: ['reverse-stack', 'reverse-stack-recursive', 'reverse-stack-using-recursive', 'reverse-stack-036'],
  name: 'Class 036: 不申请额外数据结构逆序一个栈 (Reverse Stack)',
  category: 'stack',
  icon: '🔄',
  difficulty: 2,
  levelOrder: 36,
  learningGoal: '深刻理解递归的嵌套调用与系统调用栈天然暂存状态的能力，掌握 bottomOut 与 reverse 组合原语',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 036 / 程序员代码面试指南)</h3>
      <p>给你一个栈，请你将这个栈<strong>完全逆序</strong>。要求：</p>
      <ul>
        <li><strong>严禁申请额外的数据结构</strong>（严禁使用数组、队列、其他辅助栈）；</li>
        <li><strong>只能使用递归函数</strong>与系统调用栈本身的局部变量来完成。</li>
      </ul>
      <h4>双递归分治精髓：</h4>
      <ol>
        <li><code>bottomOut(stack)</code>：递归找到栈底元素并将其从栈中真正拔除，同时在回溯时将所有上方元素原样重新压入；</li>
        <li><code>reverse(stack)</code>：调用 <code>bottomOut</code> 抽取栈底暂存于当前栈帧，递归调用自己逆序剩余栈，最后将抽出的栈底压入成为最新栈顶！</li>
      </ol>
    </div>
  `,
  codeLanguages: REVERSE_STACK_CODES,
  inputs: [
    {
      id: 'elements',
      label: '栈初始元素 (自底向顶逗号分隔)',
      type: 'select',
      defaultValue: '1,2,3',
      options: [
        { label: '3个元素: 1, 2, 3 (底=1, 顶=3)', value: '1,2,3' },
        { label: '4个元素: 10, 20, 30, 40', value: '10,20,30,40' },
        { label: '逆序对用例: 5, 4, 3, 2, 1', value: '5,4,3,2,1' },
      ],
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.elements || '1,2,3');
    const nums = raw.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    return generateReverseStackSteps(nums.length > 0 ? nums : [1, 2, 3]);
  },
  renderCanvas: (container, step) => {
    renderReverseStackCanvas(container, step);
  },
});
