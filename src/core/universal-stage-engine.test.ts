import { describe, it, expect } from 'vitest';
import { UniversalStageEngine } from './universal-stage-engine';
import { AlgorithmModelRepository } from './model-repository';
import { VisualizerStateRouter } from './state-router';

describe('UniversalStageEngine & VisualizerStateRouter Deep Modules', () => {
  const model = AlgorithmModelRepository.getModel('unique-paths');

  describe('UniversalStageEngine Step Computation', () => {
    it('should generate valid Stage 1 (naive recursion) steps for 3x3 grid (forward and reverse)', () => {
      const forwardSteps = UniversalStageEngine.generateStage1or2Steps(model, 3, 3, 'forward', false);
      expect(forwardSteps.length).toBeGreaterThan(0);
      const lastForwardStep = forwardSteps[forwardSteps.length - 1];
      expect(lastForwardStep.type).toBe('return');
      expect(lastForwardStep.log).toContain('uniquePaths(3, 3) = 6');

      const reverseSteps = UniversalStageEngine.generateStage1or2Steps(model, 3, 3, 'reverse', false);
      expect(reverseSteps.length).toBeGreaterThan(0);
      const lastReverseStep = reverseSteps[reverseSteps.length - 1];
      expect(lastReverseStep.type).toBe('return');
      expect(lastReverseStep.log).toContain('uniquePaths(3, 3) = 6');
    });

    it('should generate valid Stage 2 (memoization) steps with cache-hit pruning', () => {
      const memoSteps = UniversalStageEngine.generateStage1or2Steps(model, 3, 3, 'forward', true);
      const cacheHitSteps = memoSteps.filter(s => s.type === 'cache-hit');
      expect(cacheHitSteps.length).toBeGreaterThan(0);
      const lastStep = memoSteps[memoSteps.length - 1];
      expect(lastStep.log).toContain('uniquePaths(3, 3) = 6');
    });

    it('should generate valid Stage 3 (2D tabulation) steps with complete filling', () => {
      const tabStepsForward = UniversalStageEngine.generateStage3Steps(model, 3, 3, 'forward');
      expect(tabStepsForward.length).toBeGreaterThan(0);
      const lastStepForward = tabStepsForward[tabStepsForward.length - 1];
      expect(lastStepForward.grid?.[2][2]).toBe(6);

      const tabStepsReverse = UniversalStageEngine.generateStage3Steps(model, 3, 3, 'reverse');
      expect(tabStepsReverse.length).toBeGreaterThan(0);
      const lastStepReverse = tabStepsReverse[tabStepsReverse.length - 1];
      expect(lastStepReverse.grid?.[0][0]).toBe(6);
    });

    it('should generate valid Stage 4 (1D space optimization) steps for if and for variants', () => {
      const stepsIf = UniversalStageEngine.generateStage4Steps(model, 3, 3, 'forward', 'if');
      const lastStepIf = stepsIf[stepsIf.length - 1];
      expect(lastStepIf.memoSnapshot?.[2]).toBe(6);

      const stepsFor = UniversalStageEngine.generateStage4Steps(model, 3, 3, 'forward', 'for');
      const lastStepFor = stepsFor[stepsFor.length - 1];
      expect(lastStepFor.memoSnapshot?.[2]).toBe(6);

      const stepsReverseFor = UniversalStageEngine.generateStage4Steps(model, 3, 3, 'reverse', 'for');
      const lastStepReverseFor = stepsReverseFor[stepsReverseFor.length - 1];
      expect(lastStepReverseFor.memoSnapshot?.[0]).toBe(6);
    });

    it('handles 1x1 base case correctly across all stages', () => {
      const stage1Steps = UniversalStageEngine.generateStage1or2Steps(model, 1, 1, 'forward', false);
      expect(stage1Steps.length).toBeGreaterThan(0);

      const stage3Steps = UniversalStageEngine.generateStage3Steps(model, 1, 1, 'forward');
      expect(stage3Steps.length).toBeGreaterThan(0);
      expect(stage3Steps[stage3Steps.length - 1].grid?.[0][0]).toBe(1);

      const stage4Steps = UniversalStageEngine.generateStage4Steps(model, 1, 1, 'forward', 'if');
      expect(stage4Steps.length).toBeGreaterThan(0);
      expect(stage4Steps[stage4Steps.length - 1].memoSnapshot?.[0]).toBe(1);
    });
  });

  describe('VisualizerStateRouter State Serialization & Restoration', () => {
    it('serializes visualizer state to hash string correctly', () => {
      const hash = VisualizerStateRouter.serialize({
        stage: 'stage-3',
        dir: 'reverse',
        variant: 'for',
        m: 4,
        n: 5,
        step: 12
      });
      expect(hash).toBe('#stage=stage-3&dir=reverse&variant=for&m=4&n=5&step=12');
    });
  });
});
