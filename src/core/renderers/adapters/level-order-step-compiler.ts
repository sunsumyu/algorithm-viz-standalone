/**
 * 二叉树层序遍历通用步进编译器 (LevelOrderStepCompiler)
 * 深度模块 (Deep Module): 封装层序 BFS 队列逐层批处理、静态连续数组模拟队列、
 * 哈希表层级键值映射、以及前序 DFS 递归分层收集等四阶段多态推演
 * 遵循 Matt Pocock 深模块规范与 Strict One-Line-One-Step 步进契约
 */

import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import { HighlightTarget } from '../../step-visualizer';
import {
  LevelOrderCanvasAdapter,
  LevelOrderStaticQueueState,
  LevelOrderHashMapState,
} from './level-order-canvas-adapter';

export interface LevelOrderStep {
  tree: TreeNode | null;
  current: number | null;
  levelIndex: number;
  levelSize: number;
  queue: number[];
  currentLevel: number[];
  result: number[][];
  decision: string;
  action: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  scope?: Record<string, any>;
  metrics?: Record<string, string | number>;

  /** 辅助高亮节点 */
  secondaryNodes?: number[];
  visitedNodes?: number[];

  /** Stage 2 专属：静态数组队列状态 */
  staticQueueState?: LevelOrderStaticQueueState;

  /** Stage 3 专属：哈希表层级状态 */
  hashMapState?: LevelOrderHashMapState;

  /** Stage 4 专属：DFS 递归调用栈 */
  callStack?: string[];
  activeNodeId?: string;
  treeRoot?: any;
}

export interface DFSRecursionNode {
  id: string;
  label: string;
  children: DFSRecursionNode[];
  edgeLabel?: string;
  status?: 'active' | 'done' | 'pruned';
  tag?: string;
}

