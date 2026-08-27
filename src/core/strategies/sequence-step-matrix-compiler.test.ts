import { describe, it, expect } from 'vitest';
import { SequenceStepMatrixCompiler } from './sequence-step-matrix-compiler';
import { AlgorithmModelRepository } from '../model-repository';

describe('SequenceStepMatrixCompiler Deep Module', () => {
  it('should compile Delete Distance steps (Stage 1-4)', () => {
    const model = AlgorithmModelRepository.getModel('delete-operation-for-two-strings');
    const stage1 = SequenceStepMatrixCompiler.compileDeleteDistanceStage1or2(model, false);
    expect(stage1.length).toBeGreaterThan(0);
    expect(stage1[stage1.length - 1].type).toBe('return');

    const stage2 = SequenceStepMatrixCompiler.compileDeleteDistanceStage1or2(model, true);
    expect(stage2.length).toBeGreaterThan(0);
    expect(stage2.some(s => s.type === 'cache-hit')).toBe(true);

    const stage3 = SequenceStepMatrixCompiler.compileDeleteDistanceStage3(model);
    expect(stage3.length).toBeGreaterThan(0);
    expect(stage3[stage3.length - 1].grid?.[3]?.[3]).toBe(2);

    const stage4 = SequenceStepMatrixCompiler.compileDeleteDistanceStage4(model);
    expect(stage4.length).toBeGreaterThan(0);
    expect(stage4[stage4.length - 1].memo?.[3]).toBe(2);
  });

  it('should compile Edit Distance steps (Stage 1-4)', () => {
    const model = AlgorithmModelRepository.getModel('edit-distance');
    const stage1 = SequenceStepMatrixCompiler.compileEditDistanceStage1or2(model, false);
    expect(stage1.length).toBeGreaterThan(0);

    const stage2 = SequenceStepMatrixCompiler.compileEditDistanceStage1or2(model, true);
    expect(stage2.length).toBeGreaterThan(0);

    const stage3 = SequenceStepMatrixCompiler.compileEditDistanceStage3(model);
    expect(stage3.length).toBeGreaterThan(0);
    expect(stage3[stage3.length - 1].grid?.[5]?.[3]).toBe(3);

    const stage4 = SequenceStepMatrixCompiler.compileEditDistanceStage4(model);
    expect(stage4.length).toBeGreaterThan(0);
    expect(stage4[stage4.length - 1].memo?.[3]).toBe(3);
  });

  it('should compile Distinct Subsequences steps (Stage 1-4)', () => {
    const model = AlgorithmModelRepository.getModel('distinct-subsequences');
    const stage1 = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage1or2(model, false);
    expect(stage1.length).toBeGreaterThan(0);

    const stage3 = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage3(model);
    expect(stage3.length).toBeGreaterThan(0);
    expect(stage3[stage3.length - 1].grid?.[7]?.[6]).toBe(3);

    const stage4 = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage4(model);
    expect(stage4.length).toBeGreaterThan(0);
    expect(stage4[stage4.length - 1].memo?.[6]).toBe(3);
  });

  it('should compile Longest Palindromic Subsequence steps (Stage 1-4)', () => {
    const model = AlgorithmModelRepository.getModel('longest-palindromic-subsequence');
    const stage1 = SequenceStepMatrixCompiler.compileLongestPalindromicStage1or2(model, false);
    expect(stage1.length).toBeGreaterThan(0);

    const stage3 = SequenceStepMatrixCompiler.compileLongestPalindromicStage3(model);
    expect(stage3.length).toBeGreaterThan(0);
    expect(stage3[stage3.length - 1].grid?.[0]?.[4]).toBe(4);

    const stage4 = SequenceStepMatrixCompiler.compileLongestPalindromicStage4(model);
    expect(stage4.length).toBeGreaterThan(0);
    expect(stage4[stage4.length - 1].memo?.[4]).toBe(4);
  });

  it('should compile Palindromic Substrings steps (Stage 1-4)', () => {
    const model = AlgorithmModelRepository.getModel('palindromic-substrings');
    const stage1 = SequenceStepMatrixCompiler.compilePalindromicSubstringsStage1or2(model, false);
    expect(stage1.length).toBeGreaterThan(0);

    const stage3 = SequenceStepMatrixCompiler.compilePalindromicSubstringsStage3(model);
    expect(stage3.length).toBeGreaterThan(0);
    expect(stage3[stage3.length - 1].grid?.[0]?.[2]).toBe(1);

    const stage4 = SequenceStepMatrixCompiler.compilePalindromicSubstringsStage4(model);
    expect(stage4.length).toBeGreaterThan(0);
  });
});
