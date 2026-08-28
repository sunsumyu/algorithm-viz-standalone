import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';

/**
 * 算法多态策略注册工厂 (Algorithm Strategy Registry)
 * 遵循工厂模式 (Factory Pattern) 与开放封闭原则 (OCP)
 */
export class AlgorithmStrategyRegistry {
  private static strategies: Map<string, IAlgorithmStrategy> = new Map();

  private static defaultInitializer: (() => void) | null = null;

  public static setDefaultInitializer(fn: () => void): void {
    this.defaultInitializer = fn;
  }

  private static ensureDefaults(): void {
    if (this.defaultInitializer && this.strategies.size === 0) {
      this.defaultInitializer();
    }
  }

  /**
   * 注册算法策略
   */
  public static register(strategy: IAlgorithmStrategy): void {
    this.strategies.set(strategy.modelId, strategy);
  }

  /**
   * 获取指定算法策略
   */
  public static get(modelId: string): IAlgorithmStrategy | undefined {
    this.ensureDefaults();
    const direct = this.strategies.get(modelId);
    if (direct) return direct;
    for (const strategy of this.strategies.values()) {
      if (strategy.canHandle(modelId)) {
        this.strategies.set(modelId, strategy);
        return strategy;
      }
    }
    return undefined;
  }

  /**
   * 检查是否已注册策略
   */
  public static has(modelId: string): boolean {
    return this.get(modelId) !== undefined;
  }

  /**
   * 尝试通过策略生成单步序列
   */
  public static tryGenerate(
    model: IYamlAlgorithmModel,
    params: StageExecutionParams
  ): UniversalStep[] | null {
    const strategy = this.get(model.id);
    if (strategy && strategy.canHandle(model.id)) {
      return strategy.generateSteps(model, params);
    }
    return null;
  }

  /**
   * 清理已注册策略 (主要用于单元测试隔离)
   */
  public static clear(): void {
    this.strategies.clear();
  }
}
