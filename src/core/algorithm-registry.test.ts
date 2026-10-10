import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AlgorithmRegistry, type ResolvedAlgorithmEntry } from './algorithm-registry';
import type { AlgorithmManifest } from './registry';
import type { IVisualizer } from './interfaces';

class DummyVisualizer implements IVisualizer {
  async init(): Promise<void> {}
  destroy(): void {}
}

describe('AlgorithmRegistry (Deep Module)', () => {
  let registry: AlgorithmRegistry;
  let mockBatchLoader: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockBatchLoader = vi.fn().mockImplementation(async (category: string) => {
      // 模拟动态分包加载后向 registry 注册对应算法清单
      if (category === 'graph') {
        registry.register({
          id: 'dijkstra',
          name: 'Dijkstra 算法',
          viewId: 'algo-dijkstra-view',
          category: 'graph',
          description: '单源最短路',
          icon: 'fa-route',
          difficulty: 2,
          levelOrder: 1,
          template: '<div id="dijkstra-view">Dijkstra Stage</div>',
          Visualizer: DummyVisualizer,
        });
      }
    });

    registry = new AlgorithmRegistry({
      initialMetadata: [
        {
          id: 'fibonacci',
          name: '斐波那契数列',
          viewId: 'algo-fibonacci-view',
          category: 'dynamic-programming',
          description: '入门 DP',
          icon: 'fa-calculator',
          difficulty: 1,
          levelOrder: 1,
        },
        {
          id: 'dijkstra',
          name: 'Dijkstra 算法',
          viewId: 'algo-dijkstra-view',
          category: 'graph',
          description: '单源最短路',
          icon: 'fa-route',
          difficulty: 2,
          levelOrder: 1,
        },
      ],
      batchLoader: mockBatchLoader,
    });
  });

  it('初始状态应正确获取元数据列表与单一元数据', () => {
    const metaList = registry.getAllMetadata();
    expect(metaList.length).toBe(2);

    const fibMeta = registry.getMetadata('fibonacci');
    expect(fibMeta).toBeDefined();
    expect(fibMeta?.category).toBe('dynamic-programming');

    expect(registry.hasManifest('fibonacci')).toBe(false);
  });

  it('显式注册 manifest 时应自动完成模板索引与构造器绑定', () => {
    const manifest: AlgorithmManifest = {
      id: 'fibonacci',
      name: '斐波那契数列',
      viewId: 'algo-fibonacci-view',
      category: 'dynamic-programming',
      description: '入门 DP',
      icon: 'fa-calculator',
      difficulty: 1,
      levelOrder: 1,
      template: '<div id="fib-container">Fibonacci Template</div>',
      Visualizer: DummyVisualizer,
    };

    registry.register(manifest);

    expect(registry.hasManifest('fibonacci')).toBe(true);
    expect(registry.getManifest('fibonacci')).toBe(manifest);
    expect(registry.getTemplate('algo-fibonacci-view')).toBe('<div id="fib-container">Fibonacci Template</div>');
  });

  it('通过 resolve(id) 获取已就绪算法时无需触发动态加载', async () => {
    const manifest: AlgorithmManifest = {
      id: 'fibonacci',
      name: '斐波那契数列',
      viewId: 'algo-fibonacci-view',
      category: 'dynamic-programming',
      description: '入门 DP',
      icon: 'fa-calculator',
      difficulty: 1,
      levelOrder: 1,
      template: '<div id="fib">Fib</div>',
      Visualizer: DummyVisualizer,
    };
    registry.register(manifest);

    const entry = await registry.resolve('fibonacci');
    expect(mockBatchLoader).not.toHaveBeenCalled();
    expect(entry).toBeDefined();
    expect(entry?.id).toBe('fibonacci');
    expect(entry?.template).toBe('<div id="fib">Fib</div>');
    expect(entry?.Visualizer).toBe(DummyVisualizer);

    // 验证工厂方法能够正确实例化
    const instance = entry?.createVisualizer();
    expect(instance).toBeInstanceOf(DummyVisualizer);
  });

  it('resolve(id) 未就绪算法时应自动调度分类动态加载器并编译返回', async () => {
    expect(registry.hasManifest('dijkstra')).toBe(false);

    const entry = await registry.resolve('dijkstra');
    expect(mockBatchLoader).toHaveBeenCalledWith('graph');
    expect(entry).toBeDefined();
    expect(entry?.id).toBe('dijkstra');
    expect(entry?.template).toContain('Dijkstra Stage');
    expect(registry.hasManifest('dijkstra')).toBe(true);
  });

  it('resolve(id) 应优先调用细粒度 singleLoader，命中后不触发粗粒度 batchLoader', async () => {
    let testRegistry: AlgorithmRegistry;
    const localBatchLoader = vi.fn();
    const mockSingle = vi.fn().mockImplementation(async (id: string) => {
      testRegistry.register({
        id,
        name: '精准加载单题',
        category: 'graph',
        viewId: `algo-${id}-view`,
        description: 'Single loader test',
        icon: '⚡',
        difficulty: 1,
        levelOrder: 1,
        template: '<div id="single">Single</div>',
        Visualizer: DummyVisualizer,
      });
      return true;
    });

    testRegistry = new AlgorithmRegistry({
      initialMetadata: [
        {
          id: 'single-target-algo',
          name: '单题目标',
          category: 'graph',
          viewId: 'algo-single-target-algo-view',
          description: '',
          icon: '',
          difficulty: 1,
          levelOrder: 1,
        },
      ],
      batchLoader: localBatchLoader,
      singleLoader: mockSingle,
    });

    const entry = await testRegistry.resolve('single-target-algo');
    expect(mockSingle).toHaveBeenCalledWith('single-target-algo');
    expect(localBatchLoader).not.toHaveBeenCalled();
    expect(entry).toBeDefined();
    expect(entry?.id).toBe('single-target-algo');
  });

  it('查询未知算法 ID 应安全返回 undefined 而不抛出未捕获异常', async () => {
    const entry = await registry.resolve('unknown-algo-xyz');
    expect(entry).toBeUndefined();
  });
});
