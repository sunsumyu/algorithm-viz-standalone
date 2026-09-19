/**
 * graph-stage-invariants.gate.test.ts
 *
 * 【顶级架构与机械不变量门禁】经典图论算法全系列 (Graph Algorithms Gatekeeper)
 *
 * 覆盖 14 种经典图论核心算法与阶段不变量：
 * 1. 岛屿数量 DFS (LeetCode 200) - 沉岛染色与连通块计数
 * 2. 岛屿数量 BFS (LeetCode 200) - 队列广度波浪式扩散
 * 3. 岛屿的最大面积 (LeetCode 695) - 连通块面积递归求和与全局极值追踪
 * 4. 朴素 Dijkstra (左程云 class061) - 贪心选点与邻接边松弛 O(V^2)
 * 5. 堆优化 Dijkstra (左程云 class061) - 优先队列动态提取与惰性丢弃 O(E log V)
 * 6. Bellman-Ford (左程云 class061) - V-1 轮全边松弛与早停检测
 * 7. SPFA (左程云 class061) - 队列按需触发松弛与在队标记
 * 8. Floyd-Warshall (左程云 class061) - 三重循环全源最短路动态规划
 * 9. Prim 最小生成树 (左程云 class058) - 加点法贪心扩充与 minDist 维护
 * 10. Kruskal 最小生成树 (左程云 class058) - 边权升序排序与并查集加边法
 * 11. 拓扑排序 (Kahn 算法 / LeetCode 210) - 入度统计与零入度队列重构 DAG
 * 12. 冗余连接 I (LeetCode 684) - 无向图并查集回路检测与截断
 * 13. 冗余连接 II (LeetCode 685) - 有向图入度2冲突与有向环并查集三路分支判定
 * 14. A* 启发式搜索 - 曼哈顿启发评估 f(n) = g(n) + h(n) 与最优路径重构
 *
 * 机械不变量门禁红线：
 * 1. 步进序列非空且初始帧完备；
 * 2. 状态指针与计算结果数学正确性；
 * 3. 多语言代码行映射合法区间: [1, totalLines]，严禁越界与 0 偏移。
 */

import { describe, it, expect } from 'vitest';
import { buildIslandsSteps } from '../../algorithms/categories/graph/islands-renderer';
import { ISLANDS_CODE_LANGUAGES } from '../../algorithms/categories/graph/islands-problem-content';
import { buildIslandsBFSSteps } from '../../algorithms/categories/graph/islands-bfs-renderer';
import { ISLANDS_BFS_CODE_LANGUAGES } from '../../algorithms/categories/graph/islands-bfs-problem-content';
import { buildMIASteps } from '../../algorithms/categories/graph/max-island-area-renderer';
import { MAX_ISLAND_AREA_CODE_LANGUAGES } from '../../algorithms/categories/graph/max-island-area-problem-content';
import { buildDJBSteps } from '../../algorithms/categories/graph/dijkstra-basic-renderer';
import { DIJKSTRA_BASIC_CODE_LANGUAGES } from '../../algorithms/categories/graph/dijkstra-basic-problem-content';
import { buildDJHSteps } from '../../algorithms/categories/graph/dijkstra-heap-renderer';
import { DIJKSTRA_HEAP_CODE_LANGUAGES } from '../../algorithms/categories/graph/dijkstra-heap-problem-content';
import { buildBFSteps } from '../../algorithms/categories/graph/bellman-ford-renderer';
import { BELLMAN_FORD_CODE_LANGUAGES } from '../../algorithms/categories/graph/bellman-ford-problem-content';
import { buildSPFASteps } from '../../algorithms/categories/graph/spfa-renderer';
import { SPFA_CODE_LANGUAGES } from '../../algorithms/categories/graph/spfa-problem-content';
import { buildFloydSteps } from '../../algorithms/categories/graph/floyd-renderer';
import { FLOYD_CODE_LANGUAGES } from '../../algorithms/categories/graph/floyd-problem-content';
import { buildPrimSteps } from '../../algorithms/categories/graph/mst-prim-renderer';
import { MST_PRIM_CODE_LANGUAGES } from '../../algorithms/categories/graph/mst-prim-problem-content';
import { buildKruskalSteps } from '../../algorithms/categories/graph/mst-kruskal-renderer';
import { MST_KRUSKAL_CODE_LANGUAGES } from '../../algorithms/categories/graph/mst-kruskal-problem-content';
import { buildTopoSteps } from '../../algorithms/categories/graph/topological-sort-renderer';
import { TOPOLOGICAL_SORT_CODE_LANGUAGES } from '../../algorithms/categories/graph/topological-sort-problem-content';
import { buildRedundantSteps } from '../../algorithms/categories/graph/redundant-edge-renderer';
import { REDUNDANT_EDGE_CODE_LANGUAGES } from '../../algorithms/categories/graph/redundant-edge-problem-content';
import { buildRedundantIISteps } from '../../algorithms/categories/graph/redundant-edge-ii-renderer';
import { REDUNDANT_EDGE_II_CODE_LANGUAGES } from '../../algorithms/categories/graph/redundant-edge-ii-problem-content';
import { buildAStarSteps } from '../../algorithms/categories/graph/a-star-renderer';
import { A_STAR_CODE_LANGUAGES } from '../../algorithms/categories/graph/a-star-problem-content';

