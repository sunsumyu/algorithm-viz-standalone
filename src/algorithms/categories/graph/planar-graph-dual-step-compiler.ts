/**
 * 平面图最小割转对偶图最短路 (Planar Graph Min-Cut to Dual Graph Shortest Path · 洛谷 P4001 狼抓兔子) 步进编译器
 * 进阶图论: 狼抓兔子、平面图每个面抽象为点、最小割等价于对偶图最短路、Dijkstra 极速求解
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

export interface PlanarStep {
  curDualNode: string;
  distMap: Record<string, number>;
  visitedDual: string[];
  dualPq: Array<{ node: string; dist: number }>;
  bestDualPath?: string[];
  cutPlanarEdges?: Array<{ u: string; v: string }>;
  minCutVal: number;
  status: 'init' | 'dijkstra' | 'reach' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, any>;
}

export function buildPlanarDualSteps(): PlanarStep[] {
  const steps: PlanarStep[] = [];

  const lines: Record<string, number | number[]> = {
    init: 28,
    init2: 34,
    dijkstra: 43,
    dijkstra2: 53,
    dijkstra3: 54,
    dijkstra4: 52,
    reach: 45,
    reach2: 46,
    done: 46,
    done2: 58,
  };

  function makeStep(data: Omit<PlanarStep, 'metrics'>): PlanarStep {
    const topNode = data.dualPq.length > 0 ? `${data.dualPq[0].node}(${data.dualPq[0].dist})` : '空';
    return {
      ...data,
      metrics: {
        'metric-cur-face': data.curDualNode,
        'metric-min-cut': `${data.minCutVal}`,
        'metric-pq-top': topNode,
        'metric-visited-count': `${data.visitedDual.length}/6`,
        'cur-face': data.curDualNode,
        'min-cut': `${data.minCutVal}`,
        'pq-top': topNode,
        'visited-count': `${data.visitedDual.length}/6`,
      },
    };
  }

  // 1. 函数入口与原图转对偶图说明
  steps.push(
    makeStep({
      curDualNode: '——',
      distMap: { 'S*': Infinity, F1: Infinity, F2: Infinity, F3: Infinity, F4: Infinity, 'T*': Infinity },
      visitedDual: [],
      dualPq: [],
      minCutVal: 0,
      status: 'init',
      message: '🚀 [函数入口] dijkstraDual: 平面网格图转对偶图，面转对偶点，原图割边转化为对偶图连边。',
      log: '初始化 dijkstraDual，对偶点总数 6 (S*, F1~F4, T*)',
      codeLine: lines.init,
    })
  );

  // 2. 初始化距离数组与优先队列
  steps.push(
    makeStep({
      curDualNode: 'S*',
      distMap: { 'S*': 0, F1: Infinity, F2: Infinity, F3: Infinity, F4: Infinity, 'T*': Infinity },
      visitedDual: [],
      dualPq: [{ node: 'S*', dist: 0 }],
      minCutVal: 0,
      status: 'init',
      message: '📦 [Dijkstra 初始化] 设置起点 dist[S*] = 0，其余对偶点置为 ∞，小顶堆推入 (0, S*)。',
      log: 'Arrays.fill(dist, INF); dist[S*] = 0; pq.offer((0, S*))',
      codeLine: lines.init2,
    })
  );

  // 3. 弹出起点 S*
  steps.push(
    makeStep({
      curDualNode: 'S*',
      distMap: { 'S*': 0, F1: Infinity, F2: Infinity, F3: Infinity, F4: Infinity, 'T*': Infinity },
      visitedDual: ['S*'],
      dualPq: [],
      minCutVal: 0,
      status: 'dijkstra',
      message: '📤 [弹出堆顶 S*] 弹出当前距离最小节点 (0, S*)，标记 visited[S*] = true。',
      log: '| poll S* (dist=0), visited[S*]=true',
      codeLine: lines.dijkstra,
    })
  );

  // 4. S* 松弛 F1
  steps.push(
    makeStep({
      curDualNode: 'S*',
      distMap: { 'S*': 0, F1: 3, F2: Infinity, F3: Infinity, F4: Infinity, 'T*': Infinity },
      visitedDual: ['S*'],
      dualPq: [{ node: 'F1', dist: 3 }],
      minCutVal: 0,
      status: 'dijkstra',
      message: '⚡ [松弛对偶边 S*➔F1] 跨越原图边 (S, 1) 容量为 3，松弛 dist[F1] = 0 + 3 = 3，推入堆 (3, F1)。',
      log: '| relax (S* -> F1, w=3): dist[F1] = 3, pq.offer((3, F1))',
      codeLine: lines.dijkstra2,
    })
  );

  // 5. S* 松弛 F2
  steps.push(
    makeStep({
      curDualNode: 'S*',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: Infinity, F4: Infinity, 'T*': Infinity },
      visitedDual: ['S*'],
      dualPq: [
        { node: 'F1', dist: 3 },
        { node: 'F2', dist: 4 },
      ],
      minCutVal: 0,
      status: 'dijkstra',
      message: '⚡ [松弛对偶边 S*➔F2] 跨越原图底边界边容量 4，松弛 dist[F2] = 0 + 4 = 4，推入堆 (4, F2)。',
      log: '| relax (S* -> F2, w=4): dist[F2] = 4, pq.offer((4, F2))',
      codeLine: lines.dijkstra3,
    })
  );

  // 6. 弹出 F1
  steps.push(
    makeStep({
      curDualNode: 'F1',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: Infinity, F4: Infinity, 'T*': Infinity },
      visitedDual: ['S*', 'F1'],
      dualPq: [{ node: 'F2', dist: 4 }],
      minCutVal: 3,
      status: 'dijkstra',
      message: '📤 [弹出堆顶 F1] 堆顶最小值为 (3, F1)，弹出并标记 visited[F1] = true。',
      log: '| poll F1 (dist=3), visited[F1]=true',
      codeLine: lines.dijkstra,
    })
  );

  // 7. F1 松弛 F3
  steps.push(
    makeStep({
      curDualNode: 'F1',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: Infinity, 'T*': Infinity },
      visitedDual: ['S*', 'F1'],
      dualPq: [
        { node: 'F2', dist: 4 },
        { node: 'F3', dist: 5 },
      ],
      minCutVal: 3,
      status: 'dijkstra',
      message: '⚡ [松弛对偶边 F1➔F3] 跨越原图对角割边 (1, 2) 容量 2，松弛 dist[F3] = 3 + 2 = 5，推入堆。',
      log: '| relax (F1 -> F3, w=2): dist[F3] = 5, pq.offer((5, F3))',
      codeLine: lines.dijkstra2,
    })
  );

  // 8. 弹出 F2
  steps.push(
    makeStep({
      curDualNode: 'F2',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: Infinity, 'T*': Infinity },
      visitedDual: ['S*', 'F1', 'F2'],
      dualPq: [{ node: 'F3', dist: 5 }],
      minCutVal: 4,
      status: 'dijkstra',
      message: '📤 [弹出堆顶 F2] 堆顶为 (4, F2)，弹出并标记 visited[F2] = true。',
      log: '| poll F2 (dist=4), visited[F2]=true',
      codeLine: lines.dijkstra,
    })
  );

  // 9. F2 松弛 F4
  steps.push(
    makeStep({
      curDualNode: 'F2',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': Infinity },
      visitedDual: ['S*', 'F1', 'F2'],
      dualPq: [
        { node: 'F3', dist: 5 },
        { node: 'F4', dist: 7 },
      ],
      minCutVal: 4,
      status: 'dijkstra',
      message: '⚡ [松弛对偶边 F2➔F4] 跨越内部横向边容量 3，松弛 dist[F4] = 4 + 3 = 7，推入堆 (7, F4)。',
      log: '| relax (F2 -> F4, w=3): dist[F4] = 7, pq.offer((7, F4))',
      codeLine: lines.dijkstra3,
    })
  );

  // 10. 弹出 F3
  steps.push(
    makeStep({
      curDualNode: 'F3',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': Infinity },
      visitedDual: ['S*', 'F1', 'F2', 'F3'],
      dualPq: [{ node: 'F4', dist: 7 }],
      minCutVal: 5,
      status: 'dijkstra',
      message: '📤 [弹出堆顶 F3] 堆顶为 (5, F3)，弹出并标记 visited[F3] = true。',
      log: '| poll F3 (dist=5), visited[F3]=true',
      codeLine: lines.dijkstra,
    })
  );

  // 11. F3 松弛 T*
  steps.push(
    makeStep({
      curDualNode: 'F3',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
      visitedDual: ['S*', 'F1', 'F2', 'F3'],
      dualPq: [
        { node: 'F4', dist: 7 },
        { node: 'T*', dist: 8 },
      ],
      minCutVal: 5,
      status: 'dijkstra',
      message: '⚡ [松弛对偶边 F3➔T*] 跨越原图割边 (2, T) 容量 3，松弛 dist[T*] = 5 + 3 = 8，推入堆 (8, T*)。',
      log: '| relax (F3 -> T*, w=3): dist[T*] = 8, pq.offer((8, T*))',
      codeLine: lines.dijkstra2,
    })
  );

  // 12. 弹出 F4
  steps.push(
    makeStep({
      curDualNode: 'F4',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
      visitedDual: ['S*', 'F1', 'F2', 'F3', 'F4'],
      dualPq: [{ node: 'T*', dist: 8 }],
      minCutVal: 7,
      status: 'dijkstra',
      message: '📤 [弹出堆顶 F4] 堆顶为 (7, F4)，弹出并标记 visited[F4] = true。',
      log: '| poll F4 (dist=7), visited[F4]=true',
      codeLine: lines.dijkstra,
    })
  );

  // 13. F4 尝试松弛 T* (松弛失败)
  steps.push(
    makeStep({
      curDualNode: 'F4',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
      visitedDual: ['S*', 'F1', 'F2', 'F3', 'F4'],
      dualPq: [{ node: 'T*', dist: 8 }],
      minCutVal: 7,
      status: 'dijkstra',
      message: '🔍 [检验 F4➔T*] dist[F4] + 2 = 7 + 2 = 9 > dist[T*]=8，已有更优解，跳过松弛。',
      log: '| skip (F4 -> T*): 9 > 8, 无更优解',
      codeLine: lines.dijkstra4,
    })
  );

  // 14. 弹出对偶汇点 T*
  steps.push(
    makeStep({
      curDualNode: 'T*',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
      visitedDual: ['S*', 'F1', 'F2', 'F3', 'F4', 'T*'],
      dualPq: [],
      minCutVal: 8,
      status: 'reach',
      message: '🎯 [到达对偶汇点 T*] 弹出 (8, T*)，检测到当前节点即为目标对偶汇点 T*！',
      log: '| poll T* (dist=8), 命中目标 dest',
      codeLine: lines.reach,
    })
  );

  // 15. 提前终止并返回
  steps.push(
    makeStep({
      curDualNode: 'T*',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
      visitedDual: ['S*', 'F1', 'F2', 'F3', 'F4', 'T*'],
      dualPq: [],
      bestDualPath: ['S*', 'F1', 'F3', 'T*'],
      minCutVal: 8,
      status: 'reach',
      message: '🏁 [提前终止返回] u == dest 触发 return d = 8，成功截断其余无效搜索！',
      log: 'if (u == dest) return 8;',
      codeLine: lines.reach2,
    })
  );

  // 16. 回溯对偶路径 (T* <- F3)
  steps.push(
    makeStep({
      curDualNode: 'T*',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
      visitedDual: ['S*', 'F1', 'F2', 'F3', 'F4', 'T*'],
      dualPq: [],
      bestDualPath: ['F3', 'T*'],
      cutPlanarEdges: [{ u: '2', v: 'T' }],
      minCutVal: 8,
      status: 'reach',
      message: '🔗 [路径回溯 1] 对偶边 (F3, T*) 穿透原图割边 (2, T)，对应容量 3。',
      log: '回溯对偶路径：T* <- F3 (穿透原图边 2-T)',
      codeLine: lines.reach2,
    })
  );

  // 17. 回溯对偶路径 (F3 <- F1)
  steps.push(
    makeStep({
      curDualNode: 'F3',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
      visitedDual: ['S*', 'F1', 'F2', 'F3', 'F4', 'T*'],
      dualPq: [],
      bestDualPath: ['F1', 'F3', 'T*'],
      cutPlanarEdges: [
        { u: '1', v: '2' },
        { u: '2', v: 'T' },
      ],
      minCutVal: 8,
      status: 'reach',
      message: '🔗 [路径回溯 2] 对偶边 (F1, F3) 穿透原图对角割边 (1, 2)，对应容量 2。',
      log: '回溯对偶路径：F3 <- F1 (穿透原图对角边 1-2)',
      codeLine: lines.reach2,
    })
  );

  // 18. 回溯对偶路径 (F1 <- S*)
  steps.push(
    makeStep({
      curDualNode: 'F1',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
      visitedDual: ['S*', 'F1', 'F2', 'F3', 'F4', 'T*'],
      dualPq: [],
      bestDualPath: ['S*', 'F1', 'F3', 'T*'],
      cutPlanarEdges: [
        { u: 'S', v: '1' },
        { u: '1', v: '2' },
        { u: '2', v: 'T' },
      ],
      minCutVal: 8,
      status: 'reach',
      message: '🔗 [路径回溯 3] 对偶边 (S*, F1) 穿透原图顶割边 (S, 1)，对应容量 3。',
      log: '回溯对偶路径：F1 <- S* (穿透原图边 S-1)',
      codeLine: lines.reach2,
    })
  );

  // 19. 对偶路径与原图割割边对应全貌
  steps.push(
    makeStep({
      curDualNode: 'T*',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
      visitedDual: ['S*', 'F1', 'F2', 'F3', 'F4', 'T*'],
      dualPq: [],
      bestDualPath: ['S*', 'F1', 'F3', 'T*'],
      cutPlanarEdges: [
        { u: 'S', v: '1' },
        { u: '1', v: '2' },
        { u: '2', v: 'T' },
      ],
      minCutVal: 8,
      status: 'done',
      message: '👑 [对偶最短路径锁定] 最短路径 S* ➔ F1 ➔ F3 ➔ T*，路径权值和 = 3 + 2 + 3 = 8。',
      log: '对偶最短路径 S* -> F1 -> F3 -> T*，总长度 8',
      codeLine: lines.done,
    })
  );

  // 20. 平面图最小割定理完美成立
  steps.push(
    makeStep({
      curDualNode: 'T*',
      distMap: { 'S*': 0, F1: 3, F2: 4, F3: 5, F4: 7, 'T*': 8 },
      visitedDual: ['S*', 'F1', 'F2', 'F3', 'F4', 'T*'],
      dualPq: [],
      bestDualPath: ['S*', 'F1', 'F3', 'T*'],
      cutPlanarEdges: [
        { u: 'S', v: '1' },
        { u: '1', v: '2' },
        { u: '2', v: 'T' },
      ],
      minCutVal: 8,
      status: 'done',
      message: '🎉 [平面图最小割定理验证完成] 原图最小割容量 = 对偶图最短路 = 8！用 Dijkstra O(E log V) 完美替代 O(V²E) 最大流！',
      log: '✓ 验证通过：Min-Cut(S, T) = Shortest-Path(S*, T*) = 8',
      codeLine: lines.done2,
    })
  );

  return steps;
}
