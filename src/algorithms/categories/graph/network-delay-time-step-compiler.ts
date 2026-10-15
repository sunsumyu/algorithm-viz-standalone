/**
 * 网络延迟时间 (Network Delay Time - LeetCode 743) 步进编译器 (Deep Module)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：网络拓扑建模、Dijkstra 堆优化波前广播追踪、四语言 1-based 行号联动
 */

import { HighlightTarget } from '../../../core/code-panel';
import { AlgorithmExecutionTraceEngine } from '../../../core/algorithm-execution-trace-engine';

export interface NetworkDelayStepVars {
  curNode: number;
  u: number;
  d?: number;
  k: number;
  n: number;
  times?: Array<[number, number, number]>;
  graph?: Array<Array<{ to: number; w: number }>>;
  adj?: Array<Array<{ to: number; w: number }>>;
  cur?: [number, number];
  activeEdge?: [number, number, number];
  edge?: [number, number];
  v?: number;
  w?: number;
  i?: number;
  distance?: number[];
  dist?: number[];
  distList: number[];
  visited?: boolean[];
  visitedList: boolean[];
  pqSnapshot: Array<{ u: number; d: number }>;
  maxDelaySoFar: number;
  maxDelay?: number;
  ans?: number;
  isAllReached: boolean;
  activeArray?: 'dist' | 'visited' | 'pq';
  activeSlot?: number;
  status: 'init' | 'emit' | 'pop' | 'relax' | 'check' | 'done';
  pqAction?: 'push' | 'poll' | 'check' | 'empty' | 'idle';
  lastPqItem?: { u: number; d: number };
  varDetails?: Record<string, string>;
}

export const NETWORK_DELAY_VAR_DETAILS: Record<string, string> = {
  k: '信号广播源点 (起始发射节点)',
  n: '网络节点总数 (标记为 1 到 n)',
  times: '有向加权边传输耗时列表 [u, v, w]',
  graph: '全图节点有向出边邻接表',
  adj: '全图节点有向出边邻接表',
  distance: '源点 k 到各节点的最短时间表 (到达延迟)',
  dist: '源点 k 到各节点的最短时间表 (到达延迟)',
  visited: '节点信号锁定状态 (true 为已锁定最短时间)',
  pq: '波前优先队列小根堆 (按到达耗时由小到大排队)',
  cur: '堆顶当前弹出的波前元组 [节点 u, 到达延迟 d]',
  u: '当前出堆并向外扩散信号的源头节点',
  v: '当前正在考察的链路下跳目标节点',
  w: '链路有向传输耗时 (ms)',
  d: '当前波前到达延迟耗时 (与 distance[u] 比较判定是否剪枝)',
  edge: '当前正在传播信号的有向链路 [v, w]',
  ans: '全网所有节点都收到信号的最迟时刻 max(dist[1..n])',
  maxDelay: '全网所有节点都收到信号的最迟时刻',
  i: '全网连通性核验指针 (节点 1..n)',
};

export interface NetworkDelayStep {
  curNode: number;
  u?: number;
  d?: number;
  k?: number;
  n?: number;
  times?: Array<[number, number, number]>;
  graph?: Array<Array<{ to: number; w: number }>>;
  adj?: Array<Array<{ to: number; w: number }>>;
  cur?: [number, number];
  distList: number[];
  distance?: number[];
  dist?: number[];
  visitedList: boolean[];
  visited?: boolean[];
  pqSnapshot: Array<{ u: number; d: number }>;
  maxDelaySoFar: number;
  maxDelay?: number;
  ans?: number;
  isAllReached: boolean;
  activeEdge?: [number, number, number];
  edge?: [number, number];
  v?: number;
  w?: number;
  i?: number;
  activeArray?: 'dist' | 'visited' | 'pq';
  activeSlot?: number;
  status: 'init' | 'emit' | 'pop' | 'relax' | 'check' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
  vars?: NetworkDelayStepVars;
  varDetails?: Record<string, string>;
  pqAction?: 'push' | 'poll' | 'check' | 'empty' | 'idle';
  lastPqItem?: { u: number; d: number };
}