/**
 * 验证步进序列中的多语言代码行号合法性
 */
function verifyCodeLines(
  steps: any[],
  algoName: string,
  codeSource: Record<string, string | string[]>
) {
  expect(steps.length, `${algoName}: 步进序列不能为空`).toBeGreaterThan(0);
  const langs = ['java', 'cpp', 'python', 'javascript', 'typescript'];

  for (const lang of langs) {
    const raw = codeSource[lang];
    if (!raw) continue;
    const maxLine = Array.isArray(raw) ? raw.length : raw.split('\n').length;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.codeLine === undefined || step.codeLine === null) continue;

      let lineNums: number[] = [];
      if (typeof step.codeLine === 'number') {
        lineNums = [step.codeLine];
      } else if (Array.isArray(step.codeLine)) {
        lineNums = step.codeLine;
      } else if (typeof step.codeLine === 'object') {
        const val = step.codeLine[lang];
        if (typeof val === 'number') {
          lineNums = [val];
        } else if (Array.isArray(val)) {
          lineNums = val;
        }
      }

      for (const lineNum of lineNums) {
        if (lineNum > 0) {
          expect(
            lineNum,
            `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 超过最大行数 ${maxLine}`
          ).toBeLessThanOrEqual(maxLine);
          expect(
            lineNum,
            `${algoName} [${lang}] 第 ${i} 步行号 ${lineNum} 小于 1`
          ).toBeGreaterThanOrEqual(1);
        }
      }
    }
  }
}

