/**
 * 电动车充放电最短路 (EV Charging Dijkstra - LeetCode LCP 35) 步进编译器 (Deep Module)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：状态升维 (city, power) 建模、原地充电与道路放电双决策推演、行号联动
 */

export interface EVStep {
  curCity: number;
  curPower: number;
  cost: number;
  distGrid: Record<string, number>;
  pqList: Array<{ city: number; power: number; cost: number }>;
  activeArray?: 'dist' | 'vis' | 'pq';
  activeSlot?: [number, number];
  status: 'init' | 'charge' | 'move' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
  charge?: number[];
  paths?: Array<[number, number, number]>;
}

export function buildEVChargeSteps(preset: string = 'lcp35_3cities'): EVStep[] {
  const steps: EVStep[] = [];
  const isShortcut = preset === 'lcp35_shortcut';

  const n = 3;
  const cnt = 2;
  const start = 0;
  const end = 2;
  const charge = isShortcut ? [3, 2, 5] : [2, 1, 5];
  const paths: Array<[number, number, number]> = isShortcut
    ? [
        [0, 1, 2],
        [1, 2, 1],
      ]
    : [
        [0, 1, 2],
        [1, 2, 2],
      ];

  const adj: Array<Array<{ to: number; w: number }>> = Array.from({ length: n }, () => []);
  for (const [u, v, w] of paths) {
    adj[u].push({ to: v, w });
    adj[v].push({ to: u, w });
  }

  const dist: number[][] = Array.from({ length: n }, () =>
    new Array(cnt + 1).fill(Infinity)
  );
  const vis: boolean[][] = Array.from({ length: n }, () =>
    new Array(cnt + 1).fill(false)
  );

  const pq: Array<{ city: number; power: number; cost: number }> = [];

  function pushPq(city: number, power: number, cost: number): void {
    pq.push({ city, power, cost });
    pq.sort((a, b) => a.cost - b.cost);
  }

  function pollPq(): { city: number; power: number; cost: number } {
    return pq.shift()!;
  }

  let curCity = start;
  let curPower = 0;
  let curCost = 0;

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init' | 'charge' | 'move' | 'done',
    activeArray?: 'dist' | 'vis' | 'pq',
    activeSlot?: [number, number]
  ): void {
    const dGrid: Record<string, number> = {};
    for (let c = 0; c < n; c++) {
      for (let p = 0; p <= cnt; p++) {
        dGrid[`${c},${p}`] = dist[c][p] === Infinity ? 999 : dist[c][p];
      }
    }

    const cityStr = `城市 C${curCity}`;
    const powerStr = `${curPower} / ${cnt} 格电`;
    const costStr = `${curCost} 单位时间`;

    const phaseStr =
      status === 'done'
        ? '最优方案求解完成'
        : status === 'charge'
          ? '原地充电 +1格'
          : status === 'move'
            ? '道路行驶放电'
            : '初始化';

    steps.push({
      curCity,
      curPower,
      cost: curCost,
      distGrid: dGrid,
      pqList: pq.map((x) => ({ ...x })),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      charge,
      paths,
      metrics: {
        'metric-cur-city': cityStr,
        'metric-cur-power': powerStr,
        'metric-cur-cost': costStr,
        'metric-ev-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(12, `🚀 [初始化分层图] 创建 dist[${n}][${cnt + 1}] 距离表全部填 ∞，vis 数组全为 false。`, '初始化状态空间', 'init');

  dist[start][0] = 0;
  pushPq(start, 0, 0);
  makeStep(17, `🌱 [源点入堆] 起点城市 C${start} 初始电量 0 格，花费为 0。pq.push({city: ${start}, power: 0, cost: 0})。`, `dist[${start}][0]=0`, 'init', 'dist', [start, 0]);

  // 2. 堆优化 Dijkstra 循环
  while (pq.length > 0) {
    const top = pollPq();
    curCity = top.city;
    curPower = top.power;
    curCost = top.cost;

    makeStep(22, `📤 [堆顶出堆] 提取当前累计花费最小的状态: 城市 C${curCity}, 电量 ${curPower} 格, 花费 ${curCost}。`, `poll: C${curCity}, p=${curPower}, c=${curCost}`, 'init', 'pq');

    if (vis[curCity][curPower]) {
      makeStep(24, `⏭️ [跳过已访问状态] 状态 (C${curCity}, ${curPower}格) 此前已锁定最优解，跳过。`, `skip: C${curCity}, p=${curPower}`, 'init', 'vis', [curCity, curPower]);
      continue;
    }

    vis[curCity][curPower] = true;
    makeStep(25, `🔒 [锁定最优到达时间] 状态 (C${curCity}, ${curPower}格) 标记为锁定，最优时间为 ${curCost}！`, `vis[${curCity}][${curPower}]=true`, 'init', 'vis', [curCity, curPower]);

    // 终点特判
    if (curCity === end) {
      makeStep(27, `🎯 [抵达终点目标] 到达终点城市 C${end}，当前出堆花费 ${curCost} 为全局最优！`, `到达终点 C${end}`, 'done');
      break;
    }

    // 决策 1: 原地充电 1 格
    if (curPower < cnt) {
      const nextPower = curPower + 1;
      const nextCost = curCost + charge[curCity];

      makeStep(30, `🔋 [决策一：原地充电] 城市 C${curCity} 单价为 ${charge[curCity]}。尝试充 1 格电: 预计耗时 ${nextCost}。`, `尝试充电: p=${nextPower}`, 'charge');

      if (nextCost < dist[curCity][nextPower]) {
        dist[curCity][nextPower] = nextCost;
        pushPq(curCity, nextPower, nextCost);
        makeStep(33, `⚡ [充电状态松弛] dist[C${curCity}][${nextPower}格] 缩短为 ${nextCost}，新状态推入小根堆！`, `dist[${curCity}][${nextPower}]=${nextCost}`, 'charge', 'dist', [curCity, nextPower]);
      }
    }

    // 决策 2: 沿道路行驶并放电
    for (const e of adj[curCity]) {
      const nextCity = e.to;
      const roadCost = e.w;

      makeStep(37, `🚗 [决策二：公路行驶考察] 考察公路 (C${curCity} ➔ C${nextCity})，需要耗电 ${roadCost} 格。当前电量: ${curPower} 格。`, `考察道路: ->C${nextCity}`, 'move');

      if (curPower >= roadCost) {
        const nextPower = curPower - roadCost;
        const nextCost = curCost + roadCost;

        if (nextCost < dist[nextCity][nextPower]) {
          dist[nextCity][nextPower] = nextCost;
          pushPq(nextCity, nextPower, nextCost);
          makeStep(42, `✨ [行驶到达新城市] 成功驶向城市 C${nextCity}！剩余电量 ${nextPower} 格，累计耗时 ${nextCost}，推入小根堆！`, `到达 C${nextCity}, p=${nextPower}`, 'move', 'dist', [nextCity, nextPower]);
        }
      } else {
        makeStep(38, `⚠️ [电量不足无法通行] 当前电量 ${curPower} < 道路所需 ${roadCost}，必须先在当前城市充电才能通行。`, `电量不足: ${curPower} < ${roadCost}`, 'move');
      }
    }
  }

  // 终态
  makeStep(48, `🎉 [电动车最优方案求解完成] 抵达目的城市 C${end} 的全局最优总耗时为 ${curCost}！分层图通过将电量离散扩维，完美将充电决策融入单源最短路！`, '算法结束', 'done');

  return steps;
}
