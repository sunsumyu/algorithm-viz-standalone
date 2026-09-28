/**
 * 最低票价策略适配器 (MinCostTicketsStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，负责入参规约提取与多阶段编译委托
 * 对应 LeetCode 983 / 左程云算法通关课 Class 066
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import {
  buildMinCostTicketsStage1Steps,
  buildMinCostTicketsStage2Steps,
  buildMinCostTicketsStage4Steps,
} from '../../algorithms/categories/dynamic-programming/dp-066/min-cost-tickets-stages';
import { buildMinCostTickets066Steps } from '../../algorithms/categories/dynamic-programming/dp-066/min-cost-tickets-066-renderer';

export class MinCostTicketsStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('min-cost-tickets-066');
  }

  public override canHandle(modelId: string): boolean {
    return (
      modelId === 'min-cost-tickets-066' ||
      modelId === 'class066-code02' ||
      modelId === 'min-cost-tickets' ||
      modelId === 'min-cost-tickets-983' ||
      modelId === 'leetcode-983' ||
      modelId === 'min-cost-tickets-class066'
    );
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    _direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawDays = options?.customInputs?.days ?? model.defaultParams?.days;
    const rawCosts = options?.customInputs?.costs ?? model.defaultParams?.costs;

    const days = this.parseSequence(rawDays, [1, 4, 6, 7, 8, 20]);
    const costs = this.parseSequence(rawCosts, [2, 7, 15]);

    let rawSteps: any[] = [];
    switch (stage) {
      case 1:
        rawSteps = buildMinCostTicketsStage1Steps(days, costs);
        break;
      case 2:
        rawSteps = buildMinCostTicketsStage2Steps(days, costs);
        break;
      case 4:
        rawSteps = buildMinCostTicketsStage4Steps(days, costs);
        break;
      case 3:
      default:
        rawSteps = buildMinCostTickets066Steps(days, costs);
        break;
    }

    return rawSteps.map((step, idx) => ({
      ...step,
      stepId: idx,
      type: 'step',
      msg: step.message || step.msg,
      log: step.message || step.log,
      dp1d: step.dp,
      memo: step.memo || step.dp,
      stateArrays: [
        {
          id: 'dp',
          name: 'dp (最低累计花费)',
          values: step.dp || [],
          highlightIndices: step.currentI !== undefined ? [step.currentI] : [],
        },
      ],
    }));
  }

  private parseSequence(raw: any, fallback: number[]): number[] {
    if (Array.isArray(raw)) return raw.map(Number);
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map(Number);
        } catch {
          // ignore
        }
      }
      return trimmed.split(/[\s,]+/).filter(Boolean).map(Number);
    }
    return fallback;
  }
}
