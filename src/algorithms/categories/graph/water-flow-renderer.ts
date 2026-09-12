/**
 * 太平洋大西洋水流 (LC 417) — 声明式 4-Card 标准架构
 * 逆向多源 DFS：双洋边界逆流登山搜索，求双洋可达性交集
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  WATER_FLOW_PROBLEM_HTML,
  WATER_FLOW_ANALYSIS_HTML,
  WATER_FLOW_CODE_LANGUAGES,
} from './water-flow-problem-content';

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

const DEFAULT_HEIGHTS = [
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
    heights: heights.map((r) => [...r]),
    rows: R,
    cols: C,
    pacReachable: pac.map((r) => [...r]),
    atlReachable: atl.map((r) => [...r]),
    currentCell: null,
    stage: '准备开始',
    pacCount: 0,
    atlCount: 0,
    bothCount: 0,
    action: 'init',
    statusText: `初始化 ${R}×${C} 高度网格。水从高向低流，采用逆向思维：从双洋边界逆流向更高或等高格子搜索。`,
    log: `初始化: ${R}×${C} 地形高度矩阵`,
    codeLine: [1, 2, 3],
  });

  // 1. 太平洋搜索 (左边界和上边界)
  const dfsPac = (r: number, c: number, prevH: number) => {
    if (r < 0 || r >= R || c < 0 || c >= C || pac[r][c] || heights[r][c] < prevH) return;
    pac[r][c] = true;
    pacCount++;

    steps.push({
      heights: heights.map((row) => [...row]),
      rows: R,
      cols: C,
      pacReachable: pac.map((row) => [...row]),
      atlReachable: atl.map((row) => [...row]),
      currentCell: [r, c],
      stage: '太平洋逆流搜索',
      pacCount,
      atlCount,
      bothCount: 0,
      action: 'pacific',
      statusText: `太平洋逆流登山访问 (${r}, ${c}) [高度=${heights[r][c]}]，标记为太平洋可达。当前太平洋可达: ${pacCount} 格。`,
      log: `太平洋可达: (${r}, ${c}) 高度=${heights[r][c]}`,
      codeLine: [20, 21, 22, 23],
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
      heights: heights.map((row) => [...row]),
      rows: R,
      cols: C,
      pacReachable: pac.map((row) => [...row]),
      atlReachable: atl.map((row) => [...row]),
      currentCell: [r, c],
      stage: '大西洋逆流搜索',
      pacCount,
      atlCount,
      bothCount: 0,
      action: 'atlantic',
      statusText: `大西洋逆流登山访问 (${r}, ${c}) [高度=${heights[r][c]}]，标记为大西洋可达。当前大西洋可达: ${atlCount} 格。`,
      log: `大西洋可达: (${r}, ${c}) 高度=${heights[r][c]}`,
      codeLine: [20, 21, 22, 23],
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
          heights: heights.map((row) => [...row]),
          rows: R,
          cols: C,
          pacReachable: pac.map((row) => [...row]),
          atlReachable: atl.map((row) => [...row]),
          currentCell: [r, c],
          stage: '双洋交集枢纽',
          pacCount,
          atlCount,
          bothCount,
          action: 'intersect',
          statusText: `坐标 (${r}, ${c}) 既能流向太平洋又能流向大西洋！找到第 ${bothCount} 处双洋枢纽。`,
          log: `★ 双洋交集: (${r}, ${c}) [高度=${heights[r][c]}]`,
          codeLine: [14, 15, 16],
        });
      }
    }
  }

  steps.push({
    heights: heights.map((row) => [...row]),
    rows: R,
    cols: C,
    pacReachable: pac.map((row) => [...row]),
    atlReachable: atl.map((row) => [...row]),
    currentCell: null,
    stage: '分析完成',
    pacCount,
    atlCount,
    bothCount,
    action: 'done',
    statusText: `🎉 太平洋大西洋水流分析完成！共发现 ${bothCount} 个格子既可流向太平洋也可流向大西洋。`,
    log: `✓ 分析完成: 双洋连通点共 ${bothCount} 处`,
    codeLine: 18,
  });

  return steps;
}

const PRESET_CASES: Record<string, { label: string; heights: number[][] }> = {
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

/** 将高度矩阵序列化为文本输入（预设值与 inputs.heights 解析共用） */
function heightsToText(heights: number[][]): string {
  return heights.map((row) => row.join(' ')).join('\n');
}

