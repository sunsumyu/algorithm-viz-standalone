/**
 * Class 037: 二叉树序列化与反序列化深入 (Serialize and Deserialize Binary Tree)
 * 左程云算法通关课入门篇 Class 037 / LeetCode 297 高阶拓展
 *
 * 核心原语：
 *   Stage 1: 后序遍历序列化与逆向单向递归建树 (Postorder DFS: 根 -> 右 -> 左逆向消费)
 *   Stage 2: 广度优先层序序列化与双端队列成对装配 (Levelorder BFS)
 *   Stage 3: 中序序列化二义性反例推导与不可反序列化定理证明 (Inorder Ambiguity Proof)
 *
 * 设计模式应用:
 *   建造者模式 (RecursiveCallTraceBuilder): 追踪后序与先序递归状态演化与返回闭环
 *   适配器模式 (TreeCanvasAdapter): 桥接纯净 SVG 树拓扑沙盘与 Card 2 数据流传送带
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase, HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
  RecursiveCallTraceAdapter,
} from '../../../core/renderers/adapters/recursive-call-trace-adapter';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import { TREE_SERIALIZATION_037_PROBLEM_CONTENT } from './tree-serialization-037-problem-content';
import {
  TREE_SERIALIZATION_037_CODES,
  SERIALIZE_037_CODE_LINES,
} from './tree-serialization-037-stage-codes';

export const SERIALIZE_037_CODES = TREE_SERIALIZATION_037_CODES;

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
function collectTreeValues(node: TreeNode | null): number[] {
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
  // 1(L: 2(L: 4), R: 3(R: 5))
  // postorder: 4(L:#, R:#) -> 2(R:#) -> 5(L:#, R:#) -> 3(L:#) -> 1
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
    // 逆向消费时序: 1 (根) -> 3 (右) -> 5 (3的右) -> 2 (左) -> 4 (2的左)
    for (let i = tokens.length - 1; i >= 0; i--) {
      const tok = tokens[i];
      const isNull = tok === '#';

      if (!isNull) {
        builtValues.push(Number(tok));
        trace.addRecursePrep(`• 弹出 Token "${tok}" ➔ 实例化根节点 Node(${tok})，深入构建右子树与左子树`, 0);
      } else {
        trace.addConditionHit(`• 弹出 Token "#" ➔ 命中 null 哨兵分支，直接返回 null`, 1);
      }

      // 部分重构的二叉树快照
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

  // 层序序列化: [1, 2, 3, #, 4, 5, #, #, #, #, #]
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

  // 树 A: 根 1, 左 2  (中序: #, 2, #, 1, #)
  // 树 B: 根 2, 右 1  (中序: #, 2, #, 1, #)
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

// =========================================================================
// 表现层渲染器 (Card 1: 真实 SVG 二叉树沙盘)
// =========================================================================
export function renderSerializationCanvas(container: HTMLElement, step: SerializeStep): void {
  if (!container) return;

  if (step.tree) {
    const isDone = step.decision.includes('成功') || step.decision.includes('完毕') || step.decision.includes('定理得证');
    const allVals = collectTreeValues(step.tree);
    const currentVal = step.currentNode !== null && step.currentNode !== '#' ? Number(step.currentNode) : null;

    TreeCanvasAdapter.renderTree(container, {
      tree: step.tree,
      current: currentVal !== null ? currentVal : (isDone ? step.tree.val : null),
      visitedNodes: isDone ? allVals : step.visitedNodes || step.constructedNodes,
      secondaryHighlightedNodes: step.secondaryHighlightedNodes || step.highlightedNodes || [],
      primaryColor: isDone ? '#fbbf24' : '#38bdf8',
      secondaryColor: '#34d399',
      visitedColor: '#10b981',
    });
  } else {
    // 反序列化初始未建树时的优雅占位
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%; background: #ffffff; border-radius: 8px;">
        <svg width="220" height="120" viewBox="0 0 220 120">
          <circle cx="110" cy="50" r="26" fill="#eff6ff" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="110" y="55" text-anchor="middle" font-size="11" fill="#0284c7" font-weight="bold">等待反向建树...</text>
        </svg>
        <span style="font-size: 11px; color: #64748b; margin-top: 8px;">自右向左消费 Tokens，先建根，再建右子树，再建左子树</span>
      </div>
    `;
  }
}

// =========================================================================
// 表现层自定义指标与推演树渲染器 (Card 2: Tokens 传送带与调用栈)
// =========================================================================
export function renderSerializationCard2(container: HTMLElement, step: SerializeStep): void {
  if (!container) return;
  container.innerHTML = '';
  container.className = 'w-full h-full flex flex-col gap-2 p-3 text-xs font-sans overflow-hidden';

  // 1. 顶部 4 维指标看板
  const statsRow = document.createElement('div');
  statsRow.className = 'grid grid-cols-4 gap-2 flex-shrink-0';
  statsRow.innerHTML = `
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">演进阶段</span>
      <span class="text-amber-300 font-mono font-bold text-xs mt-0.5 truncate">${step.stageId || 'Stage 1'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">消费 Token</span>
      <span class="text-blue-300 font-mono font-bold text-xs mt-0.5 truncate">${step.currentNode ?? '—'}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">已建节点数</span>
      <span class="text-emerald-300 font-mono font-bold text-xs mt-0.5 truncate">${step.constructedNodes.length}</span>
    </div>
    <div class="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex flex-col">
      <span class="text-slate-400 text-[10px] uppercase font-semibold">流长度</span>
      <span class="text-purple-300 font-mono font-bold text-xs mt-0.5 truncate">${step.tokenStream.length}</span>
    </div>
  `;
  container.appendChild(statsRow);

  // 2. Tokens 传送带沙盘
  const conveyorCard = document.createElement('div');
  conveyorCard.className = 'bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 flex flex-col gap-1.5 flex-shrink-0';
  conveyorCard.innerHTML = `
    <div class="flex items-center justify-between text-slate-400 text-[11px] font-semibold">
      <span>📦 Token 字符串流传送带 (Tokens Pipeline)</span>
      <span class="text-[10px] text-slate-500 font-mono">active: #${step.activeTokenIndex}</span>
    </div>
  `;

  const pillsBox = document.createElement('div');
  pillsBox.className = 'flex gap-1.5 overflow-x-auto py-1 items-center';
  step.tokenStream.forEach((tok, idx) => {
    const isActive = idx === step.activeTokenIndex;
    const isConsumed = step.mode === 'deserialize' ? idx > step.activeTokenIndex : idx < step.activeTokenIndex;
    const pill = document.createElement('div');
    pill.className = `flex flex-col items-center justify-center px-2 py-1 min-w-[32px] rounded border font-mono text-xs font-bold transition-all ${
      isActive
        ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm shadow-sky-500/20'
        : isConsumed
        ? 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60'
        : tok === '#'
        ? 'bg-amber-500/10 border-amber-600/40 text-amber-300'
        : 'bg-slate-800/80 border-slate-700 text-slate-300'
    }`;
    pill.innerHTML = `<span>${tok}</span><span class="text-[8px] font-normal opacity-70">#${idx}</span>`;
    pillsBox.appendChild(pill);
  });
  conveyorCard.appendChild(pillsBox);
  container.appendChild(conveyorCard);

  // 3. 递归推演树 (Figure 1 拓扑规范适配器)
  if (step.callTrace) {
    const traceBox = document.createElement('div');
    traceBox.className = 'flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-lg p-2 overflow-y-auto';
    RecursiveCallTraceAdapter.render(traceBox, step.callTrace, {
      title: '🌳 后序逆向建树推演跟踪树 (Call Trace)',
      maxHeight: '100%',
    });
    container.appendChild(traceBox);
  }
}

// =========================================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// =========================================================================
export const treeSerialization037Visualizer = registerDeclarativeAlgorithm<SerializeStep>({
  id: 'tree-serialization-037',
  name: 'Class 037: 二叉树后序与高级序列化深入',
  category: 'tree',
  icon: '📦',
  difficulty: 3,
  levelOrder: 37,
  aliases: ['class037-code01', 'tree-serialization-037', 'postorder-serialize', 'serialize-deserialize-postorder'],
  learningGoal: '掌握二叉树后序遍历左右中序列化与自右向左逆向建树公理，彻底理解中序不可反序列化歧义本质',
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 后序序列化与逆序建树 (Postorder DFS)',
      shortName: '后序逆向建树',
      card2Title: '后序 Tokens 流与逆向递归装配面板',
      card2Desc: '左右中输出序列；自右向左消费 Tokens：先构建根，再构建右子树，最后构建左子树',
      codeLanguages: TREE_SERIALIZATION_037_CODES,
      generateSteps: () => buildStage1PostorderSteps('deserialize'),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 广度优先层序序列化与队列装配 (Levelorder BFS)',
      shortName: '层序队列装配',
      card2Title: '层序队列流与挂载面板',
      card2Desc: '利用 FIFO 队列逐层拓扑输出与反向成对挂载子节点',
      codeLanguages: TREE_SERIALIZATION_037_CODES,
      generateSteps: () => buildStage2LevelorderSteps(),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 中序序列化歧义判定反例 (Inorder Ambiguity)',
      shortName: '中序歧义推导',
      card2Title: '中序不可反序列化反例证明',
      card2Desc: '严格举证两棵不同二叉树产生完全相同的中序字符串，论证单射崩溃定理',
      codeLanguages: TREE_SERIALIZATION_037_CODES,
      generateSteps: () => buildStage3AmbiguitySteps(),
    },
  ],
  codeLanguages: TREE_SERIALIZATION_037_CODES,
  problemHtml: TREE_SERIALIZATION_037_PROBLEM_CONTENT.description + TREE_SERIALIZATION_037_PROBLEM_CONTENT.mechanisms,
  inputs: [
    {
      id: 'mode',
      label: '演示流程模式',
      type: 'select',
      defaultValue: 'deserialize',
      options: [
        { label: '反序列化重构过程 (Stream ➔ Tree)', value: 'deserialize' },
        { label: '序列化编码过程 (Tree ➔ Stream)', value: 'serialize' },
      ],
    },
  ],
  generateSteps: (input) => {
    const mode = (input?.mode || 'deserialize') as 'serialize' | 'deserialize';
    return buildStage1PostorderSteps(mode);
  },
  renderCanvas: (container, step) => {
    renderSerializationCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderSerializationCard2(container, step);
  },
});
