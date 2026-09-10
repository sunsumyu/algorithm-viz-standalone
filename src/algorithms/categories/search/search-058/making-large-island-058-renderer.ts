/**
 * Class 058: 洪水填充高频扩展与最大人工岛 (Making A Large Island)
 * 两次遍历染色标号与 0 点四邻桥接合并 / LeetCode 827
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { SEARCH_058_PROBLEMS } from './search-058-problem-content';
import { MAKING_LARGE_ISLAND_058_CODES, MAKING_LARGE_ISLAND_058_LINES } from './search-058-stage-codes';
import { Search058Step, renderLargeIslandBoard } from './search-058-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface LargeIsland058Step extends Search058Step {
  grid: number[][];
  flipR: number;
  flipC: number;
  areaMap: Record<number, number>;
  maxArea: number;
  stage: string;
}

export function buildLargeIsland058Steps(): LargeIsland058Step[] {
  const steps: LargeIsland058Step[] = [];
  const lines = MAKING_LARGE_ISLAND_058_LINES;

  // 3x3 初始网格：
  // [1, 0, 1]
  // [0, 0, 1]
  // [0, 1, 0]
  // 岛屿 A: (0, 0) 大小 1
  // 岛屿 B: (0, 2), (1, 2) 大小 2
  // 岛屿 C: (2, 1) 大小 1
  // 桥接点 (0, 1): 连接 A(1) 和 B(2)，面积 = 1 + 1 + 2 = 4
  // 桥接点 (1, 1): 连接 A(1), B(2), C(1)，面积 = 1 + 1 + 2 + 1 = 5！(最大人工岛)

  const g0 = [
    [1, 0, 1],
    [0, 0, 1],
    [0, 1, 0],
  ];

  // Step 0: 入口
  steps.push({
    grid: g0.map(r => [...r]),
    flipR: -1,
    flipC: -1,
    areaMap: {},
    maxArea: 0,
    stage: '阶段 0：网格初始化，准备第一遍 DFS 染色标号',
    decision: '主函数入口：开始为 3x3 网格寻找通过翻转至多一个 0 能构成的最大连通岛屿。',
    message: '如果盲目对每个 0 运行 DFS 耗时高达 O(N^4)；我们采用两次遍历：染色标号 + O(1) 桥接判定。',
    log: 'enter largestIsland: 3x3 grid',
    codeLine: lines.entry,
    metrics: { '网格尺寸': '3x3', '状态': '准备染色' },
  });

  // Step 1: DFS 染色完成
  // 岛屿 2: (0, 0) 面积 1
  // 岛屿 3: (0, 2), (1, 2) 面积 2
  // 岛屿 4: (2, 1) 面积 1
  const gColored = [
    [2, 0, 3],
    [0, 0, 3],
    [0, 4, 0],
  ];
  const areaMap: Record<number, number> = { 2: 1, 3: 2, 4: 1 };
  steps.push({
    grid: gColored.map(r => [...r]),
    flipR: -1,
    flipC: -1,
    areaMap,
    maxArea: 2,
    stage: '阶段 1：第一遍 DFS 染色完成，记录各岛屿 ID 与面积',
    decision: '染色完成：发现 3 个独立岛屿，ID 2 面积=1，ID 3 面积=2，ID 4 面积=1。',
    message: '各格子已被打上唯一岛屿标号，为后续 O(1) 桥接提供查表支持。',
    log: 'DFS coloring complete: areaMap={2:1, 3:2, 4:1}',
    codeLine: lines.saveArea,
    statusBadge: { text: '染色完成', type: 'info' },
    metrics: { '发现岛屿数': 3, '最大天然岛屿': 2 },
  });

  // Step 2: 尝试桥接点 (0, 1)
  // 邻居：左边 ID 2 (面积 1)，右边 ID 3 (面积 2)
  // 合并面积 = 1 + 1 + 2 = 4
  steps.push({
    grid: gColored.map(r => [...r]),
    flipR: 0,
    flipC: 1,
    areaMap,
    maxArea: 4,
    stage: '阶段 2：枚举 0 格子 (0, 1) 桥接邻近岛屿',
    decision: '尝试翻转 (0, 1)：相邻左侧岛屿 2(面积 1) 与右侧岛屿 3(面积 2)！',
    message: '合并新面积 = 1 + 1 + 2 = 4！更新 maxArea = 4。',
    log: 'bridge (0, 1): connects island 2 and 3 -> area 4',
    codeLine: lines.combineAreas,
    statusBadge: { text: '翻转 (0, 1) -> 面积 4', type: 'info' },
    metrics: { '当前桥接点': '(0, 1)', '合并面积': 4 },
  });

  // Step 3: 尝试核心桥接点 (1, 1) -> 达成极致合并！
  // 邻居：上 ID 2 (面积 1)，右 ID 3 (面积 2)，下 ID 4 (面积 1)
  // 合并面积 = 1 + 1 + 2 + 1 = 5！
  steps.push({
    grid: gColored.map(r => [...r]),
    flipR: 1,
    flipC: 1,
    areaMap,
    maxArea: 5,
    stage: '阶段 2：枚举 0 格子 (1, 1) 桥接全部 3 座岛屿！',
    decision: '尝试翻转 (1, 1)：上下右同时连接岛屿 2(面积 1)、岛屿 3(面积 2)、岛屿 4(面积 1)！',
    message: '哈希集合防重合并：1 (翻转自身) + 1 + 2 + 1 = 5！刷新全局最高纪录！',
    log: 'bridge (1, 1): connects islands 2, 3, 4 -> area 5 (OPTIMAL!)',
    codeLine: lines.combineAreas,
    statusBadge: { text: '最优翻转 (1, 1) -> 面积 5', type: 'success' },
    metrics: { '当前桥接点': '(1, 1)', '合并面积': 5 },
  });

  // Step 4: 结算返回
  steps.push({
    grid: gColored.map(r => [...r]),
    flipR: 1,
    flipC: 1,
    areaMap,
    maxArea: 5,
    stage: '阶段 3：全图枚举结束，输出最大人工岛面积',
    decision: '遍历结束：翻转 (1, 1) 能够获得的最大人工岛面积为 5。',
    message: '两次遍历将算法整体时间严格控制在 O(N^2) 线性阶内。',
    log: 'largestIsland complete -> return 5',
    codeLine: lines.returnAns,
    statusBadge: { text: '计算完成: 5', type: 'success' },
    metrics: { '最大人工岛面积': 5, '时间复杂度': 'O(N^2)' },
  });

  return steps;
}

export const makingLargeIsland058Visualizer = registerDeclarativeAlgorithm<LargeIsland058Step>({
  id: 'making-large-island-058',
  name: '洪水填充与最大人工岛 (Class 058)',
  category: 'search',
  difficulty: 'hard',
  problemContent: SEARCH_058_PROBLEMS.makingLargeIsland058,
  sourceCodes: MAKING_LARGE_ISLAND_058_CODES,
  generateSteps: buildLargeIsland058Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderLargeIslandBoard(
          step.grid,
          step.flipR,
          step.flipC,
          step.areaMap,
          step.maxArea,
          step.stage
        )}
        ${renderFormulaCard(
          '网格连通块染色与桥接合并定理',
          '\\text{CombinedArea}(r, c) = 1 + \\sum_{id \\in \\text{DistinctNeighbors}(r, c)} \\text{area}[id]',
          '第一遍 DFS 为每个岛屿赋予独立 ID 并在哈希表中记录面积；第二遍遍历所有 0，利用集合对周围四邻岛屿 ID 去重并直接查表累加，将暴力 $O(N^4)$ 优化至严格的 $O(N^2)$。'
        )}
      </div>
    `;
  },
});
