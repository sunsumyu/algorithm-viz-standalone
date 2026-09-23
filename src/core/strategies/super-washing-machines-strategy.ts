/**
 * 超级洗衣机 策略适配器 (SuperWashingMachinesStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为双向前后缀分解与邻域流水扫描族群，委托统一深模块编译器
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoPassNeighborStepCompiler } from './two-pass-neighbor-step-compiler';

export class SuperWashingMachinesStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('super-washing-machines');
  }

  public override canHandle(modelId: string): boolean {
    return modelId === 'super-washing-machines';
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    let machines =
      options?.customInputs?.machines ??
      options?.customInputs?.['input-machines'] ??
      options?.machines ??
      model.defaultParams?.machines;

    if (typeof machines === 'string') {
      machines = machines
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(x => !isNaN(x));
    }

    if (!Array.isArray(machines) || machines.length === 0) {
      machines = [1, 0, 5];
    }

    return TwoPassNeighborStepCompiler.compileSuperWashingMachines(
      model,
      machines,
      {
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }
}
