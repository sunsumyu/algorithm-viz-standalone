/**
 * Class 037: 二叉树序列化与反序列化深入 (Serialize and Deserialize Binary Tree)
 * 步骤编译器深模块 (Deep Module)
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';
import { TreeNode, buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import {
  SERIALIZE_037_CODE_LINES,
} from '../../../algorithms/categories/tree/tree-serialization-037-stage-codes';

export interface SerializeStep extends StepBase {
  stepIndex?: number;
  mode: 'serialize' | 'deserialize';
  stageId?: string;
  tree?: TreeNode | null;
  tokenStream: string[];
  activeTokenIndex: number;
  constructedNodes: number[];
  currentNode: string | null;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  callTrace?: RecursiveCallTraceSnapshot;
  metrics?: Record<string, string | number>;
  highlightedNodes?: number[];
  visitedNodes?: number[];
  secondaryHighlightedNodes?: number[];
}

/** 辅助：递归收集二叉树中所有非空节点值 */
export function collectTreeValues(node: TreeNode | null): number[] {
  if (!node) return [];
  const res: number[] = [];
  const queue: TreeNode[] = [node];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    res.push(cur.val);
    if (cur.left) queue.push(cur.left);
    if (cur.right) queue.push(cur.right);
  }
  return res;
}

