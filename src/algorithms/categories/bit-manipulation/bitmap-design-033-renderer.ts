/**
 * Class 033: 位图 BitMap 的实现与海量数据去重 (BitMap Design)
 * 左程云算法通关课入门篇 Class 033
 * 核心原语：利用 int/long 整数的每一位 bit 映射数字，空间压缩 32~64 倍，常数级位运算存取
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type BitMapStep,
  type BitMapOp,
  BITMAP_033_CODES,
  generateBitMapSteps,
} from './bitmap-design-033-step-compiler';
import { renderBitMapCanvas } from './bitmap-design-033-canvas-adapter';

export {
  type BitMapStep,
  type BitMapOp,
  BITMAP_033_CODES,
  generateBitMapSteps,
  renderBitMapCanvas,
};

export const bitmapDesign033Visualizer = registerDeclarativeAlgorithm<BitMapStep>({
  id: 'bitmap-design-033',
  name: 'Class 033: 位图 BitMap 的实现与海量数据去重 (BitMap Design)',
  category: 'bit-manipulation',
  icon: '🧮',
  difficulty: 2,
  levelOrder: 33,
  learningGoal: '掌握经典位图 (BitMap) 的底层位运算设计与桶偏移定位原理，理解海量数据去重的空间压缩本质',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 033)</h3>
      <p>设计实现经典位图结构 (BitMap)，支持海量数字高效去重与状态标记：</p>
      <ul>
        <li><code>add(int num)</code>：将数字加入位图，对应 bit 置 1。</li>
        <li><code>remove(int num)</code>：将数字从位图移除，对应 bit 置 0。</li>
        <li><code>contains(int num)</code>：查询数字是否在位图中。</li>
        <li><strong>核心价值</strong>：传统数组存一个数字需 4 字节 (32 bit)，位图存一个数字仅需 1 bit，实现 32 倍空间极大压缩。</li>
      </ul>
    </div>
  `,
  codeLanguages: BITMAP_033_CODES,
  inputs: [
    {
      id: 'scenario',
      label: '预设操作序列',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '标准序列 (添加3, 17, 35; 查询与删除)', value: 'standard' },
        { label: '跨桶边界序列 (测试 0, 31, 32, 63 等边缘)', value: 'boundary' },
      ],
    },
  ],
  generateSteps: (input) => {
    const scenario = input.scenario || 'standard';
    let ops: BitMapOp[] = [];
    if (scenario === 'boundary') {
      ops = [
        { type: 'add', num: 0 },
        { type: 'add', num: 31 },
        { type: 'add', num: 32 },
        { type: 'add', num: 63 },
        { type: 'contains', num: 31 },
        { type: 'contains', num: 32 },
        { type: 'remove', num: 31 },
        { type: 'contains', num: 31 },
      ];
    } else {
      ops = [
        { type: 'add', num: 3 },
        { type: 'add', num: 17 },
        { type: 'add', num: 35 },
        { type: 'contains', num: 17 },
        { type: 'remove', num: 17 },
        { type: 'contains', num: 17 },
        { type: 'add', num: 60 },
      ];
    }
    return generateBitMapSteps(63, ops);
  },
  renderCanvas: (container, step) => {
    renderBitMapCanvas(container, step);
  },
});
