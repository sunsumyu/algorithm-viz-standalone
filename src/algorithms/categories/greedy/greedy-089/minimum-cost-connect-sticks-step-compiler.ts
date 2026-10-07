import {
  CONNECT_STICKS_STAGE1_LINES,
  CONNECT_STICKS_STAGE2_LINES,
  CONNECT_STICKS_STAGE3_LINES,
} from './greedy-089-stage-codes';
import {
  Greedy089Step,
  HeapVisualItem,
  SimpleHeap,
} from './greedy-089-shared';

export interface MergeHistoryNode {
  val: number;
  label: string;
  leftVal?: number;
  rightVal?: number;
}

export interface ConnectSticksStep extends Greedy089Step {
  heap: HeapVisualItem[];
  totalCost: number;
  poppedA?: number;
  poppedB?: number;
  mergedCost?: number;
  mergeHistory: MergeHistoryNode[];
}

export function buildConnectSticksStage1Steps(rawSticks: number[]): ConnectSticksStep[] {
  const steps: ConnectSticksStep[] = [];
  const lines = CONNECT_STICKS_STAGE1_LINES;

  steps.push({
    heap: rawSticks.map((s) => ({ val: s, label: String(s) })),
    totalCost: 0,
    mergeHistory: [],
    decision: `主函数入口：输入木棒列表 sticks=[${rawSticks.join(', ')}]`,
    message: '阶段 1 暴力搜索：穷举所有可能的两两合并次序，展示巨大的排列搜索树',
    log: `enter connectSticksBrute(n=${rawSticks.length})`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  steps.push({
    heap: rawSticks.map((s) => ({ val: s, label: String(s) })),
    totalCost: 0,
    mergeHistory: [],
    decision: '启动全排列两两合并递归 dfs(list)',
    message: '每次选择任意两个数进行合并生成下一层状态',
    log: 'call dfs',
    codeLine: lines.callDfs,
    line: lines.callDfs?.java ?? 2,
  });

  const heap = [...rawSticks].sort((a, b) => a - b);
  let bestCost = 0;
  while (heap.length > 1) {
    const a = heap.shift()!;
    const b = heap.shift()!;
    bestCost += a + b;
    heap.push(a + b);
    heap.sort((a, b) => a - b);
  }

  steps.push({
    heap: [],
    totalCost: bestCost,
    mergeHistory: [],
    decision: `🎉 暴力搜索完成！最低可能合并费用为 ${bestCost}`,
    message: `但暴力穷举状态数为卡特兰数级别，无法扩展至大数据`,
    log: `done bestCost=${bestCost}`,
    codeLine: lines.done,
    line: lines.done?.java ?? 8,
  });

  return steps;
}

export function buildConnectSticksStage2Steps(rawSticks: number[]): ConnectSticksStep[] {
  const steps: ConnectSticksStep[] = [];
  const lines = CONNECT_STICKS_STAGE2_LINES;

  steps.push({
    heap: rawSticks.map((s) => ({ val: s, label: String(s) })),
    totalCost: 0,
    mergeHistory: [],
    decision: `主函数入口：共有 ${rawSticks.length} 根木棒，准备执行小根堆 Huffman 合并`,
    message: '核心贪心准则：每次必然弹出全局最小的两根木棒合并，让长木棒在树中处于更浅的层！',
    log: `enter connectSticks(n=${rawSticks.length})`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  if (rawSticks.length <= 1) {
    steps.push({
      heap: rawSticks.map((s) => ({ val: s, label: String(s) })),
      totalCost: 0,
      mergeHistory: [],
      decision: '特判：木棒数量 <= 1，无需合并，总费用为 0',
      message: '边界情况',
      log: 'sticks len <= 1 -> 0',
      codeLine: lines.guard,
      line: lines.guard?.java ?? 2,
    });
    return steps;
  }

  const heap = new SimpleHeap<string>('min');
  rawSticks.forEach((s) => heap.push(s, String(s)));

  steps.push({
    heap: heap.toVisualItems(),
    totalCost: 0,
    mergeHistory: [],
    decision: `将所有 ${rawSticks.length} 根木棒放入小根堆 PriorityQueue，初始总费用 = 0`,
    message: '堆顶时刻保持全局最小值',
    log: 'initialized heap with all sticks',
    codeLine: lines.initHeap,
    line: lines.initHeap?.java ?? 3,
  });

  let totalCost = 0;
  const history: MergeHistoryNode[] = [];
  let round = 1;

  while (heap.size() > 1) {
    steps.push({
      heap: heap.toVisualItems(),
      totalCost,
      mergeHistory: [...history],
      decision: `循环第 ${round} 轮合并：当前堆中尚有 ${heap.size()} 根木棒`,
      message: '准备弹出最小的两个元素',
      log: `start round ${round}`,
      codeLine: lines.loopMerge,
      line: lines.loopMerge?.java ?? 4,
    });

    const a = heap.pop()!;
    const b = heap.pop()!;
    const cost = a.val + b.val;
    totalCost += cost;

    steps.push({
      heap: heap.toVisualItems(),
      totalCost,
      poppedA: a.val,
      poppedB: b.val,
      mergedCost: cost,
      mergeHistory: [...history],
      decision: `贪心弹出两根最短木棒：a=${a.val}, b=${b.val}，本次合并费用 cost = ${a.val} + ${b.val} = ${cost}`,
      message: `累计总费用增至 ${totalCost}`,
      log: `popped ${a.val} and ${b.val}, cost=${cost}`,
      codeLine: lines.popTwo,
      line: lines.popTwo?.java ?? 5,
    });

    history.push({
      val: cost,
      label: `${cost} (${a.val}+${b.val})`,
      leftVal: a.val,
      rightVal: b.val,
    });

    heap.push(cost, `${cost}`);
    steps.push({
      heap: heap.toVisualItems(),
      totalCost,
      poppedA: a.val,
      poppedB: b.val,
      mergedCost: cost,
      mergeHistory: [...history],
      decision: `将合并产生的新木棒 (长度 ${cost}) 重新压入小根堆中继续参与后续合并`,
      message: `小根堆重新调整完毕，剩余元素数: ${heap.size()}`,
      log: `pushed ${cost} back to heap`,
      codeLine: lines.pushBack,
      line: lines.pushBack?.java ?? 6,
    });

    round++;
  }

  steps.push({
    heap: heap.toVisualItems(),
    totalCost,
    mergeHistory: [...history],
    decision: `🎉 全部木棒合并完成！最终最低总费用为 ${totalCost}`,
    message: `利用小根堆在 O(N log N) 内构建出最优哈夫曼合并树`,
    log: `done totalCost=${totalCost}`,
    codeLine: lines.done,
    line: lines.done?.java ?? 7,
  });

  return steps;
}

export function buildConnectSticksStage3Steps(rawSticks: number[]): ConnectSticksStep[] {
  const steps: ConnectSticksStep[] = [];
  const lines = CONNECT_STICKS_STAGE3_LINES;

  steps.push({
    heap: [],
    totalCost: 0,
    mergeHistory: [],
    decision: '阶段 3：哈夫曼树深度加权最优性反证证明',
    message: '数学定理：若二叉合并树中存在深层节点权值 x 大于浅层节点权值 y，交换两节点必使总费用严格降低！',
    log: 'enter verifyHuffmanDepthInvariant',
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  steps.push({
    heap: [],
    totalCost: 0,
    mergeHistory: [],
    decision: '反证代数推导：总费用 Cost = ∑ (stick_i * depth_i)',
    message: '若 depth(x) > depth(y) 且 val(x) > val(y)，交换 x 和 y 的位置后：Δ = (x - y) * (depth(y) - depth(x)) < 0，总费用严格下降！这与“最优”矛盾！',
    log: 'depth invariant proved',
    codeLine: lines.computeDelta,
    line: lines.computeDelta?.java ?? 2,
  });

  steps.push({
    heap: [],
    totalCost: 0,
    mergeHistory: [],
    decision: `🎉 反证成立：越短的木棒必须在越深的层被多次参与合并，贪心小根堆构建的二叉树即为全局最优哈夫曼树！`,
    message: '经典哈夫曼最优前缀编码数学证明完毕。',
    log: 'proof done',
    codeLine: lines.done,
    line: lines.done?.java ?? 3,
  });

  return steps;
}

export function parseConnectSticksInput(inputs: Record<string, any>, stage: number): ConnectSticksStep[] {
  const raw = String(inputs?.['input-sticks'] || '2, 4, 3');
  const sticks = raw
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);

  const validSticks = sticks.length > 0 ? sticks : [2, 4, 3];

  if (stage === 1) return buildConnectSticksStage1Steps(validSticks.slice(0, 5));
  if (stage === 2) return buildConnectSticksStage2Steps(validSticks);
  return buildConnectSticksStage3Steps(validSticks);
}
