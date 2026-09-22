/**
 * 顶层抽象合规硬门禁测试 (Top-Level Abstraction Compliance Hard Gate)
 *
 * 强制约束（硬拦截！拒绝任何伪绿灯与软断言）：
 * 1. [ZERO_REGRESSION_GATE]: 所有官方已核准锁定的顶层抽象算法（DP & Greedy），
 *    必须 100% 具备 YAML 模型、Strategy 策略、挂载 UniversalStageVisualizer，
 *    且严禁使用 registerDeclarativeAlgorithm 方言。任何一项缺失立即红灯拦截！
 * 2. [BURNDOWN_LEGACY_GATE]: 未迁移的历史遗留算法实行严格燃烧白名单（Burndown Whitelist），
 *    绝不允许任何未经批准的新增非顶层抽象算法进入仓库！
 * 3. [MODEL_FIDELITY_GATE]: 仓库内全部 YAML 模型必须 100% 声明 forward/reverse 双向
 *    以及 stage-1 至 stage-4 四阶段演进！
 */

import { describe, it, expect } from 'vitest';
import { algorithmRegistry } from './algorithm-registry';
import { AlgorithmModelRepository } from './model-repository';
import { AlgorithmStrategyRegistry } from './strategies/index';
import { UniversalStageVisualizer } from '../algorithms/categories/dynamic-programming/unique-paths-renderer';
// 导入收获器以触发全量 611 个 renderer 的 eager 同步注册
import './algorithm-catalog-indexer';

/**
 * 官方已锁定的顶层抽象黄金基准算法清单 (Canonical ID)
 * 绝不允许任何退化！必须 100% 满足 YAML + Strategy + UniversalStageVisualizer
 */
export const LOCKED_TOP_LEVEL_ALGORITHMS = [
  // 贪心算法族群 (Greedy)
  'jump-game-ii',
  'jump-game',
  'can-jump',
  'minimum-number-of-taps-to-water-a-garden',
  'min-arrows',
  'non-overlapping',
  'merge-intervals',
  'partition-labels',
  'candy',
  'best-time-stock',

  // 动态规划族群 (Dynamic Programming)
  'unique-paths',
  'unique-paths-ii',
  'min-path-sum',
  'fibonacci',
  'climb-stairs',
  'min-cost-climbing-stairs',
  'decode-ways',
  'knapsack-01-2d',
  'knapsack-01-1d',
  'complete-knapsack',
  'distinct-subsequences',
  'interleaving-string',
  'min-delete-to-be-substring',
  'delete-operation-for-two-strings',
  'edit-distance',
  'palindromic-substrings',
  'longest-palindromic-subsequence',
  'longest-common-subsequence',
  'partition-equal-subset-sum',
  'house-robber',
  'house-robber-ii',
  'house-robber-iii',
  'best-time-to-buy-and-sell-stock',
  'best-time-to-buy-and-sell-stock-ii',
  'best-time-to-buy-and-sell-stock-iii',
  'integer-break',
  'perfect-squares',
  'coin-change',
  'word-break',
  'coin-change-ii',
  'last-stone-weight-ii',
  'ones-and-zeroes',
  'multiple-knapsack',
  'profitable-schemes',
  'target-sum',
];

