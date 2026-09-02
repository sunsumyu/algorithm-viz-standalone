/**
 * 算法模型仓储深度模块 (AlgorithmModelRepository Deep Module)
 * 遵循深度模块原则：通过极其紧凑简洁的外部接口，隐藏所有底层 YAML 解析、
 * 静态模型索引、语法高亮编译、变体锚点索引与不可变阶段缓存。
 */

import type { IYamlAlgorithmModel } from './interfaces';
import { YamlModelLoader, type CompiledStageViewConfig } from './yaml-model-loader';
import uniquePathsModel from '../algorithms/specs/models/unique-paths.yaml';
import uniquePathsIiModel from '../algorithms/specs/models/unique-paths-ii.yaml';
import minimumPathSumModel from '../algorithms/specs/models/minimum-path-sum.yaml';
import fibonacciModel from '../algorithms/specs/models/fibonacci.yaml';
import climbStairsModel from '../algorithms/specs/models/climb-stairs.yaml';
import knapsack01Model from '../algorithms/specs/models/knapsack-01.yaml';
import distinctSubsequencesModel from '../algorithms/specs/models/distinct-subsequences.yaml';
import deleteOperationForTwoStringsModel from '../algorithms/specs/models/delete-operation-for-two-strings.yaml';
import editDistanceModel from '../algorithms/specs/models/edit-distance.yaml';
import palindromicSubstringsModel from '../algorithms/specs/models/palindromic-substrings.yaml';
import longestPalindromicSubsequenceModel from '../algorithms/specs/models/longest-palindromic-subsequence.yaml';
import partitionEqualSubsetSumModel from '../algorithms/specs/models/partition-equal-subset-sum.yaml';
import { DpStepEngine } from '../algorithms/categories/dynamic-programming/engine/dp-step-engine';
import { StageCodeCompiler } from './compilers/stage-code-compiler';
import '../algorithms/categories/dynamic-programming/specs';

export class AlgorithmModelRepository {
  private static registry = new Map<string, IYamlAlgorithmModel>([
    ['unique-paths', uniquePathsModel as IYamlAlgorithmModel],
    ['unique-paths-ii', uniquePathsIiModel as IYamlAlgorithmModel],
    ['min-path-sum', minimumPathSumModel as IYamlAlgorithmModel],
    ['fibonacci', fibonacciModel as IYamlAlgorithmModel],
    ['climb-stairs', climbStairsModel as IYamlAlgorithmModel],
    ['01-knapsack', knapsack01Model as IYamlAlgorithmModel],
    ['knapsack-01', knapsack01Model as IYamlAlgorithmModel],
    ['distinct-subsequences', distinctSubsequencesModel as IYamlAlgorithmModel],
    ['delete-operation-for-two-strings', deleteOperationForTwoStringsModel as IYamlAlgorithmModel],
    ['delete-distance', deleteOperationForTwoStringsModel as IYamlAlgorithmModel],
    ['edit-distance', editDistanceModel as IYamlAlgorithmModel],
    ['palindromic-substrings', palindromicSubstringsModel as IYamlAlgorithmModel],
    ['longest-palindromic-subsequence', longestPalindromicSubsequenceModel as IYamlAlgorithmModel],
    ['partition-equal-subset-sum', partitionEqualSubsetSumModel as IYamlAlgorithmModel],
    ['partition-subset', partitionEqualSubsetSumModel as IYamlAlgorithmModel],
  ]);

  // 不可变阶段编译缓存表
  private static stageCache = new Map<string, CompiledStageViewConfig>();