export const NETWORK_DELAY_ANCHOR_MAP: Record<string, Record<string, number>> = {
  cpp: {
    entry: 3,
    initDistance: 11,
    initVisited: 12,
    initSrc: 14,
    initPq: 15,
    whilePq: 17,
    popNode: 18,
    checkVisited: 19,
    markVisited: 20,
    loopNeighbors: 22,
    checkRelax: 24,
    applyRelax: 25,
    pushPq: 26,
    initAns: 32,
    loopAns: 33,
    checkUnreachable: 34,
    updateMax: 35,
    returnAns: 37,
  },
  java: {
    entry: 2,
    initDistance: 11,
    initVisited: 13,
    initSrc: 14,
    initPq: 16,
    whilePq: 18,
    popNode: 19,
    checkVisited: 21,
    markVisited: 22,
    loopNeighbors: 23,
    checkRelax: 25,
    applyRelax: 26,
    pushPq: 27,
    initAns: 33,
    loopAns: 34,
    checkUnreachable: 35,
    updateMax: 36,
    returnAns: 38,
  },
  python: {
    entry: 2,
    initDistance: 9,
    initVisited: 10,
    initSrc: 11,
    initPq: 12,
    whilePq: 14,
    popNode: 15,
    checkVisited: 16,
    markVisited: 18,
    loopNeighbors: 20,
    checkRelax: 21,
    applyRelax: 22,
    pushPq: 23,
    initAns: 26,
    loopAns: 27,
    checkUnreachable: 28,
    updateMax: 30,
    returnAns: 33,
  },
  javascript: {
    entry: 1,
    initDistance: 9,
    initVisited: 10,
    initSrc: 11,
    initPq: 14,
    whilePq: 16,
    popNode: 19,
    checkVisited: 21,
    markVisited: 22,
    loopNeighbors: 25,
    checkRelax: 28,
    applyRelax: 29,
    pushPq: 30,
    initAns: 36,
    loopAns: 37,
    checkUnreachable: 38,
    updateMax: 39,
    returnAns: 42,
  },
};

/**
 * 纯函数式、无 DOM 依赖的 Dijkstra 算法执行追踪器 (借助 AlgorithmExecutionTraceEngine)
 */
