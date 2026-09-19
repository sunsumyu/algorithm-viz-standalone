/**
 * 通用物理语义投影与 TDD 门禁断言套件 (UniversalPhysicsGate)
 * 
 * 核心目标：
 * 毫秒级无头断言，物理拦截跳步、漏步、零位丢失、假逆推、决策数据缺失等各种绑定 Bug。
 */

import { expect } from 'vitest';
import type { UniversalStep } from '../universal-stage-engine';

export interface PhysicsGateOptions {
  algorithmId: string;
  stage?: number;
  direction?: 'forward' | 'reverse';
  minSteps?: number;
  requireZeroSlot?: boolean;
  requireJump?: boolean;
  requireDecisions?: boolean;
  maxLineCount?: number;
}

export class UniversalPhysicsGate {
  /**
   * 针对单一阶段/方向的通用物理不变量断言
   */
  public static assertStepInvariants(
    steps: UniversalStep[],
    options: PhysicsGateOptions
  ): void {
    const {
      algorithmId,
      minSteps = 8,
      requireZeroSlot = true,
      requireJump = true,
      requireDecisions = true,
      maxLineCount
    } = options;

    expect(steps, `${algorithmId} 生成步骤未定义或不是数组`).toBeDefined();
    expect(Array.isArray(steps), `${algorithmId} 生成步骤不是数组`).toBe(true);

    // 1. 步数充足度断言：杜绝粗制滥造跳步
    expect(
      steps.length,
      `${algorithmId} 步骤数过短 (${steps.length} < ${minSteps})，存在跳步或未完整推导`
    ).toBeGreaterThanOrEqual(minSteps);

    // 2. 零值槽位物理安全断言：槽位 0 绝不能因假值隐式转换被吞没
    if (requireZeroSlot) {
      const hasZeroSlot = steps.some(s => 
        s.actorState?.currentSlot === 0 ||
        s.activeSlot === 0 ||
        s.j === 0 ||
        s.currentJ === 0
      );
      expect(
        hasZeroSlot,
        `${algorithmId} 步骤流中缺少槽位 0 (可能发生 (0 || fallback) 假值截断 Bug)`
      ).toBe(true);
    }

    // 3. 物理实体跳跃/位移有效性断言
    if (requireJump) {
      const hasMovement = steps.some(s => {
        if (s.actorState?.jumpFrom !== undefined) {
          return s.actorState.jumpFrom !== s.actorState.currentSlot;
        }
        return false;
      });
      expect(
        hasMovement,
        `${algorithmId} 物理实体在整个推导过程中始终停留在原地，未检测到任何跨槽跳跃`
      ).toBe(true);
    }

    // 4. Card 2 决策/状态转移天平完整性断言：转移帧必须提供两路及以上分支数据或二维依赖项
    if (requireDecisions) {
      const transferSteps = steps.filter(s => s.type === 'transfer');
      expect(
        transferSteps.length,
        `${algorithmId} 缺少 transfer 状态转移帧`
      ).toBeGreaterThan(0);

      for (const step of transferSteps) {
        const hasDecisions = Array.isArray(step.decisions) && step.decisions.length >= 2;
        const hasDecisionData = !!step.decisionData;
        const hasGridDeps = 
          step.topI !== undefined || 
          step.leftI !== undefined || 
          step.diagI !== undefined || 
          step.topVal !== undefined || 
          step.diagVal !== undefined || 
          step.leftVal !== undefined ||
          step.treeRoot !== undefined;
        expect(
          hasDecisions || hasDecisionData || hasGridDeps,
          `${algorithmId} 转移步骤 (${step.i}, ${step.j}) 缺少 Card 2 决策看板数据或转移依赖`
        ).toBe(true);
      }
    }

    // 5. 行号映射完整性断言
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const line = step.line ?? step.codeLine;
      if (line !== undefined) {
        expect(line, `${algorithmId} 第 ${i} 步行号非法: ${line}`).toBeGreaterThan(0);
        if (maxLineCount) {
          expect(line, `${algorithmId} 第 ${i} 步行号越界: ${line} > ${maxLineCount}`).toBeLessThanOrEqual(maxLineCount);
        }
      }
    }
  }

  /**
   * 顺推与逆推真实物理差异性断言
   */
  public static assertDivergence(
    forwardSteps: UniversalStep[],
    reverseSteps: UniversalStep[],
    algorithmId: string,
    options?: Partial<PhysicsGateOptions>
  ): void {
    // 顺推逆推均需通过单向不变量
    this.assertStepInvariants(forwardSteps, { algorithmId: `${algorithmId} [顺推]`, direction: 'forward', minSteps: 8, ...options });
    this.assertStepInvariants(reverseSteps, { algorithmId: `${algorithmId} [逆推]`, direction: 'reverse', minSteps: 8, ...options });

    // 提取两边的 transfer 槽位轨迹
    const fTransfers = forwardSteps.filter(s => s.type === 'transfer');
    const rTransfers = reverseSteps.filter(s => s.type === 'transfer');

    expect(fTransfers.length, `${algorithmId} 顺推缺少 transfer 转移步骤`).toBeGreaterThan(0);
    expect(rTransfers.length, `${algorithmId} 逆推缺少 transfer 转移步骤`).toBeGreaterThan(0);

    const fSlots = fTransfers.map(s => s.actorState?.currentSlot ?? s.activeSlot ?? s.j ?? 0);
    const rSlots = rTransfers.map(s => s.actorState?.currentSlot ?? s.activeSlot ?? s.j ?? 0);

    // 顺推最终槽位通常应大于起始槽位（自底向上）
    // 逆推最终槽位通常应小于起始槽位（自顶向下倒序）
    const fDelta = fSlots[fSlots.length - 1] - fSlots[0];
    const rDelta = rSlots[rSlots.length - 1] - rSlots[0];

    expect(
      fDelta !== 0 && rDelta !== 0 && Math.sign(fDelta) !== Math.sign(rDelta),
      `${algorithmId} 顺推与逆推在拓扑方向上未发生相反演化 (顺推 delta: ${fDelta}, 逆推 delta: ${rDelta})`
    ).toBe(true);
  }
}
