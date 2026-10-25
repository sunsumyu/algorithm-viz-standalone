import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

export interface WFStep {
  heights: number[][];
  rows: number;
  cols: number;
  pacReachable: boolean[][];
  atlReachable: boolean[][];
  currentCell: [number, number] | null;
  stage: string;
  pacCount: number;
  atlCount: number;
  bothCount: number;
  action: 'init' | 'pacific' | 'atlantic' | 'intersect' | 'done';
  statusText: string;
  message?: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

const lines = {
  init: 4, // int m = heights.length, n = heights[0].length;
  pacific: 26, // visited[r][c] = true;
  atlantic: 26, // visited[r][c] = true;
  intersect: 19, // if (pac[r][c] && atl[r][c]) res.add(Arrays.asList(r, c));
  done: 22, // return res;
};

export const DEFAULT_HEIGHTS = [
  [1, 2, 2, 3, 5],
  [3, 2, 3, 4, 4],
  [2, 4, 5, 3, 1],
  [6, 7, 1, 4, 5],
  [5, 1, 1, 2, 4],
];

const JAVA_DIRS = [
  { dr: 1, dc: 0, name: '下', line: 27 },
  { dr: -1, dc: 0, name: '上', line: 28 },
  { dr: 0, dc: 1, name: '右', line: 29 },
  { dr: 0, dc: -1, name: '左', line: 30 },
];

export function buildWaterFlowSteps(heights: number[][] = DEFAULT_HEIGHTS): WFStep[] {
  const steps: WFStep[] = [];
  const R = heights.length;
  const C = heights[0].length;

  const pac = Array.from({ length: R }, () => Array(C).fill(false));
  const atl = Array.from({ length: R }, () => Array(C).fill(false));

  let pacCount = 0;
  let atlCount = 0;

  // 0. 初始化
  steps.push({
    heights: snapshotGrid2D(heights),
    rows: R,
    cols: C,
    pacReachable: snapshotGrid2D(pac),
    atlReachable: snapshotGrid2D(atl),
    currentCell: null,
    stage: '准备开始',
    pacCount: 0,
    atlCount: 0,
    bothCount: 0,
    action: 'init',
    statusText: `初始化 ${R}×${C} 高度网格。双洋逆流登山：水从高向低流，逆向则从大洋边界向更高或等高山峰探索。`,
    log: `初始化: ${R}×${C} 地形高度矩阵`,
    codeLine: 4,
  });

  // 1. 太平洋搜索 (左边界和上边界)
  const dfsPac = (r: number, c: number, prevH: number) => {
    if (r < 0 || r >= R || c < 0 || c >= C || pac[r][c] || heights[r][c] < prevH) return;
    pac[r][c] = true;
    pacCount++;

    // 染色并标记可达步 -> 对应 Java 第 26 行: visited[r][c] = true;
    steps.push({
      heights: snapshotGrid2D(heights),
      rows: R,
      cols: C,
      pacReachable: snapshotGrid2D(pac),
      atlReachable: snapshotGrid2D(atl),
      currentCell: [r, c],
      stage: '太平洋逆流搜索',
      pacCount,
      atlCount,
      bothCount: 0,
      action: 'pacific',
      statusText: `登山成功！坐标 (${r}, ${c}) [高度=${heights[r][c]} >= 前驱 ${prevH}]，标记 pac[${r}][${c}]=true`,
      log: `太平洋可达: (${r}, ${c}) 高度=${heights[r][c]}`,
      codeLine: 26,
    });

    for (const dir of JAVA_DIRS) {
      const nr = r + dir.dr;
      const nc = c + dir.dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && !pac[nr][nc] && heights[nr][nc] >= heights[r][c]) {
        // 向四方向递归深入步 -> 动态对应第 27, 28, 29, 30 行！
        steps.push({
          heights: snapshotGrid2D(heights),
          rows: R,
          cols: C,
          pacReachable: snapshotGrid2D(pac),
          atlReachable: snapshotGrid2D(atl),
          currentCell: [r, c],
          stage: '太平洋逆流搜索',
          pacCount,
          atlCount,
          bothCount: 0,
          action: 'pacific',
          statusText: `向${dir.name}递归深入 -> 调用 dfs(..., (${nr}, ${nc}), 高度=${heights[r][c]})`,
          log: `太平洋深入: (${r}, ${c}) -> (${nr}, ${nc})`,
          codeLine: dir.line,
        });
        dfsPac(nr, nc, heights[r][c]);
      }
    }
  };

