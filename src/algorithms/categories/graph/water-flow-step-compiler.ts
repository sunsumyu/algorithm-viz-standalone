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

const lines: Record<string, number | number[]> = {
  init: [1, 2, 3],
  pacific: [20, 21, 22, 23],
  atlantic: [20, 21, 22, 23],
  intersect: [14, 15, 16],
  done: 18,
};

export const DEFAULT_HEIGHTS = [
  [1, 2, 2, 3, 5],
  [3, 2, 3, 4, 4],
  [2, 4, 5, 3, 1],
  [6, 7, 1, 4, 5],
  [5, 1, 1, 2, 4],
];

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function buildWaterFlowSteps(heights: number[][] = DEFAULT_HEIGHTS): WFStep[] {
  const steps: WFStep[] = [];
  const R = heights.length;
  const C = heights[0].length;

  const pac = Array.from({ length: R }, () => Array(C).fill(false));
  const atl = Array.from({ length: R }, () => Array(C).fill(false));

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
    statusText: `初始化 ${R}×${C} 高度网格。水从高向低流，采用逆向思维：从双洋边界逆流向更高或等高格子搜索。`,
    log: `初始化: ${R}×${C} 地形高度矩阵`,
    codeLine: lines.init,
  });

  // 1. 太平洋搜索 (左边界和上边界)
  const dfsPac = (r: number, c: number, prevH: number) => {
    if (r < 0 || r >= R || c < 0 || c >= C || pac[r][c] || heights[r][c] < prevH) return;
    pac[r][c] = true;
    pacCount++;

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
      statusText: `太平洋逆流登山访问 (${r}, ${c}) [高度=${heights[r][c]}]，标记为太平洋可达。当前太平洋可达: ${pacCount} 格。`,
      log: `太平洋可达: (${r}, ${c}) 高度=${heights[r][c]}`,
      codeLine: lines.pacific,
    });

    for (const [dr, dc] of DIRS) {
      dfsPac(r + dr, c + dc, heights[r][c]);
    }
  };

  for (let r = 0; r < R; r++) dfsPac(r, 0, heights[r][0]);
  for (let c = 0; c < C; c++) dfsPac(0, c, heights[0][c]);

  // 2. 大西洋搜索 (右边界和下边界)
  const dfsAtl = (r: number, c: number, prevH: number) => {
    if (r < 0 || r >= R || c < 0 || c >= C || atl[r][c] || heights[r][c] < prevH) return;
    atl[r][c] = true;
    atlCount++;

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
      statusText: `大西洋逆流登山访问 (${r}, ${c}) [高度=${heights[r][c]}]，标记为大西洋可达。当前大西洋可达: ${atlCount} 格。`,
      log: `大西洋可达: (${r}, ${c}) 高度=${heights[r][c]}`,
      codeLine: lines.atlantic,
    });

    for (const [dr, dc] of DIRS) {
      dfsAtl(r + dr, c + dc, heights[r][c]);
    }
  };

  for (let r = 0; r < R; r++) dfsAtl(r, C - 1, heights[r][C - 1]);
  for (let c = 0; c < C; c++) dfsAtl(R - 1, c, heights[R - 1][c]);

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
          statusText: `坐标 (${r}, ${c}) 既能流向太平洋又能流向大西洋！找到第 ${bothCount} 处双洋枢纽。`,
          log: `★ 双洋交集: (${r}, ${c}) [高度=${heights[r][c]}]`,
          codeLine: lines.intersect,
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
    pacCount,
    atlCount,
    bothCount,
    action: 'done',
    statusText: `🎉 太平洋大西洋水流分析完成！共发现 ${bothCount} 个格子既可流向太平洋也可流向大西洋。`,
    log: `✓ 分析完成: 双洋连通点共 ${bothCount} 处`,
    codeLine: lines.done,
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

export function parseHeightsText(input: string): number[][] {
  const rows = input
    .split(/[\r\n]+|;/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) =>
      line
        .replace(/[\[\]，]/g, ' ')
        .split(/[\s,]+/)
        .filter((t) => t.length > 0)
        .map((t) => parseInt(t, 10))
        .map((v) => (Number.isNaN(v) ? 0 : v))
    );
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