  /**
   * 从 DpStepEngine 的声明式 Spec 动态合成标准 5A 级 IYamlAlgorithmModel
   */
  private static synthesizeFromSpec(id: string): IYamlAlgorithmModel | null {
    const spec = DpStepEngine.get(id);
    if (!spec) return null;

    const cleanName = spec.name.includes('(') ? spec.name.split('(')[0].trim() : spec.name;

    const codeStage1 = AlgorithmModelRepository.getStageAnnotatedCode(spec.id, 'stage-1', spec);
    const codeStage2 = AlgorithmModelRepository.getStageAnnotatedCode(spec.id, 'stage-2', spec);
    const codeStage3 = AlgorithmModelRepository.getStageAnnotatedCode(spec.id, 'stage-3', spec);
    const codeStage4 = AlgorithmModelRepository.getStageAnnotatedCode(spec.id, 'stage-4', spec);

    const synthesized: IYamlAlgorithmModel = {
      id: spec.id,
      name: cleanName,
      category: 'dynamic-programming',
      difficulty: (spec.difficulty as any) || 'medium',
      description: spec.description,
      problem: spec.problem as any,
      defaultParams: spec.id === 'target-sum'
        ? { nums: [1, 1, 1, 1, 1], target: 3, n: 6 }
        : spec.id === 'combination-sum-iv'
        ? { nums: [1, 2, 3], target: 4, n: 4 }
        : spec.id === 'multiple-knapsack'
        ? { weights: [1, 3, 4], values: [15, 20, 30], nums: [2, 3, 2], bagWeight: 4, n: 4 }
        : spec.id === 'max-distance-in-tree' || spec.id === 'tree-diameter'
        ? { root: '1,2,3,4,5', n: 5 }
        : spec.id === 'largest-bst-subtree'
        ? { root: '10,5,15,1,8,null,7', n: 7 }
        : spec.id === 'max-path-sum'
        ? { root: '-10,9,20,null,null,15,7', n: 7 }
        : spec.id === 'binary-tree-cameras'
        ? { root: '0,0,null,0,0', n: 4 }
        : spec.id === 'course-selection'
        ? { n: 4, m: 3 }
        : spec.id === 'minimum-fuel-cost'
        ? { seats: 2, n: 7 }
        : spec.id === 'longest-path-different-characters'
        ? { s: 'abacbe', n: 6 }
        : spec.id === 'party-without-boss'
        ? { n: 7 }
        : spec.id === 'height-removal-queries'
        ? { queries: [4], n: 6 }
        : spec.id === 'minimum-score-after-removals'
        ? { nums: [1, 5, 5, 4, 11], n: 5 }
        : spec.id === 'can-i-win'
        ? { n: 4, m: 6 }
        : spec.id === 'matchsticks-to-square'
        ? { nums: [1, 1, 2, 2, 2], n: 5 }
        : spec.id === 'partition-k-equal-subsets'
        ? { nums: [4, 3, 2, 3, 5, 2, 1], k: 4, n: 7 }
        : spec.id === 'tsp-bitmask-dp'
        ? { n: 4 }
        : { n: 6 },
      defaultStage: 'stage-3',
      directions: {
        forward: {
          label: '正向递推',
          branches: []
        },
        reverse: {
          label: '逆向递推',
          branches: []
        }
      },
      stages: {
        'stage-1': {
          type: 'recursion',
          name: { forward: '1. 朴素递归搜索', reverse: '逆向递归' },
          desc: { forward: '展开完整递归调用树，呈现重叠子问题与指数级爆炸分支。', reverse: '' },
          timeBadge: 'O(2^n)',
          badgeBg: 'bg-rose-500/20 text-rose-300',
          card2Title: { forward: '递归搜索调用树 (Recursive Call Tree)', reverse: '逆向递归调用树' },
          card2Desc: { forward: `展开 ${cleanName} 递归调用子问题，呈现指数级爆炸分支与重复计算。`, reverse: '' },
          variants: {
            standard: {
              title: '朴素递归搜索',
              code: {
                forward: {
                  title: `${cleanName} (递归解法)`,
                  source: codeStage1
                }
              }
            }
          }
        },
        'stage-2': {
          type: 'memoization',
          name: { forward: '2. 记忆化搜索', reverse: '记忆化' },
          desc: { forward: '引入备忘录 Memo 数组/哈希表剪枝，消除重叠子问题，实现 O(1) 瞬时查表返回。', reverse: '' },
          timeBadge: 'O(n)',
          badgeBg: 'bg-amber-500/20 text-amber-300',
          card2Title: { forward: '记忆化搜索剪枝树 (Memoized Tree)', reverse: '记忆化剪枝树' },
          card2Desc: { forward: '引入 memo 备忘录缓存，已计算子问题直接 O(1) 查表剪枝返回。', reverse: '' },
          variants: {
            array_memo: {
              title: '备忘录剪枝',
              code: {
                forward: {
                  title: `${cleanName} (记忆化搜索)`,
                  source: codeStage2
                }
              }
            }
          }
        },
        'stage-3': {
          type: 'tabulation-2d',
          name: { forward: '3. 递推填表', reverse: '自底向上' },
          desc: { forward: '自底向上动态规划状态表递推，严格推导状态转移方程与边界条件。', reverse: '' },
          timeBadge: 'O(n)',
          badgeBg: 'bg-emerald-500/20 text-emerald-300',
          card2Title: { forward: '一维 DP 状态转移数组 (int[] dp)', reverse: 'DP 递推表' },
          card2Desc: { forward: '自底向上顺序填表，状态转移方程精准递推。', reverse: '' },
          variants: {
            standard: {
              title: 'DP 递推填表',
              code: {
                forward: {
                  title: `${cleanName} (动态规划)`,
                  source: codeStage3
                }
              }
            }
          }
        },
        'stage-4': {
          type: 'space-optimized-1d',
          name: { forward: '4. 空间压缩', reverse: '滚动数组' },
          desc: { forward: '利用前驱状态局部性，滚动压缩一维空间，空间复杂度优化至 O(1) 或 O(W)。', reverse: '' },
          timeBadge: 'O(1) 空间',
          badgeBg: 'bg-indigo-500/20 text-indigo-300',
          card2Title: { forward: '空间压缩滚动数组 (int[] memo)', reverse: '滚动数组' },
          card2Desc: { forward: '空间优化：利用局部状态依赖，就地滚动更新。', reverse: '' },
          variants: {
            two_vars: {
              title: '空间滚动优化',
              code: {
                forward: {
                  title: `${cleanName} (空间优化)`,
                  source: codeStage4
                }
              }
            }
          }
        }
      }
    };

    return synthesized;
  }

