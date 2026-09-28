/**
 * Class 056: Code05 岛屿数量并查集二维合并 (Number of Islands)
 * LeetCode 200
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { UNION_FIND_056_PROBLEMS } from './union-find-056-problem-content';
import { CODE05_ISLANDS_UF_CODES, CODE05_ISLANDS_UF_LINES } from './union-find-056-stage-codes';
import { Step056, renderIslandsUnionFindBoard } from './union-find-056-shared';

export function buildNumberOfIslandsSteps(rawGrid?: string[][]): Step056[] {
  const steps: Step056[] = [];
  const lines = CODE05_ISLANDS_UF_LINES;

  const defaultGrid = [
    ['1', '1', '1', '1', '0'],
    ['1', '1', '0', '1', '0'],
    ['1', '1', '0', '0', '0'],
    ['0', '0', '0', '0', '0'],
  ];

  const grid = rawGrid && rawGrid.length > 0 && rawGrid[0].length > 0
    ? rawGrid.map(row => [...row])
    : defaultGrid.map(row => [...row]);

  const rows = grid.length;
  const cols = grid[0].length;
  const totalCells = rows * cols;

  // 并查集初始化
  const father: number[] = Array.from({ length: totalCells }, (_, i) => i);
  let sets = 0;

  function find(i: number): number {
    if (i !== father[i]) {
      father[i] = find(father[i]);
    }
    return father[i];
  }

  function union(x: number, y: number): boolean {
    const fx = find(x);
    const fy = find(y);
    if (fx !== fy) {
      father[fx] = fy;
      sets--;
      return true;
    }
    return false;
  }

  // 0. 主函数入口
  steps.push({
    title: '算法初始化 (Entry)',
    description: `二维网格尺寸: ${rows} 行 × ${cols} 列 (共 ${totalCells} 个格子)。准备使用并查集统计独立岛屿数量。`,
    decision: '每个格子 (r, c) 展平为一维唯一标识 id = r * C + c。水域 \'0\' 忽略，陆地 \'1\' 初始化为独立连通块。',
    message: '行优先动态扫描：对每个陆地只需向左看 (r, c-1) 与 向上看 (r-1, c)，不重复不漏边。',
    log: `numIslands: rows=${rows}, cols=${cols}`,
    codeLine: lines.entry,
    grid: grid.map(r => [...r]),
    flatFather: [...father],
    curR: -1,
    curC: -1,
    islandCount: 0,
    metrics: { '网格行数 R': rows, '网格列数 C': cols, '初始岛屿数': 0 },
  });

  // 1. 陆地初始化
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        const id = r * cols + c;
        father[id] = id;
        sets++;
      }
    }
  }

  steps.push({
    title: '展平陆地节点初始化 (Init Lands)',
    description: `扫描全图陆地格：共发现 ${sets} 个陆地格子，初始每个格子自成一个孤立岛屿集合。`,
    decision: `独立岛屿初始数量 sets = ${sets}。随后通过动态加边合并相邻连通块。`,
    message: '陆地节点 father[id] = id 初始化就绪。',
    log: `init lands: total sets=${sets}`,
    codeLine: lines.initLands,
    grid: grid.map(r => [...r]),
    flatFather: [...father],
    curR: -1,
    curC: -1,
    islandCount: sets,
    metrics: { '陆地总格数': sets, '初始独立岛屿': sets },
  });

  // 2. 行优先扫描并向左向上合并
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== '1') continue;

      const curId = r * cols + c;

      steps.push({
        title: `扫描格子 (${r}, ${c}) - 陆地节点 #${curId}`,
        description: `当前访问坐标 (${r}, ${c}) 为陆地格 \'1\' (展平 ID #${curId})。准备检查其左侧与上方邻居。`,
        decision: '检查左侧 (r, c-1) 与上方 (r-1, c) 是否也是陆地；若是，则调用 union 进行连通合并。',
        message: '行优先扫描单向连接保证了每条相邻边仅被处理一次。',
        log: `visiting land cell (${r}, ${c}) id=${curId}`,
        codeLine: lines.scanGrid,
        grid: grid.map(row => [...row]),
        flatFather: [...father],
        curR: r,
        curC: c,
        islandCount: sets,
        metrics: { '当前坐标': `(${r}, ${c})`, '展平ID': `#${curId}`, '当前岛屿数': sets },
      });

      // 向左检查
      if (c > 0 && grid[r][c - 1] === '1') {
        const leftId = r * cols + (c - 1);
        const merged = union(curId, leftId);

        steps.push({
          title: `坐标 (${r}, ${c}): 向左合并 ➔ (${r}, ${c - 1})`,
          description: `左侧格子 (${r}, ${c - 1}) (ID #${leftId}) 为陆地。执行 union(#${curId}, #${leftId})。`,
          decision: merged
            ? `成功连通！两独立岛屿合二为一，岛屿总数减少 1 (当前 sets = ${sets})。`
            : `此前已通过其他路径连通，根代表元相同，保持不变。`,
          message: merged ? '陆地大块扩展。' : '同岛内部连通闭环。',
          log: `union left: (${r}, ${c}) with (${r}, ${c-1}) -> merged=${merged}, sets=${sets}`,
          codeLine: lines.unionLeft,
          grid: grid.map(row => [...row]),
          flatFather: [...father],
          curR: r,
          curC: c,
          islandCount: sets,
          metrics: { '合并方向': '向左', '是否新建连通': merged ? '是' : '否', '当前岛屿数': sets },
        });
      }

      // 向上检查
      if (r > 0 && grid[r - 1][c] === '1') {
        const upId = (r - 1) * cols + c;
        const merged = union(curId, upId);

        steps.push({
          title: `坐标 (${r}, ${c}): 向上合并 ➔ (${r - 1}, ${c})`,
          description: `上方格子 (${r - 1}, ${c}) (ID #${upId}) 为陆地。执行 union(#${curId}, #${upId})。`,
          decision: merged
            ? `成功连通！两独立岛屿合二为一，岛屿总数减少 1 (当前 sets = ${sets})。`
            : `此前已通过其他路径连通，根代表元相同，保持不变。`,
          message: merged ? '上下跨行陆地贯通。' : '同岛内部连通闭环。',
          log: `union up: (${r}, ${c}) with (${r-1}, ${c}) -> merged=${merged}, sets=${sets}`,
          codeLine: lines.unionUp,
          grid: grid.map(row => [...row]),
          flatFather: [...father],
          curR: r,
          curC: c,
          islandCount: sets,
          metrics: { '合并方向': '向上', '是否新建连通': merged ? '是' : '否', '当前岛屿数': sets },
        });
      }
    }
  }

  // 3. 返回最终答案
  steps.push({
    title: '算法完成: 独立岛屿数量统计完毕',
    description: `全图动态加边合并完毕，网格最终收敛为 ${sets} 个互不连通的独立岛屿。`,
    decision: `返回岛屿总数 = ${sets}。`,
    message: '二维网格转一维加动态合并，避免了递归调用栈开销，兼具极佳的工程扩展性。',
    log: `done numIslands: final sets=${sets}`,
    codeLine: lines.returnAns,
    grid: grid.map(r => [...r]),
    flatFather: [...father],
    curR: -1,
    curC: -1,
    islandCount: sets,
    metrics: { '最终岛屿总数': sets, '网格总格数': totalCells },
  });

  return steps;
}

export const numberOfIslands056Renderer = registerDeclarativeAlgorithm<Step056>({
  id: 'number-of-islands-056',
  aliases: ['class056-code05', 'number-of-islands-200-uf'],
  name: '岛屿数量并查集二维合并 (Class 056)',
  category: 'union-find',
  difficulty: 'medium',
  badge: { mode: '二维扁平化', complexity: 'O(R·C)' },
  description: '左程云算法通关课【必备篇】Class 056：二维网格一维坐标展平与向左向上动态加边合并 (LeetCode 200 并查集解法)',
  learningGoal: '深刻理解二维网格图论并查集建模：行优先扫描中只需向左向上连边即可无遗漏收敛全图连通分量。',
  icon: '🏝️',

  inputs: [
    {
      id: 'gridStr',
      label: '网格行数据 (每行以换行或斜杠分隔, 1为陆地 0为水)',
      type: 'text',
      defaultValue: '11110 / 11010 / 11000 / 00000',
      placeholder: '例如: 11110 / 11010 / 11000 / 00000',
    },
  ],

  presets: [
    {
      label: '经典案例 1: 单一巨大岛屿 (结果: 1)',
      values: { gridStr: '11110 / 11010 / 11000 / 00000' },
    },
    {
      label: '经典案例 2: 三座孤立岛屿 (结果: 3)',
      values: { gridStr: '11000 / 11000 / 00100 / 00011' },
    },
    {
      label: '全孤立点岛屿: 棋盘网状 (结果: 4)',
      values: { gridStr: '1010 / 0101 / 1010 / 0101' },
    },
    {
      label: '回字形大岛环绕 (结果: 1)',
      values: { gridStr: '1111 / 1001 / 1001 / 1111' },
    },
  ],

  problemContent: UNION_FIND_056_PROBLEMS.numberOfIslands056,
  codeLanguages: CODE05_ISLANDS_UF_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let grid = [
      ['1', '1', '1', '1', '0'],
      ['1', '1', '0', '1', '0'],
      ['1', '1', '0', '0', '0'],
      ['0', '0', '0', '0', '0'],
    ];

    if (params && params.gridStr) {
      const raw = String(params.gridStr);
      const rows = raw.split(/[\/\n\r]+/).map(s => s.trim()).filter(Boolean);
      if (rows.length > 0) {
        const parsedGrid = rows.map(r => r.split('').filter(ch => ch === '0' || ch === '1'));
        if (parsedGrid.length > 0 && parsedGrid[0].length > 0) {
          grid = parsedGrid;
        }
      }
    }

    return buildNumberOfIslandsSteps(grid);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderIslandsUnionFindBoard(step);
  },
});