  // 太平洋左边界调用 (第 8 行)
  for (let r = 0; r < R; r++) {
    if (!pac[r][0]) {
      steps.push({
        heights: snapshotGrid2D(heights),
        rows: R,
        cols: C,
        pacReachable: snapshotGrid2D(pac),
        atlReachable: snapshotGrid2D(atl),
        currentCell: [r, 0],
        stage: '太平洋逆流搜索',
        pacCount,
        atlCount,
        bothCount: 0,
        action: 'pacific',
        statusText: `太平洋左边界起点 (${r}, 0) 发起逆流搜索 -> dfs(heights, pac, ${r}, 0)`,
        log: `太平洋左岸注入: (${r}, 0)`,
        codeLine: 8,
      });
      dfsPac(r, 0, heights[r][0]);
    }
  }

  // 太平洋上边界调用 (第 13 行)
  for (let c = 0; c < C; c++) {
    if (!pac[0][c]) {
      steps.push({
        heights: snapshotGrid2D(heights),
        rows: R,
        cols: C,
        pacReachable: snapshotGrid2D(pac),
        atlReachable: snapshotGrid2D(atl),
        currentCell: [0, c],
        stage: '太平洋逆流搜索',
        pacCount,
        atlCount,
        bothCount: 0,
        action: 'pacific',
        statusText: `太平洋上边界起点 (0, ${c}) 发起逆流搜索 -> dfs(heights, pac, 0, ${c})`,
        log: `太平洋北岸注入: (0, ${c})`,
        codeLine: 13,
      });
      dfsPac(0, c, heights[0][c]);
    }
  }

