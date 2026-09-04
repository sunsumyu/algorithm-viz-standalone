/**
 * 模型动态合成引擎深模块 (ModelSynthesisEngine Deep Module)
 * 遵循深模块原则：
 * 封装从声明式 DpStepEngine Spec 动态合成标准 5A 级 IYamlAlgorithmModel 的完整编译推导流水线。
 * 消除 AlgorithmModelRepository 中的长分支硬编码，提供纯粹的领域模型合成与语义锚点桥接能力。
 */

import type { IYamlAlgorithmModel } from './interfaces';
import { DpStepEngine } from '../algorithms/categories/dynamic-programming/engine/dp-step-engine';
import { StageCodeCompiler } from './compilers/stage-code-compiler';

export class ModelSynthesisEngine {
  /**
   * 默认测试用例与输入参数配置字典表（彻底消除巨型三元表达式分支）
   */
  private static readonly DEFAULT_PARAMS_MAP: Record<string, Record<string, unknown>> = {
    'target-sum': { nums: [1, 1, 1, 1, 1], target: 3, n: 6 },
    'combination-sum-iv': { nums: [1, 2, 3], target: 4, n: 4 },
    'multiple-knapsack': { weights: [1, 3, 4], values: [15, 20, 30], nums: [2, 3, 2], bagWeight: 4, n: 4 },
    'max-distance-in-tree': { root: '1,2,3,4,5', n: 5 },
    'tree-diameter': { root: '1,2,3,4,5', n: 5 },
    'largest-bst-subtree': { root: '10,5,15,1,8,null,7', n: 7 },
    'max-path-sum': { root: '-10,9,20,null,null,15,7', n: 7 },
    'binary-tree-cameras': { root: '0,0,null,0,0', n: 4 },
    'course-selection': { n: 4, m: 3 },
    'minimum-fuel-cost': { seats: 2, n: 7 },
    'longest-path-different-characters': { s: 'abacbe', n: 6 },
    'party-without-boss': { n: 7 },
    'height-removal-queries': { queries: [4], n: 6 },
    'minimum-score-after-removals': { nums: [1, 5, 5, 4, 11], n: 5 },
    'can-i-win': { n: 4, m: 6 },
    'matchsticks-to-square': { nums: [1, 1, 2, 2, 2], n: 5 },
    'partition-k-equal-subsets': { nums: [4, 3, 2, 3, 5, 2, 1], k: 4, n: 7 },
    'tsp-bitmask-dp': { n: 4 },
  };

  /**
   * 获取指定算法规格的默认执行参数
   */
  public static getDefaultParams(specId: string): Record<string, unknown> {
    return this.DEFAULT_PARAMS_MAP[specId] || { n: 6 };
  }

  /**
   * 从 DpStepEngine 的声明式 Spec 动态合成标准 5A 级 IYamlAlgorithmModel
   */
  public static synthesizeFromSpec(id: string): IYamlAlgorithmModel | null {
    const spec = DpStepEngine.get(id);
    if (!spec) return null;

    const cleanName = spec.name.includes('(') ? spec.name.split('(')[0].trim() : spec.name;

    const codeStage1 = this.getStageAnnotatedCode(spec.id, 'stage-1', spec);
    const codeStage2 = this.getStageAnnotatedCode(spec.id, 'stage-2', spec);
    const codeStage3 = this.getStageAnnotatedCode(spec.id, 'stage-3', spec);
    const codeStage4 = this.getStageAnnotatedCode(spec.id, 'stage-4', spec);

    const synthesized: IYamlAlgorithmModel = {
      id: spec.id,
      name: cleanName,
      category: 'dynamic-programming',
      difficulty: (spec.difficulty as any) || 'medium',
      description: spec.description,
      problem: spec.problem as any,
      defaultParams: this.getDefaultParams(spec.id),
      defaultStage: 'stage-3',
      directions: {
        forward: {
          label: '正向递推',
          branches: [],
        },
        reverse: {
          label: '逆向递推',
          branches: [],
        },
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
                  source: codeStage1,
                },
              },
            },
          },
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
                  source: codeStage2,
                },
              },
            },
          },
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
                  source: codeStage3,
                },
              },
            },
          },
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
                  source: codeStage4,
                },
              },
            },
          },
        },
      },
    };

    return synthesized;
  }

  /**
   * 为合成算法模型动态生成各演化阶段的高保真源码与步骤锚点注释
   */
  public static getStageAnnotatedCode(specId: string, stage: string, spec: any): string {
    const template = StageCodeCompiler.getAnnotatedTemplate(specId, stage);
    if (template) return template;

    const rawLines = spec.code?.languages?.java || spec.code?.languages?.javascript;
    if (!rawLines || !Array.isArray(rawLines)) {
      return '';
    }

    if (!spec.semanticLines) {
      return rawLines.join('\n');
    }

    const anchorMap = this.bridgeSemanticLinesToAnchorMap(spec.semanticLines, 'java');
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

  /**
   * 将 AlgorithmSpec 中的结构化 semanticLines 字典安全解析为标量行号
   */
  public static resolveSemanticLine(value: any, lang: string = 'java'): number | undefined {
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
  public static bridgeSemanticLinesToAnchorMap(
    semanticLines: any,
    lang: string = 'java'
  ): Record<string, number> {
    const map: Record<string, number> = {};
    if (!semanticLines) return map;

    const entry = this.resolveSemanticLine(semanticLines.entry, lang);
    if (entry) map.entry = entry;

    const guard = this.resolveSemanticLine(semanticLines.guard, lang);
    if (guard) map.guard = guard;

    const init = this.resolveSemanticLine(semanticLines.init, lang);
    if (init) map.init = init;

    const loopCheck = this.resolveSemanticLine(semanticLines.loopCheck, lang);
    if (loopCheck) {
      map.loop_i = loopCheck;
      map.loopCheck = loopCheck;
    }

    const innerLoopCheck = this.resolveSemanticLine(semanticLines.innerLoopCheck, lang);
    if (innerLoopCheck) {
      map.loop_j = innerLoopCheck;
      map.innerLoopCheck = innerLoopCheck;
    }

    const transfer = this.resolveSemanticLine(semanticLines.stateTransfer, lang);
    if (transfer) {
      map.transfer = transfer;
      map.stateTransfer = transfer;
    }

    const loopExit = this.resolveSemanticLine(semanticLines.loopExit, lang);
    if (loopExit) map.loopExit = loopExit;

    const returnResult = this.resolveSemanticLine(semanticLines.returnResult, lang);
    if (returnResult) {
      map.return = returnResult;
      map.returnResult = returnResult;
    }

    return map;
  }
}

export const bridgeSemanticLinesToAnchorMap = ModelSynthesisEngine.bridgeSemanticLinesToAnchorMap.bind(ModelSynthesisEngine);
export const resolveSemanticLine = ModelSynthesisEngine.resolveSemanticLine.bind(ModelSynthesisEngine);