export function traceNetworkDelay(presetInput: boolean | string = true) {
  return AlgorithmExecutionTraceEngine.trace<NetworkDelayStepVars>(
    (recorder) => {
      let n = 4;
      let k = 2;
      let times: Array<[number, number, number]> = [
        [2, 1, 1],
        [2, 3, 1],
        [3, 4, 1],
      ];

      if (presetInput === false || presetInput === 'unreachable_3node' || presetInput === 'disconnected_nodes') {
        n = 3;
        k = 1;
        times = [[1, 2, 1]];
      } else if (presetInput === 'line_chain') {
        n = 3;
        k = 1;
        times = [
          [1, 2, 3],
          [2, 3, 4],
        ];
      } else if (presetInput === 'shortcut_prune') {
        n = 4;
        k = 2;
        times = [
          [2, 1, 1],
          [2, 3, 5],
          [1, 3, 1],
          [3, 4, 1],
        ];
      } else {
        // classic_4nodes / reachable_4node / true
        n = 4;
        k = 2;
        times = [
          [2, 1, 1],
          [2, 3, 1],
          [3, 4, 1],
        ];
      }

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
      let curD: number | undefined = 0;
      let activeEdge: [number, number, number] | undefined = undefined;
      let maxDelaySoFar = 0;
      let isAllReached = false;
      let currentI: number | undefined = undefined;

      function emit(
        anchor: string,
        message: string,
        log: string,
        status: 'init' | 'emit' | 'pop' | 'relax' | 'check' | 'done',
        activeArray?: 'dist' | 'visited' | 'pq',
        activeSlot?: number,
        pqAction: 'push' | 'poll' | 'check' | 'empty' | 'idle' = 'idle',
        lastPqItem?: { u: number; d: number }
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

        recorder.step({
          anchor,
          message,
          log,
          type: status,
          vars: {
            curNode,
            u: curNode,
            d: curD,
            k,
            n,
            times,
            graph: adj,
            adj,
            cur: curD !== undefined ? [curNode, curD] : undefined,
            activeEdge,
            edge: activeEdge ? [activeEdge[1], activeEdge[2]] : undefined,
            v: activeEdge ? activeEdge[1] : undefined,
            w: activeEdge ? activeEdge[2] : undefined,
            distance,
            dist: distance,
            distList: distance,
            visited,
            visitedList: visited,
            pqSnapshot: pq,
            maxDelaySoFar,
            maxDelay: maxDelaySoFar,
            ans: maxDelaySoFar,
            i: currentI ?? activeSlot,
            isAllReached,
            activeArray,
            activeSlot,
            status,
            pqAction,
            lastPqItem,
            varDetails: NETWORK_DELAY_VAR_DETAILS,
          },
          metrics: {
            'metric-delay-cur': curStr,
            'metric-delay-max': delayStr,
            'metric-delay-pq': `${pq.length} 个节点就绪`,
            'metric-delay-phase': phaseStr,
          },
        });
      }

      // 1. 初始化
      emit('entry', `🚀 [算法初始化] networkDelayTime(times, n=${n}, k=${k})：准备从源点 ${k} 开始信号扩散。`, `networkDelayTime(${n}, ${k})`, 'init');
      emit('initDistance', `📊 [初始化距离数组] int[] distance = new int[${n + 1}]；全部填充为无穷大 ∞。`, 'distance = new int[n+1]', 'init');
      emit('initVisited', `🏷️ [初始化访问数组] boolean[] visited = new boolean[${n + 1}]；用于防止环路重复探索。`, 'visited = new boolean[n+1]', 'init');

      distance[k] = 0;
      emit('initSrc', `📡 [设置发射源点] distance[${k}] = 0：信号在时刻 0 从源节点 ${k} 发射！`, `distance[${k}] = 0`, 'emit', 'dist', k);

      pushPq(k, 0);
      emit('initPq', `📥 [源点加入波前堆] pq.add([${k}, 0])；小根堆初始化完成。`, `pq.add(${k}, 0)`, 'emit', 'pq', 0, 'push', { u: k, d: 0 });

      // 2. Dijkstra 堆优化循环
      while (pq.length > 0) {
        emit('whilePq', `🔁 [检查堆非空] while (!pq.isEmpty()) -> 当前波前队列待扩散状态数: ${pq.length}。`, `!pq.isEmpty() (len=${pq.length})`, 'pop', undefined, undefined, 'check');

        const top = pollPq();
        curNode = top.u;
        curD = top.d;
        emit('popNode', `📤 [弹出堆顶最短到达点] poll() -> 节点 ${curNode} (耗时 ${curD} ms)。`, `poll Node ${curNode}`, 'pop', 'pq', 0, 'poll', { u: top.u, d: top.d });

        emit('checkVisited', `🔎 [检查是否已访问] if (visited[${curNode}]) -> (${visited[curNode]})。`, `visited[${curNode}]?`, 'pop', 'visited', curNode);
        if (visited[curNode]) {
          emit('checkVisited', `⏭️ [跳过冗余状态] 节点 ${curNode} 信号此前已到达并锁定，跳过。`, `skip visited Node ${curNode}`, 'pop');
          continue;
        }

        visited[curNode] = true;
        emit('markVisited', `🔒 [锁定信号抵达] visited[${curNode}] = true；节点 ${curNode} 信号到达时间固定为 ${distance[curNode]} ms！`, `visited[${curNode}] = true`, 'pop', 'visited', curNode);

        for (const e of adj[curNode]) {
          const v = e.to;
          const w = e.w;
          activeEdge = [curNode, v, w];

          emit('loopNeighbors', `  ↳ [遍历出边传播] 考察有向信道 (${curNode} ➔ ${v}, 传输延迟 ${w} ms)。`, `channel (${curNode}, ${v})`, 'relax');

          emit('checkRelax', `  🔎 [松弛判定] if (!visited[${v}] && distance[${curNode}]+${w} < distance[${v}]) -> (!${visited[v]} && ${distance[curNode] + w} < ${distance[v] === Infinity ? '∞' : distance[v]})。`, `check relax (${curNode}->${v})`, 'relax');

          if (!visited[v] && distance[curNode] + w < distance[v]) {
            distance[v] = distance[curNode] + w;
            emit('applyRelax', `  ⚡ [更新到达时间] 发现更早抵达路径！更新 distance[${v}] = ${distance[v]} ms！`, `distance[${v}] = ${distance[v]}`, 'relax', 'dist', v);

            pushPq(v, distance[v]);
            emit('pushPq', `  📥 [新信号波前入堆] pq.add([${v}, ${distance[v]}])；节点 ${v} 进入就绪波前！`, `pq.add(${v}, ${distance[v]})`, 'relax', 'pq', pq.length - 1, 'push', { u: v, d: distance[v] });
          }
        }
        activeEdge = undefined;
      }

      // 3. 全网收齐统计与连通性检验
      emit('initAns', '📊 [统计全网信号收齐时间] int ans = 0；检查所有 1..n 节点是否均已收到信号。', 'int ans = 0', 'check', undefined, undefined, 'empty');

      let ans = 0;
      let hasInf = false;
      for (let i = 1; i <= n; i++) {
        currentI = i;
        emit('loopAns', `🔁 [检验节点连通] for (int i = ${i}; i <= ${n}; i++)。`, `for i=${i}`, 'check', 'dist', i, 'empty');

        emit('checkUnreachable', `🔎 [孤立点核验] if (distance[${i}] == Integer.MAX_VALUE) -> (${distance[i] === Infinity})。`, `distance[${i}] == INF?`, 'check', 'dist', i, 'empty');

        if (distance[i] === Infinity) {
          hasInf = true;
          maxDelaySoFar = -1;
          isAllReached = false;
          emit('checkUnreachable', `❌ [存在孤立点] 节点 ${i} 始终无法接收到信号，全网不可达！立即 return -1！`, `return -1 (Node ${i} unreachable)`, 'check', 'dist', i, 'empty');
          break;
        }

        ans = Math.max(ans, distance[i]);
        maxDelaySoFar = ans;
        emit('updateMax', `📈 [刷新最大延迟] ans = max(${ans}, distance[${i}]=${distance[i]}) = ${ans} ms。`, `ans = ${ans}`, 'check', 'dist', i, 'empty');
      }

      if (!hasInf) {
        isAllReached = true;
        maxDelaySoFar = ans;
        emit('returnAns', `🎉 [全网广播成功] return ans = ${ans} ms！所有节点均收到信号，全网完全覆盖最迟时间为 ${ans} ms！`, `return ${ans}`, 'done', undefined, undefined, 'empty');
      } else {
        emit('returnAns', '⚠️ [广播失败] return -1：网络存在孤立节点，无法实现全网信号覆盖。', 'return -1', 'done', undefined, undefined, 'empty');
      }
    },
    {
      anchorMap: NETWORK_DELAY_ANCHOR_MAP,
      specKey: 'network-delay-time',
    }
  );
}

