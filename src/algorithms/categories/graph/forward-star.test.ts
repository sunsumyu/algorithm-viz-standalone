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
    expect(lastStep.codeLine).toHaveProperty('java', 30);
    expect(lastStep.codeLine).toHaveProperty('cpp', 34);
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
    expect(lastStep.codeLine).toHaveProperty('java', 39);
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
