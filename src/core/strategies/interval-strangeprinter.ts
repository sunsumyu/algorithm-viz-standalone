import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { buildStrangePrinterSteps } from '../renderers/adapters/strange-printer-step-compiler';

/**
 * 奇怪的打印机 (Strange Printer, LC 664, 左程云 85 课)
 * 职责：薄策略领域适配器，遵循深模块设计哲学与身材红线 (LOC < 120)，
 * 规约提取运行时参数并委托给核心族群推演编译器。
 */
export function compileStrangePrinter(
  _model: IYamlAlgorithmModel,
  params: StageExecutionParams
): UniversalStep[] {
  return buildStrangePrinterSteps({
    stage: params.stage,
    direction: params.direction,
    isMemo: params.isMemo,
    anchorMap: params.anchorMap,
    params: params.params,
  });
}
