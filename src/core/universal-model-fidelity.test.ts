import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from './model-repository';
import { UniversalStageEngine, UniversalStep } from './universal-stage-engine';
import { YamlModelLoader } from './yaml-model-loader';
import { GridVisualAdapter } from './renderers/grid-visual-adapter';

/**
 * 🛡️ [Universal Model Fidelity & Anchor Spec Guard]
 * 全库算法模型与源码语义锚点高亮保真度自动化契约测试。
 * 
 * 核心保障：
 * 1. 遍历全量注册的 YAML 算法模型。
 * 2. 遍历所有 Stage (1~4)、所有演化方向 (forward/reverse)、所有代码变体 (terminal/boundary/if/for)。
 * 3. 校验生成的每个 UniversalStep 对应的 step.line 必须在合法行号范围内。
 * 4. 强断言关键控制流步骤（越界、障碍阻断、缓存命中、分支、状态转移、递归返回）
 *    必须精准命中对应的代码语义行，严禁落在方法声明行、类声明行或空结构行上！
 */
describe('🛡️ Universal Model Fidelity & Anchor Spec Guard', () => {
  const modelIds = Array.from(new Set(AlgorithmModelRepository.getAllIds()));

  it('should have loaded all core YAML models', () => {
    expect(modelIds.length).toBeGreaterThan(0);
    expect(modelIds).toContain('unique-paths');
    expect(modelIds).toContain('unique-paths-ii');
    expect(modelIds).toContain('min-path-sum');
  });

  modelIds.forEach((modelId) => {
    describe(`Algorithm Model: [${modelId}]`, () => {
      const model = AlgorithmModelRepository.getModel(modelId);
      const stageKeys = Object.keys(model.stages);
      const directions: Array<'forward' | 'reverse'> = ['forward', 'reverse'];

      stageKeys.forEach((stageKey) => {
        directions.forEach((direction) => {
          it(`should guarantee valid step line mapping for ${stageKey} (${direction})`, () => {
            const stageConfig = AlgorithmModelRepository.getCompiledStage(modelId, stageKey, direction);
            if (!stageConfig) return;

            const variants = stageConfig.variants ? Object.keys(stageConfig.variants) : [undefined];

            variants.forEach((variantKey) => {
              const anchorMap = variantKey && stageConfig.variants?.[variantKey]
                ? stageConfig.variants[variantKey].anchorMap
                : stageConfig.anchorMap;

              const cleanSource = variantKey && stageConfig.variants?.[variantKey]
                ? YamlModelLoader.compileSource(model.stages[stageKey].variants?.[variantKey]?.code?.[direction] || model.stages[stageKey].variants?.[variantKey]?.code?.forward).cleanSource
                : (stageConfig.codeTitle ? YamlModelLoader.compileSource(model.stages[stageKey].code?.[direction] || model.stages[stageKey].code?.forward).cleanSource : '');

              const codeLines = cleanSource ? cleanSource.split('\n') : [];
              const totalLines = codeLines.length;

              let steps: UniversalStep[] = [];
              const m = model.defaultParams?.m || 3;
              const n = model.defaultParams?.n || 3;

              if (stageKey === 'stage-1') {
                steps = UniversalStageEngine.generateStage1or2Steps(model, m, n, direction, false, anchorMap, variantKey || 'terminal');
              } else if (stageKey === 'stage-2') {
                steps = UniversalStageEngine.generateStage1or2Steps(model, m, n, direction, true, anchorMap, variantKey || 'terminal');
              } else if (stageKey === 'stage-3') {
                steps = UniversalStageEngine.generateStage3Steps(model, m, n, direction, anchorMap);
              } else if (stageKey === 'stage-4') {
                steps = UniversalStageEngine.generateStage4Steps(model, m, n, direction, (variantKey === 'for' ? 'for' : 'if'), anchorMap);
              }

              expect(steps.length).toBeGreaterThan(0);

              if (totalLines > 0) {
                steps.forEach((step, idx) => {
                  // 1. 行号必须在有效范围内
                  expect(step.line).toBeGreaterThanOrEqual(1);
                  expect(step.line).toBeLessThanOrEqual(totalLines);

                  const lineText = (step.line !== undefined ? codeLines[step.line - 1] : '') || '';

                  // 2. 关键语义检查：越界/障碍阻断步骤绝对不能落在方法声明行（如 private int dfs）
                  if (step.type === 'out-of-bounds' || step.type === 'obstacle-hit') {
                    expect(lineText).not.toMatch(/dfs\s*\(/);
                    expect(lineText).not.toMatch(/class\s+/);
                    expect(lineText).toMatch(/if\s*\(|return/);
                  }

                  // 3. 缓存命中步骤必须落在含有 memo/cache/return 的判断行上
                  if (step.type === 'cache-hit') {
                    expect(lineText).not.toMatch(/dfs\s*\(/);
                    expect(lineText).toMatch(/memo|cache|return/);
                  }

                  // 4. 分支调用步骤必须落在递归调用行或循环分支行上
                  if (step.type === 'branch-down' || step.type === 'branch-right' || step.type === 'branch-left' || step.type === 'branch-up') {
                    expect(lineText).toMatch(/dfs|return|for|\(|\)/);
                  }
                });
              }
            });
          });
        });
      });
    });
  });

  it('should guarantee adventurer character presence across 100% of grid-based algorithm steps', () => {
    class MockHTMLElement {
      public style: Record<string, string> = {};
      public innerHTML = '';
      public className = '';
      public children: MockHTMLElement[] = [];
      public attributes: Record<string, string> = {};

      public appendChild(child: MockHTMLElement) {
        this.children.push(child);
      }

      public setAttribute(name: string, value: string) {
        this.attributes[name] = value;
      }

      public getAttribute(name: string): string | null {
        return this.attributes[name] ?? null;
      }

      public querySelector(selector: string): MockHTMLElement | null {
        if (selector.startsWith('.')) {
          const cls = selector.slice(1);
          if (this.className.includes(cls) || this.innerHTML.includes(cls)) return this;
        }
        if (selector.startsWith('[data-coord=')) {
          const match = selector.match(/\[data-coord="([^"]+)"\]/);
          if (match && this.attributes['data-coord'] === match[1]) return this;
        }
        for (const c of this.children) {
          const found = c.querySelector(selector);
          if (found) return found;
        }
        return null;
      }

      public get firstElementChild(): MockHTMLElement | null {
        return this.children[0] || null;
      }
    }
    (globalThis as any).document = {
      createElement: () => new MockHTMLElement()
    };

    const gridModelIds = ['unique-paths', 'unique-paths-ii', 'min-path-sum'];

    gridModelIds.forEach((gridId) => {
      const model = AlgorithmModelRepository.getModel(gridId);
      ['stage-1', 'stage-2', 'stage-3', 'stage-4'].forEach((stageKey) => {
        ['forward', 'reverse'].forEach((dir: any) => {
          const isMemo = stageKey === 'stage-2';
          const stageConfig = AlgorithmModelRepository.getCompiledStage(gridId, stageKey, dir);
          const variants = stageConfig?.variants ? Object.keys(stageConfig.variants) : ['terminal'];

          variants.forEach((v) => {
            const anchorMap = stageConfig?.variants?.[v]?.anchorMap || stageConfig?.anchorMap;
            let steps: UniversalStep[] = [];
            if (stageKey === 'stage-1' || stageKey === 'stage-2') {
              steps = UniversalStageEngine.generateStage1or2Steps(model, 3, 3, dir, isMemo, anchorMap, v || 'terminal');
            } else if (stageKey === 'stage-3') {
              steps = UniversalStageEngine.generateStage3Steps(model, 3, 3, dir, anchorMap);
            } else if (stageKey === 'stage-4') {
              steps = UniversalStageEngine.generateStage4Steps(model, 3, 3, dir, (v === 'for' ? 'for' : 'if'), anchorMap);
            }

            steps.forEach((step, idx) => {
              const container = new MockHTMLElement() as unknown as HTMLElement;
              GridVisualAdapter.renderGrid(container, step, { m: 3, n: 3, isReverse: dir === 'reverse' });
              const mock = container as unknown as MockHTMLElement;

              // 检查整个网格容器内必须至少有 1 个单元格包含 adventurer-char
              const hasAdventurer = mock.children.some((c) => c.innerHTML.includes('adventurer-char'));
              if (!hasAdventurer) {
                throw new Error(
                  `[${gridId} | ${stageKey} | ${dir} | ${v}] 步骤 #${idx + 1} (${step.type} at ${step.i},${step.j}) 探险家小人意外消失！`
                );
              }
              expect(hasAdventurer).toBe(true);
            });
          });
        });
      });
    });
  });
});

