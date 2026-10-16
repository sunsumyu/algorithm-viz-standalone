/**
 * 最小体力消耗路径 (Path With Minimum Effort - LeetCode 1631) 步进推演编译器
 * 核心：2D 网格 Dijkstra 瓶颈最短路、max(effort, |h1 - h2|) 状态松弛、小根堆贪心搜索
 */

import { HighlightTarget } from '../../../core/code-panel';
import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

export interface EffortTreeNode {
  id: string;
  name?: string;
  val: string | number;
  edgeLabel?: string;
  status?: 'active' | 'visited' | 'pruned' | 'base' | 'normal';
  tag?: string;
  children?: EffortTreeNode[];
}

export interface EffortStep {
  grid: number[][];
  dist: number[][];
  visited: boolean[][];
  curR: number;
  curC: number;
  minEffortSoFar: number;
  pathNodes: Array<[number, number]>;
  pqList: Array<{ r: number; c: number; effort: number }>;
  activeArray?: 'dist' | 'visited' | 'pq';
  activeSlot?: [number, number];
  status: 'start' | 'explore' | 'relax' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
  treeRoot?: EffortTreeNode;
  activeNodeId?: string;
  parentMap?: Record<string, [number, number]>;
}

export const PRESET_EFFORT_GRIDS: Record<string, { label: string; grid: number[][] }> = {
  classic_mountain_3x3: {
    label: '3x3 经典山脉地图 (右侧绕行, 体力=2)',
    grid: [
      [1, 2, 2],
      [3, 8, 2],
      [5, 3, 4],
    ],
  },
  valley_3x3: {
    label: '3x3 险峻山谷地图 (体力=1)',
    grid: [
      [1, 3, 5],
      [2, 8, 4],
      [1, 1, 2],
    ],
  },
  flat_2x2: {
    label: '2x2 平坦地形特判 (体力=0)',
    grid: [
      [1, 1],
      [1, 1],
    ],
  },
};

