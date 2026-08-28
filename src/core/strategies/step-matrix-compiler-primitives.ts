/**
 * 矩阵与单步编译领域原语深模块 (StepMatrixCompilerPrimitives Deep Module)
 * 遵循单一职责与纯函数设计原则：
 * 封装网格矩阵深克隆、标准 2D/1D 初始化步、状态转移步与函数返回步的构造逻辑。
 */

import type { UniversalStep } from '../universal-stage-engine';

export class StepMatrixCompilerPrimitives {
  /**
   * 二维网格矩阵深度克隆
   */
  public static cloneGrid2D<T>(grid: T[][]): T[][] {
    return grid.map(row => [...row]);
  }

  /**
   * 构建尺寸为 m x n 的初始全 0 矩阵
   */
  public static createZeroGrid(m: number, n: number): number[][] {
    return Array.from({ length: m }, () => new Array(n).fill(0));
  }

  /**
   * 构造标准初始化步骤
   */
  public static createInitStep(options: {
    line: number;
    m: number;
    n: number;
    grid: (number | null)[][];
    dp1d?: number[];
    tag?: string;
    log?: string;
    msg?: string;
  }): UniversalStep {
    return {
      type: 'init',
      line: options.line,
      i: 0,
      j: 0,
      grid: this.cloneGrid2D(options.grid),
      dp1d: options.dp1d ? [...options.dp1d] : undefined,
      activeSlot: 0,
      highlightSlots: [0],
      tag: options.tag || '初始化状态表',
      log: options.log || '| 📋 初始化状态数组 / 状态矩阵',
      msg: options.msg || `初始化 <code>${options.m} × ${options.n}</code> 状态空间。`
    };
  }

  /**
   * 构造二维网格状态转移步骤
   */
  public static create2DTransferStep(options: {
    line: number;
    i: number;
    j: number;
    grid: (number | null)[][];
    topI?: number;
    topJ?: number;
    leftI?: number;
    leftJ?: number;
    tag?: string;
    log?: string;
    msg?: string;
  }): UniversalStep {
    return {
      type: 'update',
      line: options.line,
      i: options.i,
      j: options.j,
      grid: this.cloneGrid2D(options.grid),
      gridHighlight: { i: options.i, j: options.j },
      topI: options.topI,
      topJ: options.topJ,
      leftI: options.leftI,
      leftJ: options.leftJ,
      tag: options.tag || `dp[${options.i}][${options.j}] = ${options.grid[options.i][options.j]}`,
      log: options.log || `| ⚡ 计算 dp[${options.i}][${options.j}] = ${options.grid[options.i][options.j]}`,
      msg: options.msg || `计算单元格 <code>(${options.i}, ${options.j})</code>。`
    };
  }

  /**
   * 构造一维滚动数组压缩更新步骤
   */
  public static create1DRollingStep(options: {
    line: number;
    activeSlot: number;
    dp1d: number[];
    srcSlots?: number[];
    tag?: string;
    log?: string;
    msg?: string;
  }): UniversalStep {
    return {
      type: 'update-1d',
      line: options.line,
      i: 0,
      j: options.activeSlot,
      dp1d: [...options.dp1d],
      memo: [...options.dp1d],
      activeSlot: options.activeSlot,
      highlightSlots: [options.activeSlot],
      srcSlots: options.srcSlots,
      tag: options.tag || `dp[${options.activeSlot}] = ${options.dp1d[options.activeSlot]}`,
      log: options.log || `| ⚡ 空间压缩更新 dp[${options.activeSlot}] = ${options.dp1d[options.activeSlot]}`,
      msg: options.msg || `滚动更新槽位 <code>dp[${options.activeSlot}]</code>。`
    };
  }

  /**
   * 构造最终返回收尾步骤
   */
  public static createReturnStep(options: {
    line: number;
    finalVal: number | string | boolean;
    grid?: (number | null)[][];
    dp1d?: number[];
    tag?: string;
    log?: string;
    msg?: string;
  }): UniversalStep {
    return {
      type: 'return',
      line: options.line,
      i: options.grid ? options.grid.length - 1 : 0,
      j: options.grid && options.grid[0] ? options.grid[0].length - 1 : (options.dp1d ? options.dp1d.length - 1 : 0),
      grid: options.grid ? this.cloneGrid2D(options.grid) : undefined,
      dp1d: options.dp1d ? [...options.dp1d] : undefined,
      activeSlot: options.dp1d ? options.dp1d.length - 1 : undefined,
      tag: options.tag || `计算完成，返回: ${options.finalVal}`,
      log: options.log || `| 🏆 演化计算完成，最终结果 = ${options.finalVal}`,
      msg: options.msg || `🏆 演化计算完成！最终结果为 <strong>${options.finalVal}</strong>。`
    };
  }
}
