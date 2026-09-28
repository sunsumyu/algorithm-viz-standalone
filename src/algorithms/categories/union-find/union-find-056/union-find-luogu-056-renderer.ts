/**
 * Class 056: Code01 & Code02 并查集核心模版与路径压缩 (Union-Find Template)
 * 洛谷 P3367 / 牛客
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言 1-based 源码行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { UNION_FIND_056_PROBLEMS } from './union-find-056-problem-content';
import { CODE01_UNION_FIND_CODES, CODE01_UNION_FIND_LINES } from './union-find-056-stage-codes';
import { Step056, renderUnionFindTemplateBoard } from './union-find-056-shared';

export interface UnionFindOp {
  type: 1 | 2; // 1: union, 2: isSameSet
  x: number;
  y: number;
}

export function buildUnionFindTemplateSteps(rawN?: number, rawOps?: UnionFindOp[]): Step056[] {
  const steps: Step056[] = [];
  const lines = CODE01_UNION_FIND_LINES;

  const n = rawN !== undefined && rawN >= 2 ? Math.min(rawN, 12) : 6;
  const ops: UnionFindOp[] = rawOps && rawOps.length > 0 ? rawOps : [
    { type: 1, x: 1, y: 2 },
    { type: 1, x: 2, y: 3 },
    { type: 2, x: 1, y: 3 },
    { type: 1, x: 4, y: 5 },
    { type: 2, x: 1, y: 4 },
    { type: 1, x: 3, y: 5 },
    { type: 2, x: 2, y: 4 },
  ];

  // 初始化 father 数组 (下标 1 到 n)
  const father: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  let setsCount = n;

  // 0. 初始化
  steps.push({
    title: '并查集初始化 (Build)',
    description: `初始化规模为 N=${n} 的并查集森林，每个节点的父指针 father[i] 均指向自己，各成一个孤立连通集合。`,
    decision: '每一个元素自成一棵单节点树，集合代表元即为其自身 (father[i] = i)。',
    message: '全图初始独立集合数量 Sets = N。',
    log: `build: n=${n}, father initialized`,
    codeLine: lines.build,
    n,
    father: [...father],
    findPath: [],
    opType: 'init',
    setsCount,
    metrics: { '元素总量 N': n, '独立集合数': setsCount, '待执行操作数': ops.length },
  });

  // 内部带路径压缩的 find 过程
  function findWithTrace(node: number): { root: number; path: number[] } {
    const path: number[] = [];
    let cur = node;
    while (cur !== father[cur]) {
      path.push(cur);
      cur = father[cur];
    }
    path.push(cur); // 根代表元

    // 路径压缩：沿途所有节点直接挂在根下方
    const root = cur;
    for (const p of path) {
      father[p] = root;
    }
    return { root, path };
  }

  // 执行各项操作
  for (let idx = 0; idx < ops.length; idx++) {
    const { type, x, y } = ops[idx];

    if (type === 1) {
      // union(x, y)
      // 1. 查找 x 的根
      const findX = findWithTrace(x);
      steps.push({
        title: `操作 #${idx + 1}: union(${x}, ${y}) - 追溯代表元`,
        description: `执行查找 find(${x})：经历寻根路径 [${findX.path.join(' ➔ ')}]，最终根代表元为 ${findX.root}。`,
        decision: `沿途所有经过的节点已通过路径压缩直接挂载至根代表元 ${findX.root}！`,
        message: '路径压缩使得后续查询几乎降至 O(1) 常数时间。',
        log: `find(${x}) -> root ${findX.root}, path: ${findX.path.join('->')}`,
        codeLine: lines.find,
        n,
        father: [...father],
        findPath: [...findX.path],
        opType: 'find',
        opArgs: { x, y, rootX: findX.root },
        setsCount,
        metrics: { '当前操作': `union(${x}, ${y})`, '节点 x 代表元': findX.root, '独立集合数': setsCount },
      });

      // 2. 查找 y 的根
      const findY = findWithTrace(y);
      steps.push({
        title: `操作 #${idx + 1}: union(${x}, ${y}) - 追溯目标代表元`,
        description: `执行查找 find(${y})：经历寻根路径 [${findY.path.join(' ➔ ')}]，最终根代表元为 ${findY.root}。`,
        decision: `若 rootX(${findX.root}) 与 rootY(${findY.root}) 不同，则将 rootX 的父指针指向 rootY 完成树的合并。`,
        message: '合并本质上是将两棵不相交多叉树接驳为一棵更大的树。',
        log: `find(${y}) -> root ${findY.root}, path: ${findY.path.join('->')}`,
        codeLine: lines.compress,
        n,
        father: [...father],
        findPath: [...findY.path],
        opType: 'find',
        opArgs: { x, y, rootX: findX.root, rootY: findY.root },
        setsCount,
        metrics: { '当前操作': `union(${x}, ${y})`, '节点 y 代表元': findY.root, '独立集合数': setsCount },
      });

      // 3. 执行合并
      const rootX = findX.root;
      const rootY = findY.root;
      const alreadySame = rootX === rootY;

      if (!alreadySame) {
        father[rootX] = rootY;
        setsCount--;
      }

      steps.push({
        title: `操作 #${idx + 1}: union(${x}, ${y}) - ${alreadySame ? '已连通无需合并' : '完成集合合并'}`,
        description: alreadySame
          ? `节点 ${x} 与 ${y} 的根代表元均为 ${rootX}，本就属于同一连通集合，无需改变树结构。`
          : `将根代表元 ${rootX} 的父指针重定向指向 ${rootY} (father[${rootX}] = ${rootY})，两集合合二为一！`,
        decision: alreadySame ? '保持原森林结构不变。' : `集合总数 Sets 从 ${setsCount + 1} 减少至 ${setsCount}。`,
        message: '集合合并成功，后续两树内所有节点连通。',
        log: `union(${x}, ${y}): ${alreadySame ? 'already same' : `father[${rootX}] = ${rootY}`}`,
        codeLine: lines.union,
        n,
        father: [...father],
        findPath: [],
        opType: 'union',
        opArgs: { x, y, rootX, rootY },
        setsCount,
        metrics: { '操作类型': 'union', '是否同集合': alreadySame ? '是' : '否', '当前集合数': setsCount },
      });

    } else {
      // isSameSet(x, y)
      const findX = findWithTrace(x);
      const findY = findWithTrace(y);
      const isSame = findX.root === findY.root;

      steps.push({
        title: `操作 #${idx + 1}: isSameSet(${x}, ${y}) - 查询连通性`,
        description: `查询节点 ${x} 与节点 ${y} 是否同属一个集合：find(${x}) ➔ ${findX.root}，find(${y}) ➔ ${findY.root}。`,
        decision: isSame
          ? `根代表元相同 (${findX.root} == ${findY.root}) ➔ 【属于同一集合 (True)】！`
          : `根代表元不同 (${findX.root} != ${findY.root}) ➔ 【不属于同一集合 (False)】！`,
        message: 'isSameSet 的本质就是比较两节点的根代表元是否一致。',
        log: `isSameSet(${x}, ${y}) -> ${isSame} (rootX=${findX.root}, rootY=${findY.root})`,
        codeLine: lines.isSame,
        n,
        father: [...father],
        findPath: [findX.root, findY.root],
        opType: 'same',
        opArgs: { x, y, rootX: findX.root, rootY: findY.root, isSame },
        setsCount,
        metrics: { '查询指令': `isSameSet(${x}, ${y})`, '判定结果': isSame ? 'True (同集合)' : 'False (异集合)', '集合数': setsCount },
      });
    }
  }

  // 完成
  steps.push({
    title: '并查集全部指令执行完毕',
    description: `共执行 ${ops.length} 项合并与查询操作，当前森林包含 ${setsCount} 个独立连通集合。`,
    decision: '并查集在路径压缩的加持下，近乎以常数时间复杂度 O(α(N)) 完成了所有动态连通性处理。',
    message: '核心模版验证完毕。',
    log: 'all operations finished successfully',
    codeLine: lines.union,
    n,
    father: [...father],
    findPath: [],
    opType: 'done',
    setsCount,
    metrics: { '最终独立集合数': setsCount, '总操作数': ops.length },
  });

  return steps;
}

export const unionFindLuogu056Renderer = registerDeclarativeAlgorithm<Step056>({
  id: 'union-find-luogu-056',
  aliases: ['union-find-template-056', 'luogu-p3367-056', 'class056-code01'],
  name: '并查集核心模版与路径压缩 (Class 056)',
  category: 'union-find',
  difficulty: 'medium',
  badge: { mode: '并查集模版', complexity: 'O(α(N))' },
  description: '左程云算法通关课【必备篇】Class 056：并查集核心模版、路径压缩与小挂大树形连通性维护 (洛谷 P3367 / 牛客)',
  learningGoal: '彻底掌握树形代表元并查集设计哲学，深刻领悟路径压缩如何将树高度瞬时压平至 1，实现近乎 O(1) 的查询性能。',
  icon: '🌲',

  inputs: [
    {
      id: 'n',
      label: '节点数量 N',
      type: 'number',
      defaultValue: 6,
      min: 2,
      max: 12,
    },
    {
      id: 'ops',
      label: '指令序列 (格式: 1 x y 合并, 2 x y 查询; 换行或分号分隔)',
      type: 'text',
      defaultValue: '1 1 2; 1 2 3; 2 1 3; 1 4 5; 2 1 4; 1 3 5; 2 2 4',
      placeholder: '例如: 1 1 2; 1 2 3; 2 1 3',
    },
  ],

  presets: [
    {
      label: '经典案例: 6节点逐步合并与连通查询',
      values: { n: 6, ops: '1 1 2; 1 2 3; 2 1 3; 1 4 5; 2 1 4; 1 3 5; 2 2 4' },
    },
    {
      label: '两独立大群合并: 1-2-3 与 4-5-6',
      values: { n: 6, ops: '1 1 2; 1 2 3; 1 4 5; 1 5 6; 2 1 6; 1 3 4; 2 1 6' },
    },
    {
      label: '星型辐射连通: 全部连向节点 1',
      values: { n: 5, ops: '1 2 1; 1 3 1; 1 4 1; 1 5 1; 2 2 5; 2 3 4' },
    },
  ],

  problemContent: UNION_FIND_056_PROBLEMS.unionFindTemplate056,
  codeLanguages: CODE01_UNION_FIND_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let n = 6;
    let ops: UnionFindOp[] = [
      { type: 1, x: 1, y: 2 },
      { type: 1, x: 2, y: 3 },
      { type: 2, x: 1, y: 3 },
      { type: 1, x: 4, y: 5 },
      { type: 2, x: 1, y: 4 },
      { type: 1, x: 3, y: 5 },
      { type: 2, x: 2, y: 4 },
    ];

    if (params && params.n !== undefined) {
      const parsedN = parseInt(params.n, 10);
      if (!isNaN(parsedN) && parsedN >= 2) n = Math.min(parsedN, 12);
    }

    if (params && params.ops) {
      const raw = String(params.ops);
      const items = raw.split(/[;\n\r]+/).map(s => s.trim()).filter(Boolean);
      const parsedOps: UnionFindOp[] = [];
      for (const item of items) {
        const parts = item.split(/[\s,，]+/).map(p => parseInt(p, 10)).filter(num => !isNaN(num));
        if (parts.length >= 3) {
          const t = parts[0] === 1 ? 1 : 2;
          const x = Math.max(1, Math.min(n, parts[1]));
          const y = Math.max(1, Math.min(n, parts[2]));
          parsedOps.push({ type: t, x, y });
        }
      }
      if (parsedOps.length > 0) ops = parsedOps;
    }

    return buildUnionFindTemplateSteps(n, ops);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderUnionFindTemplateBoard(step);
  },
});