describe('🏆 顶层抽象合规硬门禁 (Top-Level Abstraction Strict Gates)', () => {
  // ==========================================================================
  // 门禁 1: 已锁定算法零退化硬保护 (Zero Regression Gate)
  // ==========================================================================
  describe('门禁 1: 已锁定顶层抽象算法零退化硬保护 (Zero-Regression Lock)', () => {
    it('所有已锁定算法必须 100% 具备 YAML 模型', () => {
      const missingModels: string[] = [];
      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) {
          missingModels.push(id);
        }
      }
      expect(
        missingModels,
        `❌ [ZERO_REGRESSION_FAIL] 以下已锁定算法缺失 YAML 模型: ${missingModels.join(', ')}`
      ).toEqual([]);
    });

    it('所有已锁定算法必须 100% 具备 Strategy 策略实现', () => {
      const missingStrategies: string[] = [];
      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmStrategyRegistry.has(id)) {
          missingStrategies.push(id);
        }
      }
      expect(
        missingStrategies,
        `❌ [ZERO_REGRESSION_FAIL] 以下已锁定算法缺失 Strategy 实现: ${missingStrategies.join(', ')}`
      ).toEqual([]);
    });

    it('所有已锁定算法必须 100% 挂载 UniversalStageVisualizer 顶层宿主', () => {
      const invalidVisualizers: string[] = [];
      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        const manifest = algorithmRegistry.getManifest(id);
        if (!manifest || manifest.Visualizer !== UniversalStageVisualizer) {
          invalidVisualizers.push(`${id} (${manifest?.Visualizer?.name || 'undefined'})`);
        }
      }
      expect(
        invalidVisualizers,
        `❌ [ZERO_REGRESSION_FAIL] 以下已锁定算法未挂载 UniversalStageVisualizer: ${invalidVisualizers.join(', ')}`
      ).toEqual([]);
    });

    it('所有已锁定算法的 YAML 模型必须 100% 具备 forward/reverse 双向定义', () => {
      const invalidDirections: string[] = [];
      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        const model = AlgorithmModelRepository.getModel(id);
        if (!model.directions?.forward || !model.directions?.reverse) {
          invalidDirections.push(id);
        }
      }
      expect(
        invalidDirections,
        `❌ [ZERO_REGRESSION_FAIL] 以下已锁定算法的 YAML 模型缺失双向定义: ${invalidDirections.join(', ')}`
      ).toEqual([]);
    });

    it('所有已锁定算法的 YAML 模型必须 100% 具备 stage-1 至 stage-4 四阶段演进', () => {
      const invalidStages: string[] = [];
      const required = ['stage-1', 'stage-2', 'stage-3', 'stage-4'];
      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        const model = AlgorithmModelRepository.getModel(id);
        for (const st of required) {
          if (!model.stages?.[st]) {
            invalidStages.push(`${id} (缺少 ${st})`);
          }
        }
      }
      expect(
        invalidStages,
        `❌ [ZERO_REGRESSION_FAIL] 以下已锁定算法的 YAML 模型缺失四阶段: ${invalidStages.join(', ')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 门禁 2: 全库 YAML 模型完备性硬检查 (Model Fidelity Gate)
  // ==========================================================================
  describe('门禁 2: 全库所有已注册 YAML 模型完备性硬检查 (Model Fidelity Gate)', () => {
    it('全库所有 YAML 模型必须具备 forward 和 reverse 双向定义', () => {
      const modelIds = AlgorithmModelRepository.getAllIds();
      const violations: string[] = [];

      for (const id of modelIds) {
        const model = AlgorithmModelRepository.getModel(id);
        if (!model.directions?.forward || !model.directions?.reverse) {
          violations.push(id);
        }
      }
      expect(
        violations,
        `❌ [MODEL_FIDELITY_FAIL] 以下 YAML 模型缺失 directions: ${violations.join(', ')}`
      ).toEqual([]);
    });

    it('全库所有 YAML 模型必须具备 stage-1 至 stage-4 四阶段完整声明', () => {
      const modelIds = AlgorithmModelRepository.getAllIds();
      const violations: string[] = [];
      const required = ['stage-1', 'stage-2', 'stage-3', 'stage-4'];

      for (const id of modelIds) {
        const model = AlgorithmModelRepository.getModel(id);
        for (const st of required) {
          if (!model.stages?.[st]) {
            violations.push(`${id} (缺少 ${st})`);
          }
        }
      }
      expect(
        violations,
        `❌ [MODEL_FIDELITY_FAIL] 以下 YAML 模型缺失 stages: ${violations.join(', ')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 门禁 3: 贪心类目未迁移算法受控燃烧白名单 (Burndown Whitelist Gate)
  // 任何不在白名单中且非顶层抽象的新增算法，直接硬拦截！
  // ==========================================================================
  describe('门禁 3: 贪心类目未迁移算法受控燃烧白名单 (Burndown Whitelist Gate)', () => {
    it('全库贪心 (greedy) 类目算法必须要么已锁定为顶层抽象，要么明确登记在历史遗留白名单中', () => {
      // 贪心类目受控历史遗留白名单（凡已迁移算法严禁登记在此！每重构一个即删除一个并移至 LOCKED 锁定！）
      const KNOWN_LEGACY_GREEDY_UNMIGRATED = new Set([
        'assign-cookies',
        'lemonade',
        'gas-station',
        'max-subarray',
        'monotone-digits',
        'maximize-sum-k',
        'reconstruct-queue',
        'wiggle-subsequence',
        'tree-cameras',
        'task-scheduler',
        'greedy-theory',
        'greedy-week-summary',
        'greedy-week-summary-2',
        'greedy-week-summary-3',
        'greedy-week-summary-4',
        'greedy-final-summary',
        'queue-vector-explained',
        // 子目录专题 (greedy-089 ~ greedy-094)
        'course-schedule-iii',
        'largest-number',
        'meeting-rooms-ii',
        'minimum-cost-connect-sticks',
        'minimum-eat-oranges',
        'two-city-scheduling',
        'absolute-value-add-to-array',
        'cutting-bamboo',
        'ipo',
        'maximum-product-k-parts',
        'meeting-monopoly',
        'meeting-one-day',
        'split-min-avg-sum',
        'min-refueling-stops',
        'quiz-score',
        'minimize-deviation',
        'min-operations-similar',
        'divide-array-seq',
        'rabbits-in-forest',
        'cross-river',
        'string-transforms',
        'super-washing-machines',
        'cooking-plan',
        'cutting-tree',
        'eliminate-monsters',
        'largest-palindromic-number',
        'max-avg-pass-ratio',
        'min-cost-hire-workers',
        'fractional-programming-138',
        'ipo-max-capital',
        'group-buy-tickets',
        'longest-same-zeros-ones-intervals',
        'minimum-initial-energy-to-finish-tasks',
        'shortest-unsorted-continuous-subarray',
        'smallest-range-covering-elements-from-k-lists',
        'divide-array-into-increasing-sequences',
        'minimum-operations-to-make-similar',
        'minimum-number-of-refueling-stops',
        'minimize-deviation-in-array',
        'quiz-score-maximization',
        'cross-river-classic',
        'string-transforms-into-another-string',
      ]);

      const allManifests = algorithmRegistry.getAllManifests();
      const greedyManifests = allManifests.filter((m) => m.category === 'greedy');

      const unexpectedViolations: string[] = [];
      const alreadyMigratedStillInWhitelist: string[] = [];

      for (const m of greedyManifests) {
        const isTopLevel =
          m.Visualizer === UniversalStageVisualizer &&
          AlgorithmModelRepository.hasModel(m.id) &&
          AlgorithmStrategyRegistry.has(m.id);

        if (isTopLevel) {
          if (KNOWN_LEGACY_GREEDY_UNMIGRATED.has(m.id)) {
            alreadyMigratedStillInWhitelist.push(m.id);
          }
        } else {
          if (!KNOWN_LEGACY_GREEDY_UNMIGRATED.has(m.id)) {
            unexpectedViolations.push(m.id);
          }
        }
      }

      expect(
        alreadyMigratedStillInWhitelist,
        `⚠️ 以下贪心算法已成功迁移至顶层抽象，请立即将其从 KNOWN_LEGACY_GREEDY_UNMIGRATED 白名单中移除并锁定保护: ${alreadyMigratedStillInWhitelist.join(', ')}`
      ).toEqual([]);

      expect(
        unexpectedViolations,
        `❌ [BURNDOWN_FAIL] 检测到未经授权的非顶层抽象贪心算法实现: ${unexpectedViolations.join(', ')}！新算法严禁使用旧方言，必须接入 YAML+Strategy+UniversalStageVisualizer！`
      ).toEqual([]);
    });
  });
});
