import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import type { StageExecutionParams } from './algorithm-strategy';
import { buildRawTree } from './tree-dp-shared';
import { toUniversalTree } from './tree-dp-shared';
import type { RawTreeNode } from './tree-dp-shared';

export function compileBinaryTreeCameras(
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
    let cameras = 0;

    steps.push({
      type: 'entry',
      line: anchorMap?.entry || 1,
      i: 0,
      j: 0,
      dp1d: [0],
      memo: [0],
      activeSlot: 0,
      tag: '启动三状态机后序遍历',
      log: '🌲 监控二叉树：0-无覆盖, 1-被覆盖无相机, 2-已安放相机',
      msg: '启动后序遍历：叶子节点优先不放相机，由其父节点放相机以获得最大覆盖效益。',
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, root.id, tags, statuses),
    });

    // 0: 无覆盖, 1: 有覆盖无相机, 2: 安放相机
    function dfs(node: RawTreeNode | null): number {
      if (!node) return 1; // 空节点视为被覆盖

      statuses.set(node.id, 'current');
      const left = dfs(node.left);
      const right = dfs(node.right);

      let state = 1;
      if (left === 0 || right === 0) {
        // 子节点至少有一个未覆盖，当前必须安放相机
        cameras++;
        state = 2;
        tags.set(node.id, '📷 已放相机');
        statuses.set(node.id, 'visited');
      } else if (left === 2 || right === 2) {
        // 子节点有相机，当前已被覆盖
        state = 1;
        tags.set(node.id, '🛡️ 已被覆盖');
        statuses.set(node.id, 'base');
      } else {
        // 左右子节点都被覆盖但无相机，当前处于未覆盖状态
        state = 0;
        tags.set(node.id, '⚠️ 待覆盖');
        statuses.set(node.id, 'normal');
      }

      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 6,
        i: 0,
        j: 0,
        dp1d: [cameras, state],
        memo: [cameras, state],
        activeSlot: 0,
        tag: state === 2 ? '📷 安放相机' : state === 1 ? '🛡️ 被覆盖' : '⚠️ 待覆盖',
        log: `| ⚡ 节点 [${node.val}]: 左状态=${left}, 右状态=${right} -> 当前状态=${state} (相机数: ${cameras})`,
        msg: `节点 <strong>Node(${node.val})</strong>：左子状态=${left}，右子状态=${right} → 判定当前状态为 <strong>${state === 2 ? '📷 安放相机 (累加相机数)' : state === 1 ? '🛡️ 已被子节点相机覆盖' : '⚠️ 未被覆盖 (留给父节点处理)'}</strong>。`,
        activeNodeId: node.id,
        treeRoot: toUniversalTree(root, node.id, tags, statuses),
      });

      return state;
    }

    const rootState = dfs(root);
    if (rootState === 0) {
      cameras++;
      tags.set(root.id, '📷 根节点补相机');
      steps.push({
        type: 'update',
        line: anchorMap?.transfer || 10,
        i: 0,
        j: 0,
        dp1d: [cameras],
        memo: [cameras],
        activeSlot: 0,
        tag: '根节点未覆盖，补充相机',
        log: `| ⚡ 根节点最终未被覆盖，在根节点追加 1 个相机 -> 总数 = ${cameras}`,
        msg: `根节点处于未覆盖状态，在根节点追加 1 个相机，总相机数更新为 <strong>${cameras}</strong>。`,
        activeNodeId: root.id,
        treeRoot: toUniversalTree(root, root.id, tags, statuses),
      });
    }

    steps.push({
      type: 'return',
      line: anchorMap?.return || 13,
      i: 0,
      j: 0,
      dp1d: [cameras],
      memo: [cameras],
      activeSlot: 0,
      tag: `最少相机数: ${cameras}`,
      log: `| 🏆 演化完成！覆盖整棵树最少需要 ${cameras} 个摄像头`,
      msg: `🏆 演化推导完成！覆盖整棵树最少需要 <strong>${cameras}</strong> 个摄像头。`,
      activeNodeId: root.id,
      treeRoot: toUniversalTree(root, undefined, tags, statuses),
    });

    return steps;
}
