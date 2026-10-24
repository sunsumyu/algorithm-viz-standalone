/**
 * 全局单步执行与动作相协同引擎 (StepExecutionSynchronizer) — 核心深模块
 *
 * 核心职责：
 * 1. 【执行动作相与智能内联提示 (Action-Aware Inline Hints)】：
 *    自动识别当前步骤的原子动作相（初始化 / 循环遍历 / 试选分支 / 状态转移 / 自增步进），
 *    在代码行右侧生成直观的 IDEA 级调试提示，如：
 *    - `// [试选 k=1 枚] i: 2, j: 2, k: 1`
 *    - `// [自增 k++] k: 1 ➔ 2 | i: 2, j: 2`
 *    - `// [转移比较] dp[2][2] = 101 | cand: 8`
 *
 * 2. 【多面板实体编号归一化 (Entity Identity Normalization)】：
 *    消除 0-based 数组下标与 1-based DP 矩阵/代码在外层展示时的矛盾，
 *    统一输出人类友好的实体编号（如 "硬币栈 #1", "硬币栈 #2"），杜绝四面板编号冲突。
 */

import { LoopIndexReconciler } from './loop-index-reconciler';
import type { ResolvedVariable } from './variable-context-resolver';

export interface StepActionContext {
  type?: string;
  tag?: string;
  decision?: string;
  log?: string;
  i?: number;
  j?: number;
  k?: number;
  prevK?: number;
  c?: number;
  val?: number;
  cand?: number;
  [key: string]: unknown;
}

export class StepExecutionSynchronizer {
  /**
   * 归一化实体展示标签，消除 0-based 与 1-based 的多面板脑裂
   * @param entityType 实体类型 ('pile' | 'group' | 'item' | 'bag')
   * @param rawIndex 原始索引值 (0 或 1)
   * @param isOneBasedContext 当前上下文是否为 1-based (如 Stage 3 DP 表)
   */
  public static formatEntityLabel(
    entityType: 'pile' | 'group' | 'item' | 'bag',
    rawIndex: number,
    isOneBasedContext: boolean = true
  ): string {
    const displayNum = isOneBasedContext ? (rawIndex === 0 ? 1 : rawIndex) : rawIndex + 1;
    switch (entityType) {
      case 'pile':
        return `硬币栈 #${displayNum}`;
      case 'group':
        return `第 ${displayNum} 组`;
      case 'item':
        return `物品 #${displayNum}`;
      case 'bag':
        return `背包 #${displayNum}`;
      default:
        return `#${displayNum}`;
    }
  }

  /**
   * 提取当前执行步骤的动作相标签 (Action Phase Badge)
   */
  public static extractActionPhaseBadge(
    lineCode?: string,
    stepContext?: StepActionContext
  ): string {
    if (!stepContext && !lineCode) return '';

    const type = stepContext?.type || '';
    const decision = stepContext?.decision || '';

    // 1. 显式步进自增相
    if (type === 'loop-step' || type === 'increment' || decision.includes('自增') || decision.includes('k++')) {
      if (typeof stepContext?.prevK === 'number' && typeof stepContext?.k === 'number') {
        return `[自增 k++] ${stepContext.prevK} ➔ ${stepContext.k}`;
      }
      return '[循环自增 k++]';
    }

    // 2. 循环枚举分支试选相
    if (type === 'loop-coins' || decision.includes('拿') || decision.includes('选')) {
      const kVal = stepContext?.k ?? stepContext?.c;
      if (typeof kVal === 'number') {
        return `[试选 k=${kVal} 枚]`;
      }
      return '[互斥分支试算]';
    }

    // 3. 状态转移比较与更新相
    if (type === 'transition' || type === 'update' || type === 'update-cell') {
      if (typeof stepContext?.cand === 'number') {
        return `[转移比较] 候选=${stepContext.cand}`;
      }
      return '[转移比较]';
    }

    // 4. 不选当前组 / 继承上一组
    if (type === 'branch-not-take' || decision.includes('不拿') || decision.includes('不选')) {
      return '[继承前状态 (k=0)]';
    }

    // 5. 内层容量循环
    if (type === 'inner-cap') {
      const jVal = stepContext?.j;
      return typeof jVal === 'number' ? `[考察容量 j=${jVal}]` : '[考察容量]';
    }

    // 6. 外层遍历循环
    if (type === 'outer-loop') {
      const iVal = stepContext?.i;
      return typeof iVal === 'number' ? `[考察栈 #${iVal}]` : '[外层循环]';
    }

    // 7. 简短提炼 decision
    if (decision && decision.length <= 8) {
      return `[${decision}]`;
    }

    return '';
  }

  /**
   * 构造动作相感知的行末内联调试提示文本
   */
  public static formatActionInlineHint(
    varsMap: Map<string, ResolvedVariable>,
    lineCode?: string,
    stepContext?: StepActionContext
  ): string {
    if (!varsMap || varsMap.size === 0 || !lineCode) {
      return '';
    }

    const actionBadge = this.extractActionPhaseBadge(lineCode, stepContext);

    // 1. 提取当前行声明或引用的变量
    const idents = new Set<string>();
    const matches = lineCode.match(/\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g);
    if (matches) {
      for (const m of matches) {
        idents.add(m);
      }
    }

    // 2. 核心上下文保活：根据当前执行相精准限定作用域变量，杜绝内层变量泄露到外层循环头
    const isInnerCoinLoop =
      stepContext?.type === 'loop-coins' ||
      stepContext?.type === 'transition' ||
      stepContext?.type === 'loop-step' ||
      (stepContext?.k !== undefined && stepContext?.type !== 'inner-cap' && stepContext?.type !== 'outer-loop');
    const isInnerCapLoop =
      stepContext?.type === 'inner-cap' ||
      stepContext?.j !== undefined ||
      isInnerCoinLoop;

    const isOuterOrLoopContext =
      stepContext?.type === 'outer-loop' ||
      stepContext?.type === 'inner-cap' ||
      stepContext?.type === 'loop-coins' ||
      stepContext?.type === 'transition' ||
      stepContext?.type === 'loop-step' ||
      stepContext?.i !== undefined;

    const coreContextVars: string[] = [];
    if (isOuterOrLoopContext) coreContextVars.push('i');
    if (isInnerCapLoop) coreContextVars.push('j');
    if (isInnerCoinLoop) coreContextVars.push('k');
    if (stepContext?.t !== undefined) coreContextVars.push('t');

    for (const cv of coreContextVars) {
      if (varsMap.has(cv)) {
        idents.add(cv);
      }
    }

    const matchedVars: string[] = [];
    for (const id of idents) {
      const v = varsMap.get(id);
      if (v && v.value && !v.value.startsWith('{') && !v.value.startsWith('[')) {
        const reconciled = LoopIndexReconciler.reconcileVariableValue(id, v.value, undefined, lineCode);
        const displayVal = reconciled.value;
        if (!matchedVars.some((item) => item.startsWith(`${v.name}:`))) {
          matchedVars.push(`${v.name}: ${displayVal}`);
        }
      }
    }

    const varSummary = matchedVars.slice(0, 4).join(', ');
    if (actionBadge && varSummary) {
      return `// ${actionBadge} | ${varSummary}`;
    }
    if (actionBadge) {
      return `// ${actionBadge}`;
    }
    if (varSummary) {
      return `// ${varSummary}`;
    }
    return '';
  }
}
