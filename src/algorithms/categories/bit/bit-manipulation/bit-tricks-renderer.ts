/**
 * 位运算核心神技 (Brian Kernighan & Bit Tricks) - 声明式教学级沙盘渲染器
 * 核心神技：
 * 1. 提取最右侧的 1：x & (-x)
 * 2. 抹除最右侧的 1：x & (x - 1)
 * 3. 2 的幂次判定：x > 0 && (x & (x - 1)) == 0
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { BIT_PROBLEMS } from './bit-problem-content';
import { BIT_TRICKS_CODES, BIT_TRICKS_LINES } from './bit-stage-codes';
import { BitStep, renderBitGrid, renderBitComparison } from './bit-shared';

export interface BitTricksStep extends BitStep {
  x: number;
}

export function buildBitTricksSteps(x: number): BitTricksStep[] {
  const steps: BitTricksStep[] = [];
  const lines = BIT_TRICKS_LINES;
  const bitsCount = 16;

  // Step 0: 入口
  steps.push({
    x,
    decision: `主函数入口：分析数值 x = ${x}`,
    message: '位运算是硬件级运算，常用于常数时间提取特征与状态加速',
    log: `enter bitTricks(x=${x})`,
    codeLine: lines.entry,
    metrics: { '输入 x': `${x}`, '二进制': (x >>> 0).toString(2).padStart(bitsCount, '0') },
    bitView: {
      title: `输入数值 x 的二进制表示`,
      num: x,
      bitsCount,
    },
  });

  // Step 1: 提取最右侧的 1: x & (-x)
  const negX = -x;
  const rightOne = x & negX;
  const rightOnePos = rightOne > 0 ? Math.floor(Math.log2(rightOne)) : -1;

  steps.push({
    x,
    decision: `【神技一】提取最右侧的 1: x & (-x) = ${rightOne}`,
    message: `计算机底层以补码存储负数，-x = ~x + 1。x 与 -x 取与运算恰好保留最低位的 1！`,
    log: `extractRightOne(${x}) -> ${rightOne} (位于第 ${rightOnePos} 位)`,
    codeLine: lines.extract,
    metrics: { '操作': 'x & (-x)', '提取结果': `${rightOne}`, '第几位': `${rightOnePos}` },
    comparisonView: {
      titleA: '原数 x',
      valA: x,
      op: '&',
      titleB: '相反数 -x',
      valB: negX,
      resTitle: '提取最右 1',
      resVal: rightOne,
      bitsCount,
    },
  });

  // Step 2: 抹除最右侧的 1: x & (x - 1)
  const xMinus1 = x - 1;
  const clearOne = x & xMinus1;

  steps.push({
    x,
    decision: `【神技二】抹除最右侧的 1: x & (x - 1) = ${clearOne}`,
    message: `x - 1 将最低位的 1 借位变为 0，并将更低位全部置为 1。与原数取与，即可抹除最右侧的 1。常用于 O(1) 循环计数汉明重量。`,
    log: `clearRightOne(${x}) -> ${clearOne}`,
    codeLine: lines.clear,
    metrics: { '操作': 'x & (x - 1)', '抹除后数值': `${clearOne}` },
    comparisonView: {
      titleA: '原数 x',
      valA: x,
      op: '&',
      titleB: '前驱 x - 1',
      valB: xMinus1,
      resTitle: '抹除最低 1',
      resVal: clearOne,
      bitsCount,
    },
  });

  // Step 3: 循环抹除演示汉明重量统计 (位为 1 的个数)
  let cur = x;
  let count = 0;
  while (cur > 0 && count < 8) {
    const nextVal = cur & (cur - 1);
    count++;
    steps.push({
      x,
      decision: `循环统计汉明重量：第 ${count} 次抹除 lowest 1，当前剩余 ${nextVal}`,
      message: `利用 x = x & (x - 1)，只需循环 k 次（k 为 1 的总数）即可统计完毕`,
      log: `hamming weight iteration ${count}: cur=${cur} -> next=${nextVal}`,
      codeLine: lines.clear,
      metrics: { '已抹除 1 的个数': `${count}`, '当前数值': `${nextVal}` },
      bitView: {
        title: `循环消去过程 (第 ${count} 步)`,
        num: nextVal,
        bitsCount,
        highlightMask: cur ^ nextVal,
      },
    });
    cur = nextVal;
  }

  // Step 4: 2 的幂次判定: x > 0 && (x & (x - 1)) == 0
  const isPowerOf2 = x > 0 && (x & (x - 1)) === 0;
  steps.push({
    x,
    decision: `【神技三】2 的幂次判定：${isPowerOf2 ? 'YES (是 2 的幂)' : 'NO (不是 2 的幂)'}`,
    message: `若 x 是 2 的幂，则其二进制有且仅有 1 个 1，故抹除后结果必然等于 0 且 x > 0`,
    log: `isPowerOfTwo(${x}) -> ${isPowerOf2}`,
    codeLine: lines.power2,
    metrics: { 'isPowerOfTwo': `${isPowerOf2}`, '判断准则': 'x > 0 && (x & (x - 1)) == 0' },
    bitView: {
      title: `判定结果: x = ${x} (${isPowerOf2 ? '是 2 的幂' : '不是 2 的幂'})`,
      num: x,
      bitsCount,
      highlightMask: isPowerOf2 ? x : 0,
    },
  });

  return steps;
}

export const bitTricksRenderer = registerDeclarativeAlgorithm<BitTricksStep>({
  id: 'bit-tricks',
  title: BIT_PROBLEMS.bitTricks.title,
  category: 'bit',
  categoryName: '位运算与状态压缩',
  description: 'Brian Kernighan 算法与最右侧 1 的提取、抹除与 2 的幂判定',
  timeComplexity: BIT_PROBLEMS.bitTricks.timeComplexity,
  spaceComplexity: BIT_PROBLEMS.bitTricks.spaceComplexity,
  analysisHtml: BIT_PROBLEMS.bitTricks.html,
  inputs: [
    {
      id: 'input-x',
      label: '分析整数 x',
      type: 'number',
      defaultValue: 40,
      min: 1,
      max: 65535,
      step: 1,
      placeholder: '例如 40 (二进制 0010 1000)',
    },
  ],
  codeLanguages: BIT_TRICKS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const x = Math.max(1, parseInt(String(inputs?.['input-x'] ?? '40'), 10) || 40);
    return buildBitTricksSteps(x);
  },
  renderCanvas: (stageContainer: HTMLElement, step: BitTricksStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 若有对齐对比视效
    if (step.comparisonView) {
      renderBitComparison(root, step.comparisonView);
    }

    // 2. 单个数值的二进制视效
    if (step.bitView) {
      renderBitGrid(
        root,
        step.bitView.title || '二进制位视效',
        step.bitView.num,
        step.bitView.bitsCount || 16,
        step.bitView.highlightMask || 0,
        step.bitView.secondaryMask || 0
      );
    }

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