export function buildPathMinEffortSteps(preset: string = 'classic_mountain_3x3'): EffortStep[] {
  const steps: EffortStep[] = [];
  const grid = PRESET_EFFORT_GRIDS[preset]?.grid || PRESET_EFFORT_GRIDS.classic_mountain_3x3.grid;

  const rows = grid.length;
  const cols = grid[0].length;

  const distance: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(Infinity)
  );
  const visited: boolean[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(false)
  );
  const pre: Record<string, [number, number]> = {};

  const pq: Array<{ r: number; c: number; effort: number }> = [];

  function pushPq(r: number, c: number, effort: number): void {
    pq.push({ r, c, effort });
    pq.sort((a, b) => a.effort - b.effort);
  }

  function pollPq(): { r: number; c: number; effort: number } {
    return pq.shift()!;
  }

  let curR = 0;
  let curC = 0;
  let minEffortSoFar = 0;
  let reachedTarget = false;

  const treeRoot: EffortTreeNode = {
    id: 'node-0-0',
    val: `(0,0) eff:0`,
    status: 'active',
    tag: '🚩 起点',
    children: [],
  };
  const nodeMap = new Map<string, EffortTreeNode>();
  nodeMap.set('0,0', treeRoot);

  function cloneTree(n: EffortTreeNode): EffortTreeNode {
    return {
      id: n.id,
      val: n.val,
      edgeLabel: n.edgeLabel,
      status: n.status,
      tag: n.tag,
      children: n.children ? n.children.map(cloneTree) : [],
    };
  }

  const lines = {
    entry: { cpp: 13, java: 12, python: 13, javascript: 9 },
    initDist: { cpp: 15, java: 14, python: 15, javascript: 11 },
    initDistSrc: { cpp: 16, java: 18, python: 16, javascript: 12 },
    initVisited: { cpp: 17, java: 19, python: 17, javascript: 13 },
    initHeap: { cpp: 19, java: 21, python: 19, javascript: 15 },
    pushSrc: { cpp: 20, java: 22, python: 19, javascript: 15 },
    whileHeap: { cpp: 21, java: 23, python: 20, javascript: 16 },
    pollCur: { cpp: 22, java: 24, python: 21, javascript: 18 },
    checkVisited: { cpp: 24, java: 26, python: 22, javascript: 19 },
    continueVisited: { cpp: 24, java: 27, python: 23, javascript: 20 },
    markVisited: { cpp: 26, java: 32, python: 27, javascript: 26 },
    checkTarget: { cpp: 25, java: 29, python: 24, javascript: 22 },
    returnCost: { cpp: 25, java: 30, python: 26, javascript: 24 },
    forDirs: { cpp: 27, java: 33, python: 28, javascript: 27 },
    checkValidNeighbor: { cpp: 28, java: 34, python: 30, javascript: 29 },
    calcBottleneck: { cpp: 30, java: 36, python: 34, javascript: 32 },
    checkRelax: { cpp: 31, java: 37, python: 35, javascript: 33 },
    updateDist: { cpp: 32, java: 38, python: 36, javascript: 34 },
    pushHeap: { cpp: 33, java: 39, python: 37, javascript: 35 },
    returnFail: { cpp: 38, java: 44, python: 38, javascript: 40 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'start' | 'explore' | 'relax' | 'done',
    activeArray?: 'dist' | 'visited' | 'pq',
    activeSlot?: [number, number]
  ): void {
    const curH = grid[curR][curC];
    const coordStr = `(x=${curR}, y=${curC})`;
    const effortStr = `${minEffortSoFar} m (第 ${minEffortSoFar} 秒漫平)`;
    const heightStr = `${curH} m`;

    const phaseStr =
      status === 'done'
        ? '最小体力路径达成'
        : status === 'relax'
          ? '松弛探测水流'
          : status === 'explore'
            ? `第 ${minEffortSoFar} 秒水流漫平`
            : '算法初始化';

    let pathNodes: Array<[number, number]> = [];
    let curr: [number, number] | undefined = status === 'done' ? [rows - 1, cols - 1] : [curR, curC];
    let guard = 0;
    while (curr && guard++ < rows * cols) {
      pathNodes.unshift(curr);
      if (curr[0] === 0 && curr[1] === 0) break;
      curr = pre[`${curr[0]},${curr[1]}`];
    }

    steps.push({
      grid: snapshotGrid2D(grid),
      dist: snapshotGrid2D(distance),
      visited: snapshotGrid2D(visited),
      curR,
      curC,
      minEffortSoFar,
      pathNodes,
      parentMap: { ...pre },
      pqList: pq.map((item) => ({ ...item })),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      treeRoot: cloneTree(treeRoot),
      activeNodeId: nodeMap.get(`${curR},${curC}`)?.id || 'node-0-0',
      metrics: {
        'metric-cur-coord': coordStr,
        'metric-min-effort': effortStr,
        'metric-cur-height': heightStr,
        'metric-effort-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法入口] minimumEffortPath(heights n=${rows}, m=${cols})：开启左神网格图最小体力消耗搜索。`, 'minimumEffortPath 入口', 'start');
  makeStep(lines.initDist, `📊 [初始化体力矩阵] distance[${rows}][${cols}] 全部填充 MAX_VALUE；记录到达各格子 (x, y) 所需最小瓶颈。`, 'init distance[][]', 'start', 'dist');

  distance[0][0] = 0;
  makeStep(lines.initDistSrc, '🌱 [起点体力初始化] distance[0][0] = 0；起点自身代价为 0。', 'distance[0][0] = 0', 'start', 'dist', [0, 0]);
  makeStep(lines.initVisited, `🏷️ [初始化锁定矩阵] visited[${rows}][${cols}] = false；标记各 (x, y) 是否已结算。`, 'init visited[][]', 'start', 'visited');
  makeStep(lines.initHeap, '📦 [初始化小根堆] PriorityQueue<int[]> heap 按代价 c 升序排序。', 'init heap', 'start', 'pq');

  pushPq(0, 0, 0);
  makeStep(lines.pushSrc, '📥 [起点入堆] heap.add([x=0, y=0, c=0])；起点加入 Dijkstra 堆！', 'heap.add(0,0,0)', 'start', 'pq', [0, 0]);

  // 左神标志性移动数组: 0:上, 1:右, 2:下, 3:左
  const move = [-1, 0, 1, 0, -1];

  while (pq.length > 0) {
    makeStep(lines.whileHeap, `🔁 [检查堆非空] while (!heap.isEmpty()) -> 待探索状态数: ${pq.length}。`, `检查小根堆前沿待选元素`, 'explore');

    const top = pollPq();
    const nextR = top.r;
    const nextC = top.c;
    const nextEffort = top.effort;

    // 若小人即将移动到新平台，先生成【水流漫平平台】过渡步骤（水流先上涨100%漫平，小人再跳过去）：
    if ((nextR !== curR || nextC !== curC) && (nextR !== 0 || nextC !== 0)) {
      minEffortSoFar = Math.max(minEffortSoFar, nextEffort);
      makeStep(
        lines.pollCur,
        `🌊 [第 ${minEffortSoFar} 秒水流漫平] 水流持续注入！在第 ${minEffortSoFar} 秒，水面已与平台 (${nextR}, ${nextC}) 完全漫平 (高度 ${grid[nextR][nextC]}m)！两地落差彻底抹平，开通通航水道！`,
        `第 ${minEffortSoFar} 秒水流漫平 (${nextR},${nextC})`,
        'relax',
        'pq',
        [nextR, nextC]
      );
    }

    curR = nextR;
    curC = nextC;
    minEffortSoFar = nextEffort;

    const activeNode = nodeMap.get(`${curR},${curC}`);
    if (activeNode) {
      activeNode.status = 'active';
    }

    makeStep(
      lines.pollCur,
      `🦘 [小人跃上平台] 平台 (${curR}, ${curC}) 水流在第 ${minEffortSoFar} 秒已完全漫平，探险家踩着齐平水面轻松跳跃跨入！`,
      `小人跃上平台 (${curR},${curC})`,
      'explore',
      'pq',
      [curR, curC]
    );

    makeStep(lines.checkVisited, `🔎 [检查是否已锁定] if (visited[${curR}][${curC}]) -> (${visited[curR][curC]})。`, `visited[${curR}][${curC}]?`, 'explore');
    if (visited[curR][curC]) {
      makeStep(lines.continueVisited, `⏭️ [跳过已结算格] 格子 (x=${curR}, y=${curC}) 之前已以更小体力出堆，continue。`, `continue visited (x=${curR},y=${curC})`, 'explore');
      continue;
    }

    makeStep(lines.checkTarget, `🎯 [终点剪枝检查] if (x == n - 1 && y == m - 1) -> (${curR === rows - 1 && curC === cols - 1})。`, 'check target', 'explore');
    if (curR === rows - 1 && curC === cols - 1) {
      reachedTarget = true;
      makeStep(lines.returnCost, `🏆 [终点出堆即最优] return c = ${minEffortSoFar}！终点在第 ${minEffortSoFar} 秒完成水流漫平连通，全程最小体力消耗为 ${minEffortSoFar}！`, `return c=${minEffortSoFar}`, 'done', 'dist', [curR, curC]);
      break;
    }

    visited[curR][curC] = true;
    const curVisitedNode = nodeMap.get(`${curR},${curC}`);
    if (curVisitedNode && curVisitedNode.id !== 'node-0-0') {
      curVisitedNode.status = 'visited';
    }
    makeStep(lines.markVisited, `🔒 [锁定最优状态] visited[${curR}][${curC}] = true；在第 ${minEffortSoFar} 秒锁定到达 (x=${curR}, y=${curC}) 的全局最小体力 = ${minEffortSoFar}！`, `visited[${curR}][${curC}]=true`, 'explore', 'visited', [curR, curC]);

    for (let i = 0; i < 4; i++) {
      const nx = curR + move[i];
      const ny = curC + move[i + 1];

      makeStep(lines.forDirs, `  ↳ [遍历4向邻居] 方向 ${i}: nx = x + move[${i}], ny = y + move[${i + 1}] -> (nx=${nx}, ny=${ny})。`, `dir ${i} -> (${nx},${ny})`, 'relax');

      const inBound = nx >= 0 && nx < rows && ny >= 0 && ny < cols;
      const notVis = inBound && !visited[nx][ny];

      makeStep(lines.checkValidNeighbor, `  🔎 [界内与未锁定检查] nx,ny界内(${inBound})、未访问(!visited[${nx}][${ny}]=${notVis})。`, `valid (${nx},${ny})?`, 'relax', undefined, inBound ? [nx, ny] : undefined);

      if (inBound && notVis) {
        const stepEffort = Math.abs(grid[nx][ny] - grid[curR][curC]);
        const nextEffort = Math.max(minEffortSoFar, stepEffort);

        makeStep(lines.calcBottleneck, `  🧗 [计算瓶颈体力] nc = max(c, |h[x][y] - h[nx][ny]|) = max(${minEffortSoFar}, |${grid[curR][curC]} - ${grid[nx][ny]}|) = ${nextEffort}。`, `nc=max(${minEffortSoFar},${stepEffort})=${nextEffort}`, 'relax', undefined, [nx, ny]);

        makeStep(lines.checkRelax, `  🔎 [松弛比较] if (nc < distance[nx][ny]) -> (${nextEffort} < ${distance[nx][ny] === Infinity ? '∞' : distance[nx][ny]})。`, `check nc < dist[${nx}][${ny}]`, 'relax', 'dist', [nx, ny]);

        if (nextEffort < distance[nx][ny]) {
          distance[nx][ny] = nextEffort;
          pre[`${nx},${ny}`] = [curR, curC];
          pushPq(nx, ny, nextEffort);

          const parentNode = nodeMap.get(`${curR},${curC}`) || treeRoot;
          let childNode = nodeMap.get(`${nx},${ny}`);
          if (!childNode) {
            childNode = {
              id: `node-${nx}-${ny}`,
              val: `(${nx},${ny}) eff:${nextEffort}`,
              edgeLabel: `落差:${stepEffort}`,
              status: 'normal',
              tag: nx === rows - 1 && ny === cols - 1 ? '🏁 终点' : undefined,
              children: [],
            };
            parentNode.children = parentNode.children || [];
            parentNode.children.push(childNode);
            nodeMap.set(`${nx},${ny}`, childNode);
          } else {
            childNode.val = `(${nx},${ny}) eff:${nextEffort}`;
            childNode.edgeLabel = `落差:${stepEffort}`;
          }

          makeStep(lines.updateDist, `  ⚡ [更新漫平时间] distance[${nx}][${ny}] = ${nextEffort}；到达 (${nx},${ny}) 需待第 ${nextEffort} 秒水流漫平。`, `distance[${nx}][${ny}]=${nextEffort}`, 'relax', 'dist', [nx, ny]);
          makeStep(lines.pushHeap, `  📥 [新状态入堆] heap.add(new int[] { ${nx}, ${ny}, ${nextEffort} })。`, `heap.add(${nx},${ny},${nextEffort})`, 'relax', 'pq', [nx, ny]);
        }
      }
    }
  }

  if (reachedTarget) {
    let curr: [number, number] | undefined = [rows - 1, cols - 1];
    while (curr) {
      const key: string = `${curr[0]},${curr[1]}`;
      const node = nodeMap.get(key);
      if (node) {
        node.status = 'visited';
        if (curr[0] !== 0 || curr[1] !== 0) {
          node.tag = (curr[0] === rows - 1 && curr[1] === cols - 1) ? '🏁 最优解' : '⭐ 最优路径';
        }
      }
      if (curr[0] === 0 && curr[1] === 0) break;
      curr = pre[key];
    }
    makeStep(lines.returnCost, `🎉 [寻路完成] 成功构建最小体力消耗路径！全程最大落差仅为 ${minEffortSoFar}！`, `完成: effort=${minEffortSoFar}`, 'done');
  } else {
    makeStep(lines.returnFail, '❌ [无路可达] return -1：无法连通终点。', 'return -1', 'done');
  }

  return steps;
}
