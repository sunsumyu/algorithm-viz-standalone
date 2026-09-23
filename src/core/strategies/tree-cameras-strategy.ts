/**
 * 监控二叉树策略适配器 (TreeCamerasStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，负责参数提取与委托核心编译器
 * 对应 LeetCode 968
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { compileBinaryTreeCameras } from './tree-binarytreecameras';
import { parseTreeArray } from './tree-dp-shared';

export class TreeCamerasStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('tree-cameras');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawRoot =
      options?.customInputs?.tree ??
      options?.customInputs?.root ??
      model.defaultParams?.root ??
      '[0,0,null,0,0]';
    const arr = parseTreeArray(rawRoot);

    return compileBinaryTreeCameras(
      model,
      arr,
      stage,
      options?.anchorMap,
      direction
    );
  }
}
