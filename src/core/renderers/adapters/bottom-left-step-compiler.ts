/**
 * 找树左下角的值通用步进编译器 (BottomLeftStepCompiler)
 * 深度模块 (Deep Module): 封装先序先登 DFS、标准层序 BFS、以及逆向右先层序 BFS 等三阶段演化推演
 * 遵循 Matt Pocock 深模块规范与 Strict One-Line-One-Step 步进契约
 */

import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { StepBase } from '../../step-visualizer';
import { cloneStateDepTree } from '../../strategies/tree-clone';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';
import {
  BOTTOM_LEFT_STAGE1_LINES,
  BOTTOM_LEFT_STAGE2_LINES,
  BOTTOM_LEFT_STAGE3_LINES,
} from '../../../algorithms/categories/tree/bottom-left-stage-codes';

export interface BottomLeftStep extends StepBase {
  tree: TreeNode | null;
  current: number | null;
  depth: number;
  maxDepth: number;
  bottomLeft: number | null;
  message: string;
  log: string;
  decision: string;
  codeLine: Record<string, number>;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };
  stageId?: string;
  highlightedNodes?: number[];
  secondaryHighlightedNodes?: number[];
  visitedNodes?: number[];
  queueState?: number[];
  action?: string;
  phase?: string;
  callTrace?: RecursiveCallTraceSnapshot;
}

export function collectTreeValues(node: TreeNode | null): number[] {
  if (!node) return [];
  const result: number[] = [];
  function traverse(n: TreeNode | null) {
    if (!n) return;
    result.push(n.val);
    traverse(n.left);
    traverse(n.right);
  }
  traverse(node);
  return result;
}

