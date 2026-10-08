import { FLOOD_FILL_058_LINES } from './search-058-stage-codes';
import { Search058Step } from './search-058-shared';

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
    ? rawImage.map((r) => [...r])
    : defaultImg.map((r) => [...r]);

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
    image: img.map((r) => [...r]),
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
      image: img.map((r) => [...r]),
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
    image: img.map((r) => [...r]),
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
      image: img.map((row) => [...row]),
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
        image: img.map((row) => [...row]),
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
        image: img.map((row) => [...row]),
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
        image: img.map((row) => [...row]),
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
        image: img.map((row) => [...row]),
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
    image: img.map((row) => [...row]),
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

export function parseAndBuildFloodFillSteps(params?: Record<string, any>): FloodFillStep[] {
  let img = [
    [1, 1, 1],
    [1, 1, 0],
    [1, 0, 1],
  ];
  let sr = 1;
  let sc = 1;
  let color = 2;

  if (params?.gridStr) {
    const raw = String(params.gridStr);
    const rows = raw.split(/[\/\n\r]+/).map((s) => s.trim()).filter(Boolean);
    if (rows.length > 0) {
      const parsed = rows.map((r) =>
        r.split(/[,，\s]+/).map((n) => parseInt(n.trim(), 10)).filter((num) => !isNaN(num))
      );
      if (parsed.length > 0 && parsed[0].length > 0) img = parsed;
    }
  }

  if (params?.sr !== undefined) {
    const parsedSr = parseInt(params.sr, 10);
    if (!isNaN(parsedSr)) sr = parsedSr;
  }
  if (params?.sc !== undefined) {
    const parsedSc = parseInt(params.sc, 10);
    if (!isNaN(parsedSc)) sc = parsedSc;
  }
  if (params?.color !== undefined) {
    const parsedColor = parseInt(params.color, 10);
    if (!isNaN(parsedColor)) color = parsedColor;
  }

  return buildFloodFillSteps(img, sr, sc, color);
}