  /**
   * 注册算法模型
   */
  public static register(id: string, model: IYamlAlgorithmModel): void {
    if (!id || !model) {
      throw new Error('[AlgorithmModelRepository] 注册参数无效');
    }
    this.registry.set(id, model);
    // 清除该模型相关的编译缓存
    for (const key of this.stageCache.keys()) {
      if (key.startsWith(`${id}:`)) {
        this.stageCache.delete(key);
      }
    }
  }

  /**
   * 获取算法模型原始对象
   */
  public static getModel(id: string): IYamlAlgorithmModel {
    let model = this.registry.get(id);
    if (!model) {
      const synthesized = this.synthesizeFromSpec(id);
      if (synthesized) {
        this.register(id, synthesized);
        return synthesized;
      }
      throw new Error(`[AlgorithmModelRepository] 未找到算法模型: ${id}`);
    }
    return model;
  }

  /**
   * 检查模型是否存在
   */
  public static hasModel(id: string): boolean {
    if (this.registry.has(id)) return true;
    return DpStepEngine.get(id) !== undefined;
  }

  /**
   * 获取已注册的所有算法模型 ID 列表
   */
  public static getAllIds(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * 获取指定阶段与方向的已编译视图与代码高亮配置 (带 O(1) 瞬时缓存加速)
   */
  public static getCompiledStage(
    id: string,
    stageKey: string,
    direction: 'forward' | 'reverse' = 'forward'
  ): CompiledStageViewConfig {
    const cacheKey = `${id}:${stageKey}:${direction}`;
    const cached = this.stageCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const model = this.getModel(id);
    const compiled = YamlModelLoader.getCompiledStageConfig(model, stageKey, direction);

    // 兜底桥接：若某阶段或其变体的 anchorMap 为空，自动通过 spec.semanticLines 注入
    const spec = DpStepEngine.get(id);
    if (spec && spec.semanticLines) {
      const fallbackAnchorMap = bridgeSemanticLinesToAnchorMap(spec.semanticLines, 'java');
      if (!compiled.anchorMap || Object.keys(compiled.anchorMap).length === 0) {
        compiled.anchorMap = { ...fallbackAnchorMap, ...(compiled.anchorMap || {}) };
      }
      if (compiled.variants) {
        for (const variant of Object.values(compiled.variants)) {
          if (!variant.anchorMap || Object.keys(variant.anchorMap).length === 0) {
            variant.anchorMap = { ...fallbackAnchorMap, ...(variant.anchorMap || {}) };
          }
        }
      }
    }

    this.stageCache.set(cacheKey, compiled);
    return compiled;
  }

  /**
   * 预热编译所有已注册模型的全部阶段，实现零延迟运行时切换
   */
  public static warmup(targetModelId?: string): void {
    const ids = targetModelId ? [targetModelId] : this.getAllIds();
    for (const id of ids) {
      const model = this.registry.get(id);
      if (!model || !model.stages) continue;
      const stageKeys = Object.keys(model.stages);
      for (const stageKey of stageKeys) {
        this.getCompiledStage(id, stageKey, 'forward');
        this.getCompiledStage(id, stageKey, 'reverse');
      }
    }
  }

  /**
   * 清除编译缓存
   */
  public static clearCache(): void {
    this.stageCache.clear();
  }

  /**
   * 语法高亮行工具方法
   */
  public static highlightSyntax(codeLine: string): string {
    return YamlModelLoader.highlightSyntax(codeLine);
  }

  /**
   * 为合成算法模型动态生成各演化阶段的高保真源码与步骤锚点注释
   */
  private static getStageAnnotatedCode(specId: string, stage: string, spec: any): string {
    const template = StageCodeCompiler.getAnnotatedTemplate(specId, stage);
    if (template) return template;

    const rawLines = spec.code?.languages?.java || spec.code?.languages?.javascript;
    if (!rawLines || !Array.isArray(rawLines)) {
      return '';
    }

    if (!spec.semanticLines) {
      return rawLines.join('\n');
    }

    const anchorMap = bridgeSemanticLinesToAnchorMap(spec.semanticLines, 'java');
    const lineToTag = new Map<number, string>();
    if (anchorMap.entry) lineToTag.set(anchorMap.entry, 'entry');
    if (anchorMap.guard) lineToTag.set(anchorMap.guard, 'guard');
    if (anchorMap.init && !lineToTag.has(anchorMap.init)) lineToTag.set(anchorMap.init, 'init');
    if (anchorMap.loop_i && !lineToTag.has(anchorMap.loop_i)) lineToTag.set(anchorMap.loop_i, 'loop_i');
    if (anchorMap.transfer && !lineToTag.has(anchorMap.transfer)) lineToTag.set(anchorMap.transfer, 'transfer');
    if (anchorMap.return && !lineToTag.has(anchorMap.return)) lineToTag.set(anchorMap.return, 'return');

    const annotatedLines = rawLines.map((lineStr: string, idx: number) => {
      const lineNum = idx + 1;
      const tag = lineToTag.get(lineNum);
      if (tag && !lineStr.includes('@step:')) {
        return `${lineStr} // @step:${tag}`;
      }
      return lineStr;
    });

    return annotatedLines.join('\n');
  }
}

/**
 * 将 AlgorithmSpec 中的结构化 semanticLines 字典安全解析为标量行号
 */
function resolveSemanticLine(value: any, lang: string = 'java'): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  if (Array.isArray(value)) return value[value.length - 1];
  if (typeof value === 'object') {
    const langVal = value[lang];
    if (typeof langVal === 'number') return langVal;
    if (Array.isArray(langVal)) return langVal[langVal.length - 1];
    if (langVal && typeof langVal === 'object' && 'primary' in langVal) {
      return typeof langVal.primary === 'number'
        ? langVal.primary
        : Array.isArray(langVal.primary)
        ? langVal.primary[0]
        : undefined;
    }
  }
  return undefined;
}

