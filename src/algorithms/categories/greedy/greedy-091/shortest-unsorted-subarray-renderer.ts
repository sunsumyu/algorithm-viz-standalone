/**
 * 最短无序连续子数组 (LeetCode 581) - 声明式教学级沙盘渲染器
 * 核心贪心：双向极值扫描判定左右无序边界
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import {
  SHORTEST_UNSORTED_CODES,
  SHORTEST_UNSORTED_LINES,
} from './greedy-091-stage-codes';
import {
  Greedy091Step,
  renderArrayPointers,
  renderDecisionBalance,
} from './greedy-091-shared';

export interface ShortestUnsortedStep extends Greedy091Step {
  nums: number[];
  left: number;
  right: number;
  curIdx: number;
  direction: 'left-to-right' | 'right-to-left' | 'done';
  curExtreme: number; // max 或 min
  isViolation?: boolean;
}

export function buildShortestUnsortedSteps(nums: number[]): ShortestUnsortedStep[] {
  const steps: ShortestUnsortedStep[] = [];
  const lines = SHORTEST_UNSORTED_LINES;
  const n = nums.length;

  // Step 0: 入口
  steps.push({
    nums: [...nums],
    left: n,
    right: -1,
    curIdx: -1,
    direction: 'left-to-right',
    curExtreme: -Infinity,
    decision: `主函数入口：接收输入数组 nums=[${nums.join(', ')}]，长度 n=${n}`,
    message: '准备通过正逆双向线性扫描寻找最短无序子数组区间',
    log: `enter findUnsortedSubarray(nums=[${nums.join(',')}])`,
    codeLine: lines.entry,
  });

  // 正向扫描 (左往右) 找最右违规点 right
  let right = -1;
  let max = -Infinity;

  steps.push({
    nums: [...nums],
    left: n,
    right: -1,
    curIdx: 0,
    direction: 'left-to-right',
    curExtreme: max,
    decision: '初始化从左往右扫描指针，设定初始最大值 max = -∞，最右违规位置 right = -1',
    message: '从左往右寻找满足 nums[i] < max 的最右侧元素',
    log: 'init forward scan max=-inf right=-1',
    codeLine: lines.initRight,
  });

  for (let i = 0; i < n; i++) {
    const val = nums[i];
    const isViolated = max > val;
    if (isViolated) {
      right = i;
    } else {
      max = val;
    }

    steps.push({
      nums: [...nums],
      left: n,
      right,
      curIdx: i,
      direction: 'left-to-right',
      curExtreme: max,
      isViolation: isViolated,
      decision: isViolated
        ? `考察 nums[${i}]=${val} < 当前最大值 max=${max} ➔ 发生逆序！更新最右违规边界 right=${i}`
        : `考察 nums[${i}]=${val} >= 当前最大值 max ➔ 保持升序，更新 max=${max}`,
      message: `当前正向扫描历史最大值 max=${max}，当前最右违规点 right=${right}`,
      log: `scan right i=${i} val=${val} max=${max} right=${right}`,
      codeLine: lines.scanRight,
    });
  }

  // 逆向扫描 (右往左) 找最左违规点 left
  let left = n;
  let min = Infinity;

  steps.push({
    nums: [...nums],
    left: n,
    right,
    curIdx: n - 1,
    direction: 'right-to-left',
    curExtreme: min,
    decision: '初始化从右往左扫描指针，设定初始最小值 min = +∞，最左违规位置 left = n',
    message: '从右往左寻找满足 nums[i] > min 的最左侧元素',
    log: 'init backward scan min=+inf left=n',
    codeLine: lines.initLeft,
  });

  for (let i = n - 1; i >= 0; i--) {
    const val = nums[i];
    const isViolated = min < val;
    if (isViolated) {
      left = i;
    } else {
      min = val;
    }

    steps.push({
      nums: [...nums],
      left,
      right,
      curIdx: i,
      direction: 'right-to-left',
      curExtreme: min,
      isViolation: isViolated,
      decision: isViolated
        ? `考察 nums[${i}]=${val} > 当前最小值 min=${min} ➔ 发生逆序！更新最左违规边界 left=${i}`
        : `考察 nums[${i}]=${val} <= 当前最小值 min ➔ 保持降序，更新 min=${min}`,
      message: `当前逆向扫描历史最小值 min=${min}，当前最左违规点 left=${left}`,
      log: `scan left i=${i} val=${val} min=${min} left=${left}`,
      codeLine: lines.scanLeft,
    });
  }

  // 收敛返回
  const ans = right === -1 ? 0 : right - left + 1;
  steps.push({
    nums: [...nums],
    left,
    right,
    curIdx: -1,
    direction: 'done',
    curExtreme: 0,
    decision: right === -1
      ? '🎉 数组整体本身已有序，无需排序任何子数组，返回长度 0'
      : `🎉 双向扫描完毕！最短无序子数组区间为 [${left}, ${right}]，长度 = ${right} - ${left} + 1 = ${ans}`,
    message: `排序 nums[${left}..${right}] 即可使整个数组升序`,
    log: `done ans=${ans}`,
    codeLine: lines.done,
  });

  return steps;
}

export const shortestUnsortedSubarrayVisualizer = registerDeclarativeAlgorithm<ShortestUnsortedStep>({
  id: 'shortest-unsorted-continuous-subarray',
  name: '最短无序连续子数组 (Shortest Unsorted Subarray)',
  category: 'greedy',
  icon: '🔍',
  difficulty: 2,
  levelOrder: 911,
  learningGoal: '掌握双向最值扫描锁定无序边界的局部贪心原理',
  problemHtml: GREEDY_091_PROBLEMS.shortestUnsortedSubarray.html,
  analysisHtml: GREEDY_091_PROBLEMS.shortestUnsortedSubarray.html,
  inputs: [
    {
      id: 'input-nums',
      label: '输入数组 nums',
      type: 'text',
      defaultValue: '2, 6, 4, 8, 10, 9, 15',
      placeholder: '用逗号分隔，如 2, 6, 4, 8, 10, 9, 15',
    },
  ],
  codeLanguages: SHORTEST_UNSORTED_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-nums'] || '2, 6, 4, 8, 10, 9, 15');
    const nums = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildShortestUnsortedSteps(nums);
  },
  renderCanvas: (stageContainer: HTMLElement, step: ShortestUnsortedStep) => {
    stageContainer.innerHTML = '';

    // 1. 指针配置
    const pointers: { index: number; label: string; color: string }[] = [];
    if (step.curIdx >= 0) {
      pointers.push({
        index: step.curIdx,
        label: step.direction === 'left-to-right' ? '正向扫描 i' : '逆向扫描 i',
        color: '#3b82f6',
      });
    }
    if (step.left >= 0 && step.left < step.nums.length) {
      pointers.push({ index: step.left, label: 'L 边界', color: '#ef4444' });
    }
    if (step.right >= 0 && step.right < step.nums.length) {
      pointers.push({ index: step.right, label: 'R 边界', color: '#10b981' });
    }

    const highlightRange: [number, number] | undefined = (step.left <= step.right && step.right >= 0)
      ? [step.left, step.right]
      : undefined;

    // 2. 主容器卡片
    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态指标条
    const isForward = step.direction === 'left-to-right';
    const extremeText = step.direction === 'done'
      ? '扫描已完成'
      : (isForward ? `历史最大值 max = ${step.curExtreme === -Infinity ? '-∞' : step.curExtreme}` : `历史最小值 min = ${step.curExtreme === Infinity ? '+∞' : step.curExtreme}`);

    const badgeHtml = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">阶段: ${step.direction === 'left-to-right' ? '➡️ 正向扫描 (找最右 R)' : (step.direction === 'right-to-left' ? '⬅️ 逆向扫描 (找最左 L)' : '🎉 计算收敛')}</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; font-weight: 600;">${extremeText}</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 12px;">
          <span style="color: #ef4444; font-weight: 700;">Left: ${step.left === step.nums.length ? '未锁定' : step.left}</span>
          <span style="color: #64748b;">|</span>
          <span style="color: #10b981; font-weight: 700;">Right: ${step.right === -1 ? '未锁定' : step.right}</span>
        </div>
      </div>
    `;
    mainCard.innerHTML = badgeHtml;

    // 数组与指针区域
    const arrayBox = document.createElement('div');
    arrayBox.style.cssText = 'flex: 1; display: flex; align-items: center; justify-content: center; width: 100%;';
    renderArrayPointers(arrayBox, step.nums, pointers, highlightRange);
    mainCard.appendChild(arrayBox);

    // 底部天平卡片
    if (step.curIdx >= 0 && step.curIdx < step.nums.length) {
      const balanceBox = document.createElement('div');
      const curVal = step.nums[step.curIdx];
      if (isForward) {
        renderDecisionBalance(balanceBox, {
          leftTitle: `当前元素 nums[${step.curIdx}]`,
          leftVal: curVal,
          rightTitle: '历史前缀最大值 max',
          rightVal: step.curExtreme === -Infinity ? '-∞' : step.curExtreme,
          winner: step.isViolation ? 'left' : 'right',
          reason: step.isViolation ? `nums[${step.curIdx}] < max (违规逆序)` : `nums[${step.curIdx}] >= max (合规)`,
        });
      } else {
        renderDecisionBalance(balanceBox, {
          leftTitle: `当前元素 nums[${step.curIdx}]`,
          leftVal: curVal,
          rightTitle: '历史后缀最小值 min',
          rightVal: step.curExtreme === Infinity ? '+∞' : step.curExtreme,
          winner: step.isViolation ? 'left' : 'right',
          reason: step.isViolation ? `nums[${step.curIdx}] > min (违规逆序)` : `nums[${step.curIdx}] <= min (合规)`,
        });
      }
      mainCard.appendChild(balanceBox);
    }

    stageContainer.appendChild(mainCard);
  },
});
