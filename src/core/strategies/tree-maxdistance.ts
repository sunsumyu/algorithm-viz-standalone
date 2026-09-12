import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { buildRawTree } from './tree-dp-shared';
import { toUniversalTree } from './tree-dp-shared';
import type { RawTreeNode } from './tree-dp-shared';

export function compileMaxDistance(
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
    let globalMaxDist = 0;

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0, 0, 0],
      memo: [0, 0, 0],
      activeSlot: 0,
      tag: '启动后序遍历',
      log: '🌲 树型DP启动：每个节点向父节点汇报 [子树最大深度, 内部最大距离] 二元组',
      msg: '启动自底向上后序遍历：每个节点计算 <code>[maxDepth, maxDist]</code>。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    function dfs(node: RawTreeNode | null): { depth: number; dist: number } {
      if (!node) return { depth: 0, dist: 0 };

      statuses.set(node.id, 'current');
      steps.push({
        type: 'step',
        line: anchorMap?.entry || 4,
        i: 0,
        j: 0,
        dp1d: [globalMaxDist, 0, 0],
        memo: [globalMaxDist, 0, 0],
        activeSlot: 0,
        tag: `访问节点 ${node.val}`,
        log: `| 📥 递归进入节点 [${node.val}]`,
        msg: `访问节点 <strong>Node(${node.val})</strong>，先递归计算左右子树。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      const L = dfs(node.left);
      const R = dfs(node.right);

      const crossDist = L.depth + R.depth;
      const dist = Math.max(crossDist, L.dist, R.dist);
      const depth = Math.max(L.depth, R.depth) + 1;
      const oldAns = globalMaxDist;
      globalMaxDist = Math.max(globalMaxDist, dist);

      tags.set(node.id, `深:${depth}, 距:${dist}`);
      statuses.set(node.id, 'visited');

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 8,
        i: 0,
        j: 0,
        dp1d: [globalMaxDist, depth, dist],
        memo: [globalMaxDist, depth, dist],
        activeSlot: 0,
        tag: `穿越:${crossDist}, 子树距:${dist}`,
        log: `| ⚡ 节点 [${node.val}] 计算: 左深=${L.depth}, 右深=${R.depth} -> 穿越=${crossDist}, 内部最大距=${dist}, 深度=${depth} (全局最大: ${oldAns} -> ${globalMaxDist})`,
        msg: `节点 <strong>Node(${node.val})</strong>：左深度=${L.depth}，右深度=${R.depth}，穿越路径长 <code>${crossDist} = ${L.depth} + ${R.depth}</code>，子树最大距离 <strong>${dist}</strong>，向父汇报深度 <strong>${depth}</strong>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return { depth, dist };
    }

    dfs(root);

    steps.push({
      type: 'return',
      line: anchorMap?.return || 13,
      i: 0,
      j: 0,
      dp1d: [globalMaxDist, globalMaxDist, globalMaxDist],
      memo: [globalMaxDist, globalMaxDist, globalMaxDist],
      activeSlot: 0,
      tag: `最大距离: ${globalMaxDist}`,
      log: `| 🏆 树型DP推导完成！整棵树中任意两节点间最大距离为 ${globalMaxDist}`,
      msg: `🏆 树型 DP 推导完成！整棵树任意两节点间最大距离为 <strong>${globalMaxDist}</strong>。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps;
}
