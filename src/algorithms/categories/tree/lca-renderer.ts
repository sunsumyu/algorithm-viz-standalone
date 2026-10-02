/**
 * 二叉树最近公共祖先 (LCA) 可视化器 (Lowest Common Ancestor · LeetCode 236 / Class 037 Code04)
 * 采用顶层声明式架构与双版本综合长处整合 (Bi-Version Synthesis)
 *
 * 核心多阶段演化架构 (Multi-Stage Evolution):
 * - Stage 1: 递归后序汇聚 (Recursive Postorder DFS · 左右子树汇聚返回)
 * - Stage 2: 父节点哈希表遍历 (Parent Pointer Hash Map · 回溯路径集合重合)
 * - Stage 3: 根到节点显式路径比对 (Root-to-Node Path Trace & Intersection · 分叉前夕判定)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeCanvasAdapter } from '../../../core/renderers/adapters/tree-canvas-adapter';
import { HighlightTarget } from '../../../core/step-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  LCA_PROBLEM_HTML,
  LCA_ANALYSIS_HTML,
  LCA_CODE_LANGUAGES,
} from './lca-problem-content';
import {
  LCA_STAGE1_CODE,
  LCA_STAGE1_LINES,
  LCA_STAGE2_PARENT_MAP_CODE,
  LCA_STAGE2_LINES,
  LCA_STAGE3_PATH_TRACE_CODE,
  LCA_STAGE3_LINES,
} from './lca-stage-codes';

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
    decision: '算法启动：初始化 LCA 递归查找',
    action: 'enter',
    message: root
      ? `寻找节点 p = ${pVal} 与 q = ${qVal} 的最近公共祖先，从根节点 ${root.val} 开始后序递归。`
      : '空树，直接返回 null。',
    log: root ? `lowestCommonAncestor(root: ${root.val}, p: ${pVal}, q: ${qVal})` : 'root is null -> null',
    codeLine: LCA_STAGE1_LINES.entry,
    metrics: { '当前节点': '—', 'left 返回值': 'null', 'right 返回值': 'null', '当前捕获 LCA': '未捕获' },
  });

  if (!root) {
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
      codeLine: LCA_STAGE1_LINES.baseCheck,
      metrics: { '当前节点': '—', 'left 返回值': 'null', 'right 返回值': 'null', '当前捕获 LCA': 'null', '最终结果': 'null' },
    });
    return steps;
  }

  function postOrder(node: TreeNode | null): number | null {
    if (!node) return null;

    // Step: 访问当前节点
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: null,
      rightReturn: null,
      lcaResult: foundLCA,
      stageId: 'stage-1',
      decision: `考察节点 ${node.val}`,
      action: 'enter',
      message: `递归到达节点 ${node.val}，检查是否为 null 或命中目标节点 p (${pVal}) / q (${qVal})。`,
      log: `visit node: ${node.val}`,
      codeLine: LCA_STAGE1_LINES.baseCheck,
      metrics: {
        '当前节点': node.val,
        'left 返回值': '待计算',
        'right 返回值': '待计算',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
    });

    // 命中目标节点 (base case)
    if (node.val === pVal || node.val === qVal) {
      steps.push({
        tree: root,
        current: node.val,
        p: pVal,
        q: qVal,
        leftReturn: null,
        rightReturn: null,
        lcaResult: foundLCA,
        stageId: 'stage-1',
        decision: `命中目标节点 ${node.val}`,
        action: 'hit-target',
        message: `🎯 节点 ${node.val} 匹配目标 (${node.val === pVal ? `p=${pVal}` : `q=${qVal}`})，直接向上返回 ${node.val}。`,
        log: `hit target: ${node.val} -> return ${node.val}`,
        codeLine: LCA_STAGE1_LINES.baseCheck,
        metrics: {
          '当前节点': node.val,
          'left 返回值': '无需下探',
          'right 返回值': '无需下探',
          '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
        },
      });
      return node.val;
    }

    // 深入左子树
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
      action: 'enter',
      message: `向下探索节点 ${node.val} 的左子树...`,
      log: `explore left of ${node.val}`,
      codeLine: LCA_STAGE1_LINES.leftCall,
      metrics: {
        '当前节点': node.val,
        'left 返回值': '正在探索',
        'right 返回值': '待计算',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
    });

    const leftRet = postOrder(node.left);

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
      codeLine: LCA_STAGE1_LINES.leftCall,
      metrics: {
        '当前节点': node.val,
        'left 返回值': leftRet !== null ? leftRet : 'null',
        'right 返回值': '待探索',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
    });

    // 深入右子树
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
      action: 'enter',
      message: `向下探索节点 ${node.val} 的右子树...`,
      log: `explore right of ${node.val}`,
      codeLine: LCA_STAGE1_LINES.rightCall,
      metrics: {
        '当前节点': node.val,
        'left 返回值': leftRet !== null ? leftRet : 'null',
        'right 返回值': '正在探索',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
    });

    const rightRet = postOrder(node.right);

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
      codeLine: LCA_STAGE1_LINES.rightCall,
      metrics: {
        '当前节点': node.val,
        'left 返回值': leftRet !== null ? leftRet : 'null',
        'right 返回值': rightRet !== null ? rightRet : 'null',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
    });

    // 汇总左右子树结果
    if (leftRet !== null && rightRet !== null) {
      foundLCA = node.val;
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
        codeLine: LCA_STAGE1_LINES.splitLCA,
        metrics: {
          '当前节点': node.val,
          'left 返回值': leftRet,
          'right 返回值': rightRet,
          '当前捕获 LCA': foundLCA,
        },
      });
      return node.val;
    }

    const ret = leftRet !== null ? leftRet : rightRet;
    steps.push({
      tree: root,
      current: node.val,
      p: pVal,
      q: qVal,
      leftReturn: leftRet,
      rightReturn: rightRet,
      lcaResult: foundLCA,
      stageId: 'stage-1',
      decision: `单侧向上传递: ${ret !== null ? ret : 'null'}`,
      action: 'merge',
      message: `节点 ${node.val} 左右汇聚：非双向交汇，将非空分支 ${ret !== null ? ret : 'null'} 向上传递。`,
      log: `pass up: ${ret}`,
      codeLine: LCA_STAGE1_LINES.singlePass,
      metrics: {
        '当前节点': node.val,
        'left 返回值': leftRet !== null ? leftRet : 'null',
        'right 返回值': rightRet !== null ? rightRet : 'null',
        '当前捕获 LCA': foundLCA != null ? foundLCA : '未捕获',
      },
    });

    return ret;
  }

  const finalLCA = postOrder(root);

  steps.push({
    tree: root,
    current: finalLCA,
    p: pVal,
    q: qVal,
    leftReturn: null,
    rightReturn: null,
    lcaResult: finalLCA,
    stageId: 'stage-1',
    decision: 'LCA 查找全部结束',
    action: 'done',
    message:
      finalLCA !== null
        ? `✅ 查找完成！节点 p = ${pVal} 与 q = ${qVal} 的最近公共祖先为 【${finalLCA}】。`
        : '查找完成，未在树中找到公共祖先。',
    log: `done lca=${finalLCA}`,
    metrics: {
      '当前节点': finalLCA !== null ? finalLCA : '—',
      'left 返回值': '—',
      'right 返回值': '—',
      '当前捕获 LCA': finalLCA !== null ? finalLCA : 'null',
      '最终结果': finalLCA !== null ? `TreeNode(${finalLCA})` : 'null',
    },
    codeLine: LCA_STAGE1_LINES.done,
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

// ============================================================
// 画布与 Card 2 领域渲染器
// ============================================================
export function renderLcaCanvas(
  container: HTMLElement,
  step: LCAStep,
  stageId: 'stage-1' | 'stage-2' | 'stage-3' = 'stage-1'
) {
  // 收集需要高亮的节点
  const targets = [step.p, step.q];
  let secondaryNodes = [...targets];

  if (stageId === 'stage-2' && step.visitedAncestors) {
    secondaryNodes = Array.from(new Set([...targets, ...step.visitedAncestors]));
  } else if (stageId === 'stage-3') {
    const pNodes = step.pathP || [];
    const qNodes = step.pathQ || [];
    secondaryNodes = Array.from(new Set([...targets, ...pNodes, ...qNodes]));
  }

  TreeCanvasAdapter.renderTree(container, {
    tree: step.tree,
    current: step.lcaResult !== null ? step.lcaResult : step.current,
    secondaryHighlightedNodes: secondaryNodes,
    primaryColor: step.lcaResult !== null ? '#16a34a' : '#3b82f6',
    secondaryColor: '#fbbf24',
  });

  const root = container.closest('#algo-lca-view') || container.parentElement;
  if (root) {
    const curEl = root.querySelector('#metric-cur-node');
    const lEl = root.querySelector('#metric-left-ret');
    const rEl = root.querySelector('#metric-right-ret');
    const lcaEl = root.querySelector('#metric-lca-val') as HTMLElement | null;

    if (curEl) curEl.textContent = step.current != null ? `${step.current}` : '—';

    if (stageId === 'stage-1') {
      if (lEl) lEl.textContent = step.leftReturn != null ? `${step.leftReturn}` : 'null';
      if (rEl) rEl.textContent = step.rightReturn != null ? `${step.rightReturn}` : 'null';
    } else if (stageId === 'stage-2') {
      if (lEl) lEl.textContent = step.visitedAncestors ? `${step.visitedAncestors.length} 个` : '0 个';
      if (rEl) rEl.textContent = step.parentMap ? `${Object.keys(step.parentMap).length} 个` : '0 个';
    } else if (stageId === 'stage-3') {
      if (lEl) lEl.textContent = step.pathP ? `${step.pathP.length} 步` : '0 步';
      if (rEl) rEl.textContent = step.pathQ ? `${step.pathQ.length} 步` : '0 步';
    }

    if (lcaEl) {
      lcaEl.textContent = step.lcaResult != null ? `${step.lcaResult}` : '未捕获';
      lcaEl.style.color = step.lcaResult != null ? '#16a34a' : '#64748b';
    }

    // 在 Card 2 中展示当前阶段的状态机与推演细节
    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      let stageSpecificHtml = '';

      if (stageId === 'stage-1') {
        stageSpecificHtml = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span style="font-size: 10.5px; color: #64748b;">左子树 leftRet:</span>
              <div style="font-weight: 700; font-size: 12px; color: ${step.leftReturn != null ? '#2563eb' : '#94a3b8'};">
                ${step.leftReturn != null ? step.leftReturn : 'null'}
              </div>
            </div>
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <span style="font-size: 10.5px; color: #64748b;">右子树 rightRet:</span>
              <div style="font-weight: 700; font-size: 12px; color: ${step.rightReturn != null ? '#0d9488' : '#94a3b8'};">
                ${step.rightReturn != null ? step.rightReturn : 'null'}
              </div>
            </div>
          </div>
        `;
      } else if (stageId === 'stage-2') {
        const visitedBadges = (step.visitedAncestors || []).map(
          (val) => `<span style="padding: 2px 7px; background: #dcfce7; border: 1px solid #86efac; border-radius: 4px; font-weight: 700; color: #166534;">${val}</span>`
        ).join(' → ') || '<span style="color: #94a3b8; font-style: italic;">暂无</span>';

        const parentPairs = Object.entries(step.parentMap || {}).map(
          ([child, parent]) => `<span style="padding: 2px 5px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-family: monospace; font-size: 10.5px;">${child}→${parent ?? 'null'}</span>`
        ).join(' ');

        stageSpecificHtml = `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <div style="font-size: 10.5px; color: #64748b; margin-bottom: 3px;">🌿 p 的祖先回溯集合 visited:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center; font-size: 11px;">
                ${visitedBadges}
              </div>
            </div>
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <div style="font-size: 10.5px; color: #64748b; margin-bottom: 3px;">🗺️ 父指针哈希表 parentMap:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; max-height: 55px; overflow-y: auto;">
                ${parentPairs || '<span style="color: #94a3b8;">暂无映射</span>'}
              </div>
            </div>
          </div>
        `;
      } else if (stageId === 'stage-3') {
        const pathPBadges = (step.pathP || []).map((val, idx) => {
          const isLCA = step.lcaResult === val;
          const isCmp = step.comparingIndex === idx;
          const bg = isLCA ? '#dcfce7' : isCmp ? '#fef3c7' : '#f1f5f9';
          const border = isLCA ? '#16a34a' : isCmp ? '#f59e0b' : '#cbd5e1';
          const textCol = isLCA ? '#166534' : isCmp ? '#b45309' : '#334155';
          return `<span style="padding: 2px 6px; background: ${bg}; border: 1px solid ${border}; border-radius: 4px; font-weight: 700; color: ${textCol}; font-family: monospace;">${val}</span>`;
        }).join(' → ') || '<span style="color: #94a3b8; font-style: italic;">探测中...</span>';

        const pathQBadges = (step.pathQ || []).map((val, idx) => {
          const isLCA = step.lcaResult === val;
          const isCmp = step.comparingIndex === idx;
          const bg = isLCA ? '#dcfce7' : isCmp ? '#fef3c7' : '#f1f5f9';
          const border = isLCA ? '#16a34a' : isCmp ? '#f59e0b' : '#cbd5e1';
          const textCol = isLCA ? '#166534' : isCmp ? '#b45309' : '#334155';
          return `<span style="padding: 2px 6px; background: ${bg}; border: 1px solid ${border}; border-radius: 4px; font-weight: 700; color: ${textCol}; font-family: monospace;">${val}</span>`;
        }).join(' → ') || '<span style="color: #94a3b8; font-style: italic;">探测中...</span>';

        stageSpecificHtml = `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <div style="font-size: 10.5px; color: #2563eb; font-weight: 700; margin-bottom: 3px;">🛤️ 路径 P (Root → ${step.p}):</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center; font-size: 11px;">
                ${pathPBadges}
              </div>
            </div>
            <div style="padding: 6px 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
              <div style="font-size: 10.5px; color: #0d9488; font-weight: 700; margin-bottom: 3px;">🛤️ 路径 Q (Root → ${step.q}):</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px; align-items: center; font-size: 11px;">
                ${pathQBadges}
              </div>
            </div>
          </div>
        `;
      }

      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; color: #475569; padding: 6px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
            <span style="font-weight: 700; color: #92400e;">🎯 检索目标节点对:</span>
            <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #b45309;">p = ${step.p}，q = ${step.q}</span>
          </div>

          ${stageSpecificHtml}

          <div style="padding: 8px 10px; background: #f1f5f9; border-radius: 6px; font-size: 11px; color: #475569;">
            <div style="font-weight: 700; color: #1e293b; margin-bottom: 2px;">🧭 决策推演: ${step.decision}</div>
            <div>${step.message}</div>
          </div>
        </div>
      `;
    }
  }
}

// ============================================================
// 声明式算法注册 (Multi-Stage Evolution)
// ============================================================
export const lcaVisualizer = registerDeclarativeAlgorithm<LCAStep>({
  id: 'lca',
  aliases: ['tree-037-lowest-common-ancestor'],
  name: '二叉树的最近公共祖先',
  category: 'tree',
  icon: '🤝',
  badge: {
    mode: '多阶段演化: 后序递归 · 父指针哈希 · 路径比对',
    complexity: 'O(N) · O(H)',
  },
  card1Title: '📊 二叉树拓扑与 LCA 汇聚沙盘',
  card2Title: '🧭 左右子树返回与祖先判定状态机',
  card2Desc: '后序遍历中 left 与 right 返回值归并逻辑实时监视',
  legend: [
    { label: '目标节点 p / q', color: '#fbbf24' },
    { label: '当前访问节点', color: '#3b82f6' },
    { label: '已捕获 LCA', color: '#16a34a' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4',
      width: '180px',
      placeholder: '3, 5, 1, 6...',
    },
    {
      id: 'input-p',
      label: '节点 p',
      type: 'number',
      defaultValue: 5,
      width: '50px',
    },
    {
      id: 'input-q',
      label: '节点 q',
      type: 'number',
      defaultValue: 1,
      width: '50px',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 根为 LCA (p=5, q=1)',
      values: {
        'input-tree': '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4',
        'input-p': 5,
        'input-q': 1,
      },
      description: 'p、q 分属根节点左右两侧，LCA = 3',
    },
    {
      label: 'LeetCode 示例 2: 同侧祖先 (p=5, q=4)',
      values: {
        'input-tree': '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4',
        'input-p': 5,
        'input-q': 4,
      },
      description: 'q 在 p 的子树内，LCA 为自身 (5)',
    },
    {
      label: '经典三节点树 (p=2, q=3)',
      values: {
        'input-tree': '1, 2, 3',
        'input-p': 2,
        'input-q': 3,
      },
      description: '简单满二叉树，根为 LCA (1)',
    },
    {
      label: '单链倾斜树 (p=3, q=4)',
      values: {
        'input-tree': '1, 2, null, 3, null, 4',
        'input-p': 3,
        'input-q': 4,
      },
      description: '左斜树垂直串联，LCA = 3',
    },
  ],
  metrics: [
    { id: 'cur-node', label: '当前节点', color: '#3b82f6' },
    { id: 'left-ret', label: '左返 / 祖先集 / P路径', color: '#2563eb' },
    { id: 'right-ret', label: '右返 / Q回溯 / Q路径', color: '#0d9488' },
    { id: 'lca-val', label: '最近公共祖先 (LCA)', color: '#16a34a' },
  ],
  codeLanguages: LCA_CODE_LANGUAGES,
  problemHtml: LCA_PROBLEM_HTML,
  analysisHtml: LCA_ANALYSIS_HTML,

  // 核心多阶段演化体系
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 递归后序汇聚 (Recursive Postorder DFS · 左右子树汇聚返回)',
      shortName: '递归后序汇聚',
      num: 1,
      badge: {
        mode: '自底向上后序汇聚',
        complexity: 'O(N) · O(H)',
      },
      card1Title: '📊 二叉树拓扑与 LCA 汇聚沙盘',
      card2Title: '🧭 左右子树返回与祖先判定状态机',
      card2Desc: '后序自底向上回溯中 left 与 right 返回值汇聚判定',
      codeLanguages: LCA_STAGE1_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4';
        const arr = parseTreeArray(raw, [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
        const root = buildTree(arr);
        const p = parseInt(String(inputs?.['input-p'] ?? inputs?.['p'] ?? '5'), 10);
        const q = parseInt(String(inputs?.['input-q'] ?? inputs?.['q'] ?? '1'), 10);
        return buildLCASteps(root, p, q);
      },
      renderCanvas: (container, step) => renderLcaCanvas(container, step, 'stage-1'),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 父节点哈希表遍历 (Parent Pointer Hash Map · 回溯路径集合重合)',
      shortName: '父节点哈希映射',
      num: 2,
      badge: {
        mode: '父指针哈希表 · 祖先集合',
        complexity: 'O(N) · O(N)',
      },
      card1Title: '🗺️ 树上父指针网络拓扑沙盘',
      card2Title: '🧭 父指针映射与已访问祖先集合',
      card2Desc: '自顶向下记录父节点，自底向上回溯寻找两集合首个交汇点',
      codeLanguages: LCA_STAGE2_PARENT_MAP_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4';
        const arr = parseTreeArray(raw, [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
        const root = buildTree(arr);
        const p = parseInt(String(inputs?.['input-p'] ?? inputs?.['p'] ?? '5'), 10);
        const q = parseInt(String(inputs?.['input-q'] ?? inputs?.['q'] ?? '1'), 10);
        return buildLcaStage2ParentMapSteps(root, p, q);
      },
      renderCanvas: (container, step) => renderLcaCanvas(container, step, 'stage-2'),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 根到节点显式路径比对 (Root-to-Node Path Trace & Intersection · 分叉前夕判定)',
      shortName: '显式双路径交汇',
      num: 3,
      badge: {
        mode: 'DFS双路径追踪 · 前缀交汇',
        complexity: 'O(N) · O(H)',
      },
      card1Title: '🛤️ 根至目标显式双路径拓扑沙盘',
      card2Title: '🧭 直达路径序列与分叉点比对监视器',
      card2Desc: '提取两目标节点的直达路径序列，双指针自根向下锁定分叉前夕节点',
      codeLanguages: LCA_STAGE3_PATH_TRACE_CODE,
      buildSteps: (inputs) => {
        const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4';
        const arr = parseTreeArray(raw, [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
        const root = buildTree(arr);
        const p = parseInt(String(inputs?.['input-p'] ?? inputs?.['p'] ?? '5'), 10);
        const q = parseInt(String(inputs?.['input-q'] ?? inputs?.['q'] ?? '1'), 10);
        return buildLcaStage3PathSteps(root, p, q);
      },
      renderCanvas: (container, step) => renderLcaCanvas(container, step, 'stage-3'),
    },
  ],

  // 遗留兜底
  generateSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4';
    const arr = parseTreeArray(raw, [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
    const root = buildTree(arr);
    const p = parseInt(String(inputs?.['input-p'] ?? inputs?.['p'] ?? '5'), 10);
    const q = parseInt(String(inputs?.['input-q'] ?? inputs?.['q'] ?? '1'), 10);
    return buildLCASteps(root, p, q);
  },
  buildSteps: (inputs) => {
    const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4';
    const arr = parseTreeArray(raw, [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4]);
    const root = buildTree(arr);
    const p = parseInt(String(inputs?.['input-p'] ?? inputs?.['p'] ?? '5'), 10);
    const q = parseInt(String(inputs?.['input-q'] ?? inputs?.['q'] ?? '1'), 10);
    return buildLCASteps(root, p, q);
  },
  renderCanvas: (container, step) => renderLcaCanvas(container, step, 'stage-1'),
});