export function buildNetworkDelaySteps(preset: boolean | string = true): NetworkDelayStep[] {
  const traceSteps = traceNetworkDelay(preset);
  return traceSteps.map((step) => ({
    curNode: step.vars!.curNode,
    u: step.vars!.u,
    d: step.vars!.d,
    k: step.vars!.k,
    n: step.vars!.n,
    times: step.vars!.times,
    graph: step.vars!.graph,
    adj: step.vars!.adj,
    cur: step.vars!.cur,
    distList: step.vars!.distList,
    distance: step.vars!.distance,
    dist: step.vars!.dist,
    visitedList: step.vars!.visitedList,
    visited: step.vars!.visited,
    pqSnapshot: step.vars!.pqSnapshot,
    maxDelaySoFar: step.vars!.maxDelaySoFar,
    maxDelay: step.vars!.maxDelay,
    ans: step.vars!.ans,
    isAllReached: step.vars!.isAllReached,
    activeEdge: step.vars!.activeEdge,
    edge: step.vars!.edge,
    v: step.vars!.v,
    w: step.vars!.w,
    i: step.vars!.i,
    activeArray: step.vars!.activeArray,
    activeSlot: step.vars!.activeSlot,
    status: step.vars!.status,
    pqAction: step.vars!.pqAction,
    lastPqItem: step.vars!.lastPqItem,
    message: step.message || '',
    log: step.log || '',
    codeLine: (step.codeLinesByLang || step.codeLine) as HighlightTarget,
    metrics: step.metrics,
    vars: step.vars,
    varDetails: NETWORK_DELAY_VAR_DETAILS,
  }));
}

