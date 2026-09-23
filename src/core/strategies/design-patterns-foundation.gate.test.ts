import { describe, it, expect } from 'vitest';
import { UniversalStepBuilder } from '../builders/universal-step-builder';
import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';

describe('🏛️ Design Patterns Foundation & Standard Architecture Gate', () => {
  describe('UniversalStepBuilder (Builder Pattern)', () => {
    it('应能链式构造完整的 UniversalStep 并自动同步 codeLine 镜像', () => {
      const step = UniversalStepBuilder.create(0)
        .stage(2)
        .line(12)
        .decision('决策说明')
        .message('详细语义')
        .slot(3)
        .variables({ count: 5 })
        .metrics({ 'status': '推演中' })
        .build();

      expect(step.stage).toBe(2);
      expect(step.line).toBe(12);
      expect((step as any).codeLine).toBe(12); // 同构镜像断言
      expect(step.decision).toBe('决策说明');
      expect(step.activeSlot).toBe(3);
      expect(step.variables?.count).toBe(5);
    });

    it('当步骤缺少有效行号或行号小于 1 时，必须抛出物理不变量异常', () => {
      expect(() => {
        UniversalStepBuilder.create(1)
          .stage(1)
          .decision('test')
          // 未设置 line
          .build();
      }).toThrow(/INVARIANT_VIOLATION/);
    });

    it('当步骤缺少文字说明时，必须抛出物理不变量异常，杜绝偷懒假实现', () => {
      expect(() => {
        UniversalStepBuilder.create(1)
          .stage(1)
          .line(5)
          // 未设置 decision
          .build();
      }).toThrow(/INVARIANT_VIOLATION/);
    });
  });

  describe('BaseAlgorithmStrategy (Template Method Pattern)', () => {
    class MockDomainStrategy extends BaseAlgorithmStrategy {
      constructor() {
        super('mock-algo-1', ['mock-algo-2']);
      }

      protected compileStage(
        _model: IYamlAlgorithmModel,
        _stage: number,
        _direction: 'forward' | 'reverse',
        _params: any
      ): UniversalStep[] {
        return [
          {
            stepIndex: 999, // 故意传乱的索引
            line: 7,
            decision: 'Mock 步骤 1',
          } as any,
          {
            stepIndex: 888,
            line: 8,
            decision: 'Mock 步骤 2',
          } as any,
        ];
      }
    }

    const strategy = new MockDomainStrategy();
    const mockModel: IYamlAlgorithmModel = {
      id: 'mock-algo-1',
      name: 'Mock',
      category: 'greedy',
    } as any;

    it('应当准确支持多算法 ID 路由识别', () => {
      expect(strategy.canHandle('mock-algo-1')).toBe(true);
      expect(strategy.canHandle('mock-algo-2')).toBe(true);
      expect(strategy.canHandle('unknown')).toBe(false);
    });

    it('模板方法应自动进行后置处理：单调索引修复、stage 对齐与代码行号同构保障', () => {
      const steps = strategy.generateSteps(mockModel, { stage: 3, direction: 'forward' });
      expect(steps.length).toBe(2);

      // 验证索引自增归一化
      expect(steps[0].stepIndex).toBe(0);
      expect(steps[1].stepIndex).toBe(1);

      // 验证 stage 强制对齐当前阶段
      expect(steps[0].stage).toBe(3);
      expect(steps[1].stage).toBe(3);

      // 验证行号镜像同构
      expect(steps[0].line).toBe(7);
      expect((steps[0] as any).codeLine).toBe(7);
    });

    it('当子类返回空数组时，模板方法必须硬抛错拦截，绝不交付空白演示', () => {
      class EmptyStrategy extends BaseAlgorithmStrategy {
        constructor() { super('empty-algo'); }
        protected compileStage(): UniversalStep[] { return []; }
      }
      const empty = new EmptyStrategy();
      expect(() => {
        empty.generateSteps({ id: 'empty-algo' } as any, { stage: 1 });
      }).toThrow(/推导步骤为空！禁止交付空白演示/);
    });

    it('所有已迁移的贪心策略类必须 100% 继承 BaseAlgorithmStrategy 模板基类', async () => {
      const { AssignCookiesStrategy } = await import('./assign-cookies-strategy');
      const { CandyStrategy } = await import('./candy-strategy');
      const { MinArrowsStrategy } = await import('./min-arrows-strategy');
      const { NonOverlappingStrategy } = await import('./non-overlapping-strategy');
      const { MergeIntervalsStrategy } = await import('./merge-intervals-strategy');
      const { PartitionLabelsStrategy } = await import('./partition-labels-strategy');
      const { LemonadeStrategy } = await import('./lemonade-strategy');
      const { MonotoneDigitsStrategy } = await import('./monotone-digits-strategy');
      const { MaximizeSumKStrategy } = await import('./maximize-sum-k-strategy');
      const { GasStationStrategy } = await import('./gas-station-strategy');
      const { WiggleSubsequenceStrategy } = await import('./wiggle-subsequence-strategy');
      const { ReconstructQueueStrategy } = await import('./reconstruct-queue-strategy');
      const { MaxSubarrayStrategy } = await import('./max-subarray-strategy');
      const { TaskSchedulerStrategy } = await import('./task-scheduler-strategy');
      const { TreeCamerasStrategy } = await import('./tree-cameras-strategy');
      const { TwoCitySchedulingStrategy } = await import('./two-city-scheduling-strategy');
      const { MeetingRoomsIIStrategy } = await import('./meeting-rooms-ii-strategy');
      const { CourseScheduleIIIStrategy } = await import('./course-schedule-iii-strategy');
      const { LargestNumberStrategy } = await import('./largest-number-strategy');
      const { MinimumCostConnectSticksStrategy } = await import('./minimum-cost-connect-sticks-strategy');
      const { MinimumEatOrangesStrategy } = await import('./minimum-eat-oranges-strategy');
      const { AbsoluteValueAddToArrayStrategy } = await import('./absolute-value-add-to-array-strategy');
      const { CuttingBambooStrategy } = await import('./cutting-bamboo-strategy');
      const { IPOStrategy } = await import('./ipo-strategy');
      const { MaximumProductKPartsStrategy } = await import('./maximum-product-k-parts-strategy');
      const { MeetingMonopolyStrategy } = await import('./meeting-monopoly-strategy');
      const { MeetingOneDayStrategy } = await import('./meeting-one-day-strategy');
      const { SplitMinAvgSumStrategy } = await import('./split-min-avg-sum-strategy');
      const { GroupBuyTicketsStrategy } = await import('./group-buy-tickets-strategy');

      const strategyClasses = [
        AssignCookiesStrategy,
        CandyStrategy,
        MinArrowsStrategy,
        NonOverlappingStrategy,
        MergeIntervalsStrategy,
        PartitionLabelsStrategy,
        LemonadeStrategy,
        MonotoneDigitsStrategy,
        MaximizeSumKStrategy,
        GasStationStrategy,
        WiggleSubsequenceStrategy,
        ReconstructQueueStrategy,
        MaxSubarrayStrategy,
        TaskSchedulerStrategy,
        TreeCamerasStrategy,
        TwoCitySchedulingStrategy,
        MeetingRoomsIIStrategy,
        CourseScheduleIIIStrategy,
        LargestNumberStrategy,
        MinimumCostConnectSticksStrategy,
        MinimumEatOrangesStrategy,
        AbsoluteValueAddToArrayStrategy,
        CuttingBambooStrategy,
        IPOStrategy,
        MaximumProductKPartsStrategy,
        MeetingMonopolyStrategy,
        MeetingOneDayStrategy,
        SplitMinAvgSumStrategy,
        GroupBuyTicketsStrategy,
      ];

      for (const StrategyCls of strategyClasses) {
        const instance = new StrategyCls();
        expect(
          instance instanceof BaseAlgorithmStrategy,
          `❌ [PATTERN_VIOLATION] ${StrategyCls.name} 未继承 BaseAlgorithmStrategy 模板方法基类！`
        ).toBe(true);
      }
    });
  });
});
