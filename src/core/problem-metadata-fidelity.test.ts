import { describe, it, expect } from 'vitest';
import { AlgorithmModelRepository } from './model-repository';
import { VisualizerAppController } from './visualizer-app-controller';

/**
 * 🏆 [Problem Metadata Fidelity Guard]
 * 题目元数据与三 Tab 保真度守护测试
 */
describe('🛡️ Algorithm Problem Metadata Fidelity Guard', () => {
  const targetModels = [
    'unique-paths',
    'unique-paths-ii',
    'min-path-sum',
    'climb-stairs',
    'fibonacci',
    'distinct-subsequences',
    'knapsack-01',
  ];

  targetModels.forEach((modelId) => {
    describe(`Model: [${modelId}]`, () => {
      it('should have complete LeetCode problem metadata defined', () => {
        expect(AlgorithmModelRepository.hasModel(modelId)).toBe(true);
        const model = AlgorithmModelRepository.getModel(modelId);

        expect(model.problem).toBeDefined();
        expect(model.problem?.title).toBeTruthy();
        expect(model.problem?.description).toBeTruthy();
        expect(model.problem?.difficulty).toBeTruthy();
        expect(model.problem?.examples).toBeDefined();
        expect(model.problem!.examples!.length).toBeGreaterThan(0);

        model.problem!.examples!.forEach((ex) => {
          expect(ex.input).toBeTruthy();
          expect(ex.output).toBeTruthy();
        });

        expect(model.problem?.constraints).toBeDefined();
        expect(model.problem!.constraints!.length).toBeGreaterThan(0);
      });
    });
  });

  it('should format problem card and analysis view safely in VisualizerAppController', () => {
    const controller = new VisualizerAppController({
      mode: 'lite',
      defaultModelId: 'unique-paths-ii'
    });

    expect(controller.activeRightTab).toBeDefined();
    // Test that methods can be invoked safely in node/mock environment
    expect(() => controller.renderProblemView()).not.toThrow();
    expect(() => controller.renderAnalysisView()).not.toThrow();
    expect(() => controller.switchRightTab('problem')).not.toThrow();
    expect(() => controller.switchRightTab('analysis')).not.toThrow();
    expect(() => controller.switchRightTab('code')).not.toThrow();
  });
});
