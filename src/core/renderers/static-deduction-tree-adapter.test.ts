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

  it('应当能正确为 ev-charge-dijkstra (电动车充放电最短路 / LCP 35) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('ev-charge-dijkstra')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('ev-charge-dijkstra-064')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-lcp-35')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class064-code05')).toBe(true);

    const containerEV = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerEV, {
      modelId: 'ev-charge-dijkstra',
    });
    expect(containerEV.innerHTML).toContain('LeetCode LCP 35. 电动车充放电最短路 (EV Charging Dijkstra) · 全景推演树');
    expect(containerEV.innerHTML).toContain('二维状态升维 (city, power)');
    expect(containerEV.innerHTML).toContain('原地充电');
    expect(containerEV.innerHTML).toContain('公路行驶');
    expect(containerEV.innerHTML).toContain('return dist[end][0] = 10;');
  });

  it('应当能正确为 k-shortest-path (K 短路与 A* 搜索 / P2483) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('k-shortest-path')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('k-shortest-paths')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('luogu-p2483')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('luogu-p4467')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('kth-shortest-path')).toBe(true);

    const containerKPath = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerKPath, {
      modelId: 'k-shortest-path',
    });
    expect(containerKPath.innerHTML).toContain('洛谷 P2483 / P4467 K 短路 (K-th Shortest Path · A* 启发式搜索) · 全景推演树');
    expect(containerKPath.innerHTML).toContain('反向图最短路启发函数 h(u)');
    expect(containerKPath.innerHTML).toContain('A* 综合估价');
    expect(containerKPath.innerHTML).toContain('第 K 次出堆最优性');
    expect(containerKPath.innerHTML).toContain('return cur.g = 5;');
  });

  it('应当能正确为 limited-shortest-path (有限最短路 / LC 787) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('limited-shortest-path')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('cheapest-flights-within-k-stops')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-787')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('lc-787')).toBe(true);

    const containerLSP = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerLSP, {
      modelId: 'limited-shortest-path',
    });
    expect(containerLSP.innerHTML).toContain('力扣 787. K 站中转内最便宜的航班 (Limited Shortest Path · Bellman-Ford) · 全景推演树');
    expect(containerLSP.innerHTML).toContain('最多走 K+1 条边');
    expect(containerLSP.innerHTML).toContain('clone[] 状态备份阻断串联');
    expect(containerLSP.innerHTML).toContain('return dist[dst] = 9;');
  });

  it('应当能正确为 redundant-edge (冗余连接 / LC 684) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('redundant-edge')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('redundant-connection')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-684')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('lc-684')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class056-code01')).toBe(true);

    const containerRE = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerRE, {
      modelId: 'redundant-edge',
    });
    expect(containerRE.innerHTML).toContain('力扣 684. 冗余连接 (Redundant Connection · 并查集) · 全景推演树');
    expect(containerRE.innerHTML).toContain('无向图回路检测');
    expect(containerRE.innerHTML).toContain('parent[i] = i');
    expect(containerRE.innerHTML).toContain('return [1, 4]');
  });

  it('应当能正确为 redundant-edge-ii (冗余连接 II / LC 685) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('redundant-edge-ii')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('redundant-connection-ii')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('redundant-connection-ii-685')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('redundant-edge-2')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-685')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('lc-685')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class057-code01')).toBe(true);

    const containerRE2 = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerRE2, {
      modelId: 'redundant-edge-ii',
    });
    expect(containerRE2.innerHTML).toContain('力扣 685. 冗余连接 II (Redundant Connection II · 并查集) · 全景推演树');
    expect(containerRE2.innerHTML).toContain('入度为 2 双父节点冲突');
    expect(containerRE2.innerHTML).toContain('inDegree[i] = 0');
    expect(containerRE2.innerHTML).toContain('return edges[conflict] = [2, 3];');
  });

  it('应当能正确为 topological-sort (拓扑排序 / LC 210) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('topological-sort')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('topo-sort-kahn')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('course-schedule-ii-210')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class059-code02')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class026-code01')).toBe(true);

    const containerTopo = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerTopo, {
      modelId: 'topological-sort',
    });
    expect(containerTopo.innerHTML).toContain('力扣 210. 课程表 II (Topological Sort · Kahn 拓扑排序) · 全景推演树');
    expect(containerTopo.innerHTML).toContain('零入度 BFS 队列');
    expect(containerTopo.innerHTML).toContain('顶点初始入度统计');
    expect(containerTopo.innerHTML).toContain('return order = [5, 4, 2, 0, 3, 1];');
  });

  it('应当能正确为 mst-kruskal (Kruskal 最小生成树) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('mst-kruskal')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('kruskal-mst')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class058-code01')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('luogu-p3366-kruskal')).toBe(true);

    const containerKruskal = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerKruskal, {
      modelId: 'mst-kruskal',
    });
    expect(containerKruskal.innerHTML).toContain('最小生成树 (Kruskal 算法 · 加边法) · 全景推演树');
    expect(containerKruskal.innerHTML).toContain('并查集回路检测');
    expect(containerKruskal.innerHTML).toContain('边权升序候选队列');
    expect(containerKruskal.innerHTML).toContain('return totalWeight = 16;');
  });

  it('应当能正确为 mst-prim (Prim 最小生成树) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('mst-prim')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('prim-mst')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class058-code02')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('luogu-p3366-prim')).toBe(true);

    const containerPrim = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerPrim, {
      modelId: 'mst-prim',
    });
    expect(containerPrim.innerHTML).toContain('最小生成树 (Prim 算法 · 加点法) · 全景推演树');
    expect(containerPrim.innerHTML).toContain('切割性质 Cut Property');
    expect(containerPrim.innerHTML).toContain('切边距离数组');
    expect(containerPrim.innerHTML).toContain('return totalWeight = 16;');
  });

  it('应当能正确为 topo-dp (拓扑 DP · 关键路径 CPM) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('topo-dp')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('parallel-courses-iii')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-2050')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class060-code03')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('topo-dp-cpm')).toBe(true);

    const containerTopoDP = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerTopoDP, {
      modelId: 'topo-dp',
    });
    expect(containerTopoDP.innerHTML).toContain('拓扑排序与动态规划 (Topological DP · 关键路径 CPM) · 全景推演树');
    expect(containerTopoDP.innerHTML).toContain('关键路径回溯');
    expect(containerTopoDP.innerHTML).toContain('工序最长耗时初始数组');
    expect(containerTopoDP.innerHTML).toContain('return totalMax = 9;');
  });

  it('应当能正确为 second-mst (严格次小生成树 / 洛谷 P4180) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('second-mst')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('strict-second-mst')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('luogu-p4180')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('second-best-mst')).toBe(true);

    const containerSMST = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerSMST, {
      modelId: 'second-mst',
    });
    expect(containerSMST.innerHTML).toContain('严格次小生成树 (Strict Second-Best MST · 洛谷 P4180) · 全景推演树');
    expect(containerSMST.innerHTML).toContain('Kruskal 主生成树');
    expect(containerSMST.innerHTML).toContain('基础最小生成树树边集合');
    expect(containerSMST.innerHTML).toContain('return secondMstWeight = 7;');
  });

  it('应当能正确为 number-of-provinces (省份数量 · LC 547) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('number-of-provinces')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-547')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('lc-547')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('friend-circles')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class056-code02')).toBe(true);

    const containerProvinces = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerProvinces, {
      modelId: 'number-of-provinces',
    });
    expect(containerProvinces.innerHTML).toContain('省份数量 (Number of Provinces · LC 547) · 并查集推演树');
    expect(containerProvinces.innerHTML).toContain('并查集父指针数组初始化');
    expect(containerProvinces.innerHTML).toContain('执行 union(0, 1)');
    expect(containerProvinces.innerHTML).toContain('return provinces = 2');
  });

  it('应当能正确为 bfs-01 (0-1 BFS 双端队列最短路 · LC 2290) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('bfs-01')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-2290')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('lc-2290')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('minimum-obstacle-removal')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class062-code01')).toBe(true);

    const containerBFS01 = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerBFS01, {
      modelId: 'bfs-01',
    });
    expect(containerBFS01.innerHTML).toContain('0-1 BFS 双端队列最短路 (0-1 BFS Deque · LC 2290) · 全景推演树');
    expect(containerBFS01.innerHTML).toContain('双端队列 Deque 初始队头元素');
    expect(containerBFS01.innerHTML).toContain('0权插队头');
    expect(containerBFS01.innerHTML).toContain('1权插队尾');
    expect(containerBFS01.innerHTML).toContain('return dist[5] = 1;');
  });

  it('应当能正确为 bi-bfs (双向广度优先搜索 · LC 127) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('bi-bfs')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-127')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('lc-127')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('word-ladder')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class063-code01')).toBe(true);

    const containerBiBFS = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerBiBFS, {
      modelId: 'bi-bfs',
    });
    expect(containerBiBFS.innerHTML).toContain('双向广搜单词接龙 (Bidirectional BFS · LC 127) · 全景推演树');
    expect(containerBiBFS.innerHTML).toContain('起点与终点初始波前集合');
    expect(containerBiBFS.innerHTML).toContain('对调集合优化');
    expect(containerBiBFS.innerHTML).toContain('碰撞检测');
    expect(containerBiBFS.innerHTML).toContain('return len = 5;');
  });

  it('应当能正确为 forward-star (链式前向星 · 左程云 Class 059) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('forward-star')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('chained-forward-star')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class059-code01')).toBe(true);

    const containerFS = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(containerFS, {
      modelId: 'forward-star',
    });
    expect(containerFS.innerHTML).toContain('链式前向星 (Chained Forward Star) · 全景推演树');
    expect(containerFS.innerHTML).toContain('静态链表结构体内存池');
    expect(containerFS.innerHTML).toContain('头插法链接');
    expect(containerFS.innerHTML).toContain('return traversed = [1, 0];');
  });

  it('应当能正确为 malware-spread-ii (减少恶意软件的传播 II · LeetCode 928) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('malware-spread-ii')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('minimize-malware-spread-ii-928')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class057-code02')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'malware-spread-ii',
    });
    expect(container.innerHTML).toContain('减少恶意软件的传播 II (Minimize Malware Spread II) · 全景推演树');
    expect(container.innerHTML).toContain('排除病毒节点，合并健康连通分量');
    expect(container.innerHTML).toContain('扫描病毒源邻边，统计健康分量感染源');
    expect(container.innerHTML).toContain('独占拯救效益结算与最优决策');
    expect(container.innerHTML).toContain('return ans = 0;');
  });

  it('应当能正确为 two-sat-problem (2-SAT 问题与强连通缩点 · 洛谷 P4782) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('two-sat-problem')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('two-sat')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P4782')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'two-sat-problem',
    });
    expect(container.innerHTML).toContain('2-SAT 问题与强连通缩点 (2-Satisfiability Problem) · 全景推演树');
    expect(container.innerHTML).toContain('逻辑子句转化为有向蕴涵边');
    expect(container.innerHTML).toContain('执行 Tarjan 算法求强连通分量');
    expect(container.innerHTML).toContain('矛盾检测与拓扑序反向赋值');
    expect(container.innerHTML).toContain('return assignment = [x1=0, x2=1];');
  });

  it('应当能正确为 dinic-max-flow (Dinic 网络最大流 · 洛谷 P3376) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('dinic-max-flow')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dinic')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3376')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'dinic-max-flow',
    });
    expect(container.innerHTML).toContain('Dinic 网络最大流 (Dinic Max Flow Algorithm) · 全景推演树');
    expect(container.innerHTML).toContain('BFS 搜索构造分层网络');
    expect(container.innerHTML).toContain('DFS 多路增广与当前弧优化');
    expect(container.innerHTML).toContain('残量网络收敛与最大流判定');
    expect(container.innerHTML).toContain('return maxFlow = 20;');
  });

  it('应当能正确为 alien-dict (火星词典拓扑排序 · LeetCode 269) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('alien-dict')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('alien-dictionary-269')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class059-code03')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'alien-dict',
    });
    expect(container.innerHTML).toContain('火星词典拓扑排序 (Alien Dictionary) · 全景推演树');
    expect(container.innerHTML).toContain('比对相邻单词首异字符，构建偏序有向图');
    expect(container.innerHTML).toContain('0 入度字符入队与 Kahn 算法拓扑消元');
    expect(container.innerHTML).toContain('成环校验与火星字母表序列输出');
    expect(container.innerHTML).toContain('return "wertf";');
  });

  it('应当能正确为 tarjan-scc-dag (Tarjan 强连通缩点 · 洛谷 P3387) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('tarjan-scc-dag')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tarjan-scc')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class066-code01')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3387')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'tarjan-scc-dag',
    });
    expect(container.innerHTML).toContain('Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC & Condensation) · 全景推演树');
    expect(container.innerHTML).toContain('DFS 树深入遍历与时间戳分配');
    expect(container.innerHTML).toContain('返祖边环路探测与右侧分支深入');
    expect(container.innerHTML).toContain('强连通分量根锁定与弹栈归集');
    expect(container.innerHTML).toContain('跨分量边扫描与 DAG 缩点重构');
  });

  it('应当能正确为 tarjan-bridge (Tarjan 割点与桥 · 洛谷 P3388) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('tarjan-bridge')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tarjan-bridge-cut')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class068-code01')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3388')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-1192')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'tarjan-bridge',
    });
    expect(container.innerHTML).toContain('Tarjan 割点与桥 (Cut Vertices & Bridges) · 全景推演树');
    expect(container.innerHTML).toContain('DFS 树枝深入与时间戳记录');
    expect(container.innerHTML).toContain('返祖回边环路与右侧悬挂链深入');
    expect(container.innerHTML).toContain('叶节点回溯与首条桥边割点判定');
    expect(container.innerHTML).toContain('回溯至节点 3 与根节点割点检验');
  });

  it('应当能正确为 hungarian-matching (匈牙利二分图最大匹配 · 洛谷 P3386) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('hungarian-matching')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('hungarian-algorithm')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('bipartite-matching')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class069-code01')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3386')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'hungarian-matching',
    });
    expect(container.innerHTML).toContain('匈牙利算法二分图最大匹配 (Hungarian Maximum Matching) · 全景推演树');
    expect(container.innerHTML).toContain('左部节点 L0 发起增广探索');
    expect(container.innerHTML).toContain('左部节点 L1 发起增广探索');
    expect(container.innerHTML).toContain('左部节点 L2 发起增广探索与原配让位协商');
    expect(container.innerHTML).toContain('全图最大匹配收敛与匹配基数确认');
  });

  it('应当能正确为 diff-constraints (差分约束系统 · 洛谷 P5960) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('diff-constraints')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('difference-constraints')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class070-code01')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P5960')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'diff-constraints',
    });
    expect(container.innerHTML).toContain('差分约束系统 (System of Difference Constraints) · 全景推演树');
    expect(container.innerHTML).toContain('超级源点发散与变量基准初始化');
    expect(container.innerHTML).toContain('SPFA 约束松弛与上界紧缩');
    expect(container.innerHTML).toContain('结论判定与可行解输出');
  });

  it('应当能正确为 bipartite-game (二分图博弈 · 洛谷 P4055) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('bipartite-game')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('game-on-bipartite-graph')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('jsoi2009-game')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P4055')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'bipartite-game',
    });
    expect(container.innerHTML).toContain('二分图博弈 (Game on Bipartite Graph) · 全景推演树');
    expect(container.innerHTML).toContain('匈牙利算法求解基准最大匹配');
    expect(container.innerHTML).toContain('交错轨 DFS 探索非必须匹配点');
    expect(container.innerHTML).toContain('博弈胜负态判定与先手必胜点集确立');
  });

  it('应当能正确为 min-cost-max-flow (最小费用最大流 · 洛谷 P3381) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('min-cost-max-flow')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('mcmf')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('minimum-cost-maximum-flow')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class072-code01')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3381')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'min-cost-max-flow',
    });
    expect(container.innerHTML).toContain('最小费用最大流 (Minimum Cost Maximum Flow) · 全景推演树');
    expect(container.innerHTML).toContain('第一轮增广：经由主干通路 S ➔ A ➔ T');
    expect(container.innerHTML).toContain('第二轮增广：经由下路分流 S ➔ B ➔ T');
    expect(container.innerHTML).toContain('第三轮增广：中继跨越 S ➔ A ➔ B ➔ T');
  });

  it('应当能正确为 konig-min-vertex-cover (二分图最小点覆盖与 König 定理 · 洛谷 P6062) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('konig-min-vertex-cover')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('konig-theorem')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('min-vertex-cover')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class069')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P6062')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'konig-min-vertex-cover',
    });
    expect(container.innerHTML).toContain('二分图最小点覆盖与 König 定理 (König\'s Theorem) · 全景推演树');
    expect(container.innerHTML).toContain('匈牙利算法求解基准最大匹配');
    expect(container.innerHTML).toContain('从未匹配左部点发起交错路 DFS 染色');
    expect(container.innerHTML).toContain('提取最小点覆盖集合');
    expect(container.innerHTML).toContain('互补最大独立集与对偶终局核算');
  });

  it('应当能正确为 km-algorithm (二分图最大权完美匹配与 KM 算法 · 洛谷 P6577) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('km-algorithm')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('km')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('kuhn-munkres')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class073')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P6577')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'km-algorithm',
    });
    expect(container.innerHTML).toContain('二分图最大权完美匹配与 KM 算法 (Kuhn-Munkres Algorithm) · 全景推演树');
    expect(container.innerHTML).toContain('可行顶标初始化与首轮相等子图探索');
    expect(container.innerHTML).toContain('节点 L2 冲突协商与顶标微调');
    expect(container.innerHTML).toContain('KM 算法最佳完备匹配终局核算');
  });

  it('应当能正确为 min-path-cover (DAG 最小路径覆盖 · 洛谷 P2764) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('min-path-cover')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dag-path-cover')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('minimum-path-cover')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class071')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P2764')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'min-path-cover',
    });
    expect(container.innerHTML).toContain('DAG 最小路径覆盖 (DAG Minimum Path Cover) · 全景推演树');
    expect(container.innerHTML).toContain('出点 1_out 与 2_out 增广匹配');
    expect(container.innerHTML).toContain('出点 3_out 增广与最大匹配锁定');
    expect(container.innerHTML).toContain('定理计算与不相交路径链还原');
  });

  it('应当能正确为 max-weight-closure (网络流最大权闭合子图 · 洛谷 P2762) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('max-weight-closure')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('max-weight-closure-graph')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('space-project')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class072')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P2762')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'max-weight-closure',
    });
    expect(container.innerHTML).toContain('网络流最大权闭合子图 (Max-Weight Closure) · 全景推演树');
    expect(container.innerHTML).toContain('正权收益边与负权成本边构建');
    expect(container.innerHTML).toContain('分层网络与阻塞流增广');
    expect(container.innerHTML).toContain('最大净收益核算与闭合方案还原');
  });

  it('应当能正确为 bounded-flow (上下界网络流 · LOJ 115) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('bounded-flow')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('bounded-flow-circulation')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('feasible-circulation')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('LOJ115')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P5192')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'bounded-flow',
    });
    expect(container.innerHTML).toContain('上下界网络流与无源汇可行流 (Bounded Flow) · 全景推演树');
    expect(container.innerHTML).toContain('强制下界底流扣减与点差额累计');
    expect(container.innerHTML).toContain('伴随网络超级源汇连边');
    expect(container.innerHTML).toContain('满流充要判定与真实流量还原');
  });

  it('应当能正确为 dominator-tree (DAG 支配树 · 洛谷 P2597) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('dominator-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dominator-tree-dag')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dag-dominator-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P2597')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P5180')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'dominator-tree',
    });
    expect(container.innerHTML).toContain('DAG 支配树 (Dominator Tree) · 全景推演树');
    expect(container.innerHTML).toContain('原图加边与入度统计');
    expect(container.innerHTML).toContain('拓扑排序推进与前驱 LCA 汇聚');
    expect(container.innerHTML).toContain('确立直接支配点与倍增祖先更新');
    expect(container.innerHTML).toContain('后继入度递减与支配终局验证');
  });

  it('应当能正确为 eulerian-circuit (欧拉回路 · Hierholzer · 洛谷 P7771) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('eulerian-circuit')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('eulerian-path')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('hierholzer')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P7771')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('leetcode-332')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class067')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'eulerian-circuit',
    });
    expect(container.innerHTML).toContain('欧拉回路与欧拉路径 (Eulerian Circuit · Hierholzer) · 全景推演树');
    expect(container.innerHTML).toContain('度数守恒校验与出边字典序排序');
    expect(container.innerHTML).toContain('当前弧扫描与深度优先遍历');
    expect(container.innerHTML).toContain('死胡同回溯压栈');
    expect(container.innerHTML).toContain('序列逆序翻转与一笔画还原');
  });

  it('应当能正确为 block-cut-tree (广义圆方树 · 洛谷 P4320 / P4630) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('block-cut-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('bct')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('round-square-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P4320')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P4630')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'block-cut-tree',
    });
    expect(container.innerHTML).toContain('广义圆方树 (Block-Cut Tree · 洛谷 P4320 / P4630) · 全景推演树');
    expect(container.innerHTML).toContain('Tarjan 深度优先遍历与时间戳分配');
    expect(container.innerHTML).toContain('点双连通分量识别与方点连边');
    expect(container.innerHTML).toContain('树上必经割点定理转化与路径查询');
  });

  it('应当能正确为 kruskal-reconstruction-tree (Kruskal 重构树 · 洛谷 P4768 / P4197) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('kruskal-reconstruction-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('kruskal-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('reconstruction-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P4768')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P4197')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class072')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'kruskal-reconstruction-tree',
    });
    expect(container.innerHTML).toContain('Kruskal 重构树 (Kruskal Reconstruction Tree · 洛谷 P4768 / P4197) · 全景推演树');
    expect(container.innerHTML).toContain('边权升序排序与并查集初始化');
    expect(container.innerHTML).toContain('虚点构建与边权转点权');
    expect(container.innerHTML).toContain('大根堆单调性与 LCA 瓶颈路径极速查询');
  });

  it('应当能正确为 heavy-light-decomposition (树链剖分 · 洛谷 P3384) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('heavy-light-decomposition')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('hld')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tree-chain-decomposition')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3384')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class074')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'heavy-light-decomposition',
    });
    expect(container.innerHTML).toContain('树链剖分与重链维护 (Heavy-Light Decomposition · 洛谷 P3384) · 全景推演树');
    expect(container.innerHTML).toContain('第一次 DFS：深度、父节点、子树大小统计与重儿子判定');
    expect(container.innerHTML).toContain('第二次 DFS：重儿子优先遍历、链头确立与连续 DFN 序编排');
    expect(container.innerHTML).toContain('树上路径跳跃与线段树连续区间映射');
  });

  it('应当能正确为 virtual-tree (虚树 · 洛谷 P2495) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('virtual-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('auxiliary-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('vtree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P2495')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('SDOI2011')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class073')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'virtual-tree',
    });
    expect(container.innerHTML).toContain('虚树与关键点浓缩 (Virtual Tree · 洛谷 P2495) · 全景推演树');
    expect(container.innerHTML).toContain('原树预处理与关键点 DFN 序排序');
    expect(container.innerHTML).toContain('单调栈最右链维护与 LCA 虚树构建');
    expect(container.innerHTML).toContain('O(K) 浓缩骨架上的极速树形 DP 求解');
  });

  it('应当能正确为 dsu-on-tree (树上启发式合并 · CF600E) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('dsu-on-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dsu-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('sack')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('CF600E')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('U41492')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class075')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tree-dominant-color')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dominant-color')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'dsu-on-tree',
    });
    expect(container.innerHTML).toContain('树上启发式合并 (DSU on Tree · CF600E) · 全景推演树');
    expect(container.innerHTML).toContain('第一次 DFS 预处理与重儿子划分');
    expect(container.innerHTML).toContain('第二次 DFS 启发式合并与保留消除');
    expect(container.innerHTML).toContain('树上启发式合并结果输出');
  });

  it('应当能正确为 lca-binary-lifting (最近公共祖先树上倍增 · 洛谷 P3379) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('lca-binary-lifting')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('lca')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('binary-lifting-lca')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3379')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class076')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'lca-binary-lifting',
    });
    expect(container.innerHTML).toContain('最近公共祖先与树上倍增 (LCA Binary Lifting · 洛谷 P3379) · 全景推演树');
    expect(container.innerHTML).toContain('DFS 预处理深度与倍增跳转表');
    expect(container.innerHTML).toContain('查询阶段一：深度对齐跃升');
    expect(container.innerHTML).toContain('查询阶段二：二进制同步跃升');
    expect(container.innerHTML).toContain('结果锁定与树上最短距离结算');
  });

  it('应当能正确为 prufer-sequence (Prufer 序列与 Cayley 公式 · 洛谷 P6086) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('prufer-sequence')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('prufer')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('cayley')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P6086')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class077')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'prufer-sequence',
    });
    expect(container.innerHTML).toContain('Prufer 序列与 Cayley 公式 (Prufer Sequence · 洛谷 P6086) · 全景推演树');
    expect(container.innerHTML).toContain('度数统计与叶节点初筛');
    expect(container.innerHTML).toContain('线性双指针贪心消除与序列编码');
    expect(container.innerHTML).toContain('Cayley 公式与双射性质总结');
  });

  it('应当能正确为 tree-difference (树上差分 · 洛谷 P3128 / P3258) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('tree-difference')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tree-diff')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tree-difference-122')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3128')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3258')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('class122')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'tree-difference',
    });
    expect(container.innerHTML).toContain('树上差分与子树前缀和 (Tree Difference · 洛谷 P3128 / P3258) · 全景推演树');
    expect(container.innerHTML).toContain('预处理深度与倍增 LCA');
    expect(container.innerHTML).toContain('路径端点 LCA 判定与差分标记注入');
    expect(container.innerHTML).toContain('后序遍历自底向上前缀和还原');
  });

  it('应当能正确为 tree-knapsack-dp (树上有依赖背包 · 洛谷 P2014 选课) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('tree-knapsack-dp')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tree-knapsack')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P2014')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tree-dependent-knapsack')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'tree-knapsack-dp',
    });
    expect(container.innerHTML).toContain('树上有依赖背包 (Tree Knapsack DP · 洛谷 P2014 选课) · 全景推演树');
    expect(container.innerHTML).toContain('虚拟超级源点与树拓扑构建');
    expect(container.innerHTML).toContain('后序递归遍历与节点必修装载');
    expect(container.innerHTML).toContain('泛化物品背包卷积与上下界优化');
    expect(container.innerHTML).toContain('超级源点全局汇总与最优解输出');
  });

  it('应当能正确为 centroid-tree (动态点分树 · 洛谷 P6329 / SP1437) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('centroid-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('dynamic-centroid-tree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P6329')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('SP1437')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'centroid-tree',
    });
    expect(container.innerHTML).toContain('动态点分树与重心分治重构 (Dynamic Centroid Tree · 洛谷 P6329 / SP1437) · 全景推演树');
    expect(container.innerHTML).toContain('连通块规模 DFS 与重心定位');
    expect(container.innerHTML).toContain('标记当前重心并递归处理子连通块');
    expect(container.innerHTML).toContain('建立点分树父子边与树高上界确立');
    expect(container.innerHTML).toContain('动态修改向上跳链与路径容斥查询');
  });

  it('应当能正确为 chordal-graph (弦图判定与 MCS · 洛谷 P3199) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('chordal-graph')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('chordal')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('mcs')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('peo')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3199')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'chordal-graph',
    });
    expect(container.innerHTML).toContain('弦图判定与 MCS 最大势算法 (Chordal Graph & MCS · 洛谷 P3199) · 全景推演树');
    expect(container.innerHTML).toContain('MCS 最大势逆序选点');
    expect(container.innerHTML).toContain('候选序列 PEO 闭环与矩阵初始化');
    expect(container.innerHTML).toContain('后继邻居团性质充要检验');
    expect(container.innerHTML).toContain('弦图判定结论与无弦环排查');
  });

  it('应当能正确为 pseudotree-dp (基环树 DP · 洛谷 P1453 / P2607) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('pseudotree-dp')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('pseudotree')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('cycle-with-trees')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P1453')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P2607')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'pseudotree-dp',
    });
    expect(container.innerHTML).toContain('基环树与环套树 DP (Pseudotree DP · 洛谷 P1453 / P2607 骑士) · 全景推演树');
    expect(container.innerHTML).toContain('DFS 寻环与断边锁定');
    expect(container.innerHTML).toContain('外挂子树自底向上 DP 汇聚');
    expect(container.innerHTML).toContain('两次树形 DP 处理互斥边界');
    expect(container.innerHTML).toContain('两方案取最优与全局答案输出');
  });

  it('应当能正确为 min-mean-cycle (最小均值回路 · 洛谷 P2868) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('min-mean-cycle')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('karp')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('min-mean-weight-cycle')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P2868')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('fractional-programming')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'min-mean-cycle',
    });
    expect(container.innerHTML).toContain('最小均值回路与 0-1 分数规划 (Min Mean Cycle · Karp / 洛谷 P2868) · 全景推演树');
    expect(container.innerHTML).toContain('二分猜测与动态边权赋权');
    expect(container.innerHTML).toContain('SPFA 负权回路探测');
    expect(container.innerHTML).toContain('二分上下界收缩转移');
    expect(container.innerHTML).toContain('收敛至零环与极值回路输出');
  });

  it('应当能正确为 tree-centroid-decomposition (静态点分治 · POJ 1741 / 洛谷 P3806) 渲染静态推演树 HTML', () => {
    expect(StaticDeductionTreeAdapter.isSupported('tree-centroid-decomposition')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('static-centroid')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('POJ1741')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('P3806')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tree-divide-and-conquer')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tree-centroid-path-count')).toBe(true);
    expect(StaticDeductionTreeAdapter.isSupported('tree-path-count')).toBe(true);

    const container = { innerHTML: '' } as unknown as HTMLElement;
    StaticDeductionTreeAdapter.renderDeduction(container, {
      modelId: 'tree-centroid-decomposition',
    });
    expect(container.innerHTML).toContain('树分治与静态点分治 (Tree Centroid Decomposition · POJ 1741 / 洛谷 P3806) · 全景推演树');
    expect(container.innerHTML).toContain('DFS 子树规模与重心定位');
    expect(container.innerHTML).toContain('标记隔离当前重心');
    expect(container.innerHTML).toContain('跨重心深度收集与容斥统计');
    expect(container.innerHTML).toContain('子连通块递归分治与全局闭环');
  });
});





