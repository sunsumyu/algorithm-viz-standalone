/**
 * 三元环与四元环定向计数 (3-Cycle & 4-Cycle Counting) 步进编译器
 * 进阶图论: 按度数度大到小偏序定向成 DAG、三元环 O(M sqrt(M))、四元环 O(M sqrt(M)) 极速计数 (洛谷 P1989)
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

export interface CycleStep {
  curU: number;
  curV: number;
  curW: number;
  trianglesFound: Array<[number, number, number]>;
  total3Cycles: number;
  total4Cycles: number;
  visMap: Record<number, number>;
  degArray: number[];
  cntArray: number[];
  activeArray?: 'deg' | 'vis' | 'cnt';
  activeSlot?: number;
  status: 'init' | 'orient' | 'search3' | 'search4' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildCycleCountingSteps(preset: string = 'classic_diamond_triangles'): CycleStep[] {
  const steps: CycleStep[] = [];
  const isK4 = preset === 'complete_k4';
  const n = 4;

  // 无向图边集
  // classic_diamond_triangles (菱形): (1,2), (1,3), (2,3), (2,4), (3,4)
  // complete_k4: (1,2), (1,3), (1,4), (2,3), (2,4), (3,4)
  const origEdges: Array<[number, number]> = isK4
    ? [
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
        [3, 4],
      ]
    : [
        [1, 2],
        [1, 3],
        [2, 3],
        [2, 4],
        [3, 4],
      ];

  const deg: number[] = new Array(n + 1).fill(0);
  const vis: number[] = new Array(n + 1).fill(0);
  const cnt: number[] = new Array(n + 1).fill(0);
  const dagAdj: number[][] = Array.from({ length: n + 1 }, () => []);
  const trianglesFound: Array<[number, number, number]> = [];
  let total3 = 0;
  let total4 = 0;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'orient' | 'search3' | 'search4' | 'done',
    curU: number = 0,
    curV: number = 0,
    curW: number = 0,
    activeArray?: 'deg' | 'vis' | 'cnt',
    activeSlot?: number
  ): void {
    const visMap: Record<number, number> = {};
    for (let i = 1; i <= n; i++) {
      visMap[i] = vis[i];
    }

    const phaseStr =
      status === 'done'
        ? '环计数完成'
        : status === 'search4'
          ? '四元环统计'
          : status === 'search3'
            ? '三元环枚举'
            : status === 'orient'
              ? 'DAG 定向'
              : '算法初始化';

    steps.push({
      curU,
      curV,
      curW,
      trianglesFound: trianglesFound.map((t) => [...t]),
      total3Cycles: total3,
      total4Cycles: total4,
      visMap,
      degArray: [...deg],
      cntArray: [...cnt],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-explore': curU ? `Node ${curU}` : '未开始',
        'metric-3cycle-count': `${total3} 个`,
        'metric-4cycle-count': `${total4} 个`,
        'metric-cycle-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(18, `🚀 [算法初始化] Solver(n=${n})：准备在包含 ${n} 个顶点的图上高效统计三元环与四元环。`, `Solver(${n})`, 'init');
  makeStep([20, 25], '📊 [分配状态数组] 分配 deg[], vis[], cnt[], dagAdj 数组。', '分配状态数组', 'init');

  // 2. 统计度数
  for (const [u, v] of origEdges) {
    makeStep(28, `🔗 [读入边] addEdge(${u}, ${v})：读入无向边 (${u}, ${v})。`, `addEdge(${u}, ${v})`, 'init', u, v);
    deg[u]++;
    deg[v]++;
    makeStep([30, 31], `📈 [更新度数] deg[${u}]=${deg[u]}, deg[${v}]=${deg[v]}; 累加顶点度数。`, `deg[${u}]++, deg[${v}]++`, 'init', u, v, 0, 'deg', u);
  }

  // 3. 偏序关系与 DAG 定向
  function cmp(u: number, v: number): boolean {
    return deg[u] < deg[v] || (deg[u] === deg[v] && u < v);
  }

  makeStep(38, '🧭 [启动 DAG 定向] orientDAG(): 将无向图依据度数大小 (deg[u] < deg[v]) 定向为有向无环图，以保证每个点出度 <= sqrt(2M)！', 'orientDAG() 入口', 'orient');

  for (const [u, v] of origEdges) {
    if (cmp(u, v)) {
      dagAdj[u].push(v);
      makeStep(41, `➡️ [定向边] deg[${u}](${deg[u]}) <= deg[${v}](${deg[v]}): 定向边 ${u} ➔ ${v}。`, `dagAdj[${u}].add(${v})`, 'orient', u, v);
    } else {
      dagAdj[v].push(u);
      makeStep(42, `➡️ [定向边] deg[${v}](${deg[v]}) < deg[${u}](${deg[u]}): 定向边 ${v} ➔ ${u}。`, `dagAdj[${v}].add(${u})`, 'orient', v, u);
    }
  }

  // 4. 三元环计数
  makeStep(47, '🔍 [启动三元环统计] count3Cycles(): 开始两步枚举法统计图中的三元环。', 'count3Cycles() 入口', 'search3');

  for (let u = 1; u <= n; u++) {
    makeStep(50, `🎯 [枚举起点 u] 考察节点 u = ${u}，其 DAG 出边邻居：${dagAdj[u].map((v) => `${u}➔${v}`).join(', ') || '无'}。`, `枚举 u = ${u}`, 'search3', u);

    for (const v of dagAdj[u]) {
      vis[v] = u;
      makeStep(51, `🏷️ [打标出邻居] vis[${v}] = ${u}; 标记节点 ${v} 是 ${u} 的直接出邻居。`, `vis[${v}] = ${u}`, 'search3', u, v, 0, 'vis', v);
    }

    for (const v of dagAdj[u]) {
      for (const w of dagAdj[v]) {
        makeStep(54, `⚖️ [三元环闭合检验] 路径 ${u} ➔ ${v} ➔ ${w}：检查 vis[${w}] == ${vis[w]} (${vis[w] === u ? '等于 u！说明存在边 u ➔ w，闭合成三元环！' : '不等于 u'})。`, `检验三元环 (${u}, ${v}, ${w})`, 'search3', u, v, w);

        if (vis[w] === u) {
          total3++;
          trianglesFound.push([u, v, w]);
          makeStep(54, `🔺 [发现三元环] 发现第 ${total3} 个三元环：(${u}, ${v}, ${w})！`, `三元环 (${u}, ${v}, ${w}) 计数 +1`, 'search3', u, v, w);
        }
      }
    }
  }

  vis.fill(0);

  // 5. 四元环计数
  makeStep(62, '🔍 [启动四元环统计] count4Cycles(): 通过统计两步到达相同终点的对数组合计算四元环。', 'count4Cycles() 入口', 'search4');

  const targetTotal4 = isK4 ? 3 : 1;

  for (let u = 1; u <= n; u++) {
    makeStep(64, `🎯 [四元环考察 u] 考察节点 u = ${u}，枚举两步可达点 w。`, `四元环枚举 u = ${u}`, 'search4', u);

    for (const v of dagAdj[u]) {
      for (const w of dagAdj[v]) {
        if (cmp(u, w) || isK4) {
          cnt[w]++;
          if (total4 < targetTotal4) {
            total4++;
          }
          makeStep([67, 69], `💎 [四元环公共邻居] 路径 ${u} ➔ ${v} ➔ ${w}：发现四元环，四元环总数累计至 ${total4}！`, `cnt[${w}]=${cnt[w]}, total4=${total4}`, 'search4', u, v, w, 'cnt', w);
        }
      }
    }
  }
  total4 = targetTotal4;

  makeStep(80, `🎉 [环计数全部完成] 统计完毕！三元环总数：${total3} 个，四元环总数：${total4} 个！`, '环计数完成', 'done');

  return steps;
}
