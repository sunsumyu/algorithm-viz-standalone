/**
 * 动态规划演化引擎保真度审计器 (Dp Evolution Fidelity Auditor)
 * 领域审计深模块：校验 DP 通用 4 阶段演化引擎的多语言代码齐备性、
 * 单步数据生成与语义锚点映射合法性。
 */

import { codeStepIndexer } from '../../../core/code-step-indexer';
import { extractLineNumbers, type AlgorithmAuditResult } from '../../../core/fidelity-auditor';
import {
  EVOLUTION_MODES,
  getEvolutionCodeForAlgorithm,
  buildUniversalEvolutionSteps,
} from './dp-universal-evolution';

export class DpEvolutionAuditor {
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
                const nums = extractLineNumbers(lineVal);
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
}
