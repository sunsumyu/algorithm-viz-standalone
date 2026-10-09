// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ViewMountEngine } from '../view-mount-engine';
import * as chunkLifecycle from './chunk-lifecycle';

describe('ViewMountEngine Zeroize Linkage (方案 B 视口卸载内存即用即焚闭环)', () => {
  let engine: ViewMountEngine;
  let releaseSpy: any;

  beforeEach(() => {
    engine = new ViewMountEngine();
    releaseSpy = vi.spyOn(chunkLifecycle, 'releaseAlgorithmChunk').mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('当卸载活动算法视口时，应自动向原生端派发 releaseAlgorithmChunk 指令', async () => {
    // 模拟挂载一个测试算法
    const mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);

    class DummyVisualizer {
      async init() {}
      destroy() {}
    }

    await engine.mount({
      algorithmId: 'binary-search-tree-lca',
      viewId: 'test-view-lca',
      templateContent: '<div id="test-view-lca"></div>',
      VisualizerClass: DummyVisualizer as any,
      containerParent: mockContainer,
    });

    expect(engine.getCurrentAlgorithmId()).toBe('binary-search-tree-lca');

    // 执行卸载
    engine.unmountCurrent();

    expect(engine.getCurrentAlgorithmId()).toBeNull();
    expect(releaseSpy).toHaveBeenCalledWith('binary-search-tree-lca');

    mockContainer.remove();
  });

  it('连续切换不同算法时，应在挂载新算法前正确释放前一个算法的解密内存', async () => {
    const mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);

    class DummyVisualizer {
      async init() {}
      destroy() {}
    }

    // 第一次挂载
    await engine.mount({
      algorithmId: 'algo-step-one',
      viewId: 'test-view-1',
      templateContent: '<div>1</div>',
      VisualizerClass: DummyVisualizer as any,
      containerParent: mockContainer,
    });

    releaseSpy.mockClear();

    // 第二次挂载不同算法
    await engine.mount({
      algorithmId: 'algo-step-two',
      viewId: 'test-view-2',
      templateContent: '<div>2</div>',
      VisualizerClass: DummyVisualizer as any,
      containerParent: mockContainer,
    });

    // 验证 algo-step-one 的内存释放指令被成功触发
    expect(releaseSpy).toHaveBeenCalledWith('algo-step-one');
    expect(engine.getCurrentAlgorithmId()).toBe('algo-step-two');

    mockContainer.remove();
  });
});
