import { describe, it, expect } from 'vitest';
import { DpStepEngine } from '../algorithms/categories/dynamic-programming/engine/dp-step-engine';
// 触发全量 DP Spec 集中注册
import '../algorithms/categories/dynamic-programming/specs';
import { AlgorithmModelRepository } from './model-repository';
import type { LanguageKey } from '../algorithms/categories/dynamic-programming/engine/types';

describe('DP Full Regression Suite (全量动态规划规格、多语言行号与高亮联动扫描)', () => {
  const allSpecs = DpStepEngine.getAll();
  const languages: LanguageKey[] = ['java', 'cpp', 'python', 'javascript'];

  it('1. 全量 DP 算法规格完整性扫描 (至少收录 30+ 项标准 DP 算法)', () => {
    expect(allSpecs.length).toBeGreaterThanOrEqual(30);

    for (const spec of allSpecs) {
      expect(spec.id, `Spec [${spec.id}] 缺少 ID`).toBeTruthy();
      expect(spec.name, `Spec [${spec.id}] 缺少名称`).toBeTruthy();
      expect(spec.category, `Spec [${spec.id}] 缺少分类`).toBeTruthy();
      expect(spec.problem, `Spec [${spec.id}] 缺少题目信息`).toBeDefined();
      expect(spec.problem.description, `Spec [${spec.id}] 缺少题目描述`).toBeTruthy();
      expect(spec.code, `Spec [${spec.id}] 缺少代码模块`).toBeDefined();
      expect(spec.code.languages, `Spec [${spec.id}] 缺少语言字典`).toBeDefined();
    }
  });

  it('2. 四种主流语言代码完整性与行号边界守护 (Java, C++, Python, JavaScript)', () => {
    for (const spec of allSpecs) {
      for (const lang of languages) {
        const lines = spec.code.languages[lang];
        expect(
          lines && lines.length > 0,
          `Spec [${spec.id}] 缺少语言 [${lang}] 的代码实现`
        ).toBe(true);

        const totalLines = lines.length;

        // 检查 semanticLines 中各语义锚点行号是否在合法范围内 [1, totalLines]
        if (spec.semanticLines) {
          for (const [key, semanticVal] of Object.entries(spec.semanticLines)) {
            if (!semanticVal) continue;

            let lineNumToCheck: number | number[] | undefined;
            if (typeof semanticVal === 'number' || Array.isArray(semanticVal)) {
              if (lang === 'java') {
                lineNumToCheck = semanticVal;
              }
            } else if (typeof semanticVal === 'object') {
              const valForLang = (semanticVal as any)[lang];
              if (typeof valForLang === 'number' || Array.isArray(valForLang)) {
                lineNumToCheck = valForLang;
              } else if (valForLang && typeof valForLang === 'object' && 'primary' in valForLang) {
                lineNumToCheck = valForLang.primary;
              }
            }

            if (lineNumToCheck !== undefined) {
              const numList = Array.isArray(lineNumToCheck) ? lineNumToCheck : [lineNumToCheck];
              for (const ln of numList) {
                expect(
                  ln,
                  `Spec [${spec.id}] 语言 [${lang}] 语义锚点 [${key}] 行号 ${ln} 超出源码总行数 ${totalLines}`
                ).toBeLessThanOrEqual(totalLines);
                expect(
                  ln,
                  `Spec [${spec.id}] 语言 [${lang}] 语义锚点 [${key}] 行号 ${ln} 必须大于 0`
                ).toBeGreaterThan(0);
              }
            }
          }
        }
      }
    }
  });

  it('3. 全量模型阶段编译与 anchorMap 零越界守护', () => {
    AlgorithmModelRepository.clearCache();
    const ids = AlgorithmModelRepository.getAllIds();

    for (const id of ids) {
      const model = AlgorithmModelRepository.getModel(id);
      if (!model || !model.stages) continue;

      for (const stageKey of Object.keys(model.stages)) {
        const compiled = AlgorithmModelRepository.getCompiledStage(id, stageKey, 'forward');
        expect(compiled, `模型 [${id}] 阶段 [${stageKey}] 编译失败`).toBeDefined();

        const lineCount = (compiled.codeHtml?.match(/class="code-line"/g) || []).length;
        if (lineCount === 0) continue;

        const mapsToCheck = [compiled.anchorMap];
        if (compiled.variants) {
          for (const v of Object.values(compiled.variants)) {
            mapsToCheck.push(v.anchorMap);
          }
        }

        for (const map of mapsToCheck) {
          if (!map) continue;
          for (const [tag, line] of Object.entries(map)) {
            if (typeof line === 'number') {
              expect(
                line,
                `模型 [${id}] 阶段 [${stageKey}] 锚点 [${tag}] 行号 ${line} 超出代码行数 ${lineCount}`
              ).toBeLessThanOrEqual(lineCount);
              expect(
                line,
                `模型 [${id}] 阶段 [${stageKey}] 锚点 [${tag}] 行号 ${line} 必须大于 0`
              ).toBeGreaterThan(0);
            }
          }
        }
      }
    }
  });

  it('4. 全量 DP Spec 单步执行器 (generateSteps) 稳健性与行号边界验证', () => {
    for (const spec of allSpecs) {
      if (typeof spec.generateSteps !== 'function') continue;

      // 提取题目默认用例参数或简单边界参数
      let sampleInput: any = {};
      if (spec.problem.examples && spec.problem.examples.length > 0) {
        sampleInput = spec.problem.examples[0].input || {};
      }

      try {
        const steps = spec.generateSteps(sampleInput);
        expect(
          steps.length,
          `Spec [${spec.id}] 单步执行器未生成任何步骤`
        ).toBeGreaterThan(0);

        const javaLines = spec.code.languages.java.length;
        for (let idx = 0; idx < steps.length; idx++) {
          const s = steps[idx];
          if (s.line !== undefined && typeof s.line === 'number') {
            expect(
              s.line,
              `Spec [${spec.id}] 步骤 #${idx + 1} 行号 ${s.line} 超出 Java 源码总行数 ${javaLines}`
            ).toBeLessThanOrEqual(javaLines);
            expect(
              s.line,
              `Spec [${spec.id}] 步骤 #${idx + 1} 行号 ${s.line} 必须大于 0`
            ).toBeGreaterThan(0);
          }
        }
      } catch (err: any) {
        // 如果题目需要特定参数结构，验证它至少能在 spec 内部用例上运行
        expect(err).toBeUndefined();
      }
    }
  });
});
