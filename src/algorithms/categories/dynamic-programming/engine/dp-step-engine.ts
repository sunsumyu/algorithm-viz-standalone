import type { DpTraceStep, AlgorithmSpec, DpCell } from './types';

export function clone1d<T>(arr: T[]): T[] {
  return [...arr];
}

export function clone2d<T>(arr: T[][]): T[][] {
  return arr.map((row) => [...row]);
}

export function makeTraceStep(partial: DpTraceStep): DpTraceStep {
  return {
    dependencies: [],
    vars: [],
    metrics: {},
    ...partial,
  };
}

export class DpStepEngine {
  private static registry = new Map<string, AlgorithmSpec>();

  private static ALIAS_MAP: Record<string, string> = {
    'climb': 'climb-stairs',
    'climbing-stairs': 'climb-stairs',
    'climb-stairs': 'climb-stairs',
    'min-cost-climbing-stairs': 'min-cost',
    'min-cost': 'min-cost',
    'min-path-sum': 'minimum-path-sum',
    'minimum-path-sum': 'minimum-path-sum',
    'partition-equal-subset-sum': 'partition-subset',
    'last-stone-weight-ii': 'last-stone-weight-ii',
    'longest-common-subsequence': 'lcs',
    'distinct-subseq': 'distinct-subsequences',
    'pal-count': 'palindromic-substrings',
    'pal-subseq': 'longest-palindromic-subsequence',
    '01-knapsack': '01-knapsack',
    'knapsack-01-2d': '01-knapsack',
    'knapsack-01-1d': '01-knapsack',
    'knapsack-01': '01-knapsack',
    'coin2': 'coin-change-ii',
    'combination4': 'combination-sum-iv',
    'climb-stairs-advanced': 'combination-sum-iv',
    'squares': 'perfect-squares',
    'rob': 'house-robber',
    'rob2': 'house-robber-ii',
    'rob3': 'house-robber-iii',
    'stock-1': 'best-time-to-buy-and-sell-stock',
    'stock-2': 'best-time-to-buy-and-sell-stock-ii',
    'stock-3': 'best-time-to-buy-and-sell-stock-iii',
    'stock-4': 'best-time-to-buy-and-sell-stock-iv',
    'stock-cooldown': 'best-time-to-buy-and-sell-stock-with-cooldown',
    'stock-fee': 'best-time-to-buy-and-sell-stock-with-transaction-fee',
    'best-time-stock': 'best-time-to-buy-and-sell-stock',
  };

  public static register(spec: AlgorithmSpec): void {
    this.registry.set(spec.id, spec);
  }

  public static get(id: string): AlgorithmSpec | undefined {
    const direct = this.registry.get(id);
    if (direct) return direct;
    const mapped = this.ALIAS_MAP[id];
    if (mapped) return this.registry.get(mapped);
    return undefined;
  }

  public static getAll(): AlgorithmSpec[] {
    return Array.from(this.registry.values());
  }

  public static execute(id: string, input: any): DpTraceStep[] {
    const spec = this.get(id);
    if (!spec) {
      console.warn(`[DpStepEngine] AlgorithmSpec '${id}' not found`);
      return [];
    }
    return spec.generateSteps(input);
  }

  public static generateSteps(id: string, input: any, mode?: any): DpTraceStep[] {
    return this.execute(id, input);
  }
}
