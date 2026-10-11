/**
 * 混合图欧拉回路与网络流定向 (Mixed Eulerian Circuit) — 步进编译器
 * 纯状态机推演：初始定向、度数差额、Dinic 最大流与回路判定
 */

import type { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface MixedEulerStep {
  directedEdges: Array<{ u: number; v: number; isFlipped: boolean }>;
  degIn: Record<number, number>;
  degOut: Record<number, number>;
  flowVal: number;
  maxFlowTarget: number;
  flippedCount?: number;
  isEulerian: boolean;
  status: 'init' | 'orient' | 'degree' | 'parity' | 'network' | 'dinic' | 'flip' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, any>;
}

export function buildMixedEulerSteps(isSolvableCase: boolean): MixedEulerStep[] {
  const steps: MixedEulerStep[] = [];
  // 四语言 1-based 相对行号映射字典
  const lines = {
    entry:          { java: 91,  cpp: 72, python: 4,  javascript: 2 },
    setupST:        { java: 93,  cpp: 23, python: 6,  javascript: 4 },
    statDirected:   { java: 103, cpp: 28, python: 16, javascript: 13 },
    orientUndir:    { java: 110, cpp: 32, python: 19, javascript: 16 },
    addNetworkEdge: { java: 113, cpp: 33, python: 20, javascript: 17 },
    checkParity:    { java: 118, cpp: 76, python: 24, javascript: 24 },
    addSTEdge:      { java: 125, cpp: 85, python: 26, javascript: 26 },
    dinicLoop:      { java: 79,  cpp: 65, python: 63, javascript: 68 },
    dinicBfs:       { java: 43,  cpp: 30, python: 35, javascript: 34 },
    dinicDfs:       { java: 61,  cpp: 47, python: 47, javascript: 51 },
    checkFlow:      { java: 128, cpp: 86, python: 70, javascript: 76 },
    done:           { java: 131, cpp: 86, python: 70, javascript: 76 },
  };


  function makeStep(data: Omit<MixedEulerStep, 'metrics'>): MixedEulerStep {
    const diffStr = Object.entries(data.degIn)
      .map(([node, inD]) => {
        const outD = data.degOut[Number(node)] || 0;
        const d = inD - outD;
        return `N${node}:${d >= 0 ? '+' + d : d}`;
      })
      .join(' ');
    const flowStr = `${data.flowVal} / ${data.maxFlowTarget}`;
    const eulerStr =
      data.status === 'done'
        ? data.isEulerian
          ? '✓ 存在欧拉回路'
          : '❌ 无欧拉回路'
        : '求解中...';
    const flippedStr = `${data.flippedCount ?? 0} 条`;

    return {
      ...data,
      metrics: {
        'metric-deg-diff': diffStr,
        'metric-flow': flowStr,
        'metric-euler-status': eulerStr,
        'metric-flipped-count': flippedStr,
        'deg-diff': diffStr,
        flow: flowStr,
        'euler-status': eulerStr,
        'flipped-count': flippedStr,
      },
    };
  }

  if (isSolvableCase) {
    // 4 节点可解情况: 4 条有向外环 (1->2, 2->3, 3->4, 4->1), 1 条无向弦 (1-3)
    const initEdges = [
      { u: 1, v: 2, isFlipped: false },
      { u: 2, v: 3, isFlipped: false },
      { u: 3, v: 4, isFlipped: false },
      { u: 4, v: 1, isFlipped: false },
      { u: 1, v: 3, isFlipped: false }, // 无向边初始假定 1 -> 3
    ];
    const flippedEdges = [
      { u: 1, v: 2, isFlipped: false },
      { u: 2, v: 3, isFlipped: false },
      { u: 3, v: 4, isFlipped: false },
      { u: 4, v: 1, isFlipped: false },
      { u: 3, v: 1, isFlipped: true }, // 反向后 3 -> 1
    ];

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 0, 3: 0, 4: 0 },
        degOut: { 1: 0, 2: 0, 3: 0, 4: 0 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'init',
        message: '🚀 [算法入口] solve: 给定 4 节点混合图（4 条有向边，1 条待定向无向边 1-3）。',
        log: 'solve(n=4, directed=[4], undirected=[1])',
        codeLine: lines.entry,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 0, 3: 0, 4: 0 },
        degOut: { 1: 0, 2: 0, 3: 0, 4: 0 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'network',
        message: '⚡ [设立网络源汇] 建立超级源点 S = 0，超级汇点 T = 5。',
        log: 'S = 0, T = 5',
        codeLine: lines.setupST,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 0, 4: 0 },
        degOut: { 1: 1, 2: 0, 3: 0, 4: 0 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'orient',
        message: '🧭 [统计固定有向边] 处理有向边 1➔2：out[1]++, in[2]++。',
        log: 'edge (1,2): out[1]=1, in[2]=1',
        codeLine: lines.statDirected,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1, 4: 0 },
        degOut: { 1: 1, 2: 1, 3: 0, 4: 0 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'orient',
        message: '🧭 [统计固定有向边] 处理有向边 2➔3：out[2]++, in[3]++。',
        log: 'edge (2,3): out[2]=1, in[3]=1',
        codeLine: lines.statDirected,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 1, 4: 1 },
        degOut: { 1: 1, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'orient',
        message: '🧭 [统计剩余有向边] 处理 3➔4 与 4➔1，外围有向四边形回路统计完毕。',
        log: 'edges (3,4),(4,1) 统计完毕',
        codeLine: lines.statDirected,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'orient',
        message: '🔀 [任意初始定向] 无向边 1-3 任意定向为 1➔3：out[1]++, in[3]++。',
        log: '无向边 1-3 初始定向 1->3: out[1]=2, in[3]=2',
        codeLine: lines.orientUndir,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'network',
        message: '🌊 [网络流加边] 在网络流图中添加 1➔3 容量为 1 的边（允许网络流反向调流）。',
        log: 'addEdge(1, 3, cap=1, edgeId=0)',
        codeLine: lines.addNetworkEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'degree',
        message: '📊 [统计节点出入度] 各点入度 in=[1, 1, 2, 1]，出度 out=[2, 1, 1, 1]。',
        log: 'in=[1,1,2,1], out=[2,1,1,1]',
        codeLine: lines.checkParity,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'degree',
        message: '📐 [计算度数差额] D[u] = in[u] - out[u]: D[1]=-1, D[2]=0, D[3]=+1, D[4]=0。',
        log: 'D[1]=-1, D[2]=0, D[3]=+1, D[4]=0',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'parity',
        message: '⚖️ [奇偶性校验通过] 差额总和为 0，每条边改变度数差 2，无孤立奇度数冲突点。',
        log: '奇偶性检验全部满足：diff % 2 == 0',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'network',
        message: '🔌 [建源点边] 节点 3 差额 D[3]=+1>0 (入度过多)，连 S ➔ 3，容量 D/2 = 1。',
        log: 'addEdge(S, 3, cap=1)',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'network',
        message: '🎯 [计算目标需求流] sumFlowNeed += 1，网络流必须达到 1 才能调平所有度数！',
        log: 'sumFlowNeed = 1',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'network',
        message: '🔌 [建汇点边] 节点 1 差额 D[1]=-1<0 (出度过多)，连 1 ➔ T，容量 -D/2 = 1。',
        log: 'addEdge(1, T, cap=1)',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'dinic',
        message: '🌊 [启动 Dinic 最大流] 调用 dinic() 求解最大流网络。',
        log: 'dinic() 开始执行',
        codeLine: lines.checkFlow,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'dinic',
        message: '📈 [Dinic BFS 分层] 从源点 S 广度优先搜索构建层级图 level[]。',
        log: 'bfs(): level[0]=0, level[3]=1, level[1]=2, level[5]=3',
        codeLine: lines.dinicBfs,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 0,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'dinic',
        message: '🎯 [汇点可达] level[T] != -1，成功找到通向汇点的分层增广网络！',
        log: 'level[T] = 3 (可达)',
        codeLine: lines.dinicDfs,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 1,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'dinic',
        message: '🚀 [Dinic DFS 增广] 沿增广路 S(0) ➔ 3 ➔ 1 ➔ T(5) 推送流 1 单位！',
        log: 'dfs push flow = 1 along S->3->1->T',
        codeLine: lines.dinicDfs,
      })
    );

    steps.push(
      makeStep({
        directedEdges: initEdges.map((e) => ({ ...e })),
        degIn: { 1: 1, 2: 1, 3: 2, 4: 1 },
        degOut: { 1: 2, 2: 1, 3: 1, 4: 1 },
        flowVal: 1,
        maxFlowTarget: 1,
        flippedCount: 0,
        isEulerian: false,
        status: 'dinic',
        message: '📉 [残量网络饱和] 边 1➔3 的反向容量已用满，更新 flow=1，再次 BFS 汇点不可达。',
        log: 'bfs 返回 false，Dinic 循环结束，maxFlow = 1',
        codeLine: lines.dinicLoop,
      })
    );

    steps.push(
      makeStep({
        directedEdges: flippedEdges.map((e) => ({ ...e })),
        degIn: { 1: 2, 2: 1, 3: 1, 4: 1 },
        degOut: { 1: 1, 2: 1, 3: 2, 4: 1 },
        flowVal: 1,
        maxFlowTarget: 1,
        flippedCount: 1,
        isEulerian: true,
        status: 'flip',
        message: '🔄 [执行边反转] 边 1➔3 满流，将其反转为 3➔1！此时节点 1 和 3 出入度被完美调平！',
        log: '反转边 1->3 为 3->1',
        codeLine: lines.done,
      })
    );

    steps.push(
      makeStep({
        directedEdges: flippedEdges.map((e) => ({ ...e })),
        degIn: { 1: 2, 2: 1, 3: 1, 4: 1 },
        degOut: { 1: 1, 2: 1, 3: 2, 4: 1 },
        flowVal: 1,
        maxFlowTarget: 1,
        flippedCount: 1,
        isEulerian: true,
        status: 'done',
        message: '👑 [满流验证成功] maxFlow == sumFlowNeed (1 == 1)！所有点满足 in[u] == out[u]！',
        log: '✓ 满流验证成功：欧拉回路充要条件成立',
        codeLine: lines.done,
      })
    );

    steps.push(
      makeStep({
        directedEdges: flippedEdges.map((e) => ({ ...e })),
        degIn: { 1: 2, 2: 1, 3: 1, 4: 1 },
        degOut: { 1: 1, 2: 1, 3: 2, 4: 1 },
        flowVal: 1,
        maxFlowTarget: 1,
        flippedCount: 1,
        isEulerian: true,
        status: 'done',
        message: '🎉 [求解完成] 混合图欧拉回路存在：1 ➔ 2 ➔ 3 ➔ 1 ➔ 2 ➔ 3 ➔ 4 ➔ 1！返回 true！',
        log: '✓ return true; 算法执行完毕！',
        codeLine: lines.done,
      })
    );
  } else {
    // 奇偶不合无解用例
    const unsolvableEdges = [
      { u: 1, v: 2, isFlipped: false },
      { u: 2, v: 3, isFlipped: false },
    ];

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 0, 3: 0 },
        degOut: { 1: 0, 2: 0, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'init',
        message: '🚀 [算法入口] solve: 给定 3 节点混合图用例，检验欧拉回路存在性。',
        log: 'solve: 输入 3 节点图',
        codeLine: lines.entry,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 0, 3: 0 },
        degOut: { 1: 0, 2: 0, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'network',
        message: '⚡ [设立网络源汇] 建立超级源点 S = 0，汇点 T = 4。',
        log: 'S = 0, T = 4',
        codeLine: lines.setupST,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 0 },
        degOut: { 1: 1, 2: 0, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'orient',
        message: '🧭 [统计固定有向边] 处理有向边 1➔2：out[1]++, in[2]++。',
        log: 'edge (1,2): out[1]=1, in[2]=1',
        codeLine: lines.statDirected,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'orient',
        message: '🧭 [统计固定有向边] 处理有向边 2➔3：out[2]++, in[3]++。',
        log: 'edge (2,3): out[2]=1, in[3]=1',
        codeLine: lines.statDirected,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'degree',
        message: '📊 [统计节点出入度] 各点入度 in=[0, 1, 1]，出度 out=[1, 1, 0]。',
        log: 'in=[0,1,1], out=[1,1,0]',
        codeLine: lines.checkParity,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'degree',
        message: '📐 [计算度数差额] D[u] = in[u] - out[u]: D[1]=-1, D[2]=0, D[3]=+1。',
        log: 'D[1]=-1, D[2]=0, D[3]=+1',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'parity',
        message: '⚠️ [奇偶性检测] 检测节点 1: diff = in[1] - out[1] = -1。',
        log: 'diff = -1',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'parity',
        message: '❌ [奇偶性校验失败] diff % 2 != 0！节点 1 的度数差额为奇数 -1！',
        log: 'diff % 2 != 0',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'parity',
        message: '💡 [原理分析] 任意一条边反转均改变度数差 2，无法将奇数差额调平至 0！',
        log: '反转边步长为 2，奇数不可达',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'parity',
        message: '🛑 [触发快速剪枝] 满足无解充要条件，无需进入 Dinic 最大流网络构建。',
        log: '快速剪枝触发',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'parity',
        message: '🔍 [失衡节点锁定] 节点 1 只有一条出边无入边，不可闭环。',
        log: '锁定孤立端点 Node 1',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'parity',
        message: '🔍 [失衡节点锁定] 节点 3 只有一条入边无出边，无法流出。',
        log: '锁定孤立端点 Node 3',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'parity',
        message: '📉 [差额不可消除] 无论无向边如何定向，必有节点 in != out。',
        log: '差额不可消除证明完毕',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'parity',
        message: '🛑 [判定阶段结束] 奇偶性矛盾，无解结论成立。',
        log: '无解结论确认',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'done',
        message: '❌ [判定无欧拉回路] 图中存在度数奇点，无法遍历所有边并回到起点。',
        log: '欧拉回路不存在',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'done',
        message: '❌ [算法返回] return false; 判定混合图无欧拉回路。',
        log: 'return false;',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'done',
        message: '📊 [最终指标汇总] 最大流 0 / 2，调平失败。',
        log: 'flow: 0 / 2',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'done',
        message: '🔒 [状态固化] 节点不平衡，回路不可解。',
        log: 'isEulerian = false',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'done',
        message: '🏁 [检查完成] 无解用例快速剪枝验证通过。',
        log: '剪枝校验通过',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'done',
        message: '✓ [算法执行完毕] 返回 false。混合图欧拉回路判定完毕！',
        log: '✓ return false; 算法执行完毕！',
        codeLine: lines.addSTEdge,
      })
    );

    steps.push(
      makeStep({
        directedEdges: unsolvableEdges.map((e) => ({ ...e })),
        degIn: { 1: 0, 2: 1, 3: 1 },
        degOut: { 1: 1, 2: 1, 3: 0 },
        flowVal: 0,
        maxFlowTarget: 2,
        flippedCount: 0,
        isEulerian: false,
        status: 'done',
        message: '✓ [退出] solve 执行完毕。',
        log: 'exit solve',
        codeLine: lines.addSTEdge,
      })
    );
  }

  return steps;
}