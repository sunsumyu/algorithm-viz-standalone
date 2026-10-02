/**
 * 树算法多阶段演化合规门禁测试 (Tree Algorithm Multi-Stage Evolution Compliance Gate)
 *
 * 强制约束：
 * 1. [TREE_STAGE_EXISTENCE_GATE]: 已锁定的树遍历算法必须具备 stages 配置，
 *    每个 stage 必须有独立的 buildSteps + codeLanguages + renderCanvas。
 * 2. [TREE_STAGE_DENSITY_GATE]: 每个 stage 的 buildSteps 必须产生 >= 3 步真实步骤，
 *    严禁空壳 stage。
 * 3. [TREE_STAGE_CODE_FIDELITY_GATE]: 每个 stage 的 codeLanguages 必须覆盖
 *    java / cpp / python / javascript 四语言。
 */

import { describe, it, expect } from 'vitest';
import { getDeclarativeSpecs } from './declarative-algorithm-visualizer';
import type { DeclarativeAlgorithmSpec, DeclarativeStageSpec } from './renderers/declarative-stage-spec';
// 触发全量 renderer 的 eager 同步注册
import './algorithm-catalog-indexer';

/**
 * 已锁定的树算法多阶段黄金基准清单
 * 此清单中的所有算法必须 100% 具备 stages 配置
 * 新增条目逐批推入即可逐步提高覆盖率
 */
export const LOCKED_TREE_STAGED_ALGORITHMS = [
  'binary-tree-level',          // 二叉树层序遍历: Stage 1 队列 / Stage 2 哈希表 / Stage 3 静态数组 / Stage 4 DFS
  'tree-traversal',             // 前中后序遍历: Stage 1 递归 / Stage 2 迭代栈
  'tree-036-zigzag-level-order',// 锯齿形层序: Stage 1 双端队列 / Stage 2 静态数组 / Stage 3 递归DFS
  'tree-depth',                 // 二叉树深度: Stage 1 递归后序 / Stage 2 BFS队列 / Stage 3 静态数组
  'tree-036-width-of-binary-tree', // 二叉树最大宽度: Stage 1 Queue+Base / Stage 2 静态双数组 / Stage 3 DFS映射
  'tree-036-completeness-binary-tree', // 完全二叉树检验: Stage 1 两大铁律 / Stage 2 静态数组 / Stage 3 哨兵单调队列
  'tree-036-count-complete-tree-nodes', // 完全二叉树节点个数: Stage 1 朴素DFS / Stage 2 左神满树公式 / Stage 3 二分寻路
  'tree-symmetric',             // 对称二叉树: Stage 1 递归 / Stage 2 迭代 / Stage 3 静态数组
  'tree-invert',                // 翻转二叉树: Stage 1 递归 / Stage 2 BFS / Stage 3 静态数组
  'path-sum',                   // 路径总和: Stage 1 递归减法 / Stage 2 回溯全解 / Stage 3 队列BFS
  'valid-bst',                  // 验证二叉搜索树: Stage 1 中序递归 / Stage 2 区间定界 / Stage 3 显式栈
  'lca',                        // 最近公共祖先: Stage 1 递归后序 / Stage 2 父节点哈希 / Stage 3 显式双路径
  'bst-search',                 // 二叉搜索树搜索: Stage 1 迭代剪枝 / Stage 2 递归分治 / Stage 3 动态插入
  'build-tree',                 // 从遍历构造二叉树: Stage 1 前序+中序 / Stage 2 后序+中序 / Stage 3 迭代栈
  'binary-tree-maximum-path-sum', // 二叉树最大路径和: Stage 1 递归后序 / Stage 2 树形DP Info二元组 / Stage 3 显式栈
  'sum-root-to-leaf-numbers',   // 求根到叶数字之和: Stage 1 前序递归累加 / Stage 2 BFS双队列 / Stage 3 显式双栈迭代
  'min-depth',                  // 二叉树最小深度: Stage 1 递归特判 / Stage 2 BFS提前退出 / Stage 3 静态数组队列
  'tree-037-balanced-binary-tree', // 判断平衡二叉树: Stage 1 Info递归套路 / Stage 2 -1剪枝优化 / Stage 3 显式后序栈
  'left-leaves',                // 左叶子之和: Stage 1 递归父节点前瞻 / Stage 2 BFS层序队列 / Stage 3 显式迭代栈
  'all-paths',                  // 二叉树所有路径: Stage 1 回溯路径栈 / Stage 2 纯函数不可变串 / Stage 3 BFS双队列
  'bottom-left',                // 找树左下角的值: Stage 1 先序先登DFS / Stage 2 标准层序BFS / Stage 3 逆向右先BFS
  'max-tree',                   // 最大二叉树: Stage 1 递归分治 / Stage 2 单调栈笛卡尔树 / Stage 3 显式任务栈
  // ========== 下一批锁定（待实现后取消注释）==========
];

