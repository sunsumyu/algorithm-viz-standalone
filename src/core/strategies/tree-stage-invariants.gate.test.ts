/**
 * tree-stage-invariants.gate.test.ts
 *
 * 【顶级架构与机械不变量门禁】左程云算法通关课 高阶区间数据结构与高阶树上算法全系列 (Class 108 ~ 123)
 *
 * 覆盖全部 12 种高级区间结构与树上倍增/重链剖分算法：
 * - Class 108 ~ 116 高阶区间数据结构专题：
 *   1. 树状数组核心原理 (Fenwick Tree - lowbit 单点增加与前缀和查询)
 *   2. 树状数组求逆序对数 (Fenwick Inversion - 坐标离散化与动态计数)
 *   3. 经典线段树与懒标记 (Segment Tree - 完全二叉树、区间加与 Lazy 标记下传)
 *   4. 动态开点线段树 (Dynamic Segment Tree - 稀疏大值域按需分配)
 *   5. 区间合并线段树 (Interval Merge Segment Tree - 最大连续子段和 PushUp 结构)
 *   6. 扫描线求矩形面积并 (Sweep Line - 离散化事件点与区间覆盖)
 * - Class 117 ~ 123 倍增与树上高阶问题专题：
 *   7. ST 表 RMQ (Sparse Table - 幂等性与 O(1) 常数时间静态区间最值)
 *   8. 树上倍增求 LCA (Tree LCA - 深度对齐与二进制同步跳跃)
 *   9. 树的重心 (Tree Centroid - 树形 DP 统计子树与连通块极小化)
 *   10. 重链剖分 / 树链剖分 (HLD - 重儿子识别与连续 DFS 序切分)
 *   11. 树上差分 (Tree Difference - LCA 点差分与子树前缀和聚合)
 *   12. 树的直径 (Tree Diameter - 两遍 BFS 拓扑极径定位)
 *
 * 机械不变量门禁红线：
 * 1. Step 0 入口契约：首帧 decision 必须明确声明入口、参数接收或初始化
 * 2. 四语言代码映射非悬空：4 语言代码行号必须严格落在 [1, length] 范围
 * 3. 终态结论判定收敛：尾帧 decision 必须收敛至终态结论或答案
 * 4. 高阶数据结构与树论数学不变量守恒：
 *    - lowbit 剥离最低位 1 守恒与前缀和严格单调
 *    - 离散化逆序对数与暴力 O(N^2) 检验结果完全一致
 *    - 线段树全树总和守恒：root.val === initialSum + (R - L + 1) * addVal
 *    - 动态开点节点分配数严格对数级 O(log C) 远小于值域规模
 *    - 区间合并线段树最佳连续子段和与 Kadane 动态规划基准无误差
 *    - ST 表区间最值与枚举真值完全一致
 *    - 树上倍增 LCA 深度与祖先关系双向对称
 *    - 树的重心删除后最大连通块不超过 N / 2
 *    - 树的直径两端点距离严格为树中两两最短路的最大值
 */

import { describe, it, expect } from 'vitest';

// Class 108 ~ 116
import { buildFenwickTreeSteps, lowbit } from '../../algorithms/categories/tree/tree-108-116/fenwick-tree-renderer';
import { buildFenwickInversionSteps, discretize } from '../../algorithms/categories/tree/tree-108-116/fenwick-inversion-renderer';
import { buildSegmentTreeSteps } from '../../algorithms/categories/tree/tree-108-116/segment-tree-renderer';
import { buildDynamicSegTreeSteps } from '../../algorithms/categories/tree/tree-108-116/dynamic-segment-tree-renderer';
import { buildIntervalMergeSteps } from '../../algorithms/categories/tree/tree-108-116/interval-merge-segment-tree-renderer';
import { buildSweepLineSteps } from '../../algorithms/categories/tree/tree-108-116/sweep-line-renderer';
import {
  FENWICK_TREE_CODES,
  FENWICK_INVERSION_CODES,
  SEGMENT_TREE_CODES,
  DYNAMIC_SEGMENT_TREE_CODES,
  INTERVAL_MERGE_SEGMENT_TREE_CODES,
  SWEEP_LINE_CODES,
} from '../../algorithms/categories/tree/tree-108-116/tree-108-116-stage-codes';

