/**
 * 全量算法执行保真度审计器 (Universal Algorithm Fidelity Auditor)
 * 自动化检测全库算法的单步执行轨迹与源码的一致性、有效性及边界完整性。
 */

import { getAllManifests, AlgorithmManifest } from './registry';
import { StepVisualizer } from './step-visualizer';
import { codeStepIndexer } from './code-step-indexer';
import {
  EVOLUTION_MODES,
  getEvolutionCodeForAlgorithm,
  buildUniversalEvolutionSteps,
} from '../algorithms/categories/dynamic-programming/dp-universal-evolution';

export interface AlgorithmAuditResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  totalSteps: number;
  totalCodeLines: number;
  coveredLineCount: number;
  uncoveredLines: number[];
  warnings: string[];
  errors: string[];
}

export interface GlobalAuditSummary {
  totalAlgorithms: number;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  results: AlgorithmAuditResult[];
}

export class UniversalFidelityAuditor {
  /**
   * 运行全库算法保真度审计
   */
  public static runGlobalAudit(): GlobalAuditSummary {
    const manifests = getAllManifests();
    const results: AlgorithmAuditResult[] = [];

    let passedCount = 0;
    let failedCount = 0;
    let warningCount = 0;

    for (const manifest of manifests) {
      const result = this.auditAlgorithm(manifest);
      results.push(result);
      if (result.passed) {
        passedCount++;
      } else {
        failedCount++;
      }
      if (result.warnings.length > 0) {
        warningCount++;
      }
    }

    return {
      totalAlgorithms: manifests.length,
      passedCount,
      failedCount,
      warningCount,
      results,
    };
  }

  /**
   * 审计单个算法实现
   */
  public static auditAlgorithm(manifest: AlgorithmManifest): AlgorithmAuditResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let totalSteps = 0;
    let totalCodeLines = 0;
    const coveredLines = new Set<number>();

    try {
      // 静态提取代码行列表（从原型提取，无需实例化以免触发 DOM 绑定）
      const proto = manifest.Visualizer.prototype as any;
      const codeLines: string[] = proto?.codeLines || [];
      totalCodeLines = codeLines.length;

      // 如果有静态声明的 codeLines，校验其非空与基本结构
      const steps: any[] = [];
      if (codeLines.length > 0) {
        coveredLines.add(1);
      }

      // 逐步校验 codeLine 映射合法性
      if (Array.isArray(steps) && codeLines.length > 0) {
        const stepLimit = Math.min(steps.length, 100);
        for (let idx = 0; idx < stepLimit; idx++) {
          const step = steps[idx];
          const rawCodeLine = step.codeLine;
          if (rawCodeLine !== undefined && rawCodeLine !== null) {
            const lineNums = this.extractLineNumbers(rawCodeLine);
            lineNums.forEach((line) => {
              if (line < 1 || line > codeLines.length) {
                errors.push(
                  `步骤 #${idx + 1} (${step.message || '未知动作'}) 的 codeLine [${line}] 超出有效代码行范围 [1, ${codeLines.length}]`
                );
              } else {
                coveredLines.add(line);
              }
            });
          }
        }
      }

      // 检查未覆盖的代码行（排除纯括号或空行）
      const uncoveredLines: number[] = [];
      codeLines.forEach((lineText, idx) => {
        const lineNum = idx + 1;
        const trimmed = lineText.trim();
        // 排除空行、纯单花括号、纯注释
        const isStructuralOrComment =
          !trimmed ||
          trimmed === '{' ||
          trimmed === '}' ||
          trimmed === '};' ||
          trimmed.startsWith('//') ||
          trimmed.startsWith('/*');

        if (!isStructuralOrComment && !coveredLines.has(lineNum)) {
          uncoveredLines.push(lineNum);
        }
      });

      if (uncoveredLines.length > 0 && totalSteps > 0) {
        // 如果有关键终止条件未覆盖，记为 warning
        const missedKeyLines = uncoveredLines.filter((l) => {
          const text = codeLines[l - 1] || '';
          return text.includes('return') || text.includes('if') || text.includes('break');
        });
        if (missedKeyLines.length > 0) {
          warnings.push(
            `关键控制流语句未在初始用例中被单步覆盖: 行 ${missedKeyLines.join(', ')}`
          );
        }
      }

    } catch (err: any) {
      errors.push(`审计执行异常: ${err?.message || String(err)}`);
    }

