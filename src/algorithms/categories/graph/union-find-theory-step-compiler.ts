/**
 * 并查集理论基础 (Union-Find Theory) — 步进推演编译器
 * 职责：按步骤执行初始化、find(x)、路径压缩、按秩合并 union(x, y) 并输出结构化步骤
 */

import type { HighlightTarget } from '../../../core/code-panel';

export interface UFStep {
  parent: number[];
  rank: number[];
  activeNodes: number[];
  mergedSets: number[][];
  action: 'init' | 'find' | 'union' | 'compress' | 'done';
  opLabel: string;
  setsCount: number;
  mergesCount: number;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics: Record<string, string | number>;
}

export const UF_NODE_POSITIONS = [
  { x: 100, y: 70 },
  { x: 230, y: 70 },
  { x: 360, y: 70 },
  { x: 490, y: 70 },
  { x: 165, y: 190 },
  { x: 325, y: 190 },
  { x: 485, y: 190 },
];

export function buildUnionFindTheorySteps(): UFStep[] {
  const steps: UFStep[] = [];
  const n = 7;
  const parent = Array.from({ length: n }, (_, i) => i);
  const rank = new Array(n).fill(0);
  let merges = 0;

  const lines = {
    init: { java: 6, cpp: 6, python: 4, javascript: 3 },
    find: { java: 10, cpp: 11, python: 9, javascript: 9 },
    compress: { java: 12, cpp: 13, python: 11, javascript: 11 },
    union: { java: 17, cpp: 17, python: 15, javascript: 16 },
    merge: { java: 21, cpp: 20, python: 20, javascript: 20 },
    done: { java: 29, cpp: 25, python: 27, javascript: 27 },
  };

  const countSets = (p: number[]): number => {
    const roots = new Set<number>();
    for (let i = 0; i < p.length; i++) {
      let r = i;
      while (p[r] !== r) r = p[r];
      roots.add(r);
    }
    return roots.size;
  };

  const getMergedSets = (p: number[]): number[][] => {
    const map = new Map<number, number[]>();
    for (let i = 0; i < p.length; i++) {
      let r = i;
      while (p[r] !== r) r = p[r];
      if (!map.has(r)) map.set(r, []);
      map.get(r)!.push(i);
    }
    return Array.from(map.values());
  };

  const findRoot = (x: number, p: number[]): number => {
    while (p[x] !== x) x = p[x];
    return x;
  };

  const snap = (
    action: UFStep['action'],
    opLabel: string,
    active: number[],
    msg: string,
    log: string,
    code: HighlightTarget
  ) => {
    const sets = countSets(parent);
    steps.push({
      parent: [...parent],
      rank: [...rank],
      activeNodes: [...active],
      mergedSets: getMergedSets(parent),
      action,
      opLabel,
      setsCount: sets,
      mergesCount: merges,
      message: msg,
      log,
      codeLine: code,
      metrics: {
        'metric-uf-op': opLabel,
        'metric-uf-sets': `${sets} 个独立集合`,
        'metric-uf-merges': `${merges} 次合并`,
      },
    });
  };

  // 1. 初始化
  snap(
    'init',
    '初始化集合',
    [],
    `初始化 ${n} 个独立节点，每个节点自成一个集合。parent[i] = i，rank[i] = 0。`,
    '初始化：7 个独立单元素集合',
    lines.init
  );

  // 2. Union(0, 1)
  {
    const r0 = findRoot(0, parent);
    const r1 = findRoot(1, parent);
    snap('find', 'find(0) & find(1)', [0, 1], `find(0) = ${r0}，find(1) = ${r1}。两节点分属不同集合，准备合并。`, 'find(0)=0, find(1)=1', lines.find);
    parent[r0] = r1;
    rank[r1] = Math.max(rank[r1], rank[r0] + 1);
    merges++;
    snap('union', 'union(0, 1)', [0, 1], `将集合 0 合并入集合 1。设置 parent[0] = 1，更新 rank[1] = ${rank[r1]}。`, 'union(0,1): parent[0]=1', lines.merge);
  }

  // 3. Union(2, 3)
  {
    const r2 = findRoot(2, parent);
    const r3 = findRoot(3, parent);
    snap('find', 'find(2) & find(3)', [2, 3], `find(2) = ${r2}，find(3) = ${r3}。两节点根不同，准备合并。`, 'find(2)=2, find(3)=3', lines.find);
    parent[r2] = r3;
    rank[r3] = Math.max(rank[r3], rank[r2] + 1);
    merges++;
    snap('union', 'union(2, 3)', [2, 3], `将集合 2 合并入集合 3。设置 parent[2] = 3，更新 rank[3] = ${rank[r3]}。`, 'union(2,3): parent[2]=3', lines.merge);
  }

  // 4. Union(1, 3)
  {
    const r1 = findRoot(1, parent);
    const r3 = findRoot(3, parent);
    snap('find', 'find(1) & find(3)', [1, 3], `find(1) = ${r1}，find(3) = ${r3}。rank[1] = ${rank[r1]}, rank[3] = ${rank[r3]}。`, 'find(1)=1, find(3)=3', lines.find);
    parent[r1] = r3;
    rank[r3] = Math.max(rank[r3], rank[r1] + 1);
    merges++;
    snap('union', 'union(1, 3)', [1, 3], `合并集合 1 到集合 3。设置 parent[1] = 3，节点 {0, 1, 2, 3} 汇聚为同一连通分支！`, 'union(1,3): parent[1]=3', lines.merge);
  }

  // 5. 路径压缩: find(0)
  {
    snap('find', 'find(0) 递归寻根', [0, 1, 3], 'find(0)：沿途追溯 0 -> 1 -> 3，确认根代表元为 3。准备路径压缩。', 'find(0): 追溯路径 0→1→3, 根为 3', lines.find);
    parent[0] = 3;
    snap('compress', '路径压缩 parent[0] = 3', [0, 3], '路径压缩生效：将节点 0 直接挂载到根节点 3 上，树高降低为 1！', '路径压缩: parent[0]=3', lines.compress);
  }

  // 6. Union(4, 5)
  {
    const r4 = findRoot(4, parent);
    const r5 = findRoot(5, parent);
    snap('find', 'find(4) & find(5)', [4, 5], `find(4) = ${r4}，find(5) = ${r5}。两节点独立，执行合并。`, 'find(4)=4, find(5)=5', lines.find);
    parent[r4] = r5;
    rank[r5] = Math.max(rank[r5], rank[r4] + 1);
    merges++;
    snap('union', 'union(4, 5)', [4, 5], `合并集合 4 入集合 5。parent[4] = 5，rank[5] = ${rank[r5]}。`, 'union(4,5): parent[4]=5', lines.merge);
  }

  // 7. Union(3, 5)
  {
    const r3 = findRoot(3, parent);
    const r5 = findRoot(5, parent);
    snap('find', 'find(3) & find(5)', [3, 5], `find(3) = ${r3} (rank=${rank[r3]}), find(5) = ${r5} (rank=${rank[r5]})。执行按秩合并。`, 'find(3)=3, find(5)=5', lines.find);
    parent[r5] = r3;
    merges++;
    snap('union', 'union(3, 5)', [3, 5], `按秩合并：小树 5 挂载到大树 3 下。parent[5] = 3。节点 0-5 联通完成。`, 'union(3,5): parent[5]=3', lines.merge);
  }

  // 8. 路径压缩: find(4)
  {
    snap('find', 'find(4) 递归寻根', [4, 5, 3], 'find(4)：沿途追溯 4 -> 5 -> 3，根节点为 3。触发路径压缩。', 'find(4): 追溯路径 4→5→3', lines.find);
    parent[4] = 3;
    snap('compress', '路径压缩 parent[4] = 3', [4, 3], '路径压缩生效：将节点 4 直接挂载至根节点 3。', '路径压缩: parent[4]=3', lines.compress);
  }

  // 9. Union(6, 0)
  {
    const r6 = findRoot(6, parent);
    const r0 = findRoot(0, parent);
    snap('find', 'find(6) & find(0)', [6, 0], `find(6) = ${r6}，find(0) = ${r0} (根为 3)。`, 'find(6)=6, find(0)=3', lines.find);
    parent[r6] = r0;
    merges++;
    snap('union', 'union(6, 0)', [6, 0], `将孤立节点 6 接入主集合 3。设置 parent[6] = 3。全图 7 个节点完全连通！`, 'union(6,0): parent[6]=3', lines.merge);
  }

  // 10. 终态
  snap(
    'done',
    '并查集演进完成',
    [],
    `并查集推演完成！共执行 ${merges} 次合并。路径压缩与按秩合并保证后续所有 find 操作平均耗时 O(α(n))。`,
    '并查集推演完成：全集合联通且扁平化',
    lines.done
  );

  return steps;
}
