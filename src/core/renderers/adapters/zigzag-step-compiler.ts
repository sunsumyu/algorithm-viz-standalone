/**
 * 二叉树锯齿形层序遍历通用步进编译器 (ZigzagStepCompiler)
 * 深度模块 (Deep Module): 封装锯齿形 BFS 双端队列、静态连续内存双向读指针、
 * 以及递归 DFS 深度奇偶映射等三阶段演进推演
 * 遵循 Matt Pocock 深模块规范与 Strict One-Line-One-Step 步进契约
 */

import { TreeNode, buildTreeFromArr as buildTree } from '../../../algorithms/categories/tree/tree-template';
import { parseTreeArray } from '../../input-primitives';
import { HighlightTarget } from '../../step-visualizer';
import {
  ZigzagCanvasAdapter,
  ZigzagStaticQueueState,
} from './zigzag-canvas-adapter';
import {
  ZIGZAG_STAGE1_LINES,
  ZIGZAG_STAGE2_STATIC_ARRAY_LINES,
  ZIGZAG_STAGE3_DFS_LINES,
} from '../../../algorithms/categories/tree/tree-036-037/zigzag-level-order-036-stage-codes';
import {
  TreeNode036,
  Tree036Step,
} from '../../../algorithms/categories/tree/tree-036-037/tree-036-037-shared';

export interface ZigzagStep {
  tree: TreeNode | null;
  current: number | null;
  levelIndex: number;
  levelSize: number;
  isReverse: boolean;
  queue: number[];
  currentLevel: number[];
  result: number[][];
  decision: string;
  action: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  statusBadge?: { text: string; type: 'info' | 'warning' | 'success' | 'danger' };

  /** 辅助高亮节点 */
  secondaryNodes?: number[];
  visitedNodes?: number[];

  /** Stage 2 专属：静态连续内存队列状态 */
  staticQueueState?: ZigzagStaticQueueState;

  /** Stage 3 专属：DFS 递归调用栈 */
  callStack?: string[];

  // Legacy Tree036Step 兼容
  activeNodeId?: number | null;
  secondaryNodeId?: number | null;
  extraData?: Record<string, any>;
}

const DEFAULT_TREE_NODES: TreeNode036[] = [
  { id: 1, val: 3, left: 2, right: 3 },
  { id: 2, val: 9, left: null, right: null },
  { id: 3, val: 20, left: 4, right: 5 },
  { id: 4, val: 15, left: null, right: null },
  { id: 5, val: 7, left: null, right: null },
];

