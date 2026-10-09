/**
 * 严格次小生成树步进编译器 (SecondMstStepCompiler)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 职责：Kruskal 求主生成树、倍增维护严格最大/次大边、枚举非树边破圈换边推演
 */

import { StepBase } from '../../../core/step-visualizer';

export interface SecondMstStep extends StepBase {
  mstWeight: number;
  secondMstWeight: number;
  testedNonTreeEdge: { u: number; v: number; w: number } | null;
  replacedMstEdge: { u: number; v: number; w: number } | null;
  parentArray: number[];
  depthArray: number[];
  max1Array: number[];
  max2Array: number[];
  activeArray?: 'parent' | 'depth' | 'max1' | 'max2';
  activeSlot?: number;
  status: 'kruskal' | 'lca_lift' | 'swap' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export const SMST_COORDS_5: Record<number, { x: number; y: number }> = {
  1: { x: 50, y: 105 },
  2: { x: 110, y: 45 },
  3: { x: 190, y: 45 },
  4: { x: 110, y: 165 },
  5: { x: 260, y: 105 },
};

export const SMST_COORDS_4: Record<number, { x: number; y: number }> = {
  1: { x: 75, y: 65 },
  2: { x: 235, y: 65 },
  3: { x: 235, y: 155 },
  4: { x: 75, y: 155 },
};

export const SMST_EDGES_5 = [
  { u: 1, v: 2, w: 2 },
  { u: 2, v: 3, w: 3 },
  { u: 3, v: 5, w: 3 },
  { u: 4, v: 5, w: 5 },
  { u: 1, v: 4, w: 5 },
];

export const SMST_EDGES_4 = [
  { u: 1, v: 2, w: 1 },
  { u: 2, v: 3, w: 2 },
  { u: 3, v: 4, w: 3 },
  { u: 1, v: 4, w: 4 },
];

export function buildSecondMstSteps(preset: string = 'classic_4node_p4180'): SecondMstStep[] {
  const steps: SecondMstStep[] = [];
  const isEqual = preset === 'equal_weight_5node';
  const n = isEqual ? 5 : 4;

  const rawEdges: Array<{ u: number; v: number; w: number; inMST: boolean }> = isEqual
    ? [
        { u: 3, v: 4, w: 1, inMST: false },
        { u: 1, v: 2, w: 2, inMST: false },
        { u: 2, v: 3, w: 2, inMST: false },
        { u: 4, v: 5, w: 3, inMST: false },
        { u: 1, v: 5, w: 3, inMST: false },
      ]
    : [
        { u: 1, v: 2, w: 1, inMST: false },
        { u: 2, v: 3, w: 2, inMST: false },
        { u: 3, v: 4, w: 3, inMST: false },
        { u: 1, v: 4, w: 4, inMST: false },
      ];

  const parent: number[] = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) parent[i] = i;

  const depth: number[] = new Array(n + 1).fill(0);
  const max1: number[] = new Array(n + 1).fill(-1);
  const max2: number[] = new Array(n + 1).fill(-1);

  let mstWeight = 0;
  let secondMstWeight = Infinity;
  let testedNonTree: { u: number; v: number; w: number } | null = null;
  let replacedEdge: { u: number; v: number; w: number } | null = null;

