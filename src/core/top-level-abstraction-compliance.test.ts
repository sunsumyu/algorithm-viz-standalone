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
import { ProblemDimensionResolver } from './resolvers/problem-dimension-resolver';
import { VisualizerParamSynchronizer } from './controllers/visualizer-param-synchronizer';
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

  // ==========================================================================
  // 门禁 4: 维度解析与入参规模对齐硬检查 (Dimension Fidelity Gate)
  // 杜绝因解析器未适配入参键名导致回退默认 n=6、产生视图脱节！
  // ==========================================================================
  describe('门禁 4: 维度解析与入参规模对齐硬检查 (Dimension Fidelity Gate)', () => {
    it('已锁定算法的维度解析器输出必须与默认参数实际规模 100% 严密吻合', () => {
      const dimensionMismatches: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        const model = AlgorithmModelRepository.getModel(id);
        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        const params = model.defaultParams;
        if (!params) continue;

        const checkParam = (paramName: string) => {
          if (params[paramName] !== undefined) {
            let expectedLen = 0;
            try {
              const parsed = typeof params[paramName] === 'string'
                ? JSON.parse(params[paramName])
                : params[paramName];
              expectedLen = Array.isArray(parsed) ? parsed.length : 0;
            } catch {
              expectedLen = String(params[paramName]).split(/[\s,]+/).length;
            }
            if (expectedLen > 0) {
              if (resolved.category === 'knapsack') {
                if (resolved.m !== expectedLen) {
                  dimensionMismatches.push(
                    `${id} (背包 ${paramName} 物品规模为 ${expectedLen}，但 ProblemDimensionResolver 解析出 m=${resolved.m})`
                  );
                }
              } else {
                if (resolved.n !== expectedLen) {
                  dimensionMismatches.push(
                    `${id} (${paramName} 数组规模为 ${expectedLen}，但 ProblemDimensionResolver 解析出 n=${resolved.n})`
                  );
                }
              }
            }
          }
        };

        checkParam('ratings');
        checkParam('points');
        checkParam('intervals');
        checkParam('nums');
      }

      expect(
        dimensionMismatches,
        `❌ [DIMENSION_FIDELITY_FAIL] 以下已锁定算法的维度解析与默认参数规模脱节: ${dimensionMismatches.join('; ')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 门禁 5: 默认阶段声明与路由对齐硬检查 (Default Stage Alignment Gate)
  // 杜绝 YAML 中声明了 defaultStage 却被硬编码或全局偏好篡改！
  // ==========================================================================
  describe('门禁 5: 默认阶段声明与路由对齐硬检查 (Default Stage Alignment Gate)', () => {
    it('若 YAML 声明了 defaultStage，初始路由阶段必须 100% 与之完全一致', () => {
      const stageMismatches: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        const model = AlgorithmModelRepository.getModel(id);
        if (model.defaultStage) {
          const resolved = VisualizerParamSynchronizer.resolveInitialState(model);
          if (resolved.stage !== model.defaultStage) {
            stageMismatches.push(
              `${id} (声明 defaultStage='${model.defaultStage}'，但实际路由输出 stage='${resolved.stage}')`
            );
          }
        }
      }

      expect(
        stageMismatches,
        `❌ [DEFAULT_STAGE_ALIGNMENT_FAIL] 以下算法的初始路由与 defaultStage 不符: ${stageMismatches.join('; ')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 门禁 6: 执行轨迹步进密度与全槽位覆盖硬检查 (Step Density & Slot Full Coverage Gate)
  // 杜绝偷懒截断（如 Math.min(..., 6)）、杜绝伪步骤，确保所有槽位都有被访问与推演！
  // ==========================================================================
  describe('门禁 6: 执行轨迹步进密度与全槽位覆盖硬检查 (Step Density & Slot Full Coverage Gate)', () => {
    it('已锁定的数组/序列算法在各阶段必须满足最小步进密度，且槽位覆盖率必须达到 100%', () => {
      const densityViolations: string[] = [];
      const coverageViolations: string[] = [];

      // 重点审查包含物理槽位的一维数组算法
      const arrayAlgorithmsToCheck = [
        'candy',
        'can-jump',
        'jump-game-ii',
        'min-arrows',
        'non-overlapping',
        'merge-intervals',
        'partition-labels',
      ].filter((id) => LOCKED_TOP_LEVEL_ALGORITHMS.includes(id));

      for (const id of arrayAlgorithmsToCheck) {
        const model = AlgorithmModelRepository.getModel(id);
        const strategy = AlgorithmStrategyRegistry.get(id);
        if (!strategy) continue;

        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);
        const n = resolved.n;

        // 检查 Stage 1 与 Stage 3
        const stagesToCheck = [1, 3];
        for (const stageNum of stagesToCheck) {
          const steps = strategy.generateSteps(model, { stage: stageNum, direction: 'forward' });

          // 1. 步进密度检查：规模为 n 时，步数不能少于 n（杜绝粗暴跳步或空推演）
          if (n >= 4 && steps.length < n) {
            densityViolations.push(
              `${id} Stage ${stageNum}: 规模 n=${n}，但仅生成了 ${steps.length} 步 (密度不足，疑似存在循环截断！)`
            );
          }

          // 2. 槽位覆盖率检查：收集所有步骤中触及过的 slot 下标
          const touchedSlots = new Set<number>();
          for (const s of steps) {
            if (s.activeSlot !== undefined && s.activeSlot >= 0 && s.activeSlot < n) {
              touchedSlots.add(s.activeSlot);
            }
            if (s.actorState?.currentSlot !== undefined && s.actorState.currentSlot >= 0 && s.actorState.currentSlot < n) {
              touchedSlots.add(s.actorState.currentSlot);
            }
            if (Array.isArray(s.activeIndices)) {
              for (const idx of s.activeIndices) {
                if (typeof idx === 'number' && idx >= 0 && idx < n) {
                  touchedSlots.add(idx);
                }
              }
            }
          }

          // 如果该阶段是全遍历（如 candy stage 1 / stage 3），要求 100% 覆盖 0..n-1
          if (id === 'candy') {
            const missingSlots: number[] = [];
            for (let slot = 0; slot < n; slot++) {
              if (!touchedSlots.has(slot)) {
                missingSlots.push(slot);
              }
            }
            if (missingSlots.length > 0) {
              coverageViolations.push(
                `${id} Stage ${stageNum}: 以下槽位从未被任何微步访问或处理: [${missingSlots.join(', ')}] (存在严重遗漏或截断！)`
              );
            }
          }
        }
      }

      expect(
        densityViolations,
        `❌ [STEP_DENSITY_FAIL] 检测到以下算法阶段步进密度严重不足: ${densityViolations.join('; ')}`
      ).toEqual([]);

      expect(
        coverageViolations,
        `❌ [SLOT_COVERAGE_FAIL] 检测到以下算法阶段存在被跳过/遗漏的槽位: ${coverageViolations.join('; ')}`
      ).toEqual([]);
    });
  });
});

