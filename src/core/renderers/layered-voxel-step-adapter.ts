/**
 * 3D 分层体素切片数据提取器深模块 (LayeredVoxelStepAdapter Deep Module)
 * 遵循深模块原则：
 * 1. 100% 零 DOM 依赖的纯领域转换逻辑；
 * 2. 自动从多态单步事件流 (DpTraceStep / UniversalStep) 中提取三维坐标与层级状态；
 * 3. 累积维护 K × M × N 状态空间立方体与跨层依赖关系 (Inter-layer Dependencies)。
 */

import type { DpTraceStep } from '../../algorithms/categories/dynamic-programming/engine/types';
import type { UniversalStep } from '../universal-stage-engine';

export type VoxelStatus = 'empty' | 'computed' | 'active' | 'dependency' | 'target';

export interface LayeredVoxelCell {
  value: number | string;
  status: VoxelStatus;
  tag?: string;
}

export interface InterLayerDependency {
  from: { k: number; r: number; c: number };
  to: { k: number; r: number; c: number };
  label?: string;
}

export interface LayeredVoxelStepData {
  currentK: number;
  currentR?: number;
  currentC?: number;
  cube: LayeredVoxelCell[][][];
  interLayerDependencies?: InterLayerDependency[];
  message?: string;
}

export interface LayeredAdaptOptions {
  layers: number;
  rows: number;
  cols: number;
  previousCube?: LayeredVoxelCell[][][];
}

export class LayeredVoxelStepAdapter {
  /**
   * 创建初始空 3D 体素切片立方体
   */
  public static createEmptyCube(layers: number, rows: number, cols: number): LayeredVoxelCell[][][] {
    const validLayers = Math.max(1, layers);
    const validRows = Math.max(1, rows);
    const validCols = Math.max(1, cols);

    return Array.from({ length: validLayers }, () =>
      Array.from({ length: validRows }, () =>
        Array.from({ length: validCols }, () => ({
          value: 0,
          status: 'empty' as VoxelStatus
        }))
      )
    );
  }

  /**
   * 深克隆一个体素立方体
   */
  public static cloneCube(cube: LayeredVoxelCell[][][]): LayeredVoxelCell[][][] {
    return cube.map(layer =>
      layer.map(row =>
        row.map(cell => ({ ...cell }))
      )
    );
  }

  /**
   * 从单步事件中推导当前层索引 k
   */
  public static extractLayerIndex(step: DpTraceStep | UniversalStep | any): number {
    if (!step) return 0;

    // 1. 直接属性
    if (typeof step.k === 'number') return step.k;
    if (typeof step.layerIndex === 'number') return step.layerIndex;
    if (typeof step.step === 'number') return step.step;

    // 2. 检查 vars 变量列表
    if (Array.isArray(step.vars)) {
      const stepVar = step.vars.find((v: any) => v.name === 'step' || v.name === 'k' || v.name === 'layer' || v.name === '步数');
      if (stepVar && !isNaN(Number(stepVar.value))) {
        return Math.max(0, parseInt(stepVar.value, 10));
      }
    }

    // 3. 检查 actionMeta 或 thematicMeta
    if (step.actionMeta && typeof step.actionMeta.step === 'number') {
      return step.actionMeta.step;
    }
    if (step.thematicMeta && typeof step.thematicMeta.layer === 'number') {
      return step.thematicMeta.layer;
    }

    // 4. 从日志或消息正则匹配 "step = X" 或 "第 X 步"
    const text = (step.message || '') + ' ' + (step.log || '');
    const match = text.match(/(?:step\s*[=:]\s*|第\s*)(\d+)(?:\s*步)?/i);
    if (match && match[1]) {
      return Math.max(0, parseInt(match[1], 10));
    }

    return 0;
  }

