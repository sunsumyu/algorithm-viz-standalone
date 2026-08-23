/**
 * Evolution Strategy Registry & Dispatcher (DP 演化策略注册与派发引擎)
 */

import { IEvolutionStrategy, EvolutionCodeContext, EvolutionStepContext, StageCodeConfig, AlgoCategory, detectCategory } from './types';
import { GridEvolutionStrategy } from './grid-strategy';
import { LinearEvolutionStrategy } from './linear-strategy';
import { GenericEvolutionStrategy } from './generic-strategy';
import { DpDemoStep } from '../dp-demo-visualizer';

export * from './types';
export * from './grid-strategy';
export * from './linear-strategy';
export * from './generic-strategy';

export class EvolutionStrategyDispatcher {
  private static instance: EvolutionStrategyDispatcher;
  private strategies: IEvolutionStrategy[] = [];
  private fallbackStrategy = new GenericEvolutionStrategy();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): EvolutionStrategyDispatcher {
    if (!EvolutionStrategyDispatcher.instance) {
      EvolutionStrategyDispatcher.instance = new EvolutionStrategyDispatcher();
    }
    return EvolutionStrategyDispatcher.instance;
  }

  private registerDefaults(): void {
    this.strategies.push(new GridEvolutionStrategy());
    this.strategies.push(new LinearEvolutionStrategy());
  }

  public registerStrategy(strategy: IEvolutionStrategy): void {
    this.strategies.unshift(strategy);
  }

  public findStrategy(category: AlgoCategory, algoId: string): IEvolutionStrategy {
    for (const s of this.strategies) {
      if (s.canHandle(category, algoId)) {
        return s;
      }
    }
    return this.fallbackStrategy;
  }

  public getCodeConfig(ctx: EvolutionCodeContext): StageCodeConfig {
    const strategy = this.findStrategy(ctx.category, ctx.algoId);
    const res = strategy.getCodeConfig(ctx);
    if (res) return res;
    return this.fallbackStrategy.getCodeConfig(ctx)!;
  }

  public buildSteps(ctx: EvolutionStepContext): DpDemoStep[] {
    const strategy = this.findStrategy(ctx.category, ctx.algoId);
    const steps = strategy.buildSteps(ctx);
    if (steps && steps.length > 0) return steps;
    return this.fallbackStrategy.buildSteps(ctx) || ctx.baseSteps;
  }
}

export const evolutionDispatcher = EvolutionStrategyDispatcher.getInstance();
