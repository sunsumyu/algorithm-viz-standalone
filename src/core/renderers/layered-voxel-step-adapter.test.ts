import { describe, it, expect } from 'vitest';
import { LayeredVoxelStepAdapter } from './layered-voxel-step-adapter';
import type { DpTraceStep } from '../../algorithms/categories/dynamic-programming/engine/types';

describe('LayeredVoxelStepAdapter', () => {
  it('应该正确初始化空的多层 3D 立方体网格', () => {
    const cube = LayeredVoxelStepAdapter.createEmptyCube(3, 2, 2);
    expect(cube.length).toBe(3); // 3 layers: k = 0, 1, 2
    expect(cube[0].length).toBe(2); // 2 rows
    expect(cube[0][0].length).toBe(2); // 2 cols
    expect(cube[0][0][0].status).toBe('empty');
    expect(cube[0][0][0].value).toBe(0);
  });

  it('应该能根据步骤中提取的 k 与 dp2d 更新对应层的体素状态', () => {
    const emptyCube = LayeredVoxelStepAdapter.createEmptyCube(3, 2, 2);

    const mockStep: DpTraceStep = {
      current: { row: 0, col: 1 },
      dp2d: [
        [{ value: 2, state: 'computed' }, { value: 3, state: 'active' }],
        [{ value: 0, state: 'default' }, { value: 1, state: 'computed' }]
      ],
      vars: [
        { name: 'step', value: '1' }
      ],
      message: '第 1 步计算中'
    };

    const result = LayeredVoxelStepAdapter.adapt(mockStep, {
      layers: 3,
      rows: 2,
      cols: 2,
      previousCube: emptyCube
    });

    expect(result.currentK).toBe(1);
    expect(result.currentR).toBe(0);
    expect(result.currentC).toBe(1);
    expect(result.cube[1][0][1].status).toBe('active');
    expect(result.cube[1][0][1].value).toBe(3);
    expect(result.cube[1][0][0].status).toBe('computed');
    expect(result.cube[1][0][0].value).toBe(2);
  });

  it('应该能正确识别并生成跨层依赖关系 (上一层 k-1 到当前层 k)', () => {
    const mockStep: DpTraceStep = {
      current: { row: 1, col: 1 },
      dependencies: [
        { row: 0, col: 1 },
        { row: 1, col: 0 }
      ],
      vars: [
        { name: 'step', value: '2' }
      ]
    };

    const result = LayeredVoxelStepAdapter.adapt(mockStep, {
      layers: 3,
      rows: 2,
      cols: 2
    });

    expect(result.currentK).toBe(2);
    expect(result.interLayerDependencies).toBeDefined();
    expect(result.interLayerDependencies?.length).toBe(2);
    expect(result.interLayerDependencies?.[0]).toEqual({
      from: { k: 1, r: 0, c: 1 },
      to: { k: 2, r: 1, c: 1 }
    });
    expect(result.interLayerDependencies?.[1]).toEqual({
      from: { k: 1, r: 1, c: 0 },
      to: { k: 2, r: 1, c: 1 }
    });

    // 依赖在上一层 cube 中应该被标记为 'dependency'
    expect(result.cube[1][0][1].status).toBe('dependency');
    expect(result.cube[1][1][0].status).toBe('dependency');
  });

  it('应该能根据步骤历史流完整累积所有层的计算快照', () => {
    const steps: DpTraceStep[] = [
      {
        vars: [{ name: 'step', value: '0' }],
        dp2d: [[{ value: 0, state: 'computed' }]]
      },
      {
        vars: [{ name: 'step', value: '1' }],
        current: { row: 0, col: 0 },
        dp2d: [[{ value: 4, state: 'active' }]]
      },
      {
        vars: [{ name: 'step', value: '2' }],
        current: { row: 0, col: 0 },
        dependencies: [{ row: 0, col: 0 }],
        dp2d: [[{ value: 8, state: 'active' }]]
      }
    ];

    const result = LayeredVoxelStepAdapter.buildCubeFromSteps(steps, 2, {
      layers: 3,
      rows: 1,
      cols: 1
    });

    expect(result.currentK).toBe(2);
    expect(result.cube[0][0][0].value).toBe(0);
    expect(result.cube[1][0][0].value).toBe(4);
    expect(result.cube[2][0][0].value).toBe(8);
    expect(result.cube[2][0][0].status).toBe('active');
    expect(result.interLayerDependencies?.length).toBe(1);
    expect(result.interLayerDependencies?.[0].from.k).toBe(1);
  });
});
