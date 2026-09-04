import { describe, it, expect } from 'vitest';
import { OutOfBoundaryPathsSpec } from './out-of-boundary-paths.spec';
import { LayeredVoxelStepAdapter } from '../../../../../core/renderers/layered-voxel-step-adapter';
import { ThreeLayeredVoxelAdapter } from '../../../../../core/renderers/three-layered-voxel-adapter';

describe('Three-Dimension DP 3D Visuals End-to-End Pipeline', () => {
  it('出界的路径数 (out-of-boundary-paths) 应正确生成步骤并成功被 LayeredVoxelStepAdapter 转换', () => {
    expect(OutOfBoundaryPathsSpec.generateSteps).toBeDefined();
    const steps = OutOfBoundaryPathsSpec.generateSteps!({
      m: 2,
      n: 2,
      maxMove: 2,
      startRow: 0,
      startColumn: 0
    });

    expect(steps.length).toBeGreaterThan(0);

    // 测试单步转换
    const lastStep = steps[steps.length - 1];
    const adapted = LayeredVoxelStepAdapter.adapt(lastStep, {
      layers: 3,
      rows: 2,
      cols: 2
    });

    expect(adapted).toBeDefined();
    expect(adapted.cube.length).toBe(3);
    expect(adapted.cube[0].length).toBe(2);
    expect(adapted.cube[0][0].length).toBe(2);
  });

  it('多步累积应在整个三维状态空间立方体中完整保持历史已计算层', () => {
    const steps = OutOfBoundaryPathsSpec.generateSteps!({
      m: 2,
      n: 2,
      maxMove: 2,
      startRow: 0,
      startColumn: 0
    });

    // 选取中间某个步骤
    const midIdx = Math.floor(steps.length / 2);
    const cubeData = LayeredVoxelStepAdapter.buildCubeFromSteps(steps, midIdx, {
      layers: 3,
      rows: 2,
      cols: 2
    });

    expect(cubeData.cube).toBeDefined();
    expect(cubeData.currentK).toBeGreaterThanOrEqual(0);
    expect(cubeData.cube[0][0][0]).toBeDefined();
  });

  it('ThreeLayeredVoxelAdapter 应该能顺畅渲染转换后的三维真实 DP 步骤并释放', () => {
    const adapter = ThreeLayeredVoxelAdapter.getInstance();
    const steps = OutOfBoundaryPathsSpec.generateSteps!({
      m: 2,
      n: 2,
      maxMove: 2,
      startRow: 0,
      startColumn: 0
    });

    const cubeData = LayeredVoxelStepAdapter.buildCubeFromSteps(steps, steps.length - 1, {
      layers: 3,
      rows: 2,
      cols: 2
    });

    expect(() => {
      adapter.render(cubeData, {
        layers: 3,
        rows: 2,
        cols: 2
      });
    }).not.toThrow();

    expect(adapter.getCurrentLayerIndex()).toBe(cubeData.currentK);
    adapter.dispose();
  });
});