export const NETWORK_DELAY_PRUNED_ANCHOR_MAP: Record<string, Record<string, number>> = {
  java: {
    entry: 2,
    initDistance: 14,
    initSrc: 17,
    initPq: 21,
    whilePq: 23,
    pollNode: 24,
    checkPruning: 28,
    pruneContinue: 29,
    loopNeighbors: 32,
    checkRelax: 34,
    applyRelax: 36,
    pushPq: 37,
    initAns: 43,
    loopAns: 44,
    checkUnreachable: 45,
    updateMax: 47,
    returnAns: 49,
  },
  cpp: {
    entry: 3,
    initDistance: 11,
    initSrc: 12,
    initPq: 14,
    whilePq: 16,
    pollNode: 17,
    checkPruning: 18,
    pruneContinue: 19,
    loopNeighbors: 22,
    checkRelax: 23,
    applyRelax: 24,
    pushPq: 25,
    initAns: 31,
    loopAns: 32,
    checkUnreachable: 33,
    updateMax: 34,
    returnAns: 36,
  },
  python: {
    entry: 4,
    initDistance: 11,
    initSrc: 12,
    initPq: 13,
    whilePq: 15,
    pollNode: 16,
    checkPruning: 17,
    pruneContinue: 18,
    loopNeighbors: 20,
    checkRelax: 21,
    applyRelax: 22,
    pushPq: 23,
    initAns: 26,
    loopAns: 27,
    checkUnreachable: 28,
    updateMax: 30,
    returnAns: 31,
  },
  javascript: {
    entry: 1,
    initDistance: 9,
    initSrc: 10,
    initPq: 11,
    whilePq: 13,
    pollNode: 15,
    checkPruning: 16,
    pruneContinue: 17,
    loopNeighbors: 20,
    checkRelax: 21,
    applyRelax: 22,
    pushPq: 23,
    initAns: 29,
    loopAns: 30,
    checkUnreachable: 31,
    updateMax: 32,
    returnAns: 34,
  },
};

