/**
 * 好路径的数目 (Number of Good Paths - LeetCode 2421) 步进编译器
 * 核心：按边端点最大权值升序排序加边、并查集连通块维护同值最大点计数、乘法原理累加组合数 count[u] * count[v]
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

import { HighlightTarget } from '../../../core/code-panel';
import {
  AlgorithmExecutionTraceEngine,
  type AlgorithmTraceStep,
} from '../../../core/algorithm-execution-trace-engine';

export interface GoodPathsStepVars {
  curVal: number;
  activeEdges: Array<[number, number]>;
  totalGoodPaths: number;
  curEdge?: [number, number];
  parentArray: number[];
  countArray: number[];
  valsArray: number[];
  activeArray?: 'parent' | 'count' | 'vals';
  activeSlot?: number;
  newPathsCount?: number;
  status: 'init' | 'sort' | 'merge_val' | 'pair' | 'done';
}

export interface GoodPathsStep {
  curVal: number;
  activeEdges: Array<[number, number]>;
  totalGoodPaths: number;
  curEdge?: [number, number];
  parentArray: number[];
  countArray: number[];
  valsArray: number[];
  activeArray?: 'parent' | 'count' | 'vals';
  activeSlot?: number;
  newPathsCount?: number;
  status: 'init' | 'sort' | 'merge_val' | 'pair' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const GOOD_PATHS_ANCHOR_MAP: Record<string, Record<string, number>> = {
  cpp: {
    init: 9,
    sort: 23,
    edgeLoop: 29,
    sameValPair: 33,
    mergeRoot: 38,
    done: 43,
  },
  java: {
    init: 32,
    sort: 37,
    edgeLoop: 45,
    sameValPair: 49,
    mergeRoot: 53,
    done: 59,
  },
  python: {
    init: 13,
    sort: 18,
    edgeLoop: 21,
    sameValPair: 25,
    mergeRoot: 30,
    done: 34,
  },
  javascript: {
    init: 19,
    sort: 24,
    edgeLoop: 27,
    sameValPair: 31,
    mergeRoot: 36,
    done: 41,
  },
};

/**
 * 纯函数式无头执行追踪：好路径的数目 (并查集 + 点权升序 + 乘法原理)
 */
