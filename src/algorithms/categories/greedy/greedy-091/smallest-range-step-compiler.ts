import { SMALLEST_RANGE_LINES } from './greedy-091-stage-codes';
import { Greedy091Step } from './greedy-091-shared';

export interface HeapItem {
  val: number;
  listIdx: number;
  elemIdx: number;
}

export interface SmallestRangeStep extends Greedy091Step {
  line?: number;
  lists: number[][];
  heap: HeapItem[];
  maxVal: number;
  ansL: number;
  ansR: number;
  poppedItem?: HeapItem;
  pushedItem?: HeapItem;
  isNewBest?: boolean;
}

export function buildSmallestRangeSteps(lists: number[][]): SmallestRangeStep[] {
  const steps: SmallestRangeStep[] = [];
  const lines = SMALLEST_RANGE_LINES;
  const k = lists.length;

  // Step 0: 入口
  steps.push({
    line: (lines.entry as any).java ?? 1,
    lists: lists.map(l => [...l]),
    heap: [],
    maxVal: -Infinity,
    ansL: 0,
    ansR: Infinity,
    decision: `主函数入口：接收 k=${k} 个有序列表，准备初始化小顶堆`,
    message: '从小顶堆维护每个列表的当前候选元素，同时追踪当前堆中所有元素的最大值',
    log: `enter smallestRange(k=${k})`,
    codeLine: lines.entry,
  });

  // Step 1: 初始化堆与 maxVal
  const heap: HeapItem[] = [];
  let maxVal = -Infinity;
  for (let i = 0; i < k; i++) {
    const val = lists[i][0];
    heap.push({ val, listIdx: i, elemIdx: 0 });
    if (val > maxVal) maxVal = val;
  }
  heap.sort((a, b) => a.val - b.val);

  let ansL = 0;
  let ansR = Infinity;

  steps.push({
    line: (lines.initHeap as any).java ?? 5,
    lists: lists.map(l => [...l]),
    heap: heap.map(item => ({ ...item })),
    maxVal,
    ansL,
    ansR,
    decision: `初始化小顶堆：填入 ${k} 个列表首项 [${heap.map(h => h.val).join(', ')}]，当前最大值 maxVal=${maxVal}`,
    message: `当前首个区间为 [${heap[0].val}, ${maxVal}]，跨度 = ${maxVal - heap[0].val}`,
    log: `init heap with ${k} elements, maxVal=${maxVal}`,
    codeLine: lines.initHeap,
  });

  // 核心循环：不断弹出最小值并补充后继
  while (heap.length === k) {
    // 弹出堆顶最小值
    heap.sort((a, b) => a.val - b.val);
    const cur = heap.shift()!;
    const curSpan = maxVal - cur.val;
    const bestSpan = ansR - ansL;
    const isNewBest = curSpan < bestSpan;

    if (isNewBest) {
      ansL = cur.val;
      ansR = maxVal;
    }

    steps.push({
      line: isNewBest ? ((lines.checkAns as any).java ?? 11) : ((lines.popMin as any).java ?? 10),
      lists: lists.map(l => [...l]),
      heap: heap.map(item => ({ ...item })),
      maxVal,
      ansL,
      ansR,
      poppedItem: { ...cur },
      isNewBest,
      decision: isNewBest
        ? `弹出堆顶最小值 ${cur.val} (来自列表 #${cur.listIdx})，当前候选区间 [${cur.val}, ${maxVal}] 跨度 ${curSpan} < 历史最佳 ${bestSpan === Infinity ? '∞' : bestSpan} ➔ 刷新全局最优解！`
        : `弹出堆顶最小值 ${cur.val} (来自列表 #${cur.listIdx})，当前候选区间 [${cur.val}, ${maxVal}] 跨度 ${curSpan} >= 历史最佳 ${bestSpan} ➔ 保持原解`,
      message: `当前全局最优区间: [${ansL}, ${ansR}] (跨度 ${ansR - ansL})`,
      log: `pop min=${cur.val} list=${cur.listIdx} span=${curSpan} newBest=${isNewBest}`,
      codeLine: isNewBest ? lines.checkAns : lines.popMin,
    });

    // 检查是否有下一个元素
    if (cur.elemIdx + 1 < lists[cur.listIdx].length) {
      const nextVal = lists[cur.listIdx][cur.elemIdx + 1];
      const nextItem: HeapItem = { val: nextVal, listIdx: cur.listIdx, elemIdx: cur.elemIdx + 1 };
      heap.push(nextItem);
      if (nextVal > maxVal) maxVal = nextVal;
      heap.sort((a, b) => a.val - b.val);

      steps.push({
        line: (lines.pushNext as any).java ?? 16,
        lists: lists.map(l => [...l]),
        heap: heap.map(item => ({ ...item })),
        maxVal,
        ansL,
        ansR,
        pushedItem: { ...nextItem },
        decision: `压入列表 #${cur.listIdx} 的下一项 ${nextVal} 到小顶堆，更新 maxVal=max(${maxVal}, ${nextVal})=${maxVal}`,
        message: `当前堆容量恢复为 ${heap.length}，准备进入下一轮极值探测`,
        log: `push next=${nextVal} list=${cur.listIdx} newMax=${maxVal}`,
        codeLine: lines.pushNext,
      });
    } else {
      steps.push({
        line: (lines.done as any).java ?? 20,
        lists: lists.map(l => [...l]),
        heap: heap.map(item => ({ ...item })),
        maxVal,
        ansL,
        ansR,
        decision: `列表 #${cur.listIdx} 元素已全部遍历耗尽！无法再包含该列表的数值，算法终止`,
        message: `最终收敛全局最小区间: [${ansL}, ${ansR}]`,
        log: `list #${cur.listIdx} exhausted, terminating`,
        codeLine: lines.done,
      });
      break;
    }
  }

  // 最终收敛帧
  steps.push({
    line: (lines.done as any).java ?? 20,
    lists: lists.map(l => [...l]),
    heap: heap.map(item => ({ ...item })),
    maxVal,
    ansL,
    ansR,
    decision: `🎉 推演完成！包含每个列表至少一个数的全局最小区间为 [${ansL}, ${ansR}] (跨度 = ${ansR - ansL})`,
    message: '算法成功收敛',
    log: `done ans=[${ansL},${ansR}]`,
    codeLine: lines.done,
  });

  return steps;
}