  // 2. 大西洋搜索 (右边界和下边界)
  const dfsAtl = (r: number, c: number, prevH: number) => {
    if (r < 0 || r >= R || c < 0 || c >= C || atl[r][c] || heights[r][c] < prevH) return;
    atl[r][c] = true;
    atlCount++;

    // 染色并标记可达步 -> 对应 Java 第 26 行: visited[r][c] = true;
    steps.push({
      heights: snapshotGrid2D(heights),
      rows: R,
      cols: C,
      pacReachable: snapshotGrid2D(pac),
      atlReachable: snapshotGrid2D(atl),
      currentCell: [r, c],
      stage: '大西洋逆流搜索',
      pacCount,
      atlCount,
      bothCount: 0,
      action: 'atlantic',
      statusText: `登山成功！坐标 (${r}, ${c}) [高度=${heights[r][c]} >= 前驱 ${prevH}]，标记 atl[${r}][${c}]=true`,
      log: `大西洋可达: (${r}, ${c}) 高度=${heights[r][c]}`,
      codeLine: 26,
    });

    for (const dir of JAVA_DIRS) {
      const nr = r + dir.dr;
      const nc = c + dir.dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && !atl[nr][nc] && heights[nr][nc] >= heights[r][c]) {
        // 向四方向递归深入步 -> 动态对应第 27, 28, 29, 30 行！
        steps.push({
          heights: snapshotGrid2D(heights),
          rows: R,
          cols: C,
          pacReachable: snapshotGrid2D(pac),
          atlReachable: snapshotGrid2D(atl),
          currentCell: [r, c],
          stage: '大西洋逆流搜索',
          pacCount,
          atlCount,
          bothCount: 0,
          action: 'atlantic',
          statusText: `向${dir.name}递归深入 -> 调用 dfs(..., (${nr}, ${nc}), 高度=${heights[r][c]})`,
          log: `大西洋深入: (${r}, ${c}) -> (${nr}, ${nc})`,
          codeLine: dir.line,
        });
        dfsAtl(nr, nc, heights[r][c]);
      }
    }
  };

  // 大西洋右边界调用 (第 9 行)
  for (let r = 0; r < R; r++) {
    if (!atl[r][C - 1]) {
      steps.push({
        heights: snapshotGrid2D(heights),
        rows: R,
        cols: C,
        pacReachable: snapshotGrid2D(pac),
        atlReachable: snapshotGrid2D(atl),
        currentCell: [r, C - 1],
        stage: '大西洋逆流搜索',
        pacCount,
        atlCount,
        bothCount: 0,
        action: 'atlantic',
        statusText: `大西洋右边界起点 (${r}, ${C - 1}) 发起逆流搜索 -> dfs(heights, atl, ${r}, ${C - 1})`,
        log: `大西洋东岸注入: (${r}, ${C - 1})`,
        codeLine: 9,
      });
      dfsAtl(r, C - 1, heights[r][C - 1]);
    }
  }

  // 大西洋下边界调用 (第 14 行)
  for (let c = 0; c < C; c++) {
    if (!atl[R - 1][c]) {
      steps.push({
        heights: snapshotGrid2D(heights),
        rows: R,
        cols: C,
        pacReachable: snapshotGrid2D(pac),
        atlReachable: snapshotGrid2D(atl),
        currentCell: [R - 1, c],
        stage: '大西洋逆流搜索',
        pacCount,
        atlCount,
        bothCount: 0,
        action: 'atlantic',
        statusText: `大西洋下边界起点 (${R - 1}, ${c}) 发起逆流搜索 -> dfs(heights, atl, ${R - 1}, ${c})`,
        log: `大西洋南岸注入: (${R - 1}, ${c})`,
        codeLine: 14,
      });
      dfsAtl(R - 1, c, heights[R - 1][c]);
    }
  }

  // 3. 求双洋交集
  let bothCount = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (pac[r][c] && atl[r][c]) {
        bothCount++;
        // 交集命中步 -> 对应 Java 第 19 行: if (pac[r][c] && atl[r][c]) res.add(...)
        steps.push({
          heights: snapshotGrid2D(heights),
          rows: R,
          cols: C,
          pacReachable: snapshotGrid2D(pac),
          atlReachable: snapshotGrid2D(atl),
          currentCell: [r, c],
          stage: '双洋交集枢纽',
          pacCount,
          atlCount,
          bothCount,
          action: 'intersect',
          statusText: `坐标 (${r}, ${c}) 同时满足太平洋可达与大西洋可达！并入结果列表 res。`,
          log: `★ 双洋交集: (${r}, ${c}) [高度=${heights[r][c]}]`,
          codeLine: 19,
        });
      }
    }
  }

  // 4. 分析完成 -> 对应 Java 第 22 行: return res;
  steps.push({
    heights: snapshotGrid2D(heights),
    rows: R,
    cols: C,
    pacReachable: snapshotGrid2D(pac),
    atlReachable: snapshotGrid2D(atl),
    currentCell: null,
    stage: '分析完成',
    pacCount,
    atlCount,
    bothCount,
    action: 'done',
    statusText: `🎉 太平洋大西洋水流分析完成！共发现 ${bothCount} 个格子既可流向太平洋也可流向大西洋。`,
    log: `✓ 分析完成: 双洋连通点共 ${bothCount} 处`,
    codeLine: 22,
  });

  return steps;
}

export const buildStage2DfsSteps = buildWaterFlowSteps;

/**
 * Stage 1: 正向单源顺流暴力 (Brute-force Forward Simulation)
 * 复杂度: O((MN)²)
 */