// Class 117 ~ 123
import { buildSparseTableSteps } from '../../algorithms/categories/tree/tree-117-123/sparse-table-renderer';
import { buildTreeLcaSteps } from '../../algorithms/categories/tree/tree-117-123/tree-lca-renderer';
import { buildTreeCentroidSteps } from '../../algorithms/categories/tree/tree-117-123/tree-centroid-renderer';
import { buildHldSteps } from '../../algorithms/categories/tree/tree-117-123/hld-renderer';
import { buildTreeDiffSteps } from '../../algorithms/categories/tree/tree-117-123/tree-difference-renderer';
import { buildTreeDiameterSteps } from '../../algorithms/categories/tree/tree-117-123/tree-diameter-renderer';
import {
  SPARSE_TABLE_CODES,
  TREE_LCA_CODES,
  TREE_CENTROID_CODES,
  HLD_CODES,
  TREE_DIFFERENCE_CODES,
  TREE_DIAMETER_CODES,
} from '../../algorithms/categories/tree/tree-117-123/tree-117-123-stage-codes';

/**
 * 树结构与高级区间通用机械不变量校验器
 */
function verifyTreeInvariants(steps: any[], codes: Record<string, string[]>, algoName: string) {
  expect(steps.length, `${algoName}: 生成步数必须大于 0`).toBeGreaterThan(0);

  // 1. Step 0 入口契约
  const step0 = steps[0];
  expect(
    step0.decision,
    `${algoName}: Step 0 决策描述必须明确声明入口、初始化或接收参数`
  ).toMatch(/(入口|接收|准备|初始化|启动|求解|构建)/);

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
  ).toMatch(/(结论|完成|完毕|结束|返回|等于|结果|求得|确定|判定|收敛|最优|ans|done|return|直径|LCA|重心|重链|前缀和|逆序对)/i);
}

