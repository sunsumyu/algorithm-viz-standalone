import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface SWMStep {
  nums: number[];
  k: number;
  currentIndex: number;
  windowLeft: number;
  windowRight: number;
  deque: number[];
  result: number[];
  outVal: number | null;
  inVal: number | null;
  poppedBackVals: number[];
  action: 'init' | 'init_window' | 'slide_out' | 'slide_in' | 'record_max' | 'done';
  message: string;
  codeLine: HighlightTarget;
}

export function buildSlidingWindowMaxSteps(rawNums: number[], k: number): SWMStep[] {
  const steps: SWMStep[] = [];
  const nums = [...rawNums];
  const n = nums.length;

  const lines = {
    init:       { java: 21, cpp: 16, python: 18, javascript: 15 },
    initWindow: { java: 23, cpp: 18, python: 20, javascript: 17 },
    recordMax:  { java: 24, cpp: 19, python: 21, javascript: 18 },
    slideOut:   { java: 26, cpp: 21, python: 23, javascript: 20 },
    slideIn:    { java: 27, cpp: 22, python: 24, javascript: 21 },
    recordMax2: { java: 28, cpp: 23, python: 25, javascript: 22 },
    done:       { java: 30, cpp: 25, python: 26, javascript: 24 },
  };

  if (n === 0 || k <= 0 || k > n) {
    steps.push({
      nums: [],
      k,
      currentIndex: -1,
      windowLeft: 0,
      windowRight: -1,
      deque: [],
      result: [],
      outVal: null,
      inVal: null,
      poppedBackVals: [],
      action: 'done',
      message: '输入无效或窗口大小超出数组长度',
      codeLine: lines.done,
    });
    return steps;
  }

  const deque: number[] = [];
  const result: number[] = [];

  const dequeAdd = (val: number): number[] => {
    const popped: number[] = [];
    while (deque.length > 0 && val > deque[deque.length - 1]) {
      popped.push(deque.pop()!);
    }
    deque.push(val);
    return popped;
  };

  const dequePoll = (val: number): boolean => {
    if (deque.length > 0 && val === deque[0]) {
      deque.shift();
      return true;
    }
    return false;
  };

  steps.push({
    nums: [...nums],
    k,
    currentIndex: -1,
    windowLeft: 0,
    windowRight: -1,
    deque: [],
    result: [],
    outVal: null,
    inVal: null,
    poppedBackVals: [],
    action: 'init',
    message: `初始化：数组长度 ${n}，窗口大小 k = ${k}。准备使用单调队列维护窗口最大值`,
    codeLine: lines.init,
  });

  // 1. 初始化前 k 个元素
  for (let i = 0; i < k; i++) {
    const num = nums[i];
    const popped = dequeAdd(num);

    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: 0,
      windowRight: i,
      deque: [...deque],
      result: [...result],
      outVal: null,
      inVal: num,
      poppedBackVals: popped,
      action: 'init_window',
      message:
        popped.length > 0
          ? `📥 压入元素 nums[${i}]=${num}，单调性维护：淘汰队尾较小元素 [${popped.join(', ')}]`
          : `📥 压入元素 nums[${i}]=${num} 到单调队列`,
      codeLine: lines.initWindow,
    });
  }

  result.push(deque[0]);
  steps.push({
    nums: [...nums],
    k,
    currentIndex: k - 1,
    windowLeft: 0,
    windowRight: k - 1,
    deque: [...deque],
    result: [...result],
    outVal: null,
    inVal: null,
    poppedBackVals: [],
    action: 'record_max',
    message: `🥇 初始窗口 [0..${k - 1}] 构建完毕，队头元素 ${deque[0]} 即为窗口最大值，加入结果列表`,
    codeLine: lines.recordMax,
  });

  // 2. 窗口向右滑动
  for (let i = k; i < n; i++) {
    const removeVal = nums[i - k];
    const addVal = nums[i];

    // 移出窗口左侧
    const polled = dequePoll(removeVal);
    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: i - k + 1,
      windowRight: i - 1,
      deque: [...deque],
      result: [...result],
      outVal: removeVal,
      inVal: null,
      poppedBackVals: [],
      action: 'slide_out',
      message: polled
        ? `🚪 窗口右移：移出左边界元素 nums[${i - k}]=${removeVal}，恰为当前队头，从队列弹出`
        : `🚪 窗口右移：移出左边界元素 nums[${i - k}]=${removeVal}，早已被淘汰不在队列中，无需操作`,
      codeLine: lines.slideOut,
    });

    // 移入窗口右侧
    const popped = dequeAdd(addVal);
    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: i - k + 1,
      windowRight: i,
      deque: [...deque],
      result: [...result],
      outVal: null,
      inVal: addVal,
      poppedBackVals: popped,
      action: 'slide_in',
      message:
        popped.length > 0
          ? `📥 移入右边界元素 nums[${i}]=${addVal}，淘汰队尾较小元素 [${popped.join(', ')}]，维持递减`
          : `📥 移入右边界元素 nums[${i}]=${addVal} 到单调队列`,
      codeLine: lines.slideIn,
    });

    // 记录最大值
    result.push(deque[0]);
    steps.push({
      nums: [...nums],
      k,
      currentIndex: i,
      windowLeft: i - k + 1,
      windowRight: i,
      deque: [...deque],
      result: [...result],
      outVal: null,
      inVal: null,
      poppedBackVals: [],
      action: 'record_max',
      message: `🥇 窗口 [${i - k + 1}..${i}] 最大值为队头 ${deque[0]}，加入结果列表: [${result.join(', ')}]`,
      codeLine: lines.recordMax2,
    });
  }

  steps.push({
    nums: [...nums],
    k,
    currentIndex: n,
    windowLeft: n - k,
    windowRight: n - 1,
    deque: [...deque],
    result: [...result],
    outVal: null,
    inVal: null,
    poppedBackVals: [],
    action: 'done',
    message: `🎉 滑动窗口最大值计算完成！最终收集数组: [${result.join(', ')}]`,
    codeLine: lines.done,
  });

  return steps;
}
