import { describe, it, expect } from 'vitest';
import { StaticDeductionTreeAdapter } from './static-deduction-tree-adapter';

describe('StaticDeductionTreeAdapter (全景静态推演展板适配器)', () => {
  it('应当正确判断支持的模型', () => {
    expect(StaticDeductionTreeAdapter.isSupported('unique-paths')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('longest-common-subsequence')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('edit-distance')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('distinct-subsequences')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('binary-search')).toBe(false);
  });

  it('应当能正确为 unique-paths 渲染静态推演树 HTML', () => {
    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'unique-paths',
      m: 3,
      n: 4,
    });
    expect(container.innerHTML).toContain('LeetCode 62. 不同路径 · 全景推演树');
    expect(container.innerHTML).toContain('第一阶段：填 Base Case');
    expect(container.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(container.innerHTML).toContain('第三阶段：返回最终结果');
    expect(container.innerHTML).toContain('10 ✅');
  });

  it('应当能正确为 longest-common-subsequence 渲染静态推演树 HTML', () => {
    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'longest-common-subsequence',
      text1: 'abcde',
      text2: 'ace',
    });
    expect(container.innerHTML).toContain('LeetCode 1143. 最长公共子序列 · 全景推演树');
    expect(container.innerHTML).toContain('✔ 字符相同');
    expect(container.innerHTML).toContain('3 ✅');
  });

  it('应当能正确为 edit-distance 渲染静态推演树 HTML', () => {
    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'edit-distance',
      word1: 'horse',
      word2: 'ros',
    });
    expect(container.innerHTML).toContain('LeetCode 72. 编辑距离 · 全景推演树');
    expect(container.innerHTML).toContain('3 ✅');
  });

  it('应当能正确为 distinct-subsequences 渲染静态推演树 HTML', () => {
    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'distinct-subsequences',
      s: 'babgbag',
      t: 'bag',
    });
    expect(container.innerHTML).toContain('LeetCode 115. 不同的子序列 · 全景推演树');
    expect(container.innerHTML).toContain('5 ✅');
  });

  it('应当能通用支持任意动规模型 (如 climb-stairs 爬楼梯)', () => {
    expect(StaticDeductionTreeAdapter.isSupported('climb-stairs')).toBe(true);
    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'climb-stairs',
      n: 5,
    });
    expect(container.innerHTML).toContain('爬楼梯 · 全景推演树');
    expect(container.innerHTML).toContain('第一阶段：填 Base Case');
    expect(container.innerHTML).toContain('第二阶段：核心状态转移推演树');
    expect(container.innerHTML).toContain('第三阶段：返回最终结果');
    expect(container.innerHTML).toContain('✅');
  });

  it('应当能通用支持二维网格与背包等动规模型 (如 min-path-sum 与 knapsack-01)', () => {
    expect(StaticDeductionTreeAdapter.isSupported('min-path-sum')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('knapsack-01')).toBe(true);

    const containerMinPath = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerMinPath, {
      modelId: 'min-path-sum',
      m: 3,
      n: 3,
    });
    expect(containerMinPath.innerHTML).toContain('全景推演树');
    expect(containerMinPath.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerMinPath.innerHTML).toContain('第三阶段：返回最终结果');

    const containerKnapsack = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerKnapsack, {
      modelId: 'knapsack-01',
      m: 3,
      n: 4,
    });
    expect(containerKnapsack.innerHTML).toContain('全景推演树');
    expect(containerKnapsack.innerHTML).toContain('第三阶段：返回最终结果');
  });

  it('应当能正确为 a-star (图论启发式寻路) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('a-star')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('a-star-journey')).toBe(true);

    const containerAStar = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerAStar, {
      modelId: 'a-star',
      m: 4,
      n: 4,
    });
    expect(containerAStar.innerHTML).toContain('A* 启发式搜索 (A* Search Algorithm) · 全景推演树');
    expect(containerAStar.innerHTML).toContain('f(n) = g(n) + h(n)');
    expect(containerAStar.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerAStar.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerAStar.innerHTML).toContain('最优路径步数 = 6 步 ✅');
  });

  it('应当能正确为 trapping-water-ii (二维接雨水 II) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('trapping-water-ii')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('trapping-rain-water-ii')).toBe(true);

    const containerTrap = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerTrap, {
      modelId: 'trapping-water-ii',
      inputs: { 'input-preset': 'classic_3x6' },
    });
    expect(containerTrap.innerHTML).toContain('LeetCode 407. 二维接雨水 II · 全景推演树');
    expect(containerTrap.innerHTML).toContain('木桶短板效应');
    expect(containerTrap.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerTrap.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerTrap.innerHTML).toContain('全地形最终总蓄水量 = 4 滴水 ✅');
  });

  it('应当能正确为 water-flow (太平洋大西洋水流) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('water-flow')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('pacific-atlantic-417')).toBe(true);

    const containerWF = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerWF, {
      modelId: 'water-flow',
      m: 5,
      n: 5,
    });
    expect(containerWF.innerHTML).toContain('LeetCode 417. 太平洋大西洋水流 · 全景推演树');
    expect(containerWF.innerHTML).toContain('逆向思维');
    expect(containerWF.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerWF.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerWF.innerHTML).toContain('已完成双洋可达矩阵交集运算');
  });

  it('应当能正确为 path-min-effort (最小体力消耗路径) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('path-min-effort')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('minimum-effort-path')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-1631')).toBe(true);

    const containerEffort = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerEffort, {
      modelId: 'path-min-effort',
      m: 3,
      n: 3,
    });
    expect(containerEffort.innerHTML).toContain('LeetCode 1631. 最小体力消耗路径 · 全景推演树');
    expect(containerEffort.innerHTML).toContain('MiniMax 瓶颈最短路');
    expect(containerEffort.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerEffort.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerEffort.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerEffort.innerHTML).toContain('Dijkstra 堆优化');
  });

  it('应当能正确为 swim-in-rising-water (泳池游泳) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('swim-in-rising-water')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-778')).toBe(true);

    const containerSwim = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerSwim, {
      modelId: 'swim-in-rising-water',
      m: 3,
      n: 3,
    });
    expect(containerSwim.innerHTML).toContain('LeetCode 778. 水位上升的泳池中游泳 · 全景推演树');
    expect(containerSwim.innerHTML).toContain('MiniMax 水位瓶颈');
    expect(containerSwim.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerSwim.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerSwim.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerSwim.innerHTML).toContain('Dijkstra 堆优化');
  });

  it('应当能正确为 islands (岛屿数量) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('islands')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('number-of-islands')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-200')).toBe(true);

    const containerIslands = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerIslands, {
      modelId: 'islands',
      m: 4,
      n: 5,
    });
    expect(containerIslands.innerHTML).toContain('LeetCode 200. 岛屿数量 (Number of Islands) · 全景推演树');
    expect(containerIslands.innerHTML).toContain('沉岛标记法');
    expect(containerIslands.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerIslands.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerIslands.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerIslands.innerHTML).toContain('return count;');
  });

  it('应当能正确为 max-island-area (岛屿的最大面积) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('max-island-area')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('max-area-of-island-695')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-695')).toBe(true);

    const containerMIA = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerMIA, {
      modelId: 'max-island-area',
      m: 4,
      n: 5,
    });
    expect(containerMIA.innerHTML).toContain('LeetCode 695. 岛屿的最大面积 (Max Area of Island) · 全景推演树');
    expect(containerMIA.innerHTML).toContain('后序归约 DFS');
    expect(containerMIA.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerMIA.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerMIA.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerMIA.innerHTML).toContain('return maxArea;');
  });

  it('应当能正确为 as-far-from-land (地图分析) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('as-far-from-land')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('as-far-from-land-062')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-1162')).toBe(true);

    const containerLand = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerLand, {
      modelId: 'as-far-from-land-062',
      m: 3,
      n: 3,
    });
    expect(containerLand.innerHTML).toContain('LeetCode 1162. 地图分析 (离陆地最远的水域) · 全景推演树');
    expect(containerLand.innerHTML).toContain('逆向多源广搜');
    expect(containerLand.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerLand.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerLand.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerLand.innerHTML).toContain('return maxDistance;');
  });

  it('应当能正确为 make-largest-island (最大人工岛) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('make-largest-island')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('making-a-large-island')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-827')).toBe(true);

    const containerIslandMerge = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerIslandMerge, {
      modelId: 'make-largest-island',
      m: 3,
      n: 3,
    });
    expect(containerIslandMerge.innerHTML).toContain('LeetCode 827. 最大人工岛 (Making A Large Island) · 全景推演树');
    expect(containerIslandMerge.innerHTML).toContain('两遍扫描法');
    expect(containerIslandMerge.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerIslandMerge.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerIslandMerge.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerIslandMerge.innerHTML).toContain('return maxArea;');
  });

  it('应当能正确为 minimum-obstacles (0-1 BFS 移除障碍物) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('minimum-obstacles')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('minimum-obstacles-062')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-2290')).toBe(true);

    const containerObs = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerObs, {
      modelId: 'minimum-obstacles-062',
      m: 3,
      n: 3,
    });
    expect(containerObs.innerHTML).toContain('LeetCode 2290. 移除障碍物的最小数目 (0-1 BFS) · 全景推演树');
    expect(containerObs.innerHTML).toContain('双端队列 (Deque)');
    expect(containerObs.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerObs.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerObs.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerObs.innerHTML).toContain('return dist[2][2];');
  });

  it('应当能正确为 minimum-cost-valid-path (有效路径最小代价) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('minimum-cost-valid-path')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('minimum-cost-valid-path-062')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-1368')).toBe(true);

    const containerValidPath = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerValidPath, {
      modelId: 'minimum-cost-valid-path-062',
      m: 3,
      n: 3,
    });
    expect(containerValidPath.innerHTML).toContain('LeetCode 1368. 有效路径的最小代价 (0-1 BFS) · 全景推演树');
    expect(containerValidPath.innerHTML).toContain('网格箭头规约');
    expect(containerValidPath.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerValidPath.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerValidPath.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerValidPath.innerHTML).toContain('return dist[2][2];');
  });

  it('应当能正确为 coastline (岛屿的周长) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('coastline')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('island-perimeter')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-463')).toBe(true);

    const containerCoast = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerCoast, {
      modelId: 'coastline',
      m: 4,
      n: 4,
    });
    expect(containerCoast.innerHTML).toContain('LeetCode 463. 岛屿的周长 (Island Perimeter) · 全景推演树');
    expect(containerCoast.innerHTML).toContain('4 邻域暴露边累加');
    expect(containerCoast.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerCoast.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerCoast.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerCoast.innerHTML).toContain('return perimeter;');
  });

  it('应当能正确为 sink-islands (被围绕的区域 / 沉没孤岛) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('sink-islands')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('surrounded-regions-130')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-130')).toBe(true);

    const containerSink = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerSink, {
      modelId: 'sink-islands',
      m: 4,
      n: 4,
    });
    expect(containerSink.innerHTML).toContain('LeetCode 130. 被围绕的区域 / 沉没孤岛 · 全景推演树');
    expect(containerSink.innerHTML).toContain('逆向思维 · 边界洪水浸润保护与内陆孤岛就地淹没');
    expect(containerSink.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerSink.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerSink.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerSink.innerHTML).toContain('return grid;');
  });

  it('应当能正确为 total-island-area (孤岛总面积) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('total-island-area')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('isolated-islands-sum')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('island-total-area')).toBe(true);

    const containerTotal = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerTotal, {
      modelId: 'total-island-area',
      m: 4,
      n: 5,
    });
    expect(containerTotal.innerHTML).toContain('孤岛总面积 (Total Island Area) · 全景推演树');
    expect(containerTotal.innerHTML).toContain('网格连通分量 DFS · 多连通块面积累加与状态归一化');
    expect(containerTotal.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerTotal.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerTotal.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerTotal.innerHTML).toContain('return totalArea;');
  });

  it('应当能正确为 islands-bfs (岛屿数量 BFS 广度优先搜索) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('islands-bfs')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('number-of-islands-bfs')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-200-bfs')).toBe(true);

    const containerBfs = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerBfs, {
      modelId: 'islands-bfs',
      m: 4,
      n: 5,
    });
    expect(containerBfs.innerHTML).toContain('LeetCode 200. 岛屿数量 (BFS 队列扩散) · 全景推演树');
    expect(containerBfs.innerHTML).toContain('入队即染色原则');
    expect(containerBfs.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerBfs.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerBfs.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerBfs.innerHTML).toContain('return count;');
  });

  it('应当能正确为 closed-islands (统计封闭岛屿的数目) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('closed-islands')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('number-of-closed-islands')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-1254')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('1254')).toBe(true);

    const containerClosed = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerClosed, {
      modelId: 'closed-islands',
      m: 5,
      n: 8,
    });
    expect(containerClosed.innerHTML).toContain('LeetCode 1254. 统计封闭岛屿的数目 (Closed Islands) · 全景推演树');
    expect(containerClosed.innerHTML).toContain('双阶段泛洪浸没');
    expect(containerClosed.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerClosed.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerClosed.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerClosed.innerHTML).toContain('return count;');
  });

  it('应当能正确为 sub-islands (统计子岛屿) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('sub-islands')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('count-sub-islands')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-1905')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('1905')).toBe(true);

    const containerSub = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerSub, {
      modelId: 'sub-islands',
      m: 5,
      n: 5,
    });
    expect(containerSub.innerHTML).toContain('LeetCode 1905. 统计子岛屿 (Count Sub Islands) · 全景推演树');
    expect(containerSub.innerHTML).toContain('逆向剪枝排除与合法子岛浸没');
    expect(containerSub.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerSub.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerSub.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerSub.innerHTML).toContain('return count;');
  });

  it('应当能正确为 distinct-islands (不同岛屿的数量) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('distinct-islands')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('number-of-distinct-islands')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-694')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('694')).toBe(true);

    const containerDistinct = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerDistinct, {
      modelId: 'distinct-islands',
      m: 4,
      n: 5,
    });
    expect(containerDistinct.innerHTML).toContain('LeetCode 694. 不同岛屿的数量 (Distinct Islands) · 全景推演树');
    expect(containerDistinct.innerHTML).toContain('相对坐标原点归一化与哈希集合去重');
    expect(containerDistinct.innerHTML).toContain('第一阶段：填 Base Case');
    expect(containerDistinct.innerHTML).toContain('第二阶段：核心双重循环推演');
    expect(containerDistinct.innerHTML).toContain('第三阶段：返回最终结果');
    expect(containerDistinct.innerHTML).toContain('return shapes.size();');
  });

  it('应当能正确为 dijkstra-basic (朴素 Dijkstra 最短路) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('dijkstra-basic')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dijkstra')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dijkstra-naive')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dijkstra-basic-061')).toBe(true);

    const containerDJB = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerDJB, {
      modelId: 'dijkstra-basic',
    });
    expect(containerDJB.innerHTML).toContain('朴素 Dijkstra 最短路径 (Dijkstra Naive · O(V²)) · 全景推演树');
    expect(containerDJB.innerHTML).toContain('三角不等式松弛');
    expect(containerDJB.innerHTML).toContain('【第 1 轮】贪心选出最小未访问节点 u = 0');
    expect(containerDJB.innerHTML).toContain('锁定 visited[0] = true');
    expect(containerDJB.innerHTML).toContain('return dist: [0, 3, 1, 4, 7]');
  });

  it('应当能正确为 dijkstra-heap (堆优化 Dijkstra 最短路) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('dijkstra-heap')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dijkstra-pq')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dijkstra-heap-061')).toBe(true);

    const containerDJH = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerDJH, {
      modelId: 'dijkstra-heap',
    });
    expect(containerDJH.innerHTML).toContain('堆优化 Dijkstra 最短路径 (Dijkstra Min-Heap · O(E log V)) · 全景推演树');
    expect(containerDJH.innerHTML).toContain('惰性丢弃 (Lazy Deletion)');
    expect(containerDJH.innerHTML).toContain('pq.poll() 弹出堆顶 (d=0, u=0)');
    expect(containerDJH.innerHTML).toContain('惰性删除触发与终点松弛');
    expect(containerDJH.innerHTML).toContain('return dist: [0, 3, 1, 4, 7]');
  });

  it('应当能正确为 dijkstra-index-heap (反向索引堆优化 Dijkstra 最短路) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('dijkstra-index-heap')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dijkstra-decrease-key')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dijkstra-indexed-heap')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('luogu-p4779')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class061-index-heap')).toBe(true);

    const containerDJI = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerDJI, {
      modelId: 'dijkstra-index-heap',
    });
    expect(containerDJI.innerHTML).toContain('反向索引堆优化 Dijkstra 最短路径 (Dijkstra Index-Heap · O((V+E) log V)) · 全景推演树');
    expect(containerDJI.innerHTML).toContain('反向索引映射 where[]');
    expect(containerDJI.innerHTML).toContain('原地 decreaseKey');
    expect(containerDJI.innerHTML).toContain('pop() 弹出堆顶代表元 Node 1');
    expect(containerDJI.innerHTML).toContain('return distance[1..4] = [0, 2, 1, 4];');
  });

  it('应当能正确为 network-delay-time (网络延迟时间) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('network-delay-time')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('network-delay-time-064')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-743')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class064-code01')).toBe(true);

    const containerNDT = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerNDT, {
      modelId: 'network-delay-time',
    });
    expect(containerNDT.innerHTML).toContain('LeetCode 743. 网络延迟时间 (Network Delay Time · O(E log V)) · 全景推演树');
    expect(containerNDT.innerHTML).toContain('小根堆优先队列 Dijkstra');
    expect(containerNDT.innerHTML).toContain('全网波前广播');
    expect(containerNDT.innerHTML).toContain('pq.poll() 弹出源点 Node 2');
    expect(containerNDT.innerHTML).toContain('return max(dist[1..4]) = max(1, 0, 1, 2) = 2;');
  });

  it('应当能正确为 layered-dijkstra (分层图最短路 / 飞行路线) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('layered-dijkstra')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('layered-dijkstra-064')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('luogu-p4568')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('flight-routes')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class064-code04')).toBe(true);

    const containerLD = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerLD, {
      modelId: 'layered-dijkstra',
    });
    expect(containerLD.innerHTML).toContain('洛谷 P4568 飞行路线 (Layered Dijkstra · 分层图最短路) · 全景推演树');
    expect(containerLD.innerHTML).toContain('状态升维 (u, usedK)');
    expect(containerLD.innerHTML).toContain('跨层 0 权免票跃迁');
    expect(containerLD.innerHTML).toContain('poll 出堆状态 (Node 0, used: 0, 花费 0元)');
    expect(containerLD.innerHTML).toContain('return dist[t][k] = 4;');
  });

  it('应当能正确为 bellman-ford (Bellman-Ford 最短路) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('bellman-ford')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('bellman-ford-061')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class061-code03')).toBe(true);

    const containerBF = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerBF, {
      modelId: 'bellman-ford',
    });
    expect(containerBF.innerHTML).toContain('Bellman-Ford 负权最短路径 (V-1 轮全边松弛) · 全景推演树');
    expect(containerBF.innerHTML).toContain('早停检测 (Early Stop)');
    expect(containerBF.innerHTML).toContain('【第 1 轮】全边首次遍历松弛');
    expect(containerBF.innerHTML).toContain('早停准则命中：if (!updated) break;');
    expect(containerBF.innerHTML).toContain('return dist: [0, 4, 2, 5, 3]');
  });

  it('应当能正确为 spfa (SPFA 队列优化最短路) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('spfa')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('spfa-061')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class061-code04')).toBe(true);

    const containerSPFA = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerSPFA, {
      modelId: 'spfa',
    });
    expect(containerSPFA.innerHTML).toContain('SPFA 队列优化最短路 (Shortest Path Faster Algorithm) · 全景推演树');
    expect(containerSPFA.innerHTML).toContain('在队标记 inQueue');
    expect(containerSPFA.innerHTML).toContain('出队消标：u = 0 出队');
    expect(containerSPFA.innerHTML).toContain('return dist: [0, 4, 2, 5, 3]');
  });

  it('应当能正确为 negative-cycle (负权回路检测) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('negative-cycle')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('negative-cycle-061')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class061-code06')).toBe(true);

    const containerNC = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerNC, {
      modelId: 'negative-cycle',
    });
    expect(containerNC.innerHTML).toContain('Bellman-Ford 负权回路检测 (Negative Cycle Detection) · 全景推演树');
    expect(containerNC.innerHTML).toContain('第 V 轮额外松弛定理');
    expect(containerNC.innerHTML).toContain('捕获负权回路：hasCycle = true');
    expect(containerNC.innerHTML).toContain('return true (检测到负权回路)');
  });

  it('应当能正确为 floyd (Floyd-Warshall 全源最短路) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('floyd')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('floyd-061')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class061-code05')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('floyd-warshall')).toBe(true);

    const containerFloyd = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerFloyd, {
      modelId: 'floyd',
    });
    expect(containerFloyd.innerHTML).toContain('Floyd-Warshall 全源最短路径 (O(V³) 矩阵动规) · 全景推演树');
    expect(containerFloyd.innerHTML).toContain('中转点 k');
    expect(containerFloyd.innerHTML).toContain('全源最短距离矩阵完全收敛');
    expect(containerFloyd.innerHTML).toContain('dist[0][3] = 9');
  });
});