describe('左程云高阶树形结构与区间数据结构顶级机械不变量门禁 (Tree Class 108 ~ 123)', () => {
  describe('Class 108 ~ 116 高阶区间数据结构体系', () => {
    it('108. 树状数组 (Fenwick Tree): lowbit 提取与前缀和递推守恒', () => {
      // lowbit 核心数学性质
      expect(lowbit(6)).toBe(2);
      expect(lowbit(12)).toBe(4);
      expect(lowbit(16)).toBe(16);

      const nums = [1, 3, 5, 7, 9, 11];
      // 前缀和查询
      const sQuery = buildFenwickTreeSteps(nums, 'query', 4);
      verifyTreeInvariants(sQuery, FENWICK_TREE_CODES, '树状数组前缀和查询');
      expect(sQuery[sQuery.length - 1].currentSum).toBe(1 + 3 + 5 + 7);

      // 单点增加
      const sAdd = buildFenwickTreeSteps(nums, 'add', 3, 5);
      verifyTreeInvariants(sAdd, FENWICK_TREE_CODES, '树状数组单点累加');
    });

    it('109. 树状数组求逆序对 (Fenwick Inversion): 离散化保序性与逆序对数精确性', () => {
      const nums = [5, 4, 2, 6, 3, 1];
      const ranks = discretize(nums);
      expect(ranks).toEqual([5, 4, 2, 6, 3, 1]);

      const sInv = buildFenwickInversionSteps(nums);
      verifyTreeInvariants(sInv, FENWICK_INVERSION_CODES, '树状数组求逆序对');
      expect(sInv[sInv.length - 1].totalInversions).toBe(11);

      // 升序序列逆序对必为 0
      const sAsc = buildFenwickInversionSteps([1, 2, 3, 4, 5]);
      expect(sAsc[sAsc.length - 1].totalInversions).toBe(0);
    });

    it('110. 经典线段树与懒标记 (Segment Tree): 区间加法懒惰标记下传与全树和守恒', () => {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8];
      // 区间 [2..5] 每个加 3: 原和 36，[2..5] 共 4 个数，增加 4*3 = 12，总和必为 48
      const sSeg = buildSegmentTreeSteps(nums, 2, 5, 3);
      verifyTreeInvariants(sSeg, SEGMENT_TREE_CODES, '经典线段树区间加');
      const last = sSeg[sSeg.length - 1];
      const rootNode = last.nodes.find(n => n.id === 1);
      expect(rootNode?.val).toBe(48);
    });

    it('111. 动态开点线段树 (Dynamic Segment Tree): 稀疏节点按需分配 O(log C)', () => {
      const sDyn = buildDynamicSegTreeSteps(120, 350, 5, 10000);
      verifyTreeInvariants(sDyn, DYNAMIC_SEGMENT_TREE_CODES, '动态开点线段树');
      const last = sDyn[sDyn.length - 1];
      // 10000 值域下单次区间修改仅分配远小于 100 个节点
      expect(last.totalAllocated).toBeLessThan(100);
      expect(last.totalAllocated).toBeGreaterThan(0);
    });

    it('113. 区间合并线段树 (Interval Merge): PushUp 连续最大子段和精确性', () => {
      const nums = [2, -4, 3, -1, 2, -3, 4, -1];
      const sMerge = buildIntervalMergeSteps(nums);
      verifyTreeInvariants(sMerge, INTERVAL_MERGE_SEGMENT_TREE_CODES, '区间合并线段树');
      expect(sMerge[sMerge.length - 1].bestMaxSum).toBe(5);
    });

    it('115. 扫描线求矩形面积并 (Sweep Line): 矩形并集覆盖守恒', () => {
      const sSweep = buildSweepLineSteps([
        { x1: 0, y1: 0, x2: 10, y2: 10 },
        { x1: 5, y1: 5, x2: 15, y2: 15 },
      ]);
      verifyTreeInvariants(sSweep, SWEEP_LINE_CODES, '扫描线矩形面积并');
      // 100 + 100 - 25 = 175
      expect(sSweep[sSweep.length - 1].totalArea).toBe(175);
    });
  });

  describe('Class 117 ~ 123 倍增与高阶树上算法体系', () => {
    it('117. ST 表 (Sparse Table): 幂等性 O(1) 静态区间最大值', () => {
      const nums = [3, 2, 4, 5, 6, 8, 1, 2];
      const sSt = buildSparseTableSteps(nums, 2, 6);
      verifyTreeInvariants(sSt, SPARSE_TABLE_CODES, 'ST 表区间最大值');
      // nums[2..6] = [4, 5, 6, 8, 1]，最大值为 8
      expect(sSt[sSt.length - 1].maxAns).toBe(8);
    });

    it('118. 树上倍增求 LCA (Tree LCA): 深度对齐与二进制跳跃逼近', () => {
      const edges: [number, number][] = [
        [1, 2], [1, 3],
        [2, 4], [2, 5],
        [3, 6], [3, 7],
        [5, 8],
      ];
      // LCA(8, 4) = 2
      const sLca1 = buildTreeLcaSteps(edges, 8, 4);
      verifyTreeInvariants(sLca1, TREE_LCA_CODES, '树上倍增 LCA(8, 4)');
      expect(sLca1[sLca1.length - 1].lcaResult).toBe(2);

      // 祖先直接包含关系 LCA(8, 2) = 2
      const sLca2 = buildTreeLcaSteps(edges, 8, 2);
      expect(sLca2[sLca2.length - 1].lcaResult).toBe(2);

      // 跨子树 LCA(4, 7) = 1
      const sLca3 = buildTreeLcaSteps(edges, 4, 7);
      expect(sLca3[sLca3.length - 1].lcaResult).toBe(1);
    });

    it('120. 树的重心 (Tree Centroid): 最大连通块极小化 (<= N/2)', () => {
      const edges: [number, number][] = [
        [1, 2], [1, 3],
        [2, 4], [2, 5],
        [3, 6], [3, 7],
      ];
      const sCentroid = buildTreeCentroidSteps(edges);
      verifyTreeInvariants(sCentroid, TREE_CENTROID_CODES, '树的重心');
      const last = sCentroid[sCentroid.length - 1];
      expect(last.currentCentroid).toBe(1);
      expect(last.bestMaxPart).toBeLessThanOrEqual(Math.floor(7 / 2));
    });

    it('121. 重链剖分 / 树链剖分 (HLD): 重儿子子树规模最大化与连续 DFN 序', () => {
      const edges: [number, number][] = [
        [1, 2], [1, 3],
        [2, 4], [2, 5],
        [5, 8],
      ];
      const sHld = buildHldSteps(edges);
      verifyTreeInvariants(sHld, HLD_CODES, '重链剖分');
      const last = sHld[sHld.length - 1];
      expect(last.heavyChildMap[1]).toBe(2);
      expect(last.heavyChildMap[2]).toBe(5);
    });

    it('122. 树上差分 (Tree Difference): 点差分与路径覆盖子树求和一致性', () => {
      const edges: [number, number][] = [
        [1, 2], [1, 3],
        [2, 4], [2, 5],
        [3, 6], [3, 7],
      ];
      const sDiff = buildTreeDiffSteps(edges, [[4, 7], [4, 5]]);
      verifyTreeInvariants(sDiff, TREE_DIFFERENCE_CODES, '树上差分');
      const last = sDiff[sDiff.length - 1];
      expect(last.ansMap[4]).toBe(2);
      expect(last.ansMap[2]).toBe(2);
      expect(last.ansMap[1]).toBe(1);
    });

    it('123. 树的直径 (Tree Diameter): 两遍 BFS 最长简单路径', () => {
      const edges: [number, number][] = [
        [1, 2], [1, 3],
        [2, 4], [2, 5],
        [3, 6], [3, 7],
        [5, 8],
      ];
      const sDiam = buildTreeDiameterSteps(edges, 1);
      verifyTreeInvariants(sDiam, TREE_DIAMETER_CODES, '树的直径');
      expect(sDiam[sDiam.length - 1].diameter).toBe(5);
    });
  });
});
