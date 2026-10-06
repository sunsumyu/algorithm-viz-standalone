/**
 * Class 108: 树状数组核心原理 (Fenwick Tree / BIT) 步骤编译器
 * 洛谷 P3374 【模板】树状数组 1
 * 深模块核心编译器 (Deep Module)
 */

import { FENWICK_TREE_CODES, FENWICK_TREE_LINES } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-stage-codes';
import { Tree108Step } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-shared';

export interface FenwickStep extends Tree108Step {
  nums: number[];
  tree: number[];
  curIdx: number;
  jumpPath: number[];
  opType: 'add' | 'query' | 'idle';
  currentSum?: number;
}

export { FENWICK_TREE_CODES, FENWICK_TREE_LINES };

export function lowbit(x: number): number {
  return x & (-x);
}

export function buildFenwickTreeSteps(
  nums: number[],
  op: 'add' | 'query',
  targetIdx: number,
  val: number = 0
): FenwickStep[] {
  const steps: FenwickStep[] = [];
  const lines = FENWICK_TREE_LINES;
  const currentNums = [...nums];
  const n = currentNums.length;
  const tree = new Array(n + 1).fill(0);

  // 初始化建树
  for (let i = 1; i <= n; i++) {
    const v = currentNums[i - 1];
    for (let j = i; j <= n; j += lowbit(j)) {
      tree[j] += v;
    }
  }

  // Step 0: 入口
  steps.push({
    nums: [...currentNums],
    tree: [...tree],
    curIdx: -1,
    jumpPath: [],
    opType: 'idle',
    decision: `主类入口：接收规模 n=${n} 的数据序列 A=[${currentNums.join(', ')}]，树状数组初始化完成`,
    message: `准备演示 ${op === 'add' ? `单点增加 add(index=${targetIdx}, val=${val})` : `前缀和查询 query(index=${targetIdx})`}`,
    log: `init FenwickTree(n=${n})`,
    codeLine: lines.entry,
    metrics: { '数据规模 n': n, '当前操作': op === 'add' ? '单点增加' : '前缀和查询' },
  });

  if (op === 'add') {
    const jumpPath: number[] = [];
    let cur = targetIdx;
    currentNums[targetIdx - 1] += val;

    while (cur <= n) {
      const lb = lowbit(cur);
      const nextIdx = cur + lb;
      jumpPath.push(cur);
      tree[cur] += val;

      steps.push({
        nums: [...currentNums],
        tree: [...tree],
        curIdx: cur,
        jumpPath: [...jumpPath],
        opType: 'add',
        decision: `⚡ 节点更新：Tree[${cur}] += ${val} ➔ 新值 ${tree[cur]}！lowbit(${cur}) = ${cur} & (-${cur}) = ${lb}`,
        message: `沿着二进制二叉父链向右上方传播：下一步 index = ${cur} + ${lb} = ${nextIdx}`,
        log: `add: tree[${cur}] += ${val}, next=${nextIdx}`,
        codeLine: lines.addExec,
        metrics: { '当前更新节点': `Tree[${cur}]`, 'lowbit 增量': lb, '更新后值': tree[cur] },
        statusBadge: { text: `Tree[${cur}] += ${val}`, type: 'success' },
      });

      cur = nextIdx;
    }

    steps.push({
      nums: [...currentNums],
      tree: [...tree],
      curIdx: -1,
      jumpPath: [...jumpPath],
      opType: 'idle',
      decision: `🏆 单点增加完成：已全部更新 ${jumpPath.length} 个覆盖区间祖先节点 [${jumpPath.map(k => `Tree[${k}]`).join(' ➔ ')}]，耗时仅 O(log N)`,
      message: '树状数组状态维护完成，保持前缀和一致性',
      log: 'add operation completed',
      codeLine: lines.addHead,
      metrics: { '传播层数': jumpPath.length, '更新状态': '成功' },
      statusBadge: { text: '更新完成', type: 'success' },
    });
  } else {
    // query
    let sum = 0;
    const jumpPath: number[] = [];
    let cur = targetIdx;

    while (cur > 0) {
      const lb = lowbit(cur);
      const nextIdx = cur - lb;
      jumpPath.push(cur);
      sum += tree[cur];

      steps.push({
        nums: [...currentNums],
        tree: [...tree],
        curIdx: cur,
        jumpPath: [...jumpPath],
        opType: 'query',
        currentSum: sum,
        decision: `⚡ 前缀累加：累加区间节点 Tree[${cur}] (${tree[cur]}) ➔ 当前累计前缀和 sum = ${sum}`,
        message: `剥离最低位 1：lowbit(${cur}) = ${lb}，下一步回跳 index = ${cur} - ${lb} = ${nextIdx}`,
        log: `query: sum += tree[${cur}] (${tree[cur]}) = ${sum}, next=${nextIdx}`,
        codeLine: lines.queryExec,
        metrics: { '累计节点': `Tree[${cur}]`, '当前前缀和': sum, '下一个节点': nextIdx > 0 ? `Tree[${nextIdx}]` : '到达起点 0' },
        statusBadge: { text: `sum = ${sum}`, type: 'info' },
      });

      cur = nextIdx;
    }

    steps.push({
      nums: [...currentNums],
      tree: [...tree],
      curIdx: -1,
      jumpPath: [...jumpPath],
      opType: 'idle',
      currentSum: sum,
      decision: `🏆 前缀和查询完成：前缀和 A[1..${targetIdx}] 之和为 ${sum}！共访问 ${jumpPath.length} 个节点 [${jumpPath.map(k => `Tree[${k}]`).join(' + ')}]`,
      message: `单次查询时间复杂度严格为 O(log N)`,
      log: `return sum=${sum}`,
      codeLine: lines.returnAns,
      metrics: { '查询目标': `A[1..${targetIdx}]`, '最终前缀和': sum },
      statusBadge: { text: `前缀和 = ${sum}`, type: 'success' },
    });
  }

  return steps;
}
