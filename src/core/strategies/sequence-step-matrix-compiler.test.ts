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

    const stage3If = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage3(model, undefined, 'forward', 'if');
    expect(stage3If.length).toBeGreaterThan(0);
    expect(stage3If[stage3If.length - 1].grid?.[7]?.[6]).toBe(3);
    expect(stage3If.some((st) => st.tag?.includes('Base Case') || st.log?.includes('边界判定'))).toBe(true);

    const stage3ReverseIf = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage3(model, undefined, 'reverse', 'if');
    expect(stage3ReverseIf.length).toBeGreaterThan(0);
    expect(stage3ReverseIf[stage3ReverseIf.length - 1].grid?.[0]?.[0]).toBe(3);

    const stage4 = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage4(model);
    expect(stage4.length).toBeGreaterThan(0);
    expect(stage4[stage4.length - 1].memo?.[6]).toBe(3);

    // 验证 Stage 4 逆推足迹与网格落盘
    const stage4Reverse = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage4(model, undefined, 'reverse');
    expect(stage4Reverse.length).toBeGreaterThan(0);
    const hasTrailReverse = stage4Reverse.some((st) => Array.isArray(st.activeTrail) && st.activeTrail.length >= 2);
    expect(hasTrailReverse, 'Stage 4 逆推内层循环中必须产生活跃探索足迹 activeTrail').toBe(true);
    // 验证未匹配单元格已正常在网格中落盘（如 s[6]='t' 与 t[4]='i' 不匹配时，grid[6][4] 为 0 而非 null）
    const cellStep = stage4Reverse.find((st) => st.i === 6 && st.j === 1);
    expect(cellStep?.grid?.[6]?.[4], '非匹配单元格必须在网格中正确落盘为 0 而非 null').toBe(0);

    // 验证 Stage 4 剪枝版本 (pruned_1d) 相比全量倒序 (reverse_1d) 显著减少无效内层循环步骤
    const stage4Pruned = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage4(model, undefined, 'forward', 'pruned_1d');
    expect(stage4Pruned.length).toBeGreaterThan(0);
    expect(stage4Pruned[stage4Pruned.length - 1].memo?.[6]).toBe(3);
    expect(stage4Pruned.length, '剪枝版步骤数应当显著少于全量版步骤数').toBeLessThan(stage4.length);
    const hasCalcBounds = stage4Pruned.some((st) => st.type === 'calc_bounds');
    expect(hasCalcBounds, '剪枝版必须发射 calc_bounds 剪枝标记').toBe(true);

    // 验证剪枝版右上三角未被访问，保持为 null（严防伪造已求解的绿色足迹）
    const lastStep = stage4Pruned[stage4Pruned.length - 1];
    expect(lastStep.grid?.[1]?.[2], '剪枝版右上三角未被访问单元格必须保持为 null').toBeNull();
    expect(lastStep.grid?.[1]?.[6], '剪枝版右上三角未被访问单元格必须保持为 null').toBeNull();
    expect(lastStep.grid?.[2]?.[5], '剪枝版右上三角未被访问单元格必须保持为 null').toBeNull();

    const stage4ReversePruned = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage4(model, undefined, 'reverse', 'pruned_1d');
    expect(stage4ReversePruned.length).toBeGreaterThan(0);
    expect(stage4ReversePruned[stage4ReversePruned.length - 1].memo?.[0]).toBe(3);
    expect(stage4ReversePruned.length).toBeLessThan(stage4Reverse.length);

    // 验证 Stage 4 leftUp 暂存版本 (从左往右走)
    const stage4LeftUp = SequenceStepMatrixCompiler.compileDistinctSubsequencesStage4(model, undefined, 'forward', 'leftup_1d');
    expect(stage4LeftUp.length).toBeGreaterThan(0);
    expect(stage4LeftUp[stage4LeftUp.length - 1].memo?.[6]).toBe(3);
    const hasCacheLeftUp = stage4LeftUp.some((st) => st.type === 'cache_leftup');
    expect(hasCacheLeftUp, 'leftUp 版本必须包含暂存左上角帧').toBe(true);
    // 严格检验内层确实是从左向右正序推进: j 依次为 1, 2, 3, 4, 5, 6
    const jSteps = stage4LeftUp.filter((st) => st.i === 1 && st.type === 'loop_j').map((st) => st.j);
    expect(jSteps).toEqual([1, 2, 3, 4, 5, 6]);
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
