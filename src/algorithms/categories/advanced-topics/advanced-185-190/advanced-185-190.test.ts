/**
 * 左神算法通关课 Class 185 ~ 190 欧拉序/DFN序LCA、边分治、欧拉路径/回路、Tarjan SCC、边双连通与点双连通 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildEulerDfnSteps } from './euler-dfn-lca-renderer';
import { buildEdgeDecompSteps } from './edge-decomposition-renderer';
import { buildEulerianSteps } from './eulerian-path-circuit-renderer';
import { buildTarjanSCCSteps } from './tarjan-scc-condensation-renderer';
import { buildEdgeBCCSteps } from './edge-biconnected-components-renderer';
import { buildVertexBCCSteps } from './vertex-biconnected-components-renderer';
import {
  EULER_DFN_LCA_CODES,
  EDGE_DECOMPOSITION_CODES,
  EULERIAN_PATH_CODES,
  TARJAN_SCC_CODES,
  EDGE_BCC_CODES,
  VERTEX_BCC_CODES,
} from './advanced-185-190-stage-codes';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `Line ${line} exceeds code length ${codes[lang].length} for ${lang}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神高阶树论、欧拉图与连通性分量专题 (Class 185 ~ 190) 综合测试套件', () => {
  // 1. Class 185: 欧拉序与 DFN 序求 LCA
  describe('Class 185: 欧拉序与 DFN 序求 LCA (Euler Tour & DFN Order LCA)', () => {
    it('欧拉序区间映射与 RMQ 极小值准确求得 LCA(4, 5) = 2', () => {
      const steps = buildEulerDfnSteps();
      const last = steps[steps.length - 1];
      expect(last.lca).toBe(2);
      expect(last.eulerTour.length).toBe(9);
      verify1BasedCodeLines(steps, EULER_DFN_LCA_CODES);
    });
  });

  // 2. Class 186: 树上边分治与边分树
  describe('Class 186: 树上边分治与边分树 (Edge Decomposition)', () => {
    it('重心边选择平衡分割两侧各 2 点并完成二分合并', () => {
      const steps = buildEdgeDecompSteps();
      const last = steps[steps.length - 1];
      expect(last.nodes.length).toBe(4);
      expect(last.edges.filter(e => e.isCut).length).toBe(3);
      verify1BasedCodeLines(steps, EDGE_DECOMPOSITION_CODES);
    });
  });

  // 3. Class 187: 欧拉路径与欧拉回路
  describe('Class 187: 欧拉路径与欧拉回路 (Eulerian Path & Circuit)', () => {
    it('出入度判定起点终点，Hierholzer 圈套圈准确求得欧拉序列', () => {
      const steps = buildEulerianSteps();
      const last = steps[steps.length - 1];
      expect(last.pathStack.length).toBe(5);
      expect(last.pathStack.slice().reverse()).toEqual([1, 2, 3, 4, 2]);
      verify1BasedCodeLines(steps, EULERIAN_PATH_CODES);
    });
  });

  // 4. Class 188: 强连通分量与 Tarjan 缩点
  describe('Class 188: 强连通分量与 Tarjan 缩点 (Tarjan SCC & Condensation)', () => {
    it('有向图深搜返祖边准确缩出 2 个极大 SCC 分量', () => {
      const steps = buildTarjanSCCSteps();
      const last = steps[steps.length - 1];
      expect(last.sccs.length).toBe(2);
      expect(last.sccs[0]).toEqual([4]);
      expect(last.sccs[1].sort()).toEqual([1, 2, 3]);
      verify1BasedCodeLines(steps, TARJAN_SCC_CODES);
    });
  });

  // 5. Class 189: 割边与边双连通分量 e-BCC
  describe('Class 189: 割边与边双连通分量 e-BCC (Bridges & 2-Edge-Connected Components)', () => {
    it('low[v] > dfn[u] 准确定位唯一割边 (3-4) 并划分 2 个边双连通块', () => {
      const steps = buildEdgeBCCSteps();
      const last = steps[steps.length - 1];
      const bridges = last.edges.filter(e => e.isBridge);
      expect(bridges.length).toBe(1);
      expect(bridges[0].u).toBe(3);
      expect(bridges[0].v).toBe(4);
      expect(last.ebccs.length).toBe(2);
      verify1BasedCodeLines(steps, EDGE_BCC_CODES);
    });
  });

  // 6. Class 190: 割点与点双连通分量 v-BCC
  describe('Class 190: 割点与点双连通分量 v-BCC (Cut Vertices & 2-Vertex-Connected Components)', () => {
    it('准确定位 8 字形拓扑关节点 3 为割点并提取出 2 个极大点双分量', () => {
      const steps = buildVertexBCCSteps();
      const last = steps[steps.length - 1];
      expect(last.cutVertices).toContain(3);
      expect(last.cutVertices.length).toBe(1);
      expect(last.vbccs.length).toBe(2);
      verify1BasedCodeLines(steps, VERTEX_BCC_CODES);
    });
  });
});
