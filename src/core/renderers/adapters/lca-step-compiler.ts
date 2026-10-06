/**
 * 二叉树最近公共祖先 (Lowest Common Ancestor · LeetCode 236) 核心多阶段演化推演编译器
 *
 * 核心多阶段演化体系:
 *   Stage 1: 递归后序汇聚 (Recursive Postorder DFS · 左右子树汇聚返回)
 *   Stage 2: 父节点哈希表遍历 (Parent Pointer Hash Map · 回溯路径集合重合)
 *   Stage 3: 根到节点显式路径比对 (Root-to-Node Path Trace & Intersection · 分叉前夕判定)
 */

import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode } from '../../../algorithms/categories/tree/tree-template';
import {
  RecursiveCallTraceBuilder,
  RecursiveCallTraceSnapshot,
} from './recursive-call-trace-adapter';
import {
  LCA_STAGE1_LINES,
  LCA_STAGE2_LINES,
  LCA_STAGE3_LINES,
} from '../../../algorithms/categories/tree/lca-stage-codes';

export interface LCAStep {
  tree: TreeNode | null;
  current: number | null;
  p: number;
  q: number;
  leftReturn: number | null;
  rightReturn: number | null;
  lcaResult: number | null;
  decision: string;
  action: 'enter' | 'hit-target' | 'left-done' | 'right-done' | 'merge' | 'done' | 'explore' | 'trace-p' | 'trace-q' | 'compare';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, string | number>;
  stageId?: 'stage-1' | 'stage-2' | 'stage-3';

  /** Stage 1 递归调用推演栈 */
  callTrace?: RecursiveCallTraceSnapshot;

  // Stage 2 状态
  parentMap?: Record<number, number | null>;
  visitedAncestors?: number[];
  queueState?: number[];

  // Stage 3 状态
  pathP?: number[];
  pathQ?: number[];
  comparingIndex?: number;
}

export const LCA_CODE_LINES = LCA_STAGE1_LINES;

