/**
 * 网络延迟时间 (Network Delay Time - LeetCode 743) 声明式可视化器
 * 核心：Dijkstra 算法堆优化、单源最短路波前广播、全网信号覆盖最大时间 max(dist[i])
 * 深度架构重构：严格解释器级全流程逐行高亮执行（源点信号发射、小根堆波前扫描、出边松弛、全网连通性核验均发射独立Step）、四语言行号映射
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  NETWORK_DELAY_CODE_LANGUAGES,
  NETWORK_DELAY_PROBLEM_HTML,
  NETWORK_DELAY_ANALYSIS_HTML,
} from './network-delay-time-problem-content';
import { HighlightTarget } from '../../../core/code-panel';

export interface NetworkDelayStep {
  curNode: number;
  distList: number[];
  visitedList: boolean[];
  pqSnapshot: Array<{ u: number; d: number }>;
  maxDelaySoFar: number;
  isAllReached: boolean;
  activeEdge?: [number, number, number];
  activeArray?: 'dist' | 'visited' | 'pq';
  activeSlot?: number;
  status: 'init' | 'emit' | 'pop' | 'relax' | 'check' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export function buildNetworkDelaySteps(isReachable: boolean = true): NetworkDelayStep[] {
  const steps: NetworkDelayStep[] = [];

  const n = isReachable ? 4 : 3;
  const k = isReachable ? 2 : 1;
  const times: Array<[number, number, number]> = isReachable
    ? [
        [2, 1, 1],
        [2, 3, 1],
        [3, 4, 1],
      ]
    : [[1, 2, 1]];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
  for (const [u, v, w] of times) {
    adj[u].push({ to: v, w });
  }

  const distance: number[] = new Array(n + 1).fill(Infinity);
  const visited: boolean[] = new Array(n + 1).fill(false);
  const pq: Array<{ u: number; d: number }> = [];

  function pushPq(u: number, d: number): void {
    pq.push({ u, d });
    pq.sort((a, b) => a.d - b.d);
  }

  function pollPq(): { u: number; d: number } {
    return pq.shift()!;
  }

  let curNode = k;
  let activeEdge: [number, number, number] | undefined = undefined;
  let maxDelaySoFar = 0;
  let isAllReached = false;

  // 精准 18 处四语言映射行号字典 (cpp / java / python / javascript)
  const lines = {
    entry: { cpp: 11, java: 8, python: 3, javascript: 2 },
    initDistance: { cpp: 19, java: 17, python: 11, javascript: 11 },
    initVisited: { cpp: 20, java: 20, python: 12, javascript: 12 },
    initSrc: { cpp: 23, java: 19, python: 15, javascript: 15 },
    initPq: { cpp: 24, java: 22, python: 16, javascript: 16 },
    whilePq: { cpp: 26, java: 24, python: 18, javascript: 18 },
    popNode: { cpp: 27, java: 25, python: 19, javascript: 19 },
    checkVisited: { cpp: 28, java: 27, python: 20, javascript: 21 },
    markVisited: { cpp: 29, java: 28, python: 22, javascript: 22 },
    loopNeighbors: { cpp: 31, java: 29, python: 25, javascript: 25 },
    checkRelax: { cpp: 33, java: 31, python: 27, javascript: 27 },
    applyRelax: { cpp: 34, java: 32, python: 28, javascript: 28 },
    pushPq: { cpp: 35, java: 33, python: 29, javascript: 29 },
    initAns: { cpp: 41, java: 38, python: 33, javascript: 33 },
    loopAns: { cpp: 42, java: 39, python: 34, javascript: 34 },
    checkUnreachable: { cpp: 43, java: 40, python: 35, javascript: 35 },
    updateMax: { cpp: 44, java: 41, python: 36, javascript: 36 },
    returnAns: { cpp: 46, java: 43, python: 37, javascript: 37 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'emit' | 'pop' | 'relax' | 'check' | 'done',
    activeArray?: 'dist' | 'visited' | 'pq',
    activeSlot?: number
  ): void {
    const curStr = status === 'done' ? '广播结算完毕' : `Node ${curNode}`;
    const delayStr = maxDelaySoFar === -1 ? '-1 (存在孤立点)' : `${maxDelaySoFar} ms`;
    const phaseStr =
      status === 'done'
        ? '延迟计算完成'
        : status === 'check'
          ? '全网连通性检验'
          : status === 'relax'
            ? '出边信号松弛传播'
            : status === 'pop'
              ? '堆顶出堆锁定'
              : '广播源初始化';

    steps.push({
      curNode,
      distList: [...distance],
      visitedList: [...visited],
      pqSnapshot: pq.map((x) => ({ ...x })),
      maxDelaySoFar,
      isAllReached,
      activeEdge,
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-delay-cur': curStr,
        'metric-delay-max': delayStr,
        'metric-delay-pq': `${pq.length} 个节点就绪`,
        'metric-delay-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] networkDelayTime(times, n=${n}, k=${k})：准备从源点 ${k} 开始信号扩散。`, `networkDelayTime(${n}, ${k})`, 'init');
  makeStep(lines.initDistance, `📊 [初始化距离数组] int[] distance = new int[${n + 1}]；全部填充为无穷大 ∞。`, 'distance = new int[n+1]', 'init');
  makeStep(lines.initVisited, `🏷️ [初始化访问数组] boolean[] visited = new boolean[${n + 1}]；用于防止环路重复探索。`, 'visited = new boolean[n+1]', 'init');

  distance[k] = 0;
  makeStep(lines.initSrc, `📡 [设置发射源点] distance[${k}] = 0：信号在时刻 0 从源节点 ${k} 发射！`, `distance[${k}] = 0`, 'emit', 'dist', k);

  pushPq(k, 0);
  makeStep(lines.initPq, `📥 [源点加入波前堆] pq.add([${k}, 0])；小根堆初始化完成。`, `pq.add(${k}, 0)`, 'emit', 'pq', 0);

  // 2. Dijkstra 堆优化循环
  while (pq.length > 0) {
    makeStep(lines.whilePq, `🔁 [检查堆非空] while (!pq.isEmpty()) -> 当前波前队列待扩散状态数: ${pq.length}。`, `!pq.isEmpty() (len=${pq.length})`, 'pop');

    const top = pollPq();
    curNode = top.u;
    const curD = top.d;
    makeStep(lines.popNode, `📤 [弹出堆顶最短到达点] poll() -> 节点 ${curNode} (耗时 ${curD} ms)。`, `poll Node ${curNode}`, 'pop', 'pq', 0);

    makeStep(lines.checkVisited, `🔎 [检查是否已访问] if (visited[${curNode}]) -> (${visited[curNode]})。`, `visited[${curNode}]?`, 'pop', 'visited', curNode);
    if (visited[curNode]) {
      makeStep(lines.checkVisited, `⏭️ [跳过冗余状态] 节点 ${curNode} 信号此前已到达并锁定，跳过。`, `skip visited Node ${curNode}`, 'pop');
      continue;
    }

    visited[curNode] = true;
    makeStep(lines.markVisited, `🔒 [锁定信号抵达] visited[${curNode}] = true；节点 ${curNode} 信号到达时间固定为 ${distance[curNode]} ms！`, `visited[${curNode}] = true`, 'pop', 'visited', curNode);

    for (const e of adj[curNode]) {
      const v = e.to;
      const w = e.w;
      activeEdge = [curNode, v, w];

      makeStep(lines.loopNeighbors, `  ↳ [遍历出边传播] 考察有向信道 (${curNode} ➔ ${v}, 传输延迟 ${w} ms)。`, `channel (${curNode}, ${v})`, 'relax');

      makeStep(lines.checkRelax, `  🔎 [松弛判定] if (!visited[${v}] && distance[${curNode}]+${w} < distance[${v}]) -> (!${visited[v]} && ${distance[curNode] + w} < ${distance[v] === Infinity ? '∞' : distance[v]})。`, `check relax (${curNode}->${v})`, 'relax');

      if (!visited[v] && distance[curNode] + w < distance[v]) {
        distance[v] = distance[curNode] + w;
        makeStep(lines.applyRelax, `  ⚡ [更新到达时间] 发现更早抵达路径！更新 distance[${v}] = ${distance[v]} ms！`, `distance[${v}] = ${distance[v]}`, 'relax', 'dist', v);

        pushPq(v, distance[v]);
        makeStep(lines.pushPq, `  📥 [新信号波前入堆] pq.add([${v}, ${distance[v]}])；节点 ${v} 进入就绪波前！`, `pq.add(${v}, ${distance[v]})`, 'relax', 'pq', pq.length - 1);
      }
    }
    activeEdge = undefined;
  }

  // 3. 全网收齐统计与连通性检验
  makeStep(lines.initAns, '📊 [统计全网信号收齐时间] int ans = 0；检查所有 1..n 节点是否均已收到信号。', 'int ans = 0', 'check');

  let ans = 0;
  let hasInf = false;
  for (let i = 1; i <= n; i++) {
    makeStep(lines.loopAns, `🔁 [检验节点连通] for (int i = ${i}; i <= ${n}; i++)。`, `for i=${i}`, 'check', 'dist', i);

    makeStep(lines.checkUnreachable, `🔎 [孤立点核验] if (distance[${i}] == Integer.MAX_VALUE) -> (${distance[i] === Infinity})。`, `distance[${i}] == INF?`, 'check', 'dist', i);

    if (distance[i] === Infinity) {
      hasInf = true;
      maxDelaySoFar = -1;
      isAllReached = false;
      makeStep(lines.checkUnreachable, `❌ [存在孤立点] 节点 ${i} 始终无法接收到信号，全网不可达！立即 return -1！`, `return -1 (Node ${i} unreachable)`, 'check', 'dist', i);
      break;
    }

    ans = Math.max(ans, distance[i]);
    maxDelaySoFar = ans;
    makeStep(lines.updateMax, `📈 [刷新最大延迟] ans = max(${ans}, distance[${i}]=${distance[i]}) = ${ans} ms。`, `ans = ${ans}`, 'check');
  }

  if (!hasInf) {
    isAllReached = true;
    maxDelaySoFar = ans;
    makeStep(lines.returnAns, `🎉 [全网广播成功] return ans = ${ans} ms！所有节点均收到信号，全网完全覆盖最迟时间为 ${ans} ms！`, `return ${ans}`, 'done');
  } else {
    makeStep(lines.returnAns, '⚠️ [广播失败] return -1：网络存在孤立节点，无法实现全网信号覆盖。', 'return -1', 'done');
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<NetworkDelayStep>({
  id: 'network-delay-time',
  name: '网络延迟时间 (Network Delay Time)',
  viewId: 'algo-network-delay-time-view',
  category: 'graph',
  icon: '📡',
  badge: {
    mode: '单源最短路 Dijkstra · 波前广播模型',
    complexity: 'O(E log V) · O(V + E)',
  },
  card1Title: '📡 网络拓扑与信号波前广播舱',
  card2Title: '📊 网络状态监视器 (distance[], visited[], PQ 优先队列)',
  card2Desc: '展示从源点 k 出发 Dijkstra 信号广播向外扩散、松弛各节点到达时间与全网收齐时间 max(dist[i])',
  legend: [
    { label: '📡 广播发射源点 (k)', color: '#a855f7' },
    { label: '✔ 信号已接收锁定', color: '#10b981' },
    { label: '⚡ 当前波前扩散点', color: '#f59e0b' },
    { label: '❌ 信号不可达孤立点', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-preset',
      label: '预设网络连通模式',
      type: 'select',
      defaultValue: 'reachable_4node',
      options: [
        { label: '4 节点全连通广播 (源点 2，全覆盖延迟 2 ms)', value: 'reachable_4node' },
        { label: '3 节点含孤立盲区 (源点 1，节点 3 不可达返回 -1)', value: 'unreachable_3node' },
      ],
    },
  ],
  presets: [
    { label: '4 节点全连通', values: { 'input-preset': 'reachable_4node' } },
    { label: '3 节点孤立盲区', values: { 'input-preset': 'unreachable_3node' } },
  ],
  metrics: [
    { id: 'metric-delay-cur', label: '当前扩散节点', color: '#f59e0b' },
    { id: 'metric-delay-max', label: '全网延迟时间', color: '#10b981' },
    { id: 'metric-delay-pq', label: '波前优先队列', color: '#38bdf8' },
    { id: 'metric-delay-phase', label: '当前算法阶段', color: '#a855f7' },
  ],
  codeLanguages: NETWORK_DELAY_CODE_LANGUAGES,
  problemHtml: NETWORK_DELAY_PROBLEM_HTML,
  analysisHtml: NETWORK_DELAY_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const preset = (inputs['input-preset'] || 'reachable_4node') as string;
    return buildNetworkDelaySteps(preset === 'reachable_4node');
  },
  renderCanvas: (container, step) => {
    const n = step.distList.length - 1;
    const is4 = n === 4;

    const nodeCoords: Record<number, { x: number; y: number }> = is4
      ? {
          2: { x: 55, y: 75 },
          1: { x: 155, y: 35 },
          3: { x: 155, y: 115 },
          4: { x: 255, y: 75 },
        }
      : {
          1: { x: 65, y: 75 },
          2: { x: 165, y: 75 },
          3: { x: 255, y: 75 },
        };

    const edges: Array<[number, number, number]> = is4
      ? [
          [2, 1, 1],
          [2, 3, 1],
          [3, 4, 1],
        ]
      : [[1, 2, 1]];

    const svgEdges = edges
      .map(([u, v, w]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';

        const isAct = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const color = isAct ? '#facc15' : '#64748b';
        const width = isAct ? 3.5 : 1.5;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" marker-end="url(#delay-arrow)" />
            <rect x="${mx - 8}" y="${my - 7}" width="16" height="12" rx="3" fill="#0f172a" stroke="#334155" />
            <text x="${mx}" y="${my + 2}" fill="#94a3b8" font-size="8" font-weight="700" text-anchor="middle">${w}ms</text>
          </g>
        `;
      })
      .join('');

    const nodes = is4 ? [1, 2, 3, 4] : [1, 2, 3];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';

        const isCur = step.curNode === u && step.status !== 'done';
        const isVis = step.visitedList[u];
        const dVal = step.distList[u];
        const isInf = dVal === Infinity;
        const dStr = isInf ? '∞' : `${dVal}ms`;

        const bg = isCur ? '#b45309' : isVis ? '#065f46' : isInf && step.status === 'done' ? '#831843' : '#1e293b';
        const border = isCur ? '#facc15' : isVis ? '#10b981' : isInf && step.status === 'done' ? '#ef4444' : '#475569';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isCur || isVis ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="${isVis ? '#10b981' : isInf ? '#ef4444' : '#f59e0b'}" font-size="7.5" font-weight="700" text-anchor="middle">${dStr}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; justify-content: flex-start; align-items: stretch; background: #f8fafc; padding: 12px; border-radius: 8px; box-sizing: border-box; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
          <span style="font-size: 12px; color: #374151; font-weight: 700;">📡 网络延迟拓扑与信号传播</span>
          <span style="font-size: 11px; color: #1e293b; background: #eff6ff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e2e8f0;">
            信号已收齐: <b style="color: #10b981;">${step.visitedList.filter(Boolean).length}</b> / ${n} 点
          </span>
        </div>

        <div style="width: 100%; min-height: 150px; background: #0f172a; border-radius: 8px; display: flex; justify-content: center; align-items: center; border: 1px solid #334155;">
          <svg style="width: 100%; height: 150px;" viewBox="0 0 310 150">
            <defs>
              <marker id="delay-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
              </marker>
            </defs>
            ${svgEdges}
            ${svgNodes}
          </svg>
        </div>

        <!-- 底部波前广播舱 -->
        <div style="background: #eff6ff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11.5px; font-weight: 800; color: #374151;">📡 信号波前广播舱</span>
            <div style="font-size: 11px; color: #38bdf8;">
              当前最迟抵达时间: <b>${step.maxDelaySoFar === -1 ? '-1 (孤立点)' : `${step.maxDelaySoFar} ms`}</b>
            </div>
          </div>

          <div style="display: flex; gap: 8px; align-items: center; font-size: 11px;">
            <div style="background: rgba(6, 95, 70, 0.4); border: 1px solid #10b981; border-radius: 4px; padding: 4px 8px; color: #a7f3d0;">
              <b>已接收节点:</b> [${step.visitedList.map((v, i) => v ? `N${i}` : '').filter(Boolean).join(', ') || '空'}]
            </div>
            <div style="background: rgba(30, 41, 59, 0.8); border: 1px solid #38bdf8; border-radius: 4px; padding: 4px 8px; color: #38bdf8;">
              <b>波前堆待扩散:</b> ${step.pqSnapshot.length} 个
            </div>
          </div>
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    const n = step.distList.length - 1;
    const indices = Array.from({ length: n }, (_, i) => i + 1);

    const renderRow = (name: string, arr: any[], activeName: string, color: string, formatVal: (v: any) => string) => {
      const cells = indices
        .map((idx) => {
          const val = arr[idx];
          const isActive = step.activeArray === activeName && step.activeSlot === idx;
          const displayVal = formatVal(val);
          const bg = isActive ? '#fef3c7' : '#ffffff';
          const textCol = isActive ? '#b45309' : '#0f172a';
          const border = isActive ? '2px solid #f59e0b' : '1px solid #cbd5e1';

          return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 34px; height: 32px; background: ${bg}; border: ${border}; border-radius: 4px; color: ${textCol}; font-family: monospace; font-size: 11px; font-weight: 700;">
              <span style="font-size: 8px; color: #64748b; line-height: 1;">N[${idx}]</span>
              <span style="line-height: 1.1;">${displayVal}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 135px; color: ${color};">${name}:</span>
          <div style="display: flex; gap: 4px;">${cells}</div>
        </div>
      `;
    };

    const distRow = renderRow('distance[] (到达时间)', step.distList, 'dist', '#38bdf8', (v) => v === Infinity ? '∞' : `${v}`);
    const visRow = renderRow('visited[] (已锁定)', step.visitedList, 'visited', '#10b981', (v) => v ? 'T' : 'F');

    const pqStr = step.pqSnapshot.length > 0 ? step.pqSnapshot.map((x) => `(N${x.u}, ${x.d}ms)`).join(' ➔ ') : '空';

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #374151; padding: 4px 8px; box-sizing: border-box;">
        <div style="display: flex; flex-direction: column; gap: 6px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          ${distRow}
          ${visRow}
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed #cbd5e1; padding-top: 4px;">
            <span style="color: #a855f7; font-size: 10.5px; font-weight: 700;">波前小根堆:</span>
            <strong style="color: #a855f7; font-family: monospace; font-size: 11px;">[ ${pqStr} ]</strong>
          </div>
        </div>
      </div>
    `;
  },
});

registerAlgorithm({
  id: 'network-delay-time',
  name: '网络延迟时间 (Network Delay Time)',
  viewId: 'algo-network-delay-time-view',
  category: 'graph',
  description: '左程云 Class 064 最短路模版：从源点 k 出发跑堆优化 Dijkstra、信号全网广播、全网覆盖时间 max(dist[1..n]) (LeetCode 743)',
  icon: '📡',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 22,
  learningGoal: '掌握经典堆优化 Dijkstra 模板实现、单源最短路波前广播思想与不可达全网检测',
});

export { Visualizer as NetworkDelayTimeVisualizer };
