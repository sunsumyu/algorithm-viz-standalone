/**
 * 空间压缩顶层抽象原语 (Spatial Compression Primitives)
 * 统一规范空间优化阶段（Stage 4 / Stage 5）一维状态数组向二维物理状态网格的前驱依赖映射，
 * 彻底消除空间压缩版中前驱色块丢失与依赖箭头缺失的架构断层。
 */

export interface CompressionSpatialDependency {
  topI?: number;
  topJ?: number;
  leftI?: number;
  leftJ?: number;
  diagI?: number;
  diagJ?: number;
}

export interface CompressionDependencyOptions {
  modelType?: 'sequence' | 'grid' | 'knapsack';
  isReverse?: boolean;
  isMatch?: boolean;
  m: number;
  n: number;
}

export class SpatialCompressionPrimitives {
  /**
   * 计算空间压缩当前步进 (i, j) 对应的二维物理网格前驱坐标
   */
  public static resolveDependencies(
    i: number,
    j: number,
    options: CompressionDependencyOptions
  ): CompressionSpatialDependency {
    const { modelType = 'sequence', isReverse = false, isMatch = false, m, n } = options;
    const result: CompressionSpatialDependency = {};

    if (modelType === 'grid') {
      // 网格路径问题 (Unique Paths / Min Path Sum 等)
      if (isReverse) {
        if (i + 1 < m) {
          result.topI = i + 1;
          result.topJ = j;
        }
        if (j + 1 < n) {
          result.leftI = i;
          result.leftJ = j + 1;
        }
      } else {
        if (i > 0) {
          result.topI = i - 1;
          result.topJ = j;
        }
        if (j > 0) {
          result.leftI = i;
          result.leftJ = j - 1;
        }
      }
    } else {
      // 序列双串与匹配问题 (Distinct Subsequences, Edit Distance, LCS 等)
      if (isReverse) {
        // 逆推后缀 DP：垂直下方 (继承/删除旧值)
        if (i + 1 < m) {
          result.topI = i + 1;
          result.topJ = j;
        }
        // 对角右下方 (字符匹配/替换暂存 pre)
        if (isMatch && i + 1 < m && j + 1 < n) {
          result.diagI = i + 1;
          result.diagJ = j + 1;
        }
      } else {
        // 顺推前缀 DP：垂直上方
        if (i > 0) {
          result.topI = i - 1;
          result.topJ = j;
        }
        // 对角左上方
        if (isMatch && i > 0 && j > 0) {
          result.diagI = i - 1;
          result.diagJ = j - 1;
        }
      }
    }

    return result;
  }
}
