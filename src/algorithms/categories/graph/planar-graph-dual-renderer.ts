/**
 * 平面图最小割转对偶图最短路 (Planar Graph Min-Cut to Dual Graph Shortest Path) 声明式可视化器
 * 进阶图论: 狼抓兔子、平面图每个面抽象为点、最小割等价于对偶图最短路、Dijkstra 极速求解 (洛谷 P4001)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  PLANAR_DUAL_CODE_LANGUAGES,
  PLANAR_DUAL_PROBLEM_HTML,
  PLANAR_DUAL_ANALYSIS_HTML,
} from './planar-graph-dual-problem-content';

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
      codeLine: 28,
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
      codeLine: 34,
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
      codeLine: 43,
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
      codeLine: 53,
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
      codeLine: 54,
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
      codeLine: 43,
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
      codeLine: 53,
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
      codeLine: 43,
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
      codeLine: 54,
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
      codeLine: 43,
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
      codeLine: 53,
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
      codeLine: 43,
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
      codeLine: 52,
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
      codeLine: 45,
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
      codeLine: 46,
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
      codeLine: 46,
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
      codeLine: 46,
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
      codeLine: 46,
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
      codeLine: 46,
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
      codeLine: 58,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<PlanarStep>({
  id: 'planar-graph-dual',
  name: '平面图最小割转对偶最短路 (Planar Dual)',
  viewId: 'algo-planar-graph-dual-view',
  category: 'graph',
  icon: '🌐',
  badge: {
    mode: '对偶图 Dijkstra 最短路',
    complexity: 'O(E log V) · O(V + E)',
  },
  card1Title: '🌐 平面网格图与对偶图穿透沙盘',
  card2Title: '🧭 对偶面距离 dist[F_i] 监视器',
  card2Desc: '各面抽象对偶节点、跨边权值映射与最小割对应关系',
  legend: [
    { label: '原图网格节点 (S, 1..4, T)', color: '#0284c7' },
    { label: '⭐ 对偶点 (S*, T*, F1..F4)', color: '#f59e0b' },
    { label: '🔴 最小割被切原边', color: '#ef4444' },
    { label: '🟢 对偶图最优最短路径', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '2x2 网格经典狼抓兔子 (P4001)', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-face', label: '当前对偶面', color: '#f59e0b' },
    { id: 'metric-min-cut', label: '对偶最短路 (最小割)', color: '#10b981' },
    { id: 'metric-pq-top', label: '堆顶候选', color: '#38bdf8' },
    { id: 'metric-visited-count', label: '已访问对偶点', color: '#8b5cf6' },
  ],
  codeLanguages: PLANAR_DUAL_CODE_LANGUAGES,
  problemHtml: PLANAR_DUAL_PROBLEM_HTML,
  analysisHtml: PLANAR_DUAL_ANALYSIS_HTML,
  buildSteps: () => buildPlanarDualSteps(),
  renderCanvas: (container, step) => {
    const isDone = step.status === 'reach' || step.status === 'done';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #f8fafc; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          <!-- 原图网格边 (灰底/红割) -->
          <line x1="60" y1="150" x2="155" y2="150" stroke="${isDone ? '#ef4444' : '#475569'}" stroke-width="${isDone ? 3 : 1.5}" />
          <line x1="155" y1="150" x2="250" y2="150" stroke="#475569" stroke-width="1.5" />
          <line x1="60" y1="50" x2="155" y2="50" stroke="#475569" stroke-width="1.5" />
          <line x1="155" y1="50" x2="250" y2="50" stroke="${isDone ? '#ef4444' : '#475569'}" stroke-width="${isDone ? 3 : 1.5}" />
          <line x1="60" y1="50" x2="60" y2="150" stroke="#475569" stroke-width="1.5" />
          <line x1="155" y1="50" x2="155" y2="150" stroke="${isDone ? '#ef4444' : '#475569'}" stroke-width="${isDone ? 3 : 1.5}" />
          <line x1="250" y1="50" x2="250" y2="150" stroke="#475569" stroke-width="1.5" />

          <!-- 对偶图最短路 (绿线穿透) -->
          ${
            isDone
              ? `
            <line x1="40" y1="180" x2="105" y2="100" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" />
            <line x1="105" y1="100" x2="205" y2="100" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" />
            <line x1="205" y1="100" x2="270" y2="20" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" />
          `
              : ''
          }

          <!-- 原图节点 -->
          <g><circle cx="60" cy="150" r="11" fill="#0284c7" /><text x="60" y="154" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">S</text></g>
          <g><circle cx="155" cy="150" r="11" fill="#0284c7" /><text x="155" y="154" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">1</text></g>
          <g><circle cx="250" cy="150" r="11" fill="#0284c7" /><text x="250" y="154" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">2</text></g>
          <g><circle cx="60" cy="50" r="11" fill="#0284c7" /><text x="60" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">3</text></g>
          <g><circle cx="155" cy="50" r="11" fill="#0284c7" /><text x="155" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">4</text></g>
          <g><circle cx="250" cy="50" r="11" fill="#0284c7" /><text x="250" y="54" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">T</text></g>

          <!-- 对偶点 -->
          <g><circle cx="40" cy="180" r="12" fill="#f59e0b" /><text x="40" y="184" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle">S*</text></g>
          <g><circle cx="105" cy="100" r="10" fill="#f59e0b" /><text x="105" y="104" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">F1</text></g>
          <g><circle cx="205" cy="100" r="10" fill="#f59e0b" /><text x="205" y="104" fill="#ffffff" font-size="8.5" font-weight="800" text-anchor="middle">F3</text></g>
          <g><circle cx="270" cy="20" r="12" fill="#f59e0b" /><text x="270" y="24" fill="#ffffff" font-size="9.5" font-weight="800" text-anchor="middle">T*</text></g>
        </svg>
        <div style="font-size: 10.5px; color: #64748b; text-align: center;">
          🟢 绿色虚线为对偶图从 S* 到 T* 的最短路径 | 🔴 红色为对应的原图最小割割边
        </div>
      </div>
    `;

    const root = container.closest('#algo-planar-graph-dual-view');
    if (root) {
      const faceEl = root.querySelector('#metric-cur-face') || root.querySelector('#cur-face');
      const cutEl = root.querySelector('#metric-min-cut') || root.querySelector('#min-cut');
      const pqEl = root.querySelector('#metric-pq-top') || root.querySelector('#pq-top');
      const visitedEl = root.querySelector('#metric-visited-count') || root.querySelector('#visited-count');

      if (faceEl) faceEl.textContent = step.curDualNode;
      if (cutEl) cutEl.textContent = `${step.minCutVal}`;
      if (pqEl) pqEl.textContent = step.dualPq.length > 0 ? `${step.dualPq[0].node}(${step.dualPq[0].dist})` : '空';
      if (visitedEl) visitedEl.textContent = `${step.visitedDual.length}/6`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const distItems = Object.entries(step.distMap)
          .map(([f, d]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10.5px;">${f}: <strong style="color: #2563eb;">${d === Infinity ? '∞' : d}</strong></span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>对偶面距离表 dist[F]:</span>
              <div style="display: flex; gap: 4px;">${distItems}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 平面图最小割对偶定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">MinCut(s, t) = ShortestPath(S*, T*)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'planar-graph-dual',
  name: '平面图最小割转对偶最短路 (Planar Dual)',
  viewId: 'algo-planar-graph-dual-view',
  category: 'graph',
  description: '进阶图论经典对偶转化：平面图每个面抽象为点、最小割等价于对偶图最短路、Dijkstra 极速求解 (洛谷 P4001 狼抓兔子)',
  icon: '🌐',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 66,
  learningGoal: '掌握平面图面与对偶点的构造对应关系、最小割转对偶最短路的严格数学证明与 Dijkstra 加速',
});

export { Visualizer as PlanarGraphDualVisualizer };