// ============================================================
// Stage 1: 递归后序汇聚 (Recursive Postorder DFS · LC 236)
// ============================================================
export function buildLCASteps(root: TreeNode | null, pVal: number, qVal: number): LCAStep[] {
  const steps: LCAStep[] = [];
  let foundLCA: number | null = null;
  const L = LCA_STAGE1_LINES;

  const trace = new RecursiveCallTraceBuilder();
  const rootText = root ? `${root.val}` : 'null';
  trace.addHeader(`lowestCommonAncestor(root: ${rootText}, p: ${pVal}, q: ${qVal})`, 0, '<- 根调用开始');

  // Step 0: 入口
  steps.push({
    tree: root,
    current: null,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: null,
    stageId: 'stage-1',
    decision: root
      ? `算法启动：lowestCommonAncestor(root: ${root.val}, p: ${pVal}, q: ${qVal})`
      : '算法启动：空树，直接返回 null',
    action: 'enter',
    message: root
      ? `寻找节点 p = ${pVal} 与 q = ${qVal} 的最近公共祖先，从根节点 ${root.val} 开始后序递归。`
      : '空树，直接返回 null。',
    log: root ? `lowestCommonAncestor(root: ${root.val}, p: ${pVal}, q: ${qVal})` : 'root is null -> null',
    codeLine: L.entry,
    metrics: { '当前节点': root ? `节点 ${root.val}` : '—', 'left 返回值': 'null', 'right 返回值': 'null', '当前捕获 LCA': '未捕获' },
    callTrace: trace.snapshot(),
  });

  if (!root) {
    trace.addConditionHit('① root == null -> true 命中! 返回 null', 0);
    trace.addReturnLeaf('return null', 0);
    trace.addFinalResult('最终结果: null', 0, undefined, 'null');
    steps.push({
      tree: null,
      current: null,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: null,
      stageId: 'stage-1',
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，无公共祖先，返回 null。',
      log: 'return null',
      codeLine: L.baseCheckHit,
      metrics: { '当前节点': '—', 'left 返回值': 'null', 'right 返回值': 'null', '当前捕获 LCA': 'null', '最终结果': 'null' },
      callTrace: trace.snapshot(),
    });
    return steps;
  }

  function postOrder(node: TreeNode | null, depth: number, role: string): number | null {
    if (depth > 0) {
      // 递归子调用入口帧 (Line 2)
      const label = node ? `Node(${node.val})` : 'null';
      trace.addHeader(`lowestCommonAncestor(${role}: ${label})`, depth, `<- 深入 ${role}`);
      steps.push({
        tree: root,
        current: node ? node.val : null,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: foundLCA,
        stageId: 'stage-1',
        decision: `递归进入：lowestCommonAncestor(${role}: ${label})`,
        action: 'enter',
        message: `深入调用 lowestCommonAncestor 探索 ${role} (${label})。`,
        log: `enter lowestCommonAncestor(${role}: ${label})`,
        codeLine: L.entry,
        metrics: {
          '当前节点': label,
          'left 返回值': '待计算',
          'right 返回值': '待计算',
          '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
        },
        callTrace: trace.snapshot(),
      });
    }

    // 判空基底检查 (Line 3: if (root == null || root == p || root == q) return root;)
    if (!node) {
      trace.addConditionHit('① root == null -> true (基底条件命中)', depth);
      trace.addReturnLeaf('return null', depth);
      steps.push({
        tree: root,
        current: null,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: foundLCA,
        stageId: 'stage-1',
        decision: '基底判空：当前节点为 null，向父调用返回 null',
        action: 'enter',
        message: '空子树，命中基底条件 root == null，返回 null。',
        log: 'node is null -> return null',
        codeLine: L.baseCheckHit,
        metrics: {
          '当前节点': 'null',
          'left 返回值': 'null',
          'right 返回值': 'null',
          '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
        },
        callTrace: trace.snapshot(),
      });
      return null;
    }

    // 目标命中基底检查 (Line 3: root == p || root == q)
    if (node.val === pVal || node.val === qVal) {
      const targetName = node.val === pVal ? `p=${pVal}` : `q=${qVal}`;
      trace.addConditionHit(`① root == ${targetName} 命中目标节点! 触发基底返回`, depth);
      trace.addReturnLeaf(`return Node(${node.val})`, depth);
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: foundLCA,
        stageId: 'stage-1',
        decision: `🎯 命中目标节点 ${node.val} (${targetName})，触发基底返回`,
        action: 'hit-target',
        message: `🎯 节点 ${node.val} 匹配目标 (${targetName})，无需继续下探，直接向上返回 ${node.val}。`,
        log: `hit target: ${node.val} -> return ${node.val}`,
        codeLine: L.baseCheckHit,
        metrics: {
          '当前节点': node.val,
          'left 返回值': '无需下探',
          'right 返回值': '无需下探',
          '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
        },
        callTrace: trace.snapshot(),
      });
      return node.val;
    }

    // 基底条件均不满足判定帧 (Line 3 pass: 继续探索左右子树)
    trace.addConditionPass(`① Node(${node.val}) != null 且不等于 p(${pVal}) 或 q(${qVal})，继续向下探索左右子树`, depth);
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: foundLCA,
      stageId: 'stage-1',
      decision: `考察节点 ${node.val}：非空且非目标，准备向下探索`,
      action: 'enter',
      message: `节点 ${node.val} 存在且非目标节点，继续向左、右子树深入探索。`,
      log: `node ${node.val} != null and != p/q -> proceed to explore`,
      codeLine: L.baseCheckPass,
      metrics: {
        '当前节点': node.val,
        'left 返回值': '待探索',
        'right 返回值': '待探索',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
      callTrace: trace.snapshot(),
    });

    // 深入左子树 (Line 4: TreeNode left = lowestCommonAncestor(root.left, p, q);)
    trace.addRecursePrep(`② 深入左子树 lowestCommonAncestor(${node.left ? 'Node(' + node.left.val + ')' : 'null'})`, depth);
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: foundLCA,
      stageId: 'stage-1',
      decision: `深入节点 ${node.val} 的左子树`,
      action: 'explore',
      message: `向下探索节点 ${node.val} 的左子树...`,
      log: `explore left of ${node.val}`,
      codeLine: L.leftCall,
      metrics: {
        '当前节点': node.val,
        'left 返回值': '正在探索',
        'right 返回值': '待计算',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
      callTrace: trace.snapshot(),
    });

    const leftRet = postOrder(node.left, depth + 1, '左子树');

    // 左子树返回帧 (Line 4: 接收 left 返回值)
    trace.addUnwindCalc(`leftRet = ${leftRet !== null ? leftRet : 'null'}`, depth);
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: leftRet,
      rightReturn: null,
      lcaResult: foundLCA,
      stageId: 'stage-1',
      decision: `左子树返回: ${leftRet !== null ? leftRet : 'null'}`,
      action: 'left-done',
      message: `节点 ${node.val} 的左子树探测完毕，返回值为 ${leftRet !== null ? leftRet : 'null'}。`,
      log: `leftRet = ${leftRet}`,
      codeLine: L.leftCall,
      metrics: {
        '当前节点': node.val,
        'left 返回值': leftRet !== null ? leftRet : 'null',
        'right 返回值': '待探索',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
      callTrace: trace.snapshot(),
    });

    // 深入右子树 (Line 5: TreeNode right = lowestCommonAncestor(root.right, p, q);)
    trace.addRecursePrep(`③ 深入右子树 lowestCommonAncestor(${node.right ? 'Node(' + node.right.val + ')' : 'null'})`, depth);
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: leftRet,
      rightReturn: null,
      lcaResult: foundLCA,
      stageId: 'stage-1',
      decision: `深入节点 ${node.val} 的右子树`,
      action: 'explore',
      message: `向下探索节点 ${node.val} 的右子树...`,
      log: `explore right of ${node.val}`,
      codeLine: L.rightCall,
      metrics: {
        '当前节点': node.val,
        'left 返回值': leftRet !== null ? leftRet : 'null',
        'right 返回值': '正在探索',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
      callTrace: trace.snapshot(),
    });

    const rightRet = postOrder(node.right, depth + 1, '右子树');

    // 右子树返回帧 (Line 5: 接收 right 返回值)
    trace.addUnwindCalc(`rightRet = ${rightRet !== null ? rightRet : 'null'}`, depth);
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: leftRet,
      rightReturn: rightRet,
      lcaResult: foundLCA,
      stageId: 'stage-1',
      decision: `右子树返回: ${rightRet !== null ? rightRet : 'null'}`,
      action: 'right-done',
      message: `节点 ${node.val} 的右子树探测完毕，返回值为 ${rightRet !== null ? rightRet : 'null'}。`,
      log: `rightRet = ${rightRet}`,
      codeLine: L.rightCall,
      metrics: {
        '当前节点': node.val,
        'left 返回值': leftRet !== null ? leftRet : 'null',
        'right 返回值': rightRet !== null ? rightRet : 'null',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
      callTrace: trace.snapshot(),
    });

    // 汇总左右子树结果 (Line 6: if (left != null && right != null) return root;)
    if (leftRet !== null && rightRet !== null) {
      foundLCA = node.val;
      trace.addConditionHit(`④ left(${leftRet}) != null && right(${rightRet}) != null 两侧命中! 锁定 LCA: Node(${node.val})`, depth);
      trace.addFinalResult(`最终返回 LCA: Node(${node.val})`, depth, undefined, `Node(${node.val})`);
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: leftRet,
        rightReturn: rightRet,
        lcaResult: foundLCA,
        stageId: 'stage-1',
        decision: `🎉 左右分叉交汇！节点 ${node.val} 即为最近公共祖先 (LCA)`,
        action: 'merge',
        message: `左右子树均返回非空（left=${leftRet}, right=${rightRet}），说明目标节点分属两侧，节点 ${node.val} 就是 LCA！`,
        log: `⭐ LCA FOUND: ${node.val}`,
        codeLine: L.splitLCAHit,
        metrics: {
          '当前节点': node.val,
          'left 返回值': leftRet,
          'right 返回值': rightRet,
          '当前捕获 LCA': foundLCA,
        },
        callTrace: trace.snapshot(),
      });
      return node.val;
    }

    // 单侧非空向上传递 (Line 7: return left != null ? left : right;)
    const ret = leftRet !== null ? leftRet : rightRet;
    trace.addFinalResult(`④ 单侧传递: return ${ret !== null ? 'Node(' + ret + ')' : 'null'}`, depth, undefined, ret !== null ? `Node(${ret})` : 'null');
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: leftRet,
      rightReturn: rightRet,
      lcaResult: foundLCA,
      stageId: 'stage-1',
      decision: ret !== null
        ? `单侧命中：向父节点传递找到的节点 ${ret}`
        : `两侧均为空：节点 ${node.val} 子树中未找到目标，返回 null`,
      action: 'merge',
      message: ret !== null
        ? `节点 ${node.val} 的子树中只发现单侧目标（${leftRet !== null ? `左侧 ${leftRet}` : `右侧 ${rightRet}`}），向上层传递。`
        : `节点 ${node.val} 的子树未发现目标节点，返回 null。`,
      log: `pass up: ${ret}`,
      codeLine: L.singlePass,
      metrics: {
        '当前节点': node.val,
        'left 返回值': leftRet !== null ? leftRet : 'null',
        'right 返回值': rightRet !== null ? rightRet : 'null',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
      callTrace: trace.snapshot(),
    });

    return ret;
  }

  const finalLCA = postOrder(root, 0, '根节点');

  // 收尾完成帧
  steps.push({
    tree: root,
    current: finalLCA,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: finalLCA,
    stageId: 'stage-1',
    decision: finalLCA !== null
      ? `✅ 查找完成！节点 p = ${pVal} 与 q = ${qVal} 的最近公共祖先为 【${finalLCA}】。`
      : '查找完成，未在树中找到公共祖先。',
    action: 'done',
    message: finalLCA !== null
      ? `✅ 查找完成！节点 p = ${pVal} 与 q = ${qVal} 的最近公共祖先为 【${finalLCA}】。`
      : '查找完成，未在树中找到公共祖先。',
    log: `done lca=${finalLCA}`,
    codeLine: L.done,
    metrics: {
      '当前节点': finalLCA !== null ? finalLCA : '—',
      'left 返回值': '—',
      'right 返回值': '—',
      '当前捕获 LCA': finalLCA !== null ? finalLCA : 'null',
      '最终结果': finalLCA !== null ? `TreeNode(${finalLCA})` : 'null',
    },
    callTrace: trace.snapshot(),
  });

  return steps;
}

