import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';

/**
 * 🏛️ [BaseAlgorithmStrategy] 算法多态策略模板方法抽象基类 (Template Method Pattern)
 * 
 * 核心设计模式价值：
 * 1. Template Method 模式：定义算法推导的核心骨架流程 (入参校验 -> 阶段路由 -> 步骤生成 -> 不变量后置保护)；
 * 2. 彻底消灭重复代码：统一封装 canHandle、参数提取、阶段检查，子类身材严控在 40~80 行，远低于 120 行身材红线；
 * 3. 物理死门禁前置防御：在步骤返回前强制执行 stepIndex 单调连续校验、step.stage 统一校准、代码行号同构注入。
 */
export abstract class BaseAlgorithmStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;
  protected readonly supportedIds: Set<string>;

  constructor(primaryId: string, additionalIds: string[] = []) {
    this.modelId = primaryId;
    this.supportedIds = new Set([primaryId, ...additionalIds]);
  }

  /**
   * 判定当前策略是否能够接管指定算法
   */
  public canHandle(algorithmId: string): boolean {
    return this.supportedIds.has(algorithmId);
  }

  /**
   * 模板方法：统一推导骨架流程
   */
  public generateSteps(
    model: IYamlAlgorithmModel,
    params: StageExecutionParams
  ): UniversalStep[] {
    if (!model) {
      throw new Error(`[BaseAlgorithmStrategy] 无法推导演示：model 未提供！`);
    }

    if (!this.canHandle(model.id)) {
      throw new Error(`[BaseAlgorithmStrategy] 策略不匹配：当前策略不支持算法 "${model.id}"！`);
    }

    const stage = Math.max(1, Math.min(params?.stage ?? 1, 5));
    const direction = (params?.direction as 'forward' | 'reverse') || 'forward';

    // 委托子类完成具体阶段的数学归约与核心推导
    const rawSteps = this.compileStage(model, stage, direction, params);

    if (!Array.isArray(rawSteps) || rawSteps.length === 0) {
      throw new Error(`[BaseAlgorithmStrategy] 算法 "${model.id}" (阶段 ${stage}) 推导步骤为空！禁止交付空白演示！`);
    }

    // 后置不变量统一治理与安全网守卫
    return this.postProcessSteps(rawSteps, stage);
  }

  /**
   * 子类必须实现的领域归约与阶段推导方法
   */
  protected abstract compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    params: StageExecutionParams
  ): UniversalStep[];

  /**
   * 后置处理：物理保证步骤索引单调自增、stage 标记对齐、代码行号同构镜像
   */
  protected postProcessSteps(steps: UniversalStep[], targetStage: number): UniversalStep[] {
    return steps.map((step, idx) => {
      // 1. 强制索引单调自增
      step.stepIndex = idx;

      // 2. 强制 stage 标记与当前请求阶段对齐
      if (step.stage === undefined || step.stage !== targetStage) {
        step.stage = targetStage;
      }

      // 3. 强制代码行号有效性与同构镜像
      const effectiveLine = step.line !== undefined ? step.line : (step as any).codeLine;
      if (typeof effectiveLine === 'number' && effectiveLine >= 1) {
        step.line = effectiveLine;
        (step as any).codeLine = effectiveLine;
      } else {
        step.line = 1;
        (step as any).codeLine = 1;
      }

      return step;
    });
  }
}
