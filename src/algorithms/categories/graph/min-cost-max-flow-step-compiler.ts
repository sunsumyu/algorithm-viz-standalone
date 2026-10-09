/**
 * 最小费用最大流 (Minimum Cost Maximum Flow - MCMF SPFA) 步进编译器
 * 核心：连续最短路增广 (EK/SPFA)、单位费用最短路、成对反向弧负费用退流与总费用核算 (洛谷 P3381 / 左程云 class072)
 * 架构：严格解释器级全流程逐行高亮执行、纯中文步骤日志、四语言 (cpp / java / python / javascript) 1-based 行号映射
 */

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

  // 精准 19 处四语言映射行号字典 (1-based)
  const lines = {
    entry: { cpp: 62, java: 126, python: 182, javascript: 248 },
    whileSpfa: { cpp: 64, java: 128, python: 184, javascript: 250 },
    spfaEntry: { cpp: 35, java: 100, python: 162, javascript: 222 },
    initDist: { cpp: 36, java: 101, python: 163, javascript: 223 },
    initQueue: { cpp: 38, java: 102, python: 165, javascript: 225 },
    pushSrc: { cpp: 39, java: 103, python: 166, javascript: 226 },
    whileQueue: { cpp: 43, java: 107, python: 169, javascript: 229 },
    pollQueue: { cpp: 44, java: 108, python: 170, javascript: 230 },
    forEdges: { cpp: 46, java: 110, python: 172, javascript: 232 },
    checkRelax: { cpp: 48, java: 112, python: 173, javascript: 234 },
    updateDist: { cpp: 49, java: 113, python: 174, javascript: 235 },
    recordPre: { cpp: 50, java: 114, python: 175, javascript: 236 },
    checkInQueue: { cpp: 52, java: 116, python: 177, javascript: 238 },
    pushQueue: { cpp: 54, java: 118, python: 179, javascript: 240 },
    returnSpfa: { cpp: 59, java: 123, python: 180, javascript: 245 },
    calcPushed: { cpp: 65, java: 129, python: 185, javascript: 251 },
    pushAugment: { cpp: 70, java: 134, python: 194, javascript: 256 },
    updateTotals: { cpp: 75, java: 139, python: 201, javascript: 261 },
    returnAns: { cpp: 78, java: 142, python: 203, javascript: 264 },
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
  makeStep(
    lines.entry,
    '🚀 [MCMF 算法启动] getMinCostMaxFlow(S, T)：初始化最小费用最大流求解。',
    '进入最小费用最大流求解入口',
    'init'
  );

  if (isSimple) {
    // 轮次 1: S ➔ A ➔ T (cap: 2, cost: 1+2=3)
    makeStep(
      lines.whileSpfa,
      '🔁 [外层增广循环] while (spfa(S, T)) -> 寻找第一条单位费用最短增广路。',
      '外层增广循环：调用 SPFA 寻路',
      'spfa'
    );
    makeStep(lines.spfaEntry, '  ↳ [SPFA 入口] spfa(s=S, t=T)。', '进入 SPFA 算法入口', 'spfa');
    makeStep(
      lines.initDist,
      '  📊 [重置距离表] Arrays.fill(dist, ∞)；记录从 S 出发的最少单位费用。',
      '初始化最短费用距离数组 dist[]',
      'spfa',
      undefined,
      undefined,
      'dist'
    );
    makeStep(
      lines.initQueue,
      '  📦 [初始化 SPFA 队列] Queue<Integer> queue = new LinkedList<>()。',
      '初始化 SPFA 队列',
      'spfa'
    );
    makeStep(
      lines.pushSrc,
      '  🌱 [源点入队] queue.add(S), dist[S] = 0, inQueue[S] = true。',
      '源点 S 入队开启搜索',
      'spfa'
    );

    // 展开 S
    makeStep(
      lines.whileQueue,
      '  🔁 [队列展开] while (!queue.isEmpty()) -> 展开队列前沿。',
      'SPFA 队列开始循环处理',
      'spfa'
    );
    makeStep(lines.pollQueue, '  📤 [出队节点] poll() -> 弹出源点 S。', '源点 S 出队', 'spfa');
    dist.S = 0;
    makeStep(
      lines.forEdges,
      '  ↳ [遍历 S 的出边] 考察弧 S ➔ A (残量 2, 费用 1)。',
      '考察残量弧 (S ➔ A, 费用 1)',
      'spfa'
    );
    makeStep(
      lines.checkRelax,
      '  🔎 [松弛检验] if (cap - flow > 0 && dist[A] > dist[S] + cost) -> (true)。',
      '检验松弛条件成立',
      'spfa'
    );
    dist.A = 1;
    preNode.A = 'S';
    makeStep(
      lines.updateDist,
      '  ⚡ [更新最短路] dist[A] = dist[S] + 1 = 1。',
      '更新节点 A 费用距离 dist[A]=1',
      'spfa',
      undefined,
      undefined,
      'dist',
      1
    );
    makeStep(lines.recordPre, '  📝 [记录前驱弧] preNode[A] = S。', '记录前驱节点 preNode[A]=S', 'spfa');
    makeStep(lines.checkInQueue, '  🔎 [检查入队] if (!inQueue[A]) -> (true)。', '检查节点 A 未入队', 'spfa');
    makeStep(lines.pushQueue, '  📥 [节点入队] queue.add(A), inQueue[A] = true。', '节点 A 入队', 'spfa');

    // 展开 A
    makeStep(lines.whileQueue, '  🔁 [队列展开] while (!queue.isEmpty())。', '检查队列非空', 'spfa');
    makeStep(lines.pollQueue, '  📤 [出队节点] poll() -> 弹出中继点 A。', '中继点 A 出队', 'spfa');
    makeStep(
      lines.forEdges,
      '  ↳ [遍历 A 的出边] 考察弧 A ➔ T (残量 2, 费用 2)。',
      '考察残量弧 (A ➔ T, 费用 2)',
      'spfa'
    );
    makeStep(
      lines.checkRelax,
      '  🔎 [松弛检验] if (cap - flow > 0 && dist[T] > dist[A] + 2) -> (true)。',
      '检验松弛条件成立',
      'spfa'
    );
    dist.T = 3;
    preNode.T = 'A';
    makeStep(
      lines.updateDist,
      '  ⚡ [更新汇点距离] dist[T] = dist[A] + 2 = 3。',
      '更新汇点 T 费用距离 dist[T]=3',
      'spfa',
      undefined,
      3,
      'dist',
      3
    );
    makeStep(lines.recordPre, '  📝 [记录前驱弧] preNode[T] = A。', '记录前驱节点 preNode[T]=A', 'spfa');
    makeStep(lines.pushQueue, '  📥 [汇点入队] queue.add(T), inQueue[T] = true。', '汇点 T 入队', 'spfa');

    makeStep(lines.whileQueue, '  🔁 [队列处理汇点] 弹出 T，无出边松弛。', '汇点 T 出队，无后继松弛', 'spfa');
    makeStep(
      lines.returnSpfa,
      '  ✨ [找到增广路] return dist[T] < ∞ (true)！成功发现最短增广路 S ➔ A ➔ T！',
      'SPFA 成功返回 true，锁定通路',
      'spfa'
    );

    activePath = ['S', 'A', 'T'];
    makeStep(
      lines.calcPushed,
      '  🔎 [计算瓶颈残量] min(cap - flow) -> min(2-0, 2-0) = 2 单位流。',
      '计算增广路径瓶颈容量: 2',
      'augment',
      2,
      3
    );

    edges[0].flow = 2; // S->A
    edges[1].flow = 2; // A->T
    makeStep(
      lines.pushAugment,
      '  🌊 [正反向弧流量更新] 正向弧流量 +2，反向弧流量 -2；完成推流！',
      '沿路径推流 2 单位并更新反向弧',
      'augment',
      2,
      3
    );

    totalFlow += 2;
    totalCost += 2 * 3;
    makeStep(
      lines.updateTotals,
      `  💰 [累计总量] maxFlow += 2 = ${totalFlow}, minCost += 2 * 3 = ${totalCost}。`,
      `累计总流=${totalFlow}, 总费=${totalCost}`,
      'augment',
      2,
      3
    );

    // 轮次 2: 再次 SPFA
    makeStep(
      lines.whileSpfa,
      '🔁 [外层增广循环] while (spfa(S, T)) -> 再次探查是否还有可行增广路。',
      '再次运行 SPFA 探查增广路',
      'spfa'
    );
    makeStep(
      lines.returnSpfa,
      '  ❌ [无可行增广路] 残量网络中 S 到 T 已无增广路，return false！',
      '残量网络无增广路，返回 false',
      'spfa'
    );
  } else {
    // Standard 3 轮增广
    // 轮次 1: S ➔ A ➔ T (cap: 2, cost: 3)
    makeStep(
      lines.whileSpfa,
      '🔁 [第 1 轮增广] while (spfa(S, T)) -> 寻找第一条最短增广路。',
      '第 1 轮增广：SPFA 寻找增广路',
      'spfa'
    );
    makeStep(lines.spfaEntry, '  ↳ [SPFA 启动] 展开队列搜索单位费用最短路。', 'SPFA 启动队列搜索', 'spfa');
    dist.S = 0;
    dist.A = 1;
    dist.T = 3;
    preNode.A = 'S';
    preNode.T = 'A';
    makeStep(
      lines.updateDist,
      '  ⚡ [SPFA 找到通路 1] S ➔ A (1) ➔ T (2)，单位费用 3。',
      '发现最短路 1: 费用 dist[T]=3',
      'spfa',
      undefined,
      3,
      'dist',
      3
    );
    makeStep(lines.returnSpfa, '  ✨ [SPFA 成功] 锁定路径 S ➔ A ➔ T。', 'SPFA 成功锁定路径 S➔A➔T', 'spfa');

    activePath = ['S', 'A', 'T'];
    makeStep(
      lines.calcPushed,
      '  🔎 [瓶颈容量计算] min(3-0, 2-0) = 2；本轮推流 2 单位。',
      '计算增广瓶颈残量: 2',
      'augment',
      2,
      3
    );
    edges[0].flow = 2; // S->A
    edges[1].flow = 2; // A->T
    makeStep(
      lines.pushAugment,
      '  🌊 [推流更新] 边 S➔A 流入 2/3，边 A➔T 流入 2/2 (满流饱和)！',
      '沿路径推流 2 单位',
      'augment',
      2,
      3
    );
    totalFlow += 2;
    totalCost += 2 * 3;
    makeStep(
      lines.updateTotals,
      `  💰 [累计流量与费用] maxFlow = ${totalFlow}, minCost = ${totalCost}。`,
      `累计总流=${totalFlow}, 总费=${totalCost}`,
      'augment',
      2,
      3
    );

    // 轮次 2: S ➔ B ➔ T (cap: 2, cost: 3+1=4)
    makeStep(
      lines.whileSpfa,
      '🔁 [第 2 轮增广] while (spfa(S, T)) -> 寻找下一条最短增广路。',
      '第 2 轮增广：SPFA 寻找增广路',
      'spfa'
    );
    dist.S = 0;
    dist.B = 3;
    dist.T = 4;
    preNode.B = 'S';
    preNode.T = 'B';
    makeStep(
      lines.updateDist,
      '  ⚡ [SPFA 找到通路 2] S ➔ B (3) ➔ T (1)，单位费用 4。',
      '发现最短路 2: 费用 dist[T]=4',
      'spfa',
      undefined,
      4,
      'dist',
      3
    );
    makeStep(lines.returnSpfa, '  ✨ [SPFA 成功] 锁定路径 S ➔ B ➔ T。', 'SPFA 成功锁定路径 S➔B➔T', 'spfa');

    activePath = ['S', 'B', 'T'];
    makeStep(
      lines.calcPushed,
      '  🔎 [瓶颈容量计算] min(2-0, 3-0) = 2；本轮推流 2 单位。',
      '计算增广瓶颈残量: 2',
      'augment',
      2,
      4
    );
    edges[2].flow = 2; // S->B
    edges[3].flow = 2; // B->T
    makeStep(
      lines.pushAugment,
      '  🌊 [推流更新] 边 S➔B 满流 2/2，边 B➔T 流入 2/3！',
      '沿路径推流 2 单位',
      'augment',
      2,
      4
    );
    totalFlow += 2;
    totalCost += 2 * 4;
    makeStep(
      lines.updateTotals,
      `  💰 [累计流量与费用] maxFlow = ${totalFlow}, minCost = ${totalCost}。`,
      `累计总流=${totalFlow}, 总费=${totalCost}`,
      'augment',
      2,
      4
    );

    // 轮次 3: S ➔ A ➔ B ➔ T (残量: S->A还剩1, A->B剩1, B->T剩1, cost: 1+1+1=3)
    makeStep(
      lines.whileSpfa,
      '🔁 [第 3 轮增广] while (spfa(S, T)) -> 再次展开残量网络寻找。',
      '第 3 轮增广：残量网络寻找增广路',
      'spfa'
    );
    dist.S = 0;
    dist.A = 1;
    dist.B = 2;
    dist.T = 3;
    preNode.A = 'S';
    preNode.B = 'A';
    preNode.T = 'B';
    makeStep(
      lines.updateDist,
      '  ⚡ [SPFA 找到通路 3] 经由中继弧 S ➔ A (1) ➔ B (1) ➔ T (1)，单位费用 3！',
      '发现中继通路 3: 费用 dist[T]=3',
      'spfa',
      undefined,
      3,
      'dist',
      3
    );
    makeStep(lines.returnSpfa, '  ✨ [SPFA 成功] 锁定路径 S ➔ A ➔ B ➔ T。', 'SPFA 成功锁定路径 S➔A➔B➔T', 'spfa');

    activePath = ['S', 'A', 'B', 'T'];
    makeStep(
      lines.calcPushed,
      '  🔎 [瓶颈容量计算] min(3-2, 1-0, 3-2) = 1；本轮推流 1 单位。',
      '计算增广瓶颈残量: 1',
      'augment',
      1,
      3
    );
    edges[0].flow = 3; // S->A
    edges[4].flow = 1; // A->B
    edges[3].flow = 3; // B->T
    makeStep(lines.pushAugment, '  🌊 [推流更新] 全网多条关键弧达成完全饱和！', '关键弧满流推流', 'augment', 1, 3);
    totalFlow += 1;
    totalCost += 1 * 3;
    makeStep(
      lines.updateTotals,
      `  💰 [累计流量与费用] maxFlow = ${totalFlow}, minCost = ${totalCost}。`,
      `累计总流=${totalFlow}, 总费=${totalCost}`,
      'augment',
      1,
      3
    );

    // 轮次 4: 结束检测
    makeStep(
      lines.whileSpfa,
      '🔁 [终局核验] while (spfa(S, T)) -> 再次检测残量网络连通性。',
      '终局核验：再次检验残量网络',
      'spfa'
    );
    makeStep(
      lines.returnSpfa,
      '  ❌ [无剩余增广路] S 与 T 在残量网络中不再连通，return false！',
      '无剩余增广路，返回 false',
      'spfa'
    );
  }

  activePath = undefined;
  makeStep(
    lines.returnAns,
    `🎉 [MCMF 算法达成] return {maxFlow: ${totalFlow}, minCost: ${totalCost}}！在保证最大流前提下，总费用达到全局理论最低！`,
    `求解达成: 最大流=${totalFlow}, 最小费=${totalCost}`,
    'done'
  );

  return steps;
}
