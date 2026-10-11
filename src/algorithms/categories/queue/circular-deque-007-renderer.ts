/**
 * Class 007: 循环双端队列设计 (Circular Deque Design)
 * 左程云算法通关课入门篇 Class 007 / LeetCode 641
 * 静态数组 + 环形指针模型：彻底消解动态扩容与数据搬移，双端 O(1) 插入与弹出
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type CircularDequeStep,
  CIRCULAR_DEQUE_007_CODES,
  generateCircularDequeSteps,
} from './circular-deque-007-step-compiler';
import { renderCircularDequeCanvas } from './circular-deque-007-canvas-adapter';

export {
  type CircularDequeStep,
  CIRCULAR_DEQUE_007_CODES,
  generateCircularDequeSteps,
  renderCircularDequeCanvas,
};

export const circularDeque007Visualizer = registerDeclarativeAlgorithm<CircularDequeStep>({
  id: 'circular-deque-007',
  name: 'Class 007: 循环双端队列设计 (Circular Deque)',
  category: 'queue',
  icon: '🔄',
  difficulty: 1,
  levelOrder: 7,
  learningGoal: '掌握静态连续数组构建环形双端队列 (Deque) 的环形指针取模与双端 O(1) 存取设计技巧',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 007 / LeetCode 641)</h3>
      <p>设计实现双端队列。你的实现需要支持以下操作：</p>
      <ul>
        <li><code>insertFront()</code>：将一个元素添加到双端队列头部。 若操作成功返回 true。</li>
        <li><code>insertLast()</code>：将一个元素添加到双端队列尾部。若操作成功返回 true。</li>
        <li><code>deleteFront()</code>：从双端队列头部删除一个元素。 若操作成功返回 true。</li>
        <li><code>deleteLast()</code>：从双端队列尾部删除一个元素。若操作成功返回 true。</li>
        <li><strong>核心价值</strong>：彻底避免普通数组插入时 $O(N)$ 的搬移开销，通过首尾环形指针达成 $O(1)$ 常数级响应。</li>
      </ul>
    </div>
  `,
  codeLanguages: CIRCULAR_DEQUE_007_CODES,
  inputs: [
    {
      id: 'capacity',
      label: '队列容量 (Capacity)',
      type: 'number',
      defaultValue: 5,
    },
  ],
  generateSteps: (input) => {
    const k = Number(input.capacity) || 5;
    const ops: Array<{ op: 'insertFront' | 'insertLast' | 'deleteFront' | 'deleteLast'; val?: number }> = [
      { op: 'insertLast', val: 1 },
      { op: 'insertLast', val: 2 },
      { op: 'insertFront', val: 3 },
      { op: 'insertFront', val: 4 },
      { op: 'deleteLast' },
      { op: 'insertFront', val: 5 },
      { op: 'insertLast', val: 6 },
      { op: 'deleteFront' }
    ];
    return generateCircularDequeSteps(k, ops);
  },
  renderCanvas: (container, step) => {
    renderCircularDequeCanvas(container, step);
  },
});