export class ZigzagStepCompiler {
  /**
   * Stage 1: 标准双端队列 / isReverse 标志法 (Queue + Deque BFS)
   */
  public static compileQueueSteps(root: TreeNode | null): ZigzagStep[] {
    const steps: ZigzagStep[] = [];
    const result: number[][] = [];
    const L = ZIGZAG_STAGE1_LINES;

    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      isReverse: false,
      queue: [],
      currentLevel: [],
      result: [],
      metrics: ZigzagCanvasAdapter.makeMetrics(0, root ? 1 : 0, 0, false),
      decision: '算法启动：检查根节点状态',
      action: 'init',
      message: root
        ? `接收到二叉树，根节点为 ${root.val}。初始化 Queue 并设置方向标志 isReverse = false (首层从左到右)。`
        : '空树，直接返回空结果 []。',
      log: root ? `zigzagLevelOrder(root: ${root.val}), isReverse = false` : 'zigzagLevelOrder(root: null) -> []',
      codeLine: root ? L.entry : L.entry,
    });

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        levelIndex: 0,
        levelSize: 0,
        isReverse: false,
        queue: [],
        currentLevel: [],
        result: [],
        metrics: ZigzagCanvasAdapter.makeMetrics(0, 0, 0, false),
        decision: '特判返回：树为空',
        action: 'done',
        message: '✅ 树为空，直接收敛返回 []。',
        log: 'if (root == null) return []',
        codeLine: L.entry,
      });
      return steps;
    }

    const queue: TreeNode[] = [root];
    let isReverse = false;
    let levelIdx = 0;

    steps.push({
      tree: root,
      current: root.val,
      levelIndex: 0,
      levelSize: 1,
      isReverse: false,
      queue: [root.val],
      currentLevel: [],
      result: [],
      metrics: ZigzagCanvasAdapter.makeMetrics(0, 1, 0, false),
      decision: '根节点入队',
      action: 'offer',
      message: `根节点 ${root.val} 入队，初始方向为从左至右 (isReverse = false)。`,
      log: `queue.offer(${root.val})`,
      codeLine: L.initQueue,
    });

    while (queue.length > 0) {
      const size = queue.length;
      const currentLevel: number[] = [];
      levelIdx++;

      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        isReverse,
        queue: queue.map((n) => n.val),
        currentLevel: [],
        result: result.map((r) => [...r]),
        metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, size, result.length, isReverse),
        decision: `锁定第 ${levelIdx - 1} 层 (大小: ${size})，方向: ${isReverse ? '从右向左 ⬅️' : '从左向右 ➡️'}`,
        action: 'snapshot',
        message: `第 ${levelIdx - 1} 层固定含有 ${size} 个节点，收集方向: ${isReverse ? '【从右向左 (addFirst)】' : '【从左向右 (addLast)】'}。`,
        log: `while(!queue.isEmpty()): level=${levelIdx - 1}, size=${size}, isReverse=${isReverse}`,
        codeLine: L.loopLevel,
      });

      for (let i = 0; i < size; i++) {
        const cur = queue.shift()!;

        if (!isReverse) {
          currentLevel.push(cur.val);
        } else {
          currentLevel.unshift(cur.val);
        }

        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: levelIdx,
          levelSize: size,
          isReverse,
          queue: queue.map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((r) => [...r]),
          metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length, isReverse),
          decision: `弹出节点 ${cur.val} 并${isReverse ? '头插' : '尾插'}收集`,
          action: 'poll-collect',
          message: `从队列头部弹出节点 ${cur.val}，根据方向执行 ${isReverse ? 'addFirst(头插)' : 'addLast(尾插)'}，当前层内容: [${currentLevel.join(', ')}]。`,
          log: `${isReverse ? 'level.addFirst' : 'level.addLast'}(${cur.val})`,
          codeLine: isReverse ? L.collectAddFirst : L.collectAddLast,
        });

        if (cur.left) {
          queue.push(cur.left);
        }
        if (cur.right) {
          queue.push(cur.right);
        }

        if (cur.left || cur.right) {
          steps.push({
            tree: root,
            current: cur.val,
            levelIndex: levelIdx,
            levelSize: size,
            isReverse,
            queue: queue.map((n) => n.val),
            currentLevel: [...currentLevel],
            result: result.map((r) => [...r]),
            metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length, isReverse),
            decision: `节点 ${cur.val} 左右子节点正常入队`,
            action: 'push-children',
            message: `节点 ${cur.val} 的子节点${cur.left ? ` 左(${cur.left.val})` : ''}${cur.right ? ` 右(${cur.right.val})` : ''} 依然严格保持从左到右入队，下一层拓扑结构不受当前收集方向影响。`,
            log: `queue.offer children of ${cur.val}`,
            codeLine: L.pushChildren,
          });
        }
      }

      result.push([...currentLevel]);
      isReverse = !isReverse;

      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: 0,
        isReverse,
        queue: queue.map((n) => n.val),
        currentLevel: [],
        result: result.map((r) => [...r]),
        metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length, isReverse),
        decision: `第 ${levelIdx - 1} 层收集完成，反转方向`,
        action: 'toggle-reverse',
        message: `第 ${levelIdx - 1} 层完成: [${currentLevel.join(', ')}] 入账！翻转方向标志 isReverse 切换为 ${isReverse} (下一层为 ${isReverse ? '从右向左 ⬅️' : '从左向右 ➡️'})。`,
        log: `ans.add(level); isReverse = !isReverse -> ${isReverse}`,
        codeLine: L.reverseToggle,
      });
    }

    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: 0,
      isReverse,
      queue: [],
      currentLevel: [],
      result: result.map((r) => [...r]),
      metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, 0, result.length, isReverse),
      decision: '锯齿形层序遍历完成',
      action: 'done',
      message: `🎉 锯齿形层序遍历圆满完成！共收集 ${result.length} 层之字形结果: ${JSON.stringify(result)}。`,
      log: `return ans: ${JSON.stringify(result)}`,
      codeLine: L.returnAns,
    });

    return steps;
  }

  /**
   * Stage 2: 静态数组模拟队列 (Class 036 招牌双向读指针极致优化)
   */
  public static compileStaticArraySteps(root: TreeNode | null): ZigzagStep[] {
    const steps: ZigzagStep[] = [];
    const result: number[][] = [];
    const L = ZIGZAG_STAGE2_STATIC_ARRAY_LINES;

    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      isReverse: false,
      queue: [],
      currentLevel: [],
      result: [],
      staticQueueState: { array: [], l: 0, r: 0, windowSize: 0, isReverse: false },
      metrics: ZigzagCanvasAdapter.makeMetrics(0, root ? 1 : 0, 0, false),
      decision: '静态数组初始化：分配连续内存',
      action: 'init',
      message: root
        ? `左神 Class 036 极致优化：使用连续内存 queue[MAXN] 与双指针 l=0, r=0。直接在连续内存上根据方向双向读取！`
        : '空树特判，直接返回 []。',
      log: root ? `staticQueue: l=0, r=0, MAXN=2001` : 'root == null -> []',
      codeLine: L.entry,
    });

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        levelIndex: 0,
        levelSize: 0,
        isReverse: false,
        queue: [],
        currentLevel: [],
        result: [],
        staticQueueState: { array: [], l: 0, r: 0, windowSize: 0, isReverse: false },
        metrics: ZigzagCanvasAdapter.makeMetrics(0, 0, 0, false),
        decision: '特判返回：树为空',
        action: 'done',
        message: '✅ 树为空，直接收敛返回 []。',
        log: 'if (root == null) return []',
        codeLine: L.entry,
      });
      return steps;
    }

    const staticArray: TreeNode[] = [];
    let l = 0;
    let r = 0;
    staticArray[r++] = root;
    let isReverse = false;
    let levelIdx = 0;

    steps.push({
      tree: root,
      current: root.val,
      levelIndex: 0,
      levelSize: 1,
      isReverse: false,
      queue: [root.val],
      currentLevel: [],
      result: [],
      staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: 1, isReverse: false },
      metrics: ZigzagCanvasAdapter.makeMetrics(0, 1, 0, false),
      decision: '根节点写入连续内存 queue[0]',
      action: 'push-static',
      message: `根节点 ${root.val} 写入 queue[r++] (l=0, r=1)，零 GC 分配！`,
      log: `queue[r++] = root(val: ${root.val}), l=0, r=1`,
      codeLine: L.initPointers,
    });

    while (l < r) {
      const size = r - l;
      const currentLevel: number[] = [];
      levelIdx++;

      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        isReverse,
        queue: staticArray.slice(l, r).map((n) => n.val),
        currentLevel: [],
        result: result.map((arr) => [...arr]),
        staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: size, isReverse },
        metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, size, result.length, isReverse),
        decision: `第 ${levelIdx - 1} 层窗口锁定 [l=${l}, r=${r})，大小 ${size}`,
        action: 'lock-window',
        message: `连续内存窗口锁定 [${l}, ${r})，包含 ${size} 个节点。读取策略: ${isReverse ? '【逆序读取 i: r-1 ➔ l】' : '【顺序读取 i: l ➔ r-1】'}，无需额外 Deque！`,
        log: `while(l < r): l=${l}, r=${r}, size=${size}, isReverse=${isReverse}`,
        codeLine: L.loopLevel,
      });

      if (!isReverse) {
        for (let i = l; i < l + size; i++) {
          const val = staticArray[i].val;
          currentLevel.push(val);
          steps.push({
            tree: root,
            current: val,
            levelIndex: levelIdx,
            levelSize: size,
            isReverse,
            queue: staticArray.slice(l, r).map((n) => n.val),
            currentLevel: [...currentLevel],
            result: result.map((arr) => [...arr]),
            staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: size, isReverse, readingIndex: i },
            metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, size, result.length, isReverse),
            decision: `顺向读取 queue[${i}] = ${val}`,
            action: 'forward-read',
            message: `isReverse = false: 顺向指针移动到 index=${i}，直接读取数值 ${val} 加入当前层。`,
            log: `for(i=l..l+size): queue[${i}]=${val}`,
            codeLine: L.forwardCollect,
          });
        }
      } else {
        for (let i = l + size - 1; i >= l; i--) {
          const val = staticArray[i].val;
          currentLevel.push(val);
          steps.push({
            tree: root,
            current: val,
            levelIndex: levelIdx,
            levelSize: size,
            isReverse,
            queue: staticArray.slice(l, r).map((n) => n.val),
            currentLevel: [...currentLevel],
            result: result.map((arr) => [...arr]),
            staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: size, isReverse, readingIndex: i },
            metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, size, result.length, isReverse),
            decision: `逆向读取 queue[${i}] = ${val}`,
            action: 'backward-read',
            message: `isReverse = true: 逆向指针从末尾倒扫到 index=${i}，直接读取数值 ${val} 加入当前层（完全消除 Deque.addFirst 的数组搬移）！`,
            log: `for(i=l+size-1..l): queue[${i}]=${val}`,
            codeLine: L.backwardCollect,
          });
        }
      }

      for (let i = 0; i < size; i++) {
        const node = staticArray[l++];
        const pushLeft = node.left;
        const pushRight = node.right;

        if (pushLeft) {
          staticArray[r++] = pushLeft;
        }
        if (pushRight) {
          staticArray[r++] = pushRight;
        }

        if (pushLeft || pushRight) {
          steps.push({
            tree: root,
            current: node.val,
            levelIndex: levelIdx,
            levelSize: size,
            isReverse,
            queue: staticArray.slice(l, r).map((n) => n.val),
            currentLevel: [...currentLevel],
            result: result.map((arr) => [...arr]),
            staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l, isReverse },
            metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, r - l, result.length, isReverse),
            decision: `节点 ${node.val} 出窗 (l++), 子节点入连续内存 (r++)`,
            action: 'advance-pointers',
            message: `node = queue[l++] (${node.val}) 弹出窗口。子节点${pushLeft ? ` 左(${pushLeft.val})` : ''}${pushRight ? ` 右(${pushRight.val})` : ''} 写入末尾 queue[r++]，更新后 l=${l}, r=${r}。`,
            log: `l++ -> ${l}, r updated to ${r}`,
            codeLine: L.pushChildren,
          });
        }
      }

      result.push([...currentLevel]);
      isReverse = !isReverse;

      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: 0,
        isReverse,
        queue: staticArray.slice(l, r).map((n) => n.val),
        currentLevel: [],
        result: result.map((arr) => [...arr]),
        staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: r - l, isReverse },
        metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, r - l, result.length, isReverse),
        decision: `第 ${levelIdx - 1} 层收集完成，反转方向`,
        action: 'toggle-reverse',
        message: `第 ${levelIdx - 1} 层收集完成！翻转方向标志 isReverse = ${isReverse}。下一层窗口为 [${l}, ${r})。`,
        log: `ans.add(level); isReverse = !isReverse -> ${isReverse}`,
        codeLine: L.reverseToggle,
      });
    }

    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: 0,
      isReverse,
      queue: [],
      currentLevel: [],
      result: result.map((arr) => [...arr]),
      staticQueueState: { array: staticArray.map((n) => n?.val ?? null), l, r, windowSize: 0, isReverse },
      metrics: ZigzagCanvasAdapter.makeMetrics(levelIdx, 0, result.length, isReverse),
      decision: '静态数组锯齿形层序遍历完成',
      action: 'done',
      message: `🎉 静态数组模拟队列遍历完成！l=${l}, r=${r}，双指针完全闭合，共收集 ${result.length} 层: ${JSON.stringify(result)}。`,
      log: `return ans: ${JSON.stringify(result)}`,
      codeLine: L.returnAns,
    });

    return steps;
  }

  /**
   * Stage 3: 递归 DFS 深度映射分层收集 (Depth-Indexed DFS)
   */
  public static compileDfsSteps(root: TreeNode | null): ZigzagStep[] {
    const steps: ZigzagStep[] = [];
    const result: number[][] = [];
    const callStack: string[] = [];
    const L = ZIGZAG_STAGE3_DFS_LINES;

    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      isReverse: false,
      queue: [],
      currentLevel: [],
      result: [],
      callStack: ['dfs(root, 0, ans)'],
      metrics: ZigzagCanvasAdapter.makeMetrics(0, 0, 0, false),
      decision: 'DFS 递归分层启动：前序遍历深度映射',
      action: 'init',
      message: root
        ? `启动递归 DFS：通过函数参数 level 记录深度。当 level == ans.size() 时创建新层，偶数层尾插、奇数层头插！`
        : '空树特判，直接返回空结果 []。',
      log: root ? `dfs(root: ${root.val}, level: 0)` : 'dfs(root: null) -> []',
      codeLine: L.entry,
    });

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        levelIndex: 0,
        levelSize: 0,
        isReverse: false,
        queue: [],
        currentLevel: [],
        result: [],
        callStack: [],
        metrics: ZigzagCanvasAdapter.makeMetrics(0, 0, 0, false),
        decision: '特判返回：树为空',
        action: 'done',
        message: '✅ 树为空，直接收敛返回 []。',
        log: 'root == null -> return []',
        codeLine: L.entry,
      });
      return steps;
    }

    function dfs(node: TreeNode | null, level: number): void {
      if (!node) {
        steps.push({
          tree: root,
          current: null,
          levelIndex: level,
          levelSize: 0,
          isReverse: level % 2 === 1,
          queue: [],
          currentLevel: [],
          result: result.map((r) => [...r]),
          callStack: [...callStack, `dfs(null, ${level})`],
          metrics: ZigzagCanvasAdapter.makeMetrics(level, 0, result.length, level % 2 === 1),
          decision: `到达空节点 null，直接返回`,
          action: 'base-case',
          message: `node 为 null，触发递归基（Base Case），返回上一层调用栈。`,
          log: `dfs(null, ${level}) -> return`,
          codeLine: L.dfsBase,
        });
        return;
      }

      callStack.push(`dfs(${node.val}, L${level})`);

      if (level === result.length) {
        result.push([]);
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: level,
          levelSize: 1,
          isReverse: level % 2 === 1,
          queue: [],
          currentLevel: [],
          result: result.map((r) => [...r]),
          callStack: [...callStack],
          metrics: ZigzagCanvasAdapter.makeMetrics(level, 0, result.length, level % 2 === 1),
          decision: `发现第 ${level} 层首个节点，初始化新层`,
          action: 'new-layer',
          message: `level (${level}) == ans.size() (${result.length - 1})，创建第 ${level} 层列表。`,
          log: `ans.add(new LinkedList<>()); // level ${level}`,
          codeLine: L.newLevel,
        });
      }

      const isOdd = level % 2 === 1;
      if (!isOdd) {
        result[level].push(node.val);
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: level,
          levelSize: result[level].length,
          isReverse: false,
          queue: [],
          currentLevel: [...result[level]],
          result: result.map((r) => [...r]),
          callStack: [...callStack],
          metrics: ZigzagCanvasAdapter.makeMetrics(level, 0, result.length, false),
          decision: `偶数层 ${level} 顺序收集: 尾插 ${node.val}`,
          action: 'even-collect',
          message: `level ${level} 为偶数 (从左到右 ➡️)，执行 ans[${level}].addLast(${node.val})。当前层: [${result[level].join(', ')}]。`,
          log: `ans.get(${level}).addLast(${node.val})`,
          codeLine: L.evenCollect,
        });
      } else {
        result[level].unshift(node.val);
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: level,
          levelSize: result[level].length,
          isReverse: true,
          queue: [],
          currentLevel: [...result[level]],
          result: result.map((r) => [...r]),
          callStack: [...callStack],
          metrics: ZigzagCanvasAdapter.makeMetrics(level, 0, result.length, true),
          decision: `奇数层 ${level} 逆序收集: 头插 ${node.val}`,
          action: 'odd-collect',
          message: `level ${level} 为奇数 (从右向左 ⬅️)，执行 ans[${level}].addFirst(${node.val})。当前层: [${result[level].join(', ')}]。`,
          log: `ans.get(${level}).addFirst(${node.val})`,
          codeLine: L.oddCollect,
        });
      }

      if (node.left) {
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: level,
          levelSize: result[level].length,
          isReverse: isOdd,
          queue: [],
          currentLevel: [...result[level]],
          result: result.map((r) => [...r]),
          callStack: [...callStack],
          metrics: ZigzagCanvasAdapter.makeMetrics(level, 0, result.length, isOdd),
          decision: `递归探索左子树 ${node.left.val} (level + 1)`,
          action: 'recur-left',
          message: `深入节点 ${node.val} 的左子树 ${node.left.val}，深度参数递增为 level = ${level + 1}。`,
          log: `dfs(${node.left.val}, ${level + 1})`,
          codeLine: L.recurLeft,
        });
      }
      dfs(node.left, level + 1);

      if (node.right) {
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: level,
          levelSize: result[level].length,
          isReverse: isOdd,
          queue: [],
          currentLevel: [...result[level]],
          result: result.map((r) => [...r]),
          callStack: [...callStack],
          metrics: ZigzagCanvasAdapter.makeMetrics(level, 0, result.length, isOdd),
          decision: `递归探索右子树 ${node.right.val} (level + 1)`,
          action: 'recur-right',
          message: `深入节点 ${node.val} 的右子树 ${node.right.val}，深度参数递增为 level = ${level + 1}。`,
          log: `dfs(${node.right.val}, ${level + 1})`,
          codeLine: L.recurRight,
        });
      }
      dfs(node.right, level + 1);

      callStack.pop();
    }

    dfs(root, 0);

    steps.push({
      tree: root,
      current: null,
      levelIndex: result.length,
      levelSize: 0,
      isReverse: false,
      queue: [],
      currentLevel: [],
      result: result.map((r) => [...r]),
      callStack: [],
      metrics: ZigzagCanvasAdapter.makeMetrics(result.length, 0, result.length, false),
      decision: '递归 DFS 锯齿形层序遍历完成',
      action: 'done',
      message: `🎉 DFS 递归收集全部完成！递归深度自动映射出完整之字形结果: ${JSON.stringify(result)}。`,
      log: `return ans: ${JSON.stringify(result)}`,
      codeLine: L.returnAns,
    });

    return steps;
  }

  /**
   * 向后兼容单测推演契约 (tree-036-037.test.ts)
   */
  public static compileLegacySteps(treeRaw?: string): Tree036Step[] {
    const raw = treeRaw || '3, 9, 20, null, null, 15, 7';
    const arr = parseTreeArray(raw, [3, 9, 20, null, null, 15, 7]);
    const root = buildTree(arr);
    const modernSteps = ZigzagStepCompiler.compileQueueSteps(root);

    return modernSteps.map((s) => ({
      codeLine: s.codeLine as any,
      decision: s.decision,
      message: s.message,
      log: s.log,
      activeNodeId: s.current,
      queue: s.queue.filter((v): v is number => v !== null),
      metrics: s.metrics as any,
      statusBadge: s.decision.includes('完成')
        ? { text: '完成', type: 'success' }
        : { text: s.action, type: 'info' },
      extraData: { treeNodes: DEFAULT_TREE_NODES },
    }));
  }
}