export class LevelOrderStepCompiler {
  /**
   * Stage 1: 标准 Queue 逐层批处理 (LeetCode 102 / Class 036 基准)
   */
  public static compileStandardQueueSteps(
    root: TreeNode | null,
    L: Record<string, HighlightTarget>
  ): LevelOrderStep[] {
    const steps: LevelOrderStep[] = [];
    const result: number[][] = [];

    // Step 0: 算法入口与空树边界特判
    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, root ? 1 : 0, 0),
      decision: '函数入口：检查根节点状态',
      action: 'init',
      message: root ? `接收到二叉树，根节点值为 ${root.val}，准备初始化层序队列。` : '空树，直接返回空列表 []。',
      log: root ? `levelOrder(root: ${root.val})` : 'levelOrder(root: null) -> []',
      codeLine: root ? L.entry : L.empty,
    });

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        levelIndex: 0,
        levelSize: 0,
        queue: [],
        currentLevel: [],
        result: [],
        metrics: LevelOrderCanvasAdapter.makeMetrics(0, 0, 0),
        decision: '特判返回：二叉树为空',
        action: 'done',
        message: '✅ 根节点为 null，层序遍历直接收敛返回 []。',
        log: 'if (root == null) -> true, return []',
        codeLine: L.empty,
      });
      return steps;
    }

    // Step 1: 根节点入队
    const queue: TreeNode[] = [root];
    steps.push({
      tree: root,
      current: root.val,
      levelIndex: 0,
      levelSize: 1,
      queue: [root.val],
      currentLevel: [],
      result: [],
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, 1, 0),
      decision: `根节点 ${root.val} 进队`,
      action: 'init',
      message: `初始化层序队列：将根节点 ${root.val} 压入队列头部，queue = [${root.val}]。`,
      log: `queue.offer(${root.val})`,
      codeLine: L.init,
    });

    let levelIdx = 0;

    while (queue.length > 0) {
      const size = queue.length;
      const currentLevel: number[] = [];
      const qSnapshot = queue.map((n) => n.val);

      // Step 2a: while 循环判定
      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: [...qSnapshot],
        currentLevel: [],
        result: result.map((l) => [...l]),
        metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, size, result.length),
        decision: `while (!queue.isEmpty()) 判定成立`,
        action: 'start-level',
        message: `检测到队列非空 (包含 ${size} 个节点)，进入本轮层序处理循环。`,
        log: `while (!queue.isEmpty()): true (size=${size})`,
        codeLine: L.whileCondition,
      });

      // Step 2b: 锁定当前层大小
      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: [...qSnapshot],
        currentLevel: [],
        result: result.map((l) => [...l]),
        metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, size, result.length),
        decision: `锁定第 ${levelIdx} 层规模 (int size = ${size})`,
        action: 'calc-size',
        message: `固定当前层大小 size = ${size}。即使后续子节点入队，本轮也仅处理这 ${size} 个节点。`,
        log: `int size = queue.size() -> ${size}`,
        codeLine: L.calcSize,
      });

      // Step 2c: 初始化当前层结果容器
      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: [...qSnapshot],
        currentLevel: [],
        result: result.map((l) => [...l]),
        metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, size, result.length),
        decision: `初始化第 ${levelIdx} 层列表: level = new ArrayList<>()`,
        action: 'init-level',
        message: `新建列表容器，准备按从左到右顺序收集本层 ${size} 个节点的数值。`,
        log: `List<Integer> level = new ArrayList<>()`,
        codeLine: L.initLevel,
      });

      for (let i = 0; i < size; i++) {
        // Step 3a: for 循环条件检查
        steps.push({
          tree: root,
          current: queue[0]?.val ?? null,
          levelIndex: levelIdx,
          levelSize: size,
          queue: queue.map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((l) => [...l]),
          metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length),
          decision: `for 循环: 检查 i=${i} < size=${size} (成立)`,
          action: 'for-loop-check',
          message: `内层计数器 i=${i} 小于本层总数 size=${size}，开始处理当前层第 ${i + 1} 个节点。`,
          log: `for (int i=${i}; i < ${size}; i++) -> true`,
          codeLine: L.forLoopCheck,
        });

        const node = queue.shift()!;

        // Step 3b: 弹出队头节点
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: queue.map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((l) => [...l]),
          metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length),
          decision: `节点 ${node.val} 出队: node = queue.poll()`,
          action: 'poll-node',
          message: `从队列弹出队头节点 ${node.val}。`,
          log: `node = queue.poll() -> ${node.val}`,
          codeLine: L.pollNode,
        });

        // Step 3c: 收集节点值
        currentLevel.push(node.val);
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: queue.map((n) => n.val),
          currentLevel: [...currentLevel],
          result: result.map((l) => [...l]),
          metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length),
          decision: `收录节点值: level.add(${node.val})`,
          action: 'collect-val',
          message: `将节点 ${node.val} 的值存入第 ${levelIdx} 层列表：[${currentLevel.join(', ')}]。`,
          log: `level.add(${node.val}) -> [${currentLevel.join(', ')}]`,
          codeLine: L.collectVal,
        });

        // Step 3d: 左右孩子检查与入队
        if (node.left) {
          queue.push(node.left);
          steps.push({
            tree: root,
            current: node.val,
            levelIndex: levelIdx,
            levelSize: size,
            queue: queue.map((n) => n.val),
            currentLevel: [...currentLevel],
            result: result.map((l) => [...l]),
            metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length),
            decision: `左孩子入队: queue.offer(${node.left.val})`,
            action: 'enqueue-left',
            message: `节点 ${node.val} 的左孩子 ${node.left.val} 压入队尾，成为下一层候选。`,
            log: `if (node.left != null) -> true, queue.offer(${node.left.val})`,
            codeLine: L.enqueueLeft,
          });
        } else {
          steps.push({
            tree: root,
            current: node.val,
            levelIndex: levelIdx,
            levelSize: size,
            queue: queue.map((n) => n.val),
            currentLevel: [...currentLevel],
            result: result.map((l) => [...l]),
            metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length),
            decision: `左孩子为空: if (node.left != null) 为假，跳过入队`,
            action: 'check-left-null',
            message: `节点 ${node.val} 没有左孩子 (null)，跳过入队。`,
            log: `if (node.left != null) -> false (null)`,
            codeLine: L.checkLeftChild,
          });
        }

        if (node.right) {
          queue.push(node.right);
          steps.push({
            tree: root,
            current: node.val,
            levelIndex: levelIdx,
            levelSize: size,
            queue: queue.map((n) => n.val),
            currentLevel: [...currentLevel],
            result: result.map((l) => [...l]),
            metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length),
            decision: `右孩子入队: queue.offer(${node.right.val})`,
            action: 'enqueue-right',
            message: `节点 ${node.val} 的右孩子 ${node.right.val} 压入队尾，成为下一层候选。`,
            log: `if (node.right != null) -> true, queue.offer(${node.right.val})`,
            codeLine: L.enqueueRight,
          });
        } else {
          steps.push({
            tree: root,
            current: node.val,
            levelIndex: levelIdx,
            levelSize: size,
            queue: queue.map((n) => n.val),
            currentLevel: [...currentLevel],
            result: result.map((l) => [...l]),
            metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length),
            decision: `右孩子为空: if (node.right != null) 为假，跳过入队`,
            action: 'check-right-null',
            message: `节点 ${node.val} 没有右孩子 (null)，跳过入队。`,
            log: `if (node.right != null) -> false (null)`,
            codeLine: L.checkRightChild,
          });
        }
      }

      // Step 4a: for 循环退出判定
      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: queue.map((n) => n.val),
        currentLevel: [...currentLevel],
        result: result.map((l) => [...l]),
        metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length),
        decision: `for 循环结束: i=${size} < size=${size} (为假退出)`,
        action: 'for-loop-exit',
        message: `当前层所有 ${size} 个节点已全部遍历完毕，退出内层 for 循环。`,
        log: `for (int i=${size}; i < ${size}; i++) -> false, 循环结束`,
        codeLine: L.forLoopExit,
      });

      result.push([...currentLevel]);

      // Step 4b: 当前层收集完毕
      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: queue.map((n) => n.val),
        currentLevel: [...currentLevel],
        result: result.map((l) => [...l]),
        metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, queue.length, result.length),
        decision: `第 ${levelIdx} 层收集完成: ans.add(level)`,
        action: 'end-level',
        message: `第 ${levelIdx} 层所有 ${size} 个节点已全部出队完成：[${currentLevel.join(', ')}]，追加至全局结果集 ans。`,
        log: `ans.add([${currentLevel.join(', ')}])`,
        codeLine: L.endLevel,
      });

      levelIdx++;
    }

    // Step 5: while 循环退出判定
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: result.map((l) => [...l]),
      metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, 0, result.length),
      decision: 'while (!queue.isEmpty()) 为假，队列为空退出循环',
      action: 'while-exit',
      message: 'BFS 队列已空，所有层级节点处理完毕，退出 while 循环。',
      log: 'while (!queue.isEmpty()) -> false (empty)',
      codeLine: L.whileExit,
    });

    // Step 6: 收敛返回最终结果
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: result.map((l) => [...l]),
      metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, 0, result.length),
      decision: '层序遍历全部完成',
      action: 'done',
      message: `🎉 层序遍历收敛结束！共收集 ${result.length} 层，返回最终二维数组: ${JSON.stringify(result)}。`,
      log: `return ans: ${JSON.stringify(result)}`,
      codeLine: L.done,
    });

    return steps;
  }

  /**
   * Stage 2: 静态连续数组模拟队列 (Class 036 招牌极致优化)
   */
  public static compileStaticArraySteps(
    root: TreeNode | null,
    L: Record<string, HighlightTarget>
  ): LevelOrderStep[] {
    const steps: LevelOrderStep[] = [];
    const result: number[][] = [];

    const staticArray: (TreeNode | null)[] = [];
    let l = 0;
    let r = 0;

    function getStaticQueueSnapshot(): LevelOrderStaticQueueState {
      return {
        array: staticArray.map((n) => (n ? n.val : null)),
        l,
        r,
        windowSize: r - l,
      };
    }

    // Step 0: 入口
    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l: 0, r: 0, size: 0 },
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, root ? 1 : 0, 0),
      decision: '入口：levelOrder(root) — 静态数组队列模式',
      action: 'main-entry',
      message: root
        ? `接收到二叉树，根节点为 ${root.val}。采用左神 Class 036 招牌静态数组模拟队列加速。`
        : '空树，直接返回空列表 []。',
      log: root ? `levelOrder(root: ${root.val})` : 'levelOrder(root: null) -> []',
      codeLine: root ? L.entry : L.guardEmpty,
    });

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        levelIndex: 0,
        levelSize: 0,
        queue: [],
        currentLevel: [],
        result: [],
        staticQueueState: getStaticQueueSnapshot(),
        scope: { l: 0, r: 0, size: 0 },
        metrics: LevelOrderCanvasAdapter.makeMetrics(0, 0, 0),
        decision: '空树特判返回',
        action: 'done',
        message: '✅ root 为空，直接返回 []。',
        log: 'if (root == null) -> true, return ans',
        codeLine: L.guardEmpty,
      });
      return steps;
    }

    // Step 1a: 双指针复位 l = r = 0
    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l: 0, r: 0, size: 0 },
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, 0, 0),
      decision: '重置静态数组指针: l = r = 0',
      action: 'init-pointers',
      message: '静态队列初始化：将头部读指针 l 与尾部写指针 r 重置为 0，建立空有效窗口 [0, 0)。',
      log: 'l = r = 0',
      codeLine: L.initPointers,
    });

    // Step 1b: 根节点写入队尾 queue[r++] = root
    staticArray[r++] = root;

    steps.push({
      tree: root,
      current: root.val,
      levelIndex: 0,
      levelSize: 1,
      queue: [root.val],
      currentLevel: [],
      result: [],
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l: 0, r: 1, size: 1 },
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, 1, 0),
      decision: `根节点压入静态数组: queue[0] = ${root.val}, r 变为 1`,
      action: 'init-static-queue',
      message: `将根节点写入 queue[0]，写指针 r 推进变为 1。当前有效窗口为 [0, 1)。`,
      log: `queue[r++] = root (${root.val}), l=0, r=1`,
      codeLine: L.initQueue,
    });

    let levelIdx = 0;

    while (l < r) {
      const size = r - l;
      const currentLevel: number[] = [];

      // Step 2a: while (l < r)
      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: staticArray.slice(l, r).map((n) => n!.val),
        currentLevel: [],
        result: result.map((x) => [...x]),
        staticQueueState: getStaticQueueSnapshot(),
        scope: { l, r, size },
        metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, size, result.length),
        decision: `while (l < r) 成立 [l=${l}, r=${r})，开始处理第 ${levelIdx} 层`,
        action: 'while-check',
        message: `读写指针尚未相遇 (l=${l} < r=${r})，静态队列内有待处理节点，进入本层循环。`,
        log: `while (l < r): ${l} < ${r} (true)`,
        codeLine: L.whileCondition,
      });

      // Step 2b: 锁定本层大小
      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: staticArray.slice(l, r).map((n) => n!.val),
        currentLevel: [],
        result: result.map((x) => [...x]),
        staticQueueState: getStaticQueueSnapshot(),
        scope: { l, r, size },
        metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, size, result.length),
        decision: `锁定本层大小: size = r - l = ${r} - ${l} = ${size}`,
        action: 'calc-size',
        message: `指针区间有效 [l=${l}, r=${r})，计算当前层节点总数 size = ${size}。准备在连续内存中推进 l 指针。`,
        log: `int size = r - l -> ${size}`,
        codeLine: L.calcSize,
      });

      // Step 2c: 初始化当前层结果容器
      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: staticArray.slice(l, r).map((n) => n!.val),
        currentLevel: [],
        result: result.map((x) => [...x]),
        staticQueueState: getStaticQueueSnapshot(),
        scope: { l, r, size },
        metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, size, result.length),
        decision: `初始化第 ${levelIdx} 层列表: list = new ArrayList<>()`,
        action: 'init-level',
        message: `为第 ${levelIdx} 层分配容器 list，准备按序收集本层节点数值。`,
        log: `List<Integer> list = new ArrayList<>()`,
        codeLine: L.initLevel,
      });

      for (let i = 0; i < size; i++) {
        // Step 3a: for 循环条件判定
        steps.push({
          tree: root,
          current: staticArray[l]?.val ?? null,
          levelIndex: levelIdx,
          levelSize: size,
          queue: staticArray.slice(l, r).map((n) => n!.val),
          currentLevel: [...currentLevel],
          result: result.map((x) => [...x]),
          staticQueueState: getStaticQueueSnapshot(),
          scope: { l, r, size, i },
          metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, r - l, result.length),
          decision: `for 循环: 检查 i=${i} < size=${size} (成立)`,
          action: 'for-loop-check',
          message: `内层计数器 i=${i} 小于本层总数 size=${size}，开始处理当前层的第 ${i + 1} 个节点。`,
          log: `for (int i=${i}; i < ${size}; i++) -> true`,
          codeLine: L.forLoopCheck,
        });

        // Step 3b: 出队
        const cur = staticArray[l++]!;
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: staticArray.slice(l, r).map((n) => n!.val),
          currentLevel: [...currentLevel],
          result: result.map((x) => [...x]),
          staticQueueState: getStaticQueueSnapshot(),
          scope: { l: l - 1, r, size, cur: cur.val, i },
          metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, r - l, result.length),
          decision: `出队: cur = queue[${l - 1}] (${cur.val})，l 推进到 ${l}`,
          action: 'poll-node',
          message: `从连续内存槽位 [${l - 1}] 读取节点 ${cur.val}，读指针 l 向前滑动至 ${l}。`,
          log: `cur = queue[${l - 1}] (${cur.val}), l=${l}`,
          codeLine: L.pollNode,
        });

        // Step 3c: 收集数值
        currentLevel.push(cur.val);
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: levelIdx,
          levelSize: size,
          queue: staticArray.slice(l, r).map((n) => n!.val),
          currentLevel: [...currentLevel],
          result: result.map((x) => [...x]),
          staticQueueState: getStaticQueueSnapshot(),
          scope: { l, r, size, cur: cur.val, i },
          metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, r - l, result.length),
          decision: `收集数值: list.add(${cur.val})`,
          action: 'collect-val',
          message: `将节点 ${cur.val} 的值存入本层列表：[${currentLevel.join(', ')}]。`,
          log: `list.add(${cur.val}) -> [${currentLevel.join(', ')}]`,
          codeLine: L.collectVal,
        });

        // Step 3d: 左孩子
        if (cur.left) {
          staticArray[r++] = cur.left;
          steps.push({
            tree: root,
            current: cur.val,
            levelIndex: levelIdx,
            levelSize: size,
            queue: staticArray.slice(l, r).map((n) => n!.val),
            currentLevel: [...currentLevel],
            result: result.map((x) => [...x]),
            staticQueueState: getStaticQueueSnapshot(),
            scope: { l, r, size, cur: cur.val },
            metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, r - l, result.length),
            decision: `左孩子存在: if (cur.left != null) 成立，queue[${r - 1}] = ${cur.left.val}`,
            action: 'enqueue-left',
            message: `节点 ${cur.val} 的左孩子 ${cur.left.val} 写入槽位 [${r - 1}]，写指针 r 推进至 ${r}。`,
            log: `if (cur.left != null) -> true, queue[r++] = ${cur.left.val} (r=${r})`,
            codeLine: L.enqueueLeft,
          });
        } else {
          steps.push({
            tree: root,
            current: cur.val,
            levelIndex: levelIdx,
            levelSize: size,
            queue: staticArray.slice(l, r).map((n) => n!.val),
            currentLevel: [...currentLevel],
            result: result.map((x) => [...x]),
            staticQueueState: getStaticQueueSnapshot(),
            scope: { l, r, size, cur: cur.val },
            metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, r - l, result.length),
            decision: `左孩子为空: if (cur.left != null) 为假，跳过入队`,
            action: 'check-left-null',
            message: `节点 ${cur.val} 没有左孩子 (null)，跳过左孩子入队。`,
            log: `if (cur.left != null) -> false (null)`,
            codeLine: L.checkLeftChild,
          });
        }

        // Step 3e: 右孩子
        if (cur.right) {
          staticArray[r++] = cur.right;
          steps.push({
            tree: root,
            current: cur.val,
            levelIndex: levelIdx,
            levelSize: size,
            queue: staticArray.slice(l, r).map((n) => n!.val),
            currentLevel: [...currentLevel],
            result: result.map((x) => [...x]),
            staticQueueState: getStaticQueueSnapshot(),
            scope: { l, r, size, cur: cur.val },
            metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, r - l, result.length),
            decision: `右孩子存在: if (cur.right != null) 成立，queue[${r - 1}] = ${cur.right.val}`,
            action: 'enqueue-right',
            message: `节点 ${cur.val} 的右孩子 ${cur.right.val} 写入槽位 [${r - 1}]，写指针 r 推进至 ${r}。`,
            log: `if (cur.right != null) -> true, queue[r++] = ${cur.right.val} (r=${r})`,
            codeLine: L.enqueueRight,
          });
        } else {
          steps.push({
            tree: root,
            current: cur.val,
            levelIndex: levelIdx,
            levelSize: size,
            queue: staticArray.slice(l, r).map((n) => n!.val),
            currentLevel: [...currentLevel],
            result: result.map((x) => [...x]),
            staticQueueState: getStaticQueueSnapshot(),
            scope: { l, r, size, cur: cur.val },
            metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, r - l, result.length),
            decision: `右孩子为空: if (cur.right != null) 为假，跳过入队`,
            action: 'check-right-null',
            message: `节点 ${cur.val} 没有右孩子 (null)，跳过右孩子入队。`,
            log: `if (cur.right != null) -> false (null)`,
            codeLine: L.checkRightChild,
          });
        }
      }

      // Step 4a: for 循环结束
      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: staticArray.slice(l, r).map((n) => n!.val),
        currentLevel: [...currentLevel],
        result: result.map((x) => [...x]),
        staticQueueState: getStaticQueueSnapshot(),
        scope: { l, r, size, i: size },
        metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, r - l, result.length),
        decision: `for 循环结束: i=${size} < size=${size} (为假退出)`,
        action: 'for-loop-exit',
        message: `当前层所有 ${size} 个节点已全部遍历完毕，退出内层 for 循环。`,
        log: `for (int i=${size}; i < ${size}; i++) -> false, 循环结束`,
        codeLine: L.forLoopExit,
      });

      result.push([...currentLevel]);

      // Step 4b: 本层收集完成
      steps.push({
        tree: root,
        current: null,
        levelIndex: levelIdx,
        levelSize: size,
        queue: staticArray.slice(l, r).map((n) => n!.val),
        currentLevel: [...currentLevel],
        result: result.map((x) => [...x]),
        staticQueueState: getStaticQueueSnapshot(),
        scope: { l, r, size },
        metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, r - l, result.length),
        decision: `第 ${levelIdx} 层收集完成: ans.add(list)`,
        action: 'end-level',
        message: `第 ${levelIdx} 层收集完成：[${currentLevel.join(', ')}]，追加至全局结果集 ans。`,
        log: `ans.add([${currentLevel.join(', ')}])`,
        codeLine: L.endLevel,
      });

      levelIdx++;
    }

    // Step 5: while 退出
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: result.map((x) => [...x]),
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l, r, size: 0 },
      metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, 0, result.length),
      decision: `while (l < r) 退出判定: l=${l} < r=${r} 为假`,
      action: 'while-exit',
      message: `读写指针相遇 (l === r === ${l})，静态数组内已无未处理节点，退出 while 循环。`,
      log: `while (l < r): ${l} < ${r} -> false, 队列为空退出`,
      codeLine: L.whileExit,
    });

    // Final Step: 收敛完成
    steps.push({
      tree: root,
      current: null,
      levelIndex: levelIdx,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: result.map((x) => [...x]),
      staticQueueState: getStaticQueueSnapshot(),
      scope: { l, r, size: 0 },
      metrics: LevelOrderCanvasAdapter.makeMetrics(levelIdx, 0, result.length),
      decision: '静态数组层序遍历收敛完成',
      action: 'done',
      message: `🎉 静态数组模拟队列全部出队完毕 (l === r === ${l})！返回结果集: ${JSON.stringify(result)}。`,
      log: `return ans: ${JSON.stringify(result)}`,
      codeLine: L.done,
    });

    return steps;
  }

  /**
   * Stage 3: 哈希表辅助层级映射 (Class 036 基础对比 / 初学误区)
   */
  public static compileHashMapSteps(
    root: TreeNode | null,
    L: Record<string, HighlightTarget>
  ): LevelOrderStep[] {
    const steps: LevelOrderStep[] = [];
    const result: number[][] = [];

    const queue: TreeNode[] = [];
    const levels = new Map<TreeNode, number>();
    const mapEntries: { nodeVal: number; level: number }[] = [];

    function getHashMapSnapshot(
      currentQueriedNode?: number | null,
      currentQueriedLevel?: number | null
    ): LevelOrderHashMapState {
      return {
        entries: [...mapEntries],
        currentQueriedNode,
        currentQueriedLevel,
      };
    }

    // Step 0: 入口
    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      hashMapState: getHashMapSnapshot(),
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, root ? 1 : 0, 0),
      decision: '入口：levelOrder(root) — 哈希表辅助模式',
      action: 'main-entry',
      message: root
        ? `接收到二叉树，根节点为 ${root.val}。采用新手常见的 Queue + HashMap 记录层级映射。`
        : '空树，直接返回空列表 []。',
      log: root ? `levelOrder(root: ${root.val})` : 'levelOrder(root: null) -> []',
      codeLine: root ? L.entry : L.guardEmpty,
    });

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        levelIndex: 0,
        levelSize: 0,
        queue: [],
        currentLevel: [],
        result: [],
        hashMapState: getHashMapSnapshot(),
        metrics: LevelOrderCanvasAdapter.makeMetrics(0, 0, 0),
        decision: '空树特判返回',
        action: 'done',
        message: '✅ root 为空，直接返回 []。',
        log: 'if (root == null) -> true, return ans',
        codeLine: L.guardEmpty,
      });
      return steps;
    }

    // Step 1a: 根节点入队
    queue.push(root);
    steps.push({
      tree: root,
      current: root.val,
      levelIndex: 0,
      levelSize: 1,
      queue: [root.val],
      currentLevel: [],
      result: [],
      hashMapState: getHashMapSnapshot(),
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, 1, 0),
      decision: `根节点入队: queue.add(${root.val})`,
      action: 'init-queue',
      message: `将根节点 ${root.val} 压入队列头部，queue = [${root.val}]。`,
      log: `queue.add(${root.val})`,
      codeLine: L.initQueue,
    });

    // Step 1b: 记录根节点初始层级
    levels.set(root, 0);
    mapEntries.push({ nodeVal: root.val, level: 0 });

    steps.push({
      tree: root,
      current: root.val,
      levelIndex: 0,
      levelSize: 1,
      queue: [root.val],
      currentLevel: [],
      result: [],
      hashMapState: getHashMapSnapshot(root.val, 0),
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, 1, 0),
      decision: `记录根节点层级: levels.put(${root.val}, 0)`,
      action: 'init-map',
      message: `在哈希表中绑定根节点深度映射：${root.val} ➔ 0。`,
      log: `levels.put(${root.val}, 0)`,
      codeLine: L.initLevelMap,
    });

    while (queue.length > 0) {
      // Step 2: while 循环头检查
      steps.push({
        tree: root,
        current: null,
        levelIndex: 0,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(),
        metrics: LevelOrderCanvasAdapter.makeMetrics(result.length, queue.length, result.length),
        decision: `while (!queue.isEmpty()) 成立，队列尚余 ${queue.length} 个节点`,
        action: 'while-check',
        message: `队列非空，准备弹出一个节点并通过哈希表反查其层级。`,
        log: `while (!queue.isEmpty()): true (size=${queue.length})`,
        codeLine: L.whileCondition,
      });

      const cur = queue.shift()!;

      // Step 3: 出队
      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: 0,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(cur.val),
        metrics: LevelOrderCanvasAdapter.makeMetrics(result.length, queue.length, result.length),
        decision: `从队列弹出节点 cur = ${cur.val}`,
        action: 'poll-node',
        message: `弹出节点 ${cur.val}，接下来必须在哈希表中寻找其所属层级。`,
        log: `cur = queue.poll() -> ${cur.val}`,
        codeLine: L.pollNode,
      });

      // Step 4: 查哈希表获取 level
      const level = levels.get(cur)!;

      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(cur.val, level),
        metrics: LevelOrderCanvasAdapter.makeMetrics(level, queue.length, result.length),
        decision: `查表: int level = levels.get(${cur.val}) -> ${level}`,
        action: 'query-level',
        message: `从 HashMap 中命中节点 ${cur.val} 的层级为 ${level}。左神指出：每次出队都要查哈希表，效率显著逊色于按层快照！`,
        log: `levels.get(${cur.val}) -> ${level}`,
        codeLine: L.queryLevel,
      });

      // Step 5: 检查是否需要新建层
      if (result.length === level) {
        result.push([]);
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          levelSize: queue.length,
          queue: queue.map((n) => n.val),
          currentLevel: [],
          result: result.map((x) => [...x]),
          hashMapState: getHashMapSnapshot(cur.val, level),
          metrics: LevelOrderCanvasAdapter.makeMetrics(level, queue.length, result.length),
          decision: `ans.size() == ${level}，新建第 ${level} 层列表`,
          action: 'new-level',
          message: `结果集层数恰等于当前节点层级 ${level}，创建新的空列表准备收录。`,
          log: `ans.add(new ArrayList<>()) // 第 ${level} 层`,
          codeLine: L.checkNewLevel,
        });
      }

      // Step 6: 加入对应层
      result[level].push(cur.val);

      steps.push({
        tree: root,
        current: cur.val,
        levelIndex: level,
        levelSize: queue.length,
        queue: queue.map((n) => n.val),
        currentLevel: [...result[level]],
        result: result.map((x) => [...x]),
        hashMapState: getHashMapSnapshot(cur.val, level),
        metrics: LevelOrderCanvasAdapter.makeMetrics(level, queue.length, result.length),
        decision: `ans.get(${level}).add(${cur.val})`,
        action: 'add-val',
        message: `将节点 ${cur.val} 追加到第 ${level} 层列表，当前第 ${level} 层为 [${result[level].join(', ')}]。`,
        log: `ans.get(${level}).add(${cur.val})`,
        codeLine: L.addVal,
      });

      // Step 7: 左右孩子入队并写入 levels
      if (cur.left) {
        queue.push(cur.left);
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          levelSize: queue.length,
          queue: queue.map((n) => n.val),
          currentLevel: [...result[level]],
          result: result.map((x) => [...x]),
          hashMapState: getHashMapSnapshot(cur.left.val),
          metrics: LevelOrderCanvasAdapter.makeMetrics(level, queue.length, result.length),
          decision: `左孩子入队: queue.add(${cur.left.val})`,
          action: 'enqueue-left',
          message: `将左孩子 ${cur.left.val} 压入队列。`,
          log: `if (cur.left != null) -> true, queue.add(${cur.left.val})`,
          codeLine: L.enqueueLeft,
        });

        levels.set(cur.left, level + 1);
        mapEntries.push({ nodeVal: cur.left.val, level: level + 1 });
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          levelSize: queue.length,
          queue: queue.map((n) => n.val),
          currentLevel: [...result[level]],
          result: result.map((x) => [...x]),
          hashMapState: getHashMapSnapshot(cur.left.val, level + 1),
          metrics: LevelOrderCanvasAdapter.makeMetrics(level, queue.length, result.length),
          decision: `记录左孩子层级: levels.put(${cur.left.val}, ${level + 1})`,
          action: 'record-left-level',
          message: `在哈希表中追加记录左孩子映射: ${cur.left.val} ➔ ${level + 1}。`,
          log: `levels.put(${cur.left.val}, ${level + 1})`,
          codeLine: L.recordLeftLevel,
        });
      } else {
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          levelSize: queue.length,
          queue: queue.map((n) => n.val),
          currentLevel: [...result[level]],
          result: result.map((x) => [...x]),
          hashMapState: getHashMapSnapshot(cur.val, level),
          metrics: LevelOrderCanvasAdapter.makeMetrics(level, queue.length, result.length),
          decision: '左孩子为空: if (cur.left != null) 为假',
          action: 'check-left-null',
          message: `节点 ${cur.val} 没有左孩子 (null)，跳过入队。`,
          log: 'if (cur.left != null) -> false (null)',
          codeLine: L.checkLeftChild,
        });
      }

      if (cur.right) {
        queue.push(cur.right);
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          levelSize: queue.length,
          queue: queue.map((n) => n.val),
          currentLevel: [...result[level]],
          result: result.map((x) => [...x]),
          hashMapState: getHashMapSnapshot(cur.right.val),
          metrics: LevelOrderCanvasAdapter.makeMetrics(level, queue.length, result.length),
          decision: `右孩子入队: queue.add(${cur.right.val})`,
          action: 'enqueue-right',
          message: `将右孩子 ${cur.right.val} 压入队列。`,
          log: `if (cur.right != null) -> true, queue.add(${cur.right.val})`,
          codeLine: L.enqueueRight,
        });

        levels.set(cur.right, level + 1);
        mapEntries.push({ nodeVal: cur.right.val, level: level + 1 });
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          levelSize: queue.length,
          queue: queue.map((n) => n.val),
          currentLevel: [...result[level]],
          result: result.map((x) => [...x]),
          hashMapState: getHashMapSnapshot(cur.right.val, level + 1),
          metrics: LevelOrderCanvasAdapter.makeMetrics(level, queue.length, result.length),
          decision: `记录右孩子层级: levels.put(${cur.right.val}, ${level + 1})`,
          action: 'record-right-level',
          message: `在哈希表中追加记录右孩子映射: ${cur.right.val} ➔ ${level + 1}。`,
          log: `levels.put(${cur.right.val}, ${level + 1})`,
          codeLine: L.recordRightLevel,
        });
      } else {
        steps.push({
          tree: root,
          current: cur.val,
          levelIndex: level,
          levelSize: queue.length,
          queue: queue.map((n) => n.val),
          currentLevel: [...result[level]],
          result: result.map((x) => [...x]),
          hashMapState: getHashMapSnapshot(cur.val, level),
          metrics: LevelOrderCanvasAdapter.makeMetrics(level, queue.length, result.length),
          decision: '右孩子为空: if (cur.right != null) 为假',
          action: 'check-right-null',
          message: `节点 ${cur.val} 没有右孩子 (null)，跳过入队。`,
          log: 'if (cur.right != null) -> false (null)',
          codeLine: L.checkRightChild,
        });
      }
    }

    // Step 8: while 循环退出
    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: result.map((x) => [...x]),
      hashMapState: getHashMapSnapshot(),
      metrics: LevelOrderCanvasAdapter.makeMetrics(result.length, 0, result.length),
      decision: 'while (!queue.isEmpty()) 为假，队列为空退出循环',
      action: 'while-exit',
      message: '哈希表辅助队列已空，退出 while 循环。',
      log: 'while (!queue.isEmpty()) -> false (empty)',
      codeLine: L.whileExit,
    });

    // Final Step: 收尾完成
    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: result.map((x) => [...x]),
      hashMapState: getHashMapSnapshot(),
      metrics: LevelOrderCanvasAdapter.makeMetrics(result.length, 0, result.length),
      decision: '哈希表层序遍历完成',
      action: 'done',
      message: `🎉 遍历完成！哈希表共记录了 ${mapEntries.length} 次键值映射，返回二维结果集: ${JSON.stringify(result)}。`,
      log: `return ans: ${JSON.stringify(result)}`,
      codeLine: L.done,
    });

    return steps;
  }

  /**
   * Stage 4: 递归 DFS 分层收集
   */
  public static compileDfsSteps(
    root: TreeNode | null,
    L: Record<string, HighlightTarget>
  ): LevelOrderStep[] {
    const steps: LevelOrderStep[] = [];
    const result: number[][] = [];
    const callStack: string[] = [];

    let recursionTree: DFSRecursionNode | null = null;
    const nodeMap = new Map<string, DFSRecursionNode>();

    function getTreeSnapshot(): DFSRecursionNode | null {
      if (!recursionTree) return null;
      return JSON.parse(JSON.stringify(recursionTree));
    }

    // Step 0: 主函数入口
    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      callStack: [],
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, 0, 0),
      decision: '主函数入口：levelOrder(root)',
      action: 'main-entry',
      message: root
        ? `接收到二叉树，根节点值为 ${root.val}，准备通过递归 DFS 逐层收集节点。`
        : '空树，直接返回空列表 []。',
      log: root ? `levelOrder(root: ${root.val})` : 'levelOrder(root: null) -> []',
      codeLine: L.mainEntry,
    });

    if (!root) {
      steps.push({
        tree: null,
        current: null,
        levelIndex: 0,
        levelSize: 0,
        queue: [],
        currentLevel: [],
        result: [],
        callStack: [],
        metrics: LevelOrderCanvasAdapter.makeMetrics(0, 0, 0),
        decision: '空树直接返回',
        action: 'done',
        message: '✅ 根节点为 null，直接返回空列表 []。',
        log: 'return []',
        codeLine: L.returnRes,
      });
      return steps;
    }

    // Step 1: 初始化结果集
    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      callStack: [],
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, 0, 0),
      decision: '初始化结果集 res = []',
      action: 'init-res',
      message: '声明空的二维列表 res，准备按 depth 分层收集节点值。',
      log: 'List<List<Integer>> res = new ArrayList<>()',
      codeLine: L.initRes,
    });

    let callCounter = 0;

    function dfs(node: TreeNode | null, depth: number, parentId: string | null, direction: string): void {
      callCounter++;
      const callId = `call-${callCounter}`;
      const nodeLabel = node ? `${node.val}` : 'null';
      const stackEntry = `dfs(${nodeLabel}, ${depth})`;

      const treeNode: DFSRecursionNode = {
        id: callId,
        label: node ? `dfs(${node.val}, ${depth})` : `dfs(null, ${depth})`,
        children: [],
        edgeLabel: direction,
        status: 'active',
      };
      nodeMap.set(callId, treeNode);

      if (!recursionTree) {
        recursionTree = treeNode;
      } else if (parentId && nodeMap.has(parentId)) {
        nodeMap.get(parentId)!.children.push(treeNode);
      }

      callStack.push(stackEntry);

      // DFS 函数入口帧
      steps.push({
        tree: root,
        current: node?.val ?? null,
        levelIndex: depth,
        levelSize: 0,
        queue: [],
        currentLevel: [],
        result: result.map((l) => [...l]),
        callStack: [...callStack],
        activeNodeId: callId,
        treeRoot: getTreeSnapshot(),
        metrics: LevelOrderCanvasAdapter.makeMetrics(depth, callStack.length, result.length),
        decision: `📥 进入 dfs(node=${nodeLabel}, depth=${depth})`,
        action: 'dfs-entry',
        message: `递归进入 dfs(node=${nodeLabel}, depth=${depth})${direction ? `，来自父节点的${direction}` : ''}。`,
        log: `📥 进入 ${stackEntry} [调用 #${callCounter}]`,
        codeLine: L.dfsEntry,
      });

      // Null guard
      if (!node) {
        steps.push({
          tree: root,
          current: null,
          levelIndex: depth,
          levelSize: 0,
          queue: [],
          currentLevel: [],
          result: result.map((l) => [...l]),
          callStack: [...callStack],
          activeNodeId: callId,
          treeRoot: getTreeSnapshot(),
          metrics: LevelOrderCanvasAdapter.makeMetrics(depth, callStack.length, result.length),
          decision: `🛑 空节点拦截：node == null`,
          action: 'null-guard',
          message: `node 为 null，触发基底条件，立即返回。`,
          log: `🛑 null guard -> return`,
          codeLine: L.nullGuard,
        });

        treeNode.status = 'pruned';
        treeNode.tag = 'null';
        callStack.pop();
        return;
      }

      // Check if need to add new level
      if (depth === result.length) {
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: depth,
          levelSize: 0,
          queue: [],
          currentLevel: [],
          result: result.map((l) => [...l]),
          callStack: [...callStack],
          activeNodeId: callId,
          treeRoot: getTreeSnapshot(),
          metrics: LevelOrderCanvasAdapter.makeMetrics(depth, callStack.length, result.length),
          decision: `depth(${depth}) == res.size(${result.length})，需要创建新层`,
          action: 'depth-check-new',
          message: `当前深度 ${depth} 等于结果集层数 ${result.length}，说明首次到达该层，创建新的空列表。`,
          log: `if (depth == res.size()) -> true, 新建第 ${depth} 层`,
          codeLine: L.depthCheck,
        });

        result.push([]);

        steps.push({
          tree: root,
          current: node.val,
          levelIndex: depth,
          levelSize: 0,
          queue: [],
          currentLevel: [],
          result: result.map((l) => [...l]),
          callStack: [...callStack],
          activeNodeId: callId,
          treeRoot: getTreeSnapshot(),
          metrics: LevelOrderCanvasAdapter.makeMetrics(depth, callStack.length, result.length),
          decision: `创建第 ${depth} 层空列表`,
          action: 'new-level',
          message: `成功创建第 ${depth} 层：res = ${JSON.stringify(result)}。`,
          log: `res.add(new ArrayList<>()) // 第 ${depth} 层`,
          codeLine: L.newLevel,
        });
      } else {
        steps.push({
          tree: root,
          current: node.val,
          levelIndex: depth,
          levelSize: 0,
          queue: [],
          currentLevel: [],
          result: result.map((l) => [...l]),
          callStack: [...callStack],
          activeNodeId: callId,
          treeRoot: getTreeSnapshot(),
          metrics: LevelOrderCanvasAdapter.makeMetrics(depth, callStack.length, result.length),
          decision: `depth(${depth}) < res.size(${result.length})，第 ${depth} 层已存在`,
          action: 'depth-check-exist',
          message: `当前深度 ${depth} 小于结果集层数 ${result.length}，该层列表已存在，直接追加。`,
          log: `if (depth == res.size()) -> false, 第 ${depth} 层已存在`,
          codeLine: L.depthCheck,
        });
      }

      result[depth].push(node.val);

      steps.push({
        tree: root,
        current: node.val,
        levelIndex: depth,
        levelSize: 0,
        queue: [],
        currentLevel: [...result[depth]],
        result: result.map((l) => [...l]),
        callStack: [...callStack],
        activeNodeId: callId,
        treeRoot: getTreeSnapshot(),
        metrics: LevelOrderCanvasAdapter.makeMetrics(depth, callStack.length, result.length),
        decision: `节点 ${node.val} 装入第 ${depth} 层`,
        action: 'add-val',
        message: `将节点值 ${node.val} 追加到第 ${depth} 层列表：[${result[depth].join(', ')}]。`,
        log: `res.get(${depth}).add(${node.val}) -> [${result[depth].join(', ')}]`,
        codeLine: L.addVal,
      });

      const leftLabel = node.left ? `${node.left.val}` : 'null';
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: depth,
        levelSize: 0,
        queue: [],
        currentLevel: [...result[depth]],
        result: result.map((l) => [...l]),
        callStack: [...callStack],
        activeNodeId: callId,
        treeRoot: getTreeSnapshot(),
        metrics: LevelOrderCanvasAdapter.makeMetrics(depth, callStack.length, result.length),
        decision: `🌳 探索左子树 dfs(${leftLabel}, ${depth + 1})`,
        action: 'dfs-left-call',
        message: `从节点 ${node.val} 出发，递归探索左子树：dfs(node.left=${leftLabel}, depth=${depth + 1})。`,
        log: `⬇️ 调用 dfs(${leftLabel}, ${depth + 1}) // 左子树`,
        codeLine: L.dfsLeft,
      });

      dfs(node.left, depth + 1, callId, '左子树');

      const rightLabel = node.right ? `${node.right.val}` : 'null';
      steps.push({
        tree: root,
        current: node.val,
        levelIndex: depth,
        levelSize: 0,
        queue: [],
        currentLevel: [...result[depth]],
        result: result.map((l) => [...l]),
        callStack: [...callStack],
        activeNodeId: callId,
        treeRoot: getTreeSnapshot(),
        metrics: LevelOrderCanvasAdapter.makeMetrics(depth, callStack.length, result.length),
        decision: `🌳 探索右子树 dfs(${rightLabel}, ${depth + 1})`,
        action: 'dfs-right-call',
        message: `从节点 ${node.val} 出发，递归探索右子树：dfs(node.right=${rightLabel}, depth=${depth + 1})。`,
        log: `➡️ 调用 dfs(${rightLabel}, ${depth + 1}) // 右子树`,
        codeLine: L.dfsRight,
      });

      dfs(node.right, depth + 1, callId, '右子树');

      treeNode.status = 'done';
      treeNode.tag = `✓`;
      callStack.pop();
    }

    // Step 2: 启动 DFS
    steps.push({
      tree: root,
      current: root.val,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: [],
      callStack: [],
      metrics: LevelOrderCanvasAdapter.makeMetrics(0, 0, 0),
      decision: '调用 dfs(root, 0, res) 启动递归',
      action: 'call-dfs',
      message: `从根节点 ${root.val} 出发，以 depth=0 启动递归 DFS 分层收集。`,
      log: `dfs(root=${root.val}, 0, res)`,
      codeLine: L.callDfs,
    });

    dfs(root, 0, null, '');

    // Final: 收敛返回
    steps.push({
      tree: root,
      current: null,
      levelIndex: 0,
      levelSize: 0,
      queue: [],
      currentLevel: [],
      result: result.map((l) => [...l]),
      callStack: [],
      treeRoot: getTreeSnapshot(),
      metrics: LevelOrderCanvasAdapter.makeMetrics(result.length, 0, result.length),
      decision: '递归 DFS 遍历全部完成',
      action: 'done',
      message: `🎉 递归 DFS 层序收集完成！共收集 ${result.length} 层，返回最终二维数组: ${JSON.stringify(result)}。`,
      log: `return res: ${JSON.stringify(result)}`,
      codeLine: L.returnRes,
    });

    return steps;
  }
}
