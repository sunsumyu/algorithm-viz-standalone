/**
 * Class 058: Code01 图像渲染 (Flood Fill)
 * 经典洪水填充入门模版 / LeetCode 733
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { SEARCH_058_PROBLEMS } from './search-058-problem-content';
import { FLOOD_FILL_058_CODES, FLOOD_FILL_058_LINES } from './search-058-stage-codes';
import { Search058Step, renderFloodFillBoard } from './search-058-shared';

export interface FloodFillStep extends Search058Step {
  image: number[][];
  curR: number;
  curC: number;
  origColor: number;
  newColor: number;
  sr: number;
  sc: number;
}

export function buildFloodFillSteps(
  rawImage?: number[][],
  rawSr?: number,
  rawSc?: number,
  rawColor?: number
): FloodFillStep[] {
  const steps: FloodFillStep[] = [];
  const lines = FLOOD_FILL_058_LINES;

  const defaultImg = [
    [1, 1, 1],
    [1, 1, 0],
    [1, 0, 1],
  ];

  const img = rawImage && rawImage.length > 0 && rawImage[0].length > 0
    ? rawImage.map(r => [...r])
    : defaultImg.map(r => [...r]);

  const rows = img.length;
  const cols = img[0].length;
  const sr = rawSr !== undefined && rawSr >= 0 && rawSr < rows ? rawSr : 1;
  const sc = rawSc !== undefined && rawSc >= 0 && rawSc < cols ? rawSc : 1;
  const newColor = rawColor !== undefined && rawColor >= 0 ? rawColor : 2;
  const origColor = img[sr][sc];

  // 0. 主入口
  steps.push({
    title: '算法初始化 (Entry)',
    description: `网格尺寸 ${rows}x${cols}，起始点 (${sr}, ${sc}) 当前旧颜色为 ${origColor}，准备渲染为新颜色 ${newColor}。`,
    decision: '检查起始像素颜色：若旧颜色与新颜色相同，必须提前退出，杜绝死循环！',
    message: '洪水填充就像油漆桶工具，从起始点连通扩散至所有相同颜色的相邻像素。',
    log: `enter floodFill: sr=${sr}, sc=${sc}, origColor=${origColor}, newColor=${newColor}`,
    codeLine: lines.entry,
    image: img.map(r => [...r]),
    curR: -1,
    curC: -1,
    origColor,
    newColor,
    sr,
    sc,
    metrics: { '起始点': `(${sr}, ${sc})`, '旧颜色': origColor, '新颜色': newColor },
  });

  // 1. 同色特判检查
  if (origColor === newColor) {
    steps.push({
      title: '同色防御特判 (Same Color Guard)',
      description: `检测到旧颜色 ${origColor} 与目标新颜色 ${newColor} 完全一致！`,
      decision: '【核心死门禁】若继续递归会导致无限重复访问并引发调用栈溢出崩溃！直接返回原图。',
      message: '死循环防御逻辑触发成功，零开销安全返回。',
      log: 'origColor === newColor -> guard exit triggered',
      codeLine: lines.checkSame,
      image: img.map(r => [...r]),
      curR: sr,
      curC: sc,
      origColor,
      newColor,
      sr,
      sc,
      statusBadge: { text: '同色安全退出', type: 'warning' },
      metrics: { '判定结果': '颜色相同直接返回', '递归次数': 0 },
    });
    return steps;
  }

  // 2. 启动 DFS
  steps.push({
    title: '启动 DFS 洪水填充',
    description: `旧颜色 ${origColor} 与新颜色 ${newColor} 不同，正式从起始坐标 (${sr}, ${sc}) 启动四方向递归渗透。`,
    decision: `每次访问格子若是旧色 ${origColor}，立即就地染为新色 ${newColor} 并递归四邻。`,
    message: '四方向移动：上 (-1, 0)、下 (+1, 0)、左 (0, -1)、右 (0, +1)。',
    log: `start dfs at (${sr}, ${sc})`,
    codeLine: lines.startDfs,
    image: img.map(r => [...r]),
    curR: sr,
    curC: sc,
    origColor,
    newColor,
    sr,
    sc,
    metrics: { '搜索深度': 1, '当前坐标': `(${sr}, ${sc})` },
  });

  // DFS 递归
  function dfs(r: number, c: number) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || img[r][c] !== origColor) {
      return;
    }

    // 染色
    img[r][c] = newColor;

    steps.push({
      title: `染色像素 (${r}, ${c}) ➔ ${newColor}`,
      description: `格子 (${r}, ${c}) 为目标旧色 ${origColor}，将其改染为新颜色 ${newColor}。`,
      decision: `就地修改 image[${r}][${c}] = ${newColor}，防止重复访问。`,
      message: `准备以此格为中心，向其四邻方向 (上、下、左、右) 延伸探测。`,
      log: `dye cell (${r}, ${c}) to ${newColor}`,
      codeLine: lines.dyeCell,
      image: img.map(row => [...row]),
      curR: r,
      curC: c,
      origColor,
      newColor,
      sr,
      sc,
      metrics: { '当前染色格': `(${r}, ${c})`, '当前颜色': newColor },
    });

    // 向上
    if (r > 0 && img[r - 1][c] === origColor) {
      steps.push({
        title: `坐标 (${r}, ${c}) 向上探测 ➔ (${r - 1}, ${c})`,
        description: `上方邻居 (${r - 1}, ${c}) 为旧色 ${origColor}，递归深入。`,
        decision: '沿着上方连通路径继续扩散。',
        message: 'DFS 递归展开。',
        log: `dfs up to (${r - 1}, ${c})`,
        codeLine: lines.spread,
        image: img.map(row => [...row]),
        curR: r - 1,
        curC: c,
        origColor,
        newColor,
        sr,
        sc,
      });
      dfs(r - 1, c);
    }

    // 向下
    if (r + 1 < rows && img[r + 1][c] === origColor) {
      steps.push({
        title: `坐标 (${r}, ${c}) 向下探测 ➔ (${r + 1}, ${c})`,
        description: `下方邻居 (${r + 1}, ${c}) 为旧色 ${origColor}，递归深入。`,
        decision: '沿着下方连通路径继续扩散。',
        message: 'DFS 递归展开。',
        log: `dfs down to (${r + 1}, ${c})`,
        codeLine: lines.spread,
        image: img.map(row => [...row]),
        curR: r + 1,
        curC: c,
        origColor,
        newColor,
        sr,
        sc,
      });
      dfs(r + 1, c);
    }

    // 向左
    if (c > 0 && img[r][c - 1] === origColor) {
      steps.push({
        title: `坐标 (${r}, ${c}) 向左探测 ➔ (${r}, ${c - 1})`,
        description: `左侧邻居 (${r}, ${c - 1}) 为旧色 ${origColor}，递归深入。`,
        decision: '沿着左侧连通路径继续扩散。',
        message: 'DFS 递归展开。',
        log: `dfs left to (${r}, ${c - 1})`,
        codeLine: lines.spread,
        image: img.map(row => [...row]),
        curR: r,
        curC: c - 1,
        origColor,
        newColor,
        sr,
        sc,
      });
      dfs(r, c - 1);
    }

    // 向右
    if (c + 1 < cols && img[r][c + 1] === origColor) {
      steps.push({
        title: `坐标 (${r}, ${c}) 向右探测 ➔ (${r}, ${c + 1})`,
        description: `右侧邻居 (${r}, ${c + 1}) 为旧色 ${origColor}，递归深入。`,
        decision: '沿着右侧连通路径继续扩散。',
        message: 'DFS 递归展开。',
        log: `dfs right to (${r}, ${c + 1})`,
        codeLine: lines.spread,
        image: img.map(row => [...row]),
        curR: r,
        curC: c + 1,
        origColor,
        newColor,
        sr,
        sc,
      });
      dfs(r, c + 1);
    }
  }

  dfs(sr, sc);

  // 3. 完成返回
  steps.push({
    title: '算法完成: 洪水填充浸染结束',
    description: `与起始点 (${sr}, ${sc}) 连通的所有旧色 ${origColor} 区域均已成功改染为 ${newColor}。`,
    decision: '四方向连通域全部探索完毕，返回最终渲染完成的图像矩阵。',
    message: 'Flood Fill 算法以严格 O(M×N) 复杂度高效收尾。',
    log: 'floodFill complete -> return image',
    codeLine: lines.returnAns,
    image: img.map(row => [...row]),
    curR: -1,
    curC: -1,
    origColor,
    newColor,
    sr,
    sc,
    statusBadge: { text: '渲染完成', type: 'success' },
    metrics: { '状态': '已完成', '网格总像素数': rows * cols },
  });

  return steps;
}

export const floodFill058Renderer = registerDeclarativeAlgorithm<FloodFillStep>({
  id: 'flood-fill-058',
  aliases: ['class058-code01', 'flood-fill-733', 'image-flood-fill'],
  name: '图像渲染 (Flood Fill / Class 058)',
  category: 'search',
  difficulty: 'easy',
  badge: { mode: '洪水填充', complexity: 'O(M·N)' },
  description: '左程云算法通关课【必备篇】Class 058：洪水填充核心模版、四方向深度优先搜索与同色死循环防御 (LeetCode 733)',
  learningGoal: '透彻掌握 Flood Fill 连通性浸染核心哲学，深刻领悟同色防御特判在规避无限死循环中的关键价值。',
  icon: '🎨',

  inputs: [
    {
      id: 'gridStr',
      label: '图像矩阵 (各行用斜杠或换行分隔, 逗号分隔像素)',
      type: 'text',
      defaultValue: '1, 1, 1 / 1, 1, 0 / 1, 0, 1',
      placeholder: '例如: 1, 1, 1 / 1, 1, 0 / 1, 0, 1',
    },
    {
      id: 'sr',
      label: '起始行坐标 sr',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 10,
    },
    {
      id: 'sc',
      label: '起始列坐标 sc',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 10,
    },
    {
      id: 'color',
      label: '渲染新颜色 (0~4)',
      type: 'number',
      defaultValue: 2,
      min: 0,
      max: 4,
    },
  ],

  presets: [
    {
      label: '经典案例: 3x3 网格从 (1,1) 将 1 染成 2',
      values: { gridStr: '1, 1, 1 / 1, 1, 0 / 1, 0, 1', sr: 1, sc: 1, color: 2 },
    },
    {
      label: '全连通浸染: 3x3 全 0 网格染成 3',
      values: { gridStr: '0, 0, 0 / 0, 0, 0 / 0, 0, 0', sr: 0, sc: 0, color: 3 },
    },
    {
      label: '同色死循环防御触发案例: 原色 1 染成 1',
      values: { gridStr: '1, 1, 1 / 1, 1, 0 / 1, 0, 1', sr: 1, sc: 1, color: 1 },
    },
  ],

  problemContent: SEARCH_058_PROBLEMS.floodFill058,
  codeLanguages: FLOOD_FILL_058_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let img = [
      [1, 1, 1],
      [1, 1, 0],
      [1, 0, 1],
    ];
    let sr = 1;
    let sc = 1;
    let color = 2;

    if (params && params.gridStr) {
      const raw = String(params.gridStr);
      const rows = raw.split(/[\/\n\r]+/).map(s => s.trim()).filter(Boolean);
      if (rows.length > 0) {
        const parsed = rows.map(r =>
          r.split(/[,，\s]+/).map(n => parseInt(n.trim(), 10)).filter(num => !isNaN(num))
        );
        if (parsed.length > 0 && parsed[0].length > 0) {
          img = parsed;
        }
      }
    }

    if (params && params.sr !== undefined) {
      const parsedSr = parseInt(params.sr, 10);
      if (!isNaN(parsedSr)) sr = parsedSr;
    }
    if (params && params.sc !== undefined) {
      const parsedSc = parseInt(params.sc, 10);
      if (!isNaN(parsedSc)) sc = parsedSc;
    }
    if (params && params.color !== undefined) {
      const parsedColor = parseInt(params.color, 10);
      if (!isNaN(parsedColor)) color = parsedColor;
    }

    return buildFloodFillSteps(img, sr, sc, color);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderFloodFillBoard(
      step.image,
      step.curR,
      step.curC,
      step.origColor,
      step.newColor,
      step.sr,
      step.sc
    );
  },
});