export function buildStage1BruteForceSteps(heights: number[][] = DEFAULT_HEIGHTS): WFStep[] {
  const steps: WFStep[] = [];
  const R = heights.length;
  const C = heights[0].length;
  const pac = Array.from({ length: R }, () => Array(C).fill(false));
  const atl = Array.from({ length: R }, () => Array(C).fill(false));
  let bothCount = 0;

  steps.push({
    heights: snapshotGrid2D(heights),
    rows: R,
    cols: C,
    pacReachable: snapshotGrid2D(pac),
    atlReachable: snapshotGrid2D(atl),
    currentCell: null,
    stage: '正向顺流暴力',
    pacCount: 0,
    atlCount: 0,
    bothCount: 0,
    action: 'init',
    statusText: `【阶段 1: 正向顺流暴力】对每个格子分别模拟水往低处流，验证能否同时抵达太平洋与大西洋 (复杂度 O((MN)²))。`,
    log: `初始化: 单源顺流正向模拟`,
    codeLine: 4,
  });

  // 为了推演节奏合理，对全图遍历进行代表性格子顺流追踪
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const reach = [false, false]; // [0]: Pac, [1]: Atl
      const vis = Array.from({ length: R }, () => Array(C).fill(false));

      steps.push({
        heights: snapshotGrid2D(heights),
        rows: R,
        cols: C,
        pacReachable: snapshotGrid2D(pac),
        atlReachable: snapshotGrid2D(atl),
        currentCell: [r, c],
        stage: '正向顺流暴力',
        pacCount: pac.flat().filter(Boolean).length,
        atlCount: atl.flat().filter(Boolean).length,
        bothCount,
        action: 'pacific',
        statusText: `探查起点 (${r}, ${c}) [高度=${heights[r][c]}]：启动顺流探测水流能否到达双洋边界`,
        log: `单源顺流启动: (${r}, ${c})`,
        codeLine: 6,
      });

      const forwardDfs = (cr: number, cc: number) => {
        if (cr === 0 || cc === 0) reach[0] = true;
        if (cr === R - 1 || cc === C - 1) reach[1] = true;
        if (reach[0] && reach[1]) return;
        vis[cr][cc] = true;

        for (const dir of JAVA_DIRS) {
          const nr = cr + dir.dr;
          const nc = cc + dir.dc;
          if (nr >= 0 && nr < R && nc >= 0 && nc < C && !vis[nr][nc] && heights[nr][nc] <= heights[cr][cc]) {
            forwardDfs(nr, nc);
          }
        }
      };

      forwardDfs(r, c);

      if (reach[0]) pac[r][c] = true;
      if (reach[1]) atl[r][c] = true;

      if (reach[0] && reach[1]) {
        bothCount++;
        steps.push({
          heights: snapshotGrid2D(heights),
          rows: R,
          cols: C,
          pacReachable: snapshotGrid2D(pac),
          atlReachable: snapshotGrid2D(atl),
          currentCell: [r, c],
          stage: '双洋交集枢纽',
          pacCount: pac.flat().filter(Boolean).length,
          atlCount: atl.flat().filter(Boolean).length,
          bothCount,
          action: 'intersect',
          statusText: `★ 起点 (${r}, ${c}) 顺流成功连通太平洋与大西洋！找到第 ${bothCount} 处双洋枢纽。`,
          log: `★ 顺流命中: (${r}, ${c}) [高度=${heights[r][c]}]`,
          codeLine: 10,
        });
      }
    }
  }

  steps.push({
    heights: snapshotGrid2D(heights),
    rows: R,
    cols: C,
    pacReachable: snapshotGrid2D(pac),
    atlReachable: snapshotGrid2D(atl),
    currentCell: null,
    stage: '分析完成',
    pacCount: pac.flat().filter(Boolean).length,
    atlCount: atl.flat().filter(Boolean).length,
    bothCount,
    action: 'done',
    statusText: `🎉 正向顺流暴力遍历完成！发现 ${bothCount} 个格子既可流向太平洋也可流向大西洋。`,
    log: `✓ 分析完成: 双洋连通点共 ${bothCount} 处`,
    codeLine: 13,
  });

  return steps;
}