// =========================================================================
// Stage 1: 后序序列化与反向建树 (Postorder DFS - 根 -> 右 -> 左逆向消费)
// =========================================================================
export function buildStage1PostorderSteps(mode: 'serialize' | 'deserialize' = 'deserialize'): SerializeStep[] {
  const steps: SerializeStep[] = [];
  const initialTree = buildTreeFromArr([1, 2, 3, 4, null, null, 5]);
  const lines = SERIALIZE_037_CODE_LINES;
  const trace = new RecursiveCallTraceBuilder();

  // 样板树后序序列化 Tokens: [#, #, 4, #, 2, #, #, 5, 3, 1]
  const tokens = ['#', '#', '4', '#', '2', '#', '#', '5', '3', '1'];

  if (mode === 'serialize') {
    trace.addHeader('postorderSerialize(root: Node(1))', 0, '← 启动后序递归序列化');
    steps.push({
      mode,
      stageId: 'stage-1',
      tree: cloneStateDepTree(initialTree),
      tokenStream: [],
      activeTokenIndex: -1,
      constructedNodes: [1, 2, 3, 4, 5],
      currentNode: '1',
      decision: '启动后序序列化：按 [左子树 ➔ 右子树 ➔ 根节点] 递归输出',
      message: '规则：遇到有效节点在其子树序列化完成后写入数值，遇到空指针立即打桩 "#" 占位哨兵。',
      log: 'serialize(root = 1): postorder begin',
      codeLine: lines.serEntry,
      statusBadge: { text: '开始后序序列化', type: 'info' },
      callTrace: trace.snapshot(),
      metrics: { '当前阶段': '后序序列化', '已产生 Tokens': 0 },
    });

    const stream: string[] = [];
    tokens.forEach((tok, idx) => {
      stream.push(tok);
      const isNull = tok === '#';
      if (isNull) {
        trace.addConditionHit(`• 空子树 null ➔ 写入哨兵 "#"`, 1);
      } else {
        trace.addRecursePrep(`• 节点 Node(${tok}) 左右子树就绪 ➔ 写入数值 "${tok}"`, 0);
      }

      steps.push({
        mode,
        stageId: 'stage-1',
        tree: cloneStateDepTree(initialTree),
        tokenStream: [...stream],
        activeTokenIndex: idx,
        constructedNodes: [1, 2, 3, 4, 5],
        currentNode: tok,
        decision: isNull ? '遇到 null 空子树 ➔ 追加 "#," 哨兵' : `后序归约访问节点 [${tok}] ➔ 追加 "${tok},"`,
        message: `当前已生成后序序列化串: "${stream.join(',')}"`,
        log: `Append token: ${tok}`,
        codeLine: isNull ? lines.serBase : lines.serAppend,
        statusBadge: { text: isNull ? '空指针哨兵' : `写入 ${tok}`, type: isNull ? 'warning' : 'success' },
        callTrace: trace.snapshot(),
        highlightedNodes: isNull ? [] : [Number(tok)],
        metrics: { '当前节点': tok, '已产生 Tokens': stream.length },
      });
    });

    trace.addFinalResult(`最终序列化字符串: "${stream.join(',')}"`, 0, '← 序列化成功');
    steps.push({
      mode,
      stageId: 'stage-1',
      tree: cloneStateDepTree(initialTree),
      tokenStream: stream,
      activeTokenIndex: tokens.length - 1,
      constructedNodes: [1, 2, 3, 4, 5],
      currentNode: null,
      decision: `🎉 后序序列化完毕！最终编码: "${stream.join(',')}"`,
      message: '二叉树结构无歧义持久化为连续后序字符流。',
      log: 'Postorder serialization completed.',
      codeLine: lines.serEntry,
      statusBadge: { text: '序列化成功', type: 'success' },
      callTrace: trace.snapshot(),
      metrics: { '最终 Token 数': stream.length, '状态': '已完成' },
    });
  } else {
    // 反序列化：从右往左消费 Tokens (先建根，再建右子树，再建左子树)
    trace.addHeader('postorderDeserialize(tokens)', 0, '← 启动后序逆向反序列化');
    steps.push({
      mode,
      stageId: 'stage-1',
      tree: null,
      tokenStream: tokens,
      activeTokenIndex: tokens.length,
      constructedNodes: [],
      currentNode: null,
      decision: `启动后序反序列化：从右向左逆向解析 Tokens 流 [${tokens.join(', ')}]`,
      message: '公理：后序遍历自右向左看正好为 [根 ➔ 右 ➔ 左]！必须先递归构建右子树，再构建左子树。',
      log: 'Init deserialization from postorder tokens',
      codeLine: lines.deserEntry,
      statusBadge: { text: '开始反序列化', type: 'info' },
      callTrace: trace.snapshot(),
      metrics: { '待消费 Tokens': tokens.length, '已建节点数': 0 },
    });

    const builtValues: number[] = [];
    for (let i = tokens.length - 1; i >= 0; i--) {
      const tok = tokens[i];
      const isNull = tok === '#';

      if (!isNull) {
        builtValues.push(Number(tok));
        trace.addRecursePrep(`• 弹出 Token "${tok}" ➔ 实例化根节点 Node(${tok})，深入构建右子树与左子树`, 0);
      } else {
        trace.addConditionHit(`• 弹出 Token "#" ➔ 命中 null 哨兵分支，直接返回 null`, 1);
      }

      const currentBuiltTree = buildTreeFromArr(builtValues.length === 5 ? [1, 2, 3, 4, null, null, 5] : builtValues);

      steps.push({
        mode,
        stageId: 'stage-1',
        tree: currentBuiltTree,
        tokenStream: tokens,
        activeTokenIndex: i,
        constructedNodes: [...builtValues],
        currentNode: tok,
        decision: isNull
          ? `弹出 Token "#" ➔ 识别为空指针哨兵，向父节点返回 null 闭合对应子树`
          : `弹出 Token "${tok}" ➔ 实例化 TreeNode(${tok})，依据后序逆向顺序先递归右孩子，再递归左孩子`,
        message: isNull
          ? '空指针哨兵无歧义闭合分支。'
          : `构建新节点 Node(${tok})，已复原节点集合: [${builtValues.join(', ')}]`,
        log: isNull ? 'Token # -> return null' : `Build node ${tok}`,
        codeLine: isNull ? lines.deserBase : lines.deserNode,
        statusBadge: { text: isNull ? '空指针闭合' : `建节点 ${tok}`, type: isNull ? 'warning' : 'success' },
        callTrace: trace.snapshot(),
        highlightedNodes: isNull ? [] : [Number(tok)],
        secondaryHighlightedNodes: builtValues,
        metrics: { '当前消费 Token': tok, '剩余 Tokens': i, '已复原节点': builtValues.length },
      });
    }

    const finalTree = buildTreeFromArr([1, 2, 3, 4, null, null, 5]);
    trace.addFinalResult('二叉树拓扑结构 100% 逆向无损复原', 0, '← 反序列化完成');
    steps.push({
      mode,
      stageId: 'stage-1',
      tree: finalTree,
      tokenStream: tokens,
      activeTokenIndex: 0,
      constructedNodes: builtValues,
      currentNode: null,
      decision: '🎉 后序反序列化重构完全成功！二叉树拓扑结构 100% 同构复原',
      message: '所有 Token 严格按照 [根 ➔ 右 ➔ 左] 逆向消费完毕，完美证明后序序列具备无歧义单射还原能力。',
      log: 'Postorder deserialization completed successfully.',
      codeLine: lines.deserEntry,
      statusBadge: { text: '重构完毕', type: 'success' },
      callTrace: trace.snapshot(),
      highlightedNodes: [1],
      visitedNodes: [1, 2, 3, 4, 5],
      metrics: { '最终节点数': 5, '状态': '同构完成' },
    });
  }

  return steps;
}

