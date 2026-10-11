/**
 * 位图结构设计与实现 (Bitset Array) - 声明式教学级沙盘渲染器
 * 核心原理：
 * 利用 int 数组的每一位存储集合状态，1 个 int 可存 32 个数字的布尔值。
 * 极高内存压缩（相比 boolean 节省 32 倍内存，CPU 缓存命中极高）。
 * 核心公式：
 * bucket = num >> 5 (相当于 num / 32)
 * bit = num & 31    (相当于 num % 32)
 * add: bits[bucket] |= (1 << bit)
 * contains: (bits[bucket] & (1 << bit)) != 0
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { BIT_PROBLEMS } from './bit-problem-content';
import { BITSET_ARRAY_CODES } from './bit-stage-codes';
import {
  type BitsetArrayStep,
  buildBitsetArraySteps,
} from './bitset-array-step-compiler';
import { renderBitsetArrayCanvas } from './bitset-array-canvas-adapter';

export {
  type BitsetArrayStep,
  buildBitsetArraySteps,
  renderBitsetArrayCanvas,
};

export const bitsetArrayRenderer = registerDeclarativeAlgorithm<BitsetArrayStep>({
  id: 'bitset-array',
  title: BIT_PROBLEMS.bitsetArray.title,
  category: 'bit',
  categoryName: '位运算与状态压缩',
  description: '位图结构设计与实现：高性能海量数据去重与常数时间增删查',
  aliases: ['class033-code01', 'bitmap-array', 'bitset', 'bit-map'],
  timeComplexity: BIT_PROBLEMS.bitsetArray.timeComplexity,
  spaceComplexity: BIT_PROBLEMS.bitsetArray.spaceComplexity,
  analysisHtml: BIT_PROBLEMS.bitsetArray.html,
  inputs: [
    {
      id: 'input-insert',
      label: '待插入整数集合 (逗号分隔)',
      type: 'text',
      defaultValue: '5, 35, 68, 12, 99',
      placeholder: '例如 5, 35, 68, 12, 99',
    },
    {
      id: 'input-query',
      label: '待查询数字',
      type: 'number',
      defaultValue: 35,
      min: 0,
      max: 1000,
      step: 1,
      placeholder: '例如 35',
    },
  ],
  codeLanguages: BITSET_ARRAY_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-insert'] ?? '5, 35, 68, 12, 99');
    const insertNums = raw.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 0);
    const queryNum = Math.max(0, parseInt(String(inputs?.['input-query'] ?? '35'), 10) || 0);
    return buildBitsetArraySteps(insertNums.length > 0 ? insertNums : [5, 35, 68, 12, 99], queryNum);
  },
  renderCanvas: (stageContainer: HTMLElement, step: BitsetArrayStep) => {
    renderBitsetArrayCanvas(stageContainer, step);
  },
});
