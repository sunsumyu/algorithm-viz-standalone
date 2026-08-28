import { describe, it, expect } from 'vitest';
import { StepMatrixCompilerPrimitives } from './step-matrix-compiler-primitives';

describe('StepMatrixCompilerPrimitives (Deep Module Unit Tests)', () => {
  it('1. 成功克隆与创建零矩阵', () => {
    const grid = StepMatrixCompilerPrimitives.createZeroGrid(3, 4);
    expect(grid.length).toBe(3);
    expect(grid[0].length).toBe(4);
    expect(grid[2][3]).toBe(0);

    const cloned = StepMatrixCompilerPrimitives.cloneGrid2D(grid);
    cloned[0][0] = 99;
    expect(grid[0][0]).toBe(0); // 确保深度独立
  });

  it('2. 构造标准 2D 状态转移步骤', () => {
    const grid = [
      [1, 1],
      [1, 2]
    ];
    const step = StepMatrixCompilerPrimitives.create2DTransferStep({
      line: 6,
      i: 1,
      j: 1,
      grid
    });

    expect(step.type).toBe('update');
    expect(step.i).toBe(1);
    expect(step.j).toBe(1);
    expect(step.gridHighlight).toEqual({ i: 1, j: 1 });
    expect(step.tag).toBe('dp[1][1] = 2');
  });

  it('3. 构造一维滚动压缩步骤', () => {
    const dp1d = [1, 2, 3];
    const step = StepMatrixCompilerPrimitives.create1DRollingStep({
      line: 8,
      activeSlot: 2,
      dp1d
    });

    expect(step.type).toBe('update-1d');
    expect(step.activeSlot).toBe(2);
    expect(step.dp1d).toEqual([1, 2, 3]);
  });

  it('4. 构造收尾返回步骤', () => {
    const step = StepMatrixCompilerPrimitives.createReturnStep({
      line: 10,
      finalVal: 42
    });

    expect(step.type).toBe('return');
    expect(step.tag).toContain('42');
  });
});
