/**
 * TableStepEngine — 阶段 2/3 步进轨迹追踪深模块
 *
 * 铁律：顶层强制约束和公用必须在顶层实现。
 * 记忆化搜索（阶段 2）与严格表递推（阶段 3）共享三项骨架不变量，在此唯一实现：
 *   1. stepIndex 严格 1..N 自增 — 引擎独占，算法无感
 *   2. totalSteps 终回填 — finalize() 一次性回填，杜绝散落的 `s.totalSteps = total` 尾巴
 *   3. codeLine 四语言解析 — 引擎统一调用 resolveLine，算法侧只传语义锚点
 *
 * 阶段 2 额外托管：hitCount / missCount 计数器（算法通过 registerHit/registerMiss 递增，
 * 每步快照当前累计值，杜绝散落的手写 `hitCount++` 与 step 间不一致）。
 *
 * 接口设计：pushStep 的 fields 类型为 Omit<TStep, 托管字段>——算法侧想写
 * stepIndex/action/codeLine/hitCount/missCount 会直接编译报错，骨架物理不可散落。
 */

import type { HighlightTarget } from '../renderers/dark-code-terminal-presenter';
import type { MemoStepBase, Dp2DStepBase } from '../step-types';

/** 记忆化阶段引擎托管字段 */
export type MemoManagedKeys = 'stepIndex' | 'totalSteps' | 'action' | 'codeLine' | 'hitCount' | 'missCount';
export type MemoDomainFields<TStep> = Omit<TStep, MemoManagedKeys>;

export interface MemoStepEngineSpec {
  maxSteps?: number;
  resolveLine: (anchor: string) => HighlightTarget;
}

/**
 * 记忆化搜索（阶段 2）步进引擎
 * 托管：stepIndex / totalSteps / action / codeLine / hitCount / missCount
 */
export class MemoTraceTracker<TStep extends MemoStepBase> {
  readonly steps: TStep[] = [];
  hitCount = 0;
  missCount = 0;

  private readonly maxSteps: number;
  private readonly resolveLine: (anchor: string) => HighlightTarget;

  constructor(spec: MemoStepEngineSpec) {
    this.maxSteps = spec.maxSteps ?? 800;
    this.resolveLine = spec.resolveLine;
  }

  get exhausted(): boolean {
    return this.steps.length >= this.maxSteps;
  }

  registerHit(): void {
    this.hitCount++;
  }

  registerMiss(): void {
    this.missCount++;
  }

  pushStep(action: string, codeKey: string, fields: MemoDomainFields<TStep>): void {
    if (this.exhausted) return;
    const step = {
      ...fields,
      action,
      stepIndex: this.steps.length + 1,
      totalSteps: 0,
      codeLine: this.resolveLine(codeKey),
      hitCount: this.hitCount,
      missCount: this.missCount,
    } as TStep;
    this.steps.push(step);
  }

  finalize(): TStep[] {
    const total = this.steps.length;
    this.steps.forEach((s) => (s.totalSteps = total));
    return this.steps;
  }
}

/** 严格表递推（阶段 3）引擎托管字段 */
export type Dp2DManagedKeys = 'stepIndex' | 'totalSteps' | 'action' | 'codeLine';
export type Dp2DDomainFields<TStep> = Omit<TStep, Dp2DManagedKeys>;

/**
 * 严格二维 DP（阶段 3）步进引擎
 * 托管：stepIndex / totalSteps / action / codeLine
 */
export class Dp2DTraceTracker<TStep extends Dp2DStepBase> {
  readonly steps: TStep[] = [];

  private readonly resolveLine: (anchor: string) => HighlightTarget;

  constructor(spec: { resolveLine: (anchor: string) => HighlightTarget }) {
    this.resolveLine = spec.resolveLine;
  }

  pushStep(action: string, codeKey: string, fields: Dp2DDomainFields<TStep>): void {
    const step = {
      ...fields,
      action,
      stepIndex: this.steps.length + 1,
      totalSteps: 0,
      codeLine: this.resolveLine(codeKey),
    } as TStep;
    this.steps.push(step);
  }

  finalize(): TStep[] {
    const total = this.steps.length;
    this.steps.forEach((s) => (s.totalSteps = total));
    return this.steps;
  }
}