export class BottomLeftStepCompiler {
  /**
   * Stage 1: 先序递归 DFS 与最深层先登者锁定 (Preorder DFS)
   */
  public static compileStage1PreorderSteps(root: TreeNode | null): BottomLeftStep[] {
    const steps: BottomLeftStep[] = [];
    const lines = BOTTOM_LEFT_STAGE1_LINES;
    const trace = new RecursiveCallTraceBuilder();
    let maxDepth = -1;
    let bottomLeft: number | null = null;

    if (!root) {
      trace.addHeader('findBottomLeftValue(null)', 0, '<- 根调用特判');
      trace.addConditionHit('root == null √ 命中 -> return 0', 0);
      trace.addReturnLeaf('return 0', 0);
      trace.addFinalResult('最终判定: 0 (空树返回 0)', 0, undefined, 0);

      steps.push({
        tree: null,
        current: null,
        depth: 0,
        maxDepth: -1,
        bottomLeft: null,
        decision: '算法启动：空树特判',
        action: 'entry',
        phase: 'init',
        message: '传入二叉树根节点为空 (null)，启动边界条件检验。',
        log: 'findBottomLeftValue(root = null)',
        codeLine: lines.entry,
        stageId: 'stage-1',
        metrics: { '当前节点': 'null', '当前最大深度': '-', '左下角值': '-', cur: '-', depth: '0', 'max-depth': '-', result: '?' },
        statusBadge: { text: '空树: 无节点', type: 'info' },
        callTrace: trace.snapshot(),
      });
      steps.push({
        tree: null,
        current: null,
        depth: 0,
        maxDepth: -1,
        bottomLeft: null,
        decision: '空节点基准退出：返回 0',
        action: 'base-null',
        phase: 'check',
        message: 'if (root == null) return 0。',
        log: 'root == null -> return 0',
        codeLine: lines.baseNull,
        stageId: 'stage-1',
        metrics: { '当前节点': 'null', '当前最大深度': '-', '左下角值': '-', cur: '-', depth: '0', 'max-depth': '-', result: '?' },
        statusBadge: { text: '基准退出', type: 'info' },
        callTrace: trace.snapshot(),
      });
      steps.push({
        tree: null,
        current: null,
        depth: 0,
        maxDepth: -1,
        bottomLeft: 0,
        decision: '计算完成：空树返回 0',
        action: 'done',
        phase: 'done',
        message: '空树不存在节点，返回默认值 0。',
        log: 'return 0',
        codeLine: lines.returnAns,
        stageId: 'stage-1',
        metrics: { '当前节点': 'null', '左下角值': 0, cur: '-', depth: '0', 'max-depth': '-', result: '0' },
        statusBadge: { text: '完成: 0', type: 'success' },
        callTrace: trace.snapshot(),
      });
      return steps;
    }

    trace.addHeader(`findBottomLeftValue(root: Node(${root.val}))`, 0, '<- 根调用开始');
    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      depth: 0,
      maxDepth: -1,
      bottomLeft: null,
      decision: `算法启动：准备从根节点 Node(${root.val}) 开始先序 DFS 搜索`,
      action: 'entry',
      phase: 'init',
      message: '核心原理：先序遍历遵循根->左->右，同深度首次被访问到的叶子必然是该层最靠左的节点！',
      log: `findBottomLeftValue(root: ${root.val})`,
      codeLine: lines.entry,
      stageId: 'stage-1',
      metrics: { '当前节点': `Node(${root.val})`, '当前最大深度': '-', '左下角值': '-', cur: String(root.val), depth: '0', 'max-depth': '-', result: '?' },
      statusBadge: { text: '启动先序DFS', type: 'info' },
      callTrace: trace.snapshot(),
    });

    trace.addConditionPass('初始化全局变量 maxDepth = -1, bottomLeft = 0', 0);
    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      depth: 0,
      maxDepth: -1,
      bottomLeft: null,
      decision: '初始化追踪变量：maxDepth = -1, bottomLeft = 0',
      action: 'init-vars',
      phase: 'init',
      message: '设置全局追踪变量：maxDepth 记录当前已达到的最大深度，bottomLeft 记录对应深度最左节点值。',
      log: 'maxDepth = -1, bottomLeft = 0',
      codeLine: lines.initVars,
      stageId: 'stage-1',
      metrics: { '当前节点': `Node(${root.val})`, '当前最大深度': '-1', '左下角值': '0', cur: String(root.val), depth: '0', 'max-depth': '-1', result: '0' },
      statusBadge: { text: '初始化追踪器', type: 'info' },
      callTrace: trace.snapshot(),
    });

    trace.addRecursePrep(`进入先序遍历: dfs(root: Node(${root.val}), depth = 0)`, 0, '从根节点开始深度标定');
    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      depth: 0,
      maxDepth: -1,
      bottomLeft: null,
      decision: `开始递归函数调用: dfs(root: Node(${root.val}), depth = 0)`,
      action: 'call-dfs',
      phase: 'call',
      message: '以根节点为起点，传入深度参数 depth = 0，开启树形拓扑先序扫描。',
      log: `dfs(node = ${root.val}, depth = 0)`,
      codeLine: lines.callDfs,
      stageId: 'stage-1',
      metrics: { '当前节点': `Node(${root.val})`, '当前深度': 0, '当前最大深度': '-1', cur: String(root.val), depth: '0', 'max-depth': '-1', result: '0' },
      statusBadge: { text: '调用 dfs(root, 0)', type: 'info' },
      callTrace: trace.snapshot(),
    });

    const visitedSet = new Set<number>();

    function dfs(node: TreeNode, depth: number): void {
      visitedSet.add(node.val);
      trace.addHeader(`dfs(Node(${node.val}), depth: ${depth})`, depth, `<- 深度 ${depth}`);

      steps.push({
        tree: cloneStateDepTree(root),
        current: node.val,
        depth,
        maxDepth,
        bottomLeft,
        secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
        decision: `访问节点 Node(${node.val})，当前深度为 ${depth}`,
        action: 'visit-node',
        phase: 'visit',
        message: `进入递归栈帧：正处于节点 Node(${node.val})，深度为 ${depth}。`,
        log: `dfs: Node(${node.val}), depth=${depth}`,
        codeLine: lines.dfsEntry,
        stageId: 'stage-1',
        visitedNodes: Array.from(visitedSet),
        metrics: {
          '当前节点': `Node(${node.val})`,
          '当前深度': depth,
          '当前最大深度': maxDepth >= 0 ? maxDepth : '-',
          '当前左下角值': bottomLeft != null ? bottomLeft : '-',
          cur: String(node.val),
          depth: String(depth),
          'max-depth': maxDepth >= 0 ? String(maxDepth) : '-',
          result: bottomLeft != null ? String(bottomLeft) : '?',
        },
        statusBadge: { text: `进入 Node(${node.val})`, type: 'info' },
        callTrace: trace.snapshot(),
      });

      const isLeaf = !node.left && !node.right;
      if (isLeaf) {
        trace.addConditionHit(`Node(${node.val}) 是叶子节点 (left == null && right == null)`, depth);
        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          maxDepth,
          bottomLeft,
          secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
          decision: `判定为叶子节点: Node(${node.val}) 无左右孩子`,
          action: 'leaf-check',
          phase: 'check',
          message: '左右孩子均为空，确认为叶子节点。校验当前深度是否刷新了已知最深纪录。',
          log: `isLeaf = true: Node(${node.val})`,
          codeLine: lines.checkLeaf,
          stageId: 'stage-1',
          visitedNodes: Array.from(visitedSet),
          metrics: {
            '当前节点': `Node(${node.val})`,
            '节点类型': '叶子节点',
            '当前深度': depth,
            '当前最大深度': maxDepth >= 0 ? maxDepth : '-',
            cur: String(node.val),
            depth: String(depth),
            'max-depth': maxDepth >= 0 ? String(maxDepth) : '-',
            result: bottomLeft != null ? String(bottomLeft) : '?',
          },
          statusBadge: { text: '命中叶子节点', type: 'info' },
          callTrace: trace.snapshot(),
        });

        if (depth > maxDepth) {
          maxDepth = depth;
          bottomLeft = node.val;
          trace.addConditionHit(`depth (${depth}) > maxDepth (${maxDepth}) √ 首次抵达更深层，锁定左下角: ${node.val}`, depth);
          steps.push({
            tree: cloneStateDepTree(root),
            current: node.val,
            depth,
            maxDepth,
            bottomLeft,
            secondaryHighlightedNodes: [bottomLeft],
            decision: `🎉 攻入新最深层！锁定该层先登左下角值: Node(${node.val}) (深度 ${depth})`,
            action: 'update-ans',
            phase: 'update',
            message: `由于先序遍历先左后右，深度 ${depth} 首个碰到的叶子 Node(${node.val}) 必然是该层最靠左的节点！刷新 bottomLeft = ${node.val}。`,
            log: `update: maxDepth=${maxDepth}, bottomLeft=${bottomLeft}`,
            codeLine: lines.updateAns,
            stageId: 'stage-1',
            visitedNodes: Array.from(visitedSet),
            metrics: {
              '当前节点': `Node(${node.val})`,
              '当前深度': depth,
              '最新最深层': maxDepth,
              '当前左下角值': bottomLeft,
              cur: String(node.val),
              depth: String(depth),
              'max-depth': String(maxDepth),
              result: String(bottomLeft),
            },
            statusBadge: { text: `刷新左下角: ${bottomLeft}`, type: 'success' },
            callTrace: trace.snapshot(),
          });
        } else {
          trace.addConditionPass(`depth (${depth}) <= maxDepth (${maxDepth}) × 未超越已知最深层，保持原值: ${bottomLeft}`, depth);
        }

        trace.addReturnLeaf(`叶子 Node(${node.val}) 处理完成 -> return`, depth);
        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          maxDepth,
          bottomLeft,
          secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
          decision: `叶子节点 Node(${node.val}) 处理完毕，递归 return 返回上一层`,
          action: 'leaf-return',
          phase: 'unwind',
          message: '叶子已无子树，执行 return 弹出当前递归栈帧。',
          log: `leaf return`,
          codeLine: lines.leafReturn,
          stageId: 'stage-1',
          visitedNodes: Array.from(visitedSet),
          metrics: {
            '当前节点': `Node(${node.val})`,
            '处理状态': '叶子返回',
            '当前左下角值': bottomLeft != null ? bottomLeft : '-',
            cur: String(node.val),
            depth: String(depth),
            'max-depth': String(maxDepth),
            result: String(bottomLeft),
          },
          statusBadge: { text: '叶子递归返回', type: 'info' },
          callTrace: trace.snapshot(),
        });
        return;
      }

      if (node.left) {
        trace.addRecursePrep(`递归探索左孩子 Node(${node.left.val})`, depth, `depth = ${depth + 1}`);
        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          maxDepth,
          bottomLeft,
          secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
          decision: `优先向左下探：准备递归访问左孩子 Node(${node.left.val})`,
          action: 'recurse-left',
          phase: 'recurse',
          message: `node.left != null，调用 dfs(node.left, depth + 1 = ${depth + 1})。优先左探确保同一深度最左侧节点率先被捕获。`,
          log: `recurse left: dfs(node=${node.left.val})`,
          codeLine: lines.recurseLeft,
          stageId: 'stage-1',
          visitedNodes: Array.from(visitedSet),
          metrics: {
            '当前节点': `Node(${node.val})`,
            '下探分支': `左孩子 Node(${node.left.val})`,
            '当前左下角值': bottomLeft != null ? bottomLeft : '-',
            cur: String(node.val),
            depth: String(depth),
            'max-depth': maxDepth >= 0 ? String(maxDepth) : '-',
            result: bottomLeft != null ? String(bottomLeft) : '?',
          },
          statusBadge: { text: '优先下探左子树', type: 'info' },
          callTrace: trace.snapshot(),
        });
        dfs(node.left, depth + 1);
        trace.addUnwindCalc(`左孩子 Node(${node.left.val}) 探索完毕，返回至 Node(${node.val})`, depth);
      }

      if (node.right) {
        trace.addRecursePrep(`递归探索右孩子 Node(${node.right.val})`, depth, `depth = ${depth + 1}`);
        steps.push({
          tree: cloneStateDepTree(root),
          current: node.val,
          depth,
          maxDepth,
          bottomLeft,
          secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
          decision: `向右下探：准备递归访问右孩子 Node(${node.right.val})`,
          action: 'recurse-right',
          phase: 'recurse',
          message: `node.right != null，调用 dfs(node.right, depth + 1 = ${depth + 1})。`,
          log: `recurse right: dfs(node=${node.right.val})`,
          codeLine: lines.recurseRight,
          stageId: 'stage-1',
          visitedNodes: Array.from(visitedSet),
          metrics: {
            '当前节点': `Node(${node.val})`,
            '下探分支': `右孩子 Node(${node.right.val})`,
            '当前左下角值': bottomLeft != null ? bottomLeft : '-',
            cur: String(node.val),
            depth: String(depth),
            'max-depth': maxDepth >= 0 ? String(maxDepth) : '-',
            result: bottomLeft != null ? String(bottomLeft) : '?',
          },
          statusBadge: { text: '下探右子树', type: 'info' },
          callTrace: trace.snapshot(),
        });
        dfs(node.right, depth + 1);
        trace.addUnwindCalc(`右孩子 Node(${node.right.val}) 探索完毕，返回至 Node(${node.val})`, depth);
      }
    }

    dfs(root, 0);

    const allTreeVals = collectTreeValues(root);
    trace.addFinalResult(`DFS 全部回溯完成，最深层为 ${maxDepth}，左下角值为 ${bottomLeft}`, 0, undefined, bottomLeft!);
    steps.push({
      tree: cloneStateDepTree(root),
      current: root ? root.val : null,
      depth: maxDepth,
      maxDepth,
      bottomLeft,
      visitedNodes: allTreeVals,
      secondaryHighlightedNodes: bottomLeft != null ? [bottomLeft] : [],
      decision: `🎉 先序 DFS 搜索完毕！树最深层 ${maxDepth} 最先访问的左下角值为 Node(${bottomLeft})`,
      action: 'done',
      phase: 'done',
      message: `遍历全树结束，最深层首次被碰到的叶子节点值为 ${bottomLeft}，执行 return bottomLeft 返回结果！`,
      log: `Search complete -> return bottomLeft = ${bottomLeft}`,
      codeLine: lines.done,
      stageId: 'stage-1',
      metrics: {
        '最终左下角值': bottomLeft ?? '-',
        '最大探索深度': maxDepth,
        '全树节点总数': allTreeVals.length,
        cur: bottomLeft != null ? String(bottomLeft) : '-',
        depth: String(maxDepth),
        'max-depth': String(maxDepth),
        result: bottomLeft != null ? String(bottomLeft) : '-',
      },
      statusBadge: { text: `最终结果: ${bottomLeft}`, type: 'success' },
      callTrace: trace.snapshot(),
    });

    return steps;
  }

  /**
   * Stage 2: 标准层序 BFS 队列与层首捕获 (Standard Level-Order BFS)
   */
  public static compileStage2BfsSteps(root: TreeNode | null): BottomLeftStep[] {
    const steps: BottomLeftStep[] = [];
    const lines = BOTTOM_LEFT_STAGE2_LINES;

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        depth: 0,
        maxDepth: 0,
        bottomLeft: null,
        decision: '算法启动：空树特判',
        action: 'entry',
        message: '传入二叉树为空，启动判空防御。',
        log: 'findBottomLeftValue(root = null)',
        codeLine: lines.entry,
        stageId: 'stage-2',
        metrics: { '当前节点': 'null', '左下角值': 0 },
        statusBadge: { text: '空树: 0', type: 'info' },
      });
      steps.push({
        tree: null,
        current: null,
        depth: 0,
        maxDepth: 0,
        bottomLeft: null,
        decision: '空树判空命中：返回 0',
        action: 'base-null',
        message: 'if (root == null) return 0。',
        log: 'root == null -> return 0',
        codeLine: lines.baseNull,
        stageId: 'stage-2',
        metrics: { '当前节点': 'null', '左下角值': 0 },
        statusBadge: { text: '基准退出', type: 'info' },
      });
      steps.push({
        tree: null,
        current: null,
        depth: 0,
        maxDepth: 0,
        bottomLeft: 0,
        decision: '计算完成：返回 0',
        action: 'done',
        message: '返回默认值 0。',
        log: 'return 0',
        codeLine: lines.returnAns,
        stageId: 'stage-2',
        metrics: { '当前节点': 'null', '左下角值': 0 },
        statusBadge: { text: '完成: 0', type: 'success' },
      });
      return steps;
    }

    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      depth: 0,
      maxDepth: 0,
      bottomLeft: root.val,
      decision: `算法启动：根节点 Node(${root.val}) 入队，初始化标准 BFS 搜索`,
      action: 'entry',
      message: '标准 BFS 队列按层遍历，每层第 1 个出队的节点 (i == 0) 即为该层的最左侧节点。',
      log: `BFS queue.offer(root: ${root.val})`,
      codeLine: lines.entry,
      stageId: 'stage-2',
      metrics: { '当前节点': `Node(${root.val})`, '当前左下角值': root.val },
      statusBadge: { text: '启动标准BFS', type: 'info' },
    });

    const queue: TreeNode[] = [root];
    let bottomLeft = root.val;
    let currentLevel = 0;
    const visitedSet = new Set<number>();

    while (queue.length > 0) {
      const levelSize = queue.length;

      steps.push({
        tree: cloneStateDepTree(root),
        current: queue[0].val,
        depth: currentLevel,
        maxDepth: currentLevel,
        bottomLeft,
        secondaryHighlightedNodes: [bottomLeft],
        decision: `锁定第 ${currentLevel} 层 (本层节点数: ${levelSize})，准备逐个出队`,
        action: 'layer-start',
        message: `开始处理第 ${currentLevel} 层，当前层共 ${levelSize} 个节点。`,
        log: `level ${currentLevel}: size = ${levelSize}`,
        codeLine: lines.initQueue,
        stageId: 'stage-2',
        visitedNodes: Array.from(visitedSet),
        queueState: queue.map((n) => n.val),
        metrics: { '当前层号': currentLevel, '本层宽度': levelSize, '当前左下角值': bottomLeft },
        statusBadge: { text: `处理第 ${currentLevel} 层`, type: 'info' },
      });

      for (let i = 0; i < levelSize; i++) {
        const cur = queue.shift()!;
        visitedSet.add(cur.val);

        if (i === 0) {
          bottomLeft = cur.val;
          steps.push({
            tree: cloneStateDepTree(root),
            current: cur.val,
            depth: currentLevel,
            maxDepth: currentLevel,
            bottomLeft,
            secondaryHighlightedNodes: [bottomLeft],
            decision: `🎯 捕获第 ${currentLevel} 层的层首节点: Node(${cur.val}) -> 暂定为当前左下角`,
            action: 'capture-left',
            message: `i == 0：Node(${cur.val}) 是第 ${currentLevel} 层从左到右第一个出队的节点，更新 bottomLeft = ${cur.val}。`,
            log: `level ${currentLevel} left-most = ${cur.val}`,
            codeLine: lines.captureFirst,
            stageId: 'stage-2',
            visitedNodes: Array.from(visitedSet),
            queueState: queue.map((n) => n.val),
            metrics: { '当前层号': currentLevel, '捕获层首': `Node(${cur.val})`, '最新左下角值': bottomLeft },
            statusBadge: { text: `捕获层首: ${cur.val}`, type: 'success' },
          });
        }

        steps.push({
          tree: cloneStateDepTree(root),
          current: cur.val,
          depth: currentLevel,
          maxDepth: currentLevel,
          bottomLeft,
          secondaryHighlightedNodes: [bottomLeft],
          decision: `出队节点 Node(${cur.val}) [${i + 1}/${levelSize}]，准备将其左右孩子入队`,
          action: 'poll-node',
          message: `从队列弹出节点 Node(${cur.val})，先将左孩子入队，再将右孩子入队。`,
          log: `poll: ${cur.val}`,
          codeLine: lines.pollNode,
          stageId: 'stage-2',
          visitedNodes: Array.from(visitedSet),
          queueState: queue.map((n) => n.val),
          metrics: { '出队节点': `Node(${cur.val})`, '当前左下角值': bottomLeft, '队列剩余': queue.length },
          statusBadge: { text: `出队: ${cur.val}`, type: 'info' },
        });

        if (cur.left) {
          queue.push(cur.left);
          steps.push({
            tree: cloneStateDepTree(root),
            current: cur.val,
            depth: currentLevel,
            maxDepth: currentLevel,
            bottomLeft,
            secondaryHighlightedNodes: [bottomLeft],
            decision: `Node(${cur.val}) 的左孩子 Node(${cur.left.val}) 入队`,
            action: 'push-left',
            message: `cur.left != null，将左孩子入队。`,
            log: `offer left: ${cur.left.val}`,
            codeLine: lines.pushLeft,
            stageId: 'stage-2',
            visitedNodes: Array.from(visitedSet),
            queueState: queue.map((n) => n.val),
            metrics: { '出队节点': `Node(${cur.val})`, '入队左孩子': `Node(${cur.left.val})`, '队列新长度': queue.length },
            statusBadge: { text: `入队左: ${cur.left.val}`, type: 'info' },
          });
        }

        if (cur.right) {
          queue.push(cur.right);
          steps.push({
            tree: cloneStateDepTree(root),
            current: cur.val,
            depth: currentLevel,
            maxDepth: currentLevel,
            bottomLeft,
            secondaryHighlightedNodes: [bottomLeft],
            decision: `Node(${cur.val}) 的右孩子 Node(${cur.right.val}) 入队`,
            action: 'push-right',
            message: `cur.right != null，将右孩子入队。`,
            log: `offer right: ${cur.right.val}`,
            codeLine: lines.pushRight,
            stageId: 'stage-2',
            visitedNodes: Array.from(visitedSet),
            queueState: queue.map((n) => n.val),
            metrics: { '出队节点': `Node(${cur.val})`, '入队右孩子': `Node(${cur.right.val})`, '队列新长度': queue.length },
            statusBadge: { text: `入队右: ${cur.right.val}`, type: 'info' },
          });
        }
      }

      currentLevel++;
    }

    const allTreeVals = collectTreeValues(root);
    steps.push({
      tree: cloneStateDepTree(root),
      current: root ? root.val : null,
      depth: currentLevel - 1,
      maxDepth: currentLevel - 1,
      bottomLeft,
      visitedNodes: allTreeVals,
      secondaryHighlightedNodes: [bottomLeft],
      decision: `🎉 队列已排空，最后一层的首节点即为树左下角的值: Node(${bottomLeft})`,
      action: 'done',
      message: `BFS 遍历结束，最后一层第 1 个出队的节点为 ${bottomLeft}，执行 return bottomLeft！`,
      log: `BFS complete -> return ${bottomLeft}`,
      codeLine: lines.returnAns,
      stageId: 'stage-2',
      metrics: { '最终左下角值': bottomLeft, '整树层数': currentLevel, '总节点数': allTreeVals.length },
      statusBadge: { text: `最终结果: ${bottomLeft}`, type: 'success' },
    });

    return steps;
  }

  /**
   * Stage 3: 逆向右先层序 BFS (Reverse Right-to-Left BFS · 最优解)
   */
  public static compileStage3ReverseBfsSteps(root: TreeNode | null): BottomLeftStep[] {
    const steps: BottomLeftStep[] = [];
    const lines = BOTTOM_LEFT_STAGE3_LINES;

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        depth: 0,
        maxDepth: 0,
        bottomLeft: null,
        decision: '算法启动：空树特判',
        action: 'entry',
        message: '传入二叉树为空，启动判空防御。',
        log: 'findBottomLeftValue(root = null)',
        codeLine: lines.entry,
        stageId: 'stage-3',
        metrics: { '当前节点': 'null', '左下角值': 0 },
        statusBadge: { text: '空树: 0', type: 'info' },
      });
      steps.push({
        tree: null,
        current: null,
        depth: 0,
        maxDepth: 0,
        bottomLeft: null,
        decision: '空树判空命中：返回 0',
        action: 'base-null',
        message: 'if (root == null) return 0。',
        log: 'root == null -> return 0',
        codeLine: lines.baseNull,
        stageId: 'stage-3',
        metrics: { '当前节点': 'null', '左下角值': 0 },
        statusBadge: { text: '基准退出', type: 'info' },
      });
      steps.push({
        tree: null,
        current: null,
        depth: 0,
        maxDepth: 0,
        bottomLeft: 0,
        decision: '计算完成：返回 0',
        action: 'done',
        message: '返回默认值 0。',
        log: 'return 0',
        codeLine: lines.returnAns,
        stageId: 'stage-3',
        metrics: { '当前节点': 'null', '左下角值': 0 },
        statusBadge: { text: '完成: 0', type: 'success' },
      });
      return steps;
    }

    steps.push({
      tree: cloneStateDepTree(root),
      current: root.val,
      depth: 0,
      maxDepth: 0,
      bottomLeft: root.val,
      decision: `算法启动：根节点 Node(${root.val}) 入队，初始化逆向 BFS`,
      action: 'entry',
      message: '神级技巧：先入右孩子后入左孩子，层序遍历变为从右往左扫，全树最后一个出队的节点必为最底最左节点！',
      log: `Reverse BFS queue.offer(root: ${root.val})`,
      codeLine: lines.entry,
      stageId: 'stage-3',
      metrics: { '当前节点': `Node(${root.val})`, '遍历模式': '右先逆向 BFS' },
      statusBadge: { text: '启动逆向BFS', type: 'info' },
    });

    const queue: TreeNode[] = [root];
    let lastPolled = root;
    const visitedSet = new Set<number>();
    let stepCount = 0;

    while (queue.length > 0) {
      stepCount++;
      const cur = queue.shift()!;
      lastPolled = cur;
      visitedSet.add(cur.val);

      steps.push({
        tree: cloneStateDepTree(root),
        current: cur.val,
        depth: 0,
        maxDepth: 0,
        bottomLeft: cur.val,
        secondaryHighlightedNodes: [cur.val],
        decision: `出队节点 Node(${cur.val}) (当前候选答案: ${cur.val})`,
        action: 'poll-node',
        message: `从队列头部弹出节点 Node(${cur.val})。随着逆向遍历推进，最后一个出队的节点即为终极答案。`,
        log: `cur = queue.poll() -> Node(${cur.val})`,
        codeLine: lines.pollCur,
        stageId: 'stage-3',
        visitedNodes: Array.from(visitedSet),
        queueState: queue.map((n) => n.val),
        metrics: { '出队节点': `Node(${cur.val})`, '队列长度': queue.length, '当前候选': cur.val },
        statusBadge: { text: `出队: ${cur.val}`, type: 'info' },
      });

      if (cur.right) {
        queue.push(cur.right);
        steps.push({
          tree: cloneStateDepTree(root),
          current: cur.val,
          depth: 0,
          maxDepth: 0,
          bottomLeft: cur.val,
          secondaryHighlightedNodes: [cur.val],
          decision: `优先将右孩子 Node(${cur.right.val}) 入队 (逆向精髓)`,
          action: 'push-right-first',
          message: `cur.right != null，先将右孩子入队！确保右侧分支先被排空。`,
          log: `offer right: ${cur.right.val}`,
          codeLine: lines.pushRightFirst,
          stageId: 'stage-3',
          visitedNodes: Array.from(visitedSet),
          queueState: queue.map((n) => n.val),
          metrics: { '出队节点': `Node(${cur.val})`, '先入右孩子': `Node(${cur.right.val})`, '队列新长度': queue.length },
          statusBadge: { text: `优先入右: ${cur.right.val}`, type: 'info' },
        });
      }

      if (cur.left) {
        queue.push(cur.left);
        steps.push({
          tree: cloneStateDepTree(root),
          current: cur.val,
          depth: 0,
          maxDepth: 0,
          bottomLeft: cur.val,
          secondaryHighlightedNodes: [cur.val],
          decision: `后将左孩子 Node(${cur.left.val}) 入队`,
          action: 'push-left-second',
          message: `cur.left != null，后将左孩子入队。左侧节点将留到最后出队。`,
          log: `offer left: ${cur.left.val}`,
          codeLine: lines.pushLeftSecond,
          stageId: 'stage-3',
          visitedNodes: Array.from(visitedSet),
          queueState: queue.map((n) => n.val),
          metrics: { '出队节点': `Node(${cur.val})`, '后入左孩子': `Node(${cur.left.val})`, '队列新长度': queue.length },
          statusBadge: { text: `后入左: ${cur.left.val}`, type: 'info' },
        });
      }
    }

    const allTreeVals = collectTreeValues(root);
    steps.push({
      tree: cloneStateDepTree(root),
      current: root ? root.val : null,
      depth: 0,
      maxDepth: 0,
      bottomLeft: lastPolled.val,
      visitedNodes: allTreeVals,
      secondaryHighlightedNodes: [lastPolled.val],
      decision: `🎉 逆向 BFS 遍历结束！全树最后一个出队的节点即为答案: Node(${lastPolled.val})`,
      action: 'done',
      message: `队列已完全排空！最后一个出队的节点为 Node(${lastPolled.val})，执行 return cur.val (${lastPolled.val})！无需任何层级统计或全局变量！`,
      log: `Reverse BFS complete -> return ${lastPolled.val}`,
      codeLine: lines.returnAns,
      stageId: 'stage-3',
      metrics: { '最终左下角值': lastPolled.val, '总出队步数': stepCount, '总节点数': allTreeVals.length },
      statusBadge: { text: `终极答案: ${lastPolled.val}`, type: 'success' },
    });

    return steps;
  }

  /**
   * 默认推演入口
   */
  public static compileSteps(root: TreeNode | null): BottomLeftStep[] {
    return BottomLeftStepCompiler.compileStage1PreorderSteps(root);
  }
}
