/**
 * Class 108: 树状数组核心原理 (Fenwick Tree / BIT)
 * 洛谷 P3374 【模板】树状数组 1
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_108_116_PROBLEMS } from './tree-108-116-problem-content';
import { FENWICK_TREE_CODES, FENWICK_TREE_LINES } from './tree-108-116-stage-codes';
import {
  Tree108Step,
  renderFenwickTreeVisual,
} from './tree-108-116-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface FenwickStep extends Tree108Step {
  nums: number[];
  tree: number[];
  curIdx: number;
  jumpPath: number[];
  opType: 'add' | 'query' | 'idle';
  currentSum?: number;
}

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
  const n = nums.length;
  const tree = new Array(n + 1).fill(0);

  // 初始化建树
  for (let i = 1; i <= n; i++) {
    const v = nums[i - 1];
    for (let j = i; j <= n; j += lowbit(j)) {
      tree[j] += v;
    }
  }

  // Step 0: 入口
  steps.push({
    nums: [...nums],
    tree: [...tree],
    curIdx: -1,
    jumpPath: [],
    opType: 'idle',
    decision: `主类入口：接收规模 n=${n} 的数据序列 A=[${nums.join(', ')}]，树状数组初始化完成`,
    message: `准备演示 ${op === 'add' ? `单点增加 add(index=${targetIdx}, val=${val})` : `前缀和查询 query(index=${targetIdx})`}`,
    log: `init FenwickTree(n=${n})`,
    codeLine: lines.entry,
    metrics: { '数据规模 n': n, '当前操作': op === 'add' ? '单点增加' : '前缀和查询' },
  });

  if (op === 'add') {
    const jumpPath: number[] = [];
    let cur = targetIdx;
    nums[targetIdx - 1] += val;

    while (cur <= n) {
      const lb = lowbit(cur);
      const nextIdx = cur + lb;
      jumpPath.push(cur);
      tree[cur] += val;

      steps.push({
        nums: [...nums],
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
      nums: [...nums],
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
        nums: [...nums],
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
      nums: [...nums],
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

export const fenwickTreeVisualizer = registerDeclarativeAlgorithm<FenwickStep>({
  id: 'fenwick-tree-108',
  name: '树状数组核心原理 (Class 108)',
  category: 'tree',
  icon: '🌳',
  difficulty: 2,
  levelOrder: 108,
  learningGoal: '深刻理解 lowbit(x) = x & (-x) 的二进制位权设计，掌握树状数组单点累加与前缀和剥离跳转机制',
  problemHtml: TREE_108_116_PROBLEMS.fenwickTree.html,
  analysisHtml: TREE_108_116_PROBLEMS.fenwickTree.html,
  inputs: [
    {
      id: 'nums',
      label: '原始数据数组 (逗号分隔)',
      type: 'text',
      defaultValue: '1,3,5,7,9,11',
      placeholder: '请输入正整数序列',
    },
    {
      id: 'op',
      label: '操作类型 (add 或 query)',
      type: 'text',
      defaultValue: 'add',
      placeholder: 'add 或 query',
    },
    {
      id: 'targetIdx',
      label: '目标下标 (1-based)',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 12,
    },
    {
      id: 'val',
      label: '增加数值 (仅 add 时有效)',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 99,
    },
  ],
  codeLanguages: FENWICK_TREE_CODES,
  generateSteps: (input) => {
    const nums = String(input.nums || '1,3,5,7,9,11').split(',').map(Number).filter(n => !isNaN(n));
    const op = String(input.op || 'add').trim().toLowerCase() === 'query' ? 'query' : 'add';
    const targetIdx = Math.max(1, Math.min(nums.length, Number(input.targetIdx) || 1));
    const val = Number(input.val) || 5;
    return buildFenwickTreeSteps(nums, op, targetIdx, val);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderFenwickTreeVisual(step.nums, step.tree, step.curIdx, step.jumpPath, step.opType)}

        ${renderFormulaCard(
          '树状数组状态看板',
          `当前考察点: ${step.curIdx > 0 ? `Tree[${step.curIdx}] (lowbit=${lowbit(step.curIdx)})` : '空闲'} | 路径: [${step.jumpPath.join(' ➔ ') || '无'}] ${step.currentSum !== undefined ? `| 累计和: ${step.currentSum}` : ''}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