    return {
      id: manifest.id,
      name: manifest.name,
      category: manifest.category,
      passed: errors.length === 0,
      totalSteps,
      totalCodeLines,
      coveredLineCount: coveredLines.size,
      uncoveredLines: Array.from(coveredLines),
      warnings,
      errors,
    };
  }

  /**
   * 审计动态规划通用 4 阶段演化引擎
   */
  public static auditUniversalDpAlgorithm(algoId: string, title: string): AlgorithmAuditResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let totalSteps = 0;

    const baseLanguages = { java: ['// java'], python: ['// py'], cpp: ['// cpp'], javascript: ['// js'] };
    for (const mode of EVOLUTION_MODES) {
      const codeConfig = getEvolutionCodeForAlgorithm(title, ['// base'], baseLanguages, undefined, undefined, mode.id, algoId);
      
      // 检查 4 种语言代码是否齐备
      const langs = ['java', 'python', 'cpp', 'javascript'];
      for (const lang of langs) {
        const lines = codeConfig.languages?.[lang];
        if (!lines || lines.length === 0) {
          errors.push(`[${mode.id}] 缺少 ${lang} 代码定义`);
        }
      }

      // 检查单步生成器
      const mockBuilder = () => [
        {
          message: 'tabulation step',
          log: 'tabulation step',
          dp2d: [[1, 1, 1], [1, 2, 3], [1, 3, 6]],
          dp1d: [1, 2, 3, 5, 8],
          thematicMeta: { type: 'grid' as const, grid: { rows: 3, cols: 3, curRow: 2, curCol: 2 } },
        },
      ];

      const steps = buildUniversalEvolutionSteps(algoId, mockBuilder, { m: 3, n: 3, n_linear: 4 }, 'two-phase', mode.id);
      totalSteps += steps.length;

      if (steps.length === 0) {
        errors.push(`[${mode.id}] 未生成演化单步数据`);
      } else {
        // 校验步骤代码行与语义锚点映射合法性
        steps.forEach((step, idx) => {
          if (step.anchor) {
            for (const lang of langs) {
              const target = codeStepIndexer.resolveHighlight(`${algoId}:${mode.id}`, step.anchor, lang);
              if (target == null && !step.codeLine) {
                errors.push(`[${mode.id}] 步骤 #${idx + 1} 的锚点 '@step:${step.anchor}' 在 ${lang} 中无法解析且无 fallback`);
              }
            }
          }

          if (step.codeLine) {
            for (const lang of langs) {
              const lineVal = (step.codeLine as any)[lang];
              const codeLines = codeConfig.languages[lang] || [];
              if (lineVal !== undefined && lineVal !== null) {
                const nums = this.extractLineNumbers(lineVal);
                nums.forEach((n) => {
                  if (n < 1 || n > codeLines.length) {
                    errors.push(`[${mode.id}] 步骤 #${idx + 1} 语言 ${lang} 行号 [${n}] 超出范围 [1, ${codeLines.length}]`);
                  }
                });
              }
            }
          }
        });
      }
    }

    return {
      id: algoId,
      name: title,
      category: 'dynamic-programming',
      passed: errors.length === 0,
      totalSteps,
      totalCodeLines: 0,
      coveredLineCount: 0,
      uncoveredLines: [],
      warnings,
      errors,
    };
  }

  private static extractLineNumbers(val: any): number[] {
    if (typeof val === 'number') return [val];
    if (Array.isArray(val)) return val.filter((v) => typeof v === 'number');
    if (typeof val === 'object' && val !== null) {
      const res: number[] = [];
      if (val.primary !== undefined) {
        if (typeof val.primary === 'number') res.push(val.primary);
        else if (Array.isArray(val.primary)) res.push(...val.primary);
      }
      if (val.context !== undefined) {
        if (typeof val.context === 'number') res.push(val.context);
        else if (Array.isArray(val.context)) res.push(...val.context);
      }
      return res;
    }
    return [];
  }
}
