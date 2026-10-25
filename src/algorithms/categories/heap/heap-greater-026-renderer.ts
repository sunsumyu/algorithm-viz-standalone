/**
 * Class 026: 手写加强堆结构与反向索引表 (HeapGreater / Indexed Heap)
 * 左程云算法通关课入门篇 Class 026
 * 解决原生 PriorityQueue 无法在 O(log N) 内更新/删除指定对象的致命缺陷
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type HeapGreaterStep,
  HEAP_GREATER_026_CODES,
  generateHeapGreaterSteps,
} from './heap-greater-026-step-compiler';
import { renderHeapGreaterCanvas } from './heap-greater-026-canvas-adapter';

export {
  type HeapGreaterStep,
  HEAP_GREATER_026_CODES,
  generateHeapGreaterSteps,
  renderHeapGreaterCanvas,
};

export const heapGreater026Visualizer = registerDeclarativeAlgorithm<HeapGreaterStep>({
  id: 'heap-greater-026',
  aliases: ['class026-code01', 'class026', 'heap-greater-026'],
  name: 'Class 026: 手写加强堆结构 (HeapGreater)',
  category: 'heap',
  hasDeductionTree: true,
  icon: '🏗️',
  difficulty: 3,
  levelOrder: 26,
  learningGoal: '掌握手写加强堆结构与反向索引映射表 (indexMap)，克服原生堆结构无法 O(log N) 修改或删除指定元素的缺陷',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 026)</h3>
      <p>在所有语言（Java PriorityQueue / C++ priority_queue / Python heapq）自带的堆中，存在一个致命缺陷：</p>
      <ul>
        <li><strong>缺陷痛点</strong>：如果堆中的某个对象属性发生了改变，或者需要从堆中删除某一个非堆顶对象，系统必须花费 $O(N)$ 遍历整个数组。</li>
        <li><strong>手写加强堆 (HeapGreater)</strong>：额外维护一张哈希表 <code>indexMap</code>，记录每一个对象当前在堆数组中的具体下标。</li>
        <li><strong>极速操作</strong>：当对象属性改变时调用 <code>resign(obj)</code>，反向索引在 $O(1)$ 命中位置，随后执行 $O(\\log N)$ 的上浮与下沉调整。</li>
      </ul>
    </div>
  `,
  codeLanguages: HEAP_GREATER_026_CODES,
  inputs: [
    {
      id: 'demoScenario',
      label: '演示场景',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '标准流程: 插入 -> resign更新 -> 删除', value: 'standard' },
      ],
    },
  ],
  generateSteps: () => {
    const actions: Array<{ type: 'push' | 'resign' | 'remove'; id: string; val?: number }> = [
      { type: 'push', id: 'TaskA', val: 30 },
      { type: 'push', id: 'TaskB', val: 70 },
      { type: 'push', id: 'TaskC', val: 50 },
      { type: 'push', id: 'TaskD', val: 90 },
      { type: 'push', id: 'TaskE', val: 20 },
      { type: 'resign', id: 'TaskA', val: 100 }, // A 的权重激增，上浮至堆顶
      { type: 'remove', id: 'TaskB' },           // 任意删除 TaskB
    ];
    return generateHeapGreaterSteps(actions);
  },
  renderCanvas: (container, step) => {
    renderHeapGreaterCanvas(container, step);
  },
});
