import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface HeapItem {
  num: number;
  freq: number;
}

export interface TKFStep {
  nums: number[];
  k: number;
  freqMap: Map<number, number>;
  heap: HeapItem[];
  currentEntry: { num: number; freq: number } | null;
  poppedRoot: HeapItem | null;
  result: number[];
  action: 'init' | 'count_freq' | 'heap_push' | 'heap_poll_min' | 'collect_result' | 'done';
  message: string;
  codeLine: HighlightTarget;
}

export function buildTopKFrequentSteps(rawNums: number[], k: number): TKFStep[] {
  const steps: TKFStep[] = [];
  const nums = [...rawNums];
  const n = nums.length;

  const lines = {
    init:          { java: 2,  cpp: 4,  python: 6,  javascript: 2 },
    heapPush:      { java: 7,  cpp: 9,  python: 10, javascript: 3 },
    heapPollMin:   { java: 9,  cpp: 10, python: 12, javascript: 6 },
    collectResult: { java: 14, cpp: 14, python: 13, javascript: 7 },
    done:          { java: 16, cpp: 17, python: 13, javascript: 8 },
  };

  if (n === 0 || k <= 0) {
    steps.push({
      nums: [],
      k,
      freqMap: new Map(),
      heap: [],
      currentEntry: null,
      poppedRoot: null,
      result: [],
      action: 'done',
      message: '输入无效或 k <= 0',
      codeLine: lines.done,
    });
    return steps;
  }

  // 1. 统计频率
  const freqMap = new Map<number, number>();
  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  steps.push({
    nums: [...nums],
    k,
    freqMap: new Map(freqMap),
    heap: [],
    currentEntry: null,
    poppedRoot: null,
    result: [],
    action: 'init',
    message: `初始化：共 ${n} 个元素，统计得到 ${freqMap.size} 个不同元素的出现频次，准备建立容量为 k=${k} 的小顶堆`,
    codeLine: lines.init,
  });

  // 2. 维护大小为 k 的小顶堆
  const heap: HeapItem[] = [];

  const heapPush = (item: HeapItem) => {
    heap.push(item);
    heap.sort((a, b) => a.freq - b.freq);
  };

  const heapPoll = (): HeapItem => {
    return heap.shift()!;
  };

  for (const [num, freq] of freqMap.entries()) {
    heapPush({ num, freq });

    steps.push({
      nums: [...nums],
      k,
      freqMap: new Map(freqMap),
      heap: [...heap],
      currentEntry: { num, freq },
      poppedRoot: null,
      result: [],
      action: 'heap_push',
      message: `📥 将元素 [值:${num}, 频次:${freq}] 压入小顶堆。当前堆大小: ${heap.length} / ${k}`,
      codeLine: lines.heapPush,
    });

    if (heap.length > k) {
      const min = heapPoll();
      steps.push({
        nums: [...nums],
        k,
        freqMap: new Map(freqMap),
        heap: [...heap],
        currentEntry: { num, freq },
        poppedRoot: min,
        result: [],
        action: 'heap_poll_min',
        message: `💥 堆大小达到 ${k + 1} 超出限制！弹出当前堆顶最小频次元素 [值:${min.num}, 频次:${min.freq}]，保留较高频元素`,
        codeLine: lines.heapPollMin,
      });
    }
  }

  // 3. 收集结果
  const result: number[] = [];
  const tempHeap = [...heap];
  while (tempHeap.length > 0) {
    result.unshift(tempHeap.shift()!.num);
  }

  steps.push({
    nums: [...nums],
    k,
    freqMap: new Map(freqMap),
    heap: [...heap],
    currentEntry: null,
    poppedRoot: null,
    result: [...result],
    action: 'collect_result',
    message: `🥇 遍历完毕！堆内留存的 ${heap.length} 个元素即为全数组出现频次最高的前 ${k} 个元素`,
    codeLine: lines.collectResult,
  });

  steps.push({
    nums: [...nums],
    k,
    freqMap: new Map(freqMap),
    heap: [...heap],
    currentEntry: null,
    poppedRoot: null,
    result: [...result],
    action: 'done',
    message: `🎉 前 K 个高频元素计算完成！最终输出结果: [${result.join(', ')}]`,
    codeLine: lines.done,
  });

  return steps;
}
