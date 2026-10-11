import {
  MONOTONIC_NO_REPEAT_LINES,
} from './stack-052-stage-codes';
import {
  SettledItem,
} from './stack-052-shared';

export interface MonotonicNoRepeatStep {
  arr: number[];
  stack: number[];
  curI: number;
  popped: number | null;
  settled: SettledItem[];
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics: Record<string, string | number>;
}

export function buildMonotonicNoRepeatSteps(arr: number[]): MonotonicNoRepeatStep[] {
  const steps: MonotonicNoRepeatStep[] = [];
  const lines = MONOTONIC_NO_REPEAT_LINES;
  const n = arr.length;

  if (n === 0) {
    steps.push({
      arr: [],
      stack: [],
      curI: 0,
      popped: null,
      settled: [],
      decision: '数组为空，直接返回空结果。',
      message: '输入规模 N=0，无需推演。',
      log: 'Array is empty',
      codeLine: lines.returnAns,
      metrics: { '规模 N': 0, '已结算': 0 },
    });
    return steps;
  }

  const stack: number[] = [];
  const settledMap = new Map<number, SettledItem>();

  const getSettledList = (): SettledItem[] => {
    return Array.from(settledMap.values()).sort((a, b) => a.idx - b.idx);
  };

  // Step 0: 入口
  steps.push({
    arr: [...arr],
    stack: [],
    curI: -1,
    popped: null,
    settled: [],
    decision: `主函数入口：开始为数组 [${arr.join(', ')}] 求解每个元素左右最近较小值。`,
    message: '初始化底到顶单调递增栈，用来存放数组下标。每个元素严格入栈一次、出栈一次。',
    log: `monotonic stack entry, N=${n}`,
    codeLine: lines.entry,
    metrics: { '数组规模': n, '当前下标 i': '未开始', '栈内元素': '空', '已结算': 0 },
  });

  // Step 1: 声明结果与栈
  steps.push({
    arr: [...arr],
    stack: [],
    curI: -1,
    popped: null,
    settled: [],
    decision: `声明 ans 矩阵用于存储每个位置的 [左较小, 右较小] 下标，准备遍历。`,
    message: '栈内存储下标，对应的值严格保持单调递增。',
    log: 'init ans array and empty stack',
    codeLine: lines.init,
    metrics: { '数组规模': n, '栈容量': 0, '已结算': 0 },
  });

  for (let i = 0; i < n; i++) {
    const curVal = arr[i];

    // 考察当前元素
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: i,
      popped: null,
      settled: getSettledList(),
      decision: `遍历到下标 [${i}]，值为 ${curVal}。检查是否破坏栈顶的单调递增性。`,
      message: stack.length > 0
        ? `比较当前值 arr[${i}]=${curVal} 与栈顶 arr[${stack[stack.length - 1]}]=${arr[stack[stack.length - 1]]}。`
        : '当前栈为空，无需比较，直接准备入栈。',
      log: `inspecting i=${i}, val=${curVal}`,
      codeLine: lines.forLoop,
      metrics: { '当前下标': `[${i}]`, '当前值': curVal, '栈顶下标': stack.length > 0 ? `[${stack[stack.length - 1]}]` : '无' },
    });

    // 弹出破坏单调性的元素
    while (stack.length > 0 && arr[stack[stack.length - 1]] >= curVal) {
      const topIdx = stack[stack.length - 1];
      const topVal = arr[topIdx];

      steps.push({
        arr: [...arr],
        stack: [...stack],
        curI: i,
        popped: topIdx,
        settled: getSettledList(),
        decision: `发现 arr[栈顶 ${topIdx}]=${topVal} >= arr[${i}]=${curVal}，破坏递增单调性！触发结算出栈。`,
        message: `当前元素 ${curVal} 是栈顶元素 ${topVal} 右侧第一个比它小的数。`,
        log: `violation: arr[${topIdx}]=${topVal} >= arr[${i}]=${curVal}`,
        codeLine: lines.whileCheck,
        metrics: { '触发值': curVal, '被挤出': `[${topIdx}]=${topVal}` },
      });

      const cur = stack.pop()!;
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const right = i;

      const item: SettledItem = {
        idx: cur,
        val: arr[cur],
        left,
        right,
        detail: `右侧更小由 [${right}] (值=${arr[right]}) 触发出栈；左侧更小为其在栈中的下方元素 ${left !== -1 ? `[${left}] (值=${arr[left]})` : '无 (-1)'}。`,
      };
      settledMap.set(cur, item);

      steps.push({
        arr: [...arr],
        stack: [...stack],
        curI: i,
        popped: cur,
        settled: getSettledList(),
        decision: `🎯 结算 [${cur}] (值=${topVal})：左侧较小为 ${left !== -1 ? `[${left}] (值=${arr[left]})` : '无 (-1)'}，右侧较小为 [${right}] (值=${arr[right]})。`,
        message: `栈中位于 [${cur}] 底下的元素天然是它左侧最近较小值；把 [${cur}] 顶出去的 [${right}] 是其右侧最近较小值。`,
        log: `settle idx ${cur} (val ${topVal}): left=${left}, right=${right}`,
        codeLine: lines.popResolve,
        metrics: { '结算下标': `[${cur}]`, '左较小': left, '右较小': right, '剩余栈深': stack.length },
      });
    }

    // 入栈
    stack.push(i);
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: i,
      popped: null,
      settled: getSettledList(),
      decision: `将下标 [${i}] (值=${curVal}) 压入单调栈。`,
      message: '单调性已满足，新元素入栈等待后续元素的右侧较小值结算。',
      log: `push idx ${i} (val ${curVal}) to stack`,
      codeLine: lines.push,
      metrics: { '入栈下标': `[${i}]`, '栈深': stack.length },
    });
  }

  // 清算阶段
  if (stack.length > 0) {
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: n,
      popped: null,
      settled: getSettledList(),
      decision: '数组遍历完毕，进入清算阶段（Clear Phase）。',
      message: '栈中剩余元素在整个数组右侧均无更小值，右侧最近较小标记为 -1。',
      log: 'enter clear phase for remaining stack elements',
      codeLine: lines.clearStack,
      metrics: { '待清算数量': stack.length },
    });

    while (stack.length > 0) {
      const cur = stack.pop()!;
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const curPopVal = arr[cur];

      const item: SettledItem = {
        idx: cur,
        val: curPopVal,
        left,
        right: -1,
        detail: `清算阶段出栈：右侧无更小值 (-1)；左侧更小为其在栈中的下方元素 ${left !== -1 ? `[${left}] (值=${arr[left]})` : '无 (-1)'}。`,
      };
      settledMap.set(cur, item);

      steps.push({
        arr: [...arr],
        stack: [...stack],
        curI: n,
        popped: cur,
        settled: getSettledList(),
        decision: `🧹 清算弹出 [${cur}] (值=${curPopVal})：左侧更小为 ${left !== -1 ? `[${left}] (值=${arr[left]})` : '无 (-1)'}，右侧更小为 无 (-1)。`,
        message: `元素 [${cur}] 在后续数组中未被任何更小值破坏，安全清算出栈。`,
        log: `clear pop idx ${cur} (val ${curPopVal}): left=${left}, right=-1`,
        codeLine: lines.clearPop,
        metrics: { '结算下标': `[${cur}]`, '左较小': left, '右较小': -1, '剩余栈深': stack.length },
      });
    }
  }

  // 终结
  steps.push({
    arr: [...arr],
    stack: [],
    curI: n,
    popped: null,
    settled: getSettledList(),
    decision: '🎉 全量结算完成！所有元素左右最近较小值已全部确定。',
    message: `每个元素进栈一次、出栈一次，时间复杂度严格为 O(N)。`,
    log: 'all items settled successfully',
    codeLine: lines.returnAns,
    metrics: { '总规模': n, '已结算': n, '复杂度': 'O(N)' },
  });

  return steps;
}