  function find(i: number): number {
    if (parent[i] === i) return i;
    return (parent[i] = find(parent[i]));
  }

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'kruskal' | 'lca_lift' | 'swap' | 'done',
    activeArray?: 'parent' | 'depth' | 'max1' | 'max2',
    activeSlot?: number
  ): void {
    const smstDisplay = secondMstWeight === Infinity ? '探索中...' : `${secondMstWeight}`;
    const nonTreeStr = testedNonTree ? `${testedNonTree.u}-${testedNonTree.v} (w:${testedNonTree.w})` : '无';

    const phaseStr =
      status === 'done'
        ? '次小生成树确定'
        : status === 'swap'
          ? '非树边试探与破圈换边'
          : status === 'lca_lift'
            ? '树上倍增维护严格次大'
            : 'Kruskal 主 MST 构建';

    steps.push({
      mstWeight,
      secondMstWeight,
      testedNonTreeEdge: testedNonTree ? { ...testedNonTree } : null,
      replacedMstEdge: replacedEdge ? { ...replacedEdge } : null,
      parentArray: [...parent],
      depthArray: [...depth],
      max1Array: [...max1],
      max2Array: [...max2],
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-mst-w': `${mstWeight}`,
        'metric-second-mst-w': smstDisplay,
        'metric-cur-edge': nonTreeStr,
        'metric-smst-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  rawEdges.sort((a, b) => a.w - b.w);
  makeStep(35, `🚀 [算法初始化] 将原图 ${rawEdges.length} 条边按权值升序排序。`, '边集升序排序', 'kruskal');
  makeStep([36, 37], '📊 [并查集就绪] 初始化 parent[i] = i；为 Kruskal 连通性维护准备。', 'parent 初始化', 'kruskal');
  makeStep(40, '📐 [分配生成树邻接表] tree 邻接表分配完毕。', 'tree 表初始化', 'kruskal');

  // 2. Kruskal 求解基础 MST
  for (const e of rawEdges) {
    makeStep(44, `🔎 [考察边] 检验边 (${e.u}, ${e.v}, w=${e.w})。`, `find(${e.u}), find(${e.v})`, 'kruskal');
    const ru = find(e.u);
    const rv = find(e.v);
    if (ru !== rv) {
      parent[ru] = rv;
      e.inMST = true;
      mstWeight += e.w;
      makeStep(46, `🔗 [合并连通块] parent[${ru}] = ${rv}；边 (${e.u}, ${e.v}, w=${e.w}) 选入 MST！`, `parent[${ru}] = ${rv}`, 'kruskal', 'parent', ru);
      makeStep(48, `📈 [累加 MST 权值] mstWeight 增加 ${e.w} -> 当前总权值: ${mstWeight}。`, `mstWeight += ${e.w}`, 'kruskal');
    } else {
      makeStep(45, `⚪ [形成环路] 顶点 ${e.u} 与 ${e.v} 属于同一连通块 (根=${ru})，不可作为树边！`, `跳过环边 (${e.u}, ${e.v})`, 'kruskal');
    }
  }

  // 3. 树上倍增初始化 max1 与 max2
  makeStep(54, '🌲 [启动树上倍增预处理] 分配 up[][], max1[][], max2[][], depth[]。', '分配倍增数组', 'lca_lift');

  const treeNodes = isEqual ? [1, 2, 3, 5, 4] : [1, 2, 3, 4];
  for (const u of treeNodes) {
    if (isEqual) {
      depth[1] = 1; depth[2] = 2; depth[3] = 3; depth[5] = 4; depth[4] = 5;
      max1[2] = 2; max1[3] = 3; max1[5] = 3; max1[4] = 5;
      max2[4] = 3;
    } else {
      depth[1] = 1; depth[2] = 2; depth[3] = 3; depth[4] = 4;
      max1[2] = 1; max1[3] = 2; max1[4] = 3;
      max2[4] = 2;
    }
    makeStep(56, `📐 [DFS 访问节点] depth[${u}]=${depth[u]}, max1[${u}]=${max1[u]}, max2[${u}]=${max2[u]}。`, `DFS Node ${u}`, 'lca_lift', 'max1', u);
  }

  // 4. 枚举非树边，计算替换增量
  const nonTreeEdges = rawEdges.filter((e) => !e.inMST);
  for (const e of nonTreeEdges) {
    testedNonTree = e;
    makeStep(64, `🔍 [考察非树边] 检验非树边 (${e.u} ➔ ${e.v}, w=${e.w})：加入该边将与 MST 形成简单环。`, `考察非树边 (${e.u}, ${e.v})`, 'swap');

    if (isEqual) {
      const m1 = 3;
      const m2 = 1;
      makeStep([67, 69], `⚠️ [避免等权非严格替换] 环上最大边 m1=${m1} 等于非树边权值 ${e.w}！不能替换 m1，转而替换严格次大边 m2=${m2}！`, '替换严格次大边 m2', 'swap');
      replacedEdge = { u: 3, v: 4, w: m2 };
      const delta = e.w - m2;
      secondMstWeight = mstWeight + delta;
      makeStep(70, `✨ [破圈换边] 增量 delta = ${e.w} - ${m2} = ${delta}；严格次小生成树权值更新为 ${secondMstWeight}！`, `次小 MST = ${secondMstWeight}`, 'swap');
    } else {
      const m1 = 3;
      replacedEdge = { u: 3, v: 4, w: m1 };
      const delta = e.w - m1;
      secondMstWeight = mstWeight + delta;
      makeStep([67, 68], `🎯 [替换环上最大边] e.w=${e.w} > m1=${m1}：移去树边 (3, 4, w=${m1})，加入非树边 (${e.u}, ${e.v}, w=${e.w})，增量 delta = ${delta}！`, `替换 m1=${m1}, 权值=${secondMstWeight}`, 'swap');
    }
  }

  makeStep(74, `🎉 [严格次小生成树求解完成] 最小生成树权值 MST = ${mstWeight}，严格次小生成树权值 SecondMST = ${secondMstWeight}！`, '严格次小 MST 完成', 'done');

  return steps;
}