export function traceNetworkDelayPruned(presetInput: boolean | string = true) {
  return AlgorithmExecutionTraceEngine.trace<NetworkDelayStepVars>(
    (recorder) => {
      let n = 4;
      let k = 2;
      let times: Array<[number, number, number]> = [
        [2, 1, 1],
        [2, 3, 1],
        [3, 4, 1],
      ];

      if (presetInput === false || presetInput === 'unreachable_3node' || presetInput === 'disconnected_nodes') {
        n = 3;
        k = 1;
        times = [[1, 2, 1]];
      } else if (presetInput === 'line_chain') {
        n = 3;
        k = 1;
        times = [
          [1, 2, 3],
          [2, 3, 4],
        ];
      } else if (presetInput === 'shortcut_prune') {
        n = 4;
        k = 2;
        times = [
          [2, 1, 1],
          [2, 3, 5],
          [1, 3, 1],
          [3, 4, 1],
        ];
      } else {
        n = 4;
        k = 2;
        times = [
          [2, 1, 1],
          [2, 3, 1],
          [3, 4, 1],
        ];
      }

      const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n + 1 }, () => []);
      for (const [u, v, w] of times) {
        adj[u].push({ to: v, w });
      }

      const distance: number[] = new Array(n + 1).fill(Infinity);
      const settled: boolean[] = new Array(n + 1).fill(false);
      const pq: Array<{ u: number; d: number }> = [];

      function pushPq(u: number, d: number): void {
        pq.push({ u, d });
        pq.sort((a, b) => a.d - b.d);
      }

      function pollPq(): { u: number; d: number } {
        return pq.shift()!;
      }

      let curNode = k;
      let curD: number | undefined = 0;
      let activeEdge: [number, number, number] | undefined = undefined;
      let maxDelaySoFar = 0;
      let isAllReached = false;
      let currentI: number | undefined = undefined;

      function emit(
        anchor: string,
        message: string,
        log: string,
        status: 'init' | 'emit' | 'pop' | 'relax' | 'check' | 'done',
        activeArray?: 'dist' | 'visited' | 'pq',
        activeSlot?: number,
        pqAction: 'push' | 'poll' | 'check' | 'empty' | 'idle' = 'idle',
        lastPqItem?: { u: number; d: number }
      ): void {
        const curStr = status === 'done' ? '广播结算完毕' : `Node ${curNode}`;
        const delayStr = maxDelaySoFar === -1 ? '-1 (存在孤立点)' : `${maxDelaySoFar} ms`;
        const phaseStr =
          status === 'done'
            ? '延迟计算完成'
            : status === 'check'
              ? '全网连通性检验'
              : status === 'relax'
                ? '出边松弛 (无 visited)'
                : status === 'pop'
                  ? '距离剪枝出堆'
                  : '广播源初始化';

        recorder.step({
          anchor,
          message,
          log,
          type: status,
          vars: {
            curNode,
            u: curNode,
            d: curD,
            k,
            n,
            times,
            graph: adj,
            adj,
            cur: curD !== undefined ? [curNode, curD] : undefined,
            activeEdge,
            edge: activeEdge ? [activeEdge[1], activeEdge[2]] : undefined,
            v: activeEdge ? activeEdge[1] : undefined,
            w: activeEdge ? activeEdge[2] : undefined,
            distance,
            dist: distance,
            distList: distance,
            visitedList: settled,
            pqSnapshot: pq,
            maxDelaySoFar,
            maxDelay: maxDelaySoFar,
            ans: maxDelaySoFar,
            i: currentI ?? activeSlot,
            isAllReached,
            activeArray,
            activeSlot,
            status,
            pqAction,
            lastPqItem,
            varDetails: NETWORK_DELAY_VAR_DETAILS,
          },
          metrics: {
            'metric-delay-cur': curStr,
            'metric-delay-max': delayStr,
            'metric-delay-pq': `${pq.length} 个节点就绪`,
            'metric-delay-phase': phaseStr,
          },
        });
      }

      // 1. 初始化
      emit('entry', `🚀 [算法初始化] networkDelayTime(times, n=${n}, k=${k})：启动距离剪枝升级版 (无 visited 数组)。`, `networkDelayTime(${n}, ${k})`, 'init');
      emit('initDistance', `📊 [初始化距离数组] int[] distance = new int[${n + 1}]；全部填充为无穷大 ∞ (无 visited 数组)。`, 'distance = new int[n+1]', 'init');

      distance[k] = 0;
      emit('initSrc', `📡 [设置发射源点] distance[${k}] = 0：信号在时刻 0 从源节点 ${k} 发射！`, `distance[${k}] = 0`, 'emit', 'dist', k);

      pushPq(k, 0);
      emit('initPq', `📥 [源点加入波前堆] pq.add([${k}, 0])；小根堆初始化完成。`, `pq.add(${k}, 0)`, 'emit', 'pq', 0, 'push', { u: k, d: 0 });

      // 2. Dijkstra 距离剪枝优化循环
      while (pq.length > 0) {
        emit('whilePq', `🔁 [检查堆非空] while (!pq.isEmpty()) -> 当前波前队列待扩散状态数: ${pq.length}。`, `!pq.isEmpty() (len=${pq.length})`, 'pop', undefined, undefined, 'check');

        const top = pollPq();
        curNode = top.u;
        curD = top.d;
        emit('pollNode', `📤 [弹出堆顶最短到达点] poll() -> 节点 ${curNode} (延迟 d=${curD} ms)。`, `poll Node ${curNode} (d=${curD})`, 'pop', 'pq', 0, 'poll', { u: top.u, d: top.d });

        if (curD > distance[curNode]) {
          emit('checkPruning', `🔎 [检查距离剪枝] if (d > distance[u]) -> (${curD} > ${distance[curNode]})：延迟 ${curD} ms 大于当前已知最短延迟 ${distance[curNode]} ms，判定为失效记录！`, `check prune: ${curD} > ${distance[curNode]} (true)`, 'pop');
          emit('pruneContinue', `⏭️ [执行 continue 剪枝] 此波前记录为陈旧失效记录，执行 continue 跳过，继续下一轮循环！`, `continue -> skip stale Node ${curNode}`, 'pop');
          continue;
        }

        settled[curNode] = true;
        emit('checkPruning', `🔒 [最短路确认锁定] if (d > distance[u]) -> (${curD} <= ${distance[curNode]})：无需剪枝！节点 ${curNode} 最短延迟正式锁定为 ${distance[curNode]} ms！`, `settled Node ${curNode} (d=${curD})`, 'pop');

        for (const e of adj[curNode]) {
          const v = e.to;
          const w = e.w;
          activeEdge = [curNode, v, w];

          emit('loopNeighbors', `  ↳ [遍历出边传播] 考察有向信道 (${curNode} ➔ ${v}, 传输延迟 ${w} ms)。`, `channel (${curNode}, ${v})`, 'relax');

          emit('checkRelax', `  🔎 [无 visited 松弛判定] if (distance[${curNode}]+${w} < distance[${v}]) -> (${distance[curNode] + w} < ${distance[v] === Infinity ? '∞' : distance[v]})。`, `check relax (${curNode}->${v})`, 'relax');

          if (distance[curNode] + w < distance[v]) {
            distance[v] = distance[curNode] + w;
            emit('applyRelax', `  ⚡ [更新到达时间] 发现更早抵达路径！更新 distance[${v}] = ${distance[v]} ms！`, `distance[${v}] = ${distance[v]}`, 'relax', 'dist', v);

            pushPq(v, distance[v]);
            emit('pushPq', `  📥 [新信号波前入堆] pq.add([${v}, ${distance[v]}])；节点 ${v} 进入就绪波前！`, `pq.add(${v}, ${distance[v]})`, 'relax', 'pq', pq.length - 1, 'push', { u: v, d: distance[v] });
          }
        }
        activeEdge = undefined;
      }

      // 3. 全网收齐统计与连通性检验
      emit('initAns', '📊 [统计全网信号收齐时间] int ans = 0；检查所有 1..n 节点是否均已收到信号。', 'int ans = 0', 'check', undefined, undefined, 'empty');

      let ans = 0;
      let hasInf = false;
      for (let i = 1; i <= n; i++) {
        currentI = i;
        emit('loopAns', `🔁 [检验节点连通] for (int i = ${i}; i <= ${n}; i++)。`, `for i=${i}`, 'check', 'dist', i, 'empty');

        emit('checkUnreachable', `🔎 [孤立点核验] if (distance[${i}] == Integer.MAX_VALUE) -> (${distance[i] === Infinity})。`, `distance[${i}] == INF?`, 'check', 'dist', i, 'empty');

        if (distance[i] === Infinity) {
          hasInf = true;
          maxDelaySoFar = -1;
          isAllReached = false;
          emit('checkUnreachable', `❌ [存在孤立点] 节点 ${i} 始终无法接收到信号，全网不可达！立即 return -1！`, `return -1 (Node ${i} unreachable)`, 'check', 'dist', i, 'empty');
          break;
        }

        ans = Math.max(ans, distance[i]);
        maxDelaySoFar = ans;
        emit('updateMax', `📈 [刷新最大延迟] ans = max(${ans}, distance[${i}]=${distance[i]}) = ${ans} ms。`, `ans = ${ans}`, 'check', 'dist', i, 'empty');
      }

      if (!hasInf) {
        isAllReached = true;
        maxDelaySoFar = ans;
        emit('returnAns', `🎉 [全网广播成功] return ans = ${ans} ms！所有节点均收到信号，全网最小延迟时间为 ${ans} ms！`, `return ${ans}`, 'done', undefined, undefined, 'empty');
      } else {
        emit('returnAns', '⚠️ [广播失败] return -1：网络存在孤立节点，无法实现全网信号覆盖。', 'return -1', 'done', undefined, undefined, 'empty');
      }
    },
    {
      anchorMap: NETWORK_DELAY_PRUNED_ANCHOR_MAP,
      specKey: 'network-delay-time',
    }
  );
}

