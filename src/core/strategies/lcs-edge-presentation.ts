/**
 * LCS 依赖树边呈现分层 (LCS Edge Presentation Tiering)
 *
 * 将原 `buildLcsStateDepTree` 中的 `childDepth === 1` 双路径分支重构为声明式 2-row 表。
 * childDepth=1 表示根邻接层（rich 标签：完整舍弃候选/胜出/次优标注）；
 * childDepth>1 表示更深层（sparse 标签：简略舍弃/👑大标注）。
 *
 * 因呈现逻辑与引擎无关且 LCS 特有，故置于 strategies 层独立模块，
 * 供 longest-common-subsequence-renderer 导入。
 */

export interface LcsEdgeDef {
  dir: string;
  name: string;
  zhName: string;
  drop: string;
  cand: string;
}

export interface LcsEdgePresentation {
  matchLabel: () => string;
  matchTag: () => string;
  mismatchLabel: (e: LcsEdgeDef) => string;
  mismatchTag: (isWin: boolean, e: LcsEdgeDef) => string | undefined;
  mismatchStatus: (isWin: boolean) => string;
}

/** 构建 LCS 边呈现层 — childDepth 选择 rich/sparse 行 */
export function makeLcsEdgePresentation(
  a: string,
  b: string,
  forward: boolean,
  isCalculated: boolean,
  childDepth: number
): LcsEdgePresentation {
  const rich = childDepth === 1;
  const diag = forward ? '↘️' : '↖️';
  return {
    matchLabel: () => `${diag}${rich ? `匹配('${a}'=='${b}') +1` : `'${a}'(+1)`}`,
    matchTag: () => (rich ? (isCalculated ? '👑+1贡献源' : '待转移') : '👑+1贡献源'),
    mismatchLabel: (e) => `${e.dir}${rich ? e.zhName : e.name}(舍${rich ? '弃' : ''}'${e.drop}')`,
    mismatchTag: (isWin, e) =>
      rich ? (isCalculated ? (isWin ? '👑较大胜出' : '🥈次选') : e.cand) : (isWin ? '👑大' : undefined),
    mismatchStatus: (isWin) => (isCalculated && isWin ? 'visited' : 'normal'),
  };
}
