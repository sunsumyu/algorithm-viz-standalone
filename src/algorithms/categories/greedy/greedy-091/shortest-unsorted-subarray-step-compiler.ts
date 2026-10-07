import { SHORTEST_UNSORTED_LINES } from './greedy-091-stage-codes';
import { Greedy091Step } from './greedy-091-shared';

export interface ShortestUnsortedStep extends Greedy091Step {
  line?: number;
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
    line: (lines.entry as any).java ?? 1,
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
    line: (lines.initRight as any).java ?? 3,
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
      line: (lines.scanRight as any).java ?? 5,
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
    line: (lines.initLeft as any).java ?? 8,
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
      line: (lines.scanLeft as any).java ?? 10,
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
    line: (lines.done as any).java ?? 13,
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

export function parseShortestUnsortedInputs(inputs: Record<string, any>): number[] {
  const raw = String(inputs?.['input-nums'] || '2, 6, 4, 8, 10, 9, 15');
  return raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
}
