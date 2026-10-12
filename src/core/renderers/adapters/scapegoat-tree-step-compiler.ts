/**
 * Class 153: 替罪羊树 (Scapegoat Tree) 步进推演编译器
 * 核心：alpha 平衡阈值监控、替罪羊失衡定位、中序遍历拍扁与二分递归重建
 */

import { Advanced149Step, ScapegoatNodeView } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-shared';
import { SCAPEGOAT_LINES } from '../../../algorithms/categories/advanced-topics/advanced-149-154/advanced-149-154-stage-codes';

interface InternalSGNode {
  val: number;
  size: number;
  left: InternalSGNode | null;
  right: InternalSGNode | null;
}

function getSize(node: InternalSGNode | null): number {
  return node ? node.size : 0;
}

function updateSize(node: InternalSGNode) {
  node.size = getSize(node.left) + getSize(node.right) + 1;
}

function toView(node: InternalSGNode | null): ScapegoatNodeView | null {
  if (!node) return null;
  return {
    val: node.val,
    size: node.size,
    left: toView(node.left) ?? undefined,
    right: toView(node.right) ?? undefined,
  };
}

export interface ScapegoatStep extends Advanced149Step {
  root: ScapegoatNodeView | null;
  flattenBuffer: number[];
  isRebuilding: boolean;
  alpha: number;
}

export function buildScapegoatSteps(keys: number[], alpha: number = 0.7): ScapegoatStep[] {
  const steps: ScapegoatStep[] = [];
  const lines = SCAPEGOAT_LINES;

  let root: InternalSGNode | null = null;
  let flattenBuffer: number[] = [];

  // Step 0: 入口
  steps.push({
    root: null,
    flattenBuffer: [],
    isRebuilding: false,
    alpha,
    decision: `主函数入口：替罪羊树开始插入序列 [${keys.join(', ')}]，平衡因子阈值 alpha = ${alpha}`,
    message: `替罪羊树从不进行单旋或双旋调整，一旦子树偏斜度 max(sz_L, sz_R) > alpha * sz 就暴力拍扁中序重建`,
    log: `enter ScapegoatTree(alpha=${alpha})`,
    codeLine: lines.entry,
    metrics: { '平衡阈值 alpha': alpha, '待插入节点数': keys.length },
  });

  function flatten(node: InternalSGNode | null, buf: number[]) {
    if (!node) return;
    flatten(node.left, buf);
    buf.push(node.val);
    flatten(node.right, buf);
  }

  function rebuild(l: number, r: number, buf: number[]): InternalSGNode | null {
    if (l > r) return null;
    const mid = (l + r) >> 1;
    const node: InternalSGNode = {
      val: buf[mid],
      size: 1,
      left: rebuild(l, mid - 1, buf),
      right: rebuild(mid + 1, r, buf),
    };
    updateSize(node);
    return node;
  }

  function checkRebuild(node: InternalSGNode | null): InternalSGNode | null {
    if (!node) return null;
    const maxSub = Math.max(getSize(node.left), getSize(node.right));
    if (maxSub > alpha * node.size) {
      // 触发替罪羊重构
      flattenBuffer = [];
      flatten(node, flattenBuffer);

      steps.push({
        root: toView(root),
        flattenBuffer: [...flattenBuffer],
        isRebuilding: true,
        alpha,
        decision: `⚠️ 发现替罪羊节点 Val=${node.val}：最大子树大小 ${maxSub} > ${alpha} * ${node.size} (${(alpha * node.size).toFixed(1)})，严重失衡！`,
        message: `将该失衡子树全部中序遍历拍扁进入缓冲数组: [${flattenBuffer.join(', ')}]`,
        log: `flattenScapegoat: node=${node.val}, buffer=[${flattenBuffer.join(', ')}]`,
        codeLine: lines.flatten,
        statusBadge: { text: '拍扁失衡子树', type: 'warning' },
        metrics: { '失衡替罪羊': node.val, '拍扁长度': flattenBuffer.length },
      });

      const rebuilt = rebuild(0, flattenBuffer.length - 1, flattenBuffer);

      steps.push({
        root: toView(rebuilt),
        flattenBuffer: [...flattenBuffer],
        isRebuilding: false,
        alpha,
        decision: `🔨 暴力绝对平衡重构完毕：选取中位数 ${rebuilt ? rebuilt.val : '-'} 作为新子树根节点`,
        message: `左右子树规模差不超过 1，暴力重构带来极高的局部规整度与缓存亲和度`,
        log: `rebuildComplete: newRoot=${rebuilt ? rebuilt.val : 'null'}`,
        codeLine: lines.rebuild,
        statusBadge: { text: '重建绝对平衡', type: 'success' },
        metrics: { '新根': rebuilt ? rebuilt.val : '-', '重构后大小': rebuilt ? rebuilt.size : 0 },
      });

      return rebuilt;
    }
    return node;
  }

  function insert(node: InternalSGNode | null, val: number): InternalSGNode {
    if (!node) {
      return { val, size: 1, left: null, right: null };
    }
    node.size++;
    if (val < node.val) {
      node.left = insert(node.left, val);
    } else {
      node.right = insert(node.right, val);
    }
    return checkRebuild(node)!;
  }

  for (const k of keys) {
    steps.push({
      root: toView(root),
      flattenBuffer: [],
      isRebuilding: false,
      alpha,
      decision: `将新节点 Val=${k} 插入替罪羊树，检测沿途是否存在失衡替罪羊`,
      message: `沿途增加子树 size，回溯检测 max(size(left), size(right)) > alpha * size(cur)`,
      log: `insertKey: ${k}`,
      codeLine: lines.checkAlpha,
      metrics: { '插入值': k, '全树大小': getSize(root) },
    });

    root = insert(root, k);
  }

  // 终态
  steps.push({
    root: toView(root),
    flattenBuffer: [],
    isRebuilding: false,
    alpha,
    decision: `🎉 序列插入全部完成：替罪羊树整体结构保持在 alpha=${alpha} 规整度内`,
    message: `替罪羊树不需维护复杂旋转，均摊时间复杂度为优雅的 O(log N)，工程实现简单`,
    log: `returnAns: complete`,
    codeLine: lines.returnAns,
    statusBadge: { text: '替罪羊树就绪', type: 'success' },
    metrics: { '最终节点数': keys.length, '总大小 size': getSize(root) },
  });

  return steps;
}
