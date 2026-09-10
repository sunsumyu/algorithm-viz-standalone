/**
 * 将数组分成几个递增序列 (LeetCode 1121) - 声明式教学级沙盘渲染器
 * 核心贪心：最高众数瓶颈判定 nums.length >= maxFreq * k
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import {
  DIVIDE_ARRAY_SEQ_CODES,
  DIVIDE_ARRAY_SEQ_LINES,
} from './greedy-092-stage-codes';
import {
  Greedy092Step,
  renderDecisionBalance,
} from './greedy-092-shared';

export interface DivideArraySeqStep extends Greedy092Step {
  nums: number[];
  k: number;
  curFreq: number;
  maxFreq: number;
  maxFreqVal?: number;
  curIdx: number;
  canDivide: boolean;
}

export function buildDivideArraySeqSteps(nums: number[], k: number): DivideArraySeqStep[] {
  const steps: DivideArraySeqStep[] = [];
  const lines = DIVIDE_ARRAY_SEQ_LINES;
  const n = nums.length;

  // Step 0: 入口
  steps.push({
    nums: [...nums],
    k,
    curFreq: 1,
    maxFreq: 1,
    curIdx: -1,
    canDivide: false,
    decision: `主函数入口：接收非递减数组 nums=[${nums.join(', ')}]，要求子序列最小长度 k=${k}`,
    message: '由于每个子序列必须严格递增，相同数字绝不能在同一子序列中，最高频次的数字决定了子序列数量的硬性下限',
    log: `enter canDivideIntoSubsequences(n=${n}, k=${k})`,
    codeLine: lines.entry,
  });

  // Step 1: 扫描统计众数最高频次
  let maxFreq = 1;
  let curFreq = 1;
  let maxFreqVal = nums[0];

  for (let i = 1; i < n; i++) {
    if (nums[i] === nums[i - 1]) {
      curFreq++;
      if (curFreq > maxFreq) {
        maxFreq = curFreq;
        maxFreqVal = nums[i];
      }
    } else {
      curFreq = 1;
    }

    steps.push({
      nums: [...nums],
      k,
      curFreq,
      maxFreq,
      maxFreqVal,
      curIdx: i,
      canDivide: n >= maxFreq * k,
      decision: nums[i] === nums[i - 1]
        ? `考察 nums[${i}]=${nums[i]} == nums[${i - 1}] ➔ 相同数字连续出现，当前数字频次增至 ${curFreq}，历史最高频次 maxFreq=${maxFreq} (数值 ${maxFreqVal})`
        : `考察 nums[${i}]=${nums[i]} != nums[${i - 1}] ➔ 遇到新数值，重置当前频次 curFreq=1`,
      message: `至少需要划分为 ${maxFreq} 个互不相交的严格递增子序列`,
      log: `scan i=${i} val=${nums[i]} curFreq=${curFreq} maxFreq=${maxFreq}`,
      codeLine: lines.scanFreq,
    });
  }

  // Step 2: 瓶颈条件校验
  const requiredLen = maxFreq * k;
  const canDivide = n >= requiredLen;

  steps.push({
    nums: [...nums],
    k,
    curFreq,
    maxFreq,
    maxFreqVal,
    curIdx: -1,
    canDivide,
    decision: canDivide
      ? `🎉 判定成功！数组总长度 n=${n} >= 众数瓶颈需求 (maxFreq * k = ${maxFreq} * ${k} = ${requiredLen}) ➔ 可以成功划分！`
      : `❌ 判定失败！数组总长度 n=${n} < 众数瓶颈需求 (maxFreq * k = ${maxFreq} * ${k} = ${requiredLen}) ➔ 元素不足以填满 ${maxFreq} 个长度至少为 ${k} 的严格递增子序列！`,
    message: canDivide ? '可以通过轮询分配法构造出合法划分' : '由鸽巢原理证明无解',
    log: `done canDivide=${canDivide}`,
    codeLine: lines.checkBottleneck,
  });

  return steps;
}

export const divideArraySeqVisualizer = registerDeclarativeAlgorithm<DivideArraySeqStep>({
  id: 'divide-array-into-increasing-sequences',
  name: '将数组分成几个递增序列 (Divide Array Sequences)',
  category: 'greedy',
  icon: '📊',
  difficulty: 3,
  levelOrder: 925,
  learningGoal: '掌握众数频次瓶颈与鸽巢原理判定 nums.length >= maxFreq * k',
  problemHtml: GREEDY_092_PROBLEMS.divideArraySeq.html,
  analysisHtml: GREEDY_092_PROBLEMS.divideArraySeq.html,
  inputs: [
    {
      id: 'input-nums',
      label: '非递减数组 nums',
      type: 'text',
      defaultValue: '1, 2, 2, 3, 3, 4, 4',
      placeholder: '1, 2, 2, 3, 3, 4, 4',
    },
    {
      id: 'input-k',
      label: '子序列最小长度 k',
      type: 'number',
      defaultValue: 3,
      placeholder: '如 3',
    },
  ],
  codeLanguages: DIVIDE_ARRAY_SEQ_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const rawNums = String(inputs?.['input-nums'] || '1, 2, 2, 3, 3, 4, 4');
    const nums = rawNums.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const k = parseInt(String(inputs?.['input-k'] ?? 3), 10);
    return buildDivideArraySeqSteps(nums, isNaN(k) ? 3 : k);
  },
  renderCanvas: (stageContainer: HTMLElement, step: DivideArraySeqStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    const reqLen = step.maxFreq * step.k;
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">数组长度: <b>${step.nums.length}</b></span>
          <span style="color: #cbd5e1;">|</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">最高频次: ${step.maxFreq} (数字 ${step.maxFreqVal})</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #fdf4ff; color: #8b5cf6; font-weight: 600;">最少所需长度: ${reqLen}</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">能否划分:</span>
          <span style="color: ${step.canDivide ? '#059669' : '#dc2626'}; font-weight: 800; font-size: 15px;">${step.canDivide ? 'TRUE (可以)' : 'FALSE (不可)'}</span>
        </div>
      </div>
    `;

    // 中部序列展示
    const numsBox = document.createElement('div');
    numsBox.style.cssText = 'flex: 1; display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

    step.nums.forEach((val, idx) => {
      const isCur = step.curIdx === idx;
      const isMaxFreq = val === step.maxFreqVal;

      let border = '#cbd5e1';
      let bg = '#f8fafc';
      let color = '#334155';

      if (isCur) {
        border = '#3b82f6';
        bg = '#eff6ff';
        color = '#1d4ed8';
      } else if (isMaxFreq) {
        border = '#f59e0b';
        bg = '#fffbeb';
        color = '#b45309';
      }

      const item = document.createElement('div');
      item.style.cssText = `min-width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 13px; color: ${color}; position: relative;`;
      item.textContent = String(val);

      if (isCur) {
        const tag = document.createElement('span');
        tag.style.cssText = 'position: absolute; top: -12px; font-size: 9px; color: #3b82f6; font-weight: 700;';
        tag.textContent = '▲';
        item.appendChild(tag);
      }

      numsBox.appendChild(item);
    });
    mainCard.appendChild(numsBox);

    // 底部天平比较
    const balanceBox = document.createElement('div');
    renderDecisionBalance(balanceBox, {
      leftTitle: '实际总长度 nums.length',
      leftVal: `${step.nums.length} 个元素`,
      rightTitle: '最小需求长度 maxFreq * k',
      rightVal: `${step.maxFreq} * ${step.k} = ${reqLen} 个元素`,
      winner: step.canDivide ? 'left' : 'right',
      reason: step.canDivide ? `n(${step.nums.length}) >= ${reqLen} (容量充裕)` : `n(${step.nums.length}) < ${reqLen} (容量不足)`,
    });
    mainCard.appendChild(balanceBox);

    stageContainer.appendChild(mainCard);
  },
});

export function registerDivideArraySeq(): void {
  // 保持向前兼容导出
}
