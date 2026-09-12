import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { buildRawTree } from './tree-dp-shared';
import { toUniversalTree } from './tree-dp-shared';
import type { RawTreeNode } from './tree-dp-shared';

export function compileMaxPathSum(
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
    let maxPath = -Infinity;

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '启动后序收益汇聚',
      log: '🌲 最大路径和：每个节点向父节点汇报【单侧最大延伸收益】(负收益截断取0)',
      msg: '启动后序遍历：以每个节点为拱顶结算拐点路径和，向上回溯单侧最大收益。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    function dfs(node: RawTreeNode | null): number {
      if (!node) return 0;

      statuses.set(node.id, 'current');
      const leftGain = Math.max(0, dfs(node.left));
      const rightGain = Math.max(0, dfs(node.right));

      const archSum = node.val + leftGain + rightGain;
      const oldMax = maxPath;
      maxPath = Math.max(maxPath, archSum);

      const returnGain = node.val + Math.max(leftGain, rightGain);
      tags.set(node.id, `拐:${archSum}, 益:${returnGain}`);
      statuses.set(node.id, 'visited');

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: 0,
        dp1d: [maxPath, archSum, returnGain],
        memo: [maxPath, archSum, returnGain],
        activeSlot: 0,
        tag: `拱顶路径和:${archSum}`,
        log: `| ⚡ 节点 [${node.val}]: 左收益=${leftGain}, 右收益=${rightGain} -> 拱顶闭合路径=${archSum}, 向父返回=${returnGain} (全局最大: ${oldMax} -> ${maxPath})`,
        msg: `节点 <strong>Node(${node.val})</strong>：左单侧增益=${leftGain}，右单侧增益=${rightGain}，以当前节点为顶点的拱形路径和 <code>${archSum} = ${node.val} + ${leftGain} + ${rightGain}</code>，向父汇报单向增益 <strong>${returnGain}</strong>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return returnGain;
    }

    dfs(root);

    steps.push({
      type: 'return',
      line: anchorMap?.return || 12,
      i: 0,
      j: 0,
      dp1d: [maxPath],
      memo: [maxPath],
      activeSlot: 0,
      tag: `最大路径和: ${maxPath}`,
      log: `| 🏆 演化完成！整棵二叉树最大路径和为 ${maxPath}`,
      msg: `🏆 演化推导完成！整棵二叉树最大路径和为 <strong>${maxPath}</strong>。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps;
}
