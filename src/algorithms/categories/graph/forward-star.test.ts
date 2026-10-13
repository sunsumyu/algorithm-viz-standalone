/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { buildForwardStarSteps, ForwardStarCanvasAdapter } from './forward-star-renderer';

describe('ForwardStar (Chained Forward Star Algorithm)', () => {
  it('should build steps for addEdge mode correctly', () => {
    const rawEdges = '1 2 5, 1 3 2, 2 4 1';
    const steps = buildForwardStarSteps(rawEdges, '1', 'build');

    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];

    expect(lastStep.action).toBe('build_done');
    expect(lastStep.edges.length).toBe(3);

    // Node 1 has two outgoing edges: 1->2 (idx 0) then 1->3 (idx 1)
    // Head insertion order: head[1] should point to edge 1
    expect(lastStep.head[1]).toBe(1);
    // Edge 1 (1->3) next should point to edge 0 (1->2)
    expect(lastStep.edges[1].next).toBe(0);
    // Edge 0 (1->2) next should be -1
    expect(lastStep.edges[0].next).toBe(-1);

    // 强校验 metrics 指标与多语言行号联动覆盖
    expect(lastStep.metrics).toBeDefined();
    expect(lastStep.metrics!['cur-action']).toBe('建图全部完成');
    expect(lastStep.metrics!['edge-cnt']).toBe(3);
    expect(lastStep.codeLine).toHaveProperty('java', 26);
    expect(lastStep.codeLine).toHaveProperty('cpp', 26);
  });

  it('should traverse outgoing edges in reverse insertion order', () => {
    const rawEdges = '1 2 5, 1 3 2, 1 4 9';
    const steps = buildForwardStarSteps(rawEdges, '1', 'traverse');

    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];

    expect(lastStep.action).toBe('traverse_done');
    // Edge insertion order: 0 (1->2), 1 (1->3), 2 (1->4)
    // Head insertion traversal order should be: 2 -> 1 -> 0
    expect(lastStep.traversedEdges).toEqual([2, 1, 0]);

    // 校验遍历完成帧指标
    expect(lastStep.metrics!['cur-action']).toBe('遍历完全结束');
    expect(lastStep.codeLine).toHaveProperty('java', 34);
    expect(lastStep.codeLine).toHaveProperty('cpp', 34);
  });

  it('guarantees strictly monotonic forward execution inside addEdge without jumping or skipping', () => {
    const rawEdges = '2 1 5, 2 3 2, 3 4 4, 2 4 9';
    const steps = buildForwardStarSteps(rawEdges, '2', 'build');

    // 提取每个加边周期内的 4 个子步骤 (to -> weight -> next -> head)
    const addEdgesCycles: any[][] = [];
    let curCycle: any[] = [];
    for (const st of steps) {
      if (st.action === 'add_start') {
        if (curCycle.length > 0) addEdgesCycles.push(curCycle);
        curCycle = [st];
      } else if (st.action === 'add_weight' || st.action === 'link_next' || st.action === 'update_head') {
        curCycle.push(st);
      }
    }
    if (curCycle.length > 0) addEdgesCycles.push(curCycle);

    expect(addEdgesCycles.length).toBe(4); // 4 条边，4 个加边周期

    // 强断言：进入方法第一步命中首行有效语句，且后续执行在 4 种语言下均严格连续单调推进，每一行代码都得到执行，绝无任何跳行
    for (const cycle of addEdgesCycles) {
      expect(cycle.length).toBe(4);
      const [s1, s2, s3, s4] = cycle;

      // 1. Java 语言断言：22 -> 23 -> 24 -> 25 连续 4 整数，差值恒为 1，零跳行零静默
      expect(s1.codeLine.java).toBe(22);
      expect(s2.codeLine.java).toBe(23);
      expect(s3.codeLine.java).toBe(24);
      expect(s4.codeLine.java).toBe(25);

      // 2. C++ 语言断言：22 -> 23 -> 24 -> 25 连续 4 整数
      expect(s1.codeLine.cpp).toBe(22);
      expect(s2.codeLine.cpp).toBe(23);
      expect(s3.codeLine.cpp).toBe(24);
      expect(s4.codeLine.cpp).toBe(25);

      // 3. Python 语言断言：11 -> 12 -> 13 -> 14 连续 4 整数
      expect(s1.codeLine.python).toBe(11);
      expect(s2.codeLine.python).toBe(12);
      expect(s3.codeLine.python).toBe(13);
      expect(s4.codeLine.python).toBe(14);

      // 4. JavaScript 语言断言：12 -> 13 -> 14 -> 15 连续 4 整数
      expect(s1.codeLine.javascript).toBe(12);
      expect(s2.codeLine.javascript).toBe(13);
      expect(s3.codeLine.javascript).toBe(14);
      expect(s4.codeLine.javascript).toBe(15);
    }
  });

  it('should render all edges in canvas adapter even at build_done step', () => {
    const rawEdges = '2 1 5, 2 3 2, 3 4 4, 2 4 9';
    const steps = buildForwardStarSteps(rawEdges, '2', 'build');
    const lastStep = steps[steps.length - 1];

    const container = document.createElement('div');
    ForwardStarCanvasAdapter.render(container, lastStep);

    // 校验画板中 4 条边全部被正常渲染（绝不被隐藏）
    const edgeLines = container.querySelectorAll('.fs-svg-edge line');
    expect(edgeLines.length).toBe(4);

    // 校验 4 个顶点的 head[u] 卡片全部呈现
    const headBoxes = container.querySelectorAll('.fs-node-box');
    expect(headBoxes.length).toBe(4);
  });
});
