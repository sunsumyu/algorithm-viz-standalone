/**
 * 数组的最小偏移量 (LeetCode 1675) - 声明式教学级沙盘渲染器
 * 核心贪心：奇数乘2单调归一化 + 大顶堆贪心除2缩小极差
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_092_PROBLEMS } from './greedy-092-problem-content';
import {
  MINIMIZE_DEVIATION_CODES,
  MINIMIZE_DEVIATION_LINES,
} from './greedy-092-stage-codes';
import {
  Greedy092Step,
  renderDecisionBalance,
} from './greedy-092-shared';

export interface MinimizeDeviationStep extends Greedy092Step {
  originalNums: number[];
  heap: number[];
  minVal: number;
  maxVal: number;
  ans: number;
  poppedVal?: number;
  pushedVal?: number;
}

export function buildMinimizeDeviationSteps(nums: number[]): MinimizeDeviationStep[] {
  const steps: MinimizeDeviationStep[] = [];
  const lines = MINIMIZE_DEVIATION_LINES;
  const n = nums.length;

  // Step 0: 入口
  steps.push({
    originalNums: [...nums],
    heap: [],
    minVal: 0,
    maxVal: 0,
    ans: Infinity,
    decision: `主函数入口：接收输入数组 nums=[${nums.join(', ')}]，长度 n=${n}`,
    message: '为了消除双向操作（奇数乘2与偶数除2）的混乱，第一步将所有奇数乘以2，全部归一为偶数上限',
    log: `enter minimumDeviation(nums=[${nums.join(',')}])`,
    codeLine: lines.entry,
  });

  // Step 1: 归一化入堆
  const heap = nums.map(x => x % 2 === 1 ? x * 2 : x);
  heap.sort((a, b) => b - a);
  let minVal = Math.min(...heap);
  let maxVal = heap[0];
  let ans = maxVal - minVal;

  steps.push({
    originalNums: [...nums],
    heap: [...heap],
    minVal,
    maxVal,
    ans,
    decision: `奇数翻倍归一化：将奇数扩大为偶数 ➔ [${heap.join(', ')}]，当前最小值 minVal=${minVal}，最大值 maxVal=${maxVal}，初始偏移量 ans = ${maxVal} - ${minVal} = ${ans}`,
    message: '所有元素达到各自理论最大值，后续只需考虑大数除以2以缩小极差',
    log: `init heap [${heap.join(',')}] ans=${ans}`,
    codeLine: lines.initHeap,
  });

  // Step 2: 核心贪心除以 2
  let iter = 0;
  while (iter < 30) {
    iter++;
    heap.sort((a, b) => b - a);
    maxVal = heap[0];
    const curDiff = maxVal - minVal;
    if (curDiff < ans) ans = curDiff;

    if (maxVal % 2 !== 0) {
      steps.push({
        originalNums: [...nums],
        heap: [...heap],
        minVal,
        maxVal,
        ans,
        decision: `当前堆顶最大值 ${maxVal} 是奇数！无法再继续除以 2 缩小，贪心收敛终止`,
        message: `最终锁定全局最小偏移量: ${ans}`,
        log: `top ${maxVal} is odd, terminate`,
        codeLine: lines.done,
      });
      break;
    }

    const popped = heap.shift()!;
    const half = popped / 2;
    heap.push(half);
    minVal = Math.min(minVal, half);
    heap.sort((a, b) => b - a);
    const newDiff = heap[0] - minVal;
    const isBetter = newDiff < ans;
    if (isBetter) ans = newDiff;

    steps.push({
      originalNums: [...nums],
      heap: [...heap],
      minVal,
      maxVal: heap[0],
      ans,
      poppedVal: popped,
      pushedVal: half,
      decision: `弹出当前堆顶最大偶数 ${popped}，除以 2 变为 ${half} 并压回堆中，更新 minVal=${minVal}，当前极差 = ${heap[0]} - ${minVal} = ${newDiff} ➔ ${isBetter ? '刷新最小偏移量！' : '保持历史最优'}`,
      message: `全局最小偏移量 ans=${ans}`,
      log: `popped ${popped} -> ${half}, newDiff=${newDiff}, ans=${ans}`,
      codeLine: lines.reduceEven,
    });
  }

  // 收敛
  steps.push({
    originalNums: [...nums],
    heap: [...heap],
    minVal,
    maxVal: heap[0],
    ans,
    decision: `🎉 计算完毕！数组可达到的全局最小偏移量为 ${ans}`,
    message: '单向贪心收敛证明全局最优',
    log: `done ans=${ans}`,
    codeLine: lines.done,
  });

  return steps;
}

export const minimizeDeviationVisualizer = registerDeclarativeAlgorithm<MinimizeDeviationStep>({
  id: 'minimize-deviation-in-array',
  name: '数组的最小偏移量 (Minimize Deviation)',
  category: 'greedy',
  icon: '📉',
  difficulty: 3,
  levelOrder: 921,
  learningGoal: '掌握全奇数乘以2的数值单调归一化与大顶堆贪心缩小极差的证明',
  problemHtml: GREEDY_092_PROBLEMS.minimizeDeviation.html,
  analysisHtml: GREEDY_092_PROBLEMS.minimizeDeviation.html,
  inputs: [
    {
      id: 'input-nums',
      label: '正整数数组 nums',
      type: 'text',
      defaultValue: '4, 1, 5, 20, 3',
      placeholder: '4, 1, 5, 20, 3',
    },
  ],
  codeLanguages: MINIMIZE_DEVIATION_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-nums'] || '4, 1, 5, 20, 3');
    const nums = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildMinimizeDeviationSteps(nums);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MinimizeDeviationStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态指标
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">极值跨度:</span>
          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; font-weight: 700;">min=${step.minVal}</span>
          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #fef2f2; color: #dc2626; font-family: 'JetBrains Mono', monospace; font-weight: 700;">max=${step.maxVal}</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">历史最小偏移量:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.ans === Infinity ? '计算中' : step.ans}</span>
        </div>
      </div>
    `;

    // 中部：当前堆中元素排序状态
    const heapBox = document.createElement('div');
    heapBox.style.cssText = 'flex: 1; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

    step.heap.forEach((val, idx) => {
      const isTop = idx === 0;
      const isMin = val === step.minVal;
      const isOdd = val % 2 !== 0;

      let bg = '#f8fafc';
      let border = '#cbd5e1';
      let color = '#334155';

      if (isTop) {
        bg = isOdd ? '#fef3c7' : '#fee2e2';
        border = isOdd ? '#f59e0b' : '#ef4444';
        color = isOdd ? '#b45309' : '#b91c1c';
      } else if (isMin) {
        bg = '#eff6ff';
        border = '#3b82f6';
        color = '#1d4ed8';
      }

      const item = document.createElement('div');
      item.style.cssText = `min-width: 44px; height: 42px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 14px; color: ${color}; position: relative; box-shadow: 0 1px 2px rgba(0,0,0,0.05);`;

      item.innerHTML = `
        <span>${val}</span>
        <span style="font-size: 9px; font-weight: 600; color: #94a3b8;">${isOdd ? '奇数 (封顶)' : '偶数 (可/2)'}</span>
      `;

      if (isTop) {
        const tag = document.createElement('span');
        tag.style.cssText = 'position: absolute; top: -10px; background: #ef4444; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
        tag.textContent = '堆顶 MAX';
        item.appendChild(tag);
      }
      if (isMin && !isTop) {
        const tag = document.createElement('span');
        tag.style.cssText = 'position: absolute; bottom: -10px; background: #3b82f6; color: #fff; font-size: 9px; padding: 1px 4px; border-radius: 3px; font-weight: 700;';
        tag.textContent = 'MIN';
        item.appendChild(tag);
      }

      heapBox.appendChild(item);
    });
    mainCard.appendChild(heapBox);

    stageContainer.appendChild(mainCard);
  },
});
