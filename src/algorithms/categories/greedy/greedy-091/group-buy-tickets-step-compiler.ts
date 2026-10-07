import { GROUP_BUY_TICKETS_LINES } from './greedy-091-stage-codes';
import { Greedy091Step } from './greedy-091-shared';

export interface GameDeltaItem {
  delta: number;
  x: number;
  k: number;
  b: number;
  gameIdx: number;
}

export interface GroupBuyTicketsStep extends Greedy091Step {
  line?: number;
  n: number;
  games: [number, number][];
  heap: GameDeltaItem[];
  totalCost: number;
  poppedItem?: GameDeltaItem;
  pushedItem?: GameDeltaItem;
  peopleAssigned: number[];
}

export function buildGroupBuyTicketsSteps(n: number, games: [number, number][]): GroupBuyTicketsStep[] {
  const steps: GroupBuyTicketsStep[] = [];
  const lines = GROUP_BUY_TICKETS_LINES;
  const m = games.length;

  // Step 0: 入口
  steps.push({
    line: (lines.entry as any).java ?? 1,
    n,
    games: games.map(g => [...g]),
    heap: [],
    totalCost: 0,
    peopleAssigned: new Array(m).fill(0),
    decision: `主函数入口：总人数 n=${n}，景区项目数 m=${m}，准备计算各项目初始边际增量`,
    message: '边际增量公式: Δ(x+1) = B - K * (2x + 1)，增量递减具备凹性',
    log: `enter enough(n=${n}, m=${m})`,
    codeLine: lines.entry,
  });

  // Step 1: 初始化堆
  const heap: GameDeltaItem[] = [];
  const peopleAssigned = new Array(m).fill(0);
  for (let i = 0; i < m; i++) {
    const [k, b] = games[i];
    const delta1 = b - k;
    if (delta1 > 0) {
      heap.push({ delta: delta1, x: 0, k, b, gameIdx: i });
    }
  }
  heap.sort((a, b) => b.delta - a.delta);

  let totalCost = 0;

  steps.push({
    line: (lines.initHeap as any).java ?? 5,
    n,
    games: games.map(g => [...g]),
    heap: heap.map(item => ({ ...item })),
    totalCost,
    peopleAssigned: [...peopleAssigned],
    decision: `初始化大顶堆：筛选出初始增量 Δ > 0 的 ${heap.length} 个项目入堆`,
    message: `当前堆顶最大增益项目为 #${heap.length > 0 ? heap[0].gameIdx : '无'} (Δ = ${heap.length > 0 ? heap[0].delta : 0})`,
    log: `init heap with ${heap.length} items`,
    codeLine: lines.initHeap,
  });

  // 核心循环：至多分配 n 个人
  for (let step = 0; step < n && heap.length > 0; step++) {
    heap.sort((a, b) => b.delta - a.delta);
    const cur = heap.shift()!;
    totalCost += cur.delta;
    peopleAssigned[cur.gameIdx]++;

    const nextX = cur.x + 1;
    const nextDelta = cur.b - cur.k * (2 * nextX + 1);

    steps.push({
      line: (lines.addCost as any).java ?? 10,
      n,
      games: games.map(g => [...g]),
      heap: heap.map(item => ({ ...item })),
      totalCost,
      peopleAssigned: [...peopleAssigned],
      poppedItem: { ...cur },
      decision: `分配第 ${step + 1} 个人到项目 #${cur.gameIdx}，贪心获取当前最大边际增量 Δ=${cur.delta} 元，当前总保底金额累加至 ${totalCost} 元`,
      message: `项目 #${cur.gameIdx} 已累计分配 ${peopleAssigned[cur.gameIdx]} 人，当前该项目产生花费 ${peopleAssigned[cur.gameIdx] * (cur.b - cur.k * peopleAssigned[cur.gameIdx])} 元`,
      log: `assigned person #${step + 1} to game #${cur.gameIdx} delta=${cur.delta} total=${totalCost}`,
      codeLine: lines.addCost,
    });

    if (nextDelta > 0) {
      const nextItem: GameDeltaItem = { delta: nextDelta, x: nextX, k: cur.k, b: cur.b, gameIdx: cur.gameIdx };
      heap.push(nextItem);
      heap.sort((a, b) => b.delta - a.delta);

      steps.push({
        line: (lines.pushNext as any).java ?? 13,
        n,
        games: games.map(g => [...g]),
        heap: heap.map(item => ({ ...item })),
        totalCost,
        peopleAssigned: [...peopleAssigned],
        pushedItem: { ...nextItem },
        decision: `项目 #${cur.gameIdx} 计算下一位观众的边际增量 Δ(${nextX + 1}) = ${cur.b} - ${cur.k}*(2*${nextX}+1) = ${nextDelta} > 0，压回大顶堆`,
        message: '大顶堆重新自动调整就绪',
        log: `push nextDelta=${nextDelta} for game #${cur.gameIdx}`,
        codeLine: lines.pushNext,
      });
    } else {
      steps.push({
        line: (lines.pushNext as any).java ?? 13,
        n,
        games: games.map(g => [...g]),
        heap: heap.map(item => ({ ...item })),
        totalCost,
        peopleAssigned: [...peopleAssigned],
        decision: `项目 #${cur.gameIdx} 下一位观众的边际增量 Δ=${nextDelta} <= 0，不再可能带来正向金额增量，该项目不再入堆`,
        message: '该项目收益已达到理论极值顶点',
        log: `game #${cur.gameIdx} marginal return <= 0, drop`,
        codeLine: lines.pushNext,
      });
    }
  }

  // 收敛
  steps.push({
    line: (lines.done as any).java ?? 15,
    n,
    games: games.map(g => [...g]),
    heap: heap.map(item => ({ ...item })),
    totalCost,
    peopleAssigned: [...peopleAssigned],
    decision: `🎉 计算完毕！应对所有员工选择的最保险准备金额为 ${totalCost} 元`,
    message: `各项目最终人数分布: [${peopleAssigned.map((cnt, i) => `#${i}:${cnt}人`).join(', ')}]`,
    log: `done totalCost=${totalCost}`,
    codeLine: lines.done,
  });

  return steps;
}