// ============================================================
// Stage 2: 父节点哈希表遍历 (Parent Pointer Hash Map)
// ============================================================
export function buildLcaStage2ParentMapSteps(root: TreeNode | null, pVal: number, qVal: number): LCAStep[] {
  const steps: LCAStep[] = [];

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: null,
      stageId: 'stage-2',
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，无公共祖先，返回 null。',
      log: 'root is null -> return null',
      codeLine: LCA_STAGE2_LINES.entry,
      parentMap: {},
      visitedAncestors: [],
      queueState: [],
      metrics: { '当前节点': '—', '已记录节点数': 0, '已回溯祖先数': 0, '当前捕获 LCA': 'null' },
    });
    return steps;
  }

  // 1. 初始化 parentMap 与 BFS 队列
  const parentMap: Record<number, number | null> = { [root.val]: null };
  const queue: TreeNode[] = [root];

  steps.push({
    tree: root,
    current: root.val,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: null,
    stageId: 'stage-2',
    decision: '初始化父指针哈希表 parentMap 与 BFS 队列',
    action: 'enter',
    message: `开始广度优先遍历以建立各节点的父节点指针映射，根节点 ${root.val} 的父指针设为 null。`,
    log: `init parentMap: { ${root.val} -> null }`,
    codeLine: LCA_STAGE2_LINES.init,
    parentMap: { ...parentMap },
    visitedAncestors: [],
    queueState: [root.val],
    metrics: { '当前节点': root.val, '已记录节点数': 1, '已回溯祖先数': 0, '当前捕获 LCA': '未捕获' },
  });

  // 2. BFS 遍历，直到 p 和 q 都在 parentMap 中或整树探索完毕
  while (queue.length > 0 && (!(pVal in parentMap) || !(qVal in parentMap))) {
    const cur = queue.shift()!;

    steps.push({
      tree: root,
      current: cur.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: null,
      stageId: 'stage-2',
      decision: `出队节点 ${cur.val} 并探索子节点`,
      action: 'explore',
      message: `出队节点 ${cur.val}，探索其左右孩子节点以记录父指针。当前目标 p(${pVal}) in map: ${pVal in parentMap}, q(${qVal}) in map: ${qVal in parentMap}。`,
      log: `bfs pop: ${cur.val}`,
      codeLine: LCA_STAGE2_LINES.whileBfs,
      parentMap: { ...parentMap },
      visitedAncestors: [],
      queueState: queue.map((n) => n.val),
      metrics: { '当前节点': cur.val, '已记录节点数': Object.keys(parentMap).length, '已回溯祖先数': 0, '当前捕获 LCA': '未捕获' },
    });

    if (cur.left) {
      parentMap[cur.left.val] = cur.val;
      queue.push(cur.left);
      steps.push({
        tree: root,
        current: cur.left.val,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: null,
        stageId: 'stage-2',
        decision: `记录左孩子 ${cur.left.val} 的父指针为 ${cur.val}`,
        action: 'explore',
        message: `建立父节点映射 parentMap[${cur.left.val}] = ${cur.val}，并将节点 ${cur.left.val} 入队。`,
        log: `parent[${cur.left.val}] = ${cur.val}`,
        codeLine: LCA_STAGE2_LINES.expandLeft,
        parentMap: { ...parentMap },
        visitedAncestors: [],
        queueState: queue.map((n) => n.val),
        metrics: { '当前节点': cur.left.val, '已记录节点数': Object.keys(parentMap).length, '已回溯祖先数': 0, '当前捕获 LCA': '未捕获' },
      });
    }

    if (cur.right) {
      parentMap[cur.right.val] = cur.val;
      queue.push(cur.right);
      steps.push({
        tree: root,
        current: cur.right.val,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: null,
        stageId: 'stage-2',
        decision: `记录右孩子 ${cur.right.val} 的父指针为 ${cur.val}`,
        action: 'explore',
        message: `建立父节点映射 parentMap[${cur.right.val}] = ${cur.val}，并将节点 ${cur.right.val} 入队。`,
        log: `parent[${cur.right.val}] = ${cur.val}`,
        codeLine: LCA_STAGE2_LINES.expandRight,
        parentMap: { ...parentMap },
        visitedAncestors: [],
        queueState: queue.map((n) => n.val),
        metrics: { '当前节点': cur.right.val, '已记录节点数': Object.keys(parentMap).length, '已回溯祖先数': 0, '当前捕获 LCA': '未捕获' },
      });
    }
  }

  // 3. 从 p 向上回溯收集全部祖先到 visited 集合中
  const visitedAncestors: number[] = [];
  let currP: number | null = pVal in parentMap ? pVal : null;

  while (currP !== null && currP !== undefined) {
    visitedAncestors.push(currP);
    steps.push({
      tree: root,
      current: currP,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: null,
      stageId: 'stage-2',
      decision: `回溯 p 的祖先链: 节点 ${currP}`,
      action: 'trace-p',
      message: `将节点 ${currP} 加入 p (${pVal}) 的已访问祖先集合 visited: [${visitedAncestors.join(', ')}]。`,
      log: `visited.add(${currP})`,
      codeLine: LCA_STAGE2_LINES.traceP,
      parentMap: { ...parentMap },
      visitedAncestors: [...visitedAncestors],
      queueState: [],
      metrics: { '当前节点': currP, '已记录节点数': Object.keys(parentMap).length, '已回溯祖先数': visitedAncestors.length, '当前捕获 LCA': '未捕获' },
    });
    currP = parentMap[currP] ?? null;
  }

  // 4. 从 q 向上回溯，首个出现在 visited 中的节点即为 LCA
  let currQ: number | null = qVal in parentMap ? qVal : null;
  let foundLCA: number | null = null;

  while (currQ !== null && currQ !== undefined) {
    if (visitedAncestors.includes(currQ)) {
      foundLCA = currQ;
      steps.push({
        tree: root,
        current: currQ,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: foundLCA,
        stageId: 'stage-2',
        decision: `🎯 命中祖先集合交集！节点 ${currQ} 即为 LCA`,
        action: 'hit-target',
        message: `回溯 q (${qVal}) 遍历到节点 ${currQ}，该节点已存在于 visited 祖先集合中！成功锁定 LCA = 【${foundLCA}】！`,
        log: `⭐ LCA FOUND in parentMap: ${foundLCA}`,
        codeLine: LCA_STAGE2_LINES.traceQ,
        parentMap: { ...parentMap },
        visitedAncestors: [...visitedAncestors],
        queueState: [],
        metrics: { '当前节点': currQ, '已记录节点数': Object.keys(parentMap).length, '已回溯祖先数': visitedAncestors.length, '当前捕获 LCA': foundLCA },
      });
      break;
    } else {
      steps.push({
        tree: root,
        current: currQ,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: null,
        stageId: 'stage-2',
        decision: `回溯 q 的祖先: 节点 ${currQ} 未命中集合`,
        action: 'trace-q',
        message: `节点 ${currQ} 不在 p 的祖先集合中，沿父指针 parentMap[${currQ}] = ${parentMap[currQ]} 继续向上回溯。`,
        log: `q jump: ${currQ} -> ${parentMap[currQ]}`,
        codeLine: LCA_STAGE2_LINES.traceQ,
        parentMap: { ...parentMap },
        visitedAncestors: [...visitedAncestors],
        queueState: [],
        metrics: { '当前节点': currQ, '已记录节点数': Object.keys(parentMap).length, '已回溯祖先数': visitedAncestors.length, '当前捕获 LCA': '未捕获' },
      });
      currQ = parentMap[currQ] ?? null;
    }
  }

  // 5. 收尾步
  steps.push({
    tree: root,
    current: foundLCA,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: foundLCA,
    stageId: 'stage-2',
    decision: '父节点哈希表回溯查找结束',
    action: 'done',
    message:
      foundLCA !== null
        ? `✅ 查找完成！利用父指针哈希表与回溯集合，确定最近公共祖先为 【${foundLCA}】。`
        : '查找完成，未能通过父指针哈希表确定最近公共祖先。',
    log: `done stage-2 lca=${foundLCA}`,
    codeLine: LCA_STAGE2_LINES.done,
    parentMap: { ...parentMap },
    visitedAncestors: [...visitedAncestors],
    queueState: [],
    metrics: {
      '当前节点': foundLCA != null ? foundLCA : '—',
      '已记录节点数': Object.keys(parentMap).length,
      '已回溯祖先数': visitedAncestors.length,
      '当前捕获 LCA': foundLCA != null ? foundLCA : 'null',
    },
  });

  return steps;
}

