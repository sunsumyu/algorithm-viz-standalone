/**
 * 混合图欧拉回路与网络流定向 (Mixed Graph Eulerian Circuit - POJ 1637) 声明式可视化器
 * 进阶网络流建模: 任意初始定向、度数差额 D[u]、Dinic 最大流调整方向、满流判定
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  MIXED_EULER_CODE_LANGUAGES,
  MIXED_EULER_PROBLEM_HTML,
  MIXED_EULER_ANALYSIS_HTML,
} from './mixed-eulerian-circuit-problem-content';

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
  codeLine: number | number[];
  metrics?: Record<string, any>;
}

export function buildMixedEulerSteps(isSolvableCase: boolean): MixedEulerStep[] {
  const steps: MixedEulerStep[] = [];

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
        codeLine: 91,
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
        codeLine: 93,
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
        codeLine: 103,
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
        codeLine: 103,
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
        codeLine: 103,
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
        codeLine: 110,
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
        codeLine: 113,
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
        codeLine: 118,
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
        codeLine: 119,
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
        codeLine: 120,
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
        codeLine: 122,
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
        codeLine: 123,
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
        codeLine: 125,
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
        codeLine: 130,
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
        codeLine: 43,
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
        codeLine: 58,
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
        codeLine: 61,
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
        codeLine: 77,
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
        codeLine: 131,
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
        codeLine: 131,
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
        codeLine: 131,
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
        codeLine: 91,
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
        codeLine: 93,
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
        codeLine: 103,
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
        codeLine: 103,
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
        codeLine: 118,
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
        codeLine: 119,
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
        codeLine: 119,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
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
        codeLine: 120,
      })
    );
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<MixedEulerStep>({
  id: 'mixed-eulerian-circuit',
  name: '混合图欧拉回路 (Mixed Eulerian Circuit)',
  category: 'graph',
  icon: '🔄',
  badge: {
    mode: '初始定向 + 最大流反转',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '🌐 混合图初始定向与边反转沙盘',
  card2Title: '🧭 入出度差额 D[u] 与满流监视器',
  card2Desc: '无向边初始方向、差额 D[u]=(in-out)/2 与网络流反向调整',
  legend: [
    { label: '原始有向边', color: '#38bdf8' },
    { label: '🔄 反转有向边', color: '#10b981' },
    { label: '度数平衡节点', color: '#0284c7' },
  ],
  inputs: [
    {
      id: 'input-solvable',
      label: '用例模式',
      type: 'select',
      defaultValue: 'solvable',
      options: [
        { label: '标准可行混合图 (POJ 1637)', value: 'solvable' },
        { label: '奇偶不符无解图', value: 'unsolvable' },
      ],
      width: '180px',
    },
  ],
  presets: [
    { label: '标准可行混合图 (POJ 1637)', values: { 'input-solvable': 'solvable' } },
    { label: '奇偶不符无解图', values: { 'input-solvable': 'unsolvable' } },
  ],
  metrics: [
    { id: 'metric-deg-diff', label: '出入度差额 D[u]', color: '#f59e0b' },
    { id: 'metric-flow', label: '最大流推流 / 目标', color: '#2563eb' },
    { id: 'metric-euler-status', label: '欧拉回路判定', color: '#10b981' },
    { id: 'metric-flipped-count', label: '反转边数量', color: '#a855f7' },
  ],
  codeLanguages: MIXED_EULER_CODE_LANGUAGES,
  problemHtml: MIXED_EULER_PROBLEM_HTML,
  analysisHtml: MIXED_EULER_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const isSolvable = (inputs['input-solvable'] || 'solvable') === 'solvable';
    return buildMixedEulerSteps(isSolvable);
  },
  renderCanvas: (container, step) => {
    const nodePositions: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 55 },
      2: { x: 235, y: 55 },
      3: { x: 235, y: 175 },
      4: { x: 75, y: 175 },
    };

    const svgEdges = step.directedEdges
      .map((e) => {
        const p1 = nodePositions[e.u];
        const p2 = nodePositions[e.v];
        if (!p1 || !p2) return '';

        const color = e.isFlipped ? '#10b981' : '#38bdf8';
        const strokeWidth = e.isFlipped ? 3 : 1.5;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${strokeWidth}" marker-end="url(#arrow-${e.isFlipped ? 'flipped' : 'default'})" />
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const pos = nodePositions[u];
        if (!pos) return '';
        const inDeg = step.degIn[u] || 0;
        const outDeg = step.degOut[u] || 0;
        const isBalanced = inDeg === outDeg;

        return `
          <g>
            <circle cx="${pos.x}" cy="${pos.y}" r="15" fill="${isBalanced ? '#065f46' : '#1e3a8a'}" stroke="${isBalanced ? '#10b981' : '#38bdf8'}" stroke-width="2" />
            <text x="${pos.x}" y="${pos.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${pos.x}" y="${pos.y + 26}" fill="${isBalanced ? '#34d399' : '#facc15'}" font-size="9" font-weight="700" text-anchor="middle">in:${inDeg} out:${outDeg}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          <defs>
            <marker id="arrow-default" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-flipped" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色边为经 Dinic 最大流满流调整后反转的边 | 所有节点 in == out 即满足欧拉图条件
        </div>
      </div>
    `;

    const root =
      container.closest('#algo-mixed-eulerian-circuit-view') ||
      container.parentElement ||
      container.ownerDocument;
    if (root) {
      const degDiffEl = root.querySelector('#metric-deg-diff') || root.querySelector('#deg-diff');
      const flowEl = root.querySelector('#metric-flow') || root.querySelector('#flow');
      const eulerEl = root.querySelector('#metric-euler-status') || root.querySelector('#euler-status');
      const flipEl = root.querySelector('#metric-flipped-count') || root.querySelector('#flipped-count');

      if (degDiffEl && step.metrics?.['metric-deg-diff']) {
        degDiffEl.textContent = step.metrics['metric-deg-diff'];
      }
      if (flowEl) flowEl.textContent = `${step.flowVal} / ${step.maxFlowTarget}`;
      if (flipEl) flipEl.textContent = `${step.flippedCount ?? 0} 条`;
      if (eulerEl) {
        eulerEl.textContent =
          step.status === 'done'
            ? step.isEulerian
              ? '✓ 存在欧拉回路'
              : '❌ 无欧拉回路'
            : '求解中...';
        eulerEl.style.color = step.isEulerian ? '#10b981' : step.status === 'done' ? '#ef4444' : '#d97706';
      }

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 混合图欧拉回路定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">maxFlow == ∑max(0, (in - out)/2)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'mixed-eulerian-circuit',
  name: '混合图欧拉回路 (Mixed Eulerian Circuit)',
  viewId: 'algo-mixed-eulerian-circuit-view',
  category: 'graph',
  description: '进阶网络流经典建模：任意初始定向、出入度差额 D[u]、Dinic 最大流调整方向与满流回路判定 (POJ 1637)',
  icon: '🔄',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 71,
  learningGoal: '掌握混合图欧拉回路转化为网络流最大流的建模技巧、奇偶性判别及残量网络边反转重构回路',
});

export { Visualizer as MixedEulerianCircuitVisualizer };
