import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';

import { compileDeleteDistanceStage1or2, compileDeleteDistanceStage3, compileDeleteDistanceStage4 } from './sequence-deletedistance-compiler';
import { compileEditDistanceStage1or2, compileEditDistanceStage3, compileEditDistanceStage4 } from './sequence-editdistance-compiler';
import { compileDistinctSubsequencesStage1or2, compileDistinctSubsequencesStage3, compileDistinctSubsequencesStage4 } from './sequence-distinctsubsequences-compiler';
import { compileLongestPalindromicStage1or2, compileLongestPalindromicStage3, compileLongestPalindromicStage4 } from './sequence-longestpalindromic-compiler';
import { compilePalindromicSubstringsStage1or2, compilePalindromicSubstringsStage3, compilePalindromicSubstringsStage4 } from './sequence-palindromicsubstrings-compiler';
import { compileLcsStage1or2, compileLcsStage3, compileLcsStage4 } from './sequence-lcs-compiler';

/**
 * 序列与字符串 DP 步骤矩阵编译器门面 (SequenceStepMatrixCompiler Facade)
 * 原单文件 2673 行按算法拆分为 5 个独立编译模块（SRP 分离），
 * 保留原类静态方法接口，5 个 sequence-*-strategy 消费方零改动。
 */
export class SequenceStepMatrixCompiler {
  public static compileDeleteDistanceStage1or2(model: IYamlAlgorithmModel, isMemo: boolean = false, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileDeleteDistanceStage1or2(model, isMemo, anchorMap);
  }

  public static compileDeleteDistanceStage3(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileDeleteDistanceStage3(model, anchorMap);
  }

  public static compileDeleteDistanceStage4(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileDeleteDistanceStage4(model, anchorMap);
  }

  public static compileEditDistanceStage1or2(model: IYamlAlgorithmModel, isMemo: boolean = false, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileEditDistanceStage1or2(model, isMemo, anchorMap);
  }

  public static compileEditDistanceStage3(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileEditDistanceStage3(model, anchorMap);
  }

  public static compileEditDistanceStage4(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileEditDistanceStage4(model, anchorMap);
  }

  public static compileDistinctSubsequencesStage1or2(model: IYamlAlgorithmModel, isMemo: boolean = false, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileDistinctSubsequencesStage1or2(model, isMemo, anchorMap);
  }

  public static compileDistinctSubsequencesStage3(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileDistinctSubsequencesStage3(model, anchorMap);
  }

  public static compileDistinctSubsequencesStage4(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileDistinctSubsequencesStage4(model, anchorMap);
  }

  public static compileLongestPalindromicStage1or2(model: IYamlAlgorithmModel, isMemo: boolean = false, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileLongestPalindromicStage1or2(model, isMemo, anchorMap);
  }

  public static compileLongestPalindromicStage3(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileLongestPalindromicStage3(model, anchorMap);
  }

  public static compileLongestPalindromicStage4(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>): UniversalStep[] {
    return compileLongestPalindromicStage4(model, anchorMap);
  }

  public static compilePalindromicSubstringsStage1or2(model: IYamlAlgorithmModel, isMemo: boolean = false, anchorMap?: Record<string, number>): UniversalStep[] {
    return compilePalindromicSubstringsStage1or2(model, isMemo, anchorMap);
  }

  public static compilePalindromicSubstringsStage3(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>): UniversalStep[] {
    return compilePalindromicSubstringsStage3(model, anchorMap);
  }

  public static compilePalindromicSubstringsStage4(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>): UniversalStep[] {
    return compilePalindromicSubstringsStage4(model, anchorMap);
  }

  public static compileLcsStage1or2(model: IYamlAlgorithmModel, isMemo: boolean = false, anchorMap?: Record<string, number>, direction?: 'forward' | 'reverse'): UniversalStep[] {
    return compileLcsStage1or2(model, isMemo, anchorMap, direction);
  }

  public static compileLcsStage3(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>, direction?: 'forward' | 'reverse'): UniversalStep[] {
    return compileLcsStage3(model, anchorMap, direction);
  }

  public static compileLcsStage4(model: IYamlAlgorithmModel, anchorMap?: Record<string, number>, direction?: 'forward' | 'reverse'): UniversalStep[] {
    return compileLcsStage4(model, anchorMap, direction);
  }
}