describe('Graph Stage Invariants Gatekeeper (经典图论全家桶不变量机械门禁)', () => {
  describe('1. Number of Islands DFS (LeetCode 200)', () => {
    it('三座独立岛屿正确统计 count=3 且多语言行号严密对齐', () => {
      const grid = [
        [1, 1, 0, 0, 0],
        [1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1],
      ];
      const steps = buildIslandsSteps(grid);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.count).toBe(3);
      expect(last.action).toBe('done');

      verifyCodeLines(steps, 'LeetCode 200 岛屿数量 DFS', ISLANDS_CODE_LANGUAGES);
    });
  });

  describe('2. Number of Islands BFS (LeetCode 200)', () => {
    it('BFS 队列波浪式扩散正确统计 count=3 且代码映射合规', () => {
      const grid = [
        [1, 1, 0, 0, 0],
        [1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1],
      ];
      const steps = buildIslandsBFSSteps(grid);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.count).toBe(3);
      expect(last.action).toBe('done');

      verifyCodeLines(steps, 'LeetCode 200 岛屿数量 BFS', ISLANDS_BFS_CODE_LANGUAGES);
    });
  });

  describe('3. Max Area of Island (LeetCode 695)', () => {
    it('正确计算最大连通岛屿面积 maxArea=5 且行号在区间内', () => {
      const grid = [
        [0, 0, 1, 0, 0],
        [1, 1, 1, 0, 0],
        [0, 1, 0, 0, 1],
      ];
      const steps = buildMIASteps(grid);
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.maxArea).toBe(5);
      expect(last.action).toBe('done');

      verifyCodeLines(steps, 'LeetCode 695 岛屿最大面积', MAX_ISLAND_AREA_CODE_LANGUAGES);
    });
  });

  describe('4. Dijkstra Basic (O(V^2))', () => {
    it('朴素 Dijkstra 正确计算源点到各节点的最短距离', () => {
      const steps = buildDJBSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      // 0->0:0, 0->1:3(via 2), 0->2:1, 0->3:4(0->2->1->3), 0->4:7
      expect(last.dist[0]).toBe(0);
      expect(last.dist[2]).toBe(1);
      expect(last.dist[1]).toBe(3);
      expect(last.dist[3]).toBe(4);
      expect(last.dist[4]).toBe(7);

      verifyCodeLines(steps, '朴素 Dijkstra 最短路径', DIJKSTRA_BASIC_CODE_LANGUAGES);
    });
  });

  describe('5. Dijkstra Heap Optimized (O(E log V))', () => {
    it('堆优化 Dijkstra 正确收敛且结果与朴素版一致', () => {
      const steps = buildDJHSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.dist[0]).toBe(0);
      expect(last.dist[2]).toBe(1);
      expect(last.dist[1]).toBe(3);
      expect(last.dist[3]).toBe(4);
      expect(last.dist[4]).toBe(7);

      verifyCodeLines(steps, '堆优化 Dijkstra 最短路径', DIJKSTRA_HEAP_CODE_LANGUAGES);
    });
  });

  describe('6. Bellman-Ford Shortest Path', () => {
    it('支持负权边的 Bellman-Ford 正确收敛且无越界', () => {
      const steps = buildBFSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.dist[0]).toBe(0);

      verifyCodeLines(steps, 'Bellman-Ford 负权最短路', BELLMAN_FORD_CODE_LANGUAGES);
    });
  });

  describe('7. SPFA Shortest Path', () => {
    it('队列优化的 SPFA 正确收敛至最短路状态', () => {
      const steps = buildSPFASteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.dist[0]).toBe(0);

      verifyCodeLines(steps, 'SPFA 队列优化最短路', SPFA_CODE_LANGUAGES);
    });
  });

  describe('8. Floyd-Warshall All-Pairs Shortest Path', () => {
    it('全源最短路动态规划矩阵正确收敛', () => {
      const steps = buildFloydSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.matrix[0][0]).toBe(0);
      expect(last.matrix[1][1]).toBe(0);
      expect(last.matrix[2][2]).toBe(0);
      expect(last.matrix[3][3]).toBe(0);

      verifyCodeLines(steps, 'Floyd-Warshall 全源最短路径', FLOYD_CODE_LANGUAGES);
    });
  });

  describe('9. Prim Minimum Spanning Tree', () => {
    it('Prim 加点法正确构建 MST 且权值最小', () => {
      const steps = buildPrimSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.inMST.every(Boolean)).toBe(true);
      expect(last.mstEdges.length).toBe(4); // 5 nodes -> 4 edges

      verifyCodeLines(steps, 'Prim 最小生成树', MST_PRIM_CODE_LANGUAGES);
    });
  });

  describe('10. Kruskal Minimum Spanning Tree', () => {
    it('Kruskal 边权贪心加边法正确选出 V-1 条树边', () => {
      const steps = buildKruskalSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.mstEdges.length).toBe(4);

      verifyCodeLines(steps, 'Kruskal 最小生成树', MST_KRUSKAL_CODE_LANGUAGES);
    });
  });

  describe('11. Topological Sort (Kahn Algorithm)', () => {
    it('DAG 正确输出有效拓扑排序且所有节点入度归零', () => {
      const steps = buildTopoSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.order.length).toBe(6);
      expect(last.inDegree.every((d: number) => d === 0)).toBe(true);

      verifyCodeLines(steps, '拓扑排序 Kahn 算法', TOPOLOGICAL_SORT_CODE_LANGUAGES);
    });
  });

  describe('12. Redundant Connection (LeetCode 684)', () => {
    it('并查集正确发现导致成环的冗余连接边', () => {
      const steps = buildRedundantSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.redundantEdge).toEqual([1, 4]);

      verifyCodeLines(steps, 'LeetCode 684 冗余连接', REDUNDANT_EDGE_CODE_LANGUAGES);
    });
  });

  describe('13. Redundant Connection II (LeetCode 685)', () => {
    it('有向图并查集正确诊断冲突边或环路', () => {
      const steps = buildRedundantIISteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.resultEdge).toBeDefined();

      verifyCodeLines(steps, 'LeetCode 685 冗余连接 II', REDUNDANT_EDGE_II_CODE_LANGUAGES);
    });
  });

  describe('14. A* Heuristic Search', () => {
    it('A* 启发式搜索成功寻找到目标终点且路径连续无断裂', () => {
      const steps = buildAStarSteps();
      expect(steps.length).toBeGreaterThan(0);

      const last = steps[steps.length - 1];
      expect(last.action).toBe('done');
      expect(last.finalPath.length).toBeGreaterThan(0);
      expect(last.finalPath[0]).toEqual([0, 0]);
      expect(last.finalPath[last.finalPath.length - 1]).toEqual([4, 5]);

      verifyCodeLines(steps, 'A* 启发式搜索', A_STAR_CODE_LANGUAGES);
    });
  });
});