describe('🌳 树算法多阶段演化合规硬门禁 (Tree Multi-Stage Evolution Strict Gates)', () => {
  const allSpecs = getDeclarativeSpecs();

  // ──────────────────────────────────────────────
  // 门禁 1: 已锁定算法必须具备 stages 配置
  // ──────────────────────────────────────────────
  it('门禁 1: 已锁定树算法必须具备 stages 数组且长度 >= 2 (Stage Existence Gate)', () => {
    const failures: string[] = [];

    for (const algoId of LOCKED_TREE_STAGED_ALGORITHMS) {
      const spec = allSpecs.get(algoId) as DeclarativeAlgorithmSpec | undefined;
      if (!spec) {
        failures.push(`❌ [${algoId}] 未在声明式注册表中找到！`);
        continue;
      }
      if (!spec.stages || !Array.isArray(spec.stages)) {
        failures.push(`❌ [${algoId}] 缺少 stages 数组配置！`);
        continue;
      }
      if (spec.stages.length < 2) {
        failures.push(`❌ [${algoId}] stages 长度仅为 ${spec.stages.length}，至少需要 2 个阶段（如递归 vs 迭代）！`);
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `\n${'='.repeat(70)}\n` +
        `🚨 树算法多阶段演化门禁红灯！以下算法缺少 stages 配置：\n` +
        `${'='.repeat(70)}\n` +
        failures.join('\n') +
        `\n${'='.repeat(70)}\n` +
        `📋 纠偏指引：\n` +
        `   1. 每个锁定的树算法必须在 registerDeclarativeAlgorithm 中声明 stages 数组\n` +
        `   2. 至少包含 2 个阶段（如 Stage 1: 递归 / Stage 2: 迭代）\n` +
        `   3. 每个 stage 必须有 buildSteps、codeLanguages、renderCanvas\n` +
        `${'='.repeat(70)}\n`
      );
    }
  });

  // ──────────────────────────────────────────────
  // 门禁 2: 每个 stage 结构完整性检查
  // ──────────────────────────────────────────────
  it('门禁 2: 每个 stage 必须具备 id / name / buildSteps / codeLanguages (Stage Structure Integrity Gate)', () => {
    const failures: string[] = [];

    for (const algoId of LOCKED_TREE_STAGED_ALGORITHMS) {
      const spec = allSpecs.get(algoId) as DeclarativeAlgorithmSpec | undefined;
      if (!spec?.stages) continue;

      for (const stage of spec.stages) {
        const stageLabel = `[${algoId}] -> [${stage.id}]`;

        if (!stage.id) failures.push(`❌ ${stageLabel} 缺少 id！`);
        if (!stage.name) failures.push(`❌ ${stageLabel} 缺少 name！`);
        if (!stage.shortName) failures.push(`❌ ${stageLabel} 缺少 shortName！`);

        if (!stage.buildSteps && !stage.generateSteps) {
          failures.push(`❌ ${stageLabel} 缺少 buildSteps 或 generateSteps！`);
        }

        if (!stage.codeLanguages) {
          failures.push(`❌ ${stageLabel} 缺少 codeLanguages 四语言代码模板！`);
        } else {
          const langs = stage.codeLanguages as Record<string, any>;
          for (const lang of ['java', 'cpp', 'python', 'javascript']) {
            if (!langs[lang]) {
              failures.push(`❌ ${stageLabel} codeLanguages 缺少 ${lang} 语言！`);
            }
          }
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `\n${'='.repeat(70)}\n` +
        `🚨 Stage 结构完整性门禁红灯！\n` +
        `${'='.repeat(70)}\n` +
        failures.join('\n') +
        `\n${'='.repeat(70)}\n`
      );
    }
  });

  // ──────────────────────────────────────────────
  // 门禁 3: 每个 stage 步骤密度下限 (Anti-Empty-Shell Gate)
  // ──────────────────────────────────────────────
  it('门禁 3: 每个 stage 的 buildSteps 必须产生 >= 3 步真实步骤 (Stage Density Gate)', () => {
    const failures: string[] = [];
    const MIN_STEPS = 3;

    for (const algoId of LOCKED_TREE_STAGED_ALGORITHMS) {
      const spec = allSpecs.get(algoId) as DeclarativeAlgorithmSpec | undefined;
      if (!spec?.stages) continue;

      // 取 spec 级 inputs 的默认值
      const defaultInputs: Record<string, any> = {};
      if (spec.inputs) {
        for (const inp of spec.inputs) {
          if (inp.defaultValue !== undefined) {
            defaultInputs[inp.id] = inp.defaultValue;
          }
        }
      }

      for (const stage of spec.stages) {
        const stageLabel = `[${algoId}] -> [${stage.id}]`;
        const stepFn = stage.buildSteps || stage.generateSteps;
        if (!stepFn) continue;

        try {
          const steps = stepFn(defaultInputs);
          if (!Array.isArray(steps) || steps.length < MIN_STEPS) {
            failures.push(
              `❌ ${stageLabel} 仅产生 ${Array.isArray(steps) ? steps.length : 0} 步，` +
              `低于最低密度要求 ${MIN_STEPS} 步！严禁空壳 stage！`
            );
          }
        } catch (err: any) {
          failures.push(`❌ ${stageLabel} buildSteps 执行异常: ${err.message}`);
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `\n${'='.repeat(70)}\n` +
        `🚨 Stage 步骤密度门禁红灯！\n` +
        `${'='.repeat(70)}\n` +
        failures.join('\n') +
        `\n${'='.repeat(70)}\n`
      );
    }
  });

  // ──────────────────────────────────────────────
  // 门禁 4: defaultStage 必须指向有效 stage id
  // ──────────────────────────────────────────────
  it('门禁 4: defaultStage 必须指向 stages 数组中存在的有效 id (Default Stage Validity Gate)', () => {
    const failures: string[] = [];

    for (const algoId of LOCKED_TREE_STAGED_ALGORITHMS) {
      const spec = allSpecs.get(algoId) as DeclarativeAlgorithmSpec | undefined;
      if (!spec?.stages) continue;

      if (spec.defaultStage) {
        const stageIds = spec.stages.map((s: DeclarativeStageSpec) => s.id);
        if (!stageIds.includes(spec.defaultStage)) {
          failures.push(
            `❌ [${algoId}] defaultStage="${spec.defaultStage}" ` +
            `不在 stages 数组中 [${stageIds.join(', ')}]！`
          );
        }
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `\n${'='.repeat(70)}\n` +
        `🚨 Default Stage 有效性门禁红灯！\n` +
        `${'='.repeat(70)}\n` +
        failures.join('\n') +
        `\n${'='.repeat(70)}\n`
      );
    }
  });

  // ──────────────────────────────────────────────
  // 信息性：全库树算法 stages 覆盖率统计
  // ──────────────────────────────────────────────
  it('统计信息: 全库树类声明式算法 stages 覆盖率', () => {
    const treeSpecs: { id: string; hasStages: boolean; stageCount: number }[] = [];

    for (const [id, spec] of allSpecs.entries()) {
      if (spec.category === 'tree') {
        treeSpecs.push({
          id,
          hasStages: !!spec.stages && spec.stages.length >= 2,
          stageCount: spec.stages?.length ?? 0,
        });
      }
    }

    const withStages = treeSpecs.filter((s) => s.hasStages);
    const coverage = treeSpecs.length > 0
      ? ((withStages.length / treeSpecs.length) * 100).toFixed(1)
      : '0.0';

    console.log(`\n📊 树算法 Stages 覆盖率: ${withStages.length}/${treeSpecs.length} (${coverage}%)`);
    console.log(`   ✅ 已配置: ${withStages.map((s) => s.id).join(', ') || '(无)'}`);
    console.log(`   🔴 未配置: ${treeSpecs.filter((s) => !s.hasStages).map((s) => s.id).join(', ') || '(无)'}`);

    // 当前只要求锁定清单通过，覆盖率为信息性指标
    expect(treeSpecs.length).toBeGreaterThan(0);
  });
});