// =========================================================================
// Stage 2: 广度优先层序序列化与队列复原 (Levelorder BFS)
// =========================================================================
export function buildStage2LevelorderSteps(): SerializeStep[] {
  const steps: SerializeStep[] = [];
  const initialTree = buildTreeFromArr([1, 2, 3, null, 4, 5, null]);
  const lines = SERIALIZE_037_CODE_LINES;
  const trace = new RecursiveCallTraceBuilder();

  const levelTokens = ['1', '2', '3', '#', '4', '5', '#', '#', '#', '#', '#'];

  trace.addHeader('levelorderSerialize(root: Node(1))', 0, '← 启动层序 BFS 序列化');
  steps.push({
    mode: 'serialize',
    stageId: 'stage-2',
    tree: cloneStateDepTree(initialTree),
    tokenStream: [],
    activeTokenIndex: -1,
    constructedNodes: [1, 2, 3, 4, 5],
    currentNode: '1',
    decision: '启动层序序列化 (BFS)：借助 FIFO 队列按层打桩与成对输出',
    message: '层序遍历规则：根节点率先入队并写入序列；弹出节点时，左右子节点不论是否存在均成对入队并写入。',
    log: 'levelorder serialize: queue init with root=1',
    codeLine: lines.serEntry,
    statusBadge: { text: '层序启动', type: 'info' },
    callTrace: trace.snapshot(),
    metrics: { '遍历方式': 'FIFO 队列层序', '已产生 Tokens': 0 },
  });

  const stream: string[] = [];
  levelTokens.forEach((tok, idx) => {
    stream.push(tok);
    const isNull = tok === '#';
    if (isNull) {
      trace.addConditionHit(`• 遇到空孩子 ➔ 输出 "#" 哨兵`, 1);
    } else {
      trace.addRecursePrep(`• 队列弹出 Node(${tok}) ➔ 左右孩子成对入队`, 0);
    }

    steps.push({
      mode: 'serialize',
      stageId: 'stage-2',
      tree: cloneStateDepTree(initialTree),
      tokenStream: [...stream],
      activeTokenIndex: idx,
      constructedNodes: [1, 2, 3, 4, 5],
      currentNode: tok,
      decision: isNull ? '遇到 null 空指针 ➔ 输出 "#," 占位符' : `访问队列节点 [${tok}] ➔ 写入序列并展开左右孩子`,
      message: `当前层序序列化流: "${stream.join(',')}"`,
      log: `Append level token: ${tok}`,
      codeLine: isNull ? lines.serBase : lines.serAppend,
      statusBadge: { text: isNull ? '层序哨兵' : `写入 ${tok}`, type: isNull ? 'warning' : 'success' },
      callTrace: trace.snapshot(),
      highlightedNodes: isNull ? [] : [Number(tok)],
      metrics: { '当前 Token': tok, '队列已处理': idx + 1 },
    });
  });

  trace.addFinalResult(`层序序列化流: "${stream.join(',')}"`, 0, '← 层序完成');
  steps.push({
    mode: 'serialize',
    stageId: 'stage-2',
    tree: cloneStateDepTree(initialTree),
    tokenStream: stream,
    activeTokenIndex: levelTokens.length - 1,
    constructedNodes: [1, 2, 3, 4, 5],
    currentNode: null,
    decision: '🎉 层序序列化完毕！反序列化时借助 FIFO 队列按层成对消费即可复原',
    message: '层序序列化具备与先序相同的无歧义拓扑表达能力。',
    log: 'Levelorder serialization complete.',
    codeLine: lines.serEntry,
    statusBadge: { text: '层序成功', type: 'success' },
    callTrace: trace.snapshot(),
    metrics: { '总 Tokens': stream.length, '状态': '层序就绪' },
  });

  return steps;
}

