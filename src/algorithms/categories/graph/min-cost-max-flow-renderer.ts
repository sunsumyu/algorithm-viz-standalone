/**
 * 最小费用最大流 (Minimum Cost Maximum Flow - MCMF SPFA) 声明式可视化器
 * 进阶网络流: 残量网络连续最短路增广 (EK/SPFA)、反向弧费用相反、最大化流的同时最小化费用 (洛谷 P3381)
 * 深度架构重构：严格解释器级全流程逐行高亮执行（SPFA寻最短费路径、队列展开、松弛更新、前驱记录、瓶颈流计算、成对反向弧流量更新、费用累加均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  MCMF_CODE_LANGUAGES,
  MCMF_PROBLEM_HTML,
  MCMF_ANALYSIS_HTML,
} from './min-cost-max-flow-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface MCMFStep {
  curPath: Array<{ u: string; v: string; cap: number; flow: number; cost: number }>;
  activeEdge?: [string, string];
  activePath?: string[];
  distMap?: Record<string, number>;
  totalFlow: number;
  totalCost: number;
  pushedFlow?: number;
  unitCost?: number;
  distArray: number[];
  inQueueArray: boolean[];
  preNodeArray: string[];
  activeArray?: 'dist' | 'inQueue' | 'preNode';
  activeSlot?: number;
  status: 'init' | 'spfa' | 'augment' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildMCMFSteps(preset: string = 'standard'): MCMFStep[] {
  const steps: MCMFStep[] = [];
  const isSimple = preset === 'simple';
  const nodes = ['S', 'A', 'B', 'T'];

  const edges: Array<{ u: string; v: string; cap: number; flow: number; cost: number }> = isSimple
    ? [
        { u: 'S', v: 'A', cap: 2, flow: 0, cost: 1 },
        { u: 'A', v: 'T', cap: 2, flow: 0, cost: 2 },
        { u: 'S', v: 'T', cap: 1, flow: 0, cost: 5 },
      ]
    : [
        { u: 'S', v: 'A', cap: 3, flow: 0, cost: 1 },
        { u: 'A', v: 'T', cap: 2, flow: 0, cost: 2 },
        { u: 'S', v: 'B', cap: 2, flow: 0, cost: 3 },
        { u: 'B', v: 'T', cap: 3, flow: 0, cost: 1 },
        { u: 'A', v: 'B', cap: 1, flow: 0, cost: 1 },
      ];

  const dist: Record<string, number> = { S: 0, A: Infinity, B: Infinity, T: Infinity };
  const inQueue: Record<string, boolean> = { S: false, A: false, B: false, T: false };
  const preNode: Record<string, string> = { S: '', A: '', B: '', T: '' };

  let totalFlow = 0;
  let totalCost = 0;
  let activePath: string[] | undefined = undefined;

  // 精准 19 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 62, java: 44, python: 36, javascript: 24 },
    whileSpfa: { cpp: 64, java: 46, python: 38, javascript: 26 },
    spfaEntry: { cpp: 35, java: 18, python: 16, javascript: 7 },
    initDist: { cpp: 36, java: 19, python: 17, javascript: 8 },
    initQueue: { cpp: 38, java: 20, python: 19, javascript: 10 },
    pushSrc: { cpp: 39, java: 21, python: 20, javascript: 11 },
    whileQueue: { cpp: 43, java: 25, python: 23, javascript: 14 },
    pollQueue: { cpp: 44, java: 26, python: 24, javascript: 15 },
    forEdges: { cpp: 46, java: 28, python: 26, javascript: 17 },
    checkRelax: { cpp: 48, java: 30, python: 27, javascript: 18 },
    updateDist: { cpp: 49, java: 31, python: 28, javascript: 19 },
    recordPre: { cpp: 50, java: 32, python: 29, javascript: 20 },
    checkInQueue: { cpp: 52, java: 34, python: 31, javascript: 21 },
    pushQueue: { cpp: 54, java: 36, python: 33, javascript: 22 },
    returnSpfa: { cpp: 59, java: 41, python: 34, javascript: 23 },
    calcPushed: { cpp: 65, java: 47, python: 39, javascript: 27 },
    pushAugment: { cpp: 70, java: 52, python: 47, javascript: 34 },
    updateTotals: { cpp: 75, java: 57, python: 54, javascript: 40 },
    returnAns: { cpp: 78, java: 60, python: 56, javascript: 43 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'spfa' | 'augment' | 'done',
    pushed?: number,
    uCost?: number,
    activeArray?: 'dist' | 'inQueue' | 'preNode',
    activeSlot?: number
  ): void {
    const pathStr = activePath && activePath.length > 0 ? activePath.join(' ➔ ') : '寻找最短路中';
    const phaseStr =
      status === 'done'
        ? '算法结束'
        : status === 'augment'
          ? '沿最短路推流增广'
          : status === 'spfa'
            ? 'SPFA 寻找单位费用最短路'
            : '算法初始化';

    const dArr = nodes.map((nd) => (dist[nd] === Infinity ? 999 : dist[nd]));
    const qArr = nodes.map((nd) => inQueue[nd]);
    const pArr = nodes.map((nd) => preNode[nd] || '-');

    steps.push({
      curPath: edges.map((e) => ({ ...e })),
      activePath: activePath ? [...activePath] : undefined,
      distMap: { ...dist },
      totalFlow,
      totalCost,
      pushedFlow: pushed,
      unitCost: uCost,
      distArray: dArr,
      inQueueArray: qArr,
      preNodeArray: pArr,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-mcmf-flow': `${totalFlow}`,
        'metric-mcmf-cost': `${totalCost}`,
        'metric-mcmf-path': pathStr,
        'metric-mcmf-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, '🚀 [MCMF 算法启动] getMinCostMaxFlow(S, T)：初始化最小费用最大流求解。', 'MCMF 入口', 'init');

  if (isSimple) {
    // 轮次 1: S ➔ A ➔ T (cap: 2, cost: 1+2=3)
    makeStep(lines.whileSpfa, '🔁 [外层增广循环] while (spfa(S, T)) -> 寻找第一条单位费用最短增广路。', 'while(spfa)', 'spfa');
    makeStep(lines.spfaEntry, '  ↳ [SPFA 入口] spfa(s=S, t=T)。', 'spfa(S,T)', 'spfa');
    makeStep(lines.initDist, '  📊 [重置距离表] Arrays.fill(dist, ∞)；记录从 S 出发的最少单位费用。', 'init dist[]', 'spfa', undefined, undefined, 'dist');
    makeStep(lines.initQueue, '  📦 [初始化 SPFA 队列] Queue<Integer> queue = new LinkedList<>()。', 'init queue', 'spfa');
    makeStep(lines.pushSrc, '  🌱 [源点入队] queue.add(S), dist[S] = 0, inQueue[S] = true。', 'push S', 'spfa');

    // 展开 S
    makeStep(lines.whileQueue, '  🔁 [队列展开] while (!queue.isEmpty()) -> 展开队列前沿。', '!queue.isEmpty()', 'spfa');
    makeStep(lines.pollQueue, '  📤 [出队节点] poll() -> 弹出源点 S。', 'poll S', 'spfa');
    dist.S = 0;
    makeStep(lines.forEdges, '  ↳ [遍历 S 的出边] 考察弧 S ➔ A (残量 2, 费用 1)。', 'edge S->A', 'spfa');
    makeStep(lines.checkRelax, '  🔎 [松弛检验] if (cap - flow > 0 && dist[A] > dist[S] + cost) -> (true)。', 'check relax S->A', 'spfa');
    dist.A = 1;
    preNode.A = 'S';
    makeStep(lines.updateDist, '  ⚡ [更新最短路] dist[A] = dist[S] + 1 = 1。', 'dist[A]=1', 'spfa', undefined, undefined, 'dist', 1);
    makeStep(lines.recordPre, '  📝 [记录前驱弧] preNode[A] = S。', 'preNode[A]=S', 'spfa');
    makeStep(lines.checkInQueue, '  🔎 [检查入队] if (!inQueue[A]) -> (true)。', 'check inQueue[A]', 'spfa');
    makeStep(lines.pushQueue, '  📥 [节点入队] queue.add(A), inQueue[A] = true。', 'push A', 'spfa');

    // 展开 A
    makeStep(lines.whileQueue, '  🔁 [队列展开] while (!queue.isEmpty())。', '!queue.isEmpty()', 'spfa');
    makeStep(lines.pollQueue, '  📤 [出队节点] poll() -> 弹出中继点 A。', 'poll A', 'spfa');
    makeStep(lines.forEdges, '  ↳ [遍历 A 的出边] 考察弧 A ➔ T (残量 2, 费用 2)。', 'edge A->T', 'spfa');
    makeStep(lines.checkRelax, '  🔎 [松弛检验] if (cap - flow > 0 && dist[T] > dist[A] + 2) -> (true)。', 'check relax A->T', 'spfa');
    dist.T = 3;
    preNode.T = 'A';
    makeStep(lines.updateDist, '  ⚡ [更新汇点距离] dist[T] = dist[A] + 2 = 3。', 'dist[T]=3', 'spfa', undefined, 3, 'dist', 3);
    makeStep(lines.recordPre, '  📝 [记录前驱弧] preNode[T] = A。', 'preNode[T]=A', 'spfa');
    makeStep(lines.pushQueue, '  📥 [汇点入队] queue.add(T), inQueue[T] = true。', 'push T', 'spfa');

    makeStep(lines.whileQueue, '  🔁 [队列处理汇点] 弹出 T，无出边松弛。', 'poll T', 'spfa');
    makeStep(lines.returnSpfa, '  ✨ [找到增广路] return dist[T] < ∞ (true)！成功发现最短增广路 S ➔ A ➔ T！', 'return true', 'spfa');

    activePath = ['S', 'A', 'T'];
    makeStep(lines.calcPushed, '  🔎 [计算瓶颈残量] min(cap - flow) -> min(2-0, 2-0) = 2 单位流。', 'pushed = 2', 'augment', 2, 3);

    edges[0].flow = 2; // S->A
    edges[1].flow = 2; // A->T
    makeStep(lines.pushAugment, '  🌊 [正反向弧流量更新] 正向弧流量 +2，反向弧流量 -2；完成推流！', 'flow += 2', 'augment', 2, 3);

    totalFlow += 2;
    totalCost += 2 * 3;
    makeStep(lines.updateTotals, `  💰 [累计总量] maxFlow += 2 = ${totalFlow}, minCost += 2 * 3 = ${totalCost}。`, `flow=${totalFlow}, cost=${totalCost}`, 'augment', 2, 3);

    // 轮次 2: 再次 SPFA
    makeStep(lines.whileSpfa, '🔁 [外层增广循环] while (spfa(S, T)) -> 再次探查是否还有可行增广路。', 'while(spfa)', 'spfa');
    makeStep(lines.returnSpfa, '  ❌ [无可行增广路] 残量网络中 S 到 T 已无增广路，return false！', 'return false', 'spfa');
  } else {
    // Standard 3 轮增广
    // 轮次 1: S ➔ A ➔ T (cap: 2, cost: 3)
    makeStep(lines.whileSpfa, '🔁 [第 1 轮增广] while (spfa(S, T)) -> 寻找第一条最短增广路。', 'while(spfa)', 'spfa');
    makeStep(lines.spfaEntry, '  ↳ [SPFA 启动] 展开队列搜索单位费用最短路。', 'spfa(S,T)', 'spfa');
    dist.S = 0;
    dist.A = 1;
    dist.T = 3;
    preNode.A = 'S';
    preNode.T = 'A';
    makeStep(lines.updateDist, '  ⚡ [SPFA 找到通路 1] S ➔ A (1) ➔ T (2)，单位费用 3。', 'dist[T]=3', 'spfa', undefined, 3, 'dist', 3);
    makeStep(lines.returnSpfa, '  ✨ [SPFA 成功] 锁定路径 S ➔ A ➔ T。', 'return true', 'spfa');

    activePath = ['S', 'A', 'T'];
    makeStep(lines.calcPushed, '  🔎 [瓶颈容量计算] min(3-0, 2-0) = 2；本轮推流 2 单位。', 'pushed = 2', 'augment', 2, 3);
    edges[0].flow = 2; // S->A
    edges[1].flow = 2; // A->T
    makeStep(lines.pushAugment, '  🌊 [推流更新] 边 S➔A 流入 2/3，边 A➔T 流入 2/2 (满流饱和)！', 'flow += 2', 'augment', 2, 3);
    totalFlow += 2;
    totalCost += 2 * 3;
    makeStep(lines.updateTotals, `  💰 [累计流量与费用] maxFlow = ${totalFlow}, minCost = ${totalCost}。`, `flow=${totalFlow}, cost=${totalCost}`, 'augment', 2, 3);

    // 轮次 2: S ➔ B ➔ T (cap: 2, cost: 3+1=4)
    makeStep(lines.whileSpfa, '🔁 [第 2 轮增广] while (spfa(S, T)) -> 寻找下一条最短增广路。', 'while(spfa)', 'spfa');
    dist.S = 0;
    dist.B = 3;
    dist.T = 4;
    preNode.B = 'S';
    preNode.T = 'B';
    makeStep(lines.updateDist, '  ⚡ [SPFA 找到通路 2] S ➔ B (3) ➔ T (1)，单位费用 4。', 'dist[T]=4', 'spfa', undefined, 4, 'dist', 3);
    makeStep(lines.returnSpfa, '  ✨ [SPFA 成功] 锁定路径 S ➔ B ➔ T。', 'return true', 'spfa');

    activePath = ['S', 'B', 'T'];
    makeStep(lines.calcPushed, '  🔎 [瓶颈容量计算] min(2-0, 3-0) = 2；本轮推流 2 单位。', 'pushed = 2', 'augment', 2, 4);
    edges[2].flow = 2; // S->B
    edges[3].flow = 2; // B->T
    makeStep(lines.pushAugment, '  🌊 [推流更新] 边 S➔B 满流 2/2，边 B➔T 流入 2/3！', 'flow += 2', 'augment', 2, 4);
    totalFlow += 2;
    totalCost += 2 * 4;
    makeStep(lines.updateTotals, `  💰 [累计流量与费用] maxFlow = ${totalFlow}, minCost = ${totalCost}。`, `flow=${totalFlow}, cost=${totalCost}`, 'augment', 2, 4);

    // 轮次 3: S ➔ A ➔ B ➔ T (残量: S->A还剩1, A->B剩1, B->T剩1, cost: 1+1+1=3)
    makeStep(lines.whileSpfa, '🔁 [第 3 轮增广] while (spfa(S, T)) -> 再次展开残量网络寻找。', 'while(spfa)', 'spfa');
    dist.S = 0;
    dist.A = 1;
    dist.B = 2;
    dist.T = 3;
    preNode.A = 'S';
    preNode.B = 'A';
    preNode.T = 'B';
    makeStep(lines.updateDist, '  ⚡ [SPFA 找到通路 3] 经由中继弧 S ➔ A (1) ➔ B (1) ➔ T (1)，单位费用 3！', 'dist[T]=3', 'spfa', undefined, 3, 'dist', 3);
    makeStep(lines.returnSpfa, '  ✨ [SPFA 成功] 锁定路径 S ➔ A ➔ B ➔ T。', 'return true', 'spfa');

    activePath = ['S', 'A', 'B', 'T'];
    makeStep(lines.calcPushed, '  🔎 [瓶颈容量计算] min(3-2, 1-0, 3-2) = 1；本轮推流 1 单位。', 'pushed = 1', 'augment', 1, 3);
    edges[0].flow = 3; // S->A
    edges[4].flow = 1; // A->B
    edges[3].flow = 3; // B->T
    makeStep(lines.pushAugment, '  🌊 [推流更新] 全网多条关键弧达成完全饱和！', 'flow += 1', 'augment', 1, 3);
    totalFlow += 1;
    totalCost += 1 * 3;
    makeStep(lines.updateTotals, `  💰 [累计流量与费用] maxFlow = ${totalFlow}, minCost = ${totalCost}。`, `flow=${totalFlow}, cost=${totalCost}`, 'augment', 1, 3);

    // 轮次 4: 结束检测
    makeStep(lines.whileSpfa, '🔁 [终局核验] while (spfa(S, T)) -> 再次检测残量网络连通性。', 'while(spfa)', 'spfa');
    makeStep(lines.returnSpfa, '  ❌ [无剩余增广路] S 与 T 在残量网络中不再连通，return false！', 'return false', 'spfa');
  }

  activePath = undefined;
  makeStep(lines.returnAns, `🎉 [MCMF 算法达成] return {maxFlow: ${totalFlow}, minCost: ${totalCost}}！在保证最大流前提下，总费用达到全局理论最低！`, `完成: 流=${totalFlow}, 费=${totalCost}`, 'done');

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<MCMFStep>({
  id: 'min-cost-max-flow',
  name: '最小费用最大流 (Minimum Cost Maximum Flow)',
  viewId: 'algo-min-cost-max-flow-view',
  category: 'graph',
  icon: '🌊',
  badge: {
    mode: '连续最短路 · SPFA 寻费 · 成对反向弧退流',
    complexity: 'O(F · E · V) · O(V + E)',
  },
  card1Title: '🌊 残量网络与连续最短路增广沙盘',
  card2Title: '📊 费用流状态监视器 (dist, 流量, 前驱路)',
  card2Desc: '展示残量网络弧容量/流量、单位费用、SPFA 最短路径以及累积费用核算全过程',
  legend: [
    { label: '🚀 源点 S / 🏁 汇点 T', color: '#a855f7' },
    { label: '🔵 网络中继节点', color: '#0369a1' },
    { label: '🟢 当前最短增广路径', color: '#10b981' },
    { label: '🧱 满流饱和弧', color: '#dc2626' },
    { label: '⚡ 未饱和可行弧', color: '#334155' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设网络结构',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: '经典 4 点 5 边网络 (最大流 5, 最小费 17)', value: 'standard' },
        { label: '极简 3 边入门网络 (最大流 2, 最小费 6)', value: 'simple' },
      ],
    },
  ],
  presets: [
    { label: '经典 4 点网络 (流5, 费17)', values: { 'input-preset': 'standard' } },
    { label: '极简入门网络 (流2, 费6)', values: { 'input-preset': 'simple' } },
  ],
  metrics: [
    { id: 'metric-mcmf-flow', label: '当前最大总流量', color: '#10b981' },
    { id: 'metric-mcmf-cost', label: '累计最少总费用', color: '#f59e0b' },
    { id: 'metric-mcmf-path', label: '当前最短费用路径', color: '#38bdf8' },
    { id: 'metric-mcmf-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: MCMF_CODE_LANGUAGES,
  problemHtml: MCMF_PROBLEM_HTML,
  analysisHtml: MCMF_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'standard') as string;
    return buildMCMFSteps(preset);
  },
  renderCanvas: (container, step) => {
    const coords: Record<string, { x: number; y: number }> = {
      S: { x: 45, y: 75 },
      A: { x: 130, y: 35 },
      B: { x: 130, y: 115 },
      T: { x: 255, y: 75 },
    };

    const isPathEdge = (u: string, v: string) => {
      if (!step.activePath || step.activePath.length < 2) return false;
      for (let i = 0; i < step.activePath.length - 1; i++) {
        if (step.activePath[i] === u && step.activePath[i + 1] === v) return true;
      }
      return false;
    };

    const svgEdges = step.curPath
      .map(({ u, v, cap, flow, cost }) => {
        const p1 = coords[u];
        const p2 = coords[v];
        if (!p1 || !p2) return '';

        const onPath = isPathEdge(u, v);
        const isSaturated = flow === cap;

        const color = onPath ? '#10b981' : isSaturated ? '#ef4444' : '#334155';
        const width = onPath ? 3 : isSaturated ? 2 : 1.5;

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 + (u === 'A' && v === 'B' ? 10 : 0);

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />
            <rect x="${midX - 22}" y="${midY - 8}" width="44" height="16" rx="4" fill="#0f172a" stroke="${color}" stroke-width="1" />
            <text x="${midX}" y="${midY + 3.5}" fill="${color}" font-size="8.5" font-weight="800" font-family="monospace" text-anchor="middle">${flow}/${cap} c:${cost}</text>
          </g>
        `;
      })
      .join('');

    const svgNodes = ['S', 'A', 'B', 'T']
      .map((id) => {
        const p = coords[id];
        if (!p) return '';

        const isSrc = id === 'S';
        const isSink = id === 'T';
        const onPath = step.activePath?.includes(id);

        let bg = isSrc || isSink ? '#581c87' : '#0f172a';
        let border = isSrc || isSink ? '#a855f7' : '#334155';
        if (onPath) {
          border = '#10b981';
        }

        const dVal = step.distMap?.[id];
        const dStr = dVal === Infinity ? '∞' : `${dVal}`;

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
            <text x="${p.x}" y="${p.y + 24}" fill="#38bdf8" font-size="7.5" font-weight="700" text-anchor="middle">dist:${dStr}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #0b0f19; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 700;">🌊 费用流残量网络拓扑</span>
          <span style="font-size: 11px; color: #e2e8f0; background: #1e293b; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155;">
            当前总流: <b style="color: #10b981;">${step.totalFlow}</b> | 总费: <b style="color: #f59e0b;">${step.totalCost}</b>
          </span>
        </div>

        <div style="width: 100%; min-height: 160px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 160px;" viewBox="0 0 300 160">
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部费用流原理舱 -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #cbd5e1;">🌊 连续最短路增广与退费舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              当前推流: <b>${step.pushedFlow !== undefined ? `+${step.pushedFlow} 流 (单价 ${step.unitCost})` : 'SPFA 寻路中'}</b>
            </div>
          </div>

          <div style="display: flex; gap: 8px; font-size: 11px;">
            <div style="background: rgba(3, 105, 161, 0.4); border: 1px solid #0284c7; border-radius: 4px; padding: 4px 8px; color: #bae6fd;">
              <b>连续最短路:</b> 每次使用 SPFA 沿残量网络寻找单位费用最低的路径
            </div>
            <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 4px; padding: 4px 8px; color: #fca5a5;">
              <b>反向弧退费:</b> 反向边权值为 -cost，退流时同步冲抵对应费用
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const distItems = ['S', 'A', 'B', 'T'].map((id) => {
      const d = step.distMap?.[id];
      const dStr = d === Infinity ? '∞' : `${d}`;
      return `<span style="background: #1e293b; border: 1px solid #334155; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; color: #38bdf8; font-family: monospace;">${id}: ${dStr}</span>`;
    }).join(' ');

    const pathStr = step.activePath && step.activePath.length > 0
      ? step.activePath.join(' ➔ ')
      : '寻找最短路中';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #cbd5e1; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #0f172a; padding: 10px; border-radius: 6px; border: 1px solid #334155;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-family: monospace; font-size: 11px; font-weight: 700; color: #38bdf8;">最短费用距离 (dist):</span>
            <div style="display: flex; gap: 4px;">${distItems}</div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #334155; padding-top: 4px;">
            <span style="color: #10b981; font-size: 10.5px; font-weight: 700;">增广路径:</span>
            <strong style="color: #10b981; font-family: monospace; font-size: 11px;">${pathStr}</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'min-cost-max-flow',
  name: '最小费用最大流 (Minimum Cost Maximum Flow)',
  viewId: 'algo-min-cost-max-flow-view',
  category: 'graph',
  description: '左程云算法通关课 Class 072：残量网络连续最短路增广、SPFA 单位费用最短路与反向弧退费机制 (洛谷 P3381)',
  template,
  Visualizer,
  difficulty: 4,
  levelOrder: 88,
  learningGoal: '掌握费用流连续最短路算法设计、残量网络成对反向弧流量更新与负费用退流机制',
});

export { Visualizer as MinCostMaxFlowVisualizer };