function parseHeightsText(input: string): number[][] {
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

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: WFStep[]): WFStep[] {
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

export function renderWaterFlowCanvas(container: HTMLElement, step: WFStep): void {
  const { heights, rows, cols, pacReachable, atlReachable, currentCell } = step;

  let html = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const h = heights[r][c];
      const isPac = pacReachable[r][c];
      const isAtl = atlReachable[r][c];
      const isBoth = isPac && isAtl;
      const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;

      let bg = '#ffffff';
      let border = '1px solid #cbd5e1';
      let color = '#334155';
      let fontWeight = '700';
      let boxShadow = 'none';

      if (isBoth) {
        bg = '#fdf4ff';
        border = '2px solid #c084fc';
        color = '#7e22ce';
        fontWeight = '900';
        boxShadow = '0 2px 6px rgba(192, 132, 252, 0.25)';
      } else if (isPac) {
        bg = '#eff6ff';
        border = '1.5px solid #93c5fd';
        color = '#1d4ed8';
      } else if (isAtl) {
        bg = '#fef2f2';
        border = '1.5px solid #fca5a5';
        color = '#b91c1c';
      }

      let transform = 'none';
      if (isCurrent) {
        boxShadow = '0 0 0 3px #facc15';
        transform = 'scale(1.06)';
      }

      const oceanTag = isBoth ? 'P&A' : isPac ? 'P' : isAtl ? 'A' : '';
      html += `<div style="aspect-ratio: 1; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: ${fontWeight}; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); position: relative; box-sizing: border-box; background: ${bg}; border: ${border}; color: ${color}; box-shadow: ${boxShadow}; transform: ${transform}; z-index: ${isCurrent ? 10 : 1};"><span style="font-size:12px; font-weight:800;">${h}</span>${oceanTag ? `<span style="font-size:9px; opacity:0.85;">${oceanTag}</span>` : ''}</div>`;
    }
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 6px; justify-content: center; align-content: center; height: 100%; width: 100%; max-width: 620px; margin: 0 auto; padding: 8px; box-sizing: border-box;">
      ${html}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'water-flow',
  name: '太平洋大西洋水流 (LC 417)',
  category: 'graph',
  description: '逆向思维：分别从太平洋与大西洋边界逆流登山搜索，求双洋可达性交集',
  icon: '🌊',
  difficulty: 2,
  levelOrder: 17,
  learningGoal: '掌握逆向多源 DFS/BFS 搜索与双矩阵交集求解技巧',
  inputs: [
    {
      id: 'heights',
      label: '高度矩阵 (每行空格分隔)',
      type: 'text',
      defaultValue: heightsToText(DEFAULT_HEIGHTS),
      placeholder: '每行如 1 2 2 3 5',
    },
  ],
  presets: [
    { label: PRESET_CASES.classic.label, values: { heights: heightsToText(PRESET_CASES.classic.heights) } },
    { label: PRESET_CASES.valley.label, values: { heights: heightsToText(PRESET_CASES.valley.heights) } },
    { label: PRESET_CASES.slope.label, values: { heights: heightsToText(PRESET_CASES.slope.heights) } },
  ],
  metrics: [
    { id: 'metric-cur-cell', label: '当前访问格', color: '#eab308' },
    { id: 'metric-stage', label: '当前阶段', color: '#2563eb' },
    { id: 'metric-pac-count', label: '太平洋可达', color: '#3b82f6' },
    { id: 'metric-atl-count', label: '大西洋可达', color: '#dc2626' },
    { id: 'metric-both-count', label: '双洋交集', color: '#c084fc' },
    { id: 'action', label: '逆流判定', color: '#6366f1' },
  ],
  legend: [
    { label: '太平洋可达 (P)', color: '#93c5fd' },
    { label: '大西洋可达 (A)', color: '#fca5a5' },
    { label: '双洋交集 (P & A)', color: '#c084fc' },
  ],
  codeLanguages: WATER_FLOW_CODE_LANGUAGES,
  problemHtml: WATER_FLOW_PROBLEM_HTML,
  analysisHtml: WATER_FLOW_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(buildWaterFlowSteps(parseHeightsText(String(inputs?.heights ?? '')))),
  renderCanvas: (container, step) => renderWaterFlowCanvas(container, step as WFStep),
});