/**
 * Stage 3: 逆向多源 BFS 波前扩张 (Reverse Multi-source BFS)
 * 复杂度: O(MN)
 */
export function buildStage3BfsSteps(heights: number[][] = DEFAULT_HEIGHTS): WFStep[] {
  const steps: WFStep[] = [];
  const R = heights.length;
  const C = heights[0].length;
  const pac = Array.from({ length: R }, () => Array(C).fill(false));
  const atl = Array.from({ length: R }, () => Array(C).fill(false));
  const pacQ: [number, number][] = [];
  const atlQ: [number, number][] = [];

  let pacCount = 0;
  let atlCount = 0;

  steps.push({
    heights: snapshotGrid2D(heights),
    rows: R,
    cols: C,
    pacReachable: snapshotGrid2D(pac),
    atlReachable: snapshotGrid2D(atl),
    currentCell: null,
    stage: '准备开始',
    pacCount: 0,
    atlCount: 0,
    bothCount: 0,
    action: 'init',
    statusText: `【阶段 3: 逆向多源 BFS】双洋多源种子全部入队，采用 FIFO 队列层序波前逆流扩张 (复杂度 O(MN))。`,
    log: `初始化: 多源 BFS 波前队列`,
    codeLine: 4,
  });

  // 1. 太平洋多源种子入队
  for (let r = 0; r < R; r++) {
    pac[r][0] = true;
    pacQ.push([r, 0]);
    pacCount++;
  }
  for (let c = 0; c < C; c++) {
    if (!pac[0][c]) {
      pac[0][c] = true;
      pacQ.push([0, c]);
      pacCount++;
    }
  }

  steps.push({
    heights: snapshotGrid2D(heights),
    rows: R,
    cols: C,
    pacReachable: snapshotGrid2D(pac),
    atlReachable: snapshotGrid2D(atl),
    currentCell: [0, 0],
    stage: '太平洋逆流搜索',
    pacCount,
    atlCount: 0,
    bothCount: 0,
    action: 'pacific',
    statusText: `太平洋西北岸 ${pacQ.length} 个多源边界种子全部装载入队 pacQ，启动波前扩张！`,
    log: `太平洋多源种子: ${pacQ.length} 个入队`,
    codeLine: 9,
  });

  // 太平洋 BFS 波前推进
  while (pacQ.length > 0) {
    const [r, c] = pacQ.shift()!;
    steps.push({
      heights: snapshotGrid2D(heights),
      rows: R,
      cols: C,
      pacReachable: snapshotGrid2D(pac),
      atlReachable: snapshotGrid2D(atl),
      currentCell: [r, c],
      stage: '太平洋逆流搜索',
      pacCount,
      atlCount: 0,
      bothCount: 0,
      action: 'pacific',
      statusText: `波前出队: (${r}, ${c}) [高度=${heights[r][c]}] 出队扩张四邻`,
      log: `pacQ.poll(): (${r}, ${c})`,
      codeLine: 26,
    });

    for (const dir of JAVA_DIRS) {
      const nr = r + dir.dr;
      const nc = c + dir.dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && !pac[nr][nc] && heights[nr][nc] >= heights[r][c]) {
        pac[nr][nc] = true;
        pacCount++;
        pacQ.push([nr, nc]);

        steps.push({
          heights: snapshotGrid2D(heights),
          rows: R,
          cols: C,
          pacReachable: snapshotGrid2D(pac),
          atlReachable: snapshotGrid2D(atl),
          currentCell: [nr, nc],
          stage: '太平洋逆流搜索',
          pacCount,
          atlCount: 0,
          bothCount: 0,
          action: 'pacific',
          statusText: `🌊 逆流波前蔓延至 (${nr}, ${nc}) [高度=${heights[nr][nc]}]，新节点压入 pacQ`,
          log: `太平洋波前入队: (${nr}, ${nc})`,
          codeLine: 30,
        });
      }
    }
  }

  // 2. 大西洋多源种子入队
  for (let r = 0; r < R; r++) {
    atl[r][C - 1] = true;
    atlQ.push([r, C - 1]);
    atlCount++;
  }
  for (let c = 0; c < C; c++) {
    if (!atl[R - 1][c]) {
      atl[R - 1][c] = true;
      atlQ.push([R - 1, c]);
      atlCount++;
    }
  }

  steps.push({
    heights: snapshotGrid2D(heights),
    rows: R,
    cols: C,
    pacReachable: snapshotGrid2D(pac),
    atlReachable: snapshotGrid2D(atl),
    currentCell: [R - 1, C - 1],
    stage: '大西洋逆流搜索',
    pacCount,
    atlCount,
    bothCount: 0,
    action: 'atlantic',
    statusText: `大西洋东南岸 ${atlQ.length} 个多源边界种子全部装载入队 atlQ，启动波前扩张！`,
    log: `大西洋多源种子: ${atlQ.length} 个入队`,
    codeLine: 14,
  });

  // 大西洋 BFS 波前推进
  while (atlQ.length > 0) {
    const [r, c] = atlQ.shift()!;
    steps.push({
      heights: snapshotGrid2D(heights),
      rows: R,
      cols: C,
      pacReachable: snapshotGrid2D(pac),
      atlReachable: snapshotGrid2D(atl),
      currentCell: [r, c],
      stage: '大西洋逆流搜索',
      pacCount,
      atlCount,
      bothCount: 0,
      action: 'atlantic',
      statusText: `波前出队: (${r}, ${c}) [高度=${heights[r][c]}] 出队扩张四邻`,
      log: `atlQ.poll(): (${r}, ${c})`,
      codeLine: 26,
    });

    for (const dir of JAVA_DIRS) {
      const nr = r + dir.dr;
      const nc = c + dir.dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && !atl[nr][nc] && heights[nr][nc] >= heights[r][c]) {
        atl[nr][nc] = true;
        atlCount++;
        atlQ.push([nr, nc]);

        steps.push({
          heights: snapshotGrid2D(heights),
          rows: R,
          cols: C,
          pacReachable: snapshotGrid2D(pac),
          atlReachable: snapshotGrid2D(atl),
          currentCell: [nr, nc],
          stage: '大西洋逆流搜索',
          pacCount,
          atlCount,
          bothCount: 0,
          action: 'atlantic',
          statusText: `🌊 逆流波前蔓延至 (${nr}, ${nc}) [高度=${heights[nr][nc]}]，新节点压入 atlQ`,
          log: `大西洋波前入队: (${nr}, ${nc})`,
          codeLine: 30,
        });
      }
    }
  }

  // 3. 求双洋交集
  let bothCount = 0;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (pac[r][c] && atl[r][c]) {
        bothCount++;
        steps.push({
          heights: snapshotGrid2D(heights),
          rows: R,
          cols: C,
          pacReachable: snapshotGrid2D(pac),
          atlReachable: snapshotGrid2D(atl),
          currentCell: [r, c],
          stage: '双洋交集枢纽',
          pacCount,
          atlCount,
          bothCount,
          action: 'intersect',
          statusText: `双洋波前交汇！坐标 (${r}, ${c}) 同时被太平洋与大西洋波前覆盖，并入结果集！`,
          log: `★ 双洋交集: (${r}, ${c}) [高度=${heights[r][c]}]`,
          codeLine: 20,
        });
      }
    }
  }

  // 4. 分析完成
  steps.push({
    heights: snapshotGrid2D(heights),
    rows: R,
    cols: C,
    pacReachable: snapshotGrid2D(pac),
    atlReachable: snapshotGrid2D(atl),
    currentCell: null,
    stage: '分析完成',
    pacCount,
    atlCount,
    bothCount,
    action: 'done',
    statusText: `🎉 逆向多源 BFS 波前扩张完成！共探明 ${bothCount} 处双洋交集分水岭枢纽。`,
    log: `✓ 分析完成: 双洋连通点共 ${bothCount} 处`,
    codeLine: 23,
  });

  return steps;
}

