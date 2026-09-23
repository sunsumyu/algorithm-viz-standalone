/**
 * 组团买票 策略适配器 (GroupBuyTicketsStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，负责提取参数并委托统一深模块编译器
 * 对应 左程云 091 Code02 / 美团笔试真题
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class GroupBuyTicketsStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('group-buy-tickets');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawN =
      options?.customInputs?.n ??
      options?.customInputs?.['input-n'] ??
      model.defaultParams?.n ??
      5;

    const rawGames =
      options?.customInputs?.games ??
      options?.customInputs?.['input-games'] ??
      model.defaultParams?.games ??
      [[2, 10], [3, 12], [1, 8]];

    const n = typeof rawN === 'number' ? rawN : parseInt(String(rawN), 10) || 5;
    const games = this.parseGames(rawGames);

    return ResourceGreedyStepCompiler.compileGroupBuyTickets(
      model,
      {
        n,
        games,
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }

  private parseGames(raw: any): [number, number][] {
    const fallback: [number, number][] = [[2, 10], [3, 12], [1, 8]];
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw
        .map((item) => (Array.isArray(item) ? [Number(item[0]), Number(item[1])] : null))
        .filter((g): g is [number, number] => g !== null && !isNaN(g[0]) && !isNaN(g[1]));
      if (valid.length > 0) return valid;
    }
    if (typeof raw === 'string') {
      const pairs = raw.split(/[;；\n]+/).map((s) => s.trim()).filter(Boolean);
      const res: [number, number][] = [];
      for (const p of pairs) {
        const nums = p.split(/[,，\s]+/).map(Number).filter((n) => !isNaN(n));
        if (nums.length >= 2) res.push([nums[0], nums[1]]);
      }
      if (res.length > 0) return res;
    }
    return fallback;
  }
}
