/**
 * 只出现一次的数字 III (Single Number III) - 声明式教学级沙盘渲染器
 * 核心原理：
 * 数组中只有两个数字 a 和 b 出现 1 次，其余数字出现 2 次。
 * 1. 全员异或得 xor = a ^ b
 * 2. 提取最右侧的 1: diff = xor & (-xor)
 * 3. 按照该位是否为 1 将所有数字划分为两组，分别异或得到 a 和 b
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { BIT_PROBLEMS } from './bit-problem-content';
import { SINGLE_NUMBER_III_CODES, SINGLE_NUMBER_III_LINES } from './bit-stage-codes';
import { BitStep, renderBitGrid } from './bit-shared';

export interface SingleNumberIIIStep extends BitStep {
  nums: number[];
}

export function buildSingleNumberIIISteps(nums: number[]): SingleNumberIIIStep[] {
  const steps: SingleNumberIIIStep[] = [];
  const lines = SINGLE_NUMBER_III_LINES;
  const bitsCount = 16;

  // Step 0: 入口
  steps.push({
    nums,
    decision: `主函数入口：分析数组 [${nums.join(', ')}]，找出两个唯一只出现 1 次的数字`,
    message: '全员异或消除所有成对元素，最终得到两孤立数的异或结果 xor = a ^ b',
    log: `enter singleNumberIII([${nums.join(', ')}])`,
    codeLine: lines.entry,
    metrics: { '数组长度': `${nums.length}`, '阶段': '准备全员异或' },
  });

  // Step 1: 全员异或
  let xorVal = 0;
  for (let i = 0; i < nums.length; i++) {
    xorVal ^= nums[i];
  }

  steps.push({
    nums,
    decision: `第一轮异或扫描完毕：得到 a ^ b = ${xorVal} (0b${(xorVal >>> 0).toString(2)})`,
    message: '相同数字异或为 0，消去所有两两出现的数，仅剩下 a 与 b 的异或结果',
    log: `total XOR result = ${xorVal}`,
    codeLine: lines.totalXor,
    metrics: { 'xor 结果': `${xorVal}`, '二进制': `0b${(xorVal >>> 0).toString(2)}` },
    bitView: { title: `全员异或结果 a ^ b = ${xorVal}`, num: xorVal, bitsCount },
  });

  // Step 2: 提取 lowest 1 bit
  const diff = xorVal & (-xorVal);
  const diffPos = Math.floor(Math.log2(diff));

  steps.push({
    nums,
    decision: `提取分流基准位：diff = xor & (-xor) = ${diff} (第 ${diffPos} 位)`,
    message: `第 ${diffPos} 位为 1 说明 a 和 b 在该二进制位上必然一个为 1、另一个为 0！可以作为天然的分流依据！`,
    log: `diff bit extracted: ${diff} at bit ${diffPos}`,
    codeLine: lines.findDiff,
    metrics: { 'diff 掩码': `${diff}`, '分流位': `第 ${diffPos} 位` },
    bitView: { title: `分流掩码 diff = ${diff}`, num: diff, bitsCount, highlightMask: diff },
    groupView: { diff, diffBitPos: diffPos, groupA: [], groupB: [] },
  });

  // Step 3: 分流异或
  let a = 0;
  let b = 0;
  const groupA: number[] = [];
  const groupB: number[] = [];

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    const isGroupA = (num & diff) !== 0;
    if (isGroupA) {
      a ^= num;
      groupA.push(num);
    } else {
      b ^= num;
      groupB.push(num);
    }

    steps.push({
      nums,
      decision: `分流第 ${i + 1}/${nums.length} 个数 ${num}：(num & diff) ${isGroupA ? '!= 0' : '== 0'}，分流到组 ${isGroupA ? 'A' : 'B'}`,
      message: `组 ${isGroupA ? 'A' : 'B'} 当前累积异或结果: ${isGroupA ? a : b}`,
      log: `num ${num} -> group ${isGroupA ? 'A' : 'B'}, acc xor=${isGroupA ? a : b}`,
      codeLine: lines.groupSplit,
      metrics: { '当前数字': `${num}`, '组 A 异或结果': `${a}`, '组 B 异或结果': `${b}` },
      groupView: { diff, diffBitPos: diffPos, groupA: [...groupA], groupB: [...groupB], curNum: num, xorA: a, xorB: b },
    });
  }

  // Step 4: 返回结果 [a, b]
  steps.push({
    nums,
    decision: `分流异或完成！成功剥离两个唯一出现的数：[${a}, ${b}]`,
    message: '组 A 内部成对数字互相抵消只留下 a；组 B 内部成对数字抵消只留下 b！',
    log: `return [${a}, ${b}]`,
    codeLine: lines.returnAns,
    metrics: { '结果 a': `${a}`, '结果 b': `${b}`, '状态': '已完成' },
    groupView: { diff, diffBitPos: diffPos, groupA, groupB, xorA: a, xorB: b },
  });

  return steps;
}

export const singleNumberIIIRenderer = registerDeclarativeAlgorithm<SingleNumberIIIStep>({
  id: 'single-number-iii',
  title: BIT_PROBLEMS.singleNumberIII.title,
  category: 'bit',
  categoryName: '位运算与状态压缩',
  description: '只出现一次的数字 III：异或分组与最低位 1 的分流算法',
  timeComplexity: BIT_PROBLEMS.singleNumberIII.timeComplexity,
  spaceComplexity: BIT_PROBLEMS.singleNumberIII.spaceComplexity,
  analysisHtml: BIT_PROBLEMS.singleNumberIII.html,
  inputs: [
    {
      id: 'input-nums',
      label: '整数数组 (两数出现1次，其余出现2次)',
      type: 'text',
      defaultValue: '1, 2, 1, 3, 2, 5',
      placeholder: '例如 1, 2, 1, 3, 2, 5',
    },
  ],
  codeLanguages: SINGLE_NUMBER_III_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-nums'] ?? '1, 2, 1, 3, 2, 5');
    const nums = raw.split(/[,，\s]+/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    return buildSingleNumberIIISteps(nums.length > 0 ? nums : [1, 2, 1, 3, 2, 5]);
  },
  renderCanvas: (stageContainer: HTMLElement, step: SingleNumberIIIStep) => {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 分组卡片双栏
    if (step.groupView) {
      const groupCard = document.createElement('div');
      groupCard.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 10px;';

      const gA = step.groupView.groupA || [];
      const gB = step.groupView.groupB || [];

      groupCard.innerHTML = `
        <div style="padding: 10px 14px; background: #f0fdf4; border: 1.5px solid #22c55e; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #15803d;">🌟 组 A (第 ${step.groupView.diffBitPos} 位为 1)</span>
            <span style="font-size: 11px; font-weight: 800; color: #15803d; font-family: monospace;">异或和 = ${step.groupView.xorA ?? 0}</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${gA.map(n => `<span style="padding: 2px 6px; background: #ffffff; border: 1px solid #86efac; border-radius: 4px; font-size: 12px; font-weight: 700; color: #166534; font-family: monospace;">${n}</span>`).join('') || '<span style="font-size: 11px; color: #94a3b8;">暂无元素</span>'}
          </div>
        </div>
        <div style="padding: 10px 14px; background: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 700; color: #1d4ed8;">⚡ 组 B (第 ${step.groupView.diffBitPos} 位为 0)</span>
            <span style="font-size: 11px; font-weight: 800; color: #1d4ed8; font-family: monospace;">异或和 = ${step.groupView.xorB ?? 0}</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${gB.map(n => `<span style="padding: 2px 6px; background: #ffffff; border: 1px solid #93c5fd; border-radius: 4px; font-size: 12px; font-weight: 700; color: #1e40af; font-family: monospace;">${n}</span>`).join('') || '<span style="font-size: 11px; color: #94a3b8;">暂无元素</span>'}
          </div>
        </div>
      `;
      root.appendChild(groupCard);
    }

    // 2. 二进制位视效
    if (step.bitView) {
      renderBitGrid(root, step.bitView.title || '二进制', step.bitView.num, step.bitView.bitsCount || 16, step.bitView.highlightMask || 0);
    }

    // 3. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  },
});