export const PRESET_CASES: Record<string, { label: string; heights: number[][] }> = {
  classic: {
    label: '经典地形 [5×5]',
    heights: DEFAULT_HEIGHTS,
  },
  valley: {
    label: '中央洼地 [4×4]',
    heights: [
      [3, 3, 3, 3],
      [3, 1, 1, 3],
      [3, 1, 1, 3],
      [3, 3, 3, 3],
    ],
  },
  slope: {
    label: '单向斜坡 [3×4]',
    heights: [
      [1, 2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6],
    ],
  },
};

export function heightsToText(heights: number[][]): string {
  return heights.map((row) => row.join(' ')).join('\n');
}

export function formatHeightsInput(heights: number[][]): string {
  return heights.map((row) => row.join(' ')).join('; ');
}

export function parseHeightsText(input: string): number[][] {
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_HEIGHTS;

  let rows = trimmed
    .split(/[\r\n]+|;/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) =>
      line
        .replace(/[\[\]，]/g, ' ')
        .split(/[\s,]+/)
        .filter((t) => t.length > 0)
        .map((t) => parseInt(t, 10))
        .filter((v) => !Number.isNaN(v))
    )
    .filter((row) => row.length > 0);

  // 健壮性自愈防线：若因单行文本框回车被吞并导致只切出 1 行，但包含了大量数字
  if (rows.length === 1 && rows[0].length >= 9) {
    const total = rows[0].length;
    const sqrt = Math.round(Math.sqrt(total));
    if (sqrt * sqrt === total) {
      const squareRows: number[][] = [];
      for (let i = 0; i < total; i += sqrt) {
        squareRows.push(rows[0].slice(i, i + sqrt));
      }
      return squareRows;
    }
    if (total % 5 === 0) {
      const folded: number[][] = [];
      for (let i = 0; i < total; i += 5) {
        folded.push(rows[0].slice(i, i + 5));
      }
      return folded;
    }
  }

  return rows.length > 0 ? rows : DEFAULT_HEIGHTS;
}