export function traceGoodPaths(
  preset: string = 'classic_4node'
): AlgorithmTraceStep<GoodPathsStepVars>[] {
  return AlgorithmExecutionTraceEngine.trace<GoodPathsStepVars>(
    (recorder) => {
      const isStar = preset === 'star_5node';

      const vals: number[] = isStar ? [1, 3, 2, 1, 3] : [1, 3, 2, 3];
      const edges: Array<[number, number]> = isStar
        ? [
            [0, 1],
            [0, 2],
            [2, 3],
            [2, 4],
          ]
        : [
            [0, 1],
            [0, 2],
            [2, 3],
          ];

      const n = vals.length;
      const parent: number[] = new Array(n).fill(0);
      const count: number[] = new Array(n).fill(1);

      for (let i = 0; i < n; i++) parent[i] = i;

      function find(i: number): number {
        if (parent[i] !== i) parent[i] = find(parent[i]);
        return parent[i];
      }

      let totalGoodPaths = n;
      let curVal = 0;
      const activeEdges: Array<[number, number]> = [];
      let curEdge: [number, number] | undefined = undefined;

      function emit(
        anchor: string,
        message: string,
        log: string,
        status: 'init' | 'sort' | 'merge_val' | 'pair' | 'done',
        activeArray?: 'parent' | 'count' | 'vals',
        activeSlot?: number,
        newPathsCount?: number
      ): void {
        const valStr = status === 'done' ? '全部边连通完毕' : `val ≤ ${curVal}`;
        const pathsStr = `${totalGoodPaths} 条`;
        const edgeStr = `${activeEdges.length} / ${edges.length} 条`;

        const phaseStr =
          status === 'done'
            ? '好路径计算完成'
            : status === 'pair'
              ? '同权端点产生好路径'
              : status === 'merge_val'
                ? '并查集升序合并'
                : status === 'sort'
                  ? '边权升序排序'
                  : '算法初始化';

        recorder.step({
          anchor,
          message,
          log,
          type: status,
          vars: {
            curVal,
            activeEdges,
            totalGoodPaths,
            curEdge,
            parentArray: parent,
            countArray: count,
            valsArray: vals,
            activeArray,
            activeSlot,
            newPathsCount,
            status,
          },
          metrics: {
            'metric-active-val': valStr,
            'metric-good-paths': pathsStr,
            'metric-active-edges': edgeStr,
            'metric-paths-phase': phaseStr,
          },
        });
      }

      // 1. 初始化
      emit('init', `🚀 [算法初始化] 树包含 ${n} 个节点，各点点权为: [${vals.join(', ')}]。每个单节点天然自成 1 条好路径，初始基数 = ${n} 条。`, 'numberOfGoodPaths 入口', 'init');

      for (let i = 0; i < n; i++) {
        emit('init', `📌 [并查集初始化] parent[${i}]=${i}，同大权频次 count[${i}]=1。`, `parent[${i}]=${i}`, 'init', 'parent', i);
      }

      // 2. 边权排序
      const sortedEdges = [...edges].sort(
        (a, b) => Math.max(vals[a[0]], vals[a[1]]) - Math.max(vals[b[0]], vals[b[1]])
      );
      emit('sort', `📐 [边权排序] 按照边两端 max(vals[u], vals[v]) 升序加边。排序后顺序为: ${sortedEdges.map((e) => `(${e[0]}-${e[1]}: 权${Math.max(vals[e[0]], vals[e[1]])})`).join(', ')}。`, '边升序排序', 'sort');

      // 3. 逐条加边推演
      for (const [u, v] of sortedEdges) {
        curEdge = [u, v];
        curVal = Math.max(vals[u], vals[v]);
        activeEdges.push([u, v]);

        emit('edgeLoop', `🔗 [考察连通边] 正在接入 Edge (${u}, ${v})，计算边两端端点最大点权 val = max(${vals[u]}, ${vals[v]}) = ${curVal}。`, `edge (${u},${v})`, 'merge_val');

        const rootU = find(u);
        emit('edgeLoop', `🔍 [查询代表元] Node ${u} 所在集合根代表元 rootU = ${rootU}，当前该集合最大点权为 vals[${rootU}] = ${vals[rootU]}，频次 count[${rootU}] = ${count[rootU]}。`, `find(${u})=${rootU}`, 'merge_val', 'parent', rootU);

        const rootV = find(v);
        emit('edgeLoop', `🔍 [查询代表元] Node ${v} 所在集合根代表元 rootV = ${rootV}，当前该集合最大点权为 vals[${rootV}] = ${vals[rootV]}，频次 count[${rootV}] = ${count[rootV]}。`, `find(${v})=${rootV}`, 'merge_val', 'parent', rootV);

        emit('sameValPair', `⚖️ [权值对决判定] 比较两端代表元点权：vals[${rootU}]=${vals[rootU]} vs vals[${rootV}]=${vals[rootV]}。`, `compare vals[${rootU}] & vals[${rootV}]`, 'merge_val');

        if (vals[rootU] === vals[rootV]) {
          const added = count[rootU] * count[rootV];
          totalGoodPaths += added;

          emit(
            'sameValPair',
            `✨ [产生新好路径] 发现两端分量最大点权相等 (均为 ${vals[rootU]})！\n应用乘法原理组合：count[${rootU}] (${count[rootU]}) × count[${rootV}] (${count[rootV]}) = 新增 ${added} 条好路径！总数增至 ${totalGoodPaths} 条！`,
            `goodPaths += ${added}`,
            'pair',
            'count',
            rootU,
            added
          );

          parent[rootV] = rootU;
          emit('mergeRoot', `🔗 [合并集合代表元] 将 rootV (Node ${rootV}) 的代表元指向 rootU (Node ${rootU})。`, `parent[${rootV}]=${rootU}`, 'merge_val', 'parent', rootV);

          count[rootU] += count[rootV];
          emit('sameValPair', `📈 [累计频次相加] rootU (Node ${rootU}) 的最大点权出现频次累加为 count[${rootU}] = ${count[rootU]}。`, `count[${rootU}]+=${count[rootV]}`, 'merge_val', 'count', rootU);
        } else if (vals[rootU] > vals[rootV]) {
          parent[rootV] = rootU;
          emit('mergeRoot', `🛡️ [归属大权值根] vals[${rootU}] (${vals[rootU]}) > vals[${rootV}] (${vals[rootV]})，点权大者 Node ${rootU} 作为新根，小者直接并入，不产生新好路径。`, `parent[${rootV}]=${rootU}`, 'merge_val', 'parent', rootV);
        } else {
          parent[rootU] = rootV;
          emit('mergeRoot', `🛡️ [归属大权值根] vals[${rootV}] (${vals[rootV]}) > vals[${rootV}] (${vals[rootV]})，点权大者 Node ${rootV} 作为新根，小者直接并入，不产生新好路径。`, `parent[${rootU}]=${rootV}`, 'merge_val', 'parent', rootU);
        }
      }

      curEdge = undefined;
      emit('done', `🎉 [好路径统计完毕] 全图所有边已完全并查集连通，满足条件的所有好路径总计为 ${totalGoodPaths} 条！`, `done: totalGoodPaths=${totalGoodPaths}`, 'done');
    },
    {
      anchorMap: GOOD_PATHS_ANCHOR_MAP,
      specKey: 'good-paths',
    }
  );
}

export function buildGoodPathsSteps(preset: string = 'classic_4node'): GoodPathsStep[] {
  const traceSteps = traceGoodPaths(preset);
  return traceSteps.map((step) => ({
    curVal: step.vars!.curVal,
    activeEdges: step.vars!.activeEdges,
    totalGoodPaths: step.vars!.totalGoodPaths,
    curEdge: step.vars!.curEdge,
    parentArray: step.vars!.parentArray,
    countArray: step.vars!.countArray,
    valsArray: step.vars!.valsArray,
    activeArray: step.vars!.activeArray,
    activeSlot: step.vars!.activeSlot,
    newPathsCount: step.vars!.newPathsCount,
    status: step.vars!.status,
    message: step.message || '',
    log: step.log || '',
    codeLine: (step.codeLinesByLang || step.codeLine) as HighlightTarget,
    metrics: step.metrics,
  }));
}
