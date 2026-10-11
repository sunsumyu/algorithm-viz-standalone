import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface NGE2Step {
  nums: number[];
  currentIndex: number; // 0 到 2n-1
  actualIndex: number;  // currentIndex % n
  lap: number;          // 0 = 第 1 轮, 1 = 第 2 轮
  stack: number[];      // 存储实际下标
  result: number[];
  poppedIndex: number | null;
  action: 'init' | 'scan' | 'pop_resolve' | 'push' | 'done';
  message: string;
  codeLine: HighlightTarget;
  log?: string;
  metrics?: Record<string, string>;
}

export function buildNextGreaterElementIISteps(rawNums: number[]): NGE2Step[] {
  const steps: NGE2Step[] = [];
  const n = rawNums.length;

  const lines = {
    init: { java: [3, 5], cpp: [4, 6], python: [3, 5], javascript: [3, 4] },
    scan: { java: [7, 8], cpp: [7, 8], python: [6, 7], javascript: [5, 6] },
    popResolve: { java: 9, cpp: [9, 10], python: 8, javascript: 7 },
    push: { java: 11, cpp: 12, python: 9, javascript: 9 },
    done: { java: 13, cpp: 14, python: 10, javascript: 11 },
  };

  if (n === 0) {
    steps.push({
      nums: [],
      currentIndex: -1,
      actualIndex: -1,
      lap: 0,
      stack: [],
      result: [],
      poppedIndex: null,
      action: 'done',
      message: '输入数组为空，返回空数组',
      codeLine: lines.done,
    });
    return steps;
  }

  const result = new Array(n).fill(-1);
  const stack: number[] = [];

  steps.push({
    nums: [...rawNums],
    currentIndex: -1,
    actualIndex: -1,
    lap: 0,
    stack: [],
    result: [...result],
    poppedIndex: null,
    action: 'init',
    message: `初始化：共 ${n} 个元素，结果数组全置 -1，通过模拟 2 轮遍历 (0 &rarr; ${2 * n - 1}) 处理循环边界`,
    codeLine: lines.init,
  });

  for (let i = 0; i < 2 * n; i++) {
    const idx = i % n;
    const lap = i < n ? 0 : 1;
    const curVal = rawNums[idx];

    steps.push({
      nums: [...rawNums],
      currentIndex: i,
      actualIndex: idx,
      lap,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'scan',
      message: `🔁 模拟步数 [${i}] (第 ${lap + 1} 轮, 实际下标 [${idx}], 值 ${curVal})：与栈顶 ${stack.length > 0 ? `下标 [${stack[stack.length - 1]}] (${rawNums[stack[stack.length - 1]]})` : '（栈空）'} 比对`,
      codeLine: lines.scan,
    });

    while (stack.length > 0 && curVal > rawNums[stack[stack.length - 1]]) {
      const topIdx = stack.pop()!;
      result[topIdx] = curVal;

      steps.push({
        nums: [...rawNums],
        currentIndex: i,
        actualIndex: idx,
        lap,
        stack: [...stack],
        result: [...result],
        poppedIndex: topIdx,
        action: 'pop_resolve',
        message: `🔥 循环破局！下标 [${idx}] (${curVal}) > 栈顶下标 [${topIdx}] (${rawNums[topIdx]})！设置 res[${topIdx}] = ${curVal}，出栈！`,
        codeLine: lines.popResolve,
      });
    }

    stack.push(idx);

    steps.push({
      nums: [...rawNums],
      currentIndex: i,
      actualIndex: idx,
      lap,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'push',
      message: `📥 将下标 [${idx}] (值 ${curVal}) 压入单调栈，维持单调递减`,
      codeLine: lines.push,
    });
  }

  steps.push({
    nums: [...rawNums],
    currentIndex: 2 * n - 1,
    actualIndex: n - 1,
    lap: 1,
    stack: [...stack],
    result: [...result],
    poppedIndex: null,
    action: 'done',
    message: `🎉 2 轮循环遍历结算完成！最终循环下一个更大元素数组：[${result.join(', ')}]`,
    codeLine: lines.done,
  });

  return steps;
}

export function withMetrics(steps: NGE2Step[]): NGE2Step[] {
  return steps.map((s) => {
    const n = s.nums.length;
    const topIdx = s.stack.length > 0 ? s.stack[s.stack.length - 1] : null;
    const resolvedCount = s.result.filter((r) => r !== -1).length;

    let action = '🔍 比对栈顶';
    if (s.action === 'pop_resolve') action = `🔥 循环找到更大值 (res[${s.poppedIndex}] = ${s.result[s.poppedIndex ?? 0]})`;
    else if (s.action === 'push') action = '📥 压入栈顶 (维持单调递减)';
    else if (s.action === 'done') action = '🎉 完成';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      log: s.message,
      metrics: {
        'loop-idx': s.currentIndex >= 0 ? `i=${s.currentIndex} &rarr; [${s.actualIndex}] (值 ${s.nums[s.actualIndex]})` : '—',
        'stack-top': topIdx !== null ? `[${topIdx}] (值 ${s.nums[topIdx]})` : '（栈空）',
        resolved: `已确定 ${resolvedCount} / ${n} 个`,
        result: `[${s.result.join(', ')}]`,
        action,
      },
    };
  });
}