export function withMetrics(steps: WFStep[]): WFStep[] {
  return steps.map((s) => ({
    ...s,
    message: s.statusText,
    metrics: {
      'metric-cur-cell': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '—',
      'metric-stage': s.stage,
      'metric-pac-count': `${s.pacCount}`,
      'metric-atl-count': `${s.atlCount}`,
      'metric-both-count': `${s.bothCount}`,
      action:
        s.action === 'pacific'
          ? `太平洋逆流: (${s.currentCell ? s.currentCell.join(',') : ''}) >= 边界，pac[r][c]=true`
          : s.action === 'atlantic'
          ? `大西洋逆流: (${s.currentCell ? s.currentCell.join(',') : ''}) >= 边界，atl[r][c]=true`
          : s.action === 'intersect'
          ? `交集命中: pac[${s.currentCell ? s.currentCell[0] : 0}][${s.currentCell ? s.currentCell[1] : 0}] && atl == true -> 双洋枢纽`
          : '若 heights[next] >= heights[curr]，则逆流可达',
    },
  }));
}

export function createWaterFlowSteps(heightsInput?: string | number[][]): WFStep[] {
  const grid = Array.isArray(heightsInput)
    ? heightsInput
    : parseHeightsText(String(heightsInput ?? ''));
  return withMetrics(buildWaterFlowSteps(grid));
}

export function createWaterFlowStageSteps(stageId: string, heightsInput?: string | number[][]): WFStep[] {
  const grid = Array.isArray(heightsInput)
    ? heightsInput
    : parseHeightsText(String(heightsInput ?? ''));
  if (stageId === 'stage-1') {
    return withMetrics(buildStage1BruteForceSteps(grid));
  } else if (stageId === 'stage-3') {
    return withMetrics(buildStage3BfsSteps(grid));
  }
  return withMetrics(buildStage2DfsSteps(grid));
}