export function buildNetworkDelayPrunedSteps(preset: boolean | string = true): NetworkDelayStep[] {
  const traceSteps = traceNetworkDelayPruned(preset);
  return traceSteps.map((step) => ({
    curNode: step.vars!.curNode,
    u: step.vars!.u,
    d: step.vars!.d,
    k: step.vars!.k,
    n: step.vars!.n,
    times: step.vars!.times,
    graph: step.vars!.graph,
    adj: step.vars!.adj,
    cur: step.vars!.cur,
    distList: step.vars!.distList,
    distance: step.vars!.distance,
    dist: step.vars!.dist,
    visitedList: step.vars!.visitedList,
    pqSnapshot: step.vars!.pqSnapshot,
    maxDelaySoFar: step.vars!.maxDelaySoFar,
    maxDelay: step.vars!.maxDelay,
    ans: step.vars!.ans,
    isAllReached: step.vars!.isAllReached,
    activeEdge: step.vars!.activeEdge,
    edge: step.vars!.edge,
    v: step.vars!.v,
    w: step.vars!.w,
    i: step.vars!.i,
    activeArray: step.vars!.activeArray,
    activeSlot: step.vars!.activeSlot,
    status: step.vars!.status,
    pqAction: step.vars!.pqAction,
    lastPqItem: step.vars!.lastPqItem,
    message: step.message || '',
    log: step.log || '',
    codeLine: (step.codeLinesByLang || step.codeLine) as HighlightTarget,
    metrics: step.metrics,
    vars: step.vars,
    varDetails: NETWORK_DELAY_VAR_DETAILS,
  }));
}

