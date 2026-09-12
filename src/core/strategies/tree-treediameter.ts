import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { buildRawTree } from './tree-dp-shared';
import { toUniversalTree } from './tree-dp-shared';
import type { RawTreeNode } from './tree-dp-shared';

export function compileTreeDiameter(
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
    let maxDiameter = 0;

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '启动直径统计',
      log: '🌲 二叉树直径：拐点路径边数 = 左深度 + 右深度',
      msg: '启动后序遍历：计算每个节点的最大深度并结算穿过当前节点的最长路径。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    function dfs(node: RawTreeNode | null): number {
      if (!node) return 0;

      statuses.set(node.id, 'current');
      const left = dfs(node.left);
      const right = dfs(node.right);
      const currentDiameter = left + right;

      maxDiameter = Math.max(maxDiameter, currentDiameter);
      const depth = Math.max(left, right) + 1;

      tags.set(node.id, `深:${depth}, 直:${currentDiameter}`);
      statuses.set(node.id, 'visited');

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 7,
        i: 0,
        j: 0,
        dp1d: [maxDiameter, depth, currentDiameter],
        memo: [maxDiameter, depth, currentDiameter],
        activeSlot: 0,
        tag: `拐点直径:${currentDiameter}`,
        log: `| ⚡ 节点 [${node.val}]: 左深度=${left}, 右深度=${right} -> 当前拐点路径边数=${currentDiameter}, 全局直径=${maxDiameter}`,
        msg: `节点 <strong>Node(${node.val})</strong>：左深度=${left}，右深度=${right}，拐点路径长 <code>${currentDiameter} = ${left} + ${right}</code>，向父汇报单侧深度 <strong>${depth}</strong>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return depth;
    }

    dfs(root);

    steps.push({
      type: 'return',
      line: anchorMap?.return || 12,
      i: 0,
      j: 0,
      dp1d: [maxDiameter],
      memo: [maxDiameter],
      activeSlot: 0,
      tag: `最大直径: ${maxDiameter}`,
      log: `| 🏆 演化完成！二叉树的最大直径为 ${maxDiameter}`,
      msg: `🏆 演化推导完成！二叉树的最大直径为 <strong>${maxDiameter}</strong>。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps;
}
