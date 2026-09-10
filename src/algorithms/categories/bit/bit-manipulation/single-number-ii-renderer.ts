/**
 * 只出现一次的数字 II (Single Number II) - 声明式教学级沙盘渲染器
 * 核心原理：
 * 其余元素出现 3 次，唯独一个出现 1 次。
 * 运用有限状态自动机维护每一位的模 3 状态：
 * 计数状态：00 -> 01 -> 10 -> 00
 * 状态方程：
 * ones = (ones ^ num) & ~twos;
 * twos = (twos ^ num) & ~ones;
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { BIT_PROBLEMS } from './bit-problem-content';
import { SINGLE_NUMBER_II_CODES, SINGLE_NUMBER_II_LINES } from './bit-stage-codes';
import { BitStep, renderBitGrid } from './bit-shared';

export interface SingleNumberIIStep extends BitStep {
  nums: number[];
}

export function buildSingleNumberIISteps(nums: number[]): SingleNumberIIStep[] {
  const steps: SingleNumberIIStep[] = [];
  const lines = SINGLE_NUMBER_II_LINES;
  const bitsCount = 16;

  let ones = 0;
  let twos = 0;

  // Step 0: 入口
  steps.push({
    nums,
    decision: `主函数入口：处理数组 [${nums.join(', ')}]，其余数出现 3 次，找出唯一出现 1 次的数`,
    message: '利用模 3 状态自动机，ones 与 twos 维护每一个二进制位出现 1 次与 2 次的状态',
    log: `enter singleNumber([${nums.join(', ')}])`,
    codeLine: lines.entry,
    metrics: { '数组长度': `${nums.length}`, '初始 ones': '0', '初始 twos': '0' },
    stateView: { ones, twos },
  });

  // Step 1: 初始化状态机
  steps.push({
    nums,
    decision: `初始化状态寄存器：ones = 0, twos = 0`,
    message: 'ones 记录出现 1 次的位，twos 记录出现 2 次的位。当某位累积满 3 次时两者同时清零',
    log: 'init ones=0, twos=0',
    codeLine: lines.initVars,
    metrics: { 'ones': '0', 'twos': '0' },
    stateView: { ones, twos },
  });

  // 遍历每个数字
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];

    // Loop Header
    steps.push({
      nums,
      decision: `循环第 ${i + 1}/${nums.length} 轮：读取当前数字 num = ${num}`,
      message: `准备利用状态转换方程更新计数状态`,
      log: `loop idx=${i}, num=${num}`,
      codeLine: lines.loopHeader,
      metrics: { '当前下标': `${i}`, '当前 num': `${num}`, '当前 ones': `${ones}`, '当前 twos': `${twos}` },
      stateView: { ones, twos, curNum: num, curIndex: i },
      bitView: { title: `当前元素 num = ${num} 的二进制`, num, bitsCount },
    });

    // Update state
    ones = (ones ^ num) & ~twos;
    twos = (twos ^ num) & ~ones;

    steps.push({
      nums,
      decision: `状态更新完毕：ones = ${ones} (0b${(ones >>> 0).toString(2)}), twos = ${twos} (0b${(twos >>> 0).toString(2)})`,
      message: `方程执行：ones = (ones ^ num) & ~twos; twos = (twos ^ num) & ~ones;`,
      log: `update: ones=${ones}, twos=${twos}`,
      codeLine: lines.updateState,
      metrics: { '当前 num': `${num}`, '新 ones': `${ones}`, '新 twos': `${twos}` },
      stateView: { ones, twos, curNum: num, curIndex: i },
    });
  }

  // Return Ans
  steps.push({
    nums,
    decision: `算法执行完毕：返回最终 ones = ${ones}`,
    message: `出现 3 次的数字其各位均被重置为 0，唯独只出现 1 次的数字保留在 ones 中！`,
    log: `return ones=${ones}`,
    codeLine: lines.returnAns,
    metrics: { '最终唯一数': `${ones}`, '状态': '已完成' },
    stateView: { ones, twos },
    bitView: { title: `最终识别答案: ${ones}`, num: ones, bitsCount, highlightMask: ones },
  });

  return steps;
}

export const singleNumberIIRenderer = registerDeclarativeAlgorithm<SingleNumberIIStep>({
  id: 'single-number-ii',
  title: BIT_PROBLEMS.singleNumberII.title,
  category: 'bit',
  categoryName: '位运算与状态压缩',
  description: '只出现一次的数字 II：模 3 状态机位运算常数空间解法',
  timeComplexity: BIT_PROBLEMS.singleNumberII.timeComplexity,
  spaceComplexity: BIT_PROBLEMS.singleNumberII.spaceComplexity,
  analysisHtml: BIT_PROBLEMS.singleNumberII.html,
  inputs: [
    {
      id: 'input-nums',
      label: '整数数组 (其余数出现3次，唯一数出现1次)',
      type: 'text',
      defaultValue: '2, 2, 3, 2',
      placeholder: '例如 2, 2, 3, 2 或 0, 1, 0, 1, 0, 1, 99',
    },
  ],
  codeLanguages: SINGLE_NUMBER_II_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-nums'] ?? '2, 2, 3, 2');
    const nums = raw.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    return buildSingleNumberIISteps(nums.length > 0 ? nums : [2, 2, 3, 2]);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SingleNumberIIStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 数组元素卡片列表
    const arrayCard = document.createElement('div');
    arrayCard.style.cssText = 'padding: 12px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';
    const items = step.nums.map((val, idx) => {
      const isCur = step.stateView?.curIndex === idx;
      return `
        <div style="min-width: 44px; padding: 6px; border-radius: 6px; text-align: center; font-family: monospace; background: ${isCur ? '#fef3c7' : '#f8fafc'}; border: 1.5px solid ${isCur ? '#f59e0b' : '#cbd5e1'};">
          <div style="font-size: 10px; color: #64748b;">[${idx}]</div>
          <div style="font-size: 14px; font-weight: 800; color: ${isCur ? '#b45309' : '#1e293b'};">${val}</div>
        </div>
      `;
    }).join('');
    arrayCard.innerHTML = `
      <div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">📊 数组遍历进度:</div>
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">${items}</div>
    `;
    root.appendChild(arrayCard);

    // 2. 状态寄存器对比
    if (step.stateView) {
      const stateCard = document.createElement('div');
      stateCard.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 10px;';

      const onesVal = step.stateView.ones ?? 0;
      const twosVal = step.stateView.twos ?? 0;

      stateCard.innerHTML = `
        <div style="padding: 10px 14px; background: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #1d4ed8; margin-bottom: 4px;">⚡ 出现 1 次寄存器 (ones)</div>
          <div style="font-size: 18px; font-weight: 800; color: #1e40af; font-family: monospace;">${onesVal}</div>
          <div style="font-size: 11px; color: #3b82f6; font-family: monospace;">0b${(onesVal >>> 0).toString(2).padStart(8, '0')}</div>
        </div>
        <div style="padding: 10px 14px; background: #fdf4ff; border: 1.5px solid #c084fc; border-radius: 8px;">
          <div style="font-size: 11px; font-weight: 700; color: #7e22ce; margin-bottom: 4px;">🌀 出现 2 次寄存器 (twos)</div>
          <div style="font-size: 18px; font-weight: 800; color: #6b21a8; font-family: monospace;">${twosVal}</div>
          <div style="font-size: 11px; color: #a855f7; font-family: monospace;">0b${(twosVal >>> 0).toString(2).padStart(8, '0')}</div>
        </div>
      `;
      root.appendChild(stateCard);
    }

    // 3. 当前二进制视效
    if (step.bitView) {
      renderBitGrid(root, step.bitView.title || '二进制', step.bitView.num, step.bitView.bitsCount || 16, step.bitView.highlightMask || 0);
    }

    // 4. 决策提示
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