// =========================================================================
// Stage 3: 中序序列化歧义判定反例 (Inorder Ambiguity Counterexample)
// =========================================================================
export function buildStage3AmbiguitySteps(): SerializeStep[] {
  const steps: SerializeStep[] = [];
  const lines = SERIALIZE_037_CODE_LINES;
  const trace = new RecursiveCallTraceBuilder();

  const treeA = buildTreeFromArr([1, 2, null]);
  const treeB = buildTreeFromArr([2, null, 1]);
  const sharedTokens = ['#', '2', '#', '1', '#'];

  trace.addHeader('proveInorderAmbiguity()', 0, '← 中序歧义反例推导');
  trace.addConditionHit('• 树 A: 根节点为 1，左孩子为 2', 0);
  trace.addConditionHit('• 树 B: 根节点为 2，右孩子为 1', 0);

  steps.push({
    mode: 'serialize',
    stageId: 'stage-3',
    tree: treeA,
    tokenStream: sharedTokens,
    activeTokenIndex: 0,
    constructedNodes: [1, 2],
    currentNode: '2',
    decision: '考察两棵完全不同的二叉树：树 A (1 的左孩子是 2) 与 树 B (2 的右孩子是 1)',
    message: '核心悬念：即使严格补全所有空节点 "#"，中序遍历能否反序列化？',
    log: 'Prove inorder ambiguity with counterexample',
    codeLine: lines.serEntry,
    statusBadge: { text: '反例推导', type: 'danger' },
    callTrace: trace.snapshot(),
    metrics: { '定理判定': '中序不可反序列化', '歧义冲突数': 2 },
  });

  trace.addRecursePrep('• 树 A 补全 "#" 中序遍历输出: [#, 2, #, 1, #]', 0);
  steps.push({
    mode: 'serialize',
    stageId: 'stage-3',
    tree: treeA,
    tokenStream: sharedTokens,
    activeTokenIndex: 2,
    constructedNodes: [1, 2],
    currentNode: '1',
    decision: '对树 A 进行中序序列化：左(#) ➔ 中(2) ➔ 右(#) ➔ 根(1) ➔ 右(#) ➔ 输出 "#,2,#,1,#"',
    message: '树 A 产生了 5 个标记字符。',
    log: 'Tree A inorder tokens: #,2,#,1,#',
    codeLine: lines.serAppend,
    statusBadge: { text: '树 A 序列化', type: 'warning' },
    callTrace: trace.snapshot(),
    metrics: { '树 A 根节点': 1, '输出序列': '#,2,#,1,#' },
  });

  trace.addRecursePrep('• 树 B 补全 "#" 中序遍历输出: [#, 2, #, 1, #]', 0);
  steps.push({
    mode: 'serialize',
    stageId: 'stage-3',
    tree: treeB,
    tokenStream: sharedTokens,
    activeTokenIndex: 4,
    constructedNodes: [2, 1],
    currentNode: '2',
    decision: '对树 B 进行中序序列化：左(#) ➔ 根(2) ➔ 右子树左(#) ➔ 1 ➔ 右(#) ➔ 同样输出 "#,2,#,1,#"',
    message: '树 B 也产生了完全相同的 5 个标记字符！',
    log: 'Tree B inorder tokens: #,2,#,1,#',
    codeLine: lines.serAppend,
    statusBadge: { text: '树 B 序列化', type: 'warning' },
    callTrace: trace.snapshot(),
    metrics: { '树 B 根节点': 2, '输出序列': '#,2,#,1,#' },
  });

  trace.addFinalResult('单射崩溃：同一个中序字符串对应两棵不同二叉树！', 0, '← 证明完毕');
  steps.push({
    mode: 'serialize',
    stageId: 'stage-3',
    tree: treeA,
    tokenStream: sharedTokens,
    activeTokenIndex: 4,
    constructedNodes: [1, 2],
    currentNode: null,
    decision: '🚫 定理得证：中序序列化不具备单射性 (Non-Injective)，二叉树绝不可采用中序序列化！',
    message: '先序、后序、层序均可无歧义反序列化，唯独中序不可！这是面试中极其重要的经典理论题。',
    log: 'Inorder deserialization is mathematically impossible.',
    codeLine: lines.deserEntry,
    statusBadge: { text: '中序不可反序列化', type: 'danger' },
    callTrace: trace.snapshot(),
    metrics: { '结论': '绝对禁止使用中序序列化', '证明状态': 'Q.E.D.' },
  });

  return steps;
}

// 统一分发门禁向前兼容入口
export function generateSerializationSteps(mode: 'serialize' | 'deserialize' = 'deserialize'): SerializeStep[] {
  return buildStage1PostorderSteps(mode);
}