/**
 * 将 AlgorithmSpec 中的结构化 semanticLines 字典桥接转换为标准 anchorMap
 */
export function bridgeSemanticLinesToAnchorMap(
  semanticLines: any,
  lang: string = 'java'
): Record<string, number> {
  const map: Record<string, number> = {};
  if (!semanticLines) return map;

  const entry = resolveSemanticLine(semanticLines.entry, lang);
  if (entry) map.entry = entry;

  const guard = resolveSemanticLine(semanticLines.guard, lang);
  if (guard) map.guard = guard;

  const init = resolveSemanticLine(semanticLines.init, lang);
  if (init) map.init = init;

  const loopCheck = resolveSemanticLine(semanticLines.loopCheck, lang);
  if (loopCheck) {
    map.loop_i = loopCheck;
    map.loopCheck = loopCheck;
  }

  const innerLoopCheck = resolveSemanticLine(semanticLines.innerLoopCheck, lang);
  if (innerLoopCheck) {
    map.loop_j = innerLoopCheck;
    map.innerLoopCheck = innerLoopCheck;
  }

  const transfer = resolveSemanticLine(semanticLines.stateTransfer, lang);
  if (transfer) {
    map.transfer = transfer;
    map.stateTransfer = transfer;
  }

  const loopExit = resolveSemanticLine(semanticLines.loopExit, lang);
  if (loopExit) map.loopExit = loopExit;

  const returnResult = resolveSemanticLine(semanticLines.returnResult, lang);
  if (returnResult) {
    map.return = returnResult;
    map.returnResult = returnResult;
  }

  return map;
}
