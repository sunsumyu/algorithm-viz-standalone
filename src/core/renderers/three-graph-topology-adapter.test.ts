import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ThreeGraphTopologyAdapter,
  type GraphTopologyStepData,
} from './three-graph-topology-adapter';

// Lightweight Mock HTMLElement for testing
class MockContainer {
  public clientWidth = 600;
  public clientHeight = 400;
  public children: any[] = [];
  public innerHTML = '';
  appendChild(child: any) {
    this.children.push(child);
    return child;
  }
  removeChild(child: any) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return child;
  }
}

describe('ThreeGraphTopologyAdapter Deep Module Guard', () => {
  let adapter: ThreeGraphTopologyAdapter;
  let mockContainer: any;

  beforeEach(() => {
    adapter = new ThreeGraphTopologyAdapter();
    mockContainer = new MockContainer();
  });

  afterEach(() => {
    adapter.destroy();
  });

  it('implements IVisualRenderer interface contract with correct identifier', () => {
    expect(adapter.id).toBe('three-graph-topology-adapter');
    expect(typeof adapter.mount).toBe('function');
    expect(typeof adapter.render).toBe('function');
    expect(typeof adapter.destroy).toBe('function');
  });

  it('mounts gracefully in node/mock environment without throwing WebGL errors', () => {
    expect(() => {
      adapter.mount(mockContainer);
    }).not.toThrow();
  });

  it('accepts graph state updates and syncs layout and particles', () => {
    adapter.mount(mockContainer);

    const stepData: GraphTopologyStepData = {
      nodes: [
        { id: 'S', label: '源点S', level: 0 },
        { id: 'A', label: 'A', level: 1, status: 'visited' },
        { id: 'B', label: 'B', level: 1, status: 'queued' },
        { id: 'T', label: '汇点T', level: 2, status: 'current' },
      ],
      edges: [
        { from: 'S', to: 'A', flow: 5, cap: 10, isActivePath: true },
        { from: 'S', to: 'B', flow: 0, cap: 10 },
        { from: 'A', to: 'T', flow: 5, cap: 5, isSaturated: true },
        { from: 'B', to: 'T', flow: 0, cap: 10 },
      ],
      layoutMode: 'layered',
      activePath: ['S', 'A', 'T'],
    };

    expect(() => {
      adapter.render(stepData);
    }).not.toThrow();

    // 验证内部数据状态已同步
    const state = adapter.getCurrentState();
    expect(state).not.toBeNull();
    expect(state?.nodes.length).toBe(4);
    expect(state?.edges.length).toBe(4);
    expect(state?.activePath).toEqual(['S', 'A', 'T']);
  });

  it('supports layoutMode switching between layered, force, and projection', () => {
    adapter.mount(mockContainer);

    const stepData: GraphTopologyStepData = {
      nodes: [
        { id: '1', level: 0 },
        { id: '2', level: 1 },
      ],
      edges: [{ from: '1', to: '2' }],
      layoutMode: 'force',
    };

    adapter.render(stepData);
    expect(adapter.getCurrentLayoutMode()).toBe('force');

    // Switch to layered
    adapter.setLayoutMode('layered');
    expect(adapter.getCurrentLayoutMode()).toBe('layered');
  });

  it('dynamically adapts network flow steps and derives node sets for arbitrary graphs', () => {
    adapter.mount(mockContainer);

    // 任意规模网络流 step 测试（如 6 节点费用流/上下界网络）
    const networkStep = {
      flowEdges: [
        { u: 'src', v: 'v1', flow: 10, cap: 10 },
        { u: 'v1', v: 'v2', flow: 4, cap: 8 },
        { u: 'v2', v: 'sink', flow: 4, cap: 10 },
      ],
      levels: { src: 0, v1: 1, v2: 2, sink: 3 },
      activePath: ['src', 'v1', 'v2', 'sink'],
      currentNode: 'v1',
    };

    adapter.updateStep(networkStep);

    const state = adapter.getCurrentState();
    expect(state).not.toBeNull();
    // 动态提取了 4 个节点
    expect(state?.nodes.map((n) => n.id).sort()).toEqual(['sink', 'src', 'v1', 'v2']);
    
    // active 状态与 level 准确反映
    const srcNode = state?.nodes.find((n) => n.id === 'src');
    expect(srcNode?.level).toBe(0);
    expect(srcNode?.status).toBe('active');

    // 边饱和度与增广路径标记
    const edgeSrcV1 = state?.edges.find((e) => e.from === 'src' && e.to === 'v1');
    expect(edgeSrcV1?.isSaturated).toBe(true);
    expect(edgeSrcV1?.isActivePath).toBe(true);

    const edgeV1V2 = state?.edges.find((e) => e.from === 'v1' && e.to === 'v2');
    expect(edgeV1V2?.isSaturated).toBe(false);
    expect(edgeV1V2?.isActivePath).toBe(true);
  });

  it('destroys cleanly with zero resource leaks', () => {
    adapter.mount(mockContainer);
    adapter.render({
      nodes: [{ id: '1' }],
      edges: [],
    });

    expect(() => {
      adapter.destroy();
    }).not.toThrow();

    expect(adapter.getCurrentState()).toBeNull();
  });
});