  /**
   * 将单步数据转换为分层立体体素数据
   */
  public static adapt(
    step: DpTraceStep | UniversalStep | any,
    options: LayeredAdaptOptions
  ): LayeredVoxelStepData {
    const { layers, rows, cols } = options;
    const baseCube = options.previousCube
      ? this.cloneCube(options.previousCube)
      : this.createEmptyCube(layers, rows, cols);

    const rawK = this.extractLayerIndex(step);
    const k = Math.max(0, Math.min(layers - 1, rawK));

    // 解析当前坐标 (r, c)
    let curR: number | undefined;
    let curC: number | undefined;

    if (step.current) {
      if (typeof step.current.row === 'number') curR = step.current.row;
      if (typeof step.current.col === 'number') curC = step.current.col;
    }
    if (curR === undefined && typeof step.i === 'number') curR = step.i;
    if (curC === undefined && typeof step.j === 'number') curC = step.j;

    // 同步二维网格数据 (dp2d 或 grid) 到当前层 k
    if (Array.isArray(step.dp2d)) {
      for (let r = 0; r < Math.min(rows, step.dp2d.length); r++) {
        const rowData = step.dp2d[r];
        if (Array.isArray(rowData)) {
          for (let c = 0; c < Math.min(cols, rowData.length); c++) {
            const cell = rowData[c];
            if (cell) {
              const val = cell.value !== undefined ? cell.value : 0;
              let status: VoxelStatus = 'computed';
              if (cell.state === 'active' || (r === curR && c === curC)) {
                status = 'active';
              } else if (cell.state === 'default' && (val === 0 || val === '0')) {
                status = 'empty';
              }
              baseCube[k][r][c] = { value: val, status };
            }
          }
        }
      }
    } else if (Array.isArray(step.grid)) {
      for (let r = 0; r < Math.min(rows, step.grid.length); r++) {
        const rowData = step.grid[r];
        if (Array.isArray(rowData)) {
          for (let c = 0; c < Math.min(cols, rowData.length); c++) {
            const val = rowData[c];
            if (val !== null && val !== undefined) {
              const isActive = (r === curR && c === curC);
              baseCube[k][r][c] = {
                value: val,
                status: isActive ? 'active' : (val > 0 ? 'computed' : 'empty')
              };
            }
          }
        }
      }
    }

    // 确保当前活跃格状态为 active
    if (curR !== undefined && curC !== undefined && curR < rows && curC < cols) {
      baseCube[k][curR][curC].status = 'active';
    }

    // 提取跨层依赖 (Dependencies)
    const interLayerDependencies: InterLayerDependency[] = [];
    const prevK = k > 0 ? k - 1 : 0;

    if (Array.isArray(step.dependencies) && curR !== undefined && curC !== undefined) {
      step.dependencies.forEach((dep: any) => {
        const depR = dep.row ?? dep.r;
        const depC = dep.col ?? dep.c;
        const depK = dep.k !== undefined ? dep.k : prevK;

        if (typeof depR === 'number' && typeof depC === 'number') {
          if (depR >= 0 && depR < rows && depC >= 0 && depC < cols && depK < layers) {
            interLayerDependencies.push({
              from: { k: depK, r: depR, c: depC },
              to: { k, r: curR!, c: curC! }
            });

            // 标记得依赖的体素单元
            if (baseCube[depK]?.[depR]?.[depC]) {
              baseCube[depK][depR][depC].status = 'dependency';
            }
          }
        }
      });
    }

    return {
      currentK: k,
      currentR: curR,
      currentC: curC,
      cube: baseCube,
      interLayerDependencies,
      message: step.message || step.msg || step.log || ''
    };
  }

  /**
   * 从步骤历史列表中累积构建到当前步的完整 3D 状态空间切片
   */
  public static buildCubeFromSteps(
    steps: (DpTraceStep | UniversalStep | any)[],
    currentIndex: number,
    dimensions: { layers: number; rows: number; cols: number }
  ): LayeredVoxelStepData {
    const { layers, rows, cols } = dimensions;
    let accumulatedCube = this.createEmptyCube(layers, rows, cols);
    const targetIdx = Math.max(0, Math.min(steps.length - 1, currentIndex));

    let lastResult: LayeredVoxelStepData = {
      currentK: 0,
      cube: accumulatedCube
    };

    for (let i = 0; i <= targetIdx; i++) {
      const step = steps[i];
      if (!step) continue;
      // 累积更新上一层的最终状态
      const result = this.adapt(step, {
        layers,
        rows,
        cols,
        previousCube: accumulatedCube
      });

      // 在历史累积中，除了当前最后一步之外，将其余步的 active 降级为 computed
      if (i < targetIdx) {
        accumulatedCube = this.cloneCube(result.cube);
        const k = result.currentK;
        if (accumulatedCube[k]) {
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (accumulatedCube[k][r][c].status === 'active' || accumulatedCube[k][r][c].status === 'dependency') {
                accumulatedCube[k][r][c].status = 'computed';
              }
            }
          }
        }
      } else {
        lastResult = result;
      }
    }

    return lastResult;
  }
}
