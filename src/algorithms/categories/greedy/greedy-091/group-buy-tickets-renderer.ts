/**
 * 组团买票 (Group Buy Tickets) - 声明式教学级沙盘渲染器
 * 核心贪心：大顶堆维护边际增益 Delta = B - K * (2x + 1)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import {
  GROUP_BUY_TICKETS_CODES,
  GROUP_BUY_TICKETS_LINES,
} from './greedy-091-stage-codes';
import {
  Greedy091Step,
  renderDecisionBalance,
} from './greedy-091-shared';

export interface GameDeltaItem {
  delta: number;
  x: number;
  k: number;
  b: number;
  gameIdx: number;
}

export interface GroupBuyTicketsStep extends Greedy091Step {
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

export const groupBuyTicketsVisualizer = registerDeclarativeAlgorithm<GroupBuyTicketsStep>({
  id: 'group-buy-tickets',
  name: '组团买票 (Group Buy Tickets)',
  category: 'greedy',
  icon: '🎟️',
  difficulty: 3,
  levelOrder: 913,
  learningGoal: '掌握大顶堆维护边际增益 Delta = B - K*(2x+1) 的离散极值贪心分配机制',
  problemHtml: GREEDY_091_PROBLEMS.groupBuyTickets.html,
  analysisHtml: GREEDY_091_PROBLEMS.groupBuyTickets.html,
  inputs: [
    {
      id: 'input-n',
      label: '总员工人数 n',
      type: 'text',
      defaultValue: '8',
      placeholder: '如 8',
    },
    {
      id: 'input-games',
      label: '项目参数列表 [Ki, Bi]',
      type: 'text',
      defaultValue: '2,10; 1,15; 3,20',
      placeholder: '2,10; 1,15; 3,20',
    },
  ],
  codeLanguages: GROUP_BUY_TICKETS_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const n = Math.max(1, parseInt(String(inputs?.['input-n'] || '8'), 10) || 1);
    const rawGames = String(inputs?.['input-games'] || '2,10; 1,15; 3,20');
    const games = rawGames.split(';').map(g => {
      const parts = g.trim().split(/[,，\s]+/).map(s => parseInt(s.trim(), 10));
      return [parts[0] || 0, parts[1] || 0] as [number, number];
    }).filter(([k, b]) => k > 0 || b > 0);
    return buildGroupBuyTicketsSteps(n, games);
  },
  renderCanvas: (stageContainer: HTMLElement, step: GroupBuyTicketsStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部指标
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">总人数: <b>${step.n}</b> 人</span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #ecfdf5; color: #047857; font-weight: 600;">已分配: ${step.peopleAssigned.reduce((a, b) => a + b, 0)} 人</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">累计保底金额:</span>
          <span style="color: #dc2626; font-weight: 800; font-size: 15px;">￥${step.totalCost}</span>
        </div>
      </div>
    `;

    // 中部项目看板
    const gamesBox = document.createElement('div');
    gamesBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

    step.games.forEach(([k, b], idx) => {
      const cnt = step.peopleAssigned[idx];
      const currentCost = Math.max(0, cnt * (b - k * cnt));
      const nextDelta = b - k * (2 * cnt + 1);

      const card = document.createElement('div');
      card.style.cssText = `display: flex; flex-direction: column; gap: 6px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
          <span style="font-weight: 700; font-size: 12px; color: #1e293b;">项目 #${idx}</span>
          <span style="font-size: 11px; font-weight: 600; color: #64748b;">K=${k}, B=${b}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: #64748b;">已购人数:</span>
          <span style="font-weight: 700; color: #2563eb; font-family: 'JetBrains Mono', monospace;">${cnt} 人</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: #64748b;">该项目总开销:</span>
          <span style="font-weight: 700; color: #059669; font-family: 'JetBrains Mono', monospace;">￥${currentCost}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; background: #eff6ff; padding: 3px 6px; border-radius: 4px;">
          <span style="color: #1d4ed8; font-weight: 600;">下一人增量 Δ:</span>
          <span style="font-weight: 700; color: ${nextDelta > 0 ? '#1d4ed8' : '#94a3b8'}; font-family: 'JetBrains Mono', monospace;">${nextDelta > 0 ? `+￥${nextDelta}` : '已饱和 (<=0)'}</span>
        </div>
      `;
      gamesBox.appendChild(card);
    });
    mainCard.appendChild(gamesBox);

    // 底部：大顶堆元素
    const heapBox = document.createElement('div');
    heapBox.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;';
    const heapHtml = step.heap.length === 0
      ? '<span style="color: #94a3b8; font-size: 11px;">大顶堆为空 (增益已耗尽)</span>'
      : step.heap.map((h, idx) => {
          const isTop = idx === 0;
          return `
            <div style="padding: 4px 8px; border-radius: 6px; background: ${isTop ? '#fffbeb' : '#ffffff'}; border: 1.5px solid ${isTop ? '#f59e0b' : '#cbd5e1'}; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700; color: ${isTop ? '#b45309' : '#334155'};">
              +￥${h.delta} <span style="font-size: 9px; color: #94a3b8;">(项目#${h.gameIdx})</span>
            </div>
          `;
        }).join('');

    heapBox.innerHTML = `
      <span style="font-size: 11px; font-weight: 700; color: #1e293b; min-width: 90px;">大顶堆 (MaxHeap):</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">${heapHtml}</div>
    `;
    mainCard.appendChild(heapBox);

    stageContainer.appendChild(mainCard);
  },
});
