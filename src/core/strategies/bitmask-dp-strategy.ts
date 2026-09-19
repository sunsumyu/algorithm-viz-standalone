import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { compileCanIWin } from './bitmask-caniwin';
import { compileMatchsticks } from './bitmask-matchsticks';
import { compilePartitionK } from './bitmask-partitionk';
import { compileTsp } from './bitmask-tsp';
import { compileWearHats } from './bitmask-wearhats';
import { compileOptimalAccount } from './bitmask-optimalaccount';
import { compileGoodSubsets } from './bitmask-goodsubsets';
import { compileDistributeRepeating } from './bitmask-distributerepeating';

export type BitmaskDpModelId =
  | 'can-i-win'
  | 'matchsticks-to-square'
  | 'partition-k-equal-subsets'
  | 'tsp-bitmask-dp'
  | 'number-of-ways-wear-hats'
  | 'optimal-account-balancing'
  | 'good-subsets'
  | 'distribute-repeating-integers';

/**
 * 状压DP策略门面 (Bitmask DP Strategy Facade)
 * 第080讲、第081讲：状压dp 上/下
 * 严格遵循单一职责原则 (SRP) 与深模块原则，全部 8 大状压算法已完成独立深模块拆分：
 * 1. can-i-win (LC 464) -> bitmask-caniwin.ts
 * 2. matchsticks-to-square (LC 473) -> bitmask-matchsticks.ts
 * 3. partition-k-equal-subsets (LC 698) -> bitmask-partitionk.ts
 * 4. tsp-bitmask-dp (旅行商问题) -> bitmask-tsp.ts
 * 5. number-of-ways-wear-hats (LC 1434) -> bitmask-wearhats.ts
 * 6. optimal-account-balancing (LC 465) -> bitmask-optimalaccount.ts
 * 7. good-subsets (LC 1994) -> bitmask-goodsubsets.ts
 * 8. distribute-repeating-integers (LC 1655) -> bitmask-distributerepeating.ts
 */
export class BitmaskDpStrategy implements IAlgorithmStrategy {
  readonly modelId: string;

  constructor(private algo: BitmaskDpModelId) {
    this.modelId = algo;
  }

  canHandle(modelId: string): boolean {
    return modelId === this.algo || modelId === this.modelId;
  }

  generateSteps(
    model: IYamlAlgorithmModel,
    params: StageExecutionParams
  ): UniversalStep[] {
    return this.tryGenerate(model, params) ?? [];
  }

  tryGenerate(
    model: IYamlAlgorithmModel,
    params: StageExecutionParams
  ): UniversalStep[] | null {
    if (model.id !== this.algo) return null;

    switch (this.algo) {
      case 'can-i-win':
        return compileCanIWin(model, params);
      case 'matchsticks-to-square':
        return compileMatchsticks(model, params);
      case 'partition-k-equal-subsets':
        return compilePartitionK(model, params);
      case 'tsp-bitmask-dp':
        return compileTsp(model, params);
      case 'number-of-ways-wear-hats':
        return compileWearHats(model, params);
      case 'optimal-account-balancing':
        return compileOptimalAccount(model, params);
      case 'good-subsets':
        return compileGoodSubsets(model, params);
      case 'distribute-repeating-integers':
        return compileDistributeRepeating(model, params);
      default:
        return null;
    }
  }
}
