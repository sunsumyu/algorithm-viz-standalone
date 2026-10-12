/**
 * Class 149: Size Balanced Tree (SB 树) 步进推演编译器
 * 核心：size 平衡准则、LL/LR/RR/RL 旋转与 maintain 递归平衡修复
 */

import { Advanced149Step, SBNodeView } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { SB_TREE_LINES } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-stage-codes';

interface InternalSBNode {
  key: number;
  size: number;
  left: InternalSBNode | null;
  right: InternalSBNode | null;
}

function getSize(node: InternalSBNode | null): number {
  return node ? node.size : 0;
}

function toView(node: InternalSBNode | null): SBNodeView | null {
  if (!node) return null;
  return {
    key: node.key,
    size: node.size,
    left: toView(node.left) ?? undefined,
    right: toView(node.right) ?? undefined,
  };
}

export interface SBStep extends Advanced149Step {
  root: SBNodeView | null;
  activeKey: number;
  maintainType: string;
}

export function buildSBSteps(keys: number[]): SBStep[] {
  const steps: SBStep[] = [];
  const lines = SB_TREE_LINES;

  let root: InternalSBNode | null = null;

  // Step 0: 入口
  steps.push({
    root: null,
    activeKey: -1,
    maintainType: 'None',
    decision: `主函数入口：开始将序列 [${keys.join(', ')}] 插入 Size Balanced Tree (SB 树)`,
    message: `SB 树依据子树节点数量 size 维持平衡，仅在插入时 maintain 调整，删除完全不需要旋转，常数极小`,
    log: `enter SBTree insert sequence`,
    codeLine: lines.entry,
    metrics: { '待插入序列': keys.join(', '), '树节点数': 0 },
  });

  function rotateRight(t: InternalSBNode): InternalSBNode {
    const k = t.left!;
    t.left = k.right;
    k.right = t;
    k.size = t.size;
    t.size = getSize(t.left) + getSize(t.right) + 1;
    return k;
  }

  function rotateLeft(t: InternalSBNode): InternalSBNode {
    const k = t.right!;
    t.right = k.left;
    k.left = t;
    k.size = t.size;
    t.size = getSize(t.left) + getSize(t.right) + 1;
    return k;
  }

  function maintain(t: InternalSBNode | null): InternalSBNode | null {
    if (!t) return null;

    // LL 型
    if (getSize(t.left?.left ?? null) > getSize(t.right)) {
      steps.push({
        root: toView(root),
        activeKey: t.key,
        maintainType: 'LL (左左偏重 -> 右旋)',
        decision: `⚠️ 节点 ${t.key} 违反平衡准则：size(t.left.left)=${getSize(t.left?.left ?? null)} > size(t.right)=${getSize(t.right)} -> 触发 LL 右单旋`,
        message: `执行 rotateRight(t)，随后递归修复右子树与整树`,
        log: `maintainLL: at key=${t.key}`,
        codeLine: lines.repairLL,
        statusBadge: { text: 'LL 右旋', type: 'warning' },
        metrics: { '失衡节点': t.key, '调整类型': 'LL' },
      });
      t = rotateRight(t);
      t.right = maintain(t.right);
      t = maintain(t)!;
    }
    // LR 型
    else if (getSize(t.left?.right ?? null) > getSize(t.right)) {
      steps.push({
        root: toView(root),
        activeKey: t.key,
        maintainType: 'LR (左右偏重 -> 双旋)',
        decision: `⚠️ 节点 ${t.key} 违反平衡准则：size(t.left.right)=${getSize(t.left?.right ?? null)} > size(t.right)=${getSize(t.right)} -> 触发 LR 双旋`,
        message: `左子树先左旋，根节点再右旋`,
        log: `maintainLR: at key=${t.key}`,
        codeLine: lines.repairLL,
        statusBadge: { text: 'LR 双旋', type: 'warning' },
        metrics: { '失衡节点': t.key, '调整类型': 'LR' },
      });
      t.left = rotateLeft(t.left!);
      t = rotateRight(t);
      t.left = maintain(t.left);
      t.right = maintain(t.right);
      t = maintain(t)!;
    }
    // RR 型
    else if (getSize(t.right?.right ?? null) > getSize(t.left)) {
      steps.push({
        root: toView(root),
        activeKey: t.key,
        maintainType: 'RR (右右偏重 -> 左旋)',
        decision: `⚠️ 节点 ${t.key} 违反平衡准则：size(t.right.right)=${getSize(t.right?.right ?? null)} > size(t.left)=${getSize(t.left)} -> 触发 RR 左单旋`,
        message: `执行 rotateLeft(t)，随后递归修复左子树与整树`,
        log: `maintainRR: at key=${t.key}`,
        codeLine: lines.repairRR,
        statusBadge: { text: 'RR 左旋', type: 'warning' },
        metrics: { '失衡节点': t.key, '调整类型': 'RR' },
      });
      t = rotateLeft(t);
      t.left = maintain(t.left);
      t = maintain(t)!;
    }
    // RL 型
    else if (getSize(t.right?.left ?? null) > getSize(t.left)) {
      steps.push({
        root: toView(root),
        activeKey: t.key,
        maintainType: 'RL (右左偏重 -> 双旋)',
        decision: `⚠️ 节点 ${t.key} 违反平衡准则：size(t.right.left)=${getSize(t.right?.left ?? null)} > size(t.left)=${getSize(t.left)} -> 触发 RL 双旋`,
        message: `右子树先右旋，根节点再左旋`,
        log: `maintainRL: at key=${t.key}`,
        codeLine: lines.repairRR,
        statusBadge: { text: 'RL 双旋', type: 'warning' },
        metrics: { '失衡节点': t.key, '调整类型': 'RL' },
      });
      t.right = rotateRight(t.right!);
      t = rotateLeft(t);
      t.left = maintain(t.left);
      t.right = maintain(t.right);
      t = maintain(t)!;
    }

    return t;
  }

  function insert(t: InternalSBNode | null, key: number): InternalSBNode {
    if (!t) {
      return { key, size: 1, left: null, right: null };
    }
    t.size++;
    if (key < t.key) {
      t.left = insert(t.left, key);
    } else {
      t.right = insert(t.right, key);
    }
    return maintain(t)!;
  }

  for (let idx = 0; idx < keys.length; idx++) {
    const k = keys[idx];
    steps.push({
      root: toView(root),
      activeKey: k,
      maintainType: 'None',
      decision: `开始将键值 ${k} 插入 SB 树 (当前为第 ${idx + 1}/${keys.length} 个元素)`,
      message: `沿路径向下插入，沿途子树 size 递增 1`,
      log: `bstInsert: key=${k}`,
      codeLine: lines.bstInsert,
      metrics: { '插入键值': k, '当前全树节点数': idx },
    });

    root = insert(root, k);

    steps.push({
      root: toView(root),
      activeKey: k,
      maintainType: 'None',
      decision: `键值 ${k} 插入完成，子树 Size Balanced 维持完毕`,
      message: `所有子树满足 size(t.left) >= max(size(t.right.left), size(t.right.right))`,
      log: `maintainDone: key=${k}, root=${root ? root.key : 'null'}, size=${getSize(root)}`,
      codeLine: lines.maintain,
      metrics: { '当前根': root ? root.key : '-', '全树大小 size': getSize(root) },
    });
  }

  // 终态
  steps.push({
    root: toView(root),
    activeKey: -1,
    maintainType: 'None',
    decision: `🎉 序列插入全部完成：SB 树维持极佳平衡，均摊时间复杂度为稳定的 O(log N)`,
    message: `删除操作无需任何旋转调整（仅减小沿途 size 即可），为高级名次树实现首选`,
    log: `returnAns: complete, finalSize=${getSize(root)}`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'SB 树平衡完毕', type: 'success' },
    metrics: { '最终节点数': keys.length, '总大小 size': getSize(root) },
  });

  return steps;
}
