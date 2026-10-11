import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface NGE1Step {
  nums1: number[];
  nums2: number[];
  stack: number[]; // 存储数字本身
  nextGreaterMap: Record<number, number>;
  currentIndex2: number;
  queryIndex1: number;
  answers: number[];
  action: 'init' | 'scan_nums2' | 'pop_map' | 'push_nums2' | 'query_nums1' | 'done';
  message: string;
  codeLine: HighlightTarget;
  log?: string;
  metrics?: Record<string, string>;
}

export function buildNextGreaterElementISteps(nums1: number[], nums2: number[]): NGE1Step[] {
  const steps: NGE1Step[] = [];
  const n2 = nums2.length;
  const n1 = nums1.length;

  const lines = {
    init: { java: [2, 3], cpp: [4, 5], python: [3, 4], javascript: [2, 3] },
    scanNums2: { java: [5, 6], cpp: [6, 7], python: [5, 6], javascript: [4, 5] },
    popMap: { java: 7, cpp: [8, 9], python: 7, javascript: 6 },
    pushNums2: { java: 9, cpp: 11, python: 8, javascript: 8 },
    queryNums1: { java: [13, 14], cpp: [14, 16], python: [10, 11], javascript: [11, 12] },
    done: { java: 16, cpp: 19, python: 12, javascript: 14 },
  };

  if (n1 === 0 || n2 === 0) {
    steps.push({
      nums1,
      nums2,
      stack: [],
      nextGreaterMap: {},
      currentIndex2: -1,
      queryIndex1: -1,
      answers: [],
      action: 'done',
      message: '输入数组为空，返回空数组',
      codeLine: lines.done,
    });
    return steps;
  }

  const stack: number[] = [];
  const nextGreaterMap: Record<number, number> = {};

  steps.push({
    nums1: [...nums1],
    nums2: [...nums2],
    stack: [],
    nextGreaterMap: {},
    currentIndex2: -1,
    queryIndex1: -1,
    answers: [],
    action: 'init',
    message: `阶段 1：初始化单调栈与哈希表，准备遍历母集 nums2=[${nums2.join(', ')}] 构建全量下一个更大元素映射`,
    codeLine: lines.init,
  });

  // 1. 遍历 nums2 构建映射
  for (let j = 0; j < n2; j++) {
    const cur = nums2[j];

    steps.push({
      nums1: [...nums1],
      nums2: [...nums2],
      stack: [...stack],
      nextGreaterMap: { ...nextGreaterMap },
      currentIndex2: j,
      queryIndex1: -1,
      answers: [],
      action: 'scan_nums2',
      message: `🔍 nums2 考察 [${j}]: 值 ${cur}，与单调栈顶 ${stack.length > 0 ? stack[stack.length - 1] : '（栈空）'} 比对`,
      codeLine: lines.scanNums2,
    });

    while (stack.length > 0 && cur > stack[stack.length - 1]) {
      const top = stack.pop()!;
      nextGreaterMap[top] = cur;

      steps.push({
        nums1: [...nums1],
        nums2: [...nums2],
        stack: [...stack],
        nextGreaterMap: { ...nextGreaterMap },
        currentIndex2: j,
        queryIndex1: -1,
        answers: [],
        action: 'pop_map',
        message: `🔥 弹出栈顶 ${top}！确立映射：${top} &rarr; 右侧首个更大元素为 ${cur}！`,
        codeLine: lines.popMap,
      });
    }

    stack.push(cur);

    steps.push({
      nums1: [...nums1],
      nums2: [...nums2],
      stack: [...stack],
      nextGreaterMap: { ...nextGreaterMap },
      currentIndex2: j,
      queryIndex1: -1,
      answers: [],
      action: 'push_nums2',
      message: `📥 将 ${cur} 压入单调栈，维持栈内单调递减`,
      codeLine: lines.pushNums2,
    });
  }

  // 栈中剩余元素映射为 -1
  while (stack.length > 0) {
    const rem = stack.pop()!;
    nextGreaterMap[rem] = -1;
  }

  // 2. 遍历 nums1 查表
  const answers: number[] = [];
  for (let i = 0; i < n1; i++) {
    const queryVal = nums1[i];
    const ans = nextGreaterMap[queryVal] ?? -1;
    answers.push(ans);

    steps.push({
      nums1: [...nums1],
      nums2: [...nums2],
      stack: [],
      nextGreaterMap: { ...nextGreaterMap },
      currentIndex2: -1,
      queryIndex1: i,
      answers: [...answers],
      action: 'query_nums1',
      message: `📋 阶段 2：查询 nums1[${i}] = ${queryVal}，查哈希表得下一个更大元素为 ${ans === -1 ? '-1 (无)' : ans}，写入结果`,
      codeLine: lines.queryNums1,
    });
  }

  steps.push({
    nums1: [...nums1],
    nums2: [...nums2],
    stack: [],
    nextGreaterMap: { ...nextGreaterMap },
    currentIndex2: -1,
    queryIndex1: n1 - 1,
    answers: [...answers],
    action: 'done',
    message: `🎉 查询完毕！nums1 对应的下一个更大元素最终结果数组为：[${answers.join(', ')}]`,
    codeLine: lines.done,
  });

  return steps;
}

export function withMetrics(steps: NGE1Step[]): NGE1Step[] {
  return steps.map((s) => {
    const isScanNums2 = s.action === 'scan_nums2' || s.action === 'pop_map' || s.action === 'push_nums2';
    const cur2 = s.currentIndex2 >= 0 && s.currentIndex2 < s.nums2.length ? s.nums2[s.currentIndex2] : null;
    const cur1 = s.queryIndex1 >= 0 && s.queryIndex1 < s.nums1.length ? s.nums1[s.queryIndex1] : null;

    let action = '🔍 准备就绪';
    if (s.action === 'pop_map') action = '🔥 出栈确立哈希映射';
    else if (s.action === 'push_nums2') action = '📥 压栈 (维护单调递减)';
    else if (s.action === 'query_nums1') action = '📋 查表填入答案';
    else if (s.action === 'done') action = '🎉 完成';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-elem': isScanNums2 && cur2 !== null ? `nums2[${s.currentIndex2}] = ${cur2}` : cur1 !== null ? `nums1[${s.queryIndex1}] = ${cur1}` : '—',
        'stack-top': s.stack.length > 0 ? `${s.stack[s.stack.length - 1]}` : '（栈空）',
        'map-size': `${Object.keys(s.nextGreaterMap).length} 个`,
        answers: `[${s.answers.join(', ')}]`,
        action,
      },
    };
  });
}
