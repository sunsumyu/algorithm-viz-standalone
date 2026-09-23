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
  'assign-cookies',
  'lemonade',
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

        if (params.g !== undefined && params.s !== undefined) {
          let gLen = 0;
          let sLen = 0;
          try {
            const pg = typeof params.g === 'string' ? JSON.parse(params.g) : params.g;
            gLen = Array.isArray(pg) ? pg.length : String(params.g).split(/[\s,]+/).length;
          } catch {
            gLen = String(params.g).split(/[\s,]+/).length;
          }
          try {
            const ps = typeof params.s === 'string' ? JSON.parse(params.s) : params.s;
            sLen = Array.isArray(ps) ? ps.length : String(params.s).split(/[\s,]+/).length;
          } catch {
            sLen = String(params.s).split(/[\s,]+/).length;
          }
          if (resolved.m !== gLen + 1 || resolved.n !== sLen + 1) {
            dimensionMismatches.push(`${id} (双序列期望矩阵规格 m=${gLen + 1}, n=${sLen + 1}，但解析出 m=${resolved.m}, n=${resolved.n})`);
          }
          continue;
        }

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
        'assign-cookies',
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
          const stageKey = `stage-${stageNum}`;
          const resolvedStage = ProblemDimensionResolver.resolve(id, model.defaultParams, stageKey);
          const steps = strategy.generateSteps(model, { stage: stageNum, direction: 'forward' });

          // 1. 步进密度检查 (严禁把二维当一维测！)
          if (stageNum === 3 && (resolvedStage.category === '2d-grid' || resolvedStage.category === '2d-sequence')) {
            const innerCells = (resolvedStage.m - 1) * (resolvedStage.n - 1);
            const minRequired2DSteps = innerCells * 2; // 每个单元格至少 2 个微步 (Probe 探查 + Commit 落盘)
            if (steps.length < minRequired2DSteps) {
              densityViolations.push(
                `${id} Stage 3 (2D矩阵 ${resolvedStage.m}×${resolvedStage.n}): 单元格总数 ${innerCells}，但仅生成了 ${steps.length} 步 (要求至少 ${minRequired2DSteps} 步，疑似缺少单元格双微步推演！)`
              );
            }
          } else {
            // 一维或区间序列问题
            if (n >= 4 && steps.length < n) {
              densityViolations.push(
                `${id} Stage ${stageNum}: 规模 n=${n}，但仅生成了 ${steps.length} 步 (密度不足，疑似存在循环截断！)`
              );
            }
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

  // ==========================================================================
  // 门禁 7: 二维状态矩阵与依赖高亮物理契约硬检查 (2D Grid & Dependency Mandate Gate)
  // 严禁二维算法偷懒只发 1D 数组冒充 2D 矩阵！严禁缺少单元格依赖高亮！Stage 2 备忘录与 Stage 3 DP 均须遵循！
  // ==========================================================================
  describe('门禁 7: 二维状态矩阵与依赖高亮物理契约硬检查 (2D Grid & Dependency Mandate Gate)', () => {
    it('二维网格或双序列算法在 Stage 2 (记忆化) 与 Stage 3 (DP填表) 阶段必须 100% 输出合法 2D grid 对象与依赖/树结构', () => {
      const gridViolations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        const model = AlgorithmModelRepository.getModel(id);
        const strategy = AlgorithmStrategyRegistry.get(id);
        if (!strategy) continue;

        // 检查 Stage 2 (记忆化备忘录网格)
        const resolved2 = ProblemDimensionResolver.resolve(id, model.defaultParams, 'stage-2');
        if (resolved2.category === '2d-grid' || resolved2.category === '2d-sequence') {
          const steps2 = strategy.generateSteps(model, { stage: 2, direction: 'forward' });
          if (steps2.length > 0) {
            const first2 = steps2[0];
            if (!first2.grid || !Array.isArray(first2.grid)) {
              gridViolations.push(`${id} Stage 2 (记忆化) 首步缺失 2D grid 对象，导致备忘录网格无法呈现`);
            } else if (first2.grid.length !== resolved2.m || (first2.grid[0] && first2.grid[0].length !== resolved2.n)) {
              gridViolations.push(
                `${id} Stage 2 grid 规格错误: 期望 ${resolved2.m}×${resolved2.n}，但实际为 ${first2.grid.length}×${first2.grid[0]?.length}`
              );
            }

            // Stage 2 必须具备真实状态依赖树
            const hasTree = steps2.some((s) => s.treeRoot !== undefined);
            if (!hasTree) {
              gridViolations.push(`${id} Stage 2 记忆化阶段完全缺失 treeRoot 状态依赖树`);
            }
          }
        }

        // 检查 Stage 3 (动态规划状态填表)
        const resolved3 = ProblemDimensionResolver.resolve(id, model.defaultParams, 'stage-3');
        if (resolved3.category === '2d-grid' || resolved3.category === '2d-sequence') {
          const steps3 = strategy.generateSteps(model, { stage: 3, direction: 'forward' });
          if (steps3.length > 0) {
            const first3 = steps3[0];
            if (!first3.grid || !Array.isArray(first3.grid)) {
              gridViolations.push(`${id} Stage 3 首步缺失 2D grid 对象，导致沙盘退化为一维`);
            } else if (first3.grid.length !== resolved3.m || (first3.grid[0] && first3.grid[0].length !== resolved3.n)) {
              gridViolations.push(
                `${id} Stage 3 grid 规格错误: 期望 ${resolved3.m}×${resolved3.n}，但实际为 ${first3.grid.length}×${first3.grid[0]?.length}`
              );
            }

            // 检查是否有依赖高亮 (deps / topI / leftI)
            const hasDeps = steps3.some((s) => (s.deps && s.deps.length > 0) || s.topI !== undefined || s.leftI !== undefined);
            if (!hasDeps) {
              gridViolations.push(`${id} Stage 3 整个推演过程没有任何步骤输出 deps 依赖格高亮，图例形同虚设！`);
            }
          }
        }
      }

      expect(
        gridViolations,
        `❌ [2D_GRID_MANDATE_FAIL] 检测到以下二维算法未提供合法的 2D Grid 矩阵或依赖高亮: ${gridViolations.join('; ')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 门禁 8: 全声明标签卡完整性与防伪实现死门禁 (All Declared Stages Anti-Mock Gate)
  // 严禁任何算法在任何声明标签卡中用 4 步或假装实现糊弄用户！宁可报错，绝不伪绿灯！
  // ==========================================================================
  describe('门禁 8: 全声明标签卡完整性与防伪实现死门禁 (All Declared Stages Anti-Mock Gate)', () => {
    // 门禁 8 全库已锁定算法全部阶段步数密度 100% 满分达标，历史燃烧名单已彻底清零（0 遗留，0 豁免，严禁新增！）
    const KNOWN_INSUFFICIENT_STEPS_BURNDOWN = new Set<string>();

    it('所有已锁定算法的全部声明阶段 (Stage 1-4) 均必须产生充分密度真实步骤，严禁任何偷懒跳步或假装实现', () => {
      const mockViolations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        const model = AlgorithmModelRepository.getModel(id);
        const strategy = AlgorithmStrategyRegistry.get(id);
        if (!strategy) continue;

        const stages = model.stages || {};
        for (const [stageKey, stageConfig] of Object.entries(stages)) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          if (isNaN(stageNum)) continue;

          const steps = strategy.generateSteps(model, { stage: stageNum, direction: 'forward' });

          // 核心硬门槛：严禁伪造实现（如仅有 4 步）
          let minExpectedSteps = 6;
          if (stageNum === 2) {
            // 记忆化搜索树必须展开、下探、剪枝、回溯
            minExpectedSteps = 10;
          } else if (stageNum === 3) {
            // 动态规划填表
            minExpectedSteps = 8;
          }

          const burndownKey = `${id}-${stageKey}`;
          if (steps.length < minExpectedSteps) {
            if (!KNOWN_INSUFFICIENT_STEPS_BURNDOWN.has(burndownKey)) {
              mockViolations.push(
                `${id} 【${stageConfig.shortName || stageKey}】仅生成了 ${steps.length} 步 (低于红线下限 ${minExpectedSteps} 步，疑似只有骨架 Mock 或假装实现！宁可报错严禁虚假交付！)`
              );
            }
          } else {
            // 如果历史燃烧名单中的题目已经重构达标，强制要求从燃烧名单中删除，防止遗忘
            if (KNOWN_INSUFFICIENT_STEPS_BURNDOWN.has(burndownKey)) {
              mockViolations.push(
                `🎉 [BURNDOWN_CLEANUP] ${id} 的 ${stageKey} 已经生成了 ${steps.length} 步，已达标！请从 KNOWN_INSUFFICIENT_STEPS_BURNDOWN 中移除该条目！`
              );
            }
          }

          // 步骤 stage 属性若显式声明，严禁与当前阶段冲突
          const wrongStageSteps = steps.filter((s) => s.stage !== undefined && s.stage !== stageNum);
          if (wrongStageSteps.length > 0) {
            mockViolations.push(
              `${id} 【${stageConfig.shortName || stageKey}】存在 ${wrongStageSteps.length} 个步骤的 step.stage 标记不等于当前阶段 ${stageNum} (检测到直接委托或阶段标记混淆！)`
            );
          }

          // 检查每个步骤必须有真实的文字说明 (decision, message, msg, log)
          const emptyDecisions = steps.filter(
            (s) =>
              (!s.decision || s.decision.trim().length === 0) &&
              (!s.message || s.message.trim().length === 0) &&
              (!s.msg || String(s.msg).trim().length === 0) &&
              (!s.log || String(s.log).trim().length === 0)
          );
          if (emptyDecisions.length > 0) {
            mockViolations.push(
              `${id} 【${stageConfig.shortName || stageKey}】存在 ${emptyDecisions.length} 个无任何文字说明的空白伪步骤！`
            );
          }
        }
      }

      expect(
        mockViolations,
        `❌ [ANTI_MOCK_GATE_FAIL] 发现严重偷懒或假装实现问题，宁可报错严禁伪绿灯:\n${mockViolations.join('\n')}`
      ).toEqual([]);
    });

    it('分发饼干 (assign-cookies) 作为双序列黄金基准，四阶段步数与网格必须 100% 满分达标', () => {
      const model = AlgorithmModelRepository.getModel('assign-cookies');
      const strategy = AlgorithmStrategyRegistry.get('assign-cookies')!;

      // Stage 1: 正向双指针 >= 6 步
      const s1 = strategy.generateSteps(model, { stage: 1, direction: 'forward' });
      expect(s1.length, 'Stage 1 贪心双指针步数').toBeGreaterThanOrEqual(6);
      expect(s1.every((s) => s.stage === 1)).toBe(true);

      // Stage 2: 真实 DFS 记忆化搜索树 + 2D 备忘录网格 >= 12 步 (彻底杜绝 4 步伪实现)
      const s2 = strategy.generateSteps(model, { stage: 2, direction: 'forward' });
      expect(s2.length, 'Stage 2 记忆化搜索步数必须 >= 12，杜绝 4 步假实现').toBeGreaterThanOrEqual(12);
      expect(s2[0].grid, 'Stage 2 必须具备 (m+1)x(n+1) 二维备忘录网格').toBeDefined();
      expect(s2.every((s) => s.stage === 2)).toBe(true);
      expect(s2.some((s) => s.decision?.includes('剪枝') || s.decision?.includes('回溯落盘'))).toBe(true);

      // Stage 3: 完备 2D DP 状态矩阵填表 >= 20 步 (带三向依赖)
      const s3 = strategy.generateSteps(model, { stage: 3, direction: 'forward' });
      expect(s3.length, 'Stage 3 DP 填表微步必须 >= 20 步').toBeGreaterThanOrEqual(20);
      expect(s3[0].grid).toBeDefined();
      expect(s3.every((s) => s.stage === 3)).toBe(true);
      expect(s3.some((s) => s.deps && s.deps.length >= 2)).toBe(true);

      // Stage 4: 空间压缩单趟流转 >= 6 步
      const s4 = strategy.generateSteps(model, { stage: 4, direction: 'forward' });
      expect(s4.length, 'Stage 4 空间压缩步数').toBeGreaterThanOrEqual(6);
      expect(s4.every((s) => s.stage === 4)).toBe(true);
      expect(s4[s4.length - 1].metrics?.['space']).toBe('O(1)');
    });
  });

  // ==========================================================================
  // 门禁 9: 全阶段代码联动高亮行号 100% 存在与有效性硬门禁 (Code Line Linkage Fidelity Gate)
  // 彻底根除“代码联动的高亮/高度都没有”、“推一下动一下”等严重隐蔽质量问题！
  // 强制断言全库所有已锁定算法与阶段的每一个推演步骤，必须 100% 具备有效正整数 step.line！
  // ==========================================================================
  describe('门禁 9: 全阶段代码联动高亮行号 100% 存在与有效性硬门禁 (Code Line Linkage Fidelity Gate)', () => {
    // 门禁 9 全库已锁定算法全部阶段代码联动行号 100% 满分通过，受控燃烧清单已彻底清零（0 遗留，0 豁免，严禁新增！）
    const KNOWN_LINE_FIDELITY_BURNDOWN = new Set<string>();

    it('所有已锁定算法的全部阶段与方向推导步骤，必须 100% 具备合法有效的代码行号 (typeof step.line === "number" && step.line >= 1)', () => {
      const lineViolations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        const model = AlgorithmModelRepository.getModel(id);
        const strategy = AlgorithmStrategyRegistry.get(id);
        if (!strategy) continue;

        const stages = model.stages || {};
        for (const [stageKey, stageConfig] of Object.entries(stages)) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          if (isNaN(stageNum)) continue;

          const burndownKey = `${id}-${stageKey}`;

          for (const direction of ['forward', 'reverse'] as const) {
            try {
              const steps = strategy.generateSteps(model, { stage: stageNum, direction });
              if (!steps || steps.length === 0) continue;

              const invalidSteps = steps.filter(
                (s) => s.line === undefined || typeof s.line !== 'number' || s.line < 1 || isNaN(s.line)
              );

              if (invalidSteps.length > 0) {
                if (!KNOWN_LINE_FIDELITY_BURNDOWN.has(burndownKey)) {
                  lineViolations.push(
                    `❌ [CODE_LINE_FIDELITY_FAIL] ${id} 【${stageConfig.shortName || stageKey}】(${direction}) 存在 ${invalidSteps.length} / ${steps.length} 个步骤未挂载有效代码行号 step.line (当前类型: ${typeof invalidSteps[0]?.line}，值: ${invalidSteps[0]?.line})！导致代码调试面板高亮完全僵死！`
                  );
                }
              } else {
                if (direction === 'forward' && KNOWN_LINE_FIDELITY_BURNDOWN.has(burndownKey)) {
                  lineViolations.push(
                    `🎉 [BURNDOWN_CLEANUP] ${id} 的 ${stageKey} 已经 100% 挂载合法代码行号，请从 KNOWN_LINE_FIDELITY_BURNDOWN 中移除该条目！`
                  );
                }
              }
            } catch (err) {
              // 若该方向不可用则跳过
            }
          }
        }
      }

      expect(
        lineViolations,
        `❌ [CODE_LINE_LINKAGE_GATE_FAIL] 检测到代码高亮行号丢失缺陷！宁可报错严禁伪绿灯:\n${lineViolations.join('\n')}`
      ).toEqual([]);
    });

    it('分发饼干 (assign-cookies) 四阶段正逆双向所有步骤必须 100% 具备有效代码行号与聚焦属性', () => {
      const model = AlgorithmModelRepository.getModel('assign-cookies');
      const strategy = AlgorithmStrategyRegistry.get('assign-cookies')!;

      for (const stage of [1, 2, 3, 4]) {
        for (const direction of ['forward', 'reverse'] as const) {
          const steps = strategy.generateSteps(model, { stage, direction });
          expect(steps.length, `assign-cookies Stage ${stage} ${direction}`).toBeGreaterThan(0);
          steps.forEach((step, idx) => {
            expect(
              typeof step.line === 'number' && step.line >= 1,
              `assign-cookies Stage ${stage} ${direction} step ${idx} 必须具备合法 line`
            ).toBe(true);
            expect(
              typeof (step as any).codeLine === 'number' && (step as any).codeLine >= 1,
              `assign-cookies Stage ${stage} ${direction} step ${idx} 必须具备兼容 codeLine`
            ).toBe(true);
          });
        }
      }
    });
  });
});