// ============================================================
// Stage 3: 根到节点显式路径比对 (Root-to-Node Path Trace & Intersection)
// ============================================================
export function buildLcaStage3PathSteps(root: TreeNode | null, pVal: number, qVal: number): LCAStep[] {
  const steps: LCAStep[] = [];

  if (!root) {
    steps.push({
      tree: null,
      current: null,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: null,
      stageId: 'stage-3',
      decision: '特判返回：树为空',
      action: 'done',
      message: '树为空，无公共祖先，返回 null。',
      log: 'root is null -> return null',
      codeLine: LCA_STAGE3_LINES.entry,
      pathP: [],
      pathQ: [],
      comparingIndex: -1,
      metrics: { '当前节点': '—', 'Path P 长度': 0, 'Path Q 长度': 0, '当前捕获 LCA': 'null' },
    });
    return steps;
  }

  // 1. 入口
  steps.push({
    tree: root,
    current: root.val,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: null,
    stageId: 'stage-3',
    decision: '算法启动：初始化路径比对法',
    action: 'enter',
    message: `开始分别寻找从根节点 ${root.val} 到 p = ${pVal} 与 q = ${qVal} 的显式路径并进行前缀交汇比对。`,
    log: `init path search p=${pVal}, q=${qVal}`,
    codeLine: LCA_STAGE3_LINES.entry,
    pathP: [],
    pathQ: [],
    comparingIndex: -1,
    metrics: { '当前节点': root.val, 'Path P 长度': 0, 'Path Q 长度': 0, '当前捕获 LCA': '未捕获' },
  });

  // 2. 查找 pathP
  const pathP: number[] = [];
  function findPathP(node: TreeNode | null): boolean {
    if (!node) return false;
    pathP.push(node.val);
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: null,
      stageId: 'stage-3',
      decision: `探测目标 p 路径：压入节点 ${node.val}`,
      action: 'enter',
      message: `向下探测目标 p (${pVal})，当前候选路径 P: [${pathP.join(' → ')}]。`,
      log: `pathP push: ${node.val}`,
      codeLine: LCA_STAGE3_LINES.pathPush,
      pathP: [...pathP],
      pathQ: [],
      comparingIndex: -1,
      metrics: { '当前节点': node.val, 'Path P 长度': pathP.length, 'Path Q 长度': 0, '当前捕获 LCA': '未捕获' },
    });

    if (node.val === pVal) {
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: null,
        stageId: 'stage-3',
        decision: `🎯 命中目标节点 p = ${pVal}！锁定完整路径 P`,
        action: 'hit-target',
        message: `成功抵达目标节点 p (${pVal})，锁定从根到 p 的完整路径: [${pathP.join(' → ')}]。`,
        log: `pathP locked: [${pathP.join(', ')}]`,
        codeLine: LCA_STAGE3_LINES.pathHit,
        pathP: [...pathP],
        pathQ: [],
        comparingIndex: -1,
        metrics: { '当前节点': node.val, 'Path P 长度': pathP.length, 'Path Q 长度': 0, '当前捕获 LCA': '未捕获' },
      });
      return true;
    }

    if (findPathP(node.left) || findPathP(node.right)) {
      return true;
    }

    pathP.pop();
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: null,
      stageId: 'stage-3',
      decision: `回溯撤销无效节点 ${node.val}`,
      action: 'done',
      message: `节点 ${node.val} 的左右子树均不包含目标 p (${pVal})，从路径 P 中回溯弹出。`,
      log: `pathP pop: ${node.val}`,
      codeLine: LCA_STAGE3_LINES.pathPop,
      pathP: [...pathP],
      pathQ: [],
      comparingIndex: -1,
      metrics: { '当前节点': node.val, 'Path P 长度': pathP.length, 'Path Q 长度': 0, '当前捕获 LCA': '未捕获' },
    });
    return false;
  }
  findPathP(root);

  // 3. 查找 pathQ
  const pathQ: number[] = [];
  function findPathQ(node: TreeNode | null): boolean {
    if (!node) return false;
    pathQ.push(node.val);
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: null,
      stageId: 'stage-3',
      decision: `探测目标 q 路径：压入节点 ${node.val}`,
      action: 'enter',
      message: `向下探测目标 q (${qVal})，当前候选路径 Q: [${pathQ.join(' → ')}]。`,
      log: `pathQ push: ${node.val}`,
      codeLine: LCA_STAGE3_LINES.pathPush,
      pathP: [...pathP],
      pathQ: [...pathQ],
      comparingIndex: -1,
      metrics: { '当前节点': node.val, 'Path P 长度': pathP.length, 'Path Q 长度': pathQ.length, '当前捕获 LCA': '未捕获' },
    });

    if (node.val === qVal) {
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: null,
        stageId: 'stage-3',
        decision: `🎯 命中目标节点 q = ${qVal}！锁定完整路径 Q`,
        action: 'hit-target',
        message: `成功抵达目标节点 q (${qVal})，锁定从根到 q 的完整路径: [${pathQ.join(' → ')}]。`,
        log: `pathQ locked: [${pathQ.join(', ')}]`,
        codeLine: LCA_STAGE3_LINES.pathHit,
        pathP: [...pathP],
        pathQ: [...pathQ],
        comparingIndex: -1,
        metrics: { '当前节点': node.val, 'Path P 长度': pathP.length, 'Path Q 长度': pathQ.length, '当前捕获 LCA': '未捕获' },
      });
      return true;
    }

    if (findPathQ(node.left) || findPathQ(node.right)) {
      return true;
    }

    pathQ.pop();
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: null,
      stageId: 'stage-3',
      decision: `回溯撤销无效节点 ${node.val}`,
      action: 'done',
      message: `节点 ${node.val} 的左右子树均不包含目标 q (${qVal})，从路径 Q 中回溯弹出。`,
      log: `pathQ pop: ${node.val}`,
      codeLine: LCA_STAGE3_LINES.pathPop,
      pathP: [...pathP],
      pathQ: [...pathQ],
      comparingIndex: -1,
      metrics: { '当前节点': node.val, 'Path P 长度': pathP.length, 'Path Q 长度': pathQ.length, '当前捕获 LCA': '未捕获' },
    });
    return false;
  }
  findPathQ(root);

  // 4. 双路径从根同步比对
  let lcaResult: number | null = null;
  let diverged = false;
  const minLen = Math.min(pathP.length, pathQ.length);

  for (let i = 0; i < minLen; i++) {
    if (pathP[i] === pathQ[i]) {
      lcaResult = pathP[i];
      steps.push({
        tree: root,
        current: lcaResult,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult,
        stageId: 'stage-3',
        decision: `双路径比对索引 [${i}]: 节点重合`,
        action: 'compare',
        message: `路径位置 [${i}] 节点相同: PathP[${i}] = PathQ[${i}] = ${lcaResult}，更新当前最近公共祖先候选。`,
        log: `compare idx=${i}: match ${lcaResult}`,
        codeLine: LCA_STAGE3_LINES.match,
        pathP: [...pathP],
        pathQ: [...pathQ],
        comparingIndex: i,
        metrics: { '当前节点': lcaResult, 'Path P 长度': pathP.length, 'Path Q 长度': pathQ.length, '当前捕获 LCA': lcaResult },
      });
    } else {
      diverged = true;
      steps.push({
        tree: root,
        current: lcaResult,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult,
        stageId: 'stage-3',
        decision: `⚠️ 路径在索引 [${i}] 发生分叉！`,
        action: 'compare',
        message: `路径在位置 [${i}] 出现差异: PathP[${i}] (${pathP[i]}) ≠ PathQ[${i}] (${pathQ[i]})！分叉前的最后一个共同节点 【${lcaResult}】 即为 LCA！`,
        log: `diverge at idx=${i}: p=${pathP[i]}, q=${pathQ[i]} -> LCA is ${lcaResult}`,
        codeLine: LCA_STAGE3_LINES.diverge,
        pathP: [...pathP],
        pathQ: [...pathQ],
        comparingIndex: i,
        metrics: {
          '当前节点': lcaResult != null ? lcaResult : '—',
          'Path P 长度': pathP.length,
          'Path Q 长度': pathQ.length,
          '当前捕获 LCA': lcaResult != null ? lcaResult : '未找到',
        },
      });
      break;
    }
  }

  if (!diverged && minLen > 0) {
    steps.push({
      tree: root,
      current: lcaResult,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult,
      stageId: 'stage-3',
      decision: '同侧包含收敛：短路径端点即为 LCA',
      action: 'compare',
      message: `比对直至短路径末尾未见分叉，说明目标之一本身就是另一目标的祖先，节点 【${lcaResult}】 为 LCA。`,
      log: `prefix subset match: LCA is ${lcaResult}`,
      codeLine: LCA_STAGE3_LINES.match,
      pathP: [...pathP],
      pathQ: [...pathQ],
      comparingIndex: minLen - 1,
      metrics: {
        '当前节点': lcaResult != null ? lcaResult : '—',
        'Path P 长度': pathP.length,
        'Path Q 长度': pathQ.length,
        '当前捕获 LCA': lcaResult != null ? lcaResult : '未找到',
      },
    });
  }

  // 5. 收尾步
  steps.push({
    tree: root,
    current: lcaResult,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult,
    stageId: 'stage-3',
    decision: '根到节点显式双路径交汇比对结束',
    action: 'done',
    message:
      lcaResult !== null
        ? `✅ 查找完成！目标节点 p = ${pVal} 与 q = ${qVal} 的最近公共祖先为 【${lcaResult}】。`
        : '查找完成，未能通过双路径比对确定最近公共祖先。',
    log: `done stage-3 lca=${lcaResult}`,
    codeLine: LCA_STAGE3_LINES.done,
    pathP: [...pathP],
    pathQ: [...pathQ],
    comparingIndex: -1,
    metrics: {
      '当前节点': lcaResult != null ? lcaResult : '—',
      'Path P 长度': pathP.length,
      'Path Q 长度': pathQ.length,
      '当前捕获 LCA': lcaResult != null ? lcaResult : 'null',
    },
  });

  return steps;
}

export class LcaStepCompiler {
  public static compileStage1Steps = buildLCASteps;
  public static compilePostorderSteps = buildLCASteps;
  public static compileStage2Steps = buildLcaStage2ParentMapSteps;
  public static compileParentMapSteps = buildLcaStage2ParentMapSteps;
  public static compileStage3Steps = buildLcaStage3PathSteps;
  public static compilePathTraceSteps = buildLcaStage3PathSteps;
}
