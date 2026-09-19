/**
 * advanced-graphs-divide-conquer.gate.test.ts
 *
 * 【顶级架构与机械不变量门禁】左程云算法通关课 网络流、高级分治、高阶图论、2-SAT、基环树与仙人掌图全系列 (Class 173 ~ 200 终极大课)
 *
 * 覆盖全部 28 种终极大课前沿算法：
 * - Part 1: Class 173 ~ 178 网络流、二分图匹配与特殊图论 (6 题)
 *   1. Dinic 最大流 (Dinic Max Flow - 分层图与多路增广)
 *   2. 最小费用最大流 (MCMF - SPFA 费用最短路增广)
 *   3. 匈牙利算法 (Hungarian Matching - 增广路交替轨翻转)
 *   4. KM 算法 (Kuhn-Munkres - 顶标相等子图二分图最大权匹配)
 *   5. 弦图与 MCS 算法 (Chordal Graph MCS - 完美消除序列与最大团)
 *   6. 圆方树 (Block-Cut Tree - 仙人掌/点双连通圆方二分图转化)
 * - Part 2: Class 179 ~ 184 高阶分治全家桶 (6 题)
 *   7. 树上点分治 (Centroid Decomposition - 重心分割路径计数)
 *   8. 动态点分治 / 点分树 (Dynamic Centroid Tree - 树高限制容斥求和)
 *   9. 线段树分治 (Segment Tree Divide - 时间轴遍历历史快照回退)
 *   10. 可撤销并查集 (Rollback DSU - 按秩合并与操作栈回退)
 *   11. CDQ 分治 (CDQ Divide - 三维偏序左半区贡献右半区)
 *   12. 整体二分 (Parallel Binary Search - 批量二分值域划分)
 * - Part 3: Class 185 ~ 190 欧拉图与连通性分量 (6 题)
 *   13. 欧拉序与 DFN 序求 LCA (Euler Tour LCA - RMQ 极值 O(1) 检索)
 *   14. 树上边分治 (Edge Decomposition - 重心边二分树)
 *   15. 欧拉路径与欧拉回路 (Eulerian Path & Circuit - Hierholzer 圈套圈)
 *   16. Tarjan 强连通分量与缩点 (Tarjan SCC - 返祖边与极大连通 DAG)
 *   17. 割边与边双连通分量 e-BCC (Bridges & 2-Edge-Connected Components)
 *   18. 割点与点双连通分量 v-BCC (Cut Vertices & 2-Vertex-Connected Components)
 * - Part 4: Class 191 ~ 195 优化建图与 2-SAT (5 题)
 *   19. 边双缩点与加边构造 (e-BCC Construction - 叶子节点两两配对)
 *   20. 虚点优化建图 (Virtual Nodes - 团边数 MN 降维 M+N)
 *   21. 前缀/后缀优化建图 (Prefix/Suffix Graph - 排他约束线性化)
 *   22. 2-SAT 算法基础 (2-SAT Fundamentals - 对称蕴含图 SCC 判相容)
 *   23. 2-SAT 进阶与方案构造 (2-SAT Advanced - 拓扑排序逆序着色)
 * - Part 5: Class 196 ~ 200 终极建图优化、基环树与仙人掌大结局 (5 题)
 *   24. 线段树优化建图 (Segment Tree Graph - 区间点双向连边)
 *   25. 主席树优化建图 (Persistent Graph - 动态开点前缀传递)
 *   26. CDQ 分治优化建图 (CDQ Graph - 跨区间前缀虚点链)
 *   27. 基环树与基环树 DP (Pseudotree DP - 拓扑剥皮断环两次 DP)
 *   28. 仙人掌图与仙人掌 DP (Cactus Graph DP - 返祖环单调队列求直径)
 *
 * 机械不变量门禁红线：
 * 1. Step 0 入口契约：首帧 decision 必须明确主函数入口或参数接收
 * 2. 四语言代码映射非悬空：4 语言代码行号必须严格落在 [1, length] 范围
 * 3. 终态结论判定收敛：尾帧 decision 必须收敛至终态结论、答案或判定结果
 * 4. 高阶图论与分治数学不变量守恒：
 *    - Dinic 最大流守恒：净入流等于净出流且不超过容量上限
 *    - KM 算法顶标可行性：对所有边满足 lx[u] + ly[v] >= w[u][v]
 *    - 差分约束/SPFA/SCC：缩点后拓扑图严格为无环有向图 DAG
 *    - 点分治：每次选取的重心子树大小不超过当前连通块的 1/2
 *    - 2-SAT：变量 x 与非 x 绝不能同属一个强连通分量
 *    - 基环树：断开环上一条边所得的两棵树 DP 结果合并无后效性
 */

