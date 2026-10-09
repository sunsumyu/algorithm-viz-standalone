/**
 * 网络延迟时间 (Network Delay Time - LeetCode 743) 步进编译器 (Deep Module)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：网络拓扑建模、Dijkstra 堆优化波前广播追踪、四语言 1-based 行号联动
 */

import { HighlightTarget } from '../../../core/code-panel';
import { AlgorithmExecutionTraceEngine } from '../../../core/algorithm-execution-trace-engine';

export interface NetworkDelayStepVars {
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
}

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

export const NETWORK_DELAY_ANCHOR_MAP: Record<string, Record<string, number>> = {
  cpp: {
    entry: 11,
    initDistance: 19,
    initVisited: 20,
    initSrc: 23,
    initPq: 24,
    whilePq: 26,
    popNode: 27,
    checkVisited: 28,
    markVisited: 29,
    loopNeighbors: 31,
    checkRelax: 33,
    applyRelax: 34,
    pushPq: 35,
    initAns: 41,
    loopAns: 42,
    checkUnreachable: 43,
    updateMax: 44,
    returnAns: 46,
  },
  java: {
    entry: 8,
    initDistance: 17,
    initVisited: 20,
    initSrc: 19,
    initPq: 22,
    whilePq: 24,
    popNode: 25,
    checkVisited: 27,
    markVisited: 28,
    loopNeighbors: 29,
    checkRelax: 31,
    applyRelax: 32,
    pushPq: 33,
    initAns: 38,
    loopAns: 39,
    checkUnreachable: 40,
    updateMax: 41,
    returnAns: 43,
  },
  python: {
    entry: 3,
    initDistance: 11,
    initVisited: 12,
    initSrc: 15,
    initPq: 16,
    whilePq: 18,
    popNode: 19,
    checkVisited: 20,
    markVisited: 22,
    loopNeighbors: 25,
    checkRelax: 27,
    applyRelax: 28,
    pushPq: 29,
    initAns: 33,
    loopAns: 34,
    checkUnreachable: 35,
    updateMax: 36,
    returnAns: 37,
  },
  javascript: {
    entry: 2,
    initDistance: 11,
    initVisited: 12,
    initSrc: 15,
    initPq: 16,
    whilePq: 18,
    popNode: 19,
    checkVisited: 21,
    markVisited: 22,
    loopNeighbors: 25,
    checkRelax: 27,
    applyRelax: 28,
    pushPq: 29,
    initAns: 33,
    loopAns: 34,
    checkUnreachable: 35,
    updateMax: 36,
    returnAns: 37,
  },
};

/**
 * 纯函数式、无 DOM 依赖的 Dijkstra 算法执行追踪器 (借助 AlgorithmExecutionTraceEngine)
 */
export function traceNetworkDelay(isReachable: boolean = true) {
  return AlgorithmExecutionTraceEngine.trace<NetworkDelayStepVars>(
    (recorder) => {
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

      function emit(
        anchor: string,
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

        recorder.step({
          anchor,
          message,
          log,
          type: status,
          vars: {
            curNode,
            distList: distance,
            visitedList: visited,
            pqSnapshot: pq,
            maxDelaySoFar,
            isAllReached,
            activeEdge,
            activeArray,
            activeSlot,
            status,
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
      emit('initPq', `📥 [源点加入波前堆] pq.add([${k}, 0])；小根堆初始化完成。`, `pq.add(${k}, 0)`, 'emit', 'pq', 0);

      // 2. Dijkstra 堆优化循环
      while (pq.length > 0) {
        emit('whilePq', `🔁 [检查堆非空] while (!pq.isEmpty()) -> 当前波前队列待扩散状态数: ${pq.length}。`, `!pq.isEmpty() (len=${pq.length})`, 'pop');

        const top = pollPq();
        curNode = top.u;
        const curD = top.d;
        emit('popNode', `📤 [弹出堆顶最短到达点] poll() -> 节点 ${curNode} (耗时 ${curD} ms)。`, `poll Node ${curNode}`, 'pop', 'pq', 0);

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
            emit('pushPq', `  📥 [新信号波前入堆] pq.add([${v}, ${distance[v]}])；节点 ${v} 进入就绪波前！`, `pq.add(${v}, ${distance[v]})`, 'relax', 'pq', pq.length - 1);
          }
        }
        activeEdge = undefined;
      }

      // 3. 全网收齐统计与连通性检验
      emit('initAns', '📊 [统计全网信号收齐时间] int ans = 0；检查所有 1..n 节点是否均已收到信号。', 'int ans = 0', 'check');

      let ans = 0;
      let hasInf = false;
      for (let i = 1; i <= n; i++) {
        emit('loopAns', `🔁 [检验节点连通] for (int i = ${i}; i <= ${n}; i++)。`, `for i=${i}`, 'check', 'dist', i);

        emit('checkUnreachable', `🔎 [孤立点核验] if (distance[${i}] == Integer.MAX_VALUE) -> (${distance[i] === Infinity})。`, `distance[${i}] == INF?`, 'check', 'dist', i);

        if (distance[i] === Infinity) {
          hasInf = true;
          maxDelaySoFar = -1;
          isAllReached = false;
          emit('checkUnreachable', `❌ [存在孤立点] 节点 ${i} 始终无法接收到信号，全网不可达！立即 return -1！`, `return -1 (Node ${i} unreachable)`, 'check', 'dist', i);
          break;
        }

        ans = Math.max(ans, distance[i]);
        maxDelaySoFar = ans;
        emit('updateMax', `📈 [刷新最大延迟] ans = max(${ans}, distance[${i}]=${distance[i]}) = ${ans} ms。`, `ans = ${ans}`, 'check');
      }

      if (!hasInf) {
        isAllReached = true;
        maxDelaySoFar = ans;
        emit('returnAns', `🎉 [全网广播成功] return ans = ${ans} ms！所有节点均收到信号，全网完全覆盖最迟时间为 ${ans} ms！`, `return ${ans}`, 'done');
      } else {
        emit('returnAns', '⚠️ [广播失败] return -1：网络存在孤立节点，无法实现全网信号覆盖。', 'return -1', 'done');
      }
    },
    {
      anchorMap: NETWORK_DELAY_ANCHOR_MAP,
      specKey: 'network-delay-time',
    }
  );
}

export function buildNetworkDelaySteps(isReachable: boolean = true): NetworkDelayStep[] {
  const traceSteps = traceNetworkDelay(isReachable);
  return traceSteps.map((step) => ({
    curNode: step.vars!.curNode,
    distList: step.vars!.distList,
    visitedList: step.vars!.visitedList,
    pqSnapshot: step.vars!.pqSnapshot,
    maxDelaySoFar: step.vars!.maxDelaySoFar,
    isAllReached: step.vars!.isAllReached,
    activeEdge: step.vars!.activeEdge,
    activeArray: step.vars!.activeArray,
    activeSlot: step.vars!.activeSlot,
    status: step.vars!.status,
    message: step.message || '',
    log: step.log || '',
    codeLine: (step.codeLinesByLang || step.codeLine) as HighlightTarget,
    metrics: step.metrics,
  }));
}
