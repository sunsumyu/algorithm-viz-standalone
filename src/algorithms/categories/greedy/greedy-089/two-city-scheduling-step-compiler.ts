import {
  TWO_CITY_STAGE1_LINES,
  TWO_CITY_STAGE2_LINES,
  TWO_CITY_STAGE3_LINES,
} from './greedy-089-stage-codes';
import { Greedy089Step } from './greedy-089-shared';

export interface PersonCost {
  id: number;
  costA: number;
  costB: number;
  delta: number;
  assigned?: 'A' | 'B';
}

export interface TwoCityStep extends Greedy089Step {
  people: PersonCost[];
  currentIdx?: number;
  assignedA: number[];
  assignedB: number[];
  totalCostA: number;
  totalCostB: number;
  totalCost: number;
  deltaSortState?: boolean;
}

export function buildTwoCityStage1Steps(costs: number[][]): TwoCityStep[] {
  const steps: TwoCityStep[] = [];
  const lines = TWO_CITY_STAGE1_LINES;
  const n = Math.floor(costs.length / 2);

  const people: PersonCost[] = costs.map((c, idx) => ({
    id: idx,
    costA: c[0],
    costB: c[1],
    delta: c[1] - c[0],
  }));

  steps.push({
    people: [...people],
    assignedA: [],
    assignedB: [],
    totalCostA: 0,
    totalCostB: 0,
    totalCost: 0,
    decision: `主函数入口：共 2N = ${costs.length} 人，需恰好 N = ${n} 人去 A 市，${n} 人去 B 市`,
    message: `准备执行暴力回溯穷举所有 C(${costs.length}, ${n}) 种组合`,
    log: `enter twoCitySchedCostBrute(n=${n})`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  steps.push({
    people: [...people],
    assignedA: [],
    assignedB: [],
    totalCostA: 0,
    totalCostB: 0,
    totalCost: 0,
    decision: `启动深度优先搜索：dfs(i=0, aLeft=${n}, bLeft=${n})`,
    message: '从第 0 个人开始决策其归属城市',
    log: `call dfs(0, ${n}, ${n})`,
    codeLine: lines.callDfs,
    line: lines.callDfs?.java ?? 2,
  });

  let bestAns = Infinity;
  let bestA: number[] = [];
  let bestB: number[] = [];

  function dfs(idx: number, curA: number[], curB: number[], costA: number, costB: number) {
    if (steps.length > 300) return;
    if (idx === costs.length) {
      const sum = costA + costB;
      const isBest = sum < bestAns;
      if (isBest) {
        bestAns = sum;
        bestA = [...curA];
        bestB = [...curB];
      }
      steps.push({
        people: people.map((p) => ({
          ...p,
          assigned: curA.includes(p.id) ? 'A' : curB.includes(p.id) ? 'B' : undefined,
        })),
        assignedA: [...curA],
        assignedB: [...curB],
        totalCostA: costA,
        totalCostB: costB,
        totalCost: sum,
        decision: `到达叶子节点：A=[${curA.join(', ')}]，B=[${curB.join(', ')}]，总费用 = ${sum} ➔ ${isBest ? '刷新全局最低' : '劣于当前最优'}`,
        message: `当前全局最低费用 = ${bestAns}`,
        log: `leaf reached: totalCost=${sum}`,
        codeLine: lines.dfsBase,
        line: lines.dfsBase?.java ?? 3,
      });
      return;
    }

    if (curA.length < n) {
      curA.push(idx);
      steps.push({
        people: people.map((p) => ({
          ...p,
          assigned: curA.includes(p.id) ? 'A' : curB.includes(p.id) ? 'B' : undefined,
        })),
        currentIdx: idx,
        assignedA: [...curA],
        assignedB: [...curB],
        totalCostA: costA + costs[idx][0],
        totalCostB: costB,
        totalCost: costA + costB + costs[idx][0],
        decision: `分支尝试：第 ${idx} 个人去 A 市 (费用 +${costs[idx][0]})`,
        message: `A 市尚缺 ${n - curA.length} 人`,
        log: `choose A for person ${idx}`,
        codeLine: lines.chooseA,
        line: lines.chooseA?.java ?? 4,
      });
      dfs(idx + 1, curA, curB, costA + costs[idx][0], costB);
      curA.pop();
    }

    if (curB.length < n) {
      curB.push(idx);
      steps.push({
        people: people.map((p) => ({
          ...p,
          assigned: curA.includes(p.id) ? 'A' : curB.includes(p.id) ? 'B' : undefined,
        })),
        currentIdx: idx,
        assignedA: [...curA],
        assignedB: [...curB],
        totalCostA: costA,
        totalCostB: costB + costs[idx][1],
        totalCost: costA + costB + costs[idx][1],
        decision: `分支尝试：第 ${idx} 个人去 B 市 (费用 +${costs[idx][1]})`,
        message: `B 市尚缺 ${n - curB.length} 人`,
        log: `choose B for person ${idx}`,
        codeLine: lines.chooseB,
        line: lines.chooseB?.java ?? 5,
      });
      dfs(idx + 1, curA, curB, costA, costB + costs[idx][1]);
      curB.pop();
    }
  }

  dfs(0, [], [], 0, 0);

  steps.push({
    people: people.map((p) => ({
      ...p,
      assigned: bestA.includes(p.id) ? 'A' : bestB.includes(p.id) ? 'B' : undefined,
    })),
    assignedA: [...bestA],
    assignedB: [...bestB],
    totalCostA: bestA.reduce((sum, id) => sum + costs[id][0], 0),
    totalCostB: bestB.reduce((sum, id) => sum + costs[id][1], 0),
    totalCost: bestAns,
    decision: `🎉 暴力枚举完毕！最低总费用为 ${bestAns} (A=[${bestA.join(', ')}], B=[${bestB.join(', ')}])`,
    message: '全排列/组合搜索在大规模数据下必定 TLE',
    log: `done brute ans=${bestAns}`,
    codeLine: lines.done,
    line: lines.done?.java ?? 6,
  });

  return steps;
}

export function buildTwoCityStage2Steps(costs: number[][]): TwoCityStep[] {
  const steps: TwoCityStep[] = [];
  const lines = TWO_CITY_STAGE2_LINES;
  const n = Math.floor(costs.length / 2);

  const people: PersonCost[] = costs.map((c, idx) => ({
    id: idx,
    costA: c[0],
    costB: c[1],
    delta: c[1] - c[0],
  }));

  steps.push({
    people: [...people],
    assignedA: [],
    assignedB: [],
    totalCostA: 0,
    totalCostB: 0,
    totalCost: 0,
    decision: `主函数入口：共 2N = ${costs.length} 人，计划派恰好 ${n} 人去 A，${n} 人去 B`,
    message: '贪心思想：所有人先全去 A，计算转派 B 的改派费用差值 (costB - costA)',
    log: `enter twoCitySchedCost(n=${n})`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  people.sort((a, b) => a.delta - b.delta);
  steps.push({
    people: [...people],
    assignedA: [],
    assignedB: [],
    totalCostA: 0,
    totalCostB: 0,
    totalCost: 0,
    deltaSortState: true,
    decision: `按差值 Δ = (costB - costA) 升序排序完成！差值越小，改派去 B 越划算`,
    message: `排序后顺序: [${people.map((p) => `P${p.id}(Δ=${p.delta})`).join(', ')}]`,
    log: `sorted by delta: ${people.map((p) => p.delta).join(',')}`,
    codeLine: lines.sort,
    line: lines.sort?.java ?? 2,
  });

  const assignedB: number[] = [];
  let costB = 0;
  for (let i = 0; i < n; i++) {
    people[i].assigned = 'B';
    assignedB.push(people[i].id);
    costB += people[i].costB;
    steps.push({
      people: [...people],
      currentIdx: people[i].id,
      assignedA: [],
      assignedB: [...assignedB],
      totalCostA: 0,
      totalCostB: costB,
      totalCost: costB,
      decision: `挑选差额最小的前 N 人之 #${i + 1}：安排 P${people[i].id} 去 B 市 (costB = ${people[i].costB}, Δ = ${people[i].delta})`,
      message: `B 市当前已入选 ${assignedB.length} / ${n} 人`,
      log: `assign P${people[i].id} to B`,
      codeLine: lines.chooseB,
      line: lines.chooseB?.java ?? 3,
    });
  }

  const assignedA: number[] = [];
  let costA = 0;
  for (let i = n; i < 2 * n; i++) {
    people[i].assigned = 'A';
    assignedA.push(people[i].id);
    costA += people[i].costA;
    steps.push({
      people: [...people],
      currentIdx: people[i].id,
      assignedA: [...assignedA],
      assignedB: [...assignedB],
      totalCostA: costA,
      totalCostB: costB,
      totalCost: costA + costB,
      decision: `剩余 N 人之后半区 #${i - n + 1}：安排 P${people[i].id} 去 A 市 (costA = ${people[i].costA})`,
      message: `A 市当前已入选 ${assignedA.length} / ${n} 人`,
      log: `assign P${people[i].id} to A`,
      codeLine: lines.chooseA,
      line: lines.chooseA?.java ?? 4,
    });
  }

  const total = costA + costB;
  steps.push({
    people: [...people],
    assignedA: [...assignedA],
    assignedB: [...assignedB],
    totalCostA: costA,
    totalCostB: costB,
    totalCost: total,
    decision: `🎉 贪心分配完成！A市费用=${costA}，B市费用=${costB}，最低总费用 = ${total}`,
    message: `A市入选: [${assignedA.map((id) => `P${id}`).join(', ')}] · B市入选: [${assignedB.map((id) => `P${id}`).join(', ')}]`,
    log: `done greedy totalCost=${total}`,
    codeLine: lines.done,
    line: lines.done?.java ?? 5,
  });

  return steps;
}

export function buildTwoCityStage3Steps(costs: number[][]): TwoCityStep[] {
  const steps: TwoCityStep[] = [];
  const lines = TWO_CITY_STAGE3_LINES;

  const people: PersonCost[] = costs.map((c, idx) => ({
    id: idx,
    costA: c[0],
    costB: c[1],
    delta: c[1] - c[0],
  }));

  steps.push({
    people: [...people],
    assignedA: [],
    assignedB: [],
    totalCostA: 0,
    totalCostB: 0,
    totalCost: 0,
    decision: '阶段 3：费用增量置换法 (Exchange Argument) 正确性反证',
    message: '数学定理：若从当前贪心分配中，任取一个去 B 的人与去 A 的人对调，总费用变化 Δ_swap >= 0 恒成立！',
    log: 'enter verifyOptimalExchange',
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  people.sort((a, b) => a.delta - b.delta);
  const pB = people[0];
  const pA = people[people.length - 1];

  const swapDelta = (pB.costA - pB.costB) + (pA.costB - pA.costA);

  steps.push({
    people: [...people],
    assignedA: [pA.id],
    assignedB: [pB.id],
    totalCostA: pA.costA,
    totalCostB: pB.costB,
    totalCost: pA.costA + pB.costB,
    decision: `反证检验：尝试对调 P${pB.id} (本应去B, Δ=${pB.delta}) 与 P${pA.id} (本应去A, Δ=${pA.delta})`,
    message: `对调增量: (costA_B - costB_B) + (costB_A - costA_A) = ${pA.delta} - ${pB.delta} = +${swapDelta}`,
    log: `compute swapDelta=${swapDelta}`,
    codeLine: lines.computeDelta,
    line: lines.computeDelta?.java ?? 2,
  });

  steps.push({
    people: [...people],
    assignedA: [pA.id],
    assignedB: [pB.id],
    totalCostA: pA.costA,
    totalCostB: pB.costB,
    totalCost: pA.costA + pB.costB,
    decision: `🎉 反证成立！因为 Δ(A) >= Δ(B)，对调增量恒有 Δ_swap >= 0，任何偏离贪心排序的解必劣于当前解！`,
    message: '贪心解即为全局最优解，证毕。',
    log: 'proof verified',
    codeLine: lines.done,
    line: lines.done?.java ?? 3,
  });

  return steps;
}

export function parseTwoCityInput(inputs: Record<string, any>, stage: number): TwoCityStep[] {
  const raw = String(inputs?.['input-costs'] || '10,20; 30,200; 400,50; 30,20');
  const pairs = raw
    .split(/[;；]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const costs: number[][] = [];
  pairs.forEach((p) => {
    const nums = p
      .split(/[,，\s]+/)
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !isNaN(n));
    if (nums.length >= 2) {
      costs.push([nums[0], nums[1]]);
    }
  });

  if (costs.length % 2 !== 0) {
    costs.pop();
  }
  if (costs.length === 0) {
    costs.push([10, 20], [30, 200], [400, 50], [30, 20]);
  }

  if (stage === 1) return buildTwoCityStage1Steps(costs);
  if (stage === 2) return buildTwoCityStage2Steps(costs);
  return buildTwoCityStage3Steps(costs);
}