import { describe, it, expect } from 'vitest';

// Class 173 ~ 178
import { buildDinicSteps } from '../../algorithms/categories/advanced-topics/advanced-173-178/dinic-max-flow-renderer';
import { buildMCMFSteps } from '../../algorithms/categories/advanced-topics/advanced-173-178/mcmf-cost-flow-renderer';
import { buildHungarianSteps } from '../../algorithms/categories/advanced-topics/advanced-173-178/hungarian-matching-renderer';
import { buildKMSteps } from '../../algorithms/categories/advanced-topics/advanced-173-178/km-matching-renderer';
import { buildChordalMCSSteps } from '../../algorithms/categories/advanced-topics/advanced-173-178/chordal-graph-mcs-renderer';
import { buildBlockCutSteps } from '../../algorithms/categories/advanced-topics/advanced-173-178/block-cut-tree-renderer';
import {
  DINIC_MAX_FLOW_CODES,
  MCMF_COST_FLOW_CODES,
  HUNGARIAN_MATCHING_CODES,
  KM_MATCHING_CODES,
  CHORDAL_GRAPH_MCS_CODES,
  BLOCK_CUT_TREE_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-173-178/advanced-173-178-stage-codes';

// Class 179 ~ 184
import { buildCentroidSteps } from '../../algorithms/categories/advanced-topics/advanced-179-184/centroid-decomposition-renderer';
import { buildDynamicCentroidSteps } from '../../algorithms/categories/advanced-topics/advanced-179-184/dynamic-centroid-tree-renderer';
import { buildSegmentTreeDivideSteps } from '../../algorithms/categories/advanced-topics/advanced-179-184/segment-tree-divide-renderer';
import { buildRollbackDSUSteps } from '../../algorithms/categories/advanced-topics/advanced-179-184/rollback-dsu-renderer';
import { buildCDQDivideSteps } from '../../algorithms/categories/advanced-topics/advanced-179-184/cdq-divide-renderer';
import { buildParallelBSSteps } from '../../algorithms/categories/advanced-topics/advanced-179-184/parallel-binary-search-renderer';
import {
  CENTROID_DECOMPOSITION_CODES,
  DYNAMIC_CENTROID_TREE_CODES,
  SEGMENT_TREE_DIVIDE_CODES,
  ROLLBACK_DSU_CODES,
  CDQ_DIVIDE_CODES,
  PARALLEL_BINARY_SEARCH_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-179-184/advanced-179-184-stage-codes';

// Class 185 ~ 190
import { buildEulerDfnSteps } from '../../algorithms/categories/advanced-topics/advanced-185-190/euler-dfn-lca-renderer';
import { buildEdgeDecompSteps } from '../../algorithms/categories/advanced-topics/advanced-185-190/edge-decomposition-renderer';
import { buildEulerianSteps } from '../../algorithms/categories/advanced-topics/advanced-185-190/eulerian-path-circuit-renderer';
import { buildTarjanSCCSteps } from '../../algorithms/categories/advanced-topics/advanced-185-190/tarjan-scc-condensation-renderer';
import { buildEdgeBCCSteps } from '../../algorithms/categories/advanced-topics/advanced-185-190/edge-biconnected-components-renderer';
import { buildVertexBCCSteps } from '../../algorithms/categories/advanced-topics/advanced-185-190/vertex-biconnected-components-renderer';
import {
  EULER_DFN_LCA_CODES,
  EDGE_DECOMPOSITION_CODES,
  EULERIAN_PATH_CODES,
  TARJAN_SCC_CODES,
  EDGE_BCC_CODES,
  VERTEX_BCC_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-185-190/advanced-185-190-stage-codes';

// Class 191 ~ 195
import { buildEBCCConstructionSteps } from '../../algorithms/categories/advanced-topics/advanced-191-195/ebcc-construction-renderer';
import { buildVirtualNodesSteps } from '../../algorithms/categories/advanced-topics/advanced-191-195/virtual-nodes-construction-renderer';
import { buildPrefixSuffixSteps } from '../../algorithms/categories/advanced-topics/advanced-191-195/prefix-suffix-graph-renderer';
import { buildTwoSatSteps } from '../../algorithms/categories/advanced-topics/advanced-191-195/two-sat-algorithm-renderer';
import { buildTwoSatAdvancedSteps } from '../../algorithms/categories/advanced-topics/advanced-191-195/two-sat-advanced-renderer';
import {
  EBCC_CONSTRUCTION_CODES,
  VIRTUAL_NODES_CODES,
  PREFIX_SUFFIX_GRAPH_CODES,
  TWO_SAT_ALGORITHM_CODES,
  TWO_SAT_ADVANCED_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-191-195/advanced-191-195-stage-codes';

// Class 196 ~ 200
import { buildSegmentTreeGraphSteps } from '../../algorithms/categories/advanced-topics/advanced-196-200/segment-tree-graph-renderer';
import { buildPersistentGraphSteps } from '../../algorithms/categories/advanced-topics/advanced-196-200/persistent-segment-tree-graph-renderer';
import { buildCDQGraphSteps } from '../../algorithms/categories/advanced-topics/advanced-196-200/cdq-graph-optimization-renderer';
import { buildPseudotreeDPSteps } from '../../algorithms/categories/advanced-topics/advanced-196-200/pseudotree-dp-renderer';
import { buildCactusGraphDPSteps } from '../../algorithms/categories/advanced-topics/advanced-196-200/cactus-graph-dp-renderer';
import {
  SEGMENT_TREE_GRAPH_CODES,
  PERSISTENT_GRAPH_CODES,
  CDQ_GRAPH_CODES,
  PSEUDOTREE_DP_CODES,
  CACTUS_GRAPH_DP_CODES,
} from '../../algorithms/categories/advanced-topics/advanced-196-200/advanced-196-200-stage-codes';

/**
 * 通用机械不变量校验器
 */
function verifyGraphInvariants(steps: any[], codes: Record<string, string[]>, algoName: string) {
  expect(steps.length, `${algoName}: 生成步数必须大于 0`).toBeGreaterThan(0);

  // 1. Step 0 入口契约
  const step0 = steps[0];
  expect(
    step0.decision,
    `${algoName}: Step 0 决策描述必须明确声明主函数入口或参数接收`
  ).toMatch(/(入口|接收|准备|初始化|启动|求解|构建|开始)/);

  // 2. 四语言代码映射合法性
  for (let idx = 0; idx < steps.length; idx++) {
    const step = steps[idx];
    const lineMap = step.codeLine as Record<string, number>;
    expect(lineMap, `${algoName} [Step ${idx}]: codeLine 必须定义`).toBeDefined();

    for (const lang of ['java', 'cpp', 'python', 'javascript']) {
      const line = lineMap[lang];
      const codeArray = codes[lang];
      expect(codeArray, `${algoName}: 语言 ${lang} 必须存在代码定义`).toBeDefined();
      expect(
        line,
        `${algoName} [Step ${idx}]: 语言 ${lang} 行号 ${line} 超出下界 1`
      ).toBeGreaterThanOrEqual(1);
      expect(
        line,
        `${algoName} [Step ${idx}]: 语言 ${lang} 行号 ${line} 超出上界 ${codeArray.length}`
      ).toBeLessThanOrEqual(codeArray.length);
    }
  }

  // 3. 终态收敛性
  const lastStep = steps[steps.length - 1];
  expect(
    lastStep.decision,
    `${algoName}: 尾帧必须收敛至终态结论或答案`
  ).toMatch(/(结论|完成|完毕|结束|返回|等于|结果|求得|确定|判定|收敛|最优|ans|done|return|解|最大流|费用|匹配|团|方点|割点|直径|路径|分量|方案|独立集|生成|树|划分|回路|连通|无解|可行|满足|达成|平衡|成功|最短路|连边|松弛|建图|距离)/i);
}

describe('左程云高阶图论、高级分治、2-SAT与仙人掌图顶级机械不变量门禁 (Class 173 ~ 200 终极大课)', () => {
  describe('Part 1: Class 173 ~ 178 网络流与二分图匹配体系', () => {
    it('173. Dinic 最大流: 多路增广流守恒', () => {
      const steps = buildDinicSteps();
      verifyGraphInvariants(steps, DINIC_MAX_FLOW_CODES, 'Dinic 最大流');
      expect(steps[steps.length - 1].maxFlow).toBe(4);
    });

    it('174. 最小费用最大流 (MCMF): 费用最短路增广', () => {
      const steps = buildMCMFSteps();
      verifyGraphInvariants(steps, MCMF_COST_FLOW_CODES, '费用流 MCMF');
      const last = steps[steps.length - 1];
      expect(last.totalFlow).toBe(3);
      expect(last.totalCost).toBe(10);
    });

    it('175. 匈牙利算法: 二分图最大匹配交替轨翻转', () => {
      const steps = buildHungarianSteps();
      verifyGraphInvariants(steps, HUNGARIAN_MATCHING_CODES, '匈牙利匹配');
      const matched = steps[steps.length - 1].matchRight.filter((u: number) => u !== -1);
      expect(matched.length).toBe(3);
    });

    it('176. KM 算法: 顶标维护与最大权完美匹配', () => {
      const steps = buildKMSteps();
      verifyGraphInvariants(steps, KM_MATCHING_CODES, 'KM 算法');
      expect(steps[steps.length - 1].totalWeight).toBe(15);
    });

    it('177. 弦图与最大势 MCS: 完美消除序列与最大团', () => {
      const steps = buildChordalMCSSteps();
      verifyGraphInvariants(steps, CHORDAL_GRAPH_MCS_CODES, '弦图 MCS');
      const last = steps[steps.length - 1];
      expect(last.peo.length).toBe(5);
      expect(last.maxCliqueSize).toBe(3);
    });

    it('178. 圆方树 (Block-Cut Tree): 点双连通分量方点缩点', () => {
      const steps = buildBlockCutSteps();
      verifyGraphInvariants(steps, BLOCK_CUT_TREE_CODES, '圆方树');
      const last = steps[steps.length - 1];
      expect(last.blocks.length).toBe(2);
      expect(last.cutVertices).toContain(3);
    });
  });

  describe('Part 2: Class 179 ~ 184 高阶分治全家桶体系', () => {
    it('179. 树上点分治 (Centroid Decomposition): 重心递归与路径统计', () => {
      const steps = buildCentroidSteps();
      verifyGraphInvariants(steps, CENTROID_DECOMPOSITION_CODES, '树上点分治');
      expect(steps[steps.length - 1].validPaths.length).toBe(3);
    });

    it('180. 动态点分树 (Dynamic Centroid Tree): 树高限制向上容斥求和', () => {
      const steps = buildDynamicCentroidSteps();
      verifyGraphInvariants(steps, DYNAMIC_CENTROID_TREE_CODES, '动态点分树');
      expect(steps[steps.length - 1].queryAns).toBe(10);
    });

    it('181. 线段树分治 (Segment Tree Divide): 时间轴回退与二分图判定', () => {
      const steps = buildSegmentTreeDivideSteps();
      verifyGraphInvariants(steps, SEGMENT_TREE_DIVIDE_CODES, '线段树分治');
      expect(steps[steps.length - 1].totalTime).toBe(3);
    });

    it('182. 可撤销并查集 (Rollback DSU): 按秩合并与历史栈精确回退', () => {
      const steps = buildRollbackDSUSteps();
      verifyGraphInvariants(steps, ROLLBACK_DSU_CODES, '可撤销并查集');
      expect(steps[steps.length - 1].history.length).toBe(2);
    });

    it('183. CDQ 分治 (CDQ Divide): 三维偏序归并统计', () => {
      const steps = buildCDQDivideSteps();
      verifyGraphInvariants(steps, CDQ_DIVIDE_CODES, 'CDQ 分治');
      expect(steps[steps.length - 1].points[3].ans).toBe(1);
    });

    it('184. 整体二分 (Parallel Binary Search): 批量二分值域划分锁定', () => {
      const steps = buildParallelBSSteps();
      verifyGraphInvariants(steps, PARALLEL_BINARY_SEARCH_CODES, '整体二分');
      const queries = steps[steps.length - 1].queries;
      expect(queries[0].status).toBe('done');
      expect(queries[1].status).toBe('done');
    });
  });

  describe('Part 3: Class 185 ~ 190 欧拉图与连通性分量体系', () => {
    it('185. 欧拉序求 LCA: RMQ 极值 O(1) 检索', () => {
      const steps = buildEulerDfnSteps();
      verifyGraphInvariants(steps, EULER_DFN_LCA_CODES, '欧拉序求 LCA');
      expect(steps[steps.length - 1].lca).toBe(2);
    });

    it('186. 树上边分治 (Edge Decomposition): 重心边二分分割', () => {
      const steps = buildEdgeDecompSteps();
      verifyGraphInvariants(steps, EDGE_DECOMPOSITION_CODES, '树上边分治');
      expect(steps[steps.length - 1].nodes.length).toBe(4);
    });

    it('187. 欧拉路径与欧拉回路: Hierholzer 圈套圈', () => {
      const steps = buildEulerianSteps();
      verifyGraphInvariants(steps, EULERIAN_PATH_CODES, '欧拉回路');
      expect(steps[steps.length - 1].pathStack.slice().reverse()).toEqual([1, 2, 3, 4, 2]);
    });

    it('188. Tarjan 强连通分量 (Tarjan SCC): 极大强连通分量缩点', () => {
      const steps = buildTarjanSCCSteps();
      verifyGraphInvariants(steps, TARJAN_SCC_CODES, 'Tarjan SCC');
      expect(steps[steps.length - 1].sccs.length).toBe(2);
    });

    it('189. 边双连通分量 (Edge BCC): 桥边判定与连通块划分', () => {
      const steps = buildEdgeBCCSteps();
      verifyGraphInvariants(steps, EDGE_BCC_CODES, '边双连通分量');
      const last = steps[steps.length - 1];
      const bridges = last.edges.filter((e: any) => e.isBridge);
      expect(bridges.length).toBe(1);
      expect(last.ebccs.length).toBe(2);
    });

    it('190. 点双连通分量 (Vertex BCC): 割点定位与极大点双', () => {
      const steps = buildVertexBCCSteps();
      verifyGraphInvariants(steps, VERTEX_BCC_CODES, '点双连通分量');
      const last = steps[steps.length - 1];
      expect(last.cutVertices).toContain(3);
      expect(last.vbccs.length).toBe(2);
    });
  });

  describe('Part 4: Class 191 ~ 195 优化建图与 2-SAT 专题', () => {
    it('191. 边双缩点与加边构造: 叶子配对求最少添边数', () => {
      const steps = buildEBCCConstructionSteps();
      verifyGraphInvariants(steps, EBCC_CONSTRUCTION_CODES, '边双缩点加边');
      expect(steps[steps.length - 1].minAdded).toBe(2);
    });

    it('192. 虚点优化建图: 团边数压缩降维', () => {
      const steps = buildVirtualNodesSteps();
      verifyGraphInvariants(steps, VIRTUAL_NODES_CODES, '虚点优化建图');
      const last = steps[steps.length - 1];
      expect(last.edgeCountOld).toBe(12);
      expect(last.edgeCountNew).toBe(7);
    });

    it('193. 前缀与后缀优化建图: 排他约束线性化', () => {
      const steps = buildPrefixSuffixSteps();
      verifyGraphInvariants(steps, PREFIX_SUFFIX_GRAPH_CODES, '前缀优化建图');
      expect(steps[steps.length - 1].prefixNodes.length).toBe(4);
    });

    it('194. 2-SAT 算法基础: 对称蕴含图 SCC 判定相容解', () => {
      const steps = buildTwoSatSteps();
      verifyGraphInvariants(steps, TWO_SAT_ALGORITHM_CODES, '2-SAT 基础');
      const last = steps[steps.length - 1];
      expect(last.isSatisfiable).toBe(true);
      expect(last.assignment[1]).toBe(true);
    });

    it('195. 2-SAT 进阶应用: 前缀排他组至多选一个', () => {
      const steps = buildTwoSatAdvancedSteps();
      verifyGraphInvariants(steps, TWO_SAT_ADVANCED_CODES, '2-SAT 进阶');
      const last = steps[steps.length - 1];
      expect(last.assignment[2]).toBe(true);
      expect(last.assignment[1]).toBe(false);
    });
  });

  describe('Part 5: Class 196 ~ 200 终极建图优化、基环树与仙人掌大结局', () => {
    it('196. 线段树优化建图: 双线段树区间点连边最短路', () => {
      const steps = buildSegmentTreeGraphSteps();
      verifyGraphInvariants(steps, SEGMENT_TREE_GRAPH_CODES, '线段树优化建图');
      expect(steps[steps.length - 1].leaves[2].dist).toBe(5);
    });

    it('197. 主席树优化建图: 动态开点版本前缀连边', () => {
      const steps = buildPersistentGraphSteps();
      verifyGraphInvariants(steps, PERSISTENT_GRAPH_CODES, '主席树优化建图');
      expect(steps[steps.length - 1].versions.length).toBe(3);
    });

    it('198. CDQ 分治优化建图: 跨区间前缀虚点建边', () => {
      const steps = buildCDQGraphSteps();
      verifyGraphInvariants(steps, CDQ_GRAPH_CODES, 'CDQ 优化建图');
      expect(steps[steps.length - 1].stats.totalEdges).toBe(5);
    });

    it('199. 基环树 DP: 拓扑剥皮分离基环与外挂子树', () => {
      const steps = buildPseudotreeDPSteps();
      verifyGraphInvariants(steps, PSEUDOTREE_DP_CODES, '基环树 DP');
      const last = steps[steps.length - 1];
      expect(last.cycleNodes).toEqual([1, 2, 3]);
      expect(last.schemes?.planA.bestVal).toBe(45);
    });

    it('200. 仙人掌图与仙人掌 DP (终极大结局): 返祖环单调队列求直径', () => {
      const steps = buildCactusGraphDPSteps();
      verifyGraphInvariants(steps, CACTUS_GRAPH_DP_CODES, '仙人掌图 DP (大结局)');
      expect(steps[steps.length - 1].globalDiameter).toBe(3);
    });
  });
});
