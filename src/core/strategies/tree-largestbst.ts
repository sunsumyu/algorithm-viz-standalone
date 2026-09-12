import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { buildRawTree } from './tree-dp-shared';
import { toUniversalTree } from './tree-dp-shared';
import type { RawTreeNode } from './tree-dp-shared';

export function compileLargestBST(
    _model: IYamlAlgorithmModel,
    arr: (number | null)[],
    _stage: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const root = buildRawTree(arr);
    if (!root) return [];

    const tags = new Map<string, string>();
    const statuses = new Map<string, UniversalTreeNode['status']>();
    let maxSize = 0;

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '启动四元组汇报',
      log: '🌲 最大BST子树：每个节点汇报 [isBST, minVal, maxVal, size] 四元组',
      msg: '启动自底向上后序遍历：融合左右子树四元组，判定当前子树是否构成 BST。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    function dfs(node: RawTreeNode | null): { isBST: boolean; min: number; max: number; size: number } {
      if (!node) return { isBST: true, min: Infinity, max: -Infinity, size: 0 };

      statuses.set(node.id, 'current');
      const L = dfs(node.left);
      const R = dfs(node.right);

      const isBST = L.isBST && R.isBST && L.max < node.val && node.val < R.min;
      const size = isBST ? L.size + R.size + 1 : 0;
      if (isBST) maxSize = Math.max(maxSize, size);

      const minVal = Math.min(L.min === Infinity ? node.val : L.min, node.val);
      const maxVal = Math.max(R.max === -Infinity ? node.val : R.max, node.val);

      tags.set(node.id, isBST ? `✅BST(${size})` : '❌非BST');
      statuses.set(node.id, isBST ? 'visited' : 'base');

      const lMaxStr = L.max === -Infinity ? '-∞' : String(L.max);
      const rMinStr = R.min === Infinity ? '+∞' : String(R.min);

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 8,
        i: 0,
        j: 0,
        dp1d: [maxSize, size],
        memo: [maxSize, size],
        activeSlot: 0,
        tag: isBST ? `✅BST 节点数:${size}` : '❌不满足BST条件',
        log: `| ⚡ 节点 [${node.val}]: 左BST=${L.isBST}(最大=${lMaxStr}), 右BST=${R.isBST}(最小=${rMinStr}) -> 当前${isBST ? '是BST' : '非BST'}(size=${size}), 全局maxSize=${maxSize}`,
        msg: `节点 <strong>Node(${node.val})</strong>：左最大值=<code>${lMaxStr}</code> < 节点值 <code>${node.val}</code> < 右最小值 <code>${rMinStr}</code> → <strong>${isBST ? `✅ 是合法 BST (包含 ${size} 个节点)` : '❌ 无法构成 BST'}</strong>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return { isBST, min: minVal, max: maxVal, size };
    }

    dfs(root);

    steps.push({
      type: 'return',
      line: anchorMap?.return || 17,
      i: 0,
      j: 0,
      dp1d: [maxSize],
      memo: [maxSize],
      activeSlot: 0,
      tag: `最大BST大小: ${maxSize}`,
      log: `| 🏆 遍历完成！整棵二叉树中最大 BST 子树共有 ${maxSize} 个节点`,
      msg: `🏆 演化推导完成！最大 BST 子树节点数为 <strong>${maxSize}</strong>。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps;
}
