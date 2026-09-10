/**
 * 两个 0 和 1 数量相等区间的最大长度 - 声明式教学级沙盘渲染器
 * 核心贪心：抽屉原理与两端极值边界比较 (arr[0] == arr[n-1] ? n-1 : n-2)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import {
  LONGEST_SAME_ZEROS_ONES_CODES,
  LONGEST_SAME_ZEROS_ONES_LINES,
} from './greedy-091-stage-codes';
import {
  Greedy091Step,
  renderDecisionBalance,
} from './greedy-091-shared';

export interface IntervalDef {
  name: string;
  l: number;
  r: number;
  zeros: number;
  ones: number;
  len: number;
}

export interface LongestSameZerosOnesStep extends Greedy091Step {
  arr: number[];
  intervalA?: IntervalDef;
  intervalB?: IntervalDef;
  maxLen: number;
  reasonText: string;
}

export function buildLongestSameZerosOnesSteps(arr: number[]): LongestSameZerosOnesStep[] {
  const steps: LongestSameZerosOnesStep[] = [];
  const lines = LONGEST_SAME_ZEROS_ONES_LINES;
  const n = arr.length;

  // Step 0: 入口
  steps.push({
    arr: [...arr],
    maxLen: 0,
    reasonText: '准备校验边界与长度特判',
    decision: `主函数入口：接收 01 数组 arr=[${arr.join(', ')}]，长度 n=${n}`,
    message: '目标：找出两个不完全重叠且 0 和 1 数量分别相等的最大区间',
    log: `enter maxEqualIntervalLength(n=${n})`,
    codeLine: lines.entry,
  });

  // 特判 n <= 2
  if (n <= 1) {
    steps.push({
      arr: [...arr],
      maxLen: 0,
      reasonText: '长度 n <= 1 无法构造两个不完全重叠的区间',
      decision: `特判：n=${n} <= 1，无法选出两个非完全重合区间，返回 0`,
      message: '特判分支结束',
      log: 'guard n<=1 -> 0',
      codeLine: lines.guardSmall,
    });
    return steps;
  }

  if (n === 2) {
    const isSame = arr[0] === arr[1];
    const ans = isSame ? 1 : 0;
    steps.push({
      arr: [...arr],
      maxLen: ans,
      reasonText: isSame ? '两个元素相同，可取区间 [0,0] 与 [1,1]' : '两元素不同，不存在统计相同的两个区间',
      decision: `特判：n=2，arr[0]=${arr[0]}, arr[1]=${arr[1]} ➔ ${isSame ? '相同，返回长度 1' : '不同，返回 0'}`,
      message: '特判分支结束',
      log: `guard n==2 -> ${ans}`,
      codeLine: lines.guardSmall,
    });
    return steps;
  }

  // 考察长度为 n-1 的两个区间
  const isEndsEqual = arr[0] === arr[n - 1];

  // 区间 A: [0, n-2] (去掉 arr[n-1])
  const aZeros = arr.slice(0, n - 1).filter(x => x === 0).length;
  const aOnes = arr.slice(0, n - 1).filter(x => x === 1).length;
  const intA: IntervalDef = { name: '区间 A (排除末尾)', l: 0, r: n - 2, zeros: aZeros, ones: aOnes, len: n - 1 };

  // 区间 B: [1, n-1] (去掉 arr[0])
  const bZeros = arr.slice(1, n).filter(x => x === 0).length;
  const bOnes = arr.slice(1, n).filter(x => x === 1).length;
  const intB: IntervalDef = { name: '区间 B (排除首位)', l: 1, r: n - 1, zeros: bZeros, ones: bOnes, len: n - 1 };

  steps.push({
    arr: [...arr],
    intervalA: intA,
    intervalB: intB,
    maxLen: isEndsEqual ? n - 1 : n - 2,
    reasonText: `比对首尾端点 arr[0]=${arr[0]} 与 arr[${n - 1}]=${arr[n - 1]}`,
    decision: `考察首尾字符：arr[0]=${arr[0]}，arr[${n - 1}]=${arr[n - 1]} ➔ ${isEndsEqual ? '首尾相同！' : '首尾不同！'}`,
    message: `若首尾相同，则区间 [0, ${n - 2}] 与 [1, ${n - 1}] 去除的元素相同，其 0/1 统计必然相等`,
    log: `check ends: arr[0]=${arr[0]} arr[${n - 1}]=${arr[n - 1]}`,
    codeLine: lines.checkEnds,
  });

  if (isEndsEqual) {
    steps.push({
      arr: [...arr],
      intervalA: intA,
      intervalB: intB,
      maxLen: n - 1,
      reasonText: `首尾一致，区间 [0, ${n - 2}] 和 [1, ${n - 1}] 的 0 数量均为 ${aZeros}，1 数量均为 ${aOnes}`,
      decision: `🎉 首尾字符相同：区间 [0, ${n - 2}] 与 [1, ${n - 1}] 完美匹配，返回最大长度 n - 1 = ${n - 1}`,
      message: '达成理论最大可能长度',
      log: `done ans=${n - 1}`,
      codeLine: lines.returnNMinus1,
    });
  } else {
    // 首尾不同，抽屉原理必在 n-2 处找到解
    const subA: IntervalDef = { name: '区间 A [0, n-3]', l: 0, r: n - 3, zeros: arr.slice(0, n - 2).filter(x => x === 0).length, ones: arr.slice(0, n - 2).filter(x => x === 1).length, len: n - 2 };
    const subB: IntervalDef = { name: '区间 B [2, n-1]', l: 2, r: n - 1, zeros: arr.slice(2, n).filter(x => x === 0).length, ones: arr.slice(2, n).filter(x => x === 1).length, len: n - 2 };

    steps.push({
      arr: [...arr],
      intervalA: subA,
      intervalB: subB,
      maxLen: n - 2,
      reasonText: `首尾不同，抽屉原理保证在长度为 ${n - 2} 的 3 个区间中必有 2 个区间 0/1 统计相同`,
      decision: `🎉 首尾字符不同：由抽屉原理保证最大区间长度为 n - 2 = ${n - 2}`,
      message: '达成全局最优解',
      log: `done ans=${n - 2}`,
      codeLine: lines.returnNMinus2,
    });
  }

  return steps;
}

export const longestSameZerosOnesVisualizer = registerDeclarativeAlgorithm<LongestSameZerosOnesStep>({
  id: 'longest-same-zeros-ones-intervals',
  name: '两个0和1数量相等区间的最大长度',
  category: 'greedy',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 916,
  learningGoal: '掌握首尾字符相等与不相等的抽屉原理推导及 n-1 与 n-2 极值贪心',
  problemHtml: GREEDY_091_PROBLEMS.longestSameZerosOnes.html,
  analysisHtml: GREEDY_091_PROBLEMS.longestSameZerosOnes.html,
  inputs: [
    {
      id: 'input-arr',
      label: '01 数组 arr',
      type: 'text',
      defaultValue: '0, 1, 0, 0, 1, 0',
      placeholder: '0, 1, 0, 0, 1, 0',
    },
  ],
  codeLanguages: LONGEST_SAME_ZEROS_ONES_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-arr'] || '0, 1, 0, 0, 1, 0');
    const arr = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildLongestSameZerosOnesSteps(arr);
  },
  renderCanvas: (stageContainer: HTMLElement, step: LongestSameZerosOnesStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">数组规模 n = <b>${step.arr.length}</b></span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">首位 arr[0]=${step.arr[0]} | 末位 arr[n-1]=${step.arr[step.arr.length - 1]}</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">最大区间长度:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">${step.maxLen}</span>
        </div>
      </div>
    `;

    // 中部 01 序列卡片
    const arrBox = document.createElement('div');
    arrBox.style.cssText = 'display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

    step.arr.forEach((val, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === step.arr.length - 1;

      let border = '#cbd5e1';
      let bg = val === 0 ? '#f0fdf4' : '#eff6ff';
      let color = val === 0 ? '#15803d' : '#1d4ed8';

      if (isFirst || isLast) {
        border = '#f59e0b';
      }

      const item = document.createElement('div');
      item.style.cssText = `min-width: 36px; height: 36px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 13px; color: ${color}; position: relative;`;
      item.textContent = String(val);

      if (isFirst) {
        const tag = document.createElement('span');
        tag.style.cssText = 'position: absolute; top: -14px; font-size: 9px; color: #f59e0b; font-weight: 700;';
        tag.textContent = '首';
        item.appendChild(tag);
      }
      if (isLast) {
        const tag = document.createElement('span');
        tag.style.cssText = 'position: absolute; top: -14px; font-size: 9px; color: #f59e0b; font-weight: 700;';
        tag.textContent = '尾';
        item.appendChild(tag);
      }

      arrBox.appendChild(item);
    });
    mainCard.appendChild(arrBox);

    // 底部区间比对天平
    if (step.intervalA && step.intervalB) {
      const balanceBox = document.createElement('div');
      balanceBox.style.cssText = 'flex: 1;';
      renderDecisionBalance(balanceBox, {
        leftTitle: `${step.intervalA.name} [${step.intervalA.l}..${step.intervalA.r}]`,
        leftVal: `0: ${step.intervalA.zeros}个, 1: ${step.intervalA.ones}个`,
        rightTitle: `${step.intervalB.name} [${step.intervalB.l}..${step.intervalB.r}]`,
        rightVal: `0: ${step.intervalB.zeros}个, 1: ${step.intervalB.ones}个`,
        winner: 'equal',
        reason: step.reasonText,
      });
      mainCard.appendChild(balanceBox);
    }

    stageContainer.appendChild(mainCard);
  },
});
