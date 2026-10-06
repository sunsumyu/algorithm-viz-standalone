/**
 * Tree Serialization (Class 021) Step Compiler
 * 二叉树先序与层序序列化与反序列化步骤编译器
 * 深模块核心编译器 (Deep Module)
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';
import {
  TREE_SERIALIZATION_021_CODE_LINES,
} from '../../../algorithms/categories/tree/tree-serialization-021-stage-codes';

// ============================================================
// 数据结构与接口定义 (保持既有测试契约不变)
// ============================================================
export interface Tree021Node {
  id: number;
  val: string;
  left?: number;
  right?: number;
}

export interface Tree021Step extends StepBase {
  treeStructure: Tree021Node[];
  activeNodeId?: number;
  tokensStream: string[];
  currentToken?: string;
  reconstructedTree: Tree021Node[];
  mode: 'preorder' | 'levelorder';
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  stageId?: 'stage1' | 'stage2' | 'stage3';
}

// 样板树布局坐标 (单侧 380 宽)
export interface NodeLayout {
  id: number;
  val: string;
  x: number;
  y: number;
  left?: number;
  right?: number;
}

export const SAMPLE_TREE_NODES: Record<number, NodeLayout> = {
  1: { id: 1, val: '1', x: 190, y: 40, left: 2, right: 3 },
  2: { id: 2, val: '2', x: 110, y: 110, left: 4 },
  3: { id: 3, val: '3', x: 270, y: 110, right: 5 },
  4: { id: 4, val: '4', x: 70, y: 180 },
  5: { id: 5, val: '5', x: 310, y: 180 },
};

// ============================================================
// 步骤生成核心 (保持 100% 测试契约满足)
// ============================================================
export function buildSerialization021Steps(
  mode: 'preorder' | 'levelorder' = 'preorder'
): Tree021Step[] {
  const steps: Tree021Step[] = [];

  const sampleTree: Tree021Node[] = [
    { id: 1, val: '1', left: 2, right: 3 },
    { id: 2, val: '2', left: 4 },
    { id: 3, val: '3', right: 5 },
    { id: 4, val: '4' },
    { id: 5, val: '5' },
  ];

  const stream: string[] = [];
  const reconstructed: Tree021Node[] = [];
  const stageId = mode === 'levelorder' ? 'stage2' : 'stage1';

  // Step 0: Initial
  steps.push({
    treeStructure: sampleTree,
    tokensStream: [],
    reconstructedTree: [],
    mode,
    decision: `准备进行二叉树【${mode === 'preorder' ? '先序遍历' : '层序遍历'}】序列化与反序列化全流程`,
    message: '二叉树结构必须记录空节点标记 "#"，否则单纯先序/层序序列无法唯一确定一棵树。',
    log: 'Init Tree Serialization',
    codeLine: TREE_SERIALIZATION_021_CODE_LINES.entry,
    statusBadge: { text: '就绪', type: 'info' },
    stageId,
  });

  if (mode === 'preorder') {
    // 先序序列化
    const serializeSeq = ['1', '2', '4', '#', '#', '#', '3', '#', '5', '#', '#'];
    const decisions = [
      '访问根节点 1，写入 token "1"',
      '下潜左孩子 2，写入 token "2"',
      '下潜左孩子 4，写入 token "4"',
      '4 的左孩子为空，写入 "#"',
      '4 的右孩子为空，写入 "#"',
      '2 的右孩子为空，写入 "#"',
      '返回 1 并转向右孩子 3，写入 token "3"',
      '3 的左孩子为空，写入 "#"',
      '下潜右孩子 5，写入 token "5"',
      '5 的左孩子为空，写入 "#"',
      '5 的右孩子为空，写入 "#"',
    ];

    for (let i = 0; i < serializeSeq.length; i++) {
      const t = serializeSeq[i];
      stream.push(t);
      const numId = t !== '#' ? Number(t) : undefined;

      steps.push({
        treeStructure: sampleTree,
        activeNodeId: numId,
        tokensStream: [...stream],
        currentToken: t,
        reconstructedTree: [],
        mode,
        decision: decisions[i],
        message: `序列化字符流增加: "${t}"。当前序列: [${stream.join(', ')}]`,
        log: `serialize token "${t}"`,
        codeLine: TREE_SERIALIZATION_021_CODE_LINES.serializeToken,
        statusBadge: { text: `Token: ${t}`, type: t === '#' ? 'warning' : 'info' },
        stageId,
      });
    }

    // 反序列化阶段开始
    steps.push({
      treeStructure: sampleTree,
      tokensStream: [...stream],
      reconstructedTree: [],
      mode,
      decision: `序列化产物完成: "${stream.join(',')}"，启动反序列化解析`,
      message: '通过先序消费队列，遇到数字创建节点并递归构建左/右子树，遇到 "#" 返回 null。',
      log: 'Start deserialize queue',
      codeLine: TREE_SERIALIZATION_021_CODE_LINES.startDeserialize,
      statusBadge: { text: '开始反序列化', type: 'info' },
      stageId,
    });

    // 动态重建各节点
    const buildSteps = [
      { id: 1, val: '1', left: 2, right: 3, text: '弹出 "1"，创建根节点 1' },
      { id: 2, val: '2', left: 4, text: '弹出 "2"，作为 1 的左孩子' },
      { id: 4, val: '4', text: '弹出 "4"，作为 2 的左孩子' },
      { id: 3, val: '3', right: 5, text: '弹出 "3"，作为 1 的右孩子' },
      { id: 5, val: '5', text: '弹出 "5"，作为 3 的右孩子' },
    ];

    for (const b of buildSteps) {
      reconstructed.push({ id: b.id, val: b.val, left: b.left, right: b.right });
      steps.push({
        treeStructure: sampleTree,
        activeNodeId: b.id,
        tokensStream: [...stream],
        currentToken: b.val,
        reconstructedTree: [...reconstructed],
        mode,
        decision: b.text,
        message: `队列出队 "${b.val}"，递归组装树节点 #${b.id}`,
        log: `deserialize node ${b.id}`,
        codeLine: TREE_SERIALIZATION_021_CODE_LINES.startDeserialize,
        statusBadge: { text: `构建 #${b.id}`, type: 'warning' },
        stageId,
      });
    }
  } else {
    // 层序序列化
    const levelSeq = ['1', '2', '3', '4', '#', '#', '5', '#', '#', '#', '#'];
    const decisions = [
      '根节点 1 出队并写入 token "1"，左右孩子 2, 3 入队',
      '节点 2 出队并写入 token "2"，左孩子 4 入队，右孩子为空入队 "#"',
      '节点 3 出队并写入 token "3"，左孩子为空入队 "#"，右孩子 5 入队',
      '节点 4 出队并写入 token "4"，左右孩子均为空成对入队 "#", "#"',
      '节点 5 出队并写入 token "5"，左右孩子均为空成对入队 "#", "#"',
      '空节点标记 "#" 出队写入',
    ];

    for (let i = 0; i < decisions.length; i++) {
      const t = levelSeq[i];
      stream.push(t);
      const numId = t !== '#' ? Number(t) : undefined;
      steps.push({
        treeStructure: sampleTree,
        activeNodeId: numId,
        tokensStream: [...stream],
        currentToken: t,
        reconstructedTree: [],
        mode,
        decision: decisions[i],
        message: `层序字符流增加: "${t}"。当前序列: [${stream.join(', ')}]`,
        log: `levelorder serialize token "${t}"`,
        codeLine: TREE_SERIALIZATION_021_CODE_LINES.serializeToken,
        statusBadge: { text: `Token: ${t}`, type: t === '#' ? 'warning' : 'info' },
        stageId,
      });
    }

    // 补全剩余 "#"
    while (stream.length < levelSeq.length) {
      stream.push('#');
    }

    // 反序列化阶段
    reconstructed.push({ id: 1, val: '1', left: 2, right: 3 });
    reconstructed.push({ id: 2, val: '2', left: 4 });
    reconstructed.push({ id: 3, val: '3', right: 5 });
    reconstructed.push({ id: 4, val: '4' });
    reconstructed.push({ id: 5, val: '5' });
  }

  // 最终完成步骤
  steps.push({
    treeStructure: sampleTree,
    tokensStream: [...stream],
    reconstructedTree: [...reconstructed],
    mode,
    decision: '🎉 序列化与反序列化完美闭环！重建树与原树拓扑 100% 守恒一致！',
    message: '二叉树结构、拓扑分支与节点值与原树完全一致，成功完成无损还原。',
    log: 'Finished Tree Deserialization',
    codeLine: TREE_SERIALIZATION_021_CODE_LINES.reconstructedDone,
    statusBadge: { text: '复原成功', type: 'success' },
    stageId,
  });

  return steps;
}
