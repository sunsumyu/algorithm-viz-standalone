import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThreeLayeredVoxelAdapter } from './three-layered-voxel-adapter';
import { LayeredVoxelStepAdapter } from './layered-voxel-step-adapter';

describe('ThreeLayeredVoxelAdapter Deep Module', () => {
  let adapter: ThreeLayeredVoxelAdapter;

  beforeEach(() => {
    adapter = ThreeLayeredVoxelAdapter.getInstance();
  });

  afterEach(() => {
    adapter.dispose();
  });

  it('应该作为单例正确初始化并具备唯一的 renderer id', () => {
    expect(adapter).toBeDefined();
    expect(adapter.id).toBe('three-layered-voxel-adapter');
    const another = ThreeLayeredVoxelAdapter.getInstance();
    expect(another).toBe(adapter);
  });

  it('应该能在无 WebGL 或 Node.js 环境下安全调用 mount 和 dispose (零异常崩溃)', () => {
    const mockContainer = {
      clientWidth: 800,
      clientHeight: 600,
      appendChild: vi.fn(),
      removeChild: vi.fn()
    } as any;

    expect(() => adapter.mount(mockContainer)).not.toThrow();
    expect(() => adapter.dispose()).not.toThrow();
  });

  it('应该能正确接收 LayeredVoxelStepData 并更新内部层级状态', () => {
    const mockContainer = {
      clientWidth: 800,
      clientHeight: 600,
      appendChild: vi.fn(),
      removeChild: vi.fn()
    } as any;

    adapter.mount(mockContainer);

    const stepData = LayeredVoxelStepAdapter.adapt(
      {
        current: { row: 0, col: 0 },
        vars: [{ name: 'step', value: '1' }],
        dp2d: [[{ value: 5, state: 'active' }]]
      },
      { layers: 3, rows: 1, cols: 1 }
    );

    expect(() => adapter.render(stepData, { layers: 3, rows: 1, cols: 1 })).not.toThrow();
    expect(adapter.getCurrentLayerIndex()).toBe(1);
  });

  it('应该支持切换视角至特定层或重置为全景视图', () => {
    expect(() => adapter.focusLayer(2)).not.toThrow();
    expect(() => adapter.focusAll()).not.toThrow();
  });
});
