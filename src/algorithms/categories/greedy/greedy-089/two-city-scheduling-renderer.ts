/**
 * 两地调度 (LeetCode 1029) - 声明式教学级沙盘渲染器
 * 核心贪心：差额排序贪心 (priceB - priceA) 升序挑选前 N 人去 B，后 N 人去 A
 * 三阶段：
 *   阶段 1: 暴力组合回溯对比 (Brute-Force DFS)
 *   阶段 2: 差额排序贪心推演 (Greedy)
 *   阶段 3: 费用增量置换反证证明 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  TWO_CITY_STAGE1_CODES,
  TWO_CITY_STAGE1_LINES,
  TWO_CITY_STAGE2_CODES,
  TWO_CITY_STAGE2_LINES,
  TWO_CITY_STAGE3_CODES,
  TWO_CITY_STAGE3_LINES,
} from './greedy-089-stage-codes';
import { Greedy089Step } from './greedy-089-shared';

export interface PersonCost {
  id: number;
  costA: number;
  costB: number;
  delta: number; // costB - costA
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

// ==========================================
// 1. 阶段 1：暴力回溯步进生成器
// ==========================================
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

  // Step 0: 入口
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
      });
      return;
    }

    // 尝试去 A
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
      });
      dfs(idx + 1, curA, curB, costA + costs[idx][0], costB);
      curA.pop();
    }

    // 尝试去 B
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
      });
      dfs(idx + 1, curA, curB, costA, costB + costs[idx][1]);
      curB.pop();
    }
  }

  dfs(0, [], [], 0, 0);

  // 收尾
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
  });

  return steps;
}

// ==========================================
// 2. 阶段 2：贪心差额排序推演步进生成器
// ==========================================
export function buildTwoCityStage2Steps(costs: number[][]): TwoCityStep[] {
  const steps: TwoCityStep[] = [];
  const lines = TWO_CITY_STAGE2_LINES;
  const n = Math.floor(costs.length / 2);

  let people: PersonCost[] = costs.map((c, idx) => ({
    id: idx,
    costA: c[0],
    costB: c[1],
    delta: c[1] - c[0],
  }));

  // Step 0: 入口
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
  });

  // Step 1: 差值排序
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
  });

  // 分配前 N 个人去 B
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
    });
  }

  // 分配后 N 个人去 A
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
    });
  }

  // 最终完成
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
  });

  return steps;
}

// ==========================================
// 3. 阶段 3：置换反证法步进生成器
// ==========================================
export function buildTwoCityStage3Steps(costs: number[][]): TwoCityStep[] {
  const steps: TwoCityStep[] = [];
  const lines = TWO_CITY_STAGE3_LINES;
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
    decision: '阶段 3：费用增量置换法 (Exchange Argument) 正确性反证',
    message: '数学定理：若从当前贪心分配中，任取一个去 B 的人与去 A 的人对调，总费用变化 Δ_swap >= 0 恒成立！',
    log: 'enter verifyOptimalExchange',
    codeLine: lines.entry,
  });

  people.sort((a, b) => a.delta - b.delta);
  const pB = people[0]; // 贪心去 B
  const pA = people[people.length - 1]; // 贪心去 A

  // 交换后的代价差
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
  });

  return steps;
}

// ==========================================
// 4. 声明式渲染器规格配置
// ==========================================
const { template, Visualizer } = createDeclarativeVisualizer<TwoCityStep>({
  id: 'two-city-scheduling',
  name: '两地调度 (Two City Scheduling)',
  category: 'greedy',
  icon: '✈️',
  badge: {
    mode: '差额排序贪心',
    complexity: 'O(N log N) · O(1)',
  },
  card1Title: '🏙️ 两地人员派送天平看板',
  card2Title: '📐 差额增量 Δ=(costB - costA) 排序标尺',
  card2Desc: '展示每个人改派去 B 的费用差值，越小越优先去 B',
  legend: [
    { label: '去 A 市 (N 人)', color: '#3b82f6' },
    { label: '去 B 市 (N 人)', color: '#10b981' },
    { label: '待分配人员', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-costs',
      label: '人员费用 (costA,costB)',
      type: 'text',
      defaultValue: '10,20; 30,200; 400,50; 30,20',
      width: '200px',
      placeholder: '以分号分隔每人，如 10,20; 30,200',
    },
  ],
  presets: [
    { label: '经典用例 (4人)', values: { 'input-costs': '10,20; 30,200; 400,50; 30,20' } },
    { label: '差价悬殊 (4人)', values: { 'input-costs': '259,770; 448,54; 926,667; 184,139' } },
    { label: '均衡对比 (6人)', values: { 'input-costs': '10,100; 20,200; 30,300; 100,10; 200,20; 300,30' } },
  ],
  metrics: [
    { id: 'total-cost', label: '当前总费用', color: '#10b981' },
    { id: 'cost-a', label: 'A 市总花费', color: '#3b82f6' },
    { id: 'cost-b', label: 'B 市总花费', color: '#f59e0b' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力组合对比',
      shortName: '暴力搜索',
      card2Desc: '搜索 C(2N, N) 种划分方式，直观展示指数级复杂度',
      codeLanguages: TWO_CITY_STAGE1_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 1),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 差额排序贪心',
      shortName: '差额贪心',
      card2Desc: '按 (costB - costA) 升序排序，前 N 人去 B，后 N 人去 A',
      codeLanguages: TWO_CITY_STAGE2_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 2),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 费用置换反证',
      shortName: '贪心证明',
      card2Desc: '代数证明任意对调两市人员必然导致费用增量 Δ >= 0',
      codeLanguages: TWO_CITY_STAGE3_CODES,
      buildSteps: (inputs) => parseAndBuild(inputs, 3),
    },
  ],
  codeLanguages: TWO_CITY_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.twoCityScheduling.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 差额贪心数学本质</h3>
      <p>设选去 A 市的人员集合为 $S_A$，去 B 市的人员集合为 $S_B$（$|S_A|=|S_B|=N$）。</p>
      <p>总费用：</p>
      <div style="padding: 6px 12px; background: #f1f5f9; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px;">
        \\text{Cost} = \\sum_{i \\in S_A} a_i + \\sum_{j \\in S_B} b_j = \\sum_{i=1}^{2N} a_i + \\sum_{j \\in S_B} (b_j - a_j)
      </div>
      <p>注意到 $\\sum_{i=1}^{2N} a_i$ 是一个<b>固定常数</b>！因此最小化总费用等价于<b>最小化 $\\sum_{j \\in S_B} (b_j - a_j)$</b>。</p>
      <p>要在 $2N$ 个差额 $(b_j - a_j)$ 中选取 $N$ 个使和最小，根据排序不等式，显然直接选取<b>差额最小的前 $N$ 个</b>即可！</p>
    </div>
  `,
  buildSteps: (inputs) => parseAndBuild(inputs, 2),
  renderCanvas: (container, step) => {
    const people = step.people || [];
    const assignedA = step.assignedA || [];
    const assignedB = step.assignedB || [];

    // A 市卡片
    const aCardsHtml = assignedA.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">暂无分配</span>'
      : assignedA.map((id) => {
          const p = people.find((item) => item.id === id);
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 6px; background: #eff6ff; border: 1px solid #93c5fd; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
              <span style="font-weight: 700; color: #1e40af;">P${id}</span>
              <span style="color: #2563eb; font-weight: 600;">$${p ? p.costA : 0}</span>
            </div>
          `;
        }).join('');

    // B 市卡片
    const bCardsHtml = assignedB.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">暂无分配</span>'
      : assignedB.map((id) => {
          const p = people.find((item) => item.id === id);
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 6px; background: #ecfdf5; border: 1px solid #6ee7b7; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
              <span style="font-weight: 700; color: #065f46;">P${id}</span>
              <span style="color: #059669; font-weight: 600;">$${p ? p.costB : 0}</span>
            </div>
          `;
        }).join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #475569; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">
          <span>✈️ 两地调度分配看板 (总计 2N = ${people.length} 人)</span>
          <span style="color: #10b981; font-family: 'JetBrains Mono', monospace;">当前总花费: $${step.totalCost}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; flex: 1;">
          <!-- A 城市 -->
          <div style="display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 8px; background: #f8fafc; border: 1.5px solid #bfdbfe;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #1e3a8a;">
              <span>🏙️ A 城市 (${assignedA.length} / ${Math.floor(people.length / 2)})</span>
              <span style="font-family: 'JetBrains Mono', monospace; color: #2563eb;">小计: $${step.totalCostA}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 160px;">
              ${aCardsHtml}
            </div>
          </div>

          <!-- B 城市 -->
          <div style="display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 8px; background: #f8fafc; border: 1.5px solid #a7f3d0;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 700; color: #064e3b;">
              <span>🏖️ B 城市 (${assignedB.length} / ${Math.floor(people.length / 2)})</span>
              <span style="font-family: 'JetBrains Mono', monospace; color: #059669;">小计: $${step.totalCostB}</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 160px;">
              ${bCardsHtml}
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const people = step.people || [];
    const deltaBars = people
      .map((p) => {
        const isB = p.assigned === 'B';
        const isA = p.assigned === 'A';
        let bg = '#ffffff';
        let border = '#cbd5e1';
        let tagColor = '#64748b';
        if (isB) {
          bg = '#ecfdf5';
          border = '#10b981';
          tagColor = '#059669';
        } else if (isA) {
          bg = '#eff6ff';
          border = '#3b82f6';
          tagColor = '#2563eb';
        }

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
            <span style="font-weight: 700; color: #334155;">P${p.id}</span>
            <span style="color: #64748b;">[A:$${p.costA}, B:$${p.costB}]</span>
            <span style="font-weight: 800; color: ${p.delta < 0 ? '#10b981' : '#b45309'};">Δ=${p.delta > 0 ? '+' : ''}${p.delta}</span>
            <span style="font-size: 10px; font-weight: 700; color: ${tagColor};">${p.assigned ? `➔ ${p.assigned}市` : '待定'}</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 6px; overflow-y: auto;">
        <div style="font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 2px;">
          改派差额 Δ=(costB - costA) 升序列表：
        </div>
        ${deltaBars}
      </div>
    `;
  },
});

function parseAndBuild(inputs: Record<string, any>, stage: number): TwoCityStep[] {
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

  // 保证偶数人数
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

export const TwoCitySchedulingVisualizer = Visualizer;

registerAlgorithm({
  id: 'two-city-scheduling',
  name: '两地调度 (Two City Scheduling)',
  viewId: 'algo-two-city-scheduling-view',
  category: 'greedy',
  description: '左程云算法讲解089 Code02：LeetCode 1029 两地调度，差额排序贪心策略与数学置换反证法',
  icon: '✈️',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 892,
  learningGoal: '理解差额排序在多选一资源分配中的恒等式转化，掌握增量排序的本质',
});